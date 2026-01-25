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
    Schema::create('comprobantes', function (Blueprint $table) {
        $table->id();
        $table->foreignId('factura_id')->constrained('facturas')->onDelete('cascade');
        $table->string('ruta_archivo'); // Aquí guardaremos "comprobantes/foto.jpg"
        $table->string('nombre_original')->nullable();
        $table->string('tipo_mime')->nullable(); // image/jpeg, image/png
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comprobantes');
    }
};
