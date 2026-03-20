<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientPaymentMethod extends Model
{
    protected $fillable = [
        'user_id', 'type', 'is_default',
        'pse_bank', 'pse_person_type', 'pse_account_type', 'pse_email', 'pse_document',
        'nequi_phone', 'nequi_name',
        'daviplata_phone',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}