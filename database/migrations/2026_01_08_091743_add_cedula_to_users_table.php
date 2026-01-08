<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // La ponemos nullable al inicio para no romper usuarios existentes (como tu admin actual)
            // unique() para que no haya dos usuarios con la misma cédula
            $table->string('cedula', 15)->nullable()->unique()->after('name');
            
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['cedula', 'role']);
        });
    }
};
