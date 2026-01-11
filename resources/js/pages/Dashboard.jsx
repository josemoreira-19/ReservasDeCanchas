import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Panel Principal</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* BIENVENIDA */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8 border border-slate-100">
                        <div className="p-8 text-slate-900">
                            <h3 className="text-2xl font-bold mb-2">¡Hola, {auth.user.name}! 👋</h3>
                            <p className="text-slate-500">Bienvenido de nuevo al sistema de gestión de Canchas Llaverito.</p>
                        </div>
                    </div>

                    {/* TARJETAS DE ACCESO RÁPIDO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Tarjeta 1: Nueva Reserva */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition group cursor-pointer">
                            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition">
                                📅
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Reservar Cancha</h4>
                            <p className="text-sm text-slate-500 mb-4">Busca disponibilidad y agenda tu próximo partido ahora mismo.</p>
                            <Link href={route('canchas.index')} className="text-indigo-600 font-semibold text-sm hover:underline">Ir a reservar &rarr;</Link>
                        </div>

                        {/* Tarjeta 2: Mis Reservas */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition group cursor-pointer">
                            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition">
                                🎾
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Mis Reservas</h4>
                            <p className="text-sm text-slate-500 mb-4">Revisa tu historial, descarga facturas o gestiona tus pagos pendientes.</p>
                            <Link href={route('reservas.mis-reservas')} className="text-emerald-600 font-semibold text-sm hover:underline">Ver historial &rarr;</Link>
                        </div>

                        {/* Tarjeta 3: Perfil */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition group cursor-pointer">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition">
                                👤
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Mi Perfil</h4>
                            <p className="text-sm text-slate-500 mb-4">Actualiza tus datos personales, contraseña y preferencias.</p>
                            <Link href={route('profile.edit')} className="text-blue-600 font-semibold text-sm hover:underline">Configurar cuenta &rarr;</Link>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}