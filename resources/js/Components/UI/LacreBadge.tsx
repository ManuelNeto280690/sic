import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface LacreBadgeProps {
    codigo: string;
    verified?: boolean;
    className?: string;
}

export const LacreBadge: React.FC<LacreBadgeProps> = ({ codigo, verified = true, className = '' }) => {
    return (
        <span
            title="Lacre de Segurança Inviolável com integridade criptográfica da cadeia de custódia"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0d1a26] border border-[#C5A059]/40 text-[#DFC07A] text-[11px] font-mono tracking-wider rounded shadow-sm hover:border-[#C5A059] transition-colors ${className}`}
        >
            <Lock className="w-3 h-3 text-[#C5A059]" />
            <span className="select-all font-semibold">{codigo}</span>
            {verified && <ShieldCheck className="w-3 h-3 text-emerald-400 ml-0.5" title="Integridade verificada" />}
        </span>
    );
};
