<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Base de datos limpia para producción.
        // No se ejecutan seeders de prueba.
        //
        // Para crear el primer administrador ejecuta en terminal:
        //
        //   php artisan tinker
        //
        //   App\Models\User::create([
        //       'name'     => 'Admin OrFlash',
        //       'email'    => 'admin@orflash.com',
        //       'password' => bcrypt('TU_PASSWORD_SEGURO'),
        //       'role'     => 'admin',
        //       'status'   => 'active',
        //   ]);
    }
}