import React from 'react';
import { router } from '@inertiajs/react';

export default function ModalExito({ isOpen, onClose, reservaId }) {
    if (!isOpen) return null;

    const irAFacturacion = () => {
        // Redirigimos a la vista de pago de esa factura/reserva
        // Asumiremos que existe una ruta 'facturas.pago'
        router.get(route('facturas.pago', reservaId));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center animate-fade-in-up transform transition-all scale-100">
                
                {/* Icono de Check Animado o Estático */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Reserva Exitosa!</h3>
                <p className="text-gray-500 mb-6 text-sm">
                    La reserva se ha guardado como <strong>Pendiente</strong>. 
                    <br/>
                    ¿Qué deseas hacer ahora?
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={irAFacturacion}
                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                        Ir a Pagar / Factura
                    </button>

                    <button 
                        onClick={onClose}
                        className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                        Reservar otra cancha
                    </button>
                </div>
            </div>
        </div>
    );
}