<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Factura_Items extends Model
{
    use HasFactory;

    protected $table = 'facturas_items';

    protected $fillable = [
        'factura_id',
        'concepto',
        'cantidad',
        'precio_unitario',
        'subtotal_item'
    ];

      public function factura()
    {
        return $this->belongsTo(Factura::class);
    }
}

