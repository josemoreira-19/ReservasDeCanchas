import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, canchas }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Canchas" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-4">Listado de Canchas</h1>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Nombre</th>
                                    <th className="p-2">Tipo</th>
                                    <th className="p-2">Precio/h</th>
                                    <th className="p-2">Estado</th>
                                    <th className="p-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {canchas.map((cancha) => (
                                    <tr key={cancha.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{cancha.nombre}</td>
                                        <td className="p-2 capitalize">{cancha.tipo}</td>
                                        <td className="p-2">${cancha.precio_por_hora}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-xs ${cancha.estado === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {cancha.estado}
                                            </span>
                                        </td>
                                        
                                        <td className="p-2 text-center">
                                            {auth.user.role === 'admin' ? (
                                                <div>
                                                    <button className="text-blue-600 mr-2">Editar</button>
                                                    <button className="bg-blue-500 text-white px-3 py-1 rounded">Reservar</button>
                                                </div>
                                            ) : (<button className="bg-blue-500 text-white px-3 py-1 rounded">Reservar</button>)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}