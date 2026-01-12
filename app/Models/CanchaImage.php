<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CanchaImage extends Model
{

    use HasFactory;

    protected $fillable = ['cancha_id', 'ruta'];

    public function cancha()
    {
        return $this->belongsTo(Cancha::class);
    }
}
