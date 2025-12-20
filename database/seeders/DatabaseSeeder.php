<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Cancha;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // 1. Crear Usuario Administrador
        User::create([
            'name' => 'Admin Juan',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // 2. Crear Usuario Cliente de prueba
        User::create([
            'name' => 'Cliente Prueba',
            'email' => 'cliente@cliente.com',
            'password' => Hash::make('cliente123'),
            'role' => 'client',
        ]);

        // 3. Crear Canchas de prueba
        Cancha::create([
            'nombre' => 'Cancha Central 1',
            'tipo' => 'futbol',
            'precio_por_hora' => 15.00,
            'precio_fin_de_semana' => 20.00,
            'estado' => 'disponible',
        ]);

        Cancha::create([
            'nombre' => 'Voley Arena',
            'tipo' => 'voley',
            'precio_por_hora' => 10.00,
            'precio_fin_de_semana' => 20.00,
            'estado' => 'disponible',
        ]);

        Cancha::create([
            'nombre' => 'Tenis Pro',
            'tipo' => 'tenis',
            'precio_por_hora' => 20.00,
            'precio_fin_de_semana' => 20.00,
            'estado' => 'mantenimiento',
        ]);


        // User::factory(10)->create();
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
    }
}
