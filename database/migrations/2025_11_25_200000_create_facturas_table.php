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
        Schema::create('facturas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservas_id')->nullable();
            $table->date('fecha_emision');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('impuestos', 10, 2);  
            $table->decimal('total', 10, 2);
            $table->enum('metodo', ['efectivo', 'transferencia', 'tarjeta'])->default('efectivo');
            $table->enum('pago', ['pendiente', 'pagado'])->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};

