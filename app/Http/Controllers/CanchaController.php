<?php

namespace App\Http\Controllers;

use App\Models\Cancha;
use Illuminate\Http\Request;
use Inertia\Inertia; // Necesario para React

class CanchaController extends Controller
{
    /**
     * Muestra la lista de canchas.
     * Sirve tanto para Admin como para Cliente.
     */
    public function index()
    {
        $canchas = Cancha::all(); // O Cancha::where('estado', 'activa')->get() para clientes

        return Inertia::render('Canchas/Index', [
            'canchas' => $canchas,
            // Pasamos un prop extra para saber si es admin desde React facilito
            'isAdmin' => auth()->check() && auth()->user()->role === 'admin'
        ]);
    }

    // GUARDAR (Solo Admin)
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'tipo' => 'required|string|max:50',
            'precio_por_hora' => 'required|numeric|min:0',
            // AÑADIDO: Validación para el precio de fin de semana
            'precio_fin_de_semana' => 'required|numeric|min:0', 
        ]);

        Cancha::create($request->all());

        return redirect()->back()->with('success', 'Cancha creada correctamente.');
    }

    // ACTUALIZAR (Solo Admin)
    public function update(Request $request, Cancha $cancha)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'tipo' => 'required|string|max:50',
            'precio_por_hora' => 'required|numeric|min:0',
            // AÑADIDO: Validación para el precio de fin de semana
            'precio_fin_de_semana' => 'required|numeric|min:0',
        ]);

        $cancha->update($request->all());

        return redirect()->back()->with('success', 'Cancha actualizada.');
    }

    // ELIMINAR (Solo Admin)
    public function destroy(Cancha $cancha)
    {
        // Validación de seguridad: No borrar si tiene reservas futuras
        if ($cancha->reservas()->where('fecha', '>=', now()->toDateString())->exists()) {
            return back()->with('error', 'No puedes eliminar esta cancha porque tiene reservas pendientes.');
        }

        $cancha->delete();
        return back()->with('success', 'Cancha eliminada.');
    }
}