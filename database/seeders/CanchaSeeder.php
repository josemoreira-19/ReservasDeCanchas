<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cancha;

class CanchaSeeder extends Seeder
{
    public function run(): void
    {
        // Cancha de Fútbol 1
        Cancha::create([
            'nombre' => 'Cancha Sintética Principal',
            'tipo' => 'futbol',
            'precio_por_hora' => 25.00,
            'precio_fin_de_semana' => 30.00, // Asumiendo que tienes este campo por tu SQL anterior
            'estado' => 'disponible',
        ]);

        // Cancha de Fútbol 2
        Cancha::create([
            'nombre' => 'Cancha Sintética Norte',
            'tipo' => 'futbol',
            'precio_por_hora' => 20.00,
            'precio_fin_de_semana' => 25.00,
            'estado' => 'disponible',
        ]);

        // Cancha de Voley 1
        Cancha::create([
            'nombre' => 'La Arena del Voley',
            'tipo' => 'voley',
            'precio_por_hora' => 15.00,
            'precio_fin_de_semana' => 20.00,
            'estado' => 'disponible',
        ]);

        // Cancha de Voley 2
        Cancha::create([
            'nombre' => 'La Arena del Sol',
            'tipo' => 'voley',
            'precio_por_hora' => 20.00,
            'precio_fin_de_semana' => 25.00,
            'estado' => 'disponible',
        ]);

        // Cancha de Tenis 1
        Cancha::create([
            'nombre' => 'Court Central',
            'tipo' => 'tenis',
            'precio_por_hora' => 30.00,
            'precio_fin_de_semana' => 35.00,
            'estado' => 'mantenimiento', // Para probar que no salga en reservas
        ]);

        // Cancha de Tenis2
        Cancha::create([
            'nombre' => 'Court norte',
            'tipo' => 'tenis',
            'precio_por_hora' => 30.00,
            'precio_fin_de_semana' => 35.00,
            'estado' => 'disponible', 
        ]);

    }
}