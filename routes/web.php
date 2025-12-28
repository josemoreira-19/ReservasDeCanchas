<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CanchaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\FacturaController;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/', function () {
    return view('inicio');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // =============== rutas de perfil =================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/facturas/{reserva}/pago', [FacturaController::class, 'pago'])->name('facturas.pago');

    // ============== consultar disponibilidad =================
    Route::get('/api/canchas/{cancha}/disponibilidad', [App\Http\Controllers\ReservaController::class, 'consultarDisponibilidad'])->name('api.canchas.disponibilidad');


    // =============== rutas de Canchas =================
    Route::get('/canchas', [CanchaController::class, 'index'])->name('canchas.index');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('reservas.store');


    // RUTAS SOLO PARA ADMINS
    Route::middleware(['auth', 'can:manage-canchas'])->group(function () {
        Route::post('/canchas', [CanchaController::class, 'store'])->name('canchas.store');
        Route::put('/canchas/{cancha}', [CanchaController::class, 'update'])->name('canchas.update');
        Route::delete('/canchas/{cancha}', [CanchaController::class, 'destroy'])->name('canchas.destroy');
    });


});


require __DIR__.'/auth.php';
