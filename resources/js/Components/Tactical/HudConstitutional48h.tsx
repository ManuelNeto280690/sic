import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Clock, AlertTriangle, AlertOctagon, UserX, ChevronRight } from 'lucide-react';
import { PageProps } from '@/types';

export const HudConstitutional48h: React.FC = () => {
    const { prazos_urgentes } = usePage<PageProps>().props;
    const detidos = prazos_urgentes?.detidos_criticos || [];
    const totalUrgentes = prazos_urgentes?.total_48h_urgentes || 0;

    const [currentTime, setCurrentTime] = useState(new Date());
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (totalUrgentes === 0 && detidos.length === 0) {
        return (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#132235] border border-[#223750] text-emerald-400 rounded-md text-xs font-sans">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prazos 48h: Conformidade Legal</span>
            </div>
        );
    }

    const maisUrgente = detidos[0];
    let diffSecs = 0;
    if (maisUrgente) {
        const deadline = new Date(maisUrgente.limite_legal_48h).getTime();
        diffSecs = Math.floor((deadline - currentTime.getTime()) / 1000);
    }

    const formatCountdown = (secs: number) => {
        if (secs <= 0) return '00:00:00 (EXPIRADO)';
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    };

    const isExpirado = diffSecs <= 0;
    const isCritico = diffSecs > 0 && diffSecs <= 12 * 3600;

    return (
        <div className="relative">
            <button
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md border text-xs font-sans transition-all ${
                    isExpirado
                        ? 'bg-rose-950/80 text-rose-200 border-rose-700 shadow-sm'
                        : isCritico
                        ? 'bg-amber-950/70 text-amber-200 border-amber-700/80 shadow-sm'
                        : 'bg-[#132235] text-slate-200 border-[#223750] shadow-sm'
                }`}
            >
                {isExpirado ? (
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}

                <div className="flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider opacity-90">
                        <span>Prazos CRA (48h)</span>
                        <span className="px-1.5 py-0.5 bg-black/40 rounded text-[9px] font-mono">
                            {totalUrgentes} {totalUrgentes > 1 ? 'alertas' : 'alerta'}
                        </span>
                    </div>
                    <div className="text-[12px] font-medium font-mono select-all">
                        {maisUrgente ? `${maisUrgente.nome.split(' ')[0]}: ${formatCountdown(diffSecs)}` : 'Monitor ativo'}
                    </div>
                </div>
            </button>

            {/* Dropdown de Detalhes dos Prazos */}
            {expanded && (
                <div className="absolute right-0 mt-2 w-96 bg-[#132235] border border-[#223750] rounded-lg shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#223750]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wide">
                            <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                            Detidos Próximos do Limite Constitucional
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Art. 63º CRA</span>
                    </div>

                    <div className="divide-y divide-[#1E2E48]/50 my-2 max-h-60 overflow-y-auto">
                        {detidos.map((d: any) => {
                            const secs = Math.floor((new Date(d.limite_legal_48h).getTime() - currentTime.getTime()) / 1000);
                            const expired = secs <= 0;
                            return (
                                <div key={d.id} className="py-2 flex items-center justify-between text-xs">
                                    <div className="min-w-0 pr-2">
                                        <div className="font-semibold text-slate-100 truncate">{d.nome}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{d.local_detencao}</div>
                                    </div>
                                    <div className={`text-right font-mono font-bold whitespace-nowrap ${expired ? 'text-rose-400' : 'text-amber-400'}`}>
                                        {formatCountdown(secs)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-2 border-t border-[#1E2E48]">
                        <Link
                            href={route('detidos.index')}
                            onClick={() => setExpanded(false)}
                            className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#131F33] hover:bg-[#1E2E48] text-slate-200 text-xs font-mono uppercase tracking-wider rounded transition-colors"
                        >
                            <span>Abrir Livro Nacional de Celas</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#C5A059]" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
