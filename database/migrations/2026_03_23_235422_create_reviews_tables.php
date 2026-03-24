<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Reseñas de tiendas
        Schema::create('store_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');   // 1–5
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'order_id']);
        });

        // Reseñas de domiciliarios
        Schema::create('driver_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');   // 1–5
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'order_id', 'driver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_reviews');
        Schema::dropIfExists('store_reviews');
    }
};