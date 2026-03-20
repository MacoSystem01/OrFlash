<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();

            // Relación
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Información básica
            $table->string('business_name');
            $table->string('nit')->nullable()->index();
            $table->string('chamber_of_commerce_file')->nullable();
            $table->string('category')->index();
            $table->string('zone')->index();
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('phone')->nullable();

            // Horario
            $table->json('attention_days');
            $table->time('opening_time');
            $table->time('closing_time');

            // Estado
            $table->enum('status', ['active', 'inactive', 'pending'])
                ->default('pending')
                ->index();

            $table->boolean('is_open')->default(false);
            $table->decimal('rating', 3, 1)->default(0);

            // Multimedia
            $table->json('images')->nullable();

            $table->timestamps();

            // Índices compuestos útiles
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};