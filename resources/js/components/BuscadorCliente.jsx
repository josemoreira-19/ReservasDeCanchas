import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BuscadorCliente({ onSeleccionar }) {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    
    const [seleccionado, setSeleccionado] = useState(false);

    useEffect(() => {
        
        if (seleccionado) return;

        const timeoutId = setTimeout(() => {
            if (query.length >= 2) {
                buscarClientes();
            } else {
                setResultados([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [query, seleccionado]); 

    const buscarClientes = async () => {
        setBuscando(true);
        try {
            const res = await axios.get(route('api.usuarios.buscar'), { params: { q: query } });
            setResultados(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setBuscando(false);
        }
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setSeleccionado(false); 

        if (e.target.value === '') {
            onSeleccionar({ id: '' });
        }
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Cliente (Cédula o Nombre) <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                className={`w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${seleccionado ? 'bg-green-50 border-green-300 text-green-800 font-bold' : 'border-gray-300'}`}
                placeholder="Escribe la cédula..."
                value={query}
                onChange={handleInputChange}
            />

            {buscando && <div className="absolute right-3 top-9 text-gray-400 text-xs">Buscando...</div>}

            {resultados.length > 0 && !seleccionado && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {resultados.map(user => (
                        <li 
                            key={user.id}
                            onClick={() => {
                                onSeleccionar(user);
                                setQuery(`${user.name} - ${user.cedula}`);
                                setResultados([]);
                                setSeleccionado(true); 
                            }}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b last:border-b-0"
                        >
                            <div className="font-bold text-gray-800">{user.name}</div>
                            <div className="text-gray-500 text-xs">C.I: {user.cedula}</div>
                        </li>
                    ))}
                </ul>
            )}
            
            {/* Solo mostramos el error si NO está buscando Y NO ha seleccionado nada */}
            {query.length >= 3 && resultados.length === 0 && !buscando && !seleccionado && (
                <div className="text-xs text-red-500 mt-1 font-bold">
                    🚫 No se encontró el cliente. ¿Está registrado?
                </div>
            )}
        </div>
    );
}