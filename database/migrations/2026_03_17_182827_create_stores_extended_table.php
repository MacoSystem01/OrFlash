<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('stores', function (Blueprint $table) {
            $table->foreignId('merchant_id')->nullable()->after('user_id')->constrained('merchant_profiles')->onDelete('cascade');
            $table->string('logo')->nullable()->after('business_name');
            $table->string('banner')->nullable()->after('logo');
            $table->string('neighborhood')->nullable()->after('address');
            $table->string('city')->nullable()->after('neighborhood');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('coverage_radius')->default(5); // km
            $table->integer('preparation_time')->default(20); // minutos
            $table->decimal('minimum_order', 10, 2)->default(0);
            $table->string('sanitary_certificate')->nullable();
            $table->boolean('accepted_contract')->default(false);
        });
    }
    public function down(): void {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['merchant_id','logo','banner','neighborhood','city','latitude','longitude','coverage_radius','preparation_time','minimum_order','sanitary_certificate','accepted_contract']);
        });
    }
};