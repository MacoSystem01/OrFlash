<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'name',
        'description',
        'category',
        'price',
        'stock',
        'is_available',
        'images',
    ];

    protected $casts = [
        'images'       => 'array',
        'is_available' => 'boolean',
        'price'        => 'integer',
        'stock'        => 'integer',
    ];

    // ─── Relaciones ───────────────────────────────────────────────────────────

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)->where('stock', '>', 0);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeFromStore($query, int $storeId)
    {
        return $query->where('store_id', $storeId);
    }

    // ─── Accesores ────────────────────────────────────────────────────────────

    public function getMainImageAttribute(): ?string
    {
        return $this->images[0] ?? null;
    }

    public function getIsInStockAttribute(): bool
    {
        return $this->stock > 0 && $this->is_available;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function decrementStock(int $quantity): void
    {
        $this->decrement('stock', $quantity);

        if ($this->stock <= 0) {
            $this->update(['is_available' => false]);
        }
    }

    public function incrementStock(int $quantity): void
    {
        $this->increment('stock', $quantity);

        if (!$this->is_available && $this->stock > 0) {
            $this->update(['is_available' => true]);
        }
    }
}