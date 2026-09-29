import React from 'react';
import { Link } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import {
    Radio,
    PhoneCall,
    Search,
    Globe,
    Compass,
    ArrowRight,
    Shield,
} from 'lucide-react';

interface Props {
    registos: {
        data: any[];
        links: any[];
        total: number;
    };
    antenas: any[];
    estatisticas: {
        total_registos: number;
        total_unitel: number;
        total_africell: number;
        total_movicel: number;
        antenas_unicas: number;
    };
    filtros: {
        operadora?: string;
        search?: string;
    };
}

export default function TelecomIndex({ registos, antenas, estatisticas, filtros }: Props) {
    return (
        <TacticalLayout title="Centro de Análise de Metadados / CDR (ERB)">
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20344d] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                                Centro de Análise de Metadados / CDR & Triangulação ERB
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Tratamento forense de registos telefónicos, torres celulares e histórico de comunicações sob mandado judicial (Art. 230.º CPP)
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="px-2.5 py-1 rounded bg-[#0d1a26] border border-[#20344d] text-slate-300">
                            UNITEL: {estatisticas.total_unitel} &bull; AFRICELL: {estatisticas.total_africell} &bull; MOVICEL: {estatisticas.total_movicel}
                        </span>
                    </div>
                </div>

                {/* Métricas e Antenas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Total Metadados</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{estatisticas.total_registos}</div>
                        <span className="text-[11px] text-slate-400">Eventos em inquéritos ativos</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Estações Base (ERB)</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{estatisticas.antenas_unicas}</div>
                        <span className="text-[11px] text-slate-400">Torres celulares mapeadas</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Operadoras</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">3 Redes</div>
                        <span className="text-[11px] text-slate-400">Unitel, Africell e Movicel</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Garantia Jurisdicional</span>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1 font-mono pt-1">
                            <Shield className="w-3.5 h-3.5 text-[#c5a059]" /> Mandados PGR/Tribunal
                        </div>
                        <span className="text-[10px] text-slate-400">Em conformidade processual</span>
                    </div>
                </div>

                {/* TABELA CONSOLIDADA DE REGISTOS CDR */}
                <TacticalCard
                    title={`Eventos Recentes de Telecomunicações (${registos.total})`}
                    icon={<PhoneCall className="w-4 h-4 text-[#c5a059]" />}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead>
                                <tr className="border-b border-[#20344d] text-slate-400 text-[10px] uppercase font-mono">
                                    <th className="py-2.5 px-3">Data/Hora</th>
                                    <th className="py-2.5 px-3">Processo</th>
                                    <th className="py-2.5 px-3">Origem</th>
                                    <th className="py-2.5 px-3">Destino</th>
                                    <th className="py-2.5 px-3">Tipo</th>
                                    <th className="py-2.5 px-3">Duração</th>
                                    <th className="py-2.5 px-3">Antena (ERB)</th>
                                    <th className="py-2.5 px-3">Operadora</th>
                                    <th className="py-2.5 px-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e2f42] text-slate-200 font-mono text-[11px]">
                                {registos.data.map(r => (
                                    <tr key={r.id} className="hover:bg-[#0f1b29] transition-colors">
                                        <td className="py-2.5 px-3 text-slate-400">
                                            {r.data_hora_evento}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300">
                                            {r.processo?.numero_processo || 'N/D'}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-slate-100">
                                            {r.numero_alvo_origem}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300">
                                            {r.numero_interlocutor_destino}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className="text-[10px] text-slate-300">
                                                {r.tipo_evento.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400">
                                            {r.duracao_segundos > 0 ? `${r.duracao_segundos}s` : '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400">
                                            {r.antena_erb_nome}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-[#132233] text-slate-200 border border-[#223954]">
                                                {r.operadora}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            {r.processo?.id && (
                                                <Link
                                                    href={route('processos.telecom-cdr', r.processo.id)}
                                                    className="px-2 py-1 bg-[#17283c] hover:bg-[#1f3752] text-slate-200 rounded text-[11px] font-mono inline-flex items-center gap-1"
                                                >
                                                    <span>Nos Autos</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TacticalCard>
            </div>
        </TacticalLayout>
    );
}
