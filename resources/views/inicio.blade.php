<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canchas Llaverito - Reserva tu Pasión</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <style>
        body { font-family: 'Inter', sans-serif; }
        
        /* --- ANIMACIONES GLOBALES --- */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        .blob {
            position: absolute;
            filter: blur(40px);
            z-index: -1;
            opacity: 0.4;
        }


    </style>
</head>
<body class="bg-slate-50 text-slate-800 relative overflow-x-hidden">

    <div class="blob bg-indigo-300 w-96 h-96 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
    <div class="blob bg-blue-200 w-80 h-80 rounded-full bottom-0 right-0 translate-x-1/3 translate-y-1/3"></div>

    <nav class="w-full py-6 px-6 md:px-12 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div class="flex items-center gap-2">
            <img 
                src="{{ asset('images/mascota.png') }}" 
                alt="Logo" 
                class="w-12 h-auto btn-electric rounded-full"
            >
            <span class="text-xl font-bold tracking-tight text-slate-900">LLAVERITO</span>
        </div>
        <div class="hidden md:flex space-x-8 items-center">
            <a href="#inicio" class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Inicio</a>
            <a href="#caracteristicas" class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Servicios</a>
            <a href="{{ route('contactanos') }}" class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Contáctanos</a>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('login') }}" class="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">Ingresar</a>
            <a href="{{ route('register') }}" class="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 btn-electric">
                Crear Cuenta
            </a>
        </div>
    </nav>

    <header id="inicio" class="container mx-auto px-6 py-16 md:py-24 flex flex-col-reverse md:flex-row items-center gap-12">
        
        <div class="w-full md:w-1/2 text-center md:text-left animate-up">
            <span class="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wide mb-4 border border-indigo-100">
                SISTEMA DE GESTIÓN DEPORTIVA
            </span>
            <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Tu Cancha,<br> 
                <span class="text-indigo-600">Tu Horario.</span>
            </h1>
            <p class="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                Reserva canchas de fútbol, vóley y tenis en segundos. Gestiona tus pagos, descarga facturas y asegura tu partido sin complicaciones.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="{{ route('login') }}" class="btn-electric px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-xl hover:-translate-y-1">
                Reservar Ahora
            </a>
            <a href="#caracteristicas" class="px-8 py-4 bg-white text-slate-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition hover:-translate-y-1">
                Ver Características
            </a>
            </div>
            
            <div class="mt-12 flex gap-8 justify-center md:justify-start border-t border-gray-200 pt-8">
                <div>
                    <p class="text-3xl font-bold text-slate-900">24/7</p>
                    <p class="text-xs text-slate-500 uppercase tracking-wide">Disponibilidad</p>
                </div>
                <div>
                    <p class="text-3xl font-bold text-slate-900">+3</p>
                    <p class="text-xs text-slate-500 uppercase tracking-wide">Tipos de Deporte</p>
                </div>
            </div>
        </div>

        <div class="w-full md:w-1/2 relative animate-up delay-200">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                     alt="Cancha Deportiva" 
                     class="w-full object-cover hover:scale-105 transition duration-700">
                
                <div class="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg flex items-center gap-3 max-w-xs">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">Cancha Disponible</p>
                        <p class="text-xs text-slate-500">Reserva confirmada al instante</p>
                    </div>
                </div>
            </div>
            <div class="absolute -z-10 top-10 -right-10 w-full h-full bg-indigo-50 rounded-3xl transform rotate-3"></div>
        </div>

    </header>

    <section id="caracteristicas" class="py-20 bg-white">
        <div class="container mx-auto px-6">
            <div class="text-center max-w-2xl mx-auto mb-16">
                <h2 class="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas para jugar</h2>
                <p class="text-slate-500">Diseñado para deportistas. Una interfaz clara, rápida y pensada para que solo te preocupes por ganar.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition border border-transparent hover:border-gray-100 group">
                    <div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition">📅</div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3">Agenda Inteligente</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Visualiza los horarios disponibles en tiempo real. Evita cruces de horarios y asegura tu espacio.</p>
                </div>

                <div class="p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition border border-transparent hover:border-gray-100 group">
                    <div class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition">🧾</div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3">Facturación PDF</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Genera tus comprobantes automáticamente con todos los datos legales necesarios. Incluye tu cédula y desglose.</p>
                </div>

                <div class="p-8 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition border border-transparent hover:border-gray-100 group">
                    <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition">💳</div>
                    <h3 class="text-xl font-bold text-slate-900 mb-3">Pagos Flexibles</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">Registra abonos del 50% para separar la cancha y cancela el resto el día del partido. Control total.</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="text-center md:text-left">
                <h4 class="text-xl font-bold mb-2">Canchas Llaverito</h4>
                <p class="text-slate-400 text-sm">Proyecto de Ingeniería de Software - ULEAM Chone</p>
                <p class="text-slate-500 text-xs mt-1">&copy; {{ date('Y') }} Todos los derechos reservados.</p>
                <a href="{{ route('contactanos') }}" class="text-slate-400 hover:text-white transition underline">Contacto y Ayuda</a>
            </div>
            <div class="flex gap-4">
                <a href="{{ route('register') }}" class="px-6 py-3 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-500 transition">
                    Empezar Ahora
                </a>
            </div>
        </div>
    </footer>

</body>
</html>