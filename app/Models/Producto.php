<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    use HasFactoty;

    protected $fiallable =[
        'codigo_qr',
        'nombre',
        'precio_unitario',
        'stock'
    ];

      public function detalles()
    {
        return $this->hasMany(DetallePedidoTienda::class, 'productos_id');
    }
}
