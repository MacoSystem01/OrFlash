<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterItem extends Model
{
    protected $fillable = ['title', 'icon', 'redirect_url', 'order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
