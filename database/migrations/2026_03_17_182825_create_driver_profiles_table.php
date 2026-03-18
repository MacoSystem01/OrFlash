<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('driver_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Datos personales
            $table->string('document_type')->default('CC'); // CC, CE, Pasaporte
            $table->string('document_number');
            $table->string('document_photo')->nullable();
            $table->string('selfie_photo')->nullable();
            $table->date('birth_date')->nullable();
            // Residencia
            $table->string('address')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            // Vehículo
            $table->enum('vehicle_type', ['moto', 'bicicleta', 'carro', 'a_pie']);
            $table->string('vehicle_brand')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_color')->nullable();
            $table->string('vehicle_plate')->nullable();
            $table->json('vehicle_photos')->nullable();
            $table->string('soat')->nullable();
            $table->string('license')->nullable();
            // Validaciones
            $table->boolean('accepted_terms')->default(false);
            $table->boolean('accepted_data_policy')->default(false);
            $table->boolean('accepted_responsibility')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('driver_profiles'); }
};