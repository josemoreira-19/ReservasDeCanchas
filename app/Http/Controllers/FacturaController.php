<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Factura;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

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
        // 1. Calcular saldo
        $saldoPendiente = $reserva->precio_alquiler_total - $reserva->monto_comprobante;

        // 2. VALIDACIÓN SEGURA (Sin concatenar strings para evitar errores de comas/puntos)
        $request->validate([
            'metodo' => 'required',
            'monto'  => 'required|numeric|min:0.01|lte:' . $saldoPendiente // Usamos lte (less than or equal)
        ], [
            'monto.lte' => 'El monto supera la deuda pendiente ($' . number_format($saldoPendiente, 2) . ').',
            'monto.min' => 'El monto debe ser mayor a 0.'
        ]);

        $montoAbonado = $request->monto;

        // --- REGLA DEL 50% ---
        $nuevoMonto = $reserva->monto_comprobante + $montoAbonado;
        $mitad = $reserva->precio_alquiler_total / 2;

        // Usamos bccomp para comparar flotantes con precisión segura (opcional pero recomendado)
        // O simplemente tu lógica anterior:
        if ($reserva->estado === 'pendiente' && $nuevoMonto < ($mitad - 0.01)) { // Margen de 1 centavo
            return back()->withErrors([
                'monto' => 'El abono inicial debe cubrir el 50% ($' . number_format($mitad, 2) . ').'
            ]);
        }

        // 3. ACTUALIZAR RESERVA
        $datosActualizar = ['monto_comprobante' => $nuevoMonto];

        if ($reserva->estado === 'pendiente' && $nuevoMonto >= ($mitad - 0.01)) {
            $datosActualizar['estado'] = 'confirmada';
        }

        $reserva->update($datosActualizar);

        // 4. ACTUALIZAR FACTURA
        $estaPagada = ($reserva->precio_alquiler_total - $nuevoMonto) <= 0.01;
        
        $reserva->factura->update([
            'pago' => $estaPagada ? 'pagado' : 'pendiente',
            'metodo' => $request->metodo
        ]);

        return redirect()->route('reservas.mis-reservas')->with('success', 'Pago registrado correctamente.');
    }

    public function descargarPDF($reserva_id)
    {
        // 1. Buscar datos
        $reserva = Reserva::with(['factura', 'cancha', 'user'])->findOrFail($reserva_id);
        
        // 2. Seguridad: Solo el dueño o admin
        if (auth()->id() !== $reserva->user_id && auth()->user()->role !== 'admin') {
            abort(403);
        }
        
        // 3. Validar si tiene factura
        if (!$reserva->factura) {
            return back()->with('error', 'Esta reserva no tiene factura generada.');
        }

        $factura = $reserva->factura;

        // 4. Generar PDF
        $pdf = Pdf::loadView('pdf.factura', compact('reserva', 'factura'));

        // 5. Descargar (stream abre en navegador)
        return $pdf->stream('factura-' . $reserva->id . '.pdf');
    }
}