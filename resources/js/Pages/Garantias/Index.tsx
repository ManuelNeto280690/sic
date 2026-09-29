import React from 'react';
import { Link } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import {
    Scale,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    FolderGit2,
    Calendar,
    ArrowRight,
    Users,
    Gavel,
} from 'lucide-react';

interface Props {
    audiencias: {
        data: any[];
        links: any[];
        total: number;
    };
    detencoesPendentes: any[];
    estatisticas: {
        total_audiencias: number;
        prisoes_preventivas: number;
        liberdades_concedidas: number;
        taxa_respeito_48h: number;
    };
}

export default function GarantiasIndex({ audiencias, detencoesPendentes, estatisticas }: Props) {
    return (
        <TacticalLayout title="Juiz de Garantias & Prazos Constitucionais (48h)">
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Cabeçalho Institucional Solene */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20344d] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                                Jurisdição de Garantias & 48 Horas Constitucionais
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Fiscalização da legalidade das prisões, 1.º interrogatório de arguidos detidos e garantias fundamentais (Art. 63.º CRA)
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded bg-[#0d1a26] border border-[#20344d] text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{estatisticas.taxa_respeito_48h}% no Prazo Legal</span>
                        </span>
                    </div>
                </div>

                {/* Métricas e Indicadores Rápidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Audiências Totais</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{estatisticas.total_audiencias}</div>
                        <span className="text-[11px] text-slate-400">Atos do Juiz de Garantias averbados</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Prisões Preventivas</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{estatisticas.prisoes_preventivas}</div>
                        <span className="text-[11px] text-slate-400">Medida de coacção máxima fixada</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Liberdades Concedidas</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{estatisticas.liberdades_concedidas}</div>
                        <span className="text-[11px] text-slate-400">TIR, Caução ou Relaxamento</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Aguardando Audiência</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{detencoesPendentes.length}</div>
                        <span className="text-[11px] text-slate-400">Arguidos em contagem de 48h</span>
                    </div>
                </div>

                {/* PAINEL DE CONTROLO DE DETIDOS EM CONTAGEM DE 48 HORAS */}
                <TacticalCard
                    title="Monitor de Prazos de 48h — Arguidos em Celas Transitórias"
                    icon={<Clock className="w-4 h-4 text-[#c5a059]" />}
                >
                    {detencoesPendentes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-sans">
                                <thead>
                                    <tr className="border-b border-[#20344d] text-slate-400 text-[10px] uppercase font-mono">
                                        <th className="py-2.5 px-3">Arguido Detido</th>
                                        <th className="py-2.5 px-3">B.I. nº</th>
                                        <th className="py-2.5 px-3">Processo-Crime</th>
                                        <th className="py-2.5 px-3">Data/Hora Detenção</th>
                                        <th className="py-2.5 px-3">Tempo em Cela</th>
                                        <th className="py-2.5 px-3">Estado 48h</th>
                                        <th className="py-2.5 px-3 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1e2f42] text-slate-200">
                                    {detencoesPendentes.map(det => (
                                        <tr key={det.id} className="hover:bg-[#0f1b29] transition-colors">
                                            <td className="py-2.5 px-3 font-medium text-slate-100">
                                                {det.individuo_nome}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-400">
                                                {det.bi}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-300">
                                                {det.numero_processo}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-slate-300">
                                                {det.data_hora_detencao}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono font-bold">
                                                <span className={det.horas_decorridas >= 48 ? 'text-rose-400' : 'text-slate-100'}>
                                                    {det.horas_decorridas} horas
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                {det.expirado ? (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-900/60">
                                                        ⚠️ PRAZO ESGOTADO
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#132233] text-slate-300 border border-[#223954]">
                                                        TEMPESTIVO (Limite: {det.limite_48h})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right">
                                                {det.processo_id && (
                                                    <Link
                                                        href={route('processos.garantias', det.processo_id)}
                                                        className="px-2.5 py-1 bg-[#17283c] hover:bg-[#1f3752] text-slate-200 border border-[#20344d] hover:border-[#c5a059]/60 rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                                                    >
                                                        <span>Apresentar ao Juiz</span>
                                                        <ArrowRight className="w-3 h-3 text-[#c5a059]" />
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            Nenhum arguido aguardando 1.º interrogatório de garantias nas celas transitórias.
                        </div>
                    )}
                </TacticalCard>

                {/* HISTÓRICO CONSOLIDADO DE AUDIÊNCIAS */}
                <TacticalCard
                    title={`Autos e Despachos do Juiz de Garantias (${audiencias.total})`}
                    icon={<Gavel className="w-4 h-4 text-[#c5a059]" />}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead>
                                <tr className="border-b border-[#20344d] text-slate-400 text-[10px] uppercase font-mono">
                                    <th className="py-2.5 px-3">Auto de Audiência</th>
                                    <th className="py-2.5 px-3">Processo</th>
                                    <th className="py-2.5 px-3">Juiz de Garantias</th>
                                    <th className="py-2.5 px-3">Tribunal de Comarca</th>
                                    <th className="py-2.5 px-3">Data/Hora</th>
                                    <th className="py-2.5 px-3">Decisão Judicial</th>
                                    <th className="py-2.5 px-3">Auditoria 48h</th>
                                    <th className="py-2.5 px-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e2f42] text-slate-200">
                                {audiencias.data.map(aud => (
                                    <tr key={aud.id} className="hover:bg-[#0f1b29] transition-colors">
                                        <td className="py-2.5 px-3 font-mono font-bold text-slate-100">
                                            {aud.numero_auto_audiencia}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-slate-300">
                                            {aud.processo?.numero_processo || 'N/D'}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-200">
                                            {aud.magistrado_juiz_nome}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400">
                                            {aud.tribunal_comarca}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-slate-300">
                                            {aud.data_hora_audiencia}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                                                aud.decisao_judicial === 'MANUTENCAO_PRISAO_PREVENTIVA'
                                                    ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60'
                                                    : 'bg-[#132233] text-slate-200 border border-[#223954]'
                                            }`}>
                                                {aud.decisao_judicial.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[10px]">
                                            {aud.dentro_prazo_48h ? (
                                                <span className="text-slate-300">✓ Tempestivo ({aud.horas_decorridas_detencao}h)</span>
                                            ) : (
                                                <span className="text-rose-400 font-bold">⚠️ {aud.horas_decorridas_detencao}h</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            {aud.processo?.id && (
                                                <Link
                                                    href={route('processos.garantias', aud.processo.id)}
                                                    className="px-2 py-1 bg-[#17283c] hover:bg-[#1f3752] text-slate-200 rounded text-[11px] font-mono inline-flex items-center gap-1"
                                                >
                                                    <span>Ver nos Autos</span>
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
