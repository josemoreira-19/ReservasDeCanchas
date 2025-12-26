import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
// Asegúrate de que la ruta sea correcta. Si lo guardaste en Components, usa:
import ReservaModal from '@/Components/ReservaModal';

export default function Index({ auth, canchas }) {
    // 1. ESTADOS PARA EL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);

    // 2. FUNCIONES DE MANEJO
    const abrirModal = (cancha) => {
        // Opcional: Evitar abrir si está en mantenimiento
        if (cancha.estado === 'mantenimiento') {
            alert('Esta cancha no se puede reservar por mantenimiento.');
            return;
        }
        setCanchaSeleccionada(cancha);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setCanchaSeleccionada(null);
    };

    const manejarExito = () => {
        // Recargar los datos de la página sin refrescar el navegador completo
        router.reload({ only: ['canchas'] });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Canchas" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-4">Listado de Canchas</h1>
                        
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Nombre</th>
                                    <th className="p-2">Tipo</th>
                                    <th className="p-2">Precio/h</th>
                                    <th className="p-2">Estado</th>
                                    <th className="p-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {canchas.map((cancha) => (
                                    <tr key={cancha.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{cancha.nombre}</td>
                                        <td className="p-2 capitalize">{cancha.tipo}</td>
                                        <td className="p-2">${cancha.precio_por_hora}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                cancha.estado === 'disponible' ? 'bg-green-100 text-green-800' : 
                                                cancha.estado === 'ocupada' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {cancha.estado.toUpperCase()}
                                            </span>
                                        </td>
                                        
                                        <td className="p-2 text-center">
                                            {/* Lógica para mostrar botones según rol */}
                                            {auth.user.role === 'admin' ? (
                                                <div>
                                                    <button className="text-blue-600 mr-2 hover:underline">Editar</button>
                                                    <button 
                                                        onClick={() => abrirModal(cancha)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                                                    >
                                                        Reservar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => abrirModal(cancha)}
                                                    className={`px-3 py-1 rounded text-white transition ${
                                                        cancha.estado === 'disponible' 
                                                        ? 'bg-blue-600 hover:bg-blue-700' 
                                                        : 'bg-gray-400 cursor-not-allowed'
                                                    }`}
                                                    disabled={cancha.estado !== 'disponible'}
                                                >
                                                    Reservar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 3. INTEGRACIÓN DEL MODAL */}
            {/* Se coloca fuera del loop, al final del contenido */}
            <ReservaModal 
                isOpen={modalAbierto} 
                onClose={cerrarModal} 
                cancha={canchaSeleccionada}
                onSuccess={manejarExito}
            />

        </AuthenticatedLayout>
    );
}