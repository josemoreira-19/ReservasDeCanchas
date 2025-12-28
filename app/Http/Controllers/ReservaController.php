<?php

namespace App\Http\Controllers;

use App\Models\Cancha;
use App\Models\Factura;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReservaController extends Controller
{
    public function store(Request $request)
    {
        // 1. VALIDACIÓN BÁSICA DE DATOS
        $request->validate([
            'cancha_id'      => 'required|exists:canchas,id',
            'fecha_reserva'  => 'required|date|after_or_equal:today',
            'hora_inicio'    => 'required',
            'duracion_horas' => 'required|integer|min:1|max:4',
        ]);

        // 2. PREPARACIÓN DE FECHAS Y VARIABLES
        // Convertimos explícitamente a entero para evitar el error de Carbon
        $duracion = (int) $request->duracion_horas;
        
        $fecha = Carbon::parse($request->fecha_reserva)->format('Y-m-d');
        $inicio = Carbon::parse($request->hora_inicio);
        
        // Calculamos el fin sumando las horas como entero
        $fin = $inicio->copy()->addHours($duracion);

        $horaInicioStr = $inicio->format('H:i:s');
        $horaFinStr = $fin->format('H:i:s');

        // ---------------------------------------------------------
        // 3. NUEVA REGLA DE NEGOCIO: CIERRE A LAS 23:00
        // ---------------------------------------------------------
        $horaCierre = 23; 
        $horaInicioEntera = (int) $inicio->format('H'); // Ej: 22
        
        // Regla A: No se puede reservar a las 23:00 o más tarde
        if ($horaInicioEntera >= $horaCierre) {
            throw ValidationException::withMessages([
                'hora_inicio' => 'La cancha cierra a las 23:00. No se admiten reservas a partir de esta hora.'
            ]);
        }

        // Regla B: La reserva no puede terminar después de las 23:00
        // Ej: Inicio 22:00 + 2 horas = 24:00 (Error)
        if (($horaInicioEntera + $duracion) > $horaCierre) {
            throw ValidationException::withMessages([
                'duracion_horas' => "No es posible reservar {$duracion} horas porque excedería el horario de cierre (23:00)."
            ]);
        }

        // ---------------------------------------------------------
        // 4. VALIDACIÓN DE DISPONIBILIDAD (Evitar Choques)
        // ---------------------------------------------------------
        $existeChoque = Reserva::where('cancha_id', $request->cancha_id)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->where(function ($query) use ($horaInicioStr, $horaFinStr) {
                // Lógica de solapamiento:
                // Una reserva nueva choca si empieza antes de que la otra termine
                // Y termina después de que la otra empiece.
                $query->where('hora_inicio', '<', $horaFinStr)
                    ->where('hora_fin', '>', $horaInicioStr);
            })
            ->exists();

        if ($existeChoque) {
            // Usamos la clave 'general' para que la caja roja del frontend lo muestre
            throw ValidationException::withMessages([
                'general' => 'Lo sentimos, ya existe una reserva confirmada en este rango horario. Por favor revisa el calendario.'
            ]);
        }

        // 5. OBTENER DATOS DE LA CANCHA
        $cancha = Cancha::findOrFail($request->cancha_id);
        
        if ($cancha->estado === 'mantenimiento') {
                throw ValidationException::withMessages([
                'general' => 'Esta cancha se encuentra actualmente en mantenimiento.'
            ]);
        }

        // 6. CÁLCULO DE PRECIOS
        $precioTotal = $cancha->precio_por_hora * $duracion;

        // Desglose inverso (Base + Impuesto = Total cerrado)
        $desglose = $this->calcularDesglosePrecio($precioTotal, 15); 
        
        // 7. TRANSACCIÓN DE BASE DE DATOS
        try {
            DB::beginTransaction();

            // A. Crear la Reserva
            $reserva = Reserva::create([
                'user_id'               => auth()->id(),
                'cancha_id'             => $cancha->id,
                'fecha'                 => $fecha, 
                'hora_inicio'           => $horaInicioStr,
                'hora_fin'              => $horaFinStr,
                'duracion_horas'        => $duracion,
                'precio_alquiler_total' => $precioTotal,
                'monto_comprobante'     => 0,
                'estado'                => 'pendiente',
                'facturas_id'           => null,
            ]);

            // B. Crear la Factura
            $factura = Factura::create([
                'reservas_id'   => $reserva->id,
                'fecha_emision' => now(),
                'subtotal'      => $desglose['base'],
                'impuestos'     => $desglose['impuesto'],
                'total'         => $precioTotal,
                'metodo'        => 'efectivo',
                'pago'          => 'pendiente',
            ]);

            // C. Vincular Factura a Reserva
            $reserva->update(['facturas_id' => $factura->id]);

            DB::commit();

            return response()->json([
                'mensaje' => 'Reserva creada',
                'reserva_id' => $reserva->id // Devolvemos el ID de la nueva reserva
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            // Retornamos error general para que salga en la alerta roja
            return back()->withErrors(['general' => 'Error técnico al guardar: ' . $e->getMessage()]);
        }
    }

    // --- FUNCIONES AUXILIARES ---

    public function calcularDesglosePrecio($precioTotal, $porcentajeImpuesto = 15)
    {
        $factor = 1 + ($porcentajeImpuesto / 100);
        $precioBase = round($precioTotal / $factor, 2);
        $montoImpuesto = round($precioTotal - $precioBase, 2);

        return [
            'base'     => $precioBase,
            'impuesto' => $montoImpuesto,
            'total'    => $precioTotal
        ];
    }

    public function consultarDisponibilidad(Request $request, Cancha $cancha)
    {
        $fechaInicio = $request->query('fecha_inicio') 
            ? Carbon::parse($request->query('fecha_inicio')) 
            : Carbon::now()->startOfWeek();

        $fechaFin = $fechaInicio->copy()->endOfWeek();

        $reservas = Reserva::where('cancha_id', $cancha->id)
            ->where('estado', '!=', 'cancelada')
            ->whereBetween('fecha', [$fechaInicio->format('Y-m-d'), $fechaFin->format('Y-m-d')])
            ->get(['fecha', 'hora_inicio', 'hora_fin', 'duracion_horas']);

        return response()->json([
            'reservas' => $reservas,
            'inicio_semana' => $fechaInicio->format('Y-m-d'),
            'fin_semana' => $fechaFin->format('Y-m-d')
        ]);
    }
}