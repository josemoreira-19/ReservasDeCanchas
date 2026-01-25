<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Comprobante extends Model
{

    use HasFactory;

    protected $fillable = [
        'factura_id',
        'ruta_archivo',
        'nombre_original',
        'tipo_mime',
    ];

    public function comprobantes()
    {
        return $this->hasMany(Comprobante::class);
    }
}
