<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Database\Eloquent\Model;

class Detalle_Tienda extends Model
{
    protected $table = 'detalle_pedido_tienda';
    use HasFactoty;

    protected $fiallable =[
        'pedidos_id',
        'productos_id',
        'cantidad'
    ];
     public function pedido()
    {
        return $this->belongsTo(PedidoTienda::class, 'pedidos_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'productos_id');
    }
}
