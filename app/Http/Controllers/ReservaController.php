<?php

namespace App\Http\Controllers;

use App\Models\Cancha;
use App\Models\Factura;
use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ReservaController extends Controller
{
    // =============================================================
    // 1. LISTAR RESERVAS (Lógica Unificada Admin/Cliente)
    // =============================================================
    public function index(Request $request)
        {
            $user = auth()->user();
            $search = $request->input('search');

            // Determinamos si es Admin
            $esAdmin = $user->role === 'admin';

            if ($esAdmin) {
                // --- LÓGICA PARA ADMIN ---
                $reservas = Reserva::query()
                    ->with(['user', 'cancha']) 
                    ->when($search, function ($query, $search) {
                        $query->where('id', 'like', "%{$search}%")
                            ->orWhereHas('user', function ($q) use ($search) {
                                $q->where('name', 'like', "%{$search}%")
                                    ->orWhere('cedula', 'like', "%{$search}%");
                            });
                    })
                    ->orderBy('fecha', 'desc') 
                    ->orderBy('hora_inicio', 'desc')
                    ->paginate(10)
                    ->withQueryString();

                // CAMBIO AQUÍ: 'Reservas/MisReservas' en lugar de 'Reservas/Index'
                return Inertia::render('Reservas/MisReservas', [ 
                    'reservas' => $reservas,
                    'filters' => $request->only(['search']),
                    'isAdmin' => true, 
                    'facturasDisponibles' => [], 
                ]);

            } else {
                // --- LÓGICA PARA CLIENTE ---
                
                $reservas = Reserva::with(['cancha', 'factura'])
                    ->where('user_id', $user->id)
                    ->orderBy('fecha', 'desc')
                    ->orderBy('hora_inicio', 'desc')
                    ->paginate(10);

                $todas = Reserva::with(['cancha', 'factura'])
                    ->where('user_id', $user->id)
                    ->get();

                $facturasDisponibles = $todas->filter(function ($r) {
                    $total = (float) $r->precio_alquiler_total;
                    $pagado = (float) $r->monto_comprobante;
                    if ($total <= 0) return false;
                    return ($total - $pagado) <= 0.01;
                })->values();

                // CAMBIO AQUÍ TAMBIÉN
                return Inertia::render('Reservas/MisReservas', [
                    'reservas' => $reservas,
                    'isAdmin' => false, 
                    'facturasDisponibles' => $facturasDisponibles,
                ]);
            }
        }

    public function misReservas(Request $request)
    {
        return $this->index($request);
    }

    // =============================================================
    // 2. CREAR RESERVA
    // =============================================================
public function store(Request $request)
    {
        $request->validate([
            'cancha_id'      => 'required|exists:canchas,id',
            'fecha_reserva'  => 'required|date|after_or_equal:today',
            'hora_inicio'    => 'required',
            'duracion_horas' => 'required|integer|min:1|max:4',
            'cliente_id'     => 'nullable|exists:users,id',
        ]);

        $duracion = (int) $request->duracion_horas;
        
        // Convertimos a Carbon
        $fecha = Carbon::parse($request->fecha_reserva)->format('Y-m-d');
        $inicio = Carbon::parse($request->hora_inicio); // Esto toma la fecha de hoy + hora, pero para isWeekend sirve igual si se ajusta la fecha
        
        // IMPORTANTE: Aseguramos que $inicio tenga la fecha de la reserva para validar correctamente el día de la semana
        $inicio = Carbon::parse($request->fecha_reserva . ' ' . $request->hora_inicio);
        
        $fin = $inicio->copy()->addHours($duracion);

        $horaInicioStr = $inicio->format('H:i:s');
        $horaFinStr = $fin->format('H:i:s');

        // Regla: Cierre a las 23:00
        if ($inicio->hour >= 23 || ($inicio->hour + $duracion) > 23) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'hora_inicio' => 'La cancha cierra a las 23:00.'
            ]);
        }

        // Validación Choques
        $choque = Reserva::where('cancha_id', $request->cancha_id)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->where(function ($q) use ($horaInicioStr, $horaFinStr) {
                $q->where('hora_inicio', '<', $horaFinStr)
                  ->where('hora_fin', '>', $horaInicioStr);
            })->exists();

        if ($choque) {
            throw \Illuminate\Validation\ValidationException::withMessages(['general' => 'Ya existe una reserva en ese horario.']);
        }

        $cancha = Cancha::findOrFail($request->cancha_id);
        
        if ($cancha->estado === 'mantenimiento') {
             throw \Illuminate\Validation\ValidationException::withMessages(['general' => 'Cancha en mantenimiento.']);
        }

        // --- LÓGICA DE PRECIO (INTEGRADA) ---
        // Verificamos si la fecha de la reserva es Sábado o Domingo
        if ($inicio->isWeekend()) {
            $precioPorHoraAplicado = $cancha->precio_fin_de_semana;
        } else {
            $precioPorHoraAplicado = $cancha->precio_por_hora;
        }

        // Calculamos el total con el precio decidido
        $precioTotal = $precioPorHoraAplicado * $duracion;
        // ------------------------------------

        $desglose = $this->calcularDesglosePrecio($precioTotal, 15);
        
        // Asignar Dueño
        $userId = auth()->id();
        if (auth()->user()->role === 'admin' && $request->filled('cliente_id')) {
            $userId = $request->cliente_id;
        }

        try {
            DB::beginTransaction();

            $reserva = Reserva::create([
                'user_id' => $userId,
                'cancha_id' => $cancha->id,
                'fecha' => $fecha,
                'hora_inicio' => $horaInicioStr,
                'hora_fin' => $horaFinStr,
                'duracion_horas' => $duracion,
                'precio_alquiler_total' => $precioTotal,
                'monto_comprobante' => 0,
                'estado' => 'pendiente',
            ]);

            $factura = Factura::create([
                'reservas_id' => $reserva->id,
                'fecha_emision' => now(),
                'subtotal' => $desglose['base'],
                'impuestos' => $desglose['impuesto'],
                'total' => $precioTotal,
                'metodo' => 'efectivo',
                'pago' => 'pendiente',
                'codigo_unico' => Str::uuid()->toString(),
            ]);

            $reserva->update(['facturas_id' => $factura->id]);

            DB::commit();
            return response()->json(['mensaje' => 'Reserva creada', 'reserva_id' => $reserva->id], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Error: ' . $e->getMessage()]);
        }
    }

    // =============================================================
    // 3. ELIMINAR / CANCELAR
    // =============================================================
    public function cancelar(Reserva $reserva)
        {
            $user = auth()->user();

            // Seguridad: Solo Admin o el Dueño pueden cancelar
            if ($user->role !== 'admin' && $user->id !== $reserva->user_id) {
                abort(403, 'No tienes permiso para cancelar esta reserva.');
            }

            // Actualizamos estado
            $reserva->update(['estado' => 'cancelada']);
            
            // Si tenía factura pendiente, la anulamos o marcamos (opcional)
            // if ($reserva->factura) $reserva->factura->delete();

            return back()->with('success', 'Reserva cancelada correctamente.');
        }

    // =============================================================
    // FUNCIONES AUXILIARES
    // =============================================================
    public function calcularDesglosePrecio($precioTotal, $porcentajeImpuesto = 15)
    {
        $factor = 1 + ($porcentajeImpuesto / 100);
        $precioBase = round($precioTotal / $factor, 2);
        $montoImpuesto = round($precioTotal - $precioBase, 2);
        return ['base' => $precioBase, 'impuesto' => $montoImpuesto, 'total' => $precioTotal];
    }

    public function consultarDisponibilidad(Request $request, Cancha $cancha)
    {
        $fechaInicio = $request->query('fecha_inicio') ? Carbon::parse($request->query('fecha_inicio')) : Carbon::now()->startOfWeek();
        $fechaFin = $fechaInicio->copy()->endOfWeek();

        $reservas = Reserva::where('cancha_id', $cancha->id)
            ->where('estado', '!=', 'cancelada')
            ->whereBetween('fecha', [$fechaInicio->format('Y-m-d'), $fechaFin->format('Y-m-d')])
            ->get(['fecha', 'hora_inicio', 'hora_fin', 'duracion_horas']);

        return response()->json(['reservas' => $reservas]);
    }
    public function cancelarPorAbandono(Reserva $reserva)
    {
        // Seguridad: Solo permitir borrar si la reserva está pendiente
        // Esto evita borrar reservas pagadas por error.
        if ($reserva->estado === 'pendiente') {
            
            // 1. Si se creó un borrador de factura, borrarlo primero
            if ($reserva->factura) {
                $reserva->factura->delete();
            }

            // 2. Eliminar la reserva físicamente
            $reserva->delete();

            return to_route('dashboard')
                ->with('status', 'La reserva incompleta ha sido eliminada.');
        }

        // Si intentan borrar una pagada, solo los devolvemos al inicio
        return to_route('dashboard')
            ->with('error', 'No se puede cancelar esta reserva.');
    }
}