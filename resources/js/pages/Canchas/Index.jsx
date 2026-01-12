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

// --- COMPONENTE INTERNO: CABECERA DE LA CANCHA (IMÁGENES) ---
const CanchaHeader = ({ cancha, estaDisponible }) => {
    const [mostrarFotos, setMostrarFotos] = useState(false);
    const [indiceFoto, setIndiceFoto] = useState(0);

    const tieneImagenes = cancha.images && cancha.images.length > 0;

    const toggleVista = () => {
        if (tieneImagenes) {
            setMostrarFotos(!mostrarFotos);
        }
    };

    const siguienteFoto = (e) => {
        e.stopPropagation(); 
        setIndiceFoto((prev) => (prev + 1) % cancha.images.length);
    };

    const anteriorFoto = (e) => {
        e.stopPropagation();
        setIndiceFoto((prev) => (prev - 1 + cancha.images.length) % cancha.images.length);
    };

    if (mostrarFotos && tieneImagenes) {
        return (
            <div className="h-40 w-full relative bg-gray-100 group">
                <img 
                    src={`/storage/${cancha.images[indiceFoto].ruta}`} 
                    alt={cancha.nombre}
                    className="w-full h-full object-cover transition-all duration-500"
                />
                
                <button 
                    onClick={toggleVista}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 z-10"
                    title="Ver icono"
                >
                    ✕
                </button>

                {cancha.images.length > 1 && (
                    <>
                        <button onClick={anteriorFoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1">⬅</button>
                        <button onClick={siguienteFoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1">➡</button>
                    </>
                )}
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-2 rounded-full">
                    {indiceFoto + 1} / {cancha.images.length}
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={toggleVista}
            className={`h-40 flex items-center justify-center text-white text-4xl font-bold relative 
            ${!estaDisponible ? 'bg-gray-400' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} 
            ${tieneImagenes ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
            title={tieneImagenes ? "Click para ver fotos" : ""}
        >
            {tieneImagenes && (
                <span className="absolute top-2 right-2 text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">📷 Ver fotos</span>
            )}
            ⚽
            {!estaDisponible && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <span className="text-sm font-bold bg-red-600 text-white px-3 py-1 rounded uppercase tracking-widest shadow">NO DISPONIBLE</span>
                </div>
            )}
        </div>
    );
};


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

    // Formulario de Admin 
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nombre: '',
        tipo: 'Futbol',
        precio_por_hora: '',
        precio_fin_de_semana: '',
        estado: 'disponible',
        imagenes: [],         
        imagenes_existentes: [],
        imagenes_eliminar: [],  
        _method: 'POST'    
    });

    const abrirModalAdmin = (cancha = null) => {
        clearErrors();
        if (cancha) {
            setCanchaEditar(cancha);
            setData({
                nombre: cancha.nombre,
                tipo: cancha.tipo,
                precio_por_hora: cancha.precio_por_hora,
                precio_fin_de_semana: cancha.precio_fin_de_semana || '',
                estado: cancha.estado || 'disponible',
                imagenes: [],
                imagenes_existentes: cancha.images || [], 
                imagenes_eliminar: [],
                _method: 'PUT'
            });
        } else {
            setCanchaEditar(null);
            reset();
            setData({
                nombre: '',
                tipo: 'futbol',
                precio_por_hora: '',
                precio_fin_de_semana: '',
                estado: 'disponible',
                imagenes: [],
                imagenes_existentes: [],
                imagenes_eliminar: [],
                _method: 'POST'
            });
        }
        setModalAdminOpen(true);
    };

    // --- NUEVAS FUNCIONES PARA GESTIÓN DE IMÁGENES ---

    const marcarParaEliminar = (id) => {
        const nuevasEliminar = [...data.imagenes_eliminar, id];
        const nuevasExistentes = data.imagenes_existentes.filter(img => img.id !== id);
        
        setData(prev => ({
            ...prev,
            imagenes_eliminar: nuevasEliminar,
            imagenes_existentes: nuevasExistentes
        }));
    };

    const moverImagen = (index, direction) => {
        const nuevas = [...data.imagenes_existentes];
        if (index + direction < 0 || index + direction >= nuevas.length) return;

        // Intercambio
        const temp = nuevas[index];
        nuevas[index] = nuevas[index + direction];
        nuevas[index + direction] = temp;

        setData('imagenes_existentes', nuevas);
    };

    const submitAdmin = (e) => {
        e.preventDefault();
        
        // Calculamos el orden final antes de enviar
        const arrayOrden = data.imagenes_existentes.map((img, index) => ({
            id: img.id,
            orden: index
        }));

        // Combinamos la data del form con el array de orden
        const datosParaEnviar = {
            ...data,
            imagenes_orden: arrayOrden
        };

        if (canchaEditar) {
            // Usamos router.post para controlar mejor el FormData con archivos y arrays complejos
            router.post(route('canchas.update', canchaEditar.id), datosParaEnviar, {
                onSuccess: () => setModalAdminOpen(false),
                forceFormData: true,
            });
        } else {
            post(route('canchas.store'), {
                onSuccess: () => { reset(); setModalAdminOpen(false); },
                forceFormData: true,
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
                            const precio = cancha.precio_por_hora; 

                            return (
                                <div key={cancha.id} className={`bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col ${!estaDisponible ? 'opacity-75' : ''}`}>
                                    
                                    <CanchaHeader cancha={cancha} estaDisponible={estaDisponible} />

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
                                            <div className="flex justify-between items-end mb-4">
                                                <div className="text-2xl font-black text-gray-800">
                                                    ${precio} <span className="text-sm font-normal text-gray-500">/h</span>
                                                </div>
                                                {cancha.precio_fin_de_semana && (
                                                    <div className="text-xs text-right bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                        <span className="font-bold">Finde:</span> ${cancha.precio_fin_de_semana}
                                                    </div>
                                                )}
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

            {/* MODALES */}
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
                                <option value="Indoor">Indoor</option>
                                <option value="Tenis">Tenis</option>
                            </select>
                            <InputError message={errors.tipo} />
                        </div>
                        <div>
                            <InputLabel value="Precio normal($)" />
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
                        
                        {/* --- SECCIÓN DE GESTIÓN DE IMÁGENES EXISTENTES --- */}
                        {data.imagenes_existentes.length > 0 && (
                            <div className="mb-4">
                                <InputLabel value="Imágenes Actuales (Usa las flechas para ordenar)" />
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {data.imagenes_existentes.map((img, index) => (
                                        <div key={img.id} className="relative group border rounded bg-gray-50 p-1">
                                            <img 
                                                src={`/storage/${img.ruta}`} 
                                                className="w-full h-20 object-cover rounded" 
                                                alt="Cancha"
                                            />
                                            
                                            {/* Controles Overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded">
                                                {/* Mover Izquierda */}
                                                {index > 0 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => moverImagen(index, -1)}
                                                        className="text-white hover:text-yellow-300 font-bold text-lg"
                                                        title="Mover antes"
                                                    >
                                                        ⬅
                                                    </button>
                                                )}

                                                {/* Eliminar */}
                                                <button 
                                                    type="button"
                                                    onClick={() => marcarParaEliminar(img.id)}
                                                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700"
                                                    title="Eliminar imagen"
                                                >
                                                    🗑️
                                                </button>

                                                {/* Mover Derecha */}
                                                {index < data.imagenes_existentes.length - 1 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => moverImagen(index, 1)}
                                                        className="text-white hover:text-yellow-300 font-bold text-lg"
                                                        title="Mover después"
                                                    >
                                                        ➡
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {/* Indicador de orden */}
                                            <span className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-1 rounded-tl">
                                                {index + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <InputLabel value={data.imagenes_existentes.length > 0 ? "Agregar más imágenes" : "Imágenes de la Cancha"} />
                            <input 
                                type="file" 
                                multiple
                                onChange={e => setData('imagenes', e.target.files)}
                                className="w-full mt-1 border border-gray-300 rounded p-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">Selecciona varias imágenes (JPG, PNG). Máx 2MB.</p>
                            <InputError message={errors.imagenes} />
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