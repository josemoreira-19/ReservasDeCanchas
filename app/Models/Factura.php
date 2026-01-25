<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Database\Eloquent\Model;
use App\Models\Comprobante;

class Factura extends Model
{
    use HasFactory;
    protected $table = 'facturas';

    protected $fillable = [
        'reservas_id',
        'fecha_emision',
        'subtotal',
        'impuestos',
        'total',
        'metodo',
        'pago',
        'codigo_unico'
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'reservas_id');
    }

    public function items()
    {
        return $this->hasMany(FacturaItem::class);
    }

    public function comprobantes()
    {
        return $this->hasMany(Comprobante::class);
    }

}
