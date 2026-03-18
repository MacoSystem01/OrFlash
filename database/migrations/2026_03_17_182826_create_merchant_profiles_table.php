<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('merchant_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Tipo
            $table->enum('merchant_type', ['natural', 'empresa'])->default('natural');
            // Datos legales
            $table->string('business_name')->nullable();
            $table->string('document_or_nit');
            $table->string('legal_representative')->nullable();
            $table->string('chamber_of_commerce')->nullable();
            $table->string('rut')->nullable();
            // Validaciones
            $table->boolean('accepted_terms')->default(false);
            $table->boolean('accepted_data_policy')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('merchant_profiles'); }
};