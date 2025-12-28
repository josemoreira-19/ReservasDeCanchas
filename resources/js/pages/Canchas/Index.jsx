import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ReservaModal from '@/Components/ReservaModal';
import CalendarioSemanal from '@/Components/CalendarioSemanal';
import ModalExito from '@/Components/ModalExito'; // <--- 1. IMPORTAR EL NUEVO MODAL

export default function Index({ auth, canchas }) {
    // --- ESTADOS ---
    const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
    const [modalCalendarioAbierto, setModalCalendarioAbierto] = useState(false);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
    const [preDatosReserva, setPreDatosReserva] = useState(null);

    // NUEVOS ESTADOS PARA EL MODAL DE ÉXITO
    const [modalExitoAbierto, setModalExitoAbierto] = useState(false); // <--- 2. ESTADO VISIBILIDAD
    const [idReservaCreada, setIdReservaCreada] = useState(null);      // <--- 3. ESTADO PARA EL ID

    // --- FUNCIONES ---

    const abrirHorarios = (cancha) => {
        setCanchaSeleccionada(cancha);
        setModalCalendarioAbierto(true);
    };

    const iniciarReservaDesdeCalendario = (cancha, fecha, hora) => {
        setPreDatosReserva({ fecha, hora });
        setModalCalendarioAbierto(false);
        setModalReservaAbierto(true);
    };

    // MODIFICAMOS ESTA FUNCIÓN PARA RECIBIR EL ID Y ABRIR EL MODAL DE ÉXITO
    const manejarExito = (nuevoId) => {
        setIdReservaCreada(nuevoId);      // Guardamos el ID que nos manda el formulario
        setModalReservaAbierto(false);    // Cerramos el formulario de reserva
        setModalExitoAbierto(true);       // <--- 4. ABRIMOS EL MODAL DE ÉXITO
        
        // Recargamos la tabla de fondo para que se vea ocupada la cancha
        router.reload({ only: ['canchas'] }); 
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Canchas" />
            
            {/* ... (Toda la parte de la tabla y encabezados que ya tienes igual) ... */}
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-4">Listado de Canchas</h1>
                        <table className="w-full text-left border-collapse">
                            {/* ... (Tu tabla de canchas) ... */}
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

            {/* --- AQUÍ VAN LOS MODALES --- */}

            {/* MODAL 1: CALENDARIO */}
            <CalendarioSemanal 
                isOpen={modalCalendarioAbierto}
                onClose={() => setModalCalendarioAbierto(false)}
                cancha={canchaSeleccionada}
                onReservarClick={iniciarReservaDesdeCalendario}
            />

            {/* MODAL 2: FORMULARIO */}
            <ReservaModal 
                isOpen={modalReservaAbierto} 
                onClose={() => {
                    setModalReservaAbierto(false);
                    setPreDatosReserva(null);
                }}
                cancha={canchaSeleccionada}
                onSuccess={manejarExito} // Aquí pasamos la función modificada
                initialData={preDatosReserva} 
            />

            {/* MODAL 3: ÉXITO (NUEVO) */}
            {/* <--- 5. AQUÍ AGREGAS EL COMPONENTE NUEVO */}
            <ModalExito 
                isOpen={modalExitoAbierto}
                onClose={() => setModalExitoAbierto(false)}
                reservaId={idReservaCreada}
            />

        </AuthenticatedLayout>
    );
}