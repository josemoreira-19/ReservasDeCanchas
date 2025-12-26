import React, { useState, useEffect } from 'react';

// Asumimos que usas Axios (estándar en Laravel). Si usas fetch, avísame.
import axios from 'axios'; 

export default function ReservaModal({ isOpen, onClose, cancha, onSuccess }) {
    // Estados del formulario
    const [formData, setFormData] = useState({
        fecha_reserva: '',
        hora_inicio: '',
        duracion_horas: 1, // Mínimo 1 hora
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [totalEstimado, setTotalEstimado] = useState(0);

    // Calcular el total visualmente cuando cambian las horas (Solo para mostrar)
    useEffect(() => {
        if (cancha) {
            const precio = parseFloat(cancha.precio_por_hora);
            setTotalEstimado(precio * formData.duracion_horas);
        }
    }, [formData.duracion_horas, cancha]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Enviamos los datos al backend (ReservaController@store)
            await axios.post('/reservas', {
                cancha_id: cancha.id,
                fecha_reserva: formData.fecha_reserva,
                hora_inicio: formData.hora_inicio,
                duracion_horas: formData.duracion_horas
            });

            // Si todo sale bien:
            alert('¡Reserva creada con éxito! El sistema calculó los impuestos internamente.');
            onSuccess(); // Refrescar la tabla de reservas o limpiar estado
            onClose();   // Cerrar modal

        } catch (error) {
            // Manejo de errores de validación de Laravel (422)
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
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
                    <h2 className="text-xl font-bold text-gray-800">
                        Nueva Reserva
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        ✕
                    </button>
                </div>

                {/* Info de la Cancha */}
                <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800">
                    Estás reservando: <strong>{cancha?.nombre || 'Selecciona una cancha'}</strong>
                    <br />
                    Precio por hora: <strong>${cancha?.precio_por_hora}</strong> (Inc. Impuestos)
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Fecha */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Fecha</label>
                        <input 
                            type="date"
                            name="fecha_reserva"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleChange}
                            required
                        />
                        {errors.fecha_reserva && <p className="text-red-500 text-xs mt-1">{errors.fecha_reserva[0]}</p>}
                    </div>

                    {/* Hora y Duración (Grid de 2 columnas) */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Hora Inicio</label>
                            <input 
                                type="time"
                                name="hora_inicio"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                                required
                            />
                            {errors.hora_inicio && <p className="text-red-500 text-xs mt-1">{errors.hora_inicio[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Duración (Horas)</label>
                            <input 
                                type="number"
                                name="duracion_horas"
                                min="1"
                                max="4"
                                value={formData.duracion_horas}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Total Estimado */}
                    <div className="flex justify-between items-center bg-gray-100 p-3 rounded mb-6">
                        <span className="text-gray-600 font-medium">Total a Pagar:</span>
                        <span className="text-2xl font-bold text-green-600">${totalEstimado.toFixed(2)}</span>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}