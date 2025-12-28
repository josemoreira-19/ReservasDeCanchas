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
}