import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal'; // Asegúrate de tener este componente
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function Index({ auth, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState(null); // null = creando, objeto = editando

    // FORMULARIO (usamos useForm de Inertia)
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        cedula: '',
        email: '',
        password: '',
        role: 'client',
    });

    // BUSCADOR (Efecto Debounce: espera a que termines de escribir)
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        // Hacemos la petición GET al index con el parámetro search
        router.get(route('usuarios.index'), { search: value }, {
            preserveState: true,
            replace: true, // No llena el historial del navegador
        });
    };

    // ABRIR MODAL
const abrirModal = (usuario = null) => {
        clearErrors();
        if (usuario) {
            // --- MODO EDITAR ---
            setUsuarioEditar(usuario);
            setData({
                name: usuario.name,
                cedula: usuario.cedula || '',
                email: usuario.email,
                password: '', 
                role: usuario.role,
            });
        } else {
            // --- MODO CREAR (AQUÍ ESTÁ LA SOLUCIÓN) ---
            setUsuarioEditar(null);
            
            // Forzamos la limpieza manual de todos los campos
            setData({
                name: '',
                cedula: '',
                email: '',
                password: '',
                role: 'client',
            });
        }
        setModalAbierto(true);
    };

    // GUARDAR (Submit)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (usuarioEditar) {
            put(route('usuarios.update', usuarioEditar.id), {
                onSuccess: () => setModalAbierto(false)
            });
        } else {
            post(route('usuarios.store'), {
                onSuccess: () => setModalAbierto(false)
            });
        }
    };

    const eliminarUsuario = (usuario) => {
        if(confirm('¿Estás seguro? Se borrarán sus reservas asociadas.')) {
            router.delete(route('usuarios.destroy', usuario.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Usuarios" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* BARRA SUPERIOR */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full max-w-md">
                            <input 
                                type="text"
                                placeholder="Buscar por cédula, nombre o email..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">
                                <img src="/images/lupa.png" alt="buscar" style={{ width: '16px', height: '16px' }} />
                            </span>
                        </div>
                        <button 
                            onClick={() => abrirModal(null)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold shadow"
                        >
                            + Nuevo Usuario
                        </button>
                    </div>

                    {/* TABLA */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.cedula || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => abrirModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                            <button onClick={() => eliminarUsuario(user)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No se encontraron usuarios.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN SIMPLE */}
                    <div className="mt-4 flex justify-center gap-2">
                        {users.links.map((link, k) => (
                            <button
                                key={k}
                                onClick={() => link.url && router.get(link.url, { search }, { preserveState: true })}
                                disabled={!link.url || link.active}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 border rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            <Modal show={modalAbierto} onClose={() => setModalAbierto(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {usuarioEditar ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel value="Nombre Completo" />
                            <TextInput 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="w-full mt-1" 
                                required 
                                maxLength={70}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <InputLabel value="Cédula" />
                                <TextInput 
                                    value={data.cedula} 
                                    onChange={e => setData('cedula', e.target.value.replace(/\D/g, ''))} 
                                    className="w-full mt-1" 
                                    required 
                                    maxLength={10}
                                    type="text"
                                    inputMode="numeric"
                                /> 
                                <InputError message={errors.cedula} />
                        </div>

                        <div>
                            <InputLabel value="Email" />
                            <TextInput 
                                type="email"
                                value={data.email} 
                                onChange={e => setData('email', e.target.value)} 
                                className="w-full mt-1" 
                                required
                                maxLength={100}
                            />
                            <InputError message={errors.email} />
                        </div>

                            <div>
                                <InputLabel value={usuarioEditar ? "Nueva Contraseña (Dejar vacío para mantener)" : "Contraseña"} />
                                <TextInput 
                                    type="password"
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    className="w-full mt-1" 
                                    // Si NO estamos editando (es nuevo), es requerido. Si editamos, es opcional.
                                    required={!usuarioEditar} 
                                    placeholder={usuarioEditar ? "********" : ""}
                                />
                                <InputError message={errors.password} />
                            </div>

                        <div>
                            <InputLabel value="Rol" />
                            <select 
                                value={data.role} 
                                onChange={e => setData('role', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="client">Cliente</option>
                                <option value="admin">Administrador</option>
                            </select>
                            <InputError message={errors.role} />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setModalAbierto(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Guardando...' : 'Guardar Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}