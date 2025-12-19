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
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // $table->foreignId('cancha_id')->constrained()->onDelete('cascade');  
            $table->decimal('duracion_horas', 4,2);
            $table->decimal('precio_alquiler_total', 10,2);
            $table->decimal('monto_comprobante', 10,2);
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->enum('estado', ['pendiente', 'confirmada', 'cancelada'])->default('pendiente');
            $table->foreignId('cancha_id')->constrained('canchas')->onDelete('cascade')->nullable();
            $table->foreignId('facturas_id')->constrained('facturas')->onDelete('cascade')->nullable(); // Asegúrate de que facturas exista primero
            $table->timestamps();           
        });


        Schema::table('facturas', function (Blueprint $table) {
            $table->foreign('reservas_id')->references('id')->on('reservas')->onDelete('cascade');
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
