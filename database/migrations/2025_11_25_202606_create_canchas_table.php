<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('canchas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->enum('tipo', ['futbol', 'voley', 'basked', 'indor', 'tenis'])->default('futbol');
            $table->decimal('precio_por_hora', 8, 2);
            $table->enum('estado', ['disponible', 'ocupada', 'mantenimiento'])->default('disponible');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('canchas');
    }
};
