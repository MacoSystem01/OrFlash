<?php

namespace App\Http\Controllers\Wallet;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WalletController extends Controller
{
    // ─── Ver wallet del usuario autenticado ───────────────────────────────────

    public function show()
    {
        $user = Auth::user();

        $type = match ($user->role) {
            'store'  => 'store',
            'driver' => 'driver',
            default  => null,
        };

        if (!$type) {
            abort(403, 'No autorizado.');
        }

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id, 'type' => $type],
            [
                'balance'          => 0,
                'pending_balance'  => 0,
                'total_earned'     => 0,
                'total_withdrawn'  => 0,
            ]
        );

        $transactions = WalletTransaction::where('wallet_id', $wallet->id)
            ->latest()
            ->paginate(20);

        $view = $user->role === 'store'
            ? 'store/wallet'
            : 'driver/wallet';

        return Inertia::render($view, [
            'wallet'       => $wallet,
            'transactions' => $transactions,
        ]);
    }

    // ─── Configurar método de pago (Nequi) ────────────────────────────────────

    public function savePaymentMethod(Request $request)
    {
        $request->validate([
            'nequi_phone' => 'required|string|min:10|max:10|regex:/^3[0-9]{9}$/',
        ]);

        $user = Auth::user();

        $type = match ($user->role) {
            'store'  => 'store',
            'driver' => 'driver',
            default  => null,
        };

        if (!$type) {
            abort(403, 'No autorizado.');
        }

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id, 'type' => $type],
            [
                'balance'         => 0,
                'pending_balance' => 0,
                'total_earned'    => 0,
                'total_withdrawn' => 0,
            ]
        );

        $wallet->update([
            'nequi_phone' => $request->nequi_phone,
        ]);

        return back()->with('success', 'Número Nequi guardado correctamente.');
    }

    // ─── Solicitar retiro ─────────────────────────────────────────────────────

    public function requestWithdrawal(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:10000', // mínimo $10.000 COP
        ]);

        $user = Auth::user();

        $type = match ($user->role) {
            'store'  => 'store',
            'driver' => 'driver',
            default  => null,
        };

        if (!$type) {
            abort(403, 'No autorizado.');
        }

        $wallet = Wallet::where('user_id', $user->id)
            ->where('type', $type)
            ->firstOrFail();

        // Verificar que tiene Nequi configurado
        if (!$wallet->hasPaymentMethod()) {
            return back()->withErrors([
                'error' => 'Debes configurar tu número Nequi antes de solicitar un retiro.',
            ]);
        }

        // Verificar saldo suficiente
        if ($wallet->balance < $request->amount) {
            return back()->withErrors([
                'error' => 'Saldo insuficiente. Tu saldo disponible es $' . number_format($wallet->balance, 0, ',', '.'),
            ]);
        }

        DB::beginTransaction();

        try {
            $reference = 'WTH-' . strtoupper(uniqid());

            $success = $wallet->withdraw(
                $request->amount,
                $reference,
                'Retiro a Nequi ' . $wallet->nequi_phone
            );

            if (!$success) {
                throw new \Exception('No se pudo procesar el retiro.');
            }

            // Aquí se conectará con la API de Wompi/Nequi
            // para hacer la transferencia real cuando esté disponible
            // $this->sendToNequi($wallet->nequi_phone, $request->amount, $reference);

            DB::commit();

            return back()->with(
                'success',
                '¡Retiro solicitado! Se enviará $' .
                number_format($request->amount, 0, ',', '.') .
                ' a tu Nequi ' . $wallet->nequi_phone . ' en las próximas 24 horas.'
            );

        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Error en retiro wallet: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'amount'  => $request->amount,
            ]);

            return back()->withErrors([
                'error' => 'No se pudo procesar el retiro. Por favor, inténtalo de nuevo más tarde.',
            ]);
        }
    }

    // ─── Historial de transacciones ───────────────────────────────────────────

    public function transactions()
    {
        $user = Auth::user();

        $wallet = Wallet::where('user_id', $user->id)
            ->firstOrFail();

        $transactions = WalletTransaction::where('wallet_id', $wallet->id)
            ->with('order:id')
            ->latest()
            ->paginate(20);

        return response()->json([
            'wallet'       => $wallet,
            'transactions' => $transactions,
        ]);
    }

    // ─── Admin — ver todos los wallets ────────────────────────────────────────

    public function adminIndex()
    {
        $wallets = Wallet::with('user:id,name,email,role')
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/wallets', [
            'wallets' => $wallets,
        ]);
    }

    // ─── Admin — procesar retiro manualmente ──────────────────────────────────

    public function adminProcessWithdrawal(Request $request, int $walletId)
    {
        $request->validate([
            'reference' => 'required|string',
            'notes'     => 'nullable|string',
        ]);

        $wallet = Wallet::findOrFail($walletId);

        // Buscar la transacción de retiro pendiente más reciente
        $transaction = WalletTransaction::where('wallet_id', $walletId)
            ->where('type', 'debit')
            ->where('status', 'pending')
            ->latest()
            ->first();

        if (!$transaction) {
            return back()->withErrors([
                'error' => 'No hay retiros pendientes para este wallet.',
            ]);
        }

        $transaction->update([
            'status'    => 'completed',
            'reference' => $request->reference,
        ]);

        return back()->with('success', 'Retiro procesado correctamente.');
    }
}