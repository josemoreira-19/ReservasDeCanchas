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
        Schema::create('pedidos_tienda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservas_id')->constrained()->onDelete('cascade');
            $table->timestamp('fecha_pedido');
            $table->enum('estado', ['Abierto', 'Cerrado'])->default('Abierto');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos_tienda');
    }
};
