<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MerchantProfile extends Model {
    protected $fillable = ['user_id','merchant_type','business_name','document_or_nit','legal_representative','chamber_of_commerce','rut','accepted_terms','accepted_data_policy'];
    protected $casts = ['accepted_terms' => 'boolean', 'accepted_data_policy' => 'boolean'];
    public function user() { return $this->belongsTo(User::class); }
    public function stores() { return $this->hasMany(Store::class, 'merchant_id'); }
}