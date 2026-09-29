import React from 'react';
import { Link } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import { LacreBadge } from '@/Components/UI/LacreBadge';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import {
    Activity,
    Lock,
    Send,
    Clock,
    FileText,
    ChevronRight,
    Scale,
    Shield,
    Calendar,
    UserCheck,
    AlertCircle,
} from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface ShowProps {
    processo: ProcessoCrime;
}

export default function ProcessosShow({ processo }: ShowProps) {
    const diasRestantes = Math.ceil(
        (new Date(processo.data_limite_instrucao).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );

    const isPrazoCritico = diasRestantes <= 30;

    return (
        <TacticalLayout title={`Proc. ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-6xl mx-auto font-sans">
                {/* Cabeçalho Institucional & As 6 Sub-Abas Oficiais */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="show"
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new CustomEvent('sic:open-copilot-processo', { detail: processo }))}
                                className="px-3 py-1.5 bg-blue-950/90 hover:bg-blue-900 border border-blue-800 text-blue-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                title="Analisar Autos no Copiloto Jurídico"
                            >
                                <Scale className="w-3.5 h-3.5 text-blue-400" />
                                <span>Copiloto Jurídico</span>
                            </button>
                            <Link
                                href={route('processos.remessa-pgr', processo.id)}
                                className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>Remessa ao MP</span>
                            </Link>
                        </div>
                    }
                />

                {/* Semáforo de Instrução Preparatória (CPP Angolano) */}
                <div className="p-3.5 bg-[#122235] border border-[#20344d] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-[#0d1a26] border border-[#20344d] shrink-0">
                            <Clock className={`w-4 h-4 ${isPrazoCritico ? 'text-amber-400' : 'text-[#c5a059]'}`} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-100">
                                Prazo de Instrução Preparatória — Código de Processo Penal Angolano
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                Abertura em: <span className="text-slate-300 font-mono">{processo.data_abertura}</span> • Prazo Limite Legal: <span className="text-slate-300 font-mono">{processo.data_limite_instrucao}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 border-[#20344d]/50 pt-2 sm:pt-0">
                        <div className={`text-xs font-mono font-bold ${isPrazoCritico ? 'text-amber-300' : 'text-slate-200'}`}>
                            {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Prazo Excedido'}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-medium mt-0.5 ${
                            isPrazoCritico
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                            {isPrazoCritico ? 'Atenção / Próximo do Limite' : 'Instrução Regular'}
                        </span>
                    </div>
                </div>

                {/* Conteúdo Principal do Inquérito */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Coluna Esquerda: Diligências e Cadeia de Custódia */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Resumo dos Factos e Tipologia */}
                        <div className="p-4 bg-[#122235] border border-[#20344d] rounded-md shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                    Resumo da Notícia-Crime e Factos Investigados
                                </span>
                                {processo.ocorrencia && (
                                    <Link
                                        href={route('ocorrencias.show', processo.ocorrencia.id)}
                                        className="text-[11px] text-[#c5a059] hover:underline flex items-center gap-1 font-mono"
                                    >
                                        <span>Auto Origem: {processo.ocorrencia.numero_ocorrencia}</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed">
                                {processo.resumo_factos || 'Inquérito instaurado para apuração de indícios de criminalidade com instrução sob direcção do Ministério Público.'}
                            </p>
                        </div>

                        {/* Cronologia de Diligências Forenses */}
                        <TacticalCard
                            title="Cronologia Recente de Diligências Forenses"
                            icon={<Activity className="w-4 h-4 text-[#c5a059]" />}
                            actions={
                                <Link
                                    href={route('processos.diligencias', processo.id)}
                                    className="text-xs text-[#c5a059] hover:underline flex items-center gap-1 font-medium"
                                >
                                    <span>Ver Diário Completo ({processo.diligencias?.length || 0})</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            }
                        >
                            {processo.diligencias && processo.diligencias.length > 0 ? (
                                <div className="relative pl-5 border-l border-[#20344d] space-y-4 my-2">
                                    {processo.diligencias.slice(0, 3).map((dil) => (
                                        <div key={dil.id} className="relative">
                                            <div className="absolute -left-[27px] top-1.5 w-2 h-2 rounded-full bg-[#c5a059] border-2 border-[#122235]"></div>
                                            <div className="text-[11px] text-slate-400">
                                                {new Date(dil.data_realizacao).toLocaleString('pt-AO')} • Responsável: <strong className="text-slate-300 font-normal">{dil.responsavel?.nome_completo}</strong>
                                            </div>
                                            <div className="text-xs font-semibold text-slate-100 mt-0.5">{dil.tipo}</div>
                                            <div className="text-xs text-slate-300 mt-1 leading-relaxed">{dil.descricao_detalhada}</div>
                                            {dil.resultado && (
                                                <div className="text-[11px] text-slate-300 mt-1.5 bg-[#0d1a26] p-2 rounded border border-[#20344d]">
                                                    <strong className="text-slate-400 font-medium">Resultado:</strong> {dil.resultado}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 py-6 text-center">
                                    Nenhuma diligência registada até ao momento neste inquérito.
                                </div>
                            )}
                        </TacticalCard>

                        {/* Provas e Bens Apreendidos com Lacre Inviolável */}
                        <TacticalCard
                            title="Bens Apreendidos & Cadeia de Custódia (Lacres Invioláveis)"
                            icon={<Lock className="w-4 h-4 text-[#c5a059]" />}
                            actions={
                                <Link
                                    href={route('processos.provas-custodia', processo.id)}
                                    className="text-xs text-[#c5a059] hover:underline flex items-center gap-1 font-medium"
                                >
                                    <span>Inventário de Provas</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            }
                        >
                            {processo.bens && processo.bens.length > 0 ? (
                                <div className="space-y-2 text-xs">
                                    {processo.bens.map((b) => (
                                        <div key={b.id} className="p-3 bg-[#0d1a26] border border-[#20344d] rounded-md flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <LacreBadge codigo={b.numero_lacre_seguranca} />
                                                    <span className="text-[10px] px-1.5 py-0.2 bg-[#17283c] text-slate-300 rounded border border-[#20344d] uppercase font-sans">
                                                        {b.tipo_objeto}
                                                    </span>
                                                </div>
                                                <div className="text-slate-200 mt-1 font-sans">{b.descricao_bem}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">Local: {b.local_cofre_deposito}</div>
                                            </div>
                                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shrink-0">
                                                LACRADO
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 py-4 text-center">
                                    Nenhum bem apreendido sob custódia registado.
                                </div>
                            )}
                        </TacticalCard>
                    </div>

                    {/* Coluna Direita: Metadados, Órgãos e Detidos */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Jurisdição & Titulares */}
                        <div className="p-4 bg-[#122235] border border-[#20344d] rounded-md shadow-sm space-y-3.5 text-xs">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-[#20344d] pb-2">
                                Jurisdição & Órgãos de Justiça
                            </div>

                            <div>
                                <span className="text-slate-400 text-[11px] block">Unidade Policial Competente:</span>
                                <span className="text-slate-100 font-medium">{processo.unidade?.nome || 'Comando Provincial do SIC'}</span>
                                <span className="text-[11px] text-slate-400 block mt-0.5">{processo.provincia?.nome}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 text-[11px] block">Investigador Titular dos Autos:</span>
                                <span className="text-slate-100 font-medium">
                                    {processo.investigador?.nome_completo || 'Pendente de Atribuição'}
                                </span>
                                {processo.investigador?.nip && (
                                    <span className="text-[11px] font-mono text-[#c5a059] block mt-0.5">
                                        NIP: {processo.investigador.nip}
                                    </span>
                                )}
                            </div>

                            <div>
                                <span className="text-slate-400 text-[11px] block">Magistrado do Ministério Público (PGR):</span>
                                <span className="text-slate-100 font-medium">
                                    {processo.magistrado_pgr_responsavel || 'Aguardando Distribuição na Sala Criminal'}
                                </span>
                            </div>
                        </div>

                        {/* Detidos sob Custódia Legal */}
                        <div className="p-4 bg-[#122235] border border-[#20344d] rounded-md shadow-sm space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-[#20344d] pb-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                    Arguidos Detidos (Celas 48h)
                                </span>
                                <Link href={route('detidos.index')} className="text-[11px] text-[#c5a059] hover:underline">
                                    Ver Celas
                                </Link>
                            </div>

                            {processo.detencoes && processo.detencoes.length > 0 ? (
                                <div className="space-y-2">
                                    {processo.detencoes.map((d) => (
                                        <div key={d.id} className="p-2.5 bg-[#0d1a26] border border-[#20344d] rounded space-y-1">
                                            <div className="font-semibold text-slate-100">{d.individuo?.nome_completo}</div>
                                            <div className="text-[11px] text-slate-400">
                                                BI: {d.individuo?.numero_bi || 'N/D'}
                                            </div>
                                            <div className="text-[11px] text-amber-300 font-mono mt-1">
                                                Prazo CRA: {new Date(d.limite_legal_48h).toLocaleString('pt-AO')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 py-2">
                                    Nenhum arguido detido sob custódia neste inquérito.
                                </div>
                            )}
                        </div>

                        {/* Acesso Rápido às Peças dos Autos */}
                        <div className="p-4 bg-[#122235] border border-[#20344d] rounded-md shadow-sm space-y-2.5 text-xs">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b border-[#20344d] pb-2">
                                Redação Oficial dos Autos
                            </span>
                            <p className="text-slate-300 leading-relaxed text-xs">
                                Elaboração de Autos de Interrogatório, Inquirição de Testemunhas, Termo de Identidade e Relatório Final.
                            </p>
                            <Link
                                href={route('processos.pecas-autos', processo.id)}
                                className="w-full mt-2 py-2 bg-[#17283c] hover:bg-[#1e344e] border border-[#20344d] text-slate-200 font-medium text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <FileText className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>Abrir Redator de Peças</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </TacticalLayout>
    );
}
