import React, { useState, useEffect, useRef } from 'react'; 
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

export default function Pago({ auth, reserva, factura, metodosDisponibles }) {
    const { errors } = usePage().props; 

    // CÁLCULOS
    const total = parseFloat(factura.total);
    const abonado = parseFloat(reserva.monto_comprobante || 0);
    const restante = total - abonado;
    
    // ESTADOS
    const [metodoSeleccionado, setMetodoSeleccionado] = useState(metodosDisponibles[0]?.id || '');
    const [montoPagar, setMontoPagar] = useState(restante); 
    const [codigoTransaccion, setCodigoTransaccion] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [pagoCompletado, setPagoCompletado] = useState(false);
    
    const [errorLocal, setErrorLocal] = useState(null);

    // REFERENCIAS (Banderas para el Guardián)
    const enviandoPagoRef = useRef(false); // Estamos pagando
    const cancelandoRef = useRef(false);   // Estamos cancelando voluntariamente

    // FUNCIÓN 1: PROCESAR PAGO (Botón Azul)
    const procesarPago = (e) => {
        e.preventDefault();
        setErrorLocal(null);

        const monto = parseFloat(montoPagar);

        if (isNaN(monto) || monto <= 0) {
            setErrorLocal("Por favor ingrese un monto válido mayor a 0.");
            return; 
        }

        if (monto > (restante + 0.01)) {
            setErrorLocal(`No puedes pagar $${monto} porque la deuda restante es solo $${restante.toFixed(2)}.`);
            return; 
        }

        if (metodoSeleccionado !== 'efectivo' && (codigoTransaccion.toLowerCase().trim() !== 'confia pelado' && codigoTransaccion !== "1")) {
            setErrorLocal('El código de comprobante es incorrecto.');
            return; 
        }

        setProcesando(true);
        enviandoPagoRef.current = true; // Avisamos al guardián

        router.post(route('facturas.procesar', reserva.id), {
            metodo: metodoSeleccionado,
            monto: monto,
            codigo: codigoTransaccion
        }, {
            onError: () => {
                setProcesando(false);
                enviandoPagoRef.current = false; // Falló, reactivamos guardián
            },
            onSuccess: () => {
                setPagoCompletado(true);
            },
            onFinish: () => setProcesando(false)
        });
    };

    // FUNCIÓN 2: CANCELAR AHORA (Botón Rojo)
    const cancelarAhora = () => {
        if (confirm("¿Estás seguro de cancelar? La reserva se eliminará inmediatamente.")) {
            setProcesando(true);
            cancelandoRef.current = true; // Avisamos al guardián que NO bloquee la salida

            // Usamos la misma ruta de 'cancelar-abandono' porque hace lo mismo: borrar.
            router.post(route('reservas.cancelar-abandono', reserva.id), {}, {
                onFinish: () => setProcesando(false)
            });
        }
    };

    // EL GUARDIÁN (useEffect)
    useEffect(() => {
        const advertirSalida = (e) => {
            // Si ya pagó, está pagando, O ESTÁ CANCELANDO VOLUNTARIAMENTE... lo dejamos pasar.
            if (pagoCompletado || enviandoPagoRef.current || cancelandoRef.current) return;

            const mensaje = "⚠️ ¿Seguro que quieres salir?\n\nTu reserva quedará PENDIENTE y el sistema la eliminará en 5 minutos si no registras el pago.";

            // Navegación interna (Navbar)
            if (e.type === 'before') {
                // Confirm devuelve true si el usuario da OK. Si da OK, NO prevenimos (dejamos salir).
                // Si da Cancelar, prevenimos.
                if (!window.confirm(mensaje)) {
                    e.preventDefault(); 
                }
            } 
            // Cierre de navegador
            else {
                e.preventDefault();
                e.returnValue = mensaje;
            }
        };

        const removeInertiaListener = router.on('before', advertirSalida);
        window.addEventListener('beforeunload', advertirSalida);

        return () => {
            removeInertiaListener();
            window.removeEventListener('beforeunload', advertirSalida);
        };
    }, [pagoCompletado]);


    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pago Reserva #${reserva.id}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg grid grid-cols-1 md:grid-cols-2">
                        
                        {/* --- COLUMNA IZQUIERDA: RESUMEN --- */}
                        <div className="p-8 bg-gray-50 border-r border-gray-200 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Detalle de Reserva</h2>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Cancha:</span>
                                        <span className="font-semibold text-gray-900">{reserva.cancha.nombre}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tipo:</span>
                                        <span className="font-semibold text-gray-900">{reserva.cancha.tipo}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Fecha:</span>
                                        <span className="font-semibold text-gray-900">{reserva.fecha}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Hora:</span>
                                        <span className="font-semibold text-gray-900"> de {reserva.hora_inicio.substring(0, 5)} a {reserva.hora_fin.substring(0, 5)}</span>
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
                        {/* FORMULARIO */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Realizar Abono</h2>

                            {(errors.monto || errorLocal) && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200 flex items-start gap-2">
                                    <span>🚫</span><span>{errors.monto || errorLocal}</span>
                                </div>
                            )}

                            <form onSubmit={procesarPago}>
                                {/* Inputs de Método y Voucher... */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Método</label>
                                    {metodosDisponibles.map((metodo) => (
                                        <label key={metodo.id} className="flex items-center p-2 mb-2 border rounded cursor-pointer hover:bg-gray-50">
                                            <input 
                                                type="radio" name="metodo" value={metodo.id}
                                                checked={metodoSeleccionado === metodo.id}
                                                onChange={(e) => setMetodoSeleccionado(e.target.value)}
                                                className="text-indigo-600 mr-2"
                                            />
                                            {metodo.nombre}
                                        </label>
                                    ))}
                                </div>

                                {metodoSeleccionado !== 'efectivo' && (
                                    <div className="mb-4">
                                        <input 
                                            type="text" required value={codigoTransaccion}
                                            onChange={(e) => { setCodigoTransaccion(e.target.value); setErrorLocal(null); }}
                                            placeholder='Voucher: "confia pelado"'
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
                                    <input 
                                        type="number" step="0.01" value={montoPagar}
                                        onChange={(e) => { setMontoPagar(e.target.value); setErrorLocal(null); }}
                                        className="w-full border-gray-300 rounded-md shadow-sm font-bold text-lg"
                                        disabled={restante <= 0}
                                    />
                                </div>

                                {/* BOTONES DE ACCIÓN */}
                                <div className="flex flex-col gap-3">
                                    {/* Botón Pagar (Azul) */}
                                    <button 
                                        type="submit" 
                                        disabled={procesando || restante <= 0}
                                        className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {procesando ? 'Procesando...' : 'Confirmar Pago'}
                                    </button>

                                    {/* Botón Cancelar (Rojo) - Solo si está pendiente y no pagada */}
                                    {reserva.estado === 'pendiente' && !pagoCompletado && (
                                        <button 
                                            type="button" // Importante: type button para no enviar el form
                                            onClick={cancelarAhora}
                                            disabled={procesando}
                                            className="w-full py-2 px-4 border border-red-300 rounded-lg text-sm font-bold text-red-600 bg-white hover:bg-red-50"
                                        >
                                            Cancelar y Borrar Reserva
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}   