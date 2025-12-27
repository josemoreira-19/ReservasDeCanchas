import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Para días en español

dayjs.locale('es');

export default function CalendarioSemanal({ isOpen, onClose, cancha, onReservarClick }) {
    if (!isOpen || !cancha) return null;

    const [fechaReferencia, setFechaReferencia] = useState(dayjs().startOf('week')); // Lunes actual
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Generar horas (de 6 a 23)
    const horas = Array.from({ length: 17 }, (_, i) => i + 6); 
    
    // Generar los 7 días de la semana actual
    const diasSemana = Array.from({ length: 7 }, (_, i) => fechaReferencia.add(i, 'day'));

    // Cargar datos del backend
    useEffect(() => {
        const fetchDisponibilidad = async () => {
            setLoading(true);
            try {
                // Ajusta la URL si tu ruta de API es diferente
                const response = await axios.get(`/api/canchas/${cancha.id}/disponibilidad`, {
                    params: { fecha_inicio: fechaReferencia.format('YYYY-MM-DD') }
                });
                setReservas(response.data.reservas);
            } catch (error) {
                console.error("Error cargando horarios", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDisponibilidad();
    }, [cancha, fechaReferencia]);

    // Función para ver si una celda está ocupada
    const verificarEstado = (dia, hora) => {
        const fechaStr = dia.format('YYYY-MM-DD');
        
        // Buscar si hay reserva ese día y a esa hora
        const ocupado = reservas.find(r => {
            if (r.fecha !== fechaStr) return false;
            
            // Convertir horas '14:00:00' a número 14
            const horaInicioReserva = parseInt(r.hora_inicio.split(':')[0]);
            const duracion = parseInt(r.duracion_horas); // Asumiendo entero para simplificar visualización
            
            // Si la hora de la celda cae dentro del rango de la reserva
            return hora >= horaInicioReserva && hora < (horaInicioReserva + duracion);
        });

        return ocupado ? 'ocupado' : 'libre';
    };

    // Navegación semanas
    const cambiarSemana = (direccion) => {
        setFechaReferencia(fechaReferencia.add(direccion, 'week'));
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-down">
                
                {/* Cabecera */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Horarios: {cancha.nombre}</h2>
                        <p className="text-sm text-gray-500 capitalize">
                            {fechaReferencia.format('DD MMMM YYYY')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => cambiarSemana(-1)} className="px-3 py-1 bg-white border rounded hover:bg-gray-100 text-sm">← Anterior</button>
                        <button onClick={() => setFechaReferencia(dayjs().startOf('week'))} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 text-sm">Hoy</button>
                        <button onClick={() => cambiarSemana(1)} className="px-3 py-1 bg-white border rounded hover:bg-gray-100 text-sm">Siguiente →</button>
                        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
                    </div>
                </div>

                {/* Grid del Calendario */}
                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">Cargando disponibilidad...</div>
                    ) : (
                        <div className="min-w-[800px]"> 
                            {/* Cabecera de Días */}
                            <div className="grid grid-cols-8 gap-1 mb-2">
                                <div className="p-2 font-bold text-gray-400 text-center">Hora</div>
                                {diasSemana.map((dia, idx) => (
                                    <div key={idx} className={`p-2 text-center rounded-t-lg font-semibold ${dia.isSame(dayjs(), 'day') ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' : 'bg-gray-100 text-gray-700'}`}>
                                        <div className="capitalize text-xs">{dia.format('dddd')}</div>
                                        <div className="text-lg">{dia.format('D')}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Filas de Horas */}
                            {horas.map(hora => (
                                <div key={hora} className="grid grid-cols-8 gap-1 mb-1">
                                    {/* Celda de la Hora (Izquierda) */}
                                    <div className="flex items-center justify-center text-xs text-gray-500 font-mono bg-gray-50 rounded">
                                        {hora}:00
                                    </div>

                                    {/* Celdas de los Días */}
                                    {diasSemana.map((dia, idx) => {
                                        const estado = verificarEstado(dia, hora);
                                        const esPasado = dia.hour(hora).isBefore(dayjs());
                                        
                                        return (
                                            <button
                                                key={idx}
                                                disabled={estado === 'ocupado' || esPasado}
                                                onClick={() => onReservarClick(cancha, dia.format('YYYY-MM-DD'), `${hora}:00`)}
                                                className={`
                                                    h-10 rounded border transition-all duration-200 flex items-center justify-center text-xs
                                                    ${estado === 'ocupado' 
                                                        ? 'bg-red-100 border-red-200 text-red-800 cursor-not-allowed opacity-80' 
                                                        : esPasado 
                                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                            : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:scale-105 shadow-sm'
                                                    }
                                                `}
                                            >
                                                {estado === 'ocupado' ? 'Ocupado' : (esPasado ? '-' : 'Libre')}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="p-3 bg-gray-50 text-xs text-gray-500 flex justify-center gap-6">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div> Disponible</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Ocupado</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div> Pasado</span>
                </div>
            </div>
        </div>
    );
}