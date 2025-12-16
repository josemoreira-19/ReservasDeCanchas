<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Database\Eloquent\Model;

class Canchas extends Model
{
    use HasFactory;

protected $fillable = [
    'nombre',
    'tipo',
    'precio_por_hora',
    'estado',
];
public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
