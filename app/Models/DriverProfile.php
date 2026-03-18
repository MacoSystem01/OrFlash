<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DriverProfile extends Model {
    protected $fillable = ['user_id','document_type','document_number','document_photo','selfie_photo','birth_date','address','neighborhood','city','vehicle_type','vehicle_brand','vehicle_model','vehicle_color','vehicle_plate','vehicle_photos','soat','license','accepted_terms','accepted_data_policy','accepted_responsibility'];
    protected $casts = ['vehicle_photos' => 'array', 'accepted_terms' => 'boolean', 'accepted_data_policy' => 'boolean', 'accepted_responsibility' => 'boolean'];
    public function user() { return $this->belongsTo(User::class); }
}