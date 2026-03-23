<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'balance',
        'pending_balance',
        'total_earned',
        'total_withdrawn',
        'nequi_phone',
        'bank_name',
        'bank_account',
        'bank_account_type',
    ];

    protected $casts = [
        'balance'          => 'integer',
        'pending_balance'  => 'integer',
        'total_earned'     => 'integer',
        'total_withdrawn'  => 'integer',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForStore($query)
    {
        return $query->where('type', 'store');
    }

    public function scopeForDriver($query)
    {
        return $query->where('type', 'driver');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Acreditar saldo pendiente cuando se crea un pedido
     */
    public function creditPending(int $amount, int $orderId, string $description): void
    {
        $this->increment('pending_balance', $amount);

        $this->transactions()->create([
            'order_id'     => $orderId,
            'type'         => 'pending',
            'amount'       => $amount,
            'balance_after'=> $this->balance,
            'description'  => $description,
            'status'       => 'pending',
        ]);
    }

    /**
     * Liberar saldo pendiente a disponible cuando se entrega el pedido
     */
    public function releasePending(int $amount, int $orderId, string $description): void
    {
        $this->decrement('pending_balance', $amount);
        $this->increment('balance',         $amount);
        $this->increment('total_earned',    $amount);

        $this->transactions()->create([
            'order_id'     => $orderId,
            'type'         => 'released',
            'amount'       => $amount,
            'balance_after'=> $this->fresh()->balance,
            'description'  => $description,
            'status'       => 'completed',
        ]);
    }

    /**
     * Revertir saldo pendiente si el pedido se cancela
     */
    public function reversePending(int $amount, int $orderId, string $description): void
    {
        $this->decrement('pending_balance', $amount);

        $this->transactions()->create([
            'order_id'     => $orderId,
            'type'         => 'reversed',
            'amount'       => $amount,
            'balance_after'=> $this->balance,
            'description'  => $description,
            'status'       => 'completed',
        ]);
    }

    /**
     * Registrar retiro a Nequi
     */
    public function withdraw(int $amount, string $reference, string $description): bool
    {
        if ($this->balance < $amount) {
            return false;
        }

        $this->decrement('balance',          $amount);
        $this->increment('total_withdrawn',  $amount);

        $this->transactions()->create([
            'order_id'     => null,
            'type'         => 'debit',
            'amount'       => $amount,
            'balance_after'=> $this->fresh()->balance,
            'description'  => $description,
            'reference'    => $reference,
            'status'       => 'completed',
        ]);

        return true;
    }

    /**
     * Verificar si tiene Nequi configurado
     */
    public function hasPaymentMethod(): bool
    {
        return !is_null($this->nequi_phone);
    }
}