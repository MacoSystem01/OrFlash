<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Relación con la tienda
            $table->foreignId('store_id')
                ->constrained()
                ->cascadeOnDelete();

            // Información básica
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->index();

            // Precio y stock
            $table->unsignedInteger('price');           // en pesos colombianos, sin decimales
            $table->unsignedInteger('stock')->default(0);

            // Estado
            $table->boolean('is_available')->default(true)->index();

            // Multimedia
            $table->json('images')->nullable();

            $table->timestamps();

            // Índices compuestos útiles para consultas frecuentes
            $table->index(['store_id', 'is_available']);
            $table->index(['store_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};