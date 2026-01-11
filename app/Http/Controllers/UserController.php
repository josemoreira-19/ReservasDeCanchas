<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Rules\CedulaEcuatoriana; 

class UserController extends Controller
{
    // 1. LISTAR Y BUSCAR
    public function index(Request $request)
    {
        $search = $request->input('search');

        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('cedula', 'like', "%{$search}%"); 
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Usuarios/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    // 2. GUARDAR
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'cedula' => ['required', 'string', 'unique:users', new CedulaEcuatoriana],
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,client',
        ]);

        User::create([
            'name' => $request->name,
            'cedula' => $request->cedula,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
        ]);

        return redirect()->back()->with('success', 'Usuario creado correctamente.');
    }

    // 3. ACTUALIZAR USUARIO (CORREGIDO "A PRUEBA DE BALAS")
    // Cambiamos 'User $user' por '$id' para evitar problemas de Route Model Binding
    public function update(Request $request, $id)
    {
        // 1. Buscamos el usuario manualmente. Si no existe, lanza error 404.
        $user = User::findOrFail($id);

        // 2. Validación
        $request->validate([
            'name' => 'required|string|max:255',
            
            // Ahora $user->id TIENE QUE TENER UN VALOR, así que el ignore funcionará
            'cedula' => [
                'required', 
                'string', 
                Rule::unique('users')->ignore($user->id), 
                new CedulaEcuatoriana
            ],
            'email' => [
                'required', 
                'email', 
                Rule::unique('users')->ignore($user->id)
            ],
            
            'role' => 'required|in:admin,client',
            'password' => 'nullable|string|min:8', 
        ]);

        $datos = [
            'name' => $request->name,
            'cedula' => $request->cedula,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->filled('password')) {
            $datos['password'] = bcrypt($request->password);
        }

        $user->update($datos);

        return redirect()->back()->with('success', 'Usuario actualizado correctamente.');
    }

    // 4. ELIMINAR
    // Aquí también cambiamos a $id para mantener consistencia y seguridad
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminarte a ti mismo.');
        }
        
        // Verificamos si tiene reservas
        if ($user->reservations()->exists()) {
             return back()->with('error', 'No se puede eliminar porque tiene historial de reservas.');
        }
        
        $user->delete();
        return back()->with('success', 'Usuario eliminado.');
    }

    // API BUSCAR
    public function apiBuscar(Request $request)
    {
        $query = $request->get('q');
        
        if (!$query) {
            return response()->json([]);
        }

        $usuarios = User::where('role', 'client')
            ->where(function($q) use ($query) {
                $q->where('cedula', 'like', "%{$query}%")
                ->orWhere('name', 'like', "%{$query}%");
            })
            ->limit(5) 
            ->get(['id', 'name', 'cedula', 'email']);

        return response()->json($usuarios);
    }
}