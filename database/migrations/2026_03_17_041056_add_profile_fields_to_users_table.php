<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            // Comunes
            $table->string('phone')->nullable()->after('role');
            $table->string('cedula')->nullable()->after('phone');
            $table->string('address')->nullable()->after('cedula');
            $table->enum('status', ['active', 'pending', 'rejected'])->default('active')->after('address');

            // Tienda
            $table->string('nit')->nullable()->after('status');
            $table->string('business_name')->nullable()->after('nit');
            $table->string('commercial_address')->nullable()->after('business_name');
            $table->string('chamber_of_commerce')->nullable()->after('commercial_address');

            // Domiciliario
            $table->string('license_number')->nullable()->after('chamber_of_commerce');
            $table->string('vehicle_plate')->nullable()->after('license_number');
            $table->string('arl')->nullable()->after('vehicle_plate');
            $table->string('insurance')->nullable()->after('arl');
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 'cedula', 'address', 'status',
                'nit', 'business_name', 'commercial_address', 'chamber_of_commerce',
                'license_number', 'vehicle_plate', 'arl', 'insurance',
            ]);
        });
    }
};