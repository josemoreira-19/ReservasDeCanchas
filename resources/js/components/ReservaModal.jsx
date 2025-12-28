import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

export default function ReservaModal({ isOpen, onClose, cancha, onSuccess, initialData }) {
    // Estados del formulario
    const [formData, setFormData] = useState({
        fecha_reserva: '',
        hora_inicio: '',
        duracion_horas: 1, 
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [totalEstimado, setTotalEstimado] = useState(0);

    // 1. CALCULAR PRECIO AUTOMÁTICAMENTE
    useEffect(() => {
        if (cancha) {
            const precio = parseFloat(cancha.precio_por_hora);
            setTotalEstimado(precio * formData.duracion_horas);
        }
    }, [formData.duracion_horas, cancha]);
    
    // 2. AUTO-RELLENAR DATOS DESDE EL CALENDARIO
    useEffect(() => {
        if (initialData) {
            setErrors({});
            setFormData(prev => ({
                ...prev,
                fecha_reserva: initialData.fecha, // Ej: "2025-12-27"
                hora_inicio: initialData.hora     // Ej: "14:00"
            }));
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/reservas', {
                cancha_id: cancha.id,
                fecha_reserva: formData.fecha_reserva,
                hora_inicio: formData.hora_inicio,
                duracion_horas: formData.duracion_horas
            });

            onSuccess(response.data.reserva_id);
            onClose(); 

        } catch (error) {
// Manejo de errores (Validación 422 o Servidor 500)
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.data && error.response.data.general) {
                 // Para capturar el error 'general' que creamos en el controlador
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
                <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800 border border-blue-100">
                    Estás reservando: <strong>{cancha?.nombre}</strong>
                    <br />
                    Precio por hora: <strong>${cancha?.precio_por_hora}</strong>
                </div>

                {/* CAJA DE ERRORES GENERALES */}
                {(errors.hora_inicio || errors.duracion_horas || errors.general) && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-pulse">
                        <strong className="font-bold">¡Atención! </strong>
                        <span className="block sm:inline">
                            {/* Aquí mostramos el mensaje dinámico que manda Laravel, NO un texto fijo */}
                            {errors.general || errors.hora_inicio || errors.duracion_horas}
                        </span>
                    </div>
                )}
                
<form onSubmit={handleSubmit}></form>
                <form onSubmit={handleSubmit}>
                    
                    {/* SECCIÓN DE DATOS FIJOS (SOLO LECTURA) */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Fecha Fija */}
                        <div>
                            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Fecha Seleccionada</label>
                            <div className="w-full bg-gray-100 border border-gray-300 text-gray-600 rounded px-3 py-2 font-medium">
                                {formData.fecha_reserva}
                            </div>
                        </div>

                        {/* Hora Fija */}
                        <div>
                            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Hora Inicio</label>
                            <div className="w-full bg-gray-100 border border-gray-300 text-gray-600 rounded px-3 py-2 font-medium">
                                {formData.hora_inicio} hrs
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN EDITABLE (SOLO DURACIÓN) */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            ¿Cuántas horas vas a jugar?
                        </label>
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
                        <span className="text-gray-600 font-medium">Total a Pagar:</span>
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
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}