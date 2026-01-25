import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Asegúrate de importar esto si usas dayjs en español

export default function Dashboard({ auth }) {
    // Datos de ejemplo para las estadísticas
    const stats = [
        { title: 'Partidos Jugados', value: '23 casi 24', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.625 2.625 0 11-5.25 0v2.875M6.75 18.75H4.875a2.625 2.625 0 01-2.625-2.625V8.625a2.625 2.625 0 015.25 0v3.75m12 6.375h1.875a2.625 2.625 0 002.625-2.625V8.625a2.625 2.625 0 00-5.25 0v3.75" /> },
        { title: 'Próxima Reserva', value: 'OK Mañana', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /> },
        { title: 'Saldo Pendiente', value: '$0.001', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Panel de Control</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* 1. HERO SECTION CON GRADIENTE */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 shadow-xl text-white">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                        
                        <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-3xl font-bold mb-2">¡Hola, {auth.user.name.split(' ')[0]}! 👋</h3>
                                <p className="text-indigo-100 text-lg max-w-lg">
                                    ¿Listo para el partido? Gestiona tus reservas y revisa tu historial desde aquí.
                                </p>
                            </div>
                            <Link 
                                href={route('canchas.index')}
                                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:bg-indigo-50 hover:scale-105 transition transform"
                            >
                                Reservar Ahora
                            </Link>
                        </div>
                    </div>

                    {/* 2. STATS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        {stat.icon}
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. GRID PRINCIPAL ASIMÉTRICO */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* COLUMNA IZQUIERDA (ACCIONES) - 2/3 del ancho */}
                        <div className="lg:col-span-2 space-y-6">
                            <h4 className="text-xl font-bold text-slate-800">Acceso Rápido</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Card Mis Reservas */}
                                <Link href={route('reservas.mis-reservas')} className="group bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between h-40">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800">Mis Reservas</h5>
                                        <p className="text-xs text-slate-500 mt-1">Ver historial y pagos pendientes.</p>
                                    </div>
                                </Link>

                                {/* Card Perfil */}
                                <Link href={route('profile.edit')} className="group bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between h-40">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-slate-800">Mi Cuenta</h5>
                                        <p className="text-xs text-slate-500 mt-1">Actualizar datos y seguridad.</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Banner Secundario / Promo */}
                            <div className="bg-indigo-900 rounded-xl p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                                <div className="z-10">
                                    <h5 className="font-bold text-lg">¿Dudas sobre el reglamento?</h5>
                                    <p className="text-indigo-200 text-sm mt-1">Revisa las normas de uso de Canchas Llaverito.</p>
                                </div>
                                <div className="z-10">
                                    <button className="text-xs bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded font-bold transition" onClick={window.alert.bind(null, 'No seas sapito, las normas no existen, be happy :D')}>
                                        Leer Normas
                                    </button>
                                </div>
                                {/* Decoración de fondo */}
                                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500 rounded-full blur-2xl opacity-20 -mr-10 -mt-10"></div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA (INFO / NOTIFICACIONES) - 1/3 del ancho */}
                        <div className="space-y-6">
                            
                            {/* Widget de Próximo Partido (Ejemplo Visual) */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Próximo Evento</h4>
                                <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200 border-dashed">
                                    <span className="text-3xl block mb-2">⚽</span>
                                    <p className="text-slate-500 text-sm">Quizá algún día habilitemos enventos, de momento siga gastando.</p>
                                    <Link href={route('canchas.index')} className="text-indigo-600 text-xs font-bold mt-2 inline-block hover:underline">
                                        ¡Agenda aquí!
                                    </Link>
                                </div>
                            </div>

                            {/* Widget de Contacto */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                <h4 className="font-bold text-slate-800 mb-4">Soporte</h4>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                        </div>
                                        <address>+593 98 352 6285</address>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                        </div>
                                        <address type="address">Chone, Manabí</address>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}