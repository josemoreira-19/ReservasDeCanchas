<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Rules\CedulaEcuatoriana; // Usamos tu regla nueva

class UserController extends Controller
{
    // 1. LISTAR Y BUSCAR
    public function index(Request $request)
    {
        // Recuperamos el término de búsqueda (si existe)
        $search = $request->input('search');

        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('cedula', 'like', "%{$search}%"); // <--- Aquí busca por cédula
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10) // Paginación de 10 en 10
            ->withQueryString(); // Mantiene la búsqueda al cambiar de página

        return Inertia::render('Usuarios/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    // 2. GUARDAR NUEVO USUARIO (Admin crea usuario)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'cedula' => ['required', 'string', 'unique:users', new CedulaEcuatoriana],
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,client', // Validamos el enum exacto
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

    // 3. ACTUALIZAR USUARIO
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            // Ignoramos la cédula y email del propio usuario al validar unique
            'cedula' => ['required', 'string', Rule::unique('users')->ignore($user->id), new CedulaEcuatoriana],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:admin,client',
        ]);

        $datos = [
            'name' => $request->name,
            'cedula' => $request->cedula,
            'email' => $request->email,
            'role' => $request->role,
        ];

        // Solo actualizamos password si escribieron algo nuevo
        if ($request->filled('password')) {
            $datos['password'] = bcrypt($request->password);
        }

        $user->update($datos);

        return redirect()->back()->with('success', 'Usuario actualizado correctamente.');
    }

    // 4. ELIMINAR
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminarte a ti mismo.');
        }
        
        // Opcional: Validar si tiene reservas pendientes antes de borrar
        
        $user->delete();
        return back()->with('success', 'Usuario eliminado.');
    }

    // API para buscar usuarios por Cédula o Nombre (Para el buscador del Admin)
    public function apiBuscar(Request $request)
    {
        $query = $request->get('q');
        
        if (!$query) {
            return response()->json([]);
        }

        $usuarios = User::where('role', 'client') // Solo buscamos clientes, no otros admins
            ->where(function($q) use ($query) {
                $q->where('cedula', 'like', "%{$query}%")
                ->orWhere('name', 'like', "%{$query}%");
            })
            ->limit(5) // Solo los 5 primeros para no saturar
            ->get(['id', 'name', 'cedula', 'email']);

        return response()->json($usuarios);
    }
}