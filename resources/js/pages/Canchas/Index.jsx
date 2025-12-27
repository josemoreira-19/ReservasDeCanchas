import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ReservaModal from '@/Components/ReservaModal';
import CalendarioSemanal from '@/Components/CalendarioSemanal'; 

export default function Index({ auth, canchas }) {
    // Estado para el Modal de Formulario (Reserva)
    const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
    
    // Estado para el Modal de Calendario
    const [modalCalendarioAbierto, setModalCalendarioAbierto] = useState(false);
    
    const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
    const [preDatosReserva, setPreDatosReserva] = useState(null); // Datos pre-llenados

    // 1. Abrir Calendario
    const abrirHorarios = (cancha) => {
        setCanchaSeleccionada(cancha);
        setModalCalendarioAbierto(true);
    };

    // 2. Click en una celda "Libre" del calendario
    const iniciarReservaDesdeCalendario = (cancha, fecha, hora) => {
        setPreDatosReserva({ fecha, hora }); // Guardamos lo que seleccionó
        setModalCalendarioAbierto(false);    // Cerramos calendario
        setModalReservaAbierto(true);        // Abrimos formulario final
    };

    const manejarExito = () => {
        router.reload({ only: ['canchas'] });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Canchas" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-4">Listado de Canchas</h1>
                        
                        {/* Tabla de canchas (Igual que antes, solo cambia el botón) */}
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
                                                cancha.estado === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {cancha.estado.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center">
                                            <button 
                                                onClick={() => abrirHorarios(cancha)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition flex items-center justify-center gap-2 mx-auto"
                                                disabled={cancha.estado !== 'disponible'}
                                            >
                                                {/* Icono de calendario SVG */}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Ver Horarios
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL 1: CALENDARIO SEMANAL */}
            <CalendarioSemanal 
                isOpen={modalCalendarioAbierto}
                onClose={() => setModalCalendarioAbierto(false)}
                cancha={canchaSeleccionada}
                onReservarClick={iniciarReservaDesdeCalendario}
            />

            {/* MODAL 2: FORMULARIO DE RESERVA (Modificado para recibir preDatos) */}
            <ReservaModal 
                isOpen={modalReservaAbierto} 
                onClose={() => {
                    setModalReservaAbierto(false);
                    setPreDatosReserva(null); // Limpiar datos al cerrar
                }}
                cancha={canchaSeleccionada}
                onSuccess={manejarExito}
                // Pasa los datos pre-seleccionados al modal si tu componente lo soporta
                initialData={preDatosReserva} 
            />

        </AuthenticatedLayout>
    );
}