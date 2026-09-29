import React, { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import {
    FolderGit2,
    Search,
    Filter,
    ChevronRight,
    Clock,
    Shield,
    AlertTriangle,
    PlusCircle,
    X,
    FileText,
    Lock,
    RotateCcw,
    CheckCircle2,
    Building2,
    Scale,
    UserCheck,
    Calendar,
} from 'lucide-react';
import { ProcessoCrime, Provincia } from '@/types';

interface AutoDisponivel {
    id: string;
    numero_ocorrencia: string;
    classificacao_codigo: string;
    data_hora_facto: string;
    provincia_id: string;
    local_detalhado?: string;
}

interface IndexProps {
    processos: {
        data: ProcessoCrime[];
        links: any[];
        total: number;
        from: number;
        to: number;
    };
    provincias_lista: Provincia[];
    tipologias_lista: string[];
    autos_disponiveis: AutoDisponivel[];
    filtros: {
        search?: string;
        estado?: string;
        provincia_id?: string;
    };
    estatisticas: {
        total: number;
        em_instrucao: number;
        remetidos_pgr: number;
        concluidos: number;
    };
    pode_ver_todas_provincias?: boolean;
    jurisdicao_usuario?: {
        provincia_id: string | null;
        provincia_nome: string | null;
        unidade_nome: string | null;
    };
}

export default function ProcessosIndex({
    processos,
    provincias_lista = [],
    tipologias_lista = [],
    autos_disponiveis = [],
    filtros,
    estatisticas,
    pode_ver_todas_provincias = true,
    jurisdicao_usuario,
}: IndexProps) {
    // Filtros
    const [search, setSearch] = useState(filtros.search || '');
    const [estado, setEstado] = useState(filtros.estado || '');
    const [provinciaId, setProvinciaId] = useState(
        !pode_ver_todas_provincias && jurisdicao_usuario?.provincia_id
            ? jurisdicao_usuario.provincia_id
            : filtros.provincia_id || ''
    );

    // Modal de Instauração
    const [modalOpen, setModalOpen] = useState(false);
    const [modoInstauracao, setModoInstauracao] = useState<'auto' | 'direta'>('auto');

    const { data: formData, setData: setFormData, post, processing, reset, errors } = useForm({
        ocorrencia_id: '',
        provincia_id: jurisdicao_usuario?.provincia_id || (provincias_lista[0]?.id || ''),
        tipologia_legal: tipologias_lista[0] || 'Homicídio Qualificado (Art. 142º do CP)',
        magistrado_pgr: '',
        segredo_justica: true,
        meses_instrucao: 6,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('processos.index'),
            {
                search,
                estado,
                provincia_id: provinciaId,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setEstado('');
        if (pode_ver_todas_provincias) {
            setProvinciaId('');
        }
        router.get(route('processos.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = Boolean(search || estado || (pode_ver_todas_provincias && provinciaId));

    // Seleção de auto de notícia pré-preenche tipologia e província
    const handleSelectAuto = (autoId: string) => {
        const auto = autos_disponiveis.find((a) => a.id === autoId);
        if (auto) {
            setFormData((prev) => ({
                ...prev,
                ocorrencia_id: auto.id,
                provincia_id: auto.provincia_id,
                tipologia_legal: auto.classificacao_codigo || prev.tipologia_legal,
            }));
        } else {
            setFormData('ocorrencia_id', '');
        }
    };

    const handleInstaurarSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('processos.instaurar'), {
            onSuccess: () => {
                reset();
                setModalOpen(false);
            },
        });
    };

    return (
        <TacticalLayout title="Processos-Crime">
            <div className="space-y-6">
                {/* Cabeçalho da Carteira de Inquéritos */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <FolderGit2 className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-lg font-bold uppercase tracking-wider text-slate-100 font-sans">
                                Carteira de Processos-Crime & Inquéritos
                            </h1>
                            {pode_ver_todas_provincias ? (
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950/70 border border-emerald-700/80 text-emerald-400 rounded flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    <span>ÂMBITO NACIONAL (21 PROVÍNCIAS)</span>
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950/80 border border-amber-600/70 text-amber-300 rounded flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    <span>JURISDIÇÃO: {jurisdicao_usuario?.provincia_nome?.toUpperCase() || 'LOCAL'}</span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                            Fase de Instrução Preparatória sob a direção do Ministério Público (PGR) // Código de Processo Penal Angolano
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className="px-4 py-2 bg-[#c5a059] hover:bg-[#dfc07a] text-[#0d1a26] font-bold rounded-md text-xs font-sans uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Instaurar Processo-Crime</span>
                        </button>
                    </div>
                </div>

                {/* Resumo Estatístico dos Inquéritos */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-[#132235] border border-[#223750] rounded-lg p-3.5 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-sans uppercase tracking-wider font-semibold text-slate-400">Total de Inquéritos</div>
                            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{estatisticas.total}</div>
                        </div>
                        <FolderGit2 className="w-5 h-5 text-[#c5a059]" />
                    </div>
                    <div className="bg-[#132235] border border-[#223750] rounded-lg p-3.5 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-sans uppercase tracking-wider font-semibold text-blue-400">Em Instrução Ativa</div>
                            <div className="text-2xl font-bold font-mono text-blue-300 mt-1">{estatisticas.em_instrucao}</div>
                        </div>
                        <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="bg-[#132235] border border-[#223750] rounded-lg p-3.5 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-sans uppercase tracking-wider font-semibold text-purple-400">Remetidos à PGR</div>
                            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{estatisticas.remetidos_pgr}</div>
                        </div>
                        <Scale className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="bg-[#132235] border border-[#223750] rounded-lg p-3.5 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-sans uppercase tracking-wider font-semibold text-emerald-400">Relatórios Concluídos</div>
                            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{estatisticas.concluidos}</div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>

                {/* Filtro de Busca Tática */}
                <div className="bg-[#132235] border border-[#223750] p-3.5 rounded-lg shadow-sm">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        {/* Busca Textual */}
                        <div className="sm:col-span-5 relative">
                            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium">Pesquisa</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Nº de processo, crime, magistrado PGR..."
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-100 pl-9 pr-3 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Filtro de Estado */}
                        <div className="sm:col-span-3">
                            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium">Estado Processual</label>
                            <select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb]"
                            >
                                <option value="">Todos os Estados</option>
                                <option value="EM_INSTRUCAO">EM INSTRUÇÃO</option>
                                <option value="REMETIDO_AO_MP">REMETIDO AO MP (PGR)</option>
                                <option value="RELATORIO_CONCLUIDO">RELATÓRIO CONCLUÍDO</option>
                                <option value="ACUSADO">ACUSADO</option>
                                <option value="ARQUIVADO">ARQUIVADO</option>
                            </select>
                        </div>

                        {/* Filtro de Província */}
                        <div className="sm:col-span-3">
                            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium flex items-center justify-between">
                                <span>Província</span>
                                {!pode_ver_todas_provincias && (
                                    <Lock className="w-3 h-3 text-amber-400" title="Restrito à sua província" />
                                )}
                            </label>
                            {pode_ver_todas_provincias ? (
                                <select
                                    value={provinciaId}
                                    onChange={(e) => setProvinciaId(e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb]"
                                >
                                    <option value="">Todas as Províncias</option>
                                    {provincias_lista.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <select
                                    disabled
                                    value={jurisdicao_usuario?.provincia_id || ''}
                                    className="w-full bg-[#0b1622] border border-amber-900/50 text-xs font-sans text-amber-200/90 px-2.5 py-1.5 rounded-md cursor-not-allowed opacity-90"
                                >
                                    <option value={jurisdicao_usuario?.provincia_id || ''}>
                                        {jurisdicao_usuario?.provincia_nome} (Fixa)
                                    </option>
                                </select>
                            )}
                        </div>

                        {/* Ações */}
                        <div className="sm:col-span-1 flex items-center gap-1.5">
                            <button
                                type="submit"
                                className="flex-1 bg-[#17283c] hover:bg-[#203650] border border-[#223750] text-slate-200 font-semibold py-1.5 rounded-md text-xs font-sans flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                title="Aplicar filtros"
                            >
                                <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span className="sm:hidden">Filtrar</span>
                            </button>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    title="Limpar filtros"
                                    className="p-1.5 bg-[#0d1a26] hover:bg-rose-950/40 border border-[#223750] hover:border-rose-800 text-slate-400 hover:text-rose-300 rounded-md text-xs transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabela de Inquéritos */}
                <div className="bg-[#132235] border border-[#223750] rounded-lg overflow-hidden shadow-sm">
                    {/* Barra de Status */}
                    <div className="px-4 py-2.5 bg-[#0f1b2b] border-b border-[#223750] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-sans text-slate-400">
                        <div>
                            Apresentando <span className="text-slate-100 font-semibold">{processos.from || 0}</span> a{' '}
                            <span className="text-slate-100 font-semibold">{processos.to || 0}</span> de{' '}
                            <span className="text-slate-100 font-semibold">{processos.total}</span> processos instaurados
                            {!pode_ver_todas_provincias && (
                                <span className="ml-1.5 text-amber-300/80 font-mono text-[11px]">
                                    (Jurisdição: {jurisdicao_usuario?.provincia_nome})
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Base de Dados SIC Ativa
                            </span>
                        </div>
                    </div>

                    <table className="w-full text-left text-xs font-sans divide-y divide-[#223750]">
                        <thead className="bg-[#0d1a26] text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Número do Inquérito</th>
                                <th className="px-4 py-3">Tipologia Legal</th>
                                <th className="px-4 py-3">Jurisdição / Investigador</th>
                                <th className="px-4 py-3">Auto de Origem</th>
                                <th className="px-4 py-3">Semáforo de Instrução</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#223750]/60">
                            {processos.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-mono text-xs">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FolderGit2 className="w-8 h-8 text-slate-600" />
                                            <span>Nenhum processo-crime localizado com os critérios selecionados.</span>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="text-xs text-[#c5a059] hover:underline mt-1"
                                                >
                                                    Limpar filtros para ver todos os inquéritos
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                processos.data.map((proc) => {
                                    const diasRestantes = Math.ceil(
                                        (new Date(proc.data_limite_instrucao).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                                    );
                                    const isUrgente = diasRestantes <= 30;

                                    return (
                                        <tr key={proc.id} className="hover:bg-[#17283c]/70 transition-colors group">
                                            <td className="px-4 py-3 text-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <FolderGit2 className="w-4 h-4 text-slate-400" />
                                                    <span className="font-mono text-xs font-semibold">{proc.numero_processo}</span>
                                                    {proc.segredo_justica && (
                                                        <span className="px-1.5 py-0.5 text-[10px] bg-rose-950/80 text-rose-300 rounded font-sans font-semibold border border-rose-800/80" title="Processo em segredo de justiça">
                                                            Segredo
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-200 font-medium">
                                                <div>{proc.tipologia_legal}</div>
                                                {proc.magistrado_pgr_responsavel && (
                                                    <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1 mt-0.5">
                                                        <Scale className="w-3 h-3 text-[#c5a059]" />
                                                        <span>{proc.magistrado_pgr_responsavel}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                <div className="font-medium text-slate-200">{proc.provincia?.nome}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    Titular: {proc.investigador?.nome_completo || 'Pendente'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {proc.ocorrencia ? (
                                                    <Link
                                                        href={route('ocorrencias.show', proc.ocorrencia.id)}
                                                        className="font-mono text-[11px] text-[#c5a059] hover:underline flex items-center gap-1"
                                                        title="Consultar Auto de Notícia original"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span>{proc.ocorrencia.numero_ocorrencia}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-[11px] text-slate-500 font-mono italic">Entrada Directa</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 font-sans">
                                                    <Clock className={`w-3.5 h-3.5 ${isUrgente ? 'text-amber-400' : 'text-emerald-400'}`} />
                                                    <span className={isUrgente ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
                                                        {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Prazo Expirado'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                    Limite: {proc.data_limite_instrucao}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={proc.estado} type="processo" />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => window.dispatchEvent(new CustomEvent('sic:open-copilot-processo', { detail: proc }))}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/80 rounded-md text-[11px] font-mono transition-colors cursor-pointer"
                                                        title="Analisar no Copiloto Jurídico"
                                                    >
                                                        <Scale className="w-3 h-3 text-blue-400" />
                                                        <span>Copiloto</span>
                                                    </button>
                                                    <Link
                                                        href={route('processos.show', proc.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#17283c] hover:bg-[#1e334d] text-slate-200 hover:text-white border border-[#223750] hover:border-slate-500 rounded-md text-xs font-sans font-medium transition-colors"
                                                    >
                                                        <span>Abrir Inquérito</span>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL DE INSTAURAÇÃO DE PROCESSO-CRIME */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#132235] border border-[#223750] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Topo do Modal */}
                            <div className="px-5 py-3.5 border-b border-[#223750] flex items-center justify-between bg-[#0f1b2b]">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-[#c5a059]/20 border border-[#c5a059]/50 rounded text-[#c5a059]">
                                        <FolderGit2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">
                                            Instauração de Processo-Crime
                                        </h2>
                                        <p className="text-[11px] text-slate-400 font-sans">
                                            Abertura solene de inquérito preparatório criminal no SIC
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#17283c] transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Formulário */}
                            <form onSubmit={handleInstaurarSubmit} className="p-5 space-y-4 overflow-y-auto text-xs font-sans">
                                {Object.keys(errors).length > 0 && (
                                    <div className="p-3 bg-rose-950/80 border border-rose-600 rounded text-rose-200 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                        <span>{Object.values(errors)[0]}</span>
                                    </div>
                                )}

                                {/* Seletor de Origem: A partir de Auto ou Direta */}
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1.5">
                                        Origem da Instauração
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setModoInstauracao('auto')}
                                            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                modoInstauracao === 'auto'
                                                    ? 'bg-[#1a2d42] border-[#c5a059] text-white shadow-sm'
                                                    : 'bg-[#0d1a26] border-[#223750] text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            <FileText className="w-4 h-4 text-[#c5a059]" />
                                            <div>
                                                <div className="font-bold">A partir de Auto de Notícia</div>
                                                <div className="text-[10px] text-slate-400">Converter auto existente</div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModoInstauracao('direta');
                                                setFormData('ocorrencia_id', '');
                                            }}
                                            className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                modoInstauracao === 'direta'
                                                    ? 'bg-[#1a2d42] border-[#c5a059] text-white shadow-sm'
                                                    : 'bg-[#0d1a26] border-[#223750] text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            <Scale className="w-4 h-4 text-[#c5a059]" />
                                            <div>
                                                <div className="font-bold">Abertura Directa / Ofício PGR</div>
                                                <div className="text-[10px] text-slate-400">Determinação da PGR/Tribunal</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Auto de Notícia Disponível */}
                                {modoInstauracao === 'auto' && (
                                    <div>
                                        <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                                            Selecionar Auto de Notícia Pendente *
                                        </label>
                                        <select
                                            value={formData.ocorrencia_id}
                                            onChange={(e) => handleSelectAuto(e.target.value)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] text-slate-100 p-2.5 rounded-md focus:border-[#c5a059] focus:outline-none"
                                            required={modoInstauracao === 'auto'}
                                        >
                                            <option value="">Selecione o auto de notícia para instruir...</option>
                                            {autos_disponiveis.map((auto) => (
                                                <option key={auto.id} value={auto.id}>
                                                    {auto.numero_ocorrencia} — {auto.classificacao_codigo} ({new Date(auto.data_hora_facto).toLocaleDateString('pt-AO')})
                                                </option>
                                            ))}
                                        </select>
                                        {autos_disponiveis.length === 0 && (
                                            <p className="text-[11px] text-amber-400 mt-1">
                                                Não existem autos de notícia pendentes de instrução na sua jurisdição. Pode optar por Abertura Directa.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Tipologia Penal */}
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                                        Tipologia Penal Principal (Código Penal Angolano) *
                                    </label>
                                    <select
                                        value={formData.tipologia_legal}
                                        onChange={(e) => setFormData('tipologia_legal', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-[#DFC07A] font-bold p-2.5 rounded-md focus:border-[#c5a059] focus:outline-none"
                                        required
                                    >
                                        {tipologias_lista.map((tip, idx) => (
                                            <option key={idx} value={tip}>
                                                {tip}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Província de Jurisdição */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                                            Província de Jurisdição *
                                        </label>
                                        {pode_ver_todas_provincias && modoInstauracao === 'direta' ? (
                                            <select
                                                value={formData.provincia_id}
                                                onChange={(e) => setFormData('provincia_id', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                                required
                                            >
                                                {provincias_lista.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.nome}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                disabled
                                                value={jurisdicao_usuario?.provincia_nome || 'Luanda'}
                                                className="w-full bg-[#0b1622] border border-amber-900/50 text-amber-200/90 p-2 rounded-md cursor-not-allowed opacity-90 font-medium"
                                            />
                                        )}
                                    </div>

                                    {/* Prazo de Instrução */}
                                    <div>
                                        <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                                            Prazo Legal de Instrução (CPP)
                                        </label>
                                        <select
                                            value={formData.meses_instrucao}
                                            onChange={(e) => setFormData('meses_instrucao', parseInt(e.target.value))}
                                            className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                        >
                                            <option value={3}>3 Meses (Prazo Acelerado)</option>
                                            <option value={6}>6 Meses (Prazo Padrão Geral)</option>
                                            <option value={8}>8 Meses (Crime Organizado / Especial Complexidade)</option>
                                            <option value={12}>12 Meses (Extrema Complexidade com Arguição)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Magistrado do Ministério Público (PGR) */}
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                                        Magistrado do Ministério Público (PGR) / Secção
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.magistrado_pgr}
                                        onChange={(e) => setFormData('magistrado_pgr', e.target.value)}
                                        placeholder="Ex: Dr. Hermenegildo Gaspar — 2ª Secção de Crimes Comuns PGR Luanda"
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-100 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                    />
                                </div>

                                {/* Segredo de Justiça */}
                                <div className="p-3 bg-[#0d1a26] border border-[#223750] rounded-md flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-slate-200 block">Segredo de Justiça Ativo</span>
                                        <span className="text-[11px] text-slate-400">
                                            O processo fica restrito apenas aos oficiais designados e ao magistrado do MP.
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.segredo_justica}
                                        onChange={(e) => setFormData('segredo_justica', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-700 text-[#c5a059] focus:ring-[#c5a059]"
                                    />
                                </div>

                                {/* Rodapé com Ações */}
                                <div className="flex items-center justify-between pt-3 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 text-xs font-sans rounded-md border border-[#223750] transition-colors cursor-pointer"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#dfc07a] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded-md shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        <span>{processing ? 'A Instaurar Inquérito...' : 'Confirmar & Instaurar Processo'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </TacticalLayout>
    );
}
