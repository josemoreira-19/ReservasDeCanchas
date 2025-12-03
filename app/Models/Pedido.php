<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $table = 'pedidos_tienda';
    use HasFactoty;

    protected $fiallable = [
        'reservas_id',
        'fecha_pedido',
        'estado'
    ];

     public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'reservas_id');
    }

    public function detalles()
    {
        return $this->hasMany(DetallePedidoTienda::class, 'pedidos_id');
    }
}
