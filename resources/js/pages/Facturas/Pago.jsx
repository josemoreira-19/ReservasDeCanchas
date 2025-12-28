import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Pago({ auth, reserva, factura, metodosDisponibles }) {
    const [metodoSeleccionado, setMetodoSeleccionado] = useState(metodosDisponibles[0].id);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pago Reserva #${reserva.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg grid grid-cols-1 md:grid-cols-2">
                        
                        {/* COLUMNA IZQUIERDA: RESUMEN */}
                        <div className="p-6 bg-gray-50 border-r border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Detalle de Reserva</h2>
                            
                            <div className="space-y-3 text-sm">
                                <p><span className="text-gray-500">Cancha:</span> <br/> <span className="font-semibold text-lg">{reserva.cancha.nombre}</span></p>
                                <p><span className="text-gray-500">Fecha:</span> <br/> <span className="font-semibold">{reserva.fecha}</span></p>
                                <p><span className="text-gray-500">Horario:</span> <br/> <span className="font-semibold">{reserva.hora_inicio} - {reserva.hora_fin}</span></p>
                                <hr className="my-4"/>
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${factura.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Impuestos (IVA):</span>
                                    <span>${factura.impuestos}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-indigo-700 mt-2">
                                    <span>Total:</span>
                                    <span>${factura.total}</span>
                                </div>
                                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded text-xs">
                                    Estado actual: <strong>{reserva.estado.toUpperCase()}</strong>.
                                    <br/>
                                    Paga al menos el 50% (${(factura.total / 2).toFixed(2)}) para confirmar.
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: PAGO */}
                        <div className="p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Realizar Pago</h2>

                            <form>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                    <div className="grid gap-2">
                                        {metodosDisponibles.map((metodo) => (
                                            <label key={metodo.id} className={`border p-3 rounded-lg flex items-center cursor-pointer transition ${metodoSeleccionado === metodo.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'hover:bg-gray-50'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="metodo" 
                                                    value={metodo.id}
                                                    checked={metodoSeleccionado === metodo.id}
                                                    onChange={(e) => setMetodoSeleccionado(e.target.value)}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="ml-3 font-medium text-gray-700">{metodo.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* AQUÍ IRÍA LA LÓGICA DE MONTO A PAGAR (Total o Parcial) */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Pagar Hoy</label>
                                    <input type="number" className="w-full border-gray-300 rounded-md shadow-sm" defaultValue={factura.total} />
                                </div>

                                <button type="button" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition">
                                    Procesar Pago
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}