import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            
            {/* SECCIÓN IZQUIERDA: IMAGEN DEPORTIVA (Solo visible en pantallas medianas y grandes) */}
            <div className="hidden md:block md:w-1/2 lg:w-3/5 relative bg-slate-900">
                <img 
                    src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
                    alt="Deportes Fondo" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <div className="absolute bottom-20 left-10 text-white z-10">
                    <h2 className="text-4xl font-bold mb-4">Tu juego, tu control.</h2>
                    <p className="text-lg text-slate-300 max-w-md">
                        Gestiona tus reservas de forma rápida y segura. El sistema #1 para deportistas.
                    </p>
                </div>
            </div>

            {/* SECCIÓN DERECHA: FORMULARIO */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center bg-white p-8 md:p-12">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* Encabezado del Formulario */}
                    <div className="text-center">
                        <a href="/" className="inline-block mb-6">
                           {/* Puedes poner tu logo aquí o un texto estilizado */}
                           <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg shadow-indigo-500/30">
                                L
                           </div>
                        </a>
                        <h2 className="text-3xl font-bold text-slate-900">Bienvenido</h2>
                        <p className="text-slate-500 mt-2">Ingresa tus credenciales para continuar</p>
                    </div>

                    {/* Aquí se inyecta el Login.jsx o Register.jsx */}
                    <div className="mt-8">
                        {children}
                    </div>
                    
                    <div className="mt-6 text-center text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} Canchas Llaverito. ULEAM.
                    </div>
                </div>
            </div>
        </div>
    );
}