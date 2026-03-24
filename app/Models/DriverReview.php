<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverReview extends Model
{
    protected $fillable = ['user_id', 'driver_id', 'order_id', 'rating', 'comment'];

    public function user()   { return $this->belongsTo(User::class); }
    public function driver() { return $this->belongsTo(User::class, 'driver_id'); }
    public function order()  { return $this->belongsTo(Order::class); }
}