import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import Modal from './Modal';    
import { usePage } from '@inertiajs/react';
import BuscadorCliente from '@/Components/BuscadorCliente'; 

export default function ReservaModal({ isOpen, onClose, cancha, onSuccess, initialData }) {
    const { auth } = usePage().props; 
    const isAdmin = auth.user.role === 'admin';

    // Estados del formulario
    const [formData, setFormData] = useState({
        fecha_reserva: '',
        hora_inicio: '',
        duracion_horas: 1, 
        cliente_id: '', 
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [totalEstimado, setTotalEstimado] = useState(0);

    // 1. CALCULAR PRECIO AUTOMÁTICAMENTE
useEffect(() => {
        if (cancha && formData.duracion_horas) {
            let precioAplicado = parseFloat(cancha.precio_por_hora);

            // Si hay una fecha seleccionada, verificamos el día
            if (formData.fecha_reserva) {
                // Truco: Agregamos 'T12:00:00' para evitar problemas de zona horaria al crear la fecha
                const fechaObj = new Date(formData.fecha_reserva + 'T12:00:00');
                const diaSemana = fechaObj.getDay(); // 0 = Domingo, 6 = Sábado

                // Si es Sábado (6) o Domingo (0) Y existe precio de fin de semana
                if ((diaSemana === 0 || diaSemana === 6) && cancha.precio_fin_de_semana) {
                    precioAplicado = parseFloat(cancha.precio_fin_de_semana);
                }
            }

            setTotalEstimado(precioAplicado * formData.duracion_horas);
        }
    }, [formData.duracion_horas, formData.fecha_reserva, cancha]);    
    // 2. AUTO-RELLENAR DATOS
    useEffect(() => {
        if (initialData) {
            setErrors({});
            setFormData(prev => ({
                ...prev,
                fecha_reserva: initialData.fecha, 
                hora_inicio: initialData.hora,
                cliente_id: '', // Resetear al abrir
            }));
        }
    }, [initialData]);

    if (!isOpen) return null;


    const getPrecioDisplay = () => {
        if (!cancha) return { precio: 0, esFinde: false };
        
        let precio = parseFloat(cancha.precio_por_hora);
        let esFinde = false;

        if (formData.fecha_reserva) {
            // "T12:00:00" evita problemas de zona horaria que cambien el día
            const fechaObj = new Date(formData.fecha_reserva + 'T12:00:00');
            const dia = fechaObj.getDay(); // 0 Domingo, 6 Sábado

            if ((dia === 0 || dia === 6) && cancha.precio_fin_de_semana) {
                precio = parseFloat(cancha.precio_fin_de_semana);
                esFinde = true;
            }
        }
        return { precio: precio.toFixed(2), esFinde };
    };

    const { precio: precioMostrado, esFinde } = getPrecioDisplay();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- NUEVA FUNCIÓN: RESERVAR PARA MÍ MISMO ---
    const reservarParaMi = () => {
        setFormData(prev => ({ ...prev, cliente_id: auth.user.id }));
        setErrors(prev => ({ ...prev, cliente_id: null })); // Limpiamos el error si existía
    };

    const limpiarCliente = () => {
        setFormData(prev => ({ ...prev, cliente_id: '' }));
    };
    // ---------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        // La validación se mantiene igual, porque ahora si eliges "Para mí", 
        // el cliente_id tendrá TU ID, así que pasará esta validación.
        if (isAdmin && !formData.cliente_id) {
            setErrors({ cliente_id: '⚠️ Debes seleccionar un cliente o elegir "Reservar a mi nombre".' });
            return; 
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/reservas', {
                cancha_id: cancha.id,
                fecha_reserva: formData.fecha_reserva,
                hora_inicio: formData.hora_inicio,
                duracion_horas: formData.duracion_horas,
                cliente_id: formData.cliente_id 
            });

            onSuccess(response.data.reserva_id);
            onClose(); 

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.data && error.response.data.general) {
                setErrors({ general: error.response.data.general });
            } else {
                alert('Ocurrió un error inesperado.');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-down">
                
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Confirmar Reserva</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
                </div>

                {/* Info de la Cancha */}
                <div className={`p-3 rounded-md mb-4 text-sm border ${esFinde ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                    Estás reservando: <strong>{cancha?.nombre}</strong><br />
                    
                    Precio por hora: <strong>${precioMostrado}</strong>
                    
                    {/* Etiqueta pequeña para avisar al usuario */}
                    {esFinde && (
                        <span className="ml-2 text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                            ★ Tarifa Fin de Semana
                        </span>
                    )}
                </div>
                {/* CAJA DE ERRORES */}
                {(errors.hora_inicio || errors.duracion_horas || errors.general || errors.cliente_id) && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-pulse text-sm">
                        <strong className="font-bold">¡Atención! </strong>
                        <span className="block sm:inline">
                            {errors.general || errors.hora_inicio || errors.duracion_horas || errors.cliente_id}
                        </span>
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    
                    {/* === ZONA ADMIN: SELECCIÓN DE CLIENTE === */}
                    {isAdmin && (
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mb-4">
                            <h3 className="text-xs font-bold text-indigo-800 uppercase mb-2">👤 ¿Para quién es la reserva?</h3>
                            
                            {/* 1. BUSCADOR (Si no hay cliente seleccionado o si queremos cambiar) */}
                            {!formData.cliente_id && (
                                <>
                                    <BuscadorCliente 
                                        onSeleccionar={(usuario) => setFormData(prev => ({...prev, cliente_id: usuario.id}))} 
                                    />
                                    
                                    <div className="mt-3 text-center border-t border-indigo-200 pt-2">
                                        <span className="text-xs text-indigo-600 mr-2">¿Es para ti?</span>
                                        <button 
                                            type="button"
                                            onClick={reservarParaMi}
                                            className="text-xs bg-white border border-indigo-300 px-2 py-1 rounded text-indigo-700 font-bold hover:bg-indigo-100 transition"
                                        >
                                            Reservar a mi nombre
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* 2. CLIENTE SELECCIONADO (Feedback visual) */}
                            {formData.cliente_id && (
                                <div className="mt-2 flex justify-between items-center bg-green-100 p-2 rounded border border-green-300">
                                    <span className="text-sm text-green-800 font-bold">
                                        {formData.cliente_id === auth.user.id 
                                            ? '✓ A tu nombre (Admin)' 
                                            : `✓ Cliente ID: ${formData.cliente_id}`
                                        }
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={limpiarCliente}
                                        className="text-xs text-red-600 hover:text-red-800 underline ml-2"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {/* ======================================== */}

                    {/* SECCIÓN DE DATOS FIJOS */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Fecha</label>
                            <div className="w-full bg-gray-100 border border-gray-300 text-gray-600 rounded px-3 py-2 font-medium">
                                {formData.fecha_reserva}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Hora Inicio</label>
                            <div className="w-full bg-gray-100 border border-gray-300 text-gray-600 rounded px-3 py-2 font-medium">
                                {formData.hora_inicio} hrs
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN EDITABLE (DURACIÓN) */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Duración</label>
                        <select 
                            name="duracion_horas"
                            value={formData.duracion_horas}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="1">1 Hora</option>
                            <option value="2">2 Horas</option>
                            <option value="3">3 Horas</option>
                            <option value="4">4 Horas</option>
                        </select>
                    </div>

                    {/* Total Estimado */}
                    <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                        <span className="text-gray-600 font-medium">Total:</span>
                        <span className="text-3xl font-bold text-green-600">${totalEstimado.toFixed(2)}</span>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-6 py-2 text-white font-bold rounded shadow-lg disabled:opacity-50 disabled:shadow-none transition ${isAdmin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? 'Procesando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}