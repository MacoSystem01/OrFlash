<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('client_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Ubicación
            $table->string('address')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            $table->text('references')->nullable();
            $table->string('alternate_phone')->nullable();
            // Opcional
            $table->string('profile_photo')->nullable();
            $table->string('cedula')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('client_profiles'); }
};