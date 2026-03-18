<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ClientProfile extends Model {
    protected $fillable = ['user_id','address','neighborhood','city','references','alternate_phone','profile_photo','cedula'];
    public function user() { return $this->belongsTo(User::class); }
}