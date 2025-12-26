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
    $canchas = Cancha::all();

    // Esto busca el archivo resources/js/Pages/Canchas/Index.jsx
    return Inertia::render('Canchas/Index', [
        'canchas' => $canchas,
        'auth' => [
            'user' => auth()->user(), // Para saber en React si es admin o cliente
        ]
    ]);
}
    /**
     * Guarda una nueva cancha (Solo Admin).
     */
    public function store(Request $request)
    {
        // 1. VALIDACIÓN: Revisamos que los datos cumplan con tu SQL
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|in:futbol,voley,basked,indor,tenis', // Coincide con tu ENUM
            'precio_por_hora' => 'required|numeric|min:0',
            'estado' => 'required|in:disponible,ocupada,mantenimiento'
        ]);

        // 2. CREACIÓN: Si pasa la validación, se guarda en la DB
        Cancha::create($validated);

        // 3. RESPUESTA: Redirecciona con un mensaje de éxito
        return redirect()->route('canchas.index')->with('message', 'Cancha creada con éxito');
    }

    /**
     * Actualiza la información de una cancha (Solo Admin).
     */
    public function update(Request $request, Cancha $cancha)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|in:futbol,voley,basked,indor,tenis',
            'precio_por_hora' => 'required|numeric|min:0',
            'estado' => 'required|in:disponible,ocupada,mantenimiento'
        ]);

        $cancha->update($validated);

        return redirect()->route('canchas.index');
    }

    /**
     * Elimina una cancha (Solo Admin).
     */
    public function destroy(Cancha $cancha)
    {
        $cancha->delete();

        return redirect()->route('canchas.index')->with('message', 'Cancha eliminada');
    }
}