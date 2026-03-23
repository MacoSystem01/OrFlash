<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->nullable()                // nullable por si el producto se elimina
                ->constrained()
                ->nullOnDelete();

            // Snapshot del producto al momento del pedido
            // (el precio puede cambiar después, necesitamos el histórico)
            $table->string('product_name');           // nombre al momento del pedido
            $table->unsignedInteger('unit_price');    // precio unitario al momento del pedido
            $table->unsignedInteger('quantity');      // cantidad solicitada
            $table->unsignedInteger('subtotal');      // unit_price * quantity

            $table->timestamps();

            // Índice para consultas por pedido
            $table->index(['order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};