import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import CalendarioSemanal from '@/Components/CalendarioSemanal';
import ReservaModal from '@/Components/ReservaModal';

// Componentes para el Modal de Admin
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Index({ auth, canchas, isAdmin }) {
    
    // --- LÓGICA DE CLIENTE ---
    const [modalCalendarioOpen, setModalCalendarioOpen] = useState(false);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
    const [modalReservaOpen, setModalReservaOpen] = useState(false);
    const [preDatosReserva, setPreDatosReserva] = useState(null);

    const abrirCalendario = (cancha) => {
        setCanchaSeleccionada(cancha);
        setModalCalendarioOpen(true);
    };

    const iniciarReservaDesdeCalendario = (cancha, fecha, hora) => {
        setPreDatosReserva({ fecha, hora });
        setModalCalendarioOpen(false);
        setModalReservaOpen(true);
    };

    const manejarExito = (nuevoId) => {
        router.visit(route('facturas.pago', nuevoId));
    };

    // --- LÓGICA DE ADMIN (CRUD) ---
    const [modalAdminOpen, setModalAdminOpen] = useState(false);
    const [canchaEditar, setCanchaEditar] = useState(null);

    // Formulario de Admin CORREGIDO
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombre: '',
        tipo: 'Futbol',
        precio_por_hora: '', // <--- CORREGIDO: Coincide con la BD
        estado: 'disponible',
    });

    const abrirModalAdmin = (cancha = null) => {
        clearErrors();
        if (cancha) {
            setCanchaEditar(cancha);
            setData({
                nombre: cancha.nombre,
                tipo: cancha.tipo,
                precio_por_hora: cancha.precio_por_hora, // <--- CORREGIDO: Ahora sí carga el valor
                estado: cancha.estado || 'disponible'
            });
        } else {
            setCanchaEditar(null);
            reset();
            setData('tipo', 'futbol');
            setData('estado', 'disponible');
        }
        setModalAdminOpen(true);
    };

    const submitAdmin = (e) => {
        e.preventDefault();
        if (canchaEditar) {
            put(route('canchas.update', canchaEditar.id), {
                onSuccess: () => setModalAdminOpen(false)
            });
        } else {
            post(route('canchas.store'), {
                onSuccess: () => setModalAdminOpen(false)
            });
        }
    };

    const eliminarCancha = (cancha) => {
        if(confirm('¿Seguro que deseas eliminar esta cancha?')) {
            router.delete(route('canchas.destroy', cancha.id));
        }
    };


    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Canchas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* CABECERA */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Nuestras Canchas</h2>
                        {isAdmin && (
                            <button 
                                onClick={() => abrirModalAdmin(null)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow font-bold flex items-center gap-2"
                            >
                                <span>+</span> Nueva Cancha
                            </button>
                        )}
                    </div>

                    {/* GRID DE CANCHAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {canchas.map((cancha) => {
                            const estaDisponible = cancha.estado === 'disponible';
                            // Ahora usamos directamente la variable correcta
                            const precio = cancha.precio_por_hora; 

                            return (
                                <div key={cancha.id} className={`bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col ${!estaDisponible ? 'opacity-75' : ''}`}>
                                    
                                    {/* Imagen / Placeholder */}
                                    <div className={`h-40 flex items-center justify-center text-white text-4xl font-bold relative ${!estaDisponible ? 'bg-gray-400' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
                                        ⚽
                                        {!estaDisponible && (
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                                <span className="text-sm font-bold bg-red-600 text-white px-3 py-1 rounded uppercase tracking-widest shadow">
                                                    NO DISPONIBLE
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{cancha.nombre}</h3>
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide">
                                                {cancha.tipo}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-500 text-sm mb-4">
                                            {estaDisponible 
                                                ? 'Disfruta de la mejor experiencia deportiva.' 
                                                : 'Esta cancha no está disponible para reservas en este momento.'
                                            }
                                        </p>
                                        
                                        <div className="mt-auto">
                                            <div className="text-2xl font-black text-gray-800 mb-4">
                                                ${precio} <span className="text-sm font-normal text-gray-500">/ hora</span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => abrirCalendario(cancha)}
                                                    disabled={!estaDisponible}
                                                    className={`w-full font-bold py-2 rounded-lg transition flex items-center justify-center gap-2
                                                        ${estaDisponible 
                                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {estaDisponible ? '📅 Ver Horarios' : '⛔ No Disponible'}
                                                </button>

                                                {isAdmin && (
                                                    <div className="flex gap-2 mt-2 pt-3 border-t">
                                                        <button 
                                                            onClick={() => abrirModalAdmin(cancha)}
                                                            className="flex-1 bg-yellow-100 text-yellow-700 py-1 rounded text-sm font-bold hover:bg-yellow-200"
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                        <button 
                                                            onClick={() => eliminarCancha(cancha)}
                                                            className="flex-1 bg-red-100 text-red-700 py-1 rounded text-sm font-bold hover:bg-red-200"
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MODALES CLIENTE */}
            <CalendarioSemanal 
                isOpen={modalCalendarioOpen} 
                onClose={() => setModalCalendarioOpen(false)} 
                cancha={canchaSeleccionada} 
                onReservarClick={iniciarReservaDesdeCalendario} 
            />
            
            <ReservaModal
                isOpen={modalReservaOpen}
                onClose={() => {
                    setModalReservaOpen(false);
                    setPreDatosReserva(null);
                }}
                cancha={canchaSeleccionada}
                initialData={preDatosReserva}
                onSuccess={manejarExito}
            />

            {/* MODAL ADMIN (CREAR/EDITAR) */}
            <Modal show={modalAdminOpen} onClose={() => setModalAdminOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {canchaEditar ? `Editar ${canchaEditar.nombre}` : 'Nueva Cancha'}
                    </h2>

                    <form onSubmit={submitAdmin} className="space-y-4">
                        <div>
                            <InputLabel value="Nombre" />
                            <TextInput value={data.nombre} onChange={e => setData('nombre', e.target.value)} className="w-full mt-1" required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div>
                            <InputLabel value="Tipo" />
                            <select value={data.tipo} onChange={e => setData('tipo', e.target.value)} className="w-full mt-1 border-gray-300 rounded">
                                <option value="Futbol">Fútbol</option>
                                <option value="Voley">Voley</option>
                                <option value="Basquet">Basquet</option>
                                <option value="Indoor">Indoor 7</option>
                                <option value="Tenis">Tenis</option>
                                </select>
                            <InputError message={errors.tipo} />
                        </div>
                        <div>
                            <InputLabel value="Precio normal($)" />
                            {/* CORREGIDO: Input vinculado a precio_por_hora */}
                            <TextInput 
                                type="number" 
                                step="0.01" 
                                value={data.precio_por_hora} 
                                onChange={e => setData('precio_por_hora', e.target.value)} 
                                className="w-full mt-1" 
                                required 
                            />
                            <InputError message={errors.precio_por_hora} />
                        </div>

                            <div>
                            <InputLabel value="Precio fin de semana ($)" />
                            {/* CORREGIDO: Input vinculado a precio_fin_de_semana */}
                            <TextInput 
                                type="number" 
                                step="0.01" 
                                value={data.precio_fin_de_semana} 
                                onChange={e => setData('precio_fin_de_semana', e.target.value)} 
                                className="w-full mt-1" 
                                required 
                            />
                            <InputError message={errors.precio_fin_de_semana} />
                        </div>

                        <div>
                            <InputLabel value="Estado" />
                            <select value={data.estado} onChange={e => setData('estado', e.target.value)} className="w-full mt-1 border-gray-300 rounded">
                                <option value="disponible">Disponible</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="ocupada">Ocupada</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setModalAdminOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded">Guardar</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}