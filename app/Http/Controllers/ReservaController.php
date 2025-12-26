<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ReservaController extends Controller
{
    //
    public function store(Request $request) 
    {
        $request->validate([
            'cancha_id' => 'required|exists:canchas,id',
            'fecha_reserva' => 'required|date|after:yesterday',
            'hora_inicio' => 'required',
            'duracion_horas' => 'required|integer|min:1',
        ]);

        $horaInicio = $request->hora_inicio;
        // Calculamos la hora de fin sumando la duración
        $horaFin = date('H:i:s', strtotime($horaInicio . " + {$request->duracion_horas} hours"));

        // LA LÓGICA CRÍTICA: Buscar si ya hay una reserva que choque
        $choque = Reserva::where('cancha_id', $request->cancha_id)
            ->where('fecha_reserva', $request->fecha_reserva)
            ->where(function($query) use ($horaInicio, $horaFin) {
                $query->whereBetween('hora_inicio', [$horaInicio, $horaFin])
                    ->orWhereBetween('hora_fin', [$horaInicio, $horaFin]);
            })->exists();

        if ($choque) {
            return back()->withErrors(['error' => 'La cancha ya está ocupada en ese horario.']);
        }

        // Si no hay choque, creamos la reserva...
    }
}
