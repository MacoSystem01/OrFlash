<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Admin OrFlash',  'email' => 'admin@orflash.com',  'role' => 'admin',  'password' => Hash::make('password')],
            ['name' => 'Cliente Test',   'email' => 'client@orflash.com', 'role' => 'client', 'password' => Hash::make('password')],
            ['name' => 'Tienda Test',    'email' => 'store@orflash.com',  'role' => 'store',  'password' => Hash::make('password')],
            ['name' => 'Domiciliario',   'email' => 'driver@orflash.com', 'role' => 'driver', 'password' => Hash::make('password')],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}