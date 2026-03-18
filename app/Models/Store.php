<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model {
    protected $fillable = [
        'user_id', 'business_name', 'nit', 'chamber_of_commerce_file',
        'category', 'zone', 'description', 'address', 'phone',
        'attention_days', 'opening_time', 'closing_time',
        'status', 'is_open', 'rating', 'images',
    ];

    protected $casts = [
        'attention_days' => 'array',
        'images'         => 'array',
        'is_open'        => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}