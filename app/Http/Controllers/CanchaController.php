<?php

namespace App\Http\Controllers;

use App\Models\Cancha;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage; // Importante para borrar si quisieras

class CanchaController extends Controller
{
    public function index()
    {
        // Traemos las imágenes con la cancha
        $canchas = Cancha::with(['images' => function($query) {
            $query->orderBy('orden', 'asc');
        }])->get();        

        return Inertia::render('Canchas/Index', [
            'canchas' => $canchas,
            'isAdmin' => auth()->check() && auth()->user()->role === 'admin'
        ]);
    }

    // GUARDAR
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'tipo' => 'required|string|max:50',
            'precio_por_hora' => 'required|numeric|min:0',
            'precio_fin_de_semana' => 'required|numeric|min:0', 
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120' // Aumenté un poco el tamaño a 5MB
        ]);

        // 1. Crear la cancha (quitando el array de imágenes para que no de error SQL)
        $cancha = Cancha::create($request->except('imagenes'));

        // 2. Subir las imágenes
        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $imagen) {
                $path = $imagen->store('canchas', 'public'); 
                
                $cancha->images()->create([
                    'ruta' => $path
                ]);
            }
        }

        return redirect()->back()->with('success', 'Cancha creada con imágenes.');
    }

    // ACTUALIZAR
    public function update(Request $request, Cancha $cancha)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'tipo' => 'required|string|max:50',
            'precio_por_hora' => 'required|numeric|min:0',
            'precio_fin_de_semana' => 'required|numeric|min:0',
            'imagenes.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            // Validamos los arrays de gestión de imágenes
            'imagenes_eliminar' => 'nullable|array',
            'imagenes_orden' => 'nullable|array', // Recibiremos [{id: 1, orden: 0}, {id: 3, orden: 1}]
        ]);

        // 1. Actualizar info básica
        $cancha->update($request->except(['imagenes', 'imagenes_eliminar', 'imagenes_orden', '_method']));

        // 2. ELIMINAR IMÁGENES MARCADAS
        if ($request->has('imagenes_eliminar')) {
            $idsParaBorrar = $request->imagenes_eliminar;
            // Buscamos las imágenes para borrar también el archivo físico
            $imagenes = \App\Models\CanchaImage::whereIn('id', $idsParaBorrar)->get();
            
            foreach ($imagenes as $img) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($img->ruta);
                $img->delete();
            }
        }

        // 3. ACTUALIZAR ORDEN (De las que quedaron)
        if ($request->has('imagenes_orden')) {
            foreach ($request->imagenes_orden as $item) {
                // Actualizamos el orden de cada ID recibido
                \App\Models\CanchaImage::where('id', $item['id'])->update(['orden' => $item['orden']]);
            }
        }

        // 4. SUBIR NUEVAS IMÁGENES
        if ($request->hasFile('imagenes')) {
            // Obtenemos el último orden para agregar las nuevas al final
            $ultimoOrden = $cancha->images()->max('orden') ?? 0;

            foreach ($request->file('imagenes') as $index => $imagen) {
                $path = $imagen->store('canchas', 'public'); 
                
                $cancha->images()->create([
                    'ruta' => $path,
                    'orden' => $ultimoOrden + $index + 1
                ]);
            }
        }

        return redirect()->back()->with('success', 'Cancha actualizada.');
    }

    // ELIMINAR
    public function destroy(Cancha $cancha)
    {
        if ($cancha->reservas()->where('fecha', '>=', now()->toDateString())->exists()) {
            return back()->with('error', 'No puedes eliminar esta cancha porque tiene reservas pendientes.');
        }

        // Opcional: Borrar las imágenes del servidor al eliminar la cancha
        foreach($cancha->images as $img){
            Storage::disk('public')->delete($img->ruta);
        }

        $cancha->delete();
        return back()->with('success', 'Cancha eliminada.');
    }
}