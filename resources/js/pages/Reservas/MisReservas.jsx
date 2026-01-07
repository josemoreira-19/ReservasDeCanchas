import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';

// Componente pequeño para el Modal de Decisión (Pagar o Cancelar)
const ModalDecision = ({ isOpen, onClose, onPagar, onCancelar, reserva }) => {
    if (!isOpen || !reserva) return null;
    const pagadoTotalmente = parseFloat(reserva.monto_comprobante) >= parseFloat(reserva.precio_alquiler_total)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Gestionar Reserva</h3>
                <p className="text-gray-600 text-sm mb-6">
                    Reserva: <strong>{reserva.cancha.nombre}</strong><br/>
                    Fecha: {reserva.fecha}
                </p>
                <div className="flex flex-col gap-3">
                    {reserva.estado !== 'cancelada' && !pagadoTotalmente && (
                        <>
                            <button onClick={onPagar} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
                                💳 Realizar Pago / Abono
                            </button>
                            <button onClick={onCancelar} className="w-full bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 font-medium">
                                🗑️ Cancelar Reserva
                            </button>
                        </>
                    )}
                    <button onClick={onClose} className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function MisReservas({ auth, reservas, facturasDisponibles }) {
    
    // Estados
    const [ocultarPasadas, setOcultarPasadas] = useState(false); // Switch
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null); // Para el modal
    
    // LÓGICA DE COLORES (REGLAS DE NEGOCIO NUEVAS)
    const obtenerEstadoVisual = (reserva) => {
        const total = parseFloat(reserva.precio_alquiler_total);
        const pagado = parseFloat(reserva.monto_comprobante);
        
        // 1. ROJA: Cancelada
        if (reserva.estado === 'cancelada') {
            return { texto: 'Cancelada', clase: 'bg-red-100 text-red-800 border-red-200', icono: '✕' };
        }

        // 2. VERDE: Totalmente Pagada (100%)
        if (total > 0 && pagado >= total) {
            return { texto: 'Pagada', clase: 'bg-green-100 text-green-800 border-green-200', icono: '✓' };
        }

        // 3. AMARILLA: Abonada (>= 50%)
        if (total > 0 && (pagado / total) >= 0.5) {
            return { texto: 'Abonada (Pendiente Saldo)', clase: 'bg-yellow-100 text-yellow-800 border-yellow-200', icono: '⚠️' };
        }

        // 4. GRIS/NARANJA: Sin Abono Suficiente (< 50%)
        // Esta es la crítica: "Sin Abono". Urge pagar.
        return { texto: 'Falta Abono', clase: 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse', icono: '⏳' };
    };

    // FILTRO DEL SWITCH (Ocultar Pasadas)
    const reservasFiltradas = reservas.filter(r => {
        if (!ocultarPasadas) return true; // Si el switch está apagado, mostramos todo
        
        // Si el switch está encendido, filtramos:
        // Fecha Reserva >= Hoy (Usamos dayjs para comparar fechas sin hora)
        return dayjs(r.fecha).isAfter(dayjs().subtract(1, 'day'), 'day'); 
    });

    // ACCIONES
    const handleCancelar = () => {
        if(!confirm('¿Seguro que deseas cancelar esta reserva?')) return;
        
        router.post(route('reservas.cancelar', reservaSeleccionada.id), {}, {
            onSuccess: () => setReservaSeleccionada(null)
        });
    };

    const handlePagar = () => {
        router.get(route('facturas.pago', reservaSeleccionada.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Reservas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-10">
                    
                    {/* --- SECCIÓN 1: MIS RESERVAS --- */}
                    <div>
                        <div className="flex justify-between items-center mb-6 border-b pb-2">
                            <h2 className="text-2xl font-bold text-gray-800">Mis Reservas</h2>
                            
                            {/* EL SWITCH */}
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={ocultarPasadas}
                                        onChange={(e) => setOcultarPasadas(e.target.checked)}
                                    />
                                    <div className={`block w-14 h-8 rounded-full transition ${ocultarPasadas ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${ocultarPasadas ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-gray-700 font-medium text-sm">
                                    Ocultar Pasadas
                                </div>
                            </label>
                        </div>

                        {reservasFiltradas.length === 0 ? (
                            <p className="text-gray-500 text-center py-10 bg-gray-50 rounded">No hay reservas para mostrar con los filtros actuales.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reservasFiltradas.map((reserva) => {
                                    const estadoInfo = obtenerEstadoVisual(reserva);
                                    
                                    return (
                                        <div 
                                            key={reserva.id}
                                            onClick={() => setReservaSeleccionada(reserva)} // ABRIR MODAL DECISIÓN
                                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 group relative"
                                        >
                                            {/* Etiqueta de Estado */}
                                            <div className={`px-4 py-2 flex justify-between items-center font-bold text-xs uppercase tracking-wide ${estadoInfo.clase}`}>
                                                <span>{estadoInfo.texto}</span>
                                                <span>{estadoInfo.icono}</span>
                                            </div>

                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                    {reserva.cancha.nombre}
                                                </h3>
                                                <p className="text-sm text-gray-500 capitalize mb-4">{reserva.cancha.tipo}</p>

                                                <div className="space-y-2 text-sm text-gray-700">
                                                    <div className="flex justify-between">
                                                        <span>Fecha:</span> <span className="font-semibold">{reserva.fecha}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Hora:</span> <span className="font-semibold">{reserva.hora_inicio.substring(0, 5)}</span>
                                                    </div>
                                                    <div className="flex justify-between mt-2 pt-2 border-t">
                                                        <span>Total:</span> <span className="font-bold">${reserva.precio_alquiler_total}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500">
                                                        <span>Pagado:</span> <span>${reserva.monto_comprobante}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* --- SECCIÓN 2: FACTURAS (SOLO 100% PAGADAS) --- */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Facturas Disponibles</h2>
                        {/* ... (El código de facturas que ya teníamos, igual) ... */}
                        {facturasDisponibles.length === 0 ? (
                            <p className="text-gray-500 italic">Solo aparecerán aquí las reservas pagadas en su totalidad.</p>
                        ) : (
                            // ... Tu grid de facturas ...
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {facturasDisponibles.map(r => (
                                    <article key={r.id} className="p-4 border rounded shadow-sm bg-gray-50 flex flex-col justify-between">
                                        
                                        {/* Cabecera con Título y Badge Azul */}
                                        <header className='flex justify-between items-start mb-2'>
                                            <h3 className="font-bold text-gray-800 text-md">{r.cancha.nombre}</h3>
                                            
                                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                                Factura #{r.factura?.id || r.id}
                                            </span>
                                        </header>

                                        <hr className="border-gray-200 mb-3"/>

                                        {/* Detalles */}
                                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                                            <p className="flex items-center gap-1">
                                                {r.fecha}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                {r.hora_inicio.substring(0, 5)} - {r.hora_fin.substring(0, 5)}
                                            </p>
                                        </div>

                                        {/* Botón de Descarga */}
                                        <a 
                                            href={route('facturas.pdf', r.id)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="w-full mt-auto bg-white border border-gray-300 text-indigo-600 text-xs font-bold py-2 px-2 rounded hover:bg-indigo-50 transition text-center flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> 
                                            Descargar PDF
                                        </a>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* RENDERIZADO DEL MODAL DE DECISIÓN */}
            <ModalDecision 
                isOpen={!!reservaSeleccionada}
                reserva={reservaSeleccionada}
                onClose={() => setReservaSeleccionada(null)}
                onPagar={handlePagar}
                onCancelar={handleCancelar}
            />

        </AuthenticatedLayout>
    );
}