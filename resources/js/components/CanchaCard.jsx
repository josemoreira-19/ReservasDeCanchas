import { useState } from 'react';

export default function CanchaCard({ cancha }) {
    // Si no hay imágenes, usa una por defecto
    const images = cancha.images.length > 0 ? cancha.images : [{ ruta: 'default.jpg' }];
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative group">
            {/* Imagen Principal */}
            <div className="h-48 w-full bg-gray-200 relative">
                <img 
                    src={`/storage/${images[currentIndex].ruta}`} 
                    alt={cancha.nombre}
                    className="w-full h-full object-cover transition duration-500"
                />
                
                {/* Botón para cambiar foto (Solo si hay más de 1) */}
                {images.length > 1 && (
                    <button 
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                        ⮕
                    </button>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-bold text-xl">{cancha.nombre}</h3>
                <p className="text-gray-500">{cancha.tipo}</p>
                <div className="mt-2 flex justify-between items-center">
                    <span className="text-green-600 font-bold">${cancha.precio_por_hora}/h</span>
                    {/* Puedes mostrar un badge si es fin de semana */}
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Finde: ${cancha.precio_fin_de_semana}
                    </span>
                </div>
            </div>
        </div>
    );
}