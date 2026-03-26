<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Actualiza las columnas de dinero (pesos colombianos COP) de INT a BIGINT UNSIGNED.
 *
 * INT UNSIGNED máximo: ~4.295 millones de pesos
 * BIGINT UNSIGNED máximo: ~18 trillones de pesos (seguro para cualquier transacción)
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── wallets ──────────────────────────────────────────────────────────────
        Schema::table('wallets', function (Blueprint $table) {
            $table->unsignedBigInteger('balance')->default(0)->change();
            $table->unsignedBigInteger('pending_balance')->default(0)->change();
            $table->unsignedBigInteger('total_earned')->default(0)->change();
            $table->unsignedBigInteger('total_withdrawn')->default(0)->change();
        });

        // ── orders ───────────────────────────────────────────────────────────────
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('subtotal')->default(0)->change();
            $table->unsignedBigInteger('delivery_fee')->default(0)->change();
            $table->unsignedBigInteger('platform_fee')->default(0)->change();
            $table->unsignedBigInteger('total')->default(0)->change();
            $table->unsignedBigInteger('store_commission')->default(0)->change();
            $table->unsignedBigInteger('driver_commission')->default(0)->change();
            $table->unsignedBigInteger('store_earnings')->default(0)->change();
            $table->unsignedBigInteger('driver_earnings')->default(0)->change();
        });

        // ── order_items ───────────────────────────────────────────────────────────
        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedBigInteger('unit_price')->default(0)->change();
            $table->unsignedBigInteger('subtotal')->default(0)->change();
        });

        // ── products ─────────────────────────────────────────────────────────────
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('price')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->unsignedInteger('balance')->default(0)->change();
            $table->unsignedInteger('pending_balance')->default(0)->change();
            $table->unsignedInteger('total_earned')->default(0)->change();
            $table->unsignedInteger('total_withdrawn')->default(0)->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('subtotal')->default(0)->change();
            $table->unsignedInteger('delivery_fee')->default(0)->change();
            $table->unsignedInteger('platform_fee')->default(0)->change();
            $table->unsignedInteger('total')->default(0)->change();
            $table->unsignedInteger('store_commission')->default(0)->change();
            $table->unsignedInteger('driver_commission')->default(0)->change();
            $table->unsignedInteger('store_earnings')->default(0)->change();
            $table->unsignedInteger('driver_earnings')->default(0)->change();
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedInteger('unit_price')->default(0)->change();
            $table->unsignedInteger('subtotal')->default(0)->change();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('price')->default(0)->change();
        });
    }
};
