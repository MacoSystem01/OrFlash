<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();

            // Dueño del wallet
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Tipo de wallet: tienda o domiciliario
            $table->enum('type', ['store', 'driver'])->index();

            // Saldos en pesos colombianos (COP)
            $table->unsignedBigInteger('balance')->default(0);
            $table->unsignedBigInteger('pending_balance')->default(0);
            $table->unsignedBigInteger('total_earned')->default(0);
            $table->unsignedBigInteger('total_withdrawn')->default(0);

            // Método de pago preferido para retiros
            $table->string('nequi_phone')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('bank_account_type')->nullable();

            $table->timestamps();

            // Un usuario sólo puede tener un wallet por tipo
            $table->unique(['user_id', 'type']);
            $table->index(['type', 'balance']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
