<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    // Comisión de Wompi por transacción (2.99% + $900 COP)
    const WOMPI_RATE       = 0.0299;
    const WOMPI_FIXED_FEE  = 900;

    // ─── Generar datos para el widget de Wompi ────────────────────────────────

    public function generatePayment(int $orderId)
    {
        $order = Order::where('client_id', Auth::id())
            ->where('status', 'pending_payment')
            ->findOrFail($orderId);

        $reference  = 'ORD-' . str_pad($order->id, 8, '0', STR_PAD_LEFT);
        $amountCents = $order->total * 100; // Wompi trabaja en centavos

        // Generar firma de integridad
        $integrityString = $reference . $amountCents . 'COP' . config('services.wompi.integrity_secret');
        $signature       = hash('sha256', $integrityString);

        return response()->json([
            'public_key'       => config('services.wompi.public_key'),
            'currency'         => 'COP',
            'amount_in_cents'  => $amountCents,
            'reference'        => $reference,
            'signature'        => $signature,
            'redirect_url'     => config('app.url') . '/client/payments/return/' . $order->id,
            'order_id'         => $order->id,
        ]);
    }

    // ─── Retorno desde Wompi — verificar con la API y confirmar pago ─────────

    public function paymentReturn(Request $request, int $orderId)
    {
        $order = Order::where('client_id', Auth::id())->findOrFail($orderId);

        // Si ya fue procesado (por webhook o intento anterior) ir directo a pedidos
        if ($order->payment_status === 'approved') {
            return redirect('/client/orders')->with('success', '¡Pago confirmado!');
        }

        // Wompi agrega ?id=<transactionId> en la URL de retorno
        $transactionId = $request->query('id');

        if ($transactionId) {
            $baseUrl = str_contains(config('services.wompi.public_key', ''), 'stagtest')
                ? 'https://sandbox.wompi.co/v1'
                : 'https://production.wompi.co/v1';

            $response = Http::withToken(config('services.wompi.private_key'))
                ->get("{$baseUrl}/transactions/{$transactionId}");

            if ($response->successful()) {
                $tx     = $response->json('data');
                $status = $tx['status'] ?? null;

                DB::beginTransaction();
                try {
                    match ($status) {
                        'APPROVED' => $this->handleApproved(
                            $order,
                            $tx['id'],
                            $tx['payment_method_type'] ?? null
                        ),
                        'DECLINED' => $this->handleDeclined($order),
                        'VOIDED'   => $this->handleVoided($order),
                        default    => null,
                    };
                    DB::commit();
                } catch (\Throwable $e) {
                    DB::rollBack();
                    Log::error('paymentReturn error: ' . $e->getMessage(), ['order_id' => $orderId]);
                }
            }
        }

        return redirect('/client/orders');
    }

    // ─── Webhook de Wompi — confirmación de pago ──────────────────────────────

    public function webhook(Request $request)
    {
        // Verificar firma del webhook
        $signature = $request->header('X-Event-Checksum');

        if (!$this->verifyWebhookSignature($request->all(), $signature)) {
            Log::warning('Wompi webhook firma inválida', $request->all());
            return response()->json(['error' => 'Firma inválida'], 401);
        }

        $event = $request->input('event');
        $data  = $request->input('data.transaction');

        if (!$data) {
            return response()->json(['ok' => true]);
        }

        // Solo procesar eventos de transacción
        if ($event !== 'transaction.updated') {
            return response()->json(['ok' => true]);
        }

        $reference       = $data['reference']         ?? null;
        $status          = $data['status']             ?? null;
        $wompiReference  = $data['id']                 ?? null;
        $paymentMethod   = $data['payment_method_type'] ?? null;

        if (!$reference) {
            return response()->json(['ok' => true]);
        }

        // Buscar la orden por referencia
        // Formato: ORD-00000001
        $orderId = (int) ltrim(str_replace('ORD-', '', $reference), '0');
        $order   = Order::find($orderId);

        if (!$order) {
            Log::warning("Wompi webhook: orden no encontrada para referencia {$reference}");
            return response()->json(['ok' => true]);
        }

        DB::beginTransaction();

        try {
            match ($status) {
                'APPROVED' => $this->handleApproved($order, $wompiReference, $paymentMethod),
                'DECLINED' => $this->handleDeclined($order),
                'VOIDED'   => $this->handleVoided($order),
                default    => null,
            };

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Wompi webhook error: ' . $e->getMessage(), [
                'order_id'  => $orderId,
                'reference' => $reference,
            ]);
        }

        return response()->json(['ok' => true]);
    }

    // ─── Pago aprobado ────────────────────────────────────────────────────────

    private function handleApproved(Order $order, string $wompiReference, ?string $paymentMethod): void
    {
        if ($order->payment_status === 'approved') {
            return; // Evitar procesar duplicados
        }

        $order->update([
            'payment_status'     => 'approved',
            'payment_reference'  => $wompiReference,
            'payment_method'     => $paymentMethod,
            'status'             => 'pending', // Pasa a bandeja de la tienda
        ]);

        // Acreditar saldo pendiente en wallet de la tienda
        $storeOwner  = $order->store->user;
        $storeWallet = Wallet::firstOrCreate(
            ['user_id' => $storeOwner->id, 'type' => 'store'],
            ['balance' => 0, 'pending_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
        );

        $storeWallet->creditPending(
            $order->store_earnings,
            $order->id,
            "Pedido #{$order->id} — en preparación"
        );

        Log::info("Pago aprobado para orden #{$order->id}", [
            'wompi_reference' => $wompiReference,
            'total'           => $order->total,
        ]);
    }

    // ─── Pago declinado ───────────────────────────────────────────────────────

    private function handleDeclined(Order $order): void
    {
        if ($order->payment_status !== 'pending') {
            return;
        }

        $order->update([
            'payment_status' => 'declined',
            'status'         => 'cancelled',
            'cancelled_at'   => now(),
        ]);

        // Restaurar stock de productos
        $this->restoreStock($order);

        Log::info("Pago declinado para orden #{$order->id}");
    }

    // ─── Pago anulado ─────────────────────────────────────────────────────────

    private function handleVoided(Order $order): void
    {
        if ($order->payment_status !== 'approved') {
            return;
        }

        $order->update([
            'payment_status' => 'voided',
            'status'         => 'cancelled',
            'cancelled_at'   => now(),
        ]);

        // Revertir wallet de la tienda
        $storeOwner  = $order->store->user;
        $storeWallet = Wallet::where('user_id', $storeOwner->id)
            ->where('type', 'store')
            ->first();

        if ($storeWallet) {
            $storeWallet->reversePending(
                $order->store_earnings,
                $order->id,
                "Pedido #{$order->id} anulado"
            );
        }

        // Restaurar stock
        $this->restoreStock($order);

        Log::info("Pago anulado para orden #{$order->id}");
    }

    // ─── Restaurar stock al cancelar ─────────────────────────────────────────

    private function restoreStock(Order $order): void
    {
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->incrementStock($item->quantity);
            }
        }
    }

    // ─── Verificar firma del webhook ──────────────────────────────────────────

    private function verifyWebhookSignature(array $data, ?string $signature): bool
    {
        if (!$signature) {
            return false;
        }

        $secret         = config('services.wompi.events_secret');
        $properties     = $data['signature']['properties'] ?? [];
        $checksum       = $data['signature']['checksum']   ?? '';

        // Construir el string a verificar con las propiedades en orden
        $transaction    = $data['data']['transaction'] ?? [];
        $stringToVerify = '';

        foreach ($properties as $property) {
            $keys   = explode('.', $property);
            $value  = $transaction;
            foreach ($keys as $key) {
                $value = $value[$key] ?? '';
            }
            $stringToVerify .= $value;
        }

        $stringToVerify .= $data['timestamp'] ?? '';
        $stringToVerify .= $secret;

        return hash('sha256', $stringToVerify) === $checksum;
    }

    // ─── Consultar estado de un pago (polling desde frontend) ────────────────

    public function checkStatus(int $orderId)
    {
        $order = Order::where('client_id', Auth::id())
        ->findOrFail($orderId);

        return response()->json([
            'order_id'       => $order->id,
            'status'         => $order->status,
            'payment_status' => $order->payment_status,
        ]);
    }
}
