import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

export default function Pago({ auth, reserva, factura, metodosDisponibles }) {
    const { errors } = usePage().props; 

    // CÁLCULOS MATEMÁTICOS
    const total = parseFloat(factura.total);
    const abonado = parseFloat(reserva.monto_comprobante || 0);
    const restante = total - abonado;
    const minimoParaConfirmar = total / 2;
    const leFaltaParaConfirmar = Math.max(0, minimoParaConfirmar - abonado);

    // ESTADOS
    const [metodoSeleccionado, setMetodoSeleccionado] = useState(metodosDisponibles[0]?.id || '');
    const [montoPagar, setMontoPagar] = useState(restante); 
    const [codigoTransaccion, setCodigoTransaccion] = useState('');
    const [procesando, setProcesando] = useState(false);

    // 1. NUEVO ESTADO: Para guardar el mensaje de error visualmente
    const [errorLocal, setErrorLocal] = useState(null);

    const procesarPago = (e) => {
        e.preventDefault();
        
        // Limpiamos errores previos al intentar pagar de nuevo
        setErrorLocal(null);

        // --- VALIDACIONES FRONTEND ---
        const monto = parseFloat(montoPagar);

        // A. Validar negativos
        if (isNaN(monto) || monto <= 0) {
            setErrorLocal("Por favor ingrese un monto válido mayor a 0.");
            return; // Detenemos aquí
        }

        // B. Validar exceso de pago
        if (monto > (restante + 0.01)) {
            setErrorLocal(`No puedes pagar $${monto} porque la deuda restante es solo $${restante.toFixed(2)}.`);
            return; // Detenemos aquí
        }

        // C. Validar código "Confía Pelado"
        if (metodoSeleccionado !== 'efectivo') {
            if (codigoTransaccion.toLowerCase().trim() !== 'confia pelado') {
                setErrorLocal('El código de comprobante es incorrecto. Intenta con "confia pelado".');
                return; // Detenemos aquí
            }
        }

        setProcesando(true);

        router.post(route('facturas.procesar', reserva.id), {
            metodo: metodoSeleccionado,
            monto: monto,
            codigo: codigoTransaccion
        }, {
            onError: () => setProcesando(false),
            onFinish: () => setProcesando(false)
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pago Reserva #${reserva.id}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg grid grid-cols-1 md:grid-cols-2">
                        
                        {/* --- COLUMNA IZQUIERDA: RESUMEN (Igual que antes) --- */}
                        <div className="p-8 bg-gray-50 border-r border-gray-200 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Detalle de Deuda</h2>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Cancha:</span>
                                        <span className="font-semibold text-gray-900">{reserva.cancha.nombre}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Fecha:</span>
                                        <span className="font-semibold text-gray-900">{reserva.fecha}</span>
                                    </div>
                                    <hr className="border-gray-200"/>
                                    <div className="flex justify-between items-center">
                                        <span>Total Reserva:</span>
                                        <span className="text-lg font-bold text-gray-800">${total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600">
                                        <span>Ya Abonado:</span>
                                        <span className="font-medium">- ${abonado.toFixed(2)}</span>
                                    </div>
                                    <hr className="border-gray-200"/>
                                    <div className="flex justify-between items-center text-xl font-black text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                        <span>Falta por Pagar:</span>
                                        <span>${restante.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Caja Amarilla Informativa */}
                            {reserva.estado === 'pendiente' && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xl">⚠️</span>
                                        <div>
                                            <strong>Estado: PENDIENTE</strong>
                                            <p className="mt-1">
                                                Para confirmar tu reserva, necesitas haber abonado al menos el 50% del total.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                             {restante <= 0 && (
                                <div className="mt-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg text-center font-bold">
                                    ¡Esta reserva está totalmente pagada!
                                </div>
                            )}
                        </div>

                        {/* --- COLUMNA DERECHA: FORMULARIO --- */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Realizar Abono</h2>

                            {/* 2. CAJA ROJA DE ERRORES: Muestra error local O error del backend */}
                            {(errors.monto || errorLocal) && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200 animate-pulse flex items-start gap-2">
                                    <span>🚫</span>
                                    {/* Muestra el error de Laravel si existe, o si no el nuestro local */}
                                    <span>{errors.monto || errorLocal}</span>
                                </div>
                            )}

                            <form onSubmit={procesarPago}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                    <div className="space-y-2">
                                        {metodosDisponibles.map((metodo) => (
                                            <label key={metodo.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${metodoSeleccionado === metodo.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 shadow-sm' : 'hover:bg-gray-50 border-gray-200'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="metodo" 
                                                    value={metodo.id}
                                                    checked={metodoSeleccionado === metodo.id}
                                                    onChange={(e) => setMetodoSeleccionado(e.target.value)}
                                                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                                />
                                                <span className="ml-3 font-medium text-gray-700">{metodo.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {metodoSeleccionado !== 'efectivo' && (
                                    <div className="mb-6 animate-fade-in-down">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID de Comprobante / Voucher
                                        </label>
                                        <input 
                                            type="text" 
                                            required
                                            value={codigoTransaccion}
                                            onChange={(e) => {
                                                setCodigoTransaccion(e.target.value);
                                                setErrorLocal(null); // Borramos error al escribir
                                            }}
                                            placeholder='Escribe "confia pelado"'
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monto a pagar hoy ($)
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={montoPagar}
                                            onChange={(e) => {
                                                setMontoPagar(e.target.value);
                                                setErrorLocal(null); // Borramos error al escribir
                                            }}
                                            className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 py-3 text-lg font-bold text-gray-900"
                                            placeholder="0.00"
                                            disabled={restante <= 0}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={procesando || restante <= 0}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {procesando ? 'Procesando...' : (restante <= 0 ? 'Deuda Saldada' : 'Confirmar Pago')}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}