<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Factura #{{ $factura->id }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; }
        .header { width: 100%; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #333; }
        .info-empresa { text-align: right; float: right; }
        
        .details-box { width: 100%; margin-bottom: 30px; }
        .details-left { float: left; width: 50%; }
        .details-right { float: right; width: 40%; text-align: right; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f2f2f2; border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
        td { border-bottom: 1px solid #eee; padding: 10px; }
        
        .totals { width: 100%; margin-top: 30px; text-align: right; }
        .totals-row { margin-bottom: 5px; }
        .total-final { font-size: 18px; font-weight: bold; color: #2563eb; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
        
        /* Utilidad para limpiar floats */
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
</head>
<body>

    <div class="header clearfix">
        <div class="info-empresa">
            <strong>Canchas Llaverito</strong><br>
            RUC: 123456789001<br>
            Dirección: Calle Principal S/N<br>
            Tel: 099-999-9999
        </div>
        <div class="logo">
            FACTURA
        </div>
    </div>

    <div class="details-box clearfix">
        <div class="details-left">
            <strong>Cliente:</strong><br>
            {{ $reserva->user->name }}<br>
            Email: {{ $reserva->user->email }}
        </div>
        <div class="details-right">
            <strong>Nro. Factura:</strong> #{{ str_pad($factura->id, 6, '0', STR_PAD_LEFT) }}<br>
            <strong>Fecha Emisión:</strong> {{ $factura->fecha_emision }}<br>
            <strong>Estado:</strong> {{ strtoupper($factura->pago) }}
        </div>
    </div>

    <h3>Detalle del Servicio</h3>
    <table>
        <thead>
            <tr>
                <th>Descripción</th>
                <th>Fecha Reserva</th>
                <th>Horario</th>
                <th>Precio</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Alquiler de Cancha: {{ $reserva->cancha->nombre }} ({{ $reserva->cancha->tipo }})</td>
                <td>{{ $reserva->fecha }}</td>
                <td>{{ substr($reserva->hora_inicio, 0, 5) }} - {{ substr($reserva->hora_fin, 0, 5) }}</td>
                <td>${{ $factura->total }}</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">Subtotal: ${{ $factura->subtotal }}</div>
        <div class="totals-row">IVA (15%): ${{ $factura->impuestos }}</div>
        <div class="totals-row total-final">Total: ${{ $factura->total }}</div>
    </div>

    <div class="footer">
        Gracias por su preferencia. Documento generado electrónicamente.
    </div>

</body>
</html>