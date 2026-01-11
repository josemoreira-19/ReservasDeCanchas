<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Reserva extends Model
{

    use HasFactory;
    protected $table ='reservas';


    protected $fillable =[
        'user_id',
        'duracion_horas',
        'precio_alquiler_total',
        'monto_comprobante',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'estado',
        'cancha_id',
        'facturas_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function cancha()
    {
        return $this->belongsTo(Cancha::class);
    }   

    // public function factura()
    // {
    //     return $this->belongsTo(factura::class);
    // }   
    public function factura()
    {
        return $this->belongsTo(Factura::class, 'facturas_id');
    }

    public function scopeEstado($query, $estado)
    {
        if ($estado) {
            return $query->where('estado', $estado);
        }
    }   

    public function scopeFecha($query, $fecha)
    {
        if ($fecha) {
            return $query->where('fecha', $fecha);
        }
    }
}
