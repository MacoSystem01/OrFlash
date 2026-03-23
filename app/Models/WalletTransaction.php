<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'order_id',
        'type',
        'amount',
        'balance_after',
        'description',
        'reference',
        'status',
    ];

    protected $casts = [
        'amount'        => 'integer',
        'balance_after' => 'integer',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeCredits($query)
    {
        return $query->whereIn('type', ['credit', 'released']);
    }

    public function scopeDebits($query)
    {
        return $query->where('type', 'debit');
    }

    public function scopePending($query)
    {
        return $query->where('type', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function isCredit(): bool
    {
        return in_array($this->type, ['credit', 'released']);
    }

    public function isDebit(): bool
    {
        return $this->type === 'debit';
    }

    public function isPending(): bool
    {
        return $this->type === 'pending';
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'credit'   => 'Ingreso',
            'debit'    => 'Retiro',
            'pending'  => 'En espera',
            'released' => 'Liberado',
            'reversed' => 'Reversión',
            default    => 'Desconocido',
        };
    }

    public function getStatusLabel(): string
    {
        return match($this->status) {
            'completed' => 'Completado',
            'pending'   => 'Pendiente',
            'failed'    => 'Fallido',
            default     => 'Desconocido',
        };
    }
}