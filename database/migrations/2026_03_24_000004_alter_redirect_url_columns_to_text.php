<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('home_carousels', function (Blueprint $table) {
            $table->text('redirect_url')->nullable()->change();
        });

        Schema::table('footer_items', function (Blueprint $table) {
            $table->text('redirect_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('home_carousels', function (Blueprint $table) {
            $table->string('redirect_url', 500)->nullable()->change();
        });

        Schema::table('footer_items', function (Blueprint $table) {
            $table->string('redirect_url', 500)->nullable()->change();
        });
    }
};
