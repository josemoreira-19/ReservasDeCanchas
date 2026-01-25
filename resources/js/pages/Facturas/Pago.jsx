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
    
    // --- NUEVO ESTADO PARA LA IMAGEN ---
    const [imagenComprobante, setImagenComprobante] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    // -----------------------------------

    const [procesando, setProcesando] = useState(false);
    const [pagoCompletado, setPagoCompletado] = useState(false);
    const [errorLocal, setErrorLocal] = useState(null);

    // REFERENCIAS
    const enviandoPagoRef = useRef(false);
    const cancelandoRef = useRef(false);
    const saliendoRef = useRef(false);

    // Manejar selección de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setErrorLocal("La imagen es muy pesada (Máx 5MB)");
                return;
            }
            setImagenComprobante(file);
            setPreviewUrl(URL.createObjectURL(file)); // Crear preview local
            setErrorLocal(null);
        }
    };

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

        if (metodoSeleccionado !== 'efectivo') {
            // Validar que suban foto si no es efectivo (Opcional, según lo que pida el docente)
            if (!imagenComprobante) {
                setErrorLocal('Debes subir una foto del comprobante.');
                return;
            }
        }

        setProcesando(true);
        enviandoPagoRef.current = true;

        // Inertia maneja automáticamente el FormData si detecta un archivo
        router.post(route('facturas.procesar', reserva.id), {
            metodo: metodoSeleccionado,
            monto: monto,
            codigo: codigoTransaccion,
            comprobante: imagenComprobante, 
        }, {
            forceFormData: true, 
            onError: () => {
                setProcesando(false);
                enviandoPagoRef.current = false;
            },
            onSuccess: () => {
                setPagoCompletado(true);
            },
            onFinish: () => setProcesando(false)
        });
    };

    // ... (Mantener funciones cancelarAhora, salirSinPagar y useEffect del Guardián igual que antes) ...
    // Solo pego las funciones para que el código compile si lo copias directo
    const cancelarAhora = () => {
        if (confirm("¿Estás seguro de cancelar?")) {
            setProcesando(true);
            cancelandoRef.current = true; 
            router.post(route('reservas.cancelar-abandono', reserva.id), {}, { onFinish: () => setProcesando(false) });
        }
    };
    const salirSinPagar = () => {
        saliendoRef.current = true;
        router.visit(route('dashboard')); 
    };
    useEffect(() => {
        const advertirSalida = (e) => {
            if (pagoCompletado || enviandoPagoRef.current || cancelandoRef.current || saliendoRef.current) return;
            const mensaje = "⚠️ ¿Seguro que quieres salir?";
            if (e.type === 'before') { if (!window.confirm(mensaje)) e.preventDefault(); } 
            else { e.preventDefault(); e.returnValue = mensaje; }
        };
        const removeInertiaListener = router.on('before', advertirSalida);
        window.addEventListener('beforeunload', advertirSalida);
        return () => { removeInertiaListener(); window.removeEventListener('beforeunload', advertirSalida); };
    }, [pagoCompletado]);


    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pago Reserva #${reserva.id}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg grid grid-cols-1 md:grid-cols-2">
                        
                        {/* COLUMNA IZQUIERDA (Igual que tu código) */}
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

                        {/* COLUMNA DERECHA: FORMULARIO */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">
                                {restante > 0 ? 'Registrar Pago / Abono' : 'Detalles del Pago'}
                            </h2>

                            {(errors.monto || errorLocal || errors.comprobante) && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200 flex items-start gap-2">
                                    <span>🚫</span><span>{errors.monto || errorLocal || errors.comprobante}</span>
                                </div>
                            )}

                            <form onSubmit={procesarPago}>
                                {/* SELECCIÓN MÉTODO DE PAGO */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {metodosDisponibles.map((metodo) => (
                                            <label key={metodo.id} className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition ${metodoSeleccionado === metodo.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                                                <input 
                                                    type="radio" name="metodo" value={metodo.id}
                                                    checked={metodoSeleccionado === metodo.id}
                                                    onChange={(e) => setMetodoSeleccionado(e.target.value)}
                                                    className="sr-only" 
                                                />
                                                <span className="font-bold">{metodo.nombre}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* CAMPOS DE TRANSFERENCIA / DEPÓSITO */}
                                {metodoSeleccionado !== 'efectivo' && (
                                    <div className="mb-4 animate-fade-in-down bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        

                                        {/* Subir Imagen */}
                                        <div className="mb-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                                Foto del Comprobante
                                            </label>
                                            
                                            <div className="flex items-center gap-3">
                                                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded shadow-sm text-sm">
                                                    <span>{imagenComprobante ? 'Cambiar Foto' : 'Subir Foto'}</span>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="hidden" 
                                                    />
                                                </label>
                                                {imagenComprobante && (
                                                    <span className="text-xs text-green-600 truncate max-w-[150px]">
                                                        {imagenComprobante.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Preview de Imagen */}
                                        {previewUrl && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-400 mb-1">Vista previa:</p>
                                                <img 
                                                    src={previewUrl} 
                                                    alt="Vista previa comprobante" 
                                                    className="w-full h-32 object-cover rounded-md border border-gray-300"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monto a Pagar ($)
                                        </label>

                                        <input 
                                            type="text"
                                            inputMode="decimal"
                                            value={montoPagar}
                                            onChange={(e) => {
                                                let value = e.target.value;

                                                // Solo números y punto
                                                value = value.replace(/[^0-9.]/g, '');

                                                // Solo un punto
                                                if ((value.match(/\./g) || []).length > 1) return;

                                                // Máx 2 decimales
                                                if (value.includes('.')) {
                                                    const [int, dec] = value.split('.');
                                                    value = int + '.' + dec.slice(0, 2);
                                                }

                                                setMontoPagar(value);
                                                setErrorLocal(null);
                                            }}
                                            className="w-full border-gray-300 rounded-md shadow-sm font-bold text-xl py-3 px-4 text-gray-900"
                                            disabled={restante <= 0}
                                            maxLength={5}
                                        />
                                    </div>
                                {/* BOTONES DE ACCIÓN */}
                                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="submit" 
                                        disabled={procesando || restante <= 0}
                                        className="w-full py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 hover:scale-[1.02] transition-transform"
                                    >
                                        {procesando ? 'Procesando...' : `Confirmar Pago`}
                                    </button>
                                    
                                    {/* ... Resto de botones (Salir, Cancelar) igual que antes ... */}
                                    {(auth.user.role === 'admin' || restante <= 0) && !procesando && (
                                        <button type="button" onClick={salirSinPagar} className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition">
                                            {restante <= 0 ? 'Volver al Inicio' : 'Salir sin cobrar ahora'}
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