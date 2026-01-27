<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Factura;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use App\Models\Comprobante; 
use Illuminate\Support\Facades\Storage;

class FacturaController extends Controller
{
    public function pago($reserva_id)
    {
        //Buscamos la reserva y cargamos su factura y la cancha
        $reserva = Reserva::with(['factura', 'cancha', 'user'])->findOrFail($reserva_id);

        //Seguridad: Solo el dueño o el admin pueden ver esto
        if (auth()->id() !== $reserva->user_id && auth()->user()->role !== 'admin') {
            abort(403, 'No tienes permiso para ver esta factura.');
        }

        //Definir métodos de pago según el ROL
        $metodosPago = [];
        
        // Todos pueden usar transferencia o tarjeta 
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
        //Calcular saldo
        $saldoPendiente = $reserva->precio_alquiler_total - $reserva->monto_comprobante;

        //VALIDACIÓN SEGURA
        $request->validate([
            'metodo' => 'required',
            //la validación del archivo
            'comprobante' => 'nullable|image|max:5120', 
            'monto'  => 'required|numeric|min:0.01|lte:' . $saldoPendiente
        ], [
            'monto.lte' => 'El monto supera la deuda pendiente ($' . number_format($saldoPendiente, 2) . ').',
            'monto.min' => 'El monto debe ser mayor a 0.',
            'comprobante.image' => 'El archivo debe ser una imagen (jpg, png, etc).',
            'comprobante.max' => 'La imagen no debe pesar más de 5MB.'
        ]);

        $montoAbonado = $request->monto;

        // --- REGLA DEL 50% ---
        $nuevoMonto = $reserva->monto_comprobante + $montoAbonado;
        $mitad = $reserva->precio_alquiler_total / 2;

        if ($reserva->estado === 'pendiente' && $nuevoMonto < ($mitad - 0.01)) { 
            return back()->withErrors([
                'monto' => 'El abono inicial debe cubrir el 50% ($' . number_format($mitad, 2) . ').'
            ]);
        }

        //ACTUALIZAR RESERVA
        $datosActualizar = ['monto_comprobante' => $nuevoMonto];

        if ($nuevoMonto >= ($reserva->precio_alquiler_total - 0.01)) {
            $datosActualizar['estado'] = 'confirmada';
        } else {
            
            $datosActualizar['estado'] = 'pendiente';
        }

        $reserva->update($datosActualizar);

        if ($request->hasFile('comprobante')) {
            $archivo = $request->file('comprobante');
            
            // Guardamos en la carpeta 
            $ruta = $archivo->store('comprobantes', 'public');

            // Creamos el registro en la base de datos
            Comprobante::create([
                'factura_id' => $reserva->factura->id,
                'ruta_archivo' => $ruta,
                'nombre_original' => $archivo->getClientOriginalName(),
                'tipo_mime' => $archivo->getMimeType(),
            ]);
        }
        // ----------------------------------------------

        //ACTUALIZAR FACTURA
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
        
        // 2. Seguridad
        if (auth()->id() !== $reserva->user_id && auth()->user()->role !== 'admin') {
            abort(403);
        }
        
        // 3. Validar factura
        if (!$reserva->factura) {
            return back()->with('error', 'Esta reserva no tiene factura generada.');
        }

        $factura = $reserva->factura;

        // --- 4. GENERACIÓN DEL QR ---
        try {
            // Datos JSON
            $dataQR = json_encode([
                'id'  => $factura->id,
                'uid' => $factura->codigo_unico ?? 'legacy-' . $factura->id 
            ]);

            // Configuración BaconQrCode
            $renderer = new ImageRenderer(
                new RendererStyle(150),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            
            // Generamos el string y lo convertimos a BASE64
            $qrString = $writer->writeString($dataQR);
            $qrCode = base64_encode($qrString);

        } catch (\Exception $e) {
            $qrCode = null;
        }

        // 5. Generar PDF
        $pdf = Pdf::loadView('pdf.factura', compact('reserva', 'factura', 'qrCode'));

        return $pdf->stream('factura-' . $reserva->id . '.pdf');
    }    
}