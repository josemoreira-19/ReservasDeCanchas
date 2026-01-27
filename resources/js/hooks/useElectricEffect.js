import { useEffect } from "react";

export default function useElectricEffect() {
    useEffect(() => {

        const handler = (e) => {
            const btn = e.target.closest('.btn-electric');
            if (!btn) return;

            const rect = btn.getBoundingClientRect();

            const s = document.createElement('span');
            s.className = 'spark';

            s.style.left = (e.clientX - rect.left) + 'px';
            s.style.top = (e.clientY - rect.top) + 'px';

            btn.appendChild(s);

            setTimeout(() => s.remove(), 500);
        };

        document.addEventListener('mousemove', handler);

        return () => document.removeEventListener('mousemove', handler);

    }, []);
}
