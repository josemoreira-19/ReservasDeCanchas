<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Database\Eloquent\Model;

class Cancha extends Model
{
        use HasFactory;

    protected $fillable = [
        'nombre',
        'tipo',
        'precio_por_hora',
        'precio_fin_de_semana',
        'estado',
    ];

    public function reservas()
        {
            return $this->hasMany(Reserva::class);
        }

    public function images()
    {
        return $this->hasMany(CanchaImage::class);
    }
}
