import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';

// =================================================================
// 1. COMPONENTES AUXILIARES (SE DEFINEN AFUERA, SIN ESTADOS PROPIOS)
// =================================================================

const EstadoBadge = ({ estado }) => {
    const estadoNorm = estado ? estado.toLowerCase() : 'pendiente';
    const colores = {
        pendiente: 'bg-yellow-100 text-yellow-800',
        confirmada: 'bg-blue-100 text-blue-800',
        pagado: 'bg-green-100 text-green-800',
        cancelada: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colores[estadoNorm] || 'bg-gray-100 text-gray-800'}`}>
            {estado ? estado.toUpperCase() : 'PENDIENTE'}
        </span>
    );
};

const ModalComprobantes = ({ isOpen, onClose, comprobantes }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative animate-fade-in-down max-h-[90vh] overflow-y-auto">
                
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-800">📸 Comprobantes de Pago</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl font-bold">✕</button>
                </div>

                {comprobantes.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay comprobantes digitales subidos.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {comprobantes.map((comp) => (
                            <div key={comp.id} className="border rounded p-2">
                                <img 
                                    src={`/storage/${comp.ruta_archivo}`} 
                                    alt="Comprobante" 
                                    className="w-full h-auto object-contain rounded hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => window.open(`/storage/${comp.ruta_archivo}`, '_blank')}
                                />
                                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                    <span>{comp.nombre_original}</span>
                                    <a href={`/storage/${comp.ruta_archivo}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Ver Original</a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-bold">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const ModalDecision = ({ isOpen, onClose, onPagar, reserva }) => {
    if (!isOpen || !reserva) return null;
    
    const total = parseFloat(reserva.precio_alquiler_total || 0);
    const pagado = parseFloat(reserva.monto_comprobante || 0);
    const estaPagado = (total - pagado) <= 0.01;
    const estaCancelada = reserva.estado === 'cancelada';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Gestionar Reserva</h3>
                <p className="text-gray-600 text-sm mb-6">
                    Reserva: <strong>{reserva.cancha?.nombre}</strong><br/>
                    Fecha: {reserva.fecha}
                </p>
                <div className="flex flex-col gap-3">
                    
                    {!estaCancelada && !estaPagado && (
                        <button onClick={onPagar} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
                            💳 Realizar Pago / Abono
                        </button>
                    )}

                    {estaPagado && !estaCancelada && (
                         <button onClick={() => window.open(route('facturas.pdf', reserva.id), '_blank')} className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 font-medium">
                            🖨️ Imprimir Comprobante
                        </button>
                    )}
                    
                    <button onClick={onClose} className="w-full border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// 2. COMPONENTE PRINCIPAL (AQUÍ DENTRO VAN TODOS LOS HOOKS)
// =================================================================
export default function Index({ auth, reservas = { data: [], links: [] }, filters, facturasDisponibles = [], isAdmin = false }) {
    
    // --- TODOS LOS useState DEBEN ESTAR AQUÍ, DENTRO DE LA FUNCIÓN ---
    const [search, setSearch] = useState(filters?.search || '');
    const [ocultarPasadas, setOcultarPasadas] = useState(false); 
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null); 

    // AQUÍ ES DONDE ESTABAN FALLANDO ANTES (Deben estar dentro)
    const [modalOpen, setModalOpen] = useState(false);
    const [comprobantesSeleccionados, setComprobantesSeleccionados] = useState([]);
    // -------------------------------------------------------------

    // --- FUNCIONES INTERNAS ---
    const abrirModalComprobantes = (comprobantes) => {
        setComprobantesSeleccionados(comprobantes);
        setModalOpen(true);
    };

    const irAPagar = (reservaId) => {
        router.get(route('facturas.pago', reservaId));
    };

    const irAImprimir = (reservaId) => {
        window.open(route('facturas.pdf', reservaId), '_blank');
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        router.get(route('reservas.mis-reservas'), { search: value }, { preserveState: true, replace: true });
    };

    const handleCancelarAdmin = (id) => {
        if(confirm('¿Seguro que deseas cancelar esta reserva permanentemente?')) {
            router.post(route('reservas.cancelar', id)); 
        }
    };

    const obtenerEstadoVisual = (reserva) => {
        const total = parseFloat(reserva.precio_alquiler_total || 0);
        const pagado = parseFloat(reserva.monto_comprobante || 0);
        
        if (reserva.estado === 'cancelada') {
            return { texto: 'Cancelada', clase: 'bg-red-100 text-red-800 border-red-200', icono: '✕' };
        }
        if (total > 0 && (total - pagado) <= 0.01) {
            return { texto: 'Pagada', clase: 'bg-green-100 text-green-800 border-green-200', icono: '✓' };
        }
        if (total > 0 && (pagado / total) >= 0.5) {
            return { texto: 'Abonada', clase: 'bg-yellow-100 text-yellow-800 border-yellow-200', icono: '⚠️' };
        }
        return { texto: 'Falta Abono', clase: 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse', icono: '⏳' };
    };

    const dataReservas = reservas?.data || [];
    const reservasFiltradasCliente = dataReservas.filter(r => {
        if (!ocultarPasadas) return true;
        return dayjs(r.fecha).isAfter(dayjs().subtract(1, 'day'), 'day'); 
    });

    const handlePagarModal = () => {
        irAPagar(reservaSeleccionada.id);
    };

    const listaFacturas = facturasDisponibles || [];

    const esPagada = (r) => {
        const total = parseFloat(r.precio_alquiler_total || 0);
        const pagado = parseFloat(r.monto_comprobante || 0);
        return (total - pagado) <= 0.01;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Reservas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* VISTA ADMINISTRADOR */}
                    {isAdmin ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800"> Gestión de Reservas</h2>
                                <div className="relative w-full max-w-sm">
                                    <input 
                                        type="text" placeholder="Buscar..." value={search} onChange={handleSearch}
                                        className="w-full border-gray-300 rounded-lg pl-10 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400">
                                    <img src="/images/lupa.png" alt="buscar" style={{ width: '16px', height: '16px' }} /> 
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cancha</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pago ($)</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Estado</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dataReservas.map((reserva) => {
                                            const pagada = esPagada(reserva);
                                            const estaCancelada = reserva.estado === 'cancelada';

                                            return (
                                                <tr key={reserva.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-4 whitespace-nowrap font-mono text-sm text-indigo-600">#{reserva.id}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{reserva.user?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">CI: {reserva.user?.cedula || '-'}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{reserva.cancha?.nombre}</div>
                                                        <div className="text-xs text-gray-500">{reserva.cancha?.tipo}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{dayjs(reserva.fecha).format('DD/MM/YYYY')}</div>
                                                        <div className="text-xs text-gray-500">de {reserva.hora_inicio.substring(0, 5)} a {reserva.hora_fin.substring(0, 5)}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">Total: ${reserva.precio_alquiler_total}</div>
                                                        {parseFloat(reserva.monto_comprobante || 0) > 0 && (
                                                            <div className="text-xs text-green-600">Abonado: ${reserva.monto_comprobante}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <EstadoBadge estado={reserva.estado} />
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            
                                                            {/* NUEVO BOTÓN: VER COMPROBANTES */}
                                                            {reserva.factura?.comprobantes?.length > 0 && (
                                                                <button 
                                                                    onClick={() => abrirModalComprobantes(reserva.factura.comprobantes)} 
                                                                    className="text-blue-600 hover:text-blue-900 border border-green-200 px-2 py-1 rounded bg-green-50 hover:bg-green-100" 
                                                                    title={`Ver ${reserva.factura.comprobantes.length} comprobantes`}
                                                                >
                                                                    <img src="/images/revisarComprobante.png" alt="Ver" style={{ width: '16px', height: '16px' }} />
                                                                </button>
                                                            )}

                                                            {!estaCancelada && !pagada && (
                                                                <button onClick={() => irAPagar(reserva.id)} className="text-green-600 hover:text-green-900 border border-green-200 px-2 py-1 rounded bg-green-50 hover:bg-green-100" title="Cobrar">
                                                                    <img src="/images/cobrar.png" alt="Cobrar" style={{ width: '16px', height: '16px' }} />
                                                                </button>
                                                            )}
                                                            
                                                            {!estaCancelada && pagada && (
                                                                <button onClick={() => irAImprimir(reserva.id)} className="text-gray-600 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100" title="PDF">
                                                                    <img src="/images/imprimir.png" alt="imprimir" style={{ width: '16px', height: '16px' }} />
                                                                </button>
                                                            )}

                                                            {!estaCancelada && (
                                                                <button onClick={() => handleCancelarAdmin(reserva.id)} className="text-red-600 hover:text-red-900 border border-red-200 px-2 py-1 rounded bg-red-50 hover:bg-red-100" title="Cancelar">
                                                                    <img src="/images/cancelar.png" alt="Cancelar" style={{ width: '16px', height: '16px' }} />
                                                                </button>
                                                            )}

                                                            {estaCancelada && (
                                                                <span className="text-gray-400 text-xs italic">Sin acciones</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex justify-center gap-2">
                                {reservas?.links?.map((link, k) => (
                                    <button key={k} onClick={() => link.url && router.get(link.url, { search }, { preserveState: true })} disabled={!link.url || link.active} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 border rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        // VISTA CLIENTE
                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between items-center mb-6 border-b pb-2">
                                    <h2 className="text-2xl font-bold text-gray-800">Mis Reservas</h2>
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only" checked={ocultarPasadas} onChange={(e) => setOcultarPasadas(e.target.checked)} />
                                            <div className={`block w-14 h-8 rounded-full transition ${ocultarPasadas ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${ocultarPasadas ? 'translate-x-6' : ''}`}></div>
                                        </div>
                                        <div className="ml-3 text-gray-700 font-medium text-sm">Ocultar Pasadas</div>
                                    </label>
                                </div>
                                {reservasFiltradasCliente.length === 0 ? (
                                    <p className="text-gray-500 text-center py-10 bg-gray-50 rounded">No hay reservas para mostrar.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {reservasFiltradasCliente.map((reserva) => {
                                            const estadoInfo = obtenerEstadoVisual(reserva);
                                            return (
                                                <div key={reserva.id} onClick={() => setReservaSeleccionada(reserva)} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-100 group relative">
                                                    <div className={`px-4 py-2 flex justify-between items-center font-bold text-xs uppercase tracking-wide ${estadoInfo.clase}`}>
                                                        <span>{estadoInfo.texto}</span>
                                                        <span>{estadoInfo.icono}</span>
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{reserva.cancha?.nombre}</h3>
                                                        <p className="text-sm text-gray-500 capitalize mb-4">{reserva.cancha?.tipo}</p>
                                                        <div className="space-y-2 text-sm text-gray-700">
                                                            <div className="flex justify-between"><span>Fecha:</span> <span className="font-semibold">{reserva.fecha}</span></div>
                                                            <div className="flex justify-between"><span>Hora:</span> <span className="font-semibold">{reserva.hora_inicio?.substring(0, 5)}</span></div>
                                                            <div className="flex justify-between mt-2 pt-2 border-t"><span>Total:</span> <span className="font-bold">${reserva.precio_alquiler_total}</span></div>
                                                            <div className="flex justify-between text-xs text-gray-500"><span>Pagado:</span> <span>${reserva.monto_comprobante}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Facturas Disponibles</h2>
                                {listaFacturas.length === 0 ? (
                                    <p className="text-gray-500 italic">Solo aparecerán aquí las reservas pagadas en su totalidad.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {listaFacturas.map(r => (
                                            <article key={r.id} className="p-4 border rounded shadow-sm bg-gray-50 flex flex-col justify-between">
                                                <header className='flex justify-between items-start mb-2'>
                                                    <h3 className="font-bold text-gray-800 text-md">{r.cancha?.nombre}</h3>
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">#{r.factura?.id || r.id}</span>
                                                </header>
                                                <hr className="border-gray-200 mb-3"/>
                                                <div className="text-sm text-gray-600 space-y-1 mb-3">
                                                    <p className="flex items-center gap-1">{r.fecha}</p>
                                                    <p className="flex items-center gap-1">{r.hora_inicio?.substring(0, 5)} - {r.hora_fin?.substring(0, 5)}</p>
                                                </div>
                                                {r.estado !== 'cancelada' && (
                                                    <button onClick={() => irAImprimir(r.id)} className="w-full mt-auto bg-white border border-gray-300 text-indigo-600 text-xs font-bold py-2 px-2 rounded hover:bg-indigo-50 transition text-center flex items-center justify-center gap-2">
                                                        Descargar PDF
                                                    </button>
                                                )}
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ModalDecision isOpen={!!reservaSeleccionada} reserva={reservaSeleccionada} onClose={() => setReservaSeleccionada(null)} onPagar={handlePagarModal} />

            <ModalComprobantes 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                comprobantes={comprobantesSeleccionados} 
            />
                
        </AuthenticatedLayout>
    );
}