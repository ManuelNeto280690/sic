import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { AngolaMapChart } from '@/Components/Estatisticas/AngolaMapChart';
import { BarChart3, MapPin, FileSpreadsheet, Printer, Calendar, Filter, X, Shield, Clock } from 'lucide-react';
import { Provincia } from '@/types';

interface EstatisticasProps {
    provincias: (Provincia & { ocorrencias_count: number; processos_count: number })[];
    kpis: {
        total_ocorrencias: number;
        total_processos: number;
        total_detidos: number;
        total_mandados: number;
        taxa_resolucao: string;
    };
    tipologias: { tipo: string; total: number; percentual: number }[];
    serie_mensal: { mes: string; ocorrencias: number; processos: number; remetidos_mp: number }[];
    filtros?: {
        data_inicio?: string;
        data_fim?: string;
    };
}

export default function EstatisticasIndex({ provincias, kpis, tipologias, serie_mensal, filtros }: EstatisticasProps) {
    const [dataInicio, setDataInicio] = useState(filtros?.data_inicio || '');
    const [dataFim, setDataFim] = useState(filtros?.data_fim || '');
    const [periodoPreset, setPeriodoPreset] = useState<string>(() => {
        if (!filtros?.data_inicio && !filtros?.data_fim) return 'todos';
        return 'outros';
    });

    const formatIsoDate = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const applyPreset = (preset: string) => {
        setPeriodoPreset(preset);
        const now = new Date();
        let start = '';
        let end = formatIsoDate(now);

        switch (preset) {
            case 'hoje': {
                start = formatIsoDate(now);
                end = formatIsoDate(now);
                break;
            }
            case 'ontem': {
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                start = formatIsoDate(yesterday);
                end = formatIsoDate(yesterday);
                break;
            }
            case '3_dias': {
                const d3 = new Date();
                d3.setDate(now.getDate() - 3);
                start = formatIsoDate(d3);
                break;
            }
            case '7_dias': {
                const d7 = new Date();
                d7.setDate(now.getDate() - 7);
                start = formatIsoDate(d7);
                break;
            }
            case '15_dias': {
                const d15 = new Date();
                d15.setDate(now.getDate() - 15);
                start = formatIsoDate(d15);
                break;
            }
            case 'mes': {
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                start = formatIsoDate(firstDayOfMonth);
                break;
            }
            case '6_meses': {
                const m6 = new Date();
                m6.setMonth(now.getMonth() - 6);
                start = formatIsoDate(m6);
                break;
            }
            case '1_ano': {
                const y1 = new Date();
                y1.setFullYear(now.getFullYear() - 1);
                start = formatIsoDate(y1);
                break;
            }
            case 'ano_anterior': {
                const prevYear = now.getFullYear() - 1;
                start = `${prevYear}-01-01`;
                end = `${prevYear}-12-31`;
                break;
            }
            case 'todos': {
                start = '';
                end = '';
                break;
            }
            case 'outros':
            default:
                return;
        }

        setDataInicio(start);
        setDataFim(end);

        router.get(
            route('estatisticas.index'),
            {
                data_inicio: start,
                data_fim: end,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setPeriodoPreset('outros');
        router.get(
            route('estatisticas.index'),
            {
                data_inicio: dataInicio,
                data_fim: dataFim,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleClearFilter = () => {
        setDataInicio('');
        setDataFim('');
        setPeriodoPreset('todos');
        router.get(
            route('estatisticas.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (dataInicio) params.append('data_inicio', dataInicio);
        if (dataFim) params.append('data_fim', dataFim);
        window.location.href = route('estatisticas.exportar-excel') + '?' + params.toString();
    };

    const hasFilter = Boolean(dataInicio || dataFim);

    const { configuracoes_globais } = usePage<any>().props;

    return (
        <TacticalLayout title="Painel Estatístico 21 Províncias">
            <div className="space-y-6">
                {/* Cabeçalho Solene de Impressão Oficial (Exibido apenas na Exportação de PDF / Impressão) */}
                <div className="hidden print:block mb-6 p-6 border-b-2 border-black text-black bg-white">
                    <div className="text-center font-bold text-base tracking-wider uppercase">
                        {configuracoes_globais?.pais_nome || 'REPÚBLICA DE ANGOLA'}
                    </div>
                    <div className="text-center font-bold text-xs uppercase mt-0.5">
                        {configuracoes_globais?.ministerio_nome || 'MINISTÉRIO DO INTERIOR'} — {configuracoes_globais?.direcao_geral || 'SERVIÇO DE INVESTIGAÇÃO CRIMINAL'}
                    </div>
                    <div className="text-center text-xs mt-0.5">
                        {configuracoes_globais?.direcao_nacional || 'DIRECÇÃO NACIONAL DE OPERAÇÕES E ESTATÍSTICA POLICIAL (DNOEP)'}
                    </div>
                    {configuracoes_globais?.lema_institucional && (
                        <div className="text-center text-[10px] italic text-slate-600 mt-0.5">
                            «{configuracoes_globais.lema_institucional}»
                        </div>
                    )}
                    <div className="text-center font-bold text-sm uppercase mt-4 bg-slate-100 py-2 border border-slate-300">
                        RELATÓRIO ESTATÍSTICO CONSOLIDADO DE CRIMINALIDADE — 21 PROVÍNCIAS
                    </div>
                    <div className="grid grid-cols-2 text-xs mt-3 pt-2 border-t border-slate-300">
                        <div>
                            <strong>Período Filtrado: </strong>
                            {hasFilter
                                ? `${dataInicio || 'Início Histórico'} até ${dataFim || 'Data Atual'}`
                                : 'Histórico Global Consolidado'}
                        </div>
                        <div className="text-right">
                            <strong>Data de Emissão: </strong> {new Date().toLocaleString('pt-AO')}
                        </div>
                    </div>
                </div>

                {/* Barra Superior com Título, Filtro de Duas Datas e Botões de Exportação */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#223750] pb-4 no-print">
                    <div>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                Painel Estatístico & BI — 21 Províncias de Angola
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                            Módulo M6 // Consolidação para Direcção Nacional, Comandos Provinciais e MININT
                        </p>
                    </div>

                    {/* Controles de Ação: Filtro de Datas seguido de Exportar PDF e Excel */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Formulário com Seletor Rápido e 2 Datas para Filtrar Antes do Botão Exportar */}
                        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2">
                            {/* Lista de Períodos Rápidos */}
                            <div className="flex items-center gap-1.5 bg-[#0d1a26] border border-[#223750] rounded-md px-2.5 py-1.5 shadow-sm">
                                <Clock className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                                <span className="text-[10px] uppercase font-sans text-slate-400 font-medium whitespace-nowrap">
                                    Período:
                                </span>
                                <select
                                    value={periodoPreset}
                                    onChange={(e) => applyPreset(e.target.value)}
                                    className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none cursor-pointer pr-1"
                                >
                                    <option value="todos" className="bg-[#0d1a26] text-slate-200">Todo o Histórico</option>
                                    <option value="hoje" className="bg-[#0d1a26] text-slate-200">Hoje</option>
                                    <option value="ontem" className="bg-[#0d1a26] text-slate-200">Ontem</option>
                                    <option value="3_dias" className="bg-[#0d1a26] text-slate-200">Últimos 3 dias</option>
                                    <option value="7_dias" className="bg-[#0d1a26] text-slate-200">Últimos 7 dias</option>
                                    <option value="15_dias" className="bg-[#0d1a26] text-slate-200">Últimos 15 dias</option>
                                    <option value="mes" className="bg-[#0d1a26] text-slate-200">Este Mês</option>
                                    <option value="6_meses" className="bg-[#0d1a26] text-slate-200">Últimos 6 meses</option>
                                    <option value="1_ano" className="bg-[#0d1a26] text-slate-200">Último 1 ano</option>
                                    <option value="ano_anterior" className="bg-[#0d1a26] text-slate-200">Ano Anterior</option>
                                    <option value="outros" className="bg-[#0d1a26] text-slate-200">Outros / Personalizado</option>
                                </select>
                            </div>

                            {/* Campo Data Início */}
                            <div className="flex items-center gap-1.5 bg-[#0d1a26] border border-[#223750] rounded-md px-2.5 py-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-[10px] uppercase font-sans text-slate-400 font-medium">De:</span>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => {
                                        setDataInicio(e.target.value);
                                        setPeriodoPreset('outros');
                                    }}
                                    className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none [color-scheme:dark]"
                                />
                            </div>

                            {/* Campo Data Fim */}
                            <div className="flex items-center gap-1.5 bg-[#0d1a26] border border-[#223750] rounded-md px-2.5 py-1.5">
                                <span className="text-[10px] uppercase font-sans text-slate-400 font-medium">Até:</span>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => {
                                        setDataFim(e.target.value);
                                        setPeriodoPreset('outros');
                                    }}
                                    className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none [color-scheme:dark]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-[#1d4ed8] hover:bg-[#2563eb] text-white rounded-md text-xs font-sans font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                title="Filtrar dados da estatística pelo intervalo de datas"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>Filtrar</span>
                            </button>

                            {hasFilter && (
                                <button
                                    type="button"
                                    onClick={handleClearFilter}
                                    className="p-1.5 bg-[#132235] hover:bg-[#17283c] text-slate-400 hover:text-slate-200 rounded-md border border-[#223750] transition-colors cursor-pointer"
                                    title="Limpar filtro de data"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="h-6 w-[1px] bg-[#223750] hidden sm:block"></div>

                        {/* Botões de Exportação */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-3.5 py-1.5 bg-[#132235] hover:bg-[#17283c] border border-[#223750] hover:border-slate-400 text-slate-200 text-xs font-sans rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                title="Exportar relatório oficial em formato PDF"
                            >
                                <Printer className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>Exportar PDF</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="px-3.5 py-1.5 bg-[#132235] hover:bg-[#17283c] border border-[#223750] hover:border-slate-400 text-slate-200 text-xs font-sans rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                title="Exportar dados consolidados em planilha Excel (.csv)"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Exportar Excel</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banner Informativo quando o filtro de data está ativo */}
                {hasFilter && (
                    <div className="bg-[#132235] border border-[#223750] text-sky-300 px-4 py-2.5 rounded-lg text-xs font-sans flex items-center justify-between no-print shadow-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#c5a059]" />
                            <span>
                                Estatísticas filtradas para o intervalo de <strong>{dataInicio || 'Início'}</strong> até <strong>{dataFim || 'Hoje'}</strong>. Os documentos de exportação (PDF e Excel) refletirão rigorosamente este período.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleClearFilter}
                            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                        >
                            Ver Todo o Histórico
                        </button>
                    </div>
                )}

                {/* KPIs Globais */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] text-slate-400 uppercase">Autos de Notícia</div>
                        <div className="text-2xl font-bold text-slate-100 mt-1">{kpis.total_ocorrencias}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] text-blue-400 uppercase">Inquéritos Instaurados</div>
                        <div className="text-2xl font-bold text-blue-300 mt-1">{kpis.total_processos}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] text-amber-400 uppercase">Detidos em Celas</div>
                        <div className="text-2xl font-bold text-amber-300 mt-1">{kpis.total_detidos}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] text-rose-400 uppercase">Mandados Emitidos (PGR)</div>
                        <div className="text-2xl font-bold text-rose-300 mt-1">{kpis.total_mandados}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] text-emerald-400 uppercase">Taxa de Resolução</div>
                        <div className="text-2xl font-bold text-emerald-300 mt-1">{kpis.taxa_resolucao}</div>
                    </TacticalCard>
                </div>

                {/* Gráfico de Mapa de Incidência Criminal por Província (Toda a Largura com Altura Equilibrada) */}
                <AngolaMapChart
                    provincias={provincias}
                    dataInicio={dataInicio}
                    dataFim={dataFim}
                />

                {/* Distribuição por Tipologia Criminal & Séries Temporais */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Tipologias */}
                    <div className="lg:col-span-6">
                        <TacticalCard title="Tipologias Criminais (Código Penal Angolano)">
                            <div className="space-y-3 font-mono text-xs mt-2">
                                {tipologias.map((tip, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-slate-300">
                                            <span>{tip.tipo}</span>
                                            <span className="font-bold text-[#DFC07A]">{tip.total} ({tip.percentual}%)</span>
                                        </div>
                                        <div className="w-full h-2 bg-[#0d1a26] rounded-full overflow-hidden border border-[#223750]">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#c5a059] to-amber-500 rounded-full"
                                                style={{ width: `${tip.percentual}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TacticalCard>
                    </div>

                    {/* Evolução Mensal */}
                    <div className="lg:col-span-6">
                        <TacticalCard title="Séries Temporais de Criminalidade (Semestral)">
                            <div className="space-y-3 font-mono text-xs mt-2">
                                <div className="grid grid-cols-4 text-[10px] uppercase text-slate-400 border-b border-[#223750] pb-1">
                                    <span>Mês</span>
                                    <span>Autos Notícia</span>
                                    <span>Inquéritos</span>
                                    <span>Remetidos MP</span>
                                </div>
                                {serie_mensal.map((s, idx) => (
                                    <div key={idx} className="grid grid-cols-4 text-slate-200 py-1.5 border-b border-[#223750]/40">
                                        <span className="font-bold text-[#c5a059]">{s.mes}</span>
                                        <span>{s.ocorrencias}</span>
                                        <span className="text-blue-300">{s.processos}</span>
                                        <span className="text-purple-300">{s.remetidos_mp}</span>
                                    </div>
                                ))}
                            </div>
                        </TacticalCard>
                    </div>
                </div>

                {/* Tabela de Consolidação das 21 Províncias */}
                <TacticalCard title="Quadro Consolidado das 21 Províncias de Angola" icon={<MapPin className="w-4 h-4" />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans divide-y divide-[#223750]">
                            <thead className="bg-[#17283c] text-slate-400 uppercase text-[10px]">
                                <tr>
                                    <th className="px-3 py-2">Província</th>
                                    <th className="px-3 py-2">Código ISO</th>
                                    <th className="px-3 py-2">Autos de Notícia Registados</th>
                                    <th className="px-3 py-2">Inquéritos Instaurados</th>
                                    <th className="px-3 py-2">Estado Operacional</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#223750]/40">
                                {provincias.map((p) => (
                                    <tr key={p.id} className="hover:bg-[#17283c]/60">
                                        <td className="px-3 py-2 font-bold text-slate-100">{p.nome}</td>
                                        <td className="px-3 py-2 text-[#c5a059]">{p.codigo_iso}</td>
                                        <td className="px-3 py-2 text-slate-200">{p.ocorrencias_count || 0}</td>
                                        <td className="px-3 py-2 text-blue-300">{p.processos_count || 0}</td>
                                        <td className="px-3 py-2">
                                            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                                                INTEGRADO
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TacticalCard>

                {/* Bloco Solene de Assinaturas e Autenticidade (Apenas visível na impressão / PDF) */}
                <div className="hidden print:block mt-12 pt-6 border-t-2 border-slate-300 text-black text-xs">
                    <div className="grid grid-cols-2 gap-8 text-center">
                        <div className="space-y-12">
                            <div>O Oficial de Operações e Estatística:</div>
                            <div className="border-t border-black w-56 mx-auto pt-1 font-semibold">
                                Direcção Nacional do SIC
                            </div>
                        </div>
                        <div className="space-y-12">
                            <div>Visto do Director Nacional do SIC:</div>
                            <div className="border-t border-black w-56 mx-auto pt-1 font-semibold">
                                Comissário-Chefe
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-[10px] text-slate-600 text-center border-t border-slate-200 pt-2 font-mono">
                        Documento Oficial SIGD-SIC // 21 Províncias de Angola // Trilha Criptográfica SHA-256
                    </div>
                </div>
            </div>
        </TacticalLayout>
    );
}
