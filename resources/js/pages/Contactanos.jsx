import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Contactanos({ auth }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Contáctanos" />

            {/* --- NAVBAR SIMPLIFICADO --- */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl font-bold text-indigo-600">
                                    <img 
                                        src="/images/mascota.png"
                                        alt="Logo" 
                                        class="w-12 h-auto btn-electric rounded-full"
                                    ></img>
                                    <span class="text-xl font-bold tracking-tight text-slate-900">LLAVERITO</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
                            
                            {/* Lógica: Si está logueado mostramos "Dashboard", si no, "Login" */}
                            {auth.user ? (
                                <Link href={route('dashboard')} className="text-gray-600 hover:text-gray-900 font-medium">
                                    Ir al Sistema
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="text-gray-600 hover:text-gray-900">Ingresar</Link>
                                    <Link href={route('register')} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Ponte en contacto</h1>
                    <p className="mt-4 text-lg text-gray-500">
                        ¿Tienes dudas sobre cómo reservar una cancha? Estamos aquí para ayudarte.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        
                        {/* COLUMNA IZQUIERDA: INFORMACIÓN DE CONTACTO */}
                        <div className="p-8 bg-indigo-600 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">Información</h3>
                                <p className="mb-6 text-indigo-100">
                                    Visítanos en nuestras instalaciones deportivas o envíanos un mensaje. Respondemos en menos de 24 horas.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <svg className="h-6 w-6 text-indigo-200 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Av. Principal y Calle 5, Chone, Ecuador</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-indigo-200 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>+593 98 353 6285</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-indigo-200 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <address>juanmarcet06@gmail.com</address>
                                    </div>
                                </div>
                            </div>

                            {/* Redes Sociales (Decorativo) */}
                            <div className="mt-8 flex space-x-4">
                                {/* Icono Facebook */}
                                <a href="#" className="text-indigo-200 hover:text-white transition">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                {/* Icono Instagram */}
                                <a href="#" className="text-indigo-200 hover:text-white transition">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.36-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.361-2.618-6.782-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4 4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: FORMULARIO VISUAL (Sin lógica backend por ahora) */}
                        <div className="p-8 bg-white">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Envíanos un mensaje</h3>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="nombre completo" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                        <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="correo valido" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Asunto</label>
                                        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                            <option>Información General</option>
                                            <option>Problemas con una Reserva</option>
                                            <option>Pagos y Facturación</option>
                                            <option>Sugerencias</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mensaje</label>
                                        <textarea rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="¿En qué podemos ayudarte?"></textarea>
                                    </div>

                                    <button className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition duration-150">
                                        Enviar Mensaje
                                    </button>
                                    
                                    <p className="text-xs text-gray-400 mt-2 text-center">
                                        * Este formulario es demostrativo por el momento.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    {/* MAPA DECORATIVO (Opcional, usando un iframe de Google Maps genérico de Chone) */}
                    <div className="h-64 w-full bg-gray-200">
                         <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15957.536643666014!2d-80.1037286!3d-0.6923851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902a365440656071%3A0x629158c5c7210156!2sChone!5e0!3m2!1ses!2sec!4v1700000000000!5m2!1ses!2sec" 
                            width="100%" 
                            height="100%" 
                            style={{border:0}} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </div>
            
             {/* FOOTER SENCILLO */}
             <footer className="bg-white border-t mt-12 py-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Sistema de Canchas. Todos los derechos reservados.
            </footer>
        </div>
    );
}