<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            // Limpiar columnas viejas que ya no se usan
            $cols = ['cedula','address','nit','business_name','commercial_address','chamber_of_commerce','license_number','vehicle_plate','arl','insurance'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
    public function down(): void {}
};