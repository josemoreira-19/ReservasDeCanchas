<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Factura #{{ $factura->id }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #333; }
        .header { width: 100%; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .info-empresa { text-align: right; float: right; }
        
        .details-box { width: 100%; margin-bottom: 30px; }
        .details-left { float: left; width: 50%; }
        .details-right { float: right; width: 40%; text-align: right; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 10px; text-align: left; font-weight: bold; }
        td { border-bottom: 1px solid #eee; padding: 10px; }
        
        .totals { width: 100%; margin-top: 30px; text-align: right; }
        .totals-row { margin-bottom: 5px; }
        .total-final { font-size: 18px; font-weight: bold; color: #2563eb; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
</head>
<body>

    <div class="header clearfix">
        <div class="info-empresa">
            <strong>Canchas Llaverito</strong><br>
            RUC: 123456789001<br>
            Chone, Manabí<br>
            Tel: 099-999-9999
        </div>
        <div class="logo">
            FACTURA ELECTRÓNICA
        </div>
    </div>

    <div class="details-box clearfix">
        <div class="details-left">
            <strong>Cliente:</strong><br>
            {{ $reserva->user->name }}<br>
            Email: {{ $reserva->user->email }}
        </div>
        <div class="details-right">
            <strong>Factura Nro:</strong> #{{ str_pad($factura->id, 6, '0', STR_PAD_LEFT) }}<br>
            <strong>Fecha:</strong> {{ $factura->fecha_emision }}<br>
            <strong>Método:</strong> {{ ucfirst($factura->metodo) }}
        </div>
    </div>

    <h3>Detalle del Servicio</h3>
    <table>
        <thead>
            <tr>
                <th>Descripción</th>
                <th>Fecha Reserva</th>
                <th>Horario</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Alquiler: {{ $reserva->cancha->nombre }}</td>
                <td>{{ $reserva->fecha }}</td>
                <td>{{ substr($reserva->hora_inicio, 0, 5) }} - {{ substr($reserva->hora_fin, 0, 5) }}</td>
                <td>${{ $factura->subtotal }}</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">Subtotal: ${{ $factura->subtotal }}</div>
        <div class="totals-row">IVA (15%): ${{ $factura->impuestos }}</div>
        <div class="totals-row total-final">Total Pagado: ${{ $factura->total }}</div>
    </div>

    <div class="footer">
        Gracias por preferir Canchas Llaverito. Documento generado automáticamente.
    </div>

</body>
</html>