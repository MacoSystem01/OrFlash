<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['cash', 'pse', 'nequi', 'daviplata']);
            $table->boolean('is_default')->default(false);

            // PSE
            $table->string('pse_bank')->nullable();
            $table->enum('pse_person_type', ['natural', 'juridica'])->nullable();
            $table->enum('pse_account_type', ['ahorros', 'corriente'])->nullable();
            $table->string('pse_email')->nullable();
            $table->string('pse_document')->nullable();

            // Nequi
            $table->string('nequi_phone')->nullable();
            $table->string('nequi_name')->nullable();

            // Daviplata
            $table->string('daviplata_phone')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_payment_methods');
    }
};