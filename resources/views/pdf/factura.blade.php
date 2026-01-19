<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura #{{ $factura->id }}</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.4; }
        
        /* --- TU ENCABEZADO PERSONALIZADO --- */
        .header { width: 100%; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
        .info-empresa { float: left; width: 60%; font-size: 14px; }
        .logo { float: right; width: 35%; text-align: right; font-weight: bold; color: #4F46E5; font-size: 18px; padding-top: 10px; }
        
        /* Limpiar flotados para que no se monten las capas */
        .clearfix:after { content: ""; display: table; clear: both; }

        /* --- RESTO DEL DISEÑO --- */
        .info-box { width: 100%; margin-bottom: 20px; clear: both; }
        .info-box td { vertical-align: top; width: 50%; }
        
        .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .details-table th { background: #f3f4f6; padding: 10px; text-align: left; border-bottom: 1px solid #ccc; font-size: 12px; text-transform: uppercase; }
        .details-table td { padding: 10px; border-bottom: 1px solid #eee; }
        
        .totals { margin-top: 20px; text-align: right; }
        .totals table { margin-left: auto; width: 40%; }
        .totals td { padding: 5px; }
        .totals .grand-total { font-size: 16px; font-weight: bold; color: #4F46E5; border-top: 1px solid #ccc; padding-top: 5px; }
        
        .status { text-align: center; margin-top: 50px; font-size: 12px; color: #666; border-top: 1px dashed #ccc; padding-top: 10px; }
        
        .sello {
            position: absolute; top: 180px; right: 60px; border: 3px solid #10B981; 
            color: #10B981; padding: 10px 20px; font-size: 20px; font-weight: bold; 
            transform: rotate(-15deg); opacity: 0.8; border-radius: 10px; z-index: -1;
        }
    </style>
</head>
<body>

    <div class="header clearfix">
        <div class="info-empresa">
            <strong style="font-size: 18px;">Canchas Llaverito</strong><br>
            RUC: 1314592385001<br>
            Chone, Manabí<br>
            Tel: 098-352-6285
        </div>
        <div class="logo">
            FACTURA ELECTRÓNICA
        </div>
    </div>

    @if($factura->pago == 'pagado')
        <div class="sello">PAGADO</div>
    @endif

    <table class="info-box">
        <tr>
            <td>
                <strong style="color: #4F46E5; text-transform: uppercase;">Cliente</strong><br>
                <strong>Nombre:</strong> {{ $reserva->user->name }}<br>
                {{-- AQUÍ ESTÁ LA CÉDULA QUE PEDISTE --}}
                <strong>Cédula/RUC:</strong> {{ $reserva->user->cedula ?? 'Consumidor Final' }}<br>
                <strong>Email:</strong> {{ $reserva->user->email }}
            </td>
            <td style="text-align: right;">
                <strong style="color: #4F46E5; text-transform: uppercase;">Detalles</strong><br>
                <strong>Nº Factura:</strong> {{ str_pad($factura->id, 6, '0', STR_PAD_LEFT) }}<br>
                <strong>Fecha Emisión:</strong> {{ $factura->fecha_emision }}<br>
                <strong>Estado:</strong> {{ strtoupper($factura->pago) }}
            </td>
        </tr>
    </table>

    <table class="details-table">
        <thead>
            <tr>
                <th style="width: 50%;">Descripción</th>
                <th style="text-align: center;">Horas</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>Alquiler: {{ $reserva->cancha->nombre }}</strong><br>
                    <span style="font-size: 12px; color: #666;">
                        {{ ucfirst($reserva->cancha->tipo) }} | {{ $reserva->fecha }}<br>
                        Horario: {{ substr($reserva->hora_inicio, 0, 5) }} - {{ substr($reserva->hora_fin, 0, 5) }}
                    </span>
                </td>
                <td style="text-align: center;">{{ $reserva->duracion_horas }}</td>
                <td style="text-align: right;">$ {{ number_format($reserva->precio_alquiler_total / $reserva->duracion_horas, 2) }} </td>
                <td style="text-align: right;">$ {{ number_format($reserva->precio_alquiler_total, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">$ {{ $factura->subtotal }}</td>
            </tr>
            <tr>
                <td>IVA (15%):</td>
                <td style="text-align: right;">$ {{ $factura->impuestos }}</td>
            </tr>
            <tr>
                <td class="grand-total">TOTAL A PAGAR:</td>
                <td class="grand-total" style="text-align: right;">$ {{ $factura->total }}</td>
            </tr>
            <!-- <tr>
                <td>Monto Abonado:</td>
                <td style="text-align: right; color: green;">$ {{ $reserva->monto_comprobante }}</td>
            </tr> -->
        </table>
        <div style="text-align: center; margin-top: 20px;">
            @if(isset($qrCode))
                <p style="font-size: 10px; color: #555; margin-bottom: 5px;">Escanea para validar autenticidad</p>
                
                {{-- CAMBIO CLAVE: Usamos una etiqueta IMG con data URI --}}
                <img src="data:image/svg+xml;base64,{{ $qrCode }}" alt="QR Code" style="width: 150px; height: 150px;">
                
            @else
                <p style="color: red; font-size: 10px;">Error al generar código de seguridad</p>
            @endif
        </div>
    <div class="status">
        Gracias por su preferencia. ¡Disfrute su partido!<br>
        Documento generado electrónicamente.
    </div>

</body>
</html>