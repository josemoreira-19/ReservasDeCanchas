<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule; // <--- Importante
use App\Models\Reserva;                  // <--- Importamos el modelo
use App\Models\Factura;

// Esta tarea se ejecutará cada minuto
Schedule::call(function () {
    $limiteTiempo = now()->subMinutes(5);

    $reservasCaducadas = Reserva::where('estado', 'pendiente')
        ->where('monto_comprobante', 0) 
        ->where('created_at', '<=', $limiteTiempo)
        ->get();

    foreach ($reservasCaducadas as $reserva) {
        if ($reserva->factura) $reserva->factura->delete();
        $reserva->delete();
    }
})->everyMinute(); // <--- Frecuencia: Cada minuto