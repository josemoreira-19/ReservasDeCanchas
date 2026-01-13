<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Factura;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/verificar-factura', function (Request $request) {
    // Si App Inventor manda el JSON crudo en el body
    $data = $request->json()->all();

// Si el QR escaneado es {"id": 1, "uid": "..."}
    $id = $data['id'] ?? null;
    $uidRecibido = $data['uid'] ?? null;

    // 2. Buscamos la factura
    $factura = Factura::with(['reserva.user', 'reserva.cancha'])->find($id);

    // 3. Validaciones
    if (!$factura) {
        return response()->json([
            'status' => 'error',
            'mensaje' => '❌ FACTURA NO ENCONTRADA'
        ], 404);
    }

    // Comparamos el código único (hash)
    if ($factura->codigo_unico !== $uidRecibido) {
        return response()->json([
            'status' => 'error',
            'mensaje' => '⚠️ CÓDIGO QR ADULTERADO O FALSO'
        ], 403);
    }

    // 4. Verificar estado de pago
    if ($factura->pago === 'pagado') {
        return response()->json([
            'status' => 'success',
            'mensaje' => '✅ COMPROBANTE VÁLIDO Y PAGADO',
            'data' => [
                'cliente' => $factura->reserva->user->name,
                'cancha' => $factura->reserva->cancha->nombre,
                'total' => $factura->total,
                'fecha' => $factura->fecha_emision
            ]
        ], 200);
    } else {
        return response()->json([
            'status' => 'warning',
            'mensaje' => '⚠️ FACTURA REAL PERO PENDIENTE DE PAGO'
        ], 200);
    }
});