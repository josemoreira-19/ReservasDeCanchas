import React from 'react';

export default function ApplicationLogo({ className }) {
    return (
        <svg 
            viewBox="0 0 200 200" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={className}
        >
            {/* --- CUERPO DEL LLAVERO (Estilo Anime Tierno) --- */}
            
            {/* La anilla del llavero */}
            <circle cx="100" cy="30" r="20" stroke="#6366F1" strokeWidth="8" />
            
            {/* Cuerpo principal (Redondito) */}
            <circle cx="100" cy="110" r="75" fill="#4F46E5" />
            <circle cx="100" cy="110" r="70" fill="#6366F1" />
            
            {/* Brillo en la cabeza (Estilo Kawaii) */}
            <ellipse cx="70" cy="80" rx="15" ry="8" fill="white" fillOpacity="0.4" transform="rotate(-45 70 80)" />

            {/* Ojos Anime */}
            {/* Ojo Izquierdo */}
            <ellipse cx="70" cy="110" rx="12" ry="18" fill="white" />
            <circle cx="70" cy="108" r="6" fill="#1E1B4B" />
            <circle cx="74" cy="104" r="3" fill="white" /> {/* Brillo ojo */}

            {/* Ojo Derecho */}
            <ellipse cx="130" cy="110" rx="12" ry="18" fill="white" />
            <circle cx="130" cy="108" r="6" fill="#1E1B4B" />
            <circle cx="134" cy="104" r="3" fill="white" /> {/* Brillo ojo */}

            {/* Boca Sonriente Pequeña */}
            <path d="M90 130 Q100 135 110 130" stroke="white" strokeWidth="3" strokeLinecap="round" />

            {/* Mejillas sonrojadas */}
            <circle cx="60" cy="125" r="5" fill="#F472B6" fillOpacity="0.6" />
            <circle cx="140" cy="125" r="5" fill="#F472B6" fillOpacity="0.6" />

            {/* Rayo en la barriga (Tu toque eléctrico) */}
            <path d="M95 145 L105 145 L100 155 L110 155 L95 175 L100 160 L90 160 L95 145 Z" fill="#FACC15" stroke="white" strokeWidth="1"/>
        </svg>
    );
}