<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();

            // Relación con el wallet
            $table->foreignId('wallet_id')
                ->constrained()
                ->cascadeOnDelete();

            // Relación opcional con el pedido que generó la transacción
            $table->foreignId('order_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Tipo de movimiento
            $table->enum('type', [
                'credit',       // ingreso — pedido entregado
                'debit',        // egreso — retiro a Nequi
                'pending',      // en espera — pedido en curso
                'released',     // liberado — pedido entregado, pasa de pending a credit
                'reversed',     // reversión — pedido cancelado
            ])->index();

            // Monto en pesos colombianos
            $table->unsignedInteger('amount');

            // Saldo del wallet después de esta transacción
            $table->unsignedInteger('balance_after');

            // Descripción legible para el usuario
            $table->string('description');

            // Referencia externa (ej: referencia de transferencia Nequi)
            $table->string('reference')->nullable()->index();

            // Estado de la transacción
            $table->enum('status', [
                'completed',
                'pending',
                'failed',
            ])->default('completed')->index();

            $table->timestamps();

            // Índices para consultas frecuentes
            $table->index(['wallet_id', 'type']);
            $table->index(['wallet_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};