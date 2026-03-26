<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE client_payment_methods MODIFY COLUMN type ENUM('cash','pse','nequi','daviplata','contra_entrega') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE client_payment_methods MODIFY COLUMN type ENUM('cash','pse','nequi','daviplata') NOT NULL");
    }
};
