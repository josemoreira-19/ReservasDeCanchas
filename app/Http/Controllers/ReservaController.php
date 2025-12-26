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

        // 2. PREPARACIÓN DE FECHAS CON CARBON
        $fecha = Carbon::parse($request->fecha_reserva)->format('Y-m-d');
        $inicio = Carbon::parse($request->hora_inicio);
        $fin = $inicio->copy()->addHours($request->duracion_horas);

        $horaInicioStr = $inicio->format('H:i:s');
        $horaFinStr = $fin->format('H:i:s');

        // 3. VALIDACIÓN DE DISPONIBILIDAD
        $existeChoque = Reserva::where('cancha_id', $request->cancha_id)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->where(function ($query) use ($horaInicioStr, $horaFinStr) {
                $query->where('hora_inicio', '<', $horaFinStr)
                    ->where('hora_fin', '>', $horaInicioStr);
            })
            ->exists();

        if ($existeChoque) {
            throw ValidationException::withMessages([
                'hora_inicio' => 'La cancha ya está ocupada en este horario.'
            ]);
        }

        // 4. OBTENER DATOS Y CALCULAR PRECIOS
        $cancha = Cancha::findOrFail($request->cancha_id);
        
        if ($cancha->estado === 'mantenimiento') {
                throw ValidationException::withMessages([
                'cancha_id' => 'Esta cancha está en mantenimiento.'
            ]);
        }

        // A. Calculamos el TOTAL FINAL (Ej: 10 dolares)
        $precioTotal = $cancha->precio_por_hora * $request->duracion_horas;

        // B. DESGLOSE INVERSO DEL IMPUESTO (Ej: Sacar base de los 10 dolares)
        // <--- AQUÍ ESTÁ EL CAMBIO IMPORTANTE: Llamamos a la función de abajo
        $desglose = $this->calcularDesglosePrecio($precioTotal, 15); // 15% es el ejemplo, ajústalo si es 12% o IVA local
        
        // Ahora $desglose es un array así: ['base' => 8.70, 'impuesto' => 1.30, 'total' => 10.00]


        // 5. TRANSACCIÓN DE BASE DE DATOS
        try {
            DB::beginTransaction();

            // A. Crear la Reserva
            $reserva = Reserva::create([
                'user_id'               => auth()->id(),
                'cancha_id'             => $cancha->id,
                'fecha'                 => $fecha,
                'hora_inicio'           => $horaInicioStr,
                'hora_fin'              => $horaFinStr,
                'duracion_horas'        => $request->duracion_horas,
                'precio_alquiler_total' => $precioTotal, // Guardamos el total final (10.00)
                'monto_comprobante'     => 0,
                'estado'                => 'confirmada',
                'facturas_id'           => null,
            ]);

            // B. Crear la Factura con los datos DESGLOSADOS
            // <--- AQUÍ USAMOS LOS DATOS DEL CALCULO INVERSO
            $factura = Factura::create([
                'reservas_id'   => $reserva->id,
                'fecha_emision' => now(),
                'subtotal'      => $desglose['base'],     // Guardamos 8.70
                'impuestos'     => $desglose['impuesto'], // Guardamos 1.30
                'total'         => $precioTotal,          // Guardamos 10.00
                'metodo'        => 'efectivo',
                'pago'          => 'pendiente',
            ]);

            // C. Actualizar la Reserva
            $reserva->update(['facturas_id' => $factura->id]);

            DB::commit();

            return redirect()->route('canchas.index')->with('success', 'Reserva realizada con éxito.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al procesar la reserva: ' . $e->getMessage()]);
        }
    }

    // <--- ESTA ES LA FUNCIÓN QUE HACE LA MAGIA MATEMÁTICA
    public function calcularDesglosePrecio($precioTotal, $porcentajeImpuesto = 15)
    {
        // 1. Factor (1.15)
        $factor = 1 + ($porcentajeImpuesto / 100);

        // 2. Precio Base (10 / 1.15 = 8.695... -> 8.70)
        $precioBase = round($precioTotal / $factor, 2);

        // 3. Impuesto (10 - 8.70 = 1.30)
        $montoImpuesto = round($precioTotal - $precioBase, 2);

        return [
            'base'     => $precioBase,
            'impuesto' => $montoImpuesto,
            'total'    => $precioTotal
        ];
    }
}