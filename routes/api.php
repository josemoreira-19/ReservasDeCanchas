<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Factura;
use Carbon\Carbon;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/verificar-factura', function (Request $request) {
    // 1. VALIDACIÓN DE FORMATO (Para detectar QRs ajenos)
    // Intentamos leer el JSON. Si no es un JSON válido o faltan datos, es un QR de otro lado.
    $data = $request->json()->all();
    
    if (!isset($data['id']) || !isset($data['uid'])) {
        return response()->json([
            'status' => 'error',
            'mensaje' => '⚠️ EL QR ESCANEADO NO PERTENECE AL SISTEMA LLAVERITO'
        ], 400); // 400 = Bad Request
    }

    $id = $data['id'];
    $uidRecibido = $data['uid'];

    // 2. BUSCAR FACTURA
    $factura = Factura::with(['reserva.user', 'reserva.cancha'])->find($id);

    if (!$factura) {
        return response()->json(['status' => 'error', 'mensaje' => '❌ FACTURA NO ENCONTRADA'], 404);
    }

    if ($factura->codigo_unico !== $uidRecibido) {
        return response()->json(['status' => 'error', 'mensaje' => '⚠️ CÓDIGO QR ADULTERADO O FALSO'], 403);
    }

    // 3. CALCULAR ESTADO DEL TIEMPO (Pasado, Curso, Futuro)
    // Combinamos fecha y hora para hacer la matemática
    $inicio = Carbon::parse($factura->reserva->fecha . ' ' . $factura->reserva->hora_inicio);
    $fin = Carbon::parse($factura->reserva->fecha . ' ' . $factura->reserva->hora_fin);
    $ahora = now(); // Asegúrate de que tu config/app.php tenga la timezone correcta ('America/Guayaquil')

    $estadoTiempo = 'futuro'; // Por defecto
    $color = 'verde';

    if ($ahora->gt($fin)) {
        // Si ahora es mayor que el fin -> YA PASÓ
        $estadoTiempo = 'pasado';
        $mensajeExtra = '(RESERVA VENCIDA)';
        $color = 'rojo';
    } elseif ($ahora->between($inicio, $fin)) {
        // Si está entre inicio y fin -> EN CURSO
        $estadoTiempo = 'curso';
        $mensajeExtra = '(EN CURSO AHORA)';
        $color = 'azul';
    } else {
        $mensajeExtra = '(RESERVA FUTURA)';
    }


    // 4. RESPUESTA FINAL
    if ($factura->pago === 'pagado') {
        return response()->json([
            'status' => 'success',
            'mensaje' => '✅ VÁLIDO ' . $mensajeExtra,
            'color_logico' => $color, // Le decimos a la App qué color usar
            'data' => [
                'cliente' => $factura->reserva->user->name,
                'cancha' => $factura->reserva->cancha->nombre,
                'total'  => $factura->total,
                'fecha' => $factura->reserva->fecha,
                'hora' => substr($factura->reserva->hora_inicio, 0, 5) . ' - ' . substr($factura->reserva->hora_fin, 0, 5)
            ]
        ], 200);
    } else {
        return response()->json([
            'status' => 'warning',
            'mensaje' => '⚠️ PENDIENTE DE PAGO'
        ], 200);
    }
});