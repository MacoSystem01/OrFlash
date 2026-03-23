<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('client_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('store_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('driver_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Montos en pesos colombianos (sin decimales)
            $table->unsignedInteger('subtotal');          // total productos
            $table->unsignedInteger('delivery_fee');      // tarifa domicilio
            $table->unsignedInteger('platform_fee');      // comisión OrFlash (tienda + domicilio)
            $table->unsignedInteger('total');             // subtotal + delivery_fee

            // Comisiones desglosadas para el wallet
            $table->unsignedInteger('store_commission');  // 10% del subtotal
            $table->unsignedInteger('driver_commission'); // 10% del delivery_fee
            $table->unsignedInteger('store_earnings');    // subtotal - store_commission
            $table->unsignedInteger('driver_earnings');   // delivery_fee - driver_commission

            // Estado del pedido
            $table->enum('status', [
                'pending_payment',  // esperando pago
                'pending',          // pagado, esperando tienda
                'confirmed',        // tienda confirmó
                'preparing',        // tienda preparando
                'ready',            // listo para recoger
                'picked_up',        // driver recogió
                'in_transit',       // en camino
                'delivered',        // entregado
                'cancelled',        // cancelado
            ])->default('pending_payment')->index();

            // Estado del pago
            $table->enum('payment_status', [
                'pending',
                'approved',
                'declined',
                'voided',
            ])->default('pending')->index();

            $table->string('payment_reference')->nullable()->index(); // referencia Wompi

            // Dirección de entrega (snapshot al momento del pedido)
            $table->string('delivery_address');
            $table->string('delivery_neighborhood')->nullable();
            $table->string('delivery_city')->nullable();
            $table->text('delivery_references')->nullable();
            $table->decimal('delivery_lat', 10, 7)->nullable();
            $table->decimal('delivery_lng', 10, 7)->nullable();

            // Método de pago usado
            $table->string('payment_method')->nullable(); // nequi, pse, daviplata, card

            // Timestamps de cada estado (para métricas)
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('preparing_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            // Índices compuestos para consultas frecuentes
            $table->index(['client_id', 'status']);
            $table->index(['store_id',  'status']);
            $table->index(['driver_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};