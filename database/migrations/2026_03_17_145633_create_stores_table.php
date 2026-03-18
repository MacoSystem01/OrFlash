<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Información básica
            $table->string('business_name');
            $table->string('nit')->nullable();
            $table->string('chamber_of_commerce_file')->nullable(); // ruta del archivo
            $table->string('category');
            $table->string('zone');
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('phone')->nullable();

            // Horario
            $table->json('attention_days');    // ["Lunes","Martes",...]
            $table->time('opening_time');
            $table->time('closing_time');

            // Estado
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->boolean('is_open')->default(false);
            $table->decimal('rating', 3, 1)->default(0);

            // Imágenes (JSON array de rutas)
            $table->json('images')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('stores');
    }
};