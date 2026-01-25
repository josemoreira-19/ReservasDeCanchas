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
    const cancelandoRef = useRef(false);   // Estamos cancelando y borrando
    const saliendoRef = useRef(false);     // Estamos saliendo voluntariamente (Admin)

    // PROCESAR PAGO (Botón Azul)
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

    // CANCELAR AHORA (Botón Rojo - Eliminar Reserva)
    const cancelarAhora = () => {
        if (confirm("¿Estás seguro de cancelar? La reserva se eliminará inmediatamente.")) {
            setProcesando(true);
            cancelandoRef.current = true; 

            router.post(route('reservas.cancelar-abandono', reserva.id), {}, {
                onFinish: () => setProcesando(false)
            });
        }
    };

    // SALIR SIN PAGAR (Botón Gris - Solo Admin)
    const salirSinPagar = () => {
        // Activamos la bandera para que el guardián nos deje pasar
        saliendoRef.current = true;
        // Redirigimos al Dashboard
        router.visit(route('dashboard')); 

    // EL GUARDIÁN (useEffect)
    useEffect(() => {
        const advertirSalida = (e) => {
            // LÓGICA ACTUALIZADA: Si ya pagó, está pagando, cancelando O SALIENDO VOLUNTARIAMENTE... pase.
            if (pagoCompletado || enviandoPagoRef.current || cancelandoRef.current || saliendoRef.current) return;

            const mensaje = "⚠️ ¿Seguro que quieres salir?\n\nTu reserva quedará PENDIENTE y el sistema la eliminará en 5 minutos si no registras el pago.";

            // Navegación interna (Navbar)
            if (e.type === 'before') {
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
                                        <span className="text-lg font-bold">${restante.toFixed(2)}</span>
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
                            <h2 className="text-xl font-bold text-gray-800 mb-6">
                                {restante > 0 ? 'Registrar Pago / Abono' : 'Detalles del Pago'}
                            </h2>

                            {(errors.monto || errorLocal) && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200 flex items-start gap-2">
                                    <span>🚫</span><span>{errors.monto || errorLocal}</span>
                                </div>
                            )}

                            <form onSubmit={procesarPago}>
                                {/* Inputs de Método y Voucher... */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {metodosDisponibles.map((metodo) => (
                                            <label key={metodo.id} className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition ${metodoSeleccionado === metodo.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                                                <input 
                                                    type="radio" name="metodo" value={metodo.id}
                                                    checked={metodoSeleccionado === metodo.id}
                                                    onChange={(e) => setMetodoSeleccionado(e.target.value)}
                                                    className="sr-only" // Ocultamos el radio nativo feo
                                                />
                                                <span className="font-bold">{metodo.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {metodoSeleccionado !== 'efectivo' && (
                                    <div className="mb-4 animate-fade-in-down">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Comprobante / Voucher</label>
                                        <input 
                                            type="text" required value={codigoTransaccion}
                                            onChange={(e) => { setCodigoTransaccion(e.target.value); setErrorLocal(null); }}
                                            placeholder='Ej: 123456'
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar ($)</label>
                                    <input 
                                        type="number" step="0.01" value={montoPagar}
                                        onChange={(e) => { setMontoPagar(e.target.value); setErrorLocal(null); }}
                                        className="w-full border-gray-300 rounded-md shadow-sm font-bold text-xl py-3 px-4 text-gray-900"
                                        disabled={restante <= 0}
                                    />
                                </div>

                                {/* BOTONES DE ACCIÓN */}
                                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                                    
                                    {/* 1. Botón Pagar (Principal) */}
                                    <button 
                                        type="submit" 
                                        disabled={procesando || restante <= 0}
                                        className="w-full py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 hover:scale-[1.02] transition-transform"
                                    >
                                        {procesando ? 'Procesando...' : `Confirmar Pago de $${parseFloat(montoPagar || 0).toFixed(2)}`}
                                    </button>

                                    {/* 2. Botón SALIR (Para el Admin o si ya está pagada) */}
                                    {/* Se muestra si eres Admin O si el usuario ya pagó todo (no tiene sentido retenerlo) */}
                                    {(auth.user.role === 'admin' || restante <= 0) && !procesando && (
                                        <button 
                                            type="button" 
                                            onClick={salirSinPagar}
                                            className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition"
                                        >
                                            {restante <= 0 ? 'Volver al Inicio' : 'Salir sin cobrar ahora'}
                                        </button>
                                    )}

                                    {/* 3. Botón Cancelar (Rojo) - Solo para reservas pendientes sin abono */}
                                    {reserva.estado === 'pendiente' && abonado <= 0 && !pagoCompletado && (
                                        <button 
                                            type="button" 
                                            onClick={cancelarAhora}
                                            disabled={procesando}
                                            className="w-full py-2 px-4 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                        >
                                            Cancelar y eliminar reserva
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
}