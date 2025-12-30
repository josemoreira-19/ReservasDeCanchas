<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Factura;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacturaController extends Controller
{
    public function pago($reserva_id)
    {
        // 1. Buscamos la reserva y cargamos su factura y la cancha
        $reserva = Reserva::with(['factura', 'cancha', 'user'])->findOrFail($reserva_id);

        // 2. Seguridad: Solo el dueño o el admin pueden ver esto
        if (auth()->id() !== $reserva->user_id && auth()->user()->role !== 'admin') {
            abort(403, 'No tienes permiso para ver esta factura.');
        }

        // 3. Definir métodos de pago según el ROL
        $metodosPago = [];
        
        // Todos pueden usar transferencia o tarjeta (ejemplo)
        $metodosPago[] = ['id' => 'transferencia', 'nombre' => 'Transferencia Bancaria'];
        $metodosPago[] = ['id' => 'tarjeta', 'nombre' => 'Tarjeta de Crédito/Débito'];

        // SOLO ADMIN puede cobrar en efectivo
        if (auth()->user()->role === 'admin') {
            array_unshift($metodosPago, ['id' => 'efectivo', 'nombre' => 'Efectivo (Caja)']);
        }

        return Inertia::render('Facturas/Pago', [
            'reserva' => $reserva,
            'factura' => $reserva->factura,
            'metodosDisponibles' => $metodosPago
        ]);
    }

    public function procesar(Request $request, Reserva $reserva)
    {
        // 1. Calcular cuánto debe REALMENTE
        $saldoPendiente = $reserva->precio_alquiler_total - $reserva->monto_comprobante;

        // 2. Validaciones estrictas
        $request->validate([
            'metodo' => 'required',
            'monto' => [
                'required',
                'numeric',
                'min:0.01', // No permite 0 ni negativos
                'max:' . $saldoPendiente // No permite pagar más de lo que debe
            ],
            // Si usas el código "confia pelado", no necesitas validarlo aquí si ya lo haces en el front,
            // pero podrías agregar un campo 'codigo' nullable.
        ], [
            'monto.max' => 'El monto ingresado supera la deuda pendiente ($' . number_format($saldoPendiente, 2) . ').',
            'monto.min' => 'El monto debe ser mayor a 0.'
        ]);

        $montoAbonado = $request->monto;

        // 3. ACTUALIZAR RESERVA
        $nuevoMonto = $reserva->monto_comprobante + $montoAbonado;
        
        $datosActualizar = ['monto_comprobante' => $nuevoMonto];

        // Regla del 50% para confirmar
        $mitad = $reserva->precio_alquiler_total / 2;
        if ($reserva->estado === 'pendiente' && $nuevoMonto >= $mitad) {
            $datosActualizar['estado'] = 'confirmada';
        }

        $reserva->update($datosActualizar);

        // 4. ACTUALIZAR FACTURA
        // Si la deuda queda en 0 (o casi 0 por decimales), se marca pagada
        $estaPagada = ($reserva->precio_alquiler_total - $nuevoMonto) <= 0.01;
        
        $reserva->factura->update([
            'pago' => $estaPagada ? 'pagado' : 'pendiente',
            'metodo' => $request->metodo
        ]);

        return redirect()->route('reservas.mis-reservas')->with('success', 'Pago registrado correctamente.');
    }
}