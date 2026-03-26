<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->unsignedInteger('delivery_fee')->nullable()->after('rating')
                ->comment('Costo de domicilio en pesos. Null = usa el valor global.');
            $table->unsignedSmallInteger('coverage_radius_m')->default(2000)->after('delivery_fee')
                ->comment('Radio máximo de cobertura en metros (máx 2000 m = 2 km).');
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['delivery_fee', 'coverage_radius_m']);
        });
    }
};
