<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // EL ADMINISTRADOR PRINCIPAL
        User::create([
            'name' => 'Super Admin',
            'cedula' => '1314592377', 
            'email' => 'admin@admin.com',
            'password' => Hash::make('adminadmin'), 
            'role' => 'admin',
        ]);

        // CLIENTE DE PRUEBA 1
        User::create([
            'name' => 'Juan Marcet',
            'cedula' => '1314592385',
            'email' => 'juanito@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

        // CLIENTE DE PRUEBA 2
        User::create([
            'name' => 'Jose Leonel',
            'cedula' => '1317062931',
            'email' => 'jose@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

        // CLIENTE DE PRUEBA 3
        User::create([
            'name' => 'Jahier Fusible',
            'cedula' => '1316796083',
            'email' => 'jahier@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

        // CLIENTE DE PRUEBA 4
        User::create([
            'name' => 'Jonathan Vite',
            'cedula' => '1315678134',
            'email' => 'vite@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

         // CLIENTE DE PRUEBA 5
        User::create([
            'name' => 'Cuy Nick',
            'cedula' => '1727437368',
            'email' => 'cuy@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

         // CLIENTE DE PRUEBA 5
        User::create([
            'name' => 'Carmen Basurto',
            'cedula' => '1307152585',
            'email' => 'carmen@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);


    }
}