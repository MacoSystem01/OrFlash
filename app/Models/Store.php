<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'nit',
        'chamber_of_commerce_file',
        'category',
        'zone',
        'description',
        'address',
        'phone',
        'attention_days',
        'opening_time',
        'closing_time',
        'status',
        'is_open',
        'rating',
        'images',
    ];

    protected $casts = [
        'attention_days' => 'array',
        'images'         => 'array',
        'is_open'        => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes (MUY útil para escalar)
    |--------------------------------------------------------------------------
    */

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOpen($query)
    {
        return $query->where('is_open', true);
    }
    
    /*
    |--------------------------------------------------------------------------
    | Accesores
    |--------------------------------------------------------------------------
    */

    public function getMainImageAttribute()
    {
        return $this->images[0] ?? null;
    }
}
