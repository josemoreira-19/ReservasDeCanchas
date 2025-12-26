<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Database\Eloquent\Model;

class Factura extends Model
{
    protected $table = 'facturas';
    use HasFactory;

    protected $fillable = [
        'reservas_id',
        'fecha_emision',
        'subtotal',
        'impuestos',
        'total',
        'metodo',
        'pago'
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'reservas_id');
    }

    public function items()
    {
        return $this->hasMany(FacturaItem::class);
    }
}
