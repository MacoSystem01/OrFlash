<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeCarousel extends Model
{
    protected $fillable = ['image', 'redirect_url', 'is_active', 'order'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
