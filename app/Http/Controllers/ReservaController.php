<?php

namespace App\Http\Controllers;

use App\Models\Cancha;
use App\Models\Factura;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

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
            'cliente_id'     => 'nullable|exists:users,id', // <--- Validación nueva para Admin
        ]);

        // 2. PREPARACIÓN DE FECHAS Y VARIABLES
        $duracion = (int) $request->duracion_horas;
        
        $fecha = \Carbon\Carbon::parse($request->fecha_reserva)->format('Y-m-d');
        $inicio = \Carbon\Carbon::parse($request->hora_inicio);
        $fin = $inicio->copy()->addHours($duracion);

        $horaInicioStr = $inicio->format('H:i:s');
        $horaFinStr = $fin->format('H:i:s');

        // ---------------------------------------------------------
        // 3. NUEVA REGLA DE NEGOCIO: CIERRE A LAS 23:00
        // ---------------------------------------------------------
        $horaCierre = 23; 
        $horaInicioEntera = (int) $inicio->format('H'); 
        
        // Regla A: No se puede reservar a las 23:00 o más tarde
        if ($horaInicioEntera >= $horaCierre) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'hora_inicio' => 'La cancha cierra a las 23:00. No se admiten reservas a partir de esta hora.'
            ]);
        }

        // Regla B: La reserva no puede terminar después de las 23:00
        if (($horaInicioEntera + $duracion) > $horaCierre) {
            throw \Illuminate\Validation\ValidationException::withMessages([
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
                $query->where('hora_inicio', '<', $horaFinStr)
                    ->where('hora_fin', '>', $horaInicioStr);
            })
            ->exists();

        if ($existeChoque) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'general' => 'Lo sentimos, ya existe una reserva confirmada en este rango horario. Por favor revisa el calendario.'
            ]);
        }

        // 5. OBTENER DATOS DE LA CANCHA
        $cancha = \App\Models\Cancha::findOrFail($request->cancha_id);
        
        if ($cancha->estado === 'mantenimiento') {
                throw \Illuminate\Validation\ValidationException::withMessages([
                'general' => 'Esta cancha se encuentra actualmente en mantenimiento.'
            ]);
        }

        // 6. CÁLCULO DE PRECIOS
        $precioTotal = $cancha->precio_por_hora * $duracion;

        // Desglose inverso (Base + Impuesto = Total cerrado)
        // Nota: Asegúrate de que esta función 'calcularDesglosePrecio' exista en tu controlador
        $desglose = $this->calcularDesglosePrecio($precioTotal, 15); 
        
        // ---------------------------------------------------------
        // DETERMINAR EL USUARIO DUEÑO (NUEVA LÓGICA)
        // ---------------------------------------------------------
        $userId = auth()->id(); // Por defecto, soy yo

        // Si soy admin y envié un cliente_id, la reserva es para él
        if (auth()->user()->role === 'admin' && $request->filled('cliente_id')) {
            $userId = $request->cliente_id;
        }

        // 7. TRANSACCIÓN DE BASE DE DATOS
        try {
            DB::beginTransaction();

            // A. Crear la Reserva
            $reserva = Reserva::create([
                'user_id'               => $userId, // <--- ID ASIGNADO
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
            $factura = \App\Models\Factura::create([
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
                'reserva_id' => $reserva->id 
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
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

    public function cancelarPorAbandono(Reserva $reserva)
    {
        // SEGURIDAD: 
        // 1. Que el usuario sea el dueño.
        // 2. Que la reserva esté pendiente (para no borrar una pagada por error).
        if ($reserva->user_id === auth()->id() && $reserva->estado === 'pendiente') {
            
            // Si ya se había generado factura, borrarla primero
            if ($reserva->factura) {
                $reserva->factura->delete();
            }

            $reserva->delete();

            // Retornamos al inicio o dashboard con un mensaje
            return redirect()->route('canchas.index')->with('success', 'Reserva cancelada correctamente.');
        }

        return back()->with('error', 'No se pudo cancelar la reserva.');
    }

    public function misReservas()
    {
        $userId = auth()->id();

        $todasLasReservas = Reserva::with(['cancha', 'factura'])
            ->where('user_id', $userId)
            ->orderByDesc('fecha')
            ->orderByDesc('hora_inicio')
            ->get();

        // NUEVA REGLA: Solo pasan a "Facturas" si se pagó el 100% (o más por si acaso)
        $reservasFacturables = $todasLasReservas->filter(function ($reserva) {
            if ($reserva->precio_alquiler_total <= 0) return false;
            
            // Calculamos saldo restante
            $saldoPendiente = $reserva->precio_alquiler_total - $reserva->monto_comprobante;

            // Si el saldo es 0 (o menos, por errores de decimales), está pagada
            return $saldoPendiente <= 0.01; 
        });

        return Inertia::render('Reservas/MisReservas', [
            'reservas' => $todasLasReservas,
            'facturasDisponibles' => $reservasFacturables->values()
        ]);
    }

    // NUEVA FUNCIÓN PARA CANCELAR
    public function cancelar(Reserva $reserva)
    {
        // Seguridad: Solo el dueño puede cancelar
        if (auth()->id() !== $reserva->user_id) {
            abort(403);
        }

        // Opcional: Validar que no cancele una reserva que ya pasó
        // if (Carbon::parse($reserva->fecha)->isPast()) { ... error ... }

        $reserva->update(['estado' => 'cancelada']);

        return back()->with('success', 'Reserva cancelada correctamente.');
    }

}