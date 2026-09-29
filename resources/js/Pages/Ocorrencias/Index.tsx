import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import {
    BookOpen,
    PlusCircle,
    Search,
    Filter,
    FileText,
    ChevronRight,
    ChevronLeft,
    RotateCcw,
    Calendar,
    Clock,
    X,
    MapPin,
    Shield,
    Scale,
    Lock,
    Edit3,
    AlertCircle,
    CheckCircle2,
    Download,
} from 'lucide-react';
import { Ocorrencia, Provincia } from '@/types';

interface IndexProps {
    ocorrencias: {
        data: (Ocorrencia & { pode_editar?: boolean })[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    provincias_lista: (Provincia & { municipios: any[] })[];
    tipologias_lista: any[];
    participacoes_lista: any[];
    filtros: {
        search?: string;
        estado?: string;
        provincia_id?: string;
        municipio_id?: string;
        classificacao_codigo?: string;
        tipo_participacao?: string;
        origem_pop?: string;
        data_inicio?: string;
        data_fim?: string;
    };
    estatisticas_resumo: {
        total: number;
        em_triagem: number;
        processadas: number;
        origem_pop: number;
    };
    pode_ver_todas_provincias?: boolean;
    jurisdicao_usuario?: {
        provincia_id: string | null;
        provincia_nome: string | null;
        municipio_id: string | null;
        municipio_nome: string | null;
        unidade_nome: string | null;
        unidade_sigla: string | null;
        perfil: string | null;
    };
}

export default function OcorrenciasIndex({
    ocorrencias,
    provincias_lista,
    tipologias_lista,
    participacoes_lista,
    filtros,
    estatisticas_resumo,
    pode_ver_todas_provincias = true,
    jurisdicao_usuario,
}: IndexProps) {
    // Estados locais dos filtros
    const [search, setSearch] = useState(filtros.search || '');
    const [estado, setEstado] = useState(filtros.estado || '');
    const [provinciaId, setProvinciaId] = useState(
        !pode_ver_todas_provincias && jurisdicao_usuario?.provincia_id
            ? jurisdicao_usuario.provincia_id
            : filtros.provincia_id || ''
    );
    const [municipioId, setMunicipioId] = useState(filtros.municipio_id || '');
    const [classificacao, setClassificacao] = useState(filtros.classificacao_codigo || '');
    const [tipoParticipacao, setTipoParticipacao] = useState(filtros.tipo_participacao || '');
    const [origemPop, setOrigemPop] = useState(filtros.origem_pop || '');
    const [dataInicio, setDataInicio] = useState(filtros.data_inicio || '');
    const [dataFim, setDataFim] = useState(filtros.data_fim || '');


    // Preset de período
    const [periodoPreset, setPeriodoPreset] = useState<string>(() => {
        if (!filtros.data_inicio && !filtros.data_fim) return 'todos';
        return 'outros';
    });

    // Municípios correspondentes à província selecionada
    const provinciaSelecionada = provincias_lista.find((p) => p.id === provinciaId);
    const municipiosDisponiveis = provinciaSelecionada?.municipios || [];

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
            case 'hoje':
                start = formatIsoDate(now);
                break;
            case 'ontem': {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                start = formatIsoDate(y);
                end = formatIsoDate(y);
                break;
            }
            case '3dias': {
                const d = new Date();
                d.setDate(d.getDate() - 3);
                start = formatIsoDate(d);
                break;
            }
            case '7dias': {
                const d = new Date();
                d.setDate(d.getDate() - 7);
                start = formatIsoDate(d);
                break;
            }
            case '15dias': {
                const d = new Date();
                d.setDate(d.getDate() - 15);
                start = formatIsoDate(d);
                break;
            }
            case 'mes': {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                start = formatIsoDate(firstDay);
                break;
            }
            case '6meses': {
                const d = new Date();
                d.setMonth(d.getMonth() - 6);
                start = formatIsoDate(d);
                break;
            }
            case '1ano': {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 1);
                start = formatIsoDate(d);
                break;
            }
            case 'ano_anterior': {
                const lastYear = now.getFullYear() - 1;
                start = `${lastYear}-01-01`;
                end = `${lastYear}-12-31`;
                break;
            }
            case 'todos':
                start = '';
                end = '';
                break;
            default:
                return;
        }

        setDataInicio(start);
        setDataFim(end);

        executeFilter({
            search,
            estado,
            provincia_id: provinciaId,
            municipio_id: municipioId,
            classificacao_codigo: classificacao,
            tipo_participacao: tipoParticipacao,
            origem_pop: origemPop,
            data_inicio: start,
            data_fim: end,
        });
    };

    const executeFilter = (customParams?: Record<string, any>) => {
        const params: Record<string, any> = customParams || {
            search,
            estado,
            provincia_id: !pode_ver_todas_provincias && jurisdicao_usuario?.provincia_id ? jurisdicao_usuario.provincia_id : provinciaId,
            municipio_id: municipioId,
            classificacao_codigo: classificacao,
            tipo_participacao: tipoParticipacao,
            origem_pop: origemPop,
            data_inicio: dataInicio,
            data_fim: dataFim,
        };

        // Remove chaves vazias
        Object.keys(params).forEach((key) => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                delete params[key];
            }
        });

        router.get(route('ocorrencias.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeFilter();
    };

    const handleClearFilters = () => {
        setSearch('');
        setEstado('');
        if (pode_ver_todas_provincias) {
            setProvinciaId('');
        }
        setMunicipioId('');
        setClassificacao('');
        setTipoParticipacao('');
        setOrigemPop('');
        setDataInicio('');
        setDataFim('');
        setPeriodoPreset('todos');

        const resetParams: Record<string, any> = {};
        if (!pode_ver_todas_provincias && jurisdicao_usuario?.provincia_id) {
            resetParams.provincia_id = jurisdicao_usuario.provincia_id;
        }

        router.get(route('ocorrencias.index'), resetParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };


    const hasActiveFilters = Boolean(
        search || estado || (pode_ver_todas_provincias && provinciaId) || municipioId || classificacao || tipoParticipacao || origemPop || dataInicio || dataFim
    );

    return (
        <TacticalLayout title="Autos de Notícia">
            <div className="space-y-5">
                {/* Cabeçalho da Página e Ações */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <FileText className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-lg font-bold text-slate-100 font-sans tracking-normal">
                                Autos de Notícia & Notícias-Crime
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
                        <p className="text-xs text-slate-400 font-sans mt-1">
                            {pode_ver_todas_provincias
                                ? 'Ingestão e triagem primária de autos de notícia e participações penais nas 21 Províncias da República de Angola'
                                : `Segregação Operacional: Consulta circunscrita à Província de ${jurisdicao_usuario?.provincia_nome || 'atribuição'}. Edição restrita a autos da sua autoria.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('ocorrencias.create')}
                            className="px-4 py-2 bg-[#c5a059] hover:bg-[#dfc07a] text-[#0d1a26] font-bold rounded-md text-xs font-sans uppercase tracking-wider flex items-center gap-2 shadow-md transition-colors"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Novo Auto de Notícia</span>
                        </Link>
                    </div>
                </div>

                {/* Cards de Resumo Tático */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#132235] border border-[#223750] p-3.5 rounded-lg flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block font-semibold">
                                {pode_ver_todas_provincias ? 'Total Geral Autos' : `Total na Província (${jurisdicao_usuario?.provincia_nome})`}
                            </span>
                            <span className="text-2xl font-bold font-mono text-slate-100">{estatisticas_resumo.total}</span>
                        </div>
                        <FileText className="w-5 h-5 text-[#c5a059]" />
                    </div>

                    <div className="bg-[#132235] border border-[#223750] p-3.5 rounded-lg flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block font-semibold">
                                Em Triagem Preliminar
                            </span>
                            <span className="text-2xl font-bold font-mono text-amber-400">{estatisticas_resumo.em_triagem}</span>
                        </div>
                        <Clock className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="bg-[#132235] border border-[#223750] p-3.5 rounded-lg flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block font-semibold">
                                Inquéritos Instaurados
                            </span>
                            <span className="text-2xl font-bold font-mono text-purple-400">{estatisticas_resumo.processadas}</span>
                        </div>
                        <Scale className="w-5 h-5 text-purple-400" />
                    </div>

                    <div className="bg-[#132235] border border-[#223750] p-3.5 rounded-lg flex items-center justify-between">
                        <div>
                            <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block font-semibold">
                                Origem POP / PNA
                            </span>
                            <span className="text-2xl font-bold font-mono text-sky-400">{estatisticas_resumo.origem_pop}</span>
                        </div>
                        <Shield className="w-5 h-5 text-sky-400" />
                    </div>
                </div>

                {/* Painel Avançado de Filtros */}
                <div className="bg-[#132235] border border-[#223750] rounded-lg p-4 shadow-sm">
                    <form onSubmit={handleFilterSubmit} className="space-y-3">
                        {/* Linha 1: Pesquisa Textual + Período Rápido + Intervalo de Datas */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            {/* Pesquisa Texto */}
                            <div className="sm:col-span-4 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Nº do auto, tipologia, suspeito, interveniente..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 rounded-md placeholder-slate-500 focus:outline-none focus:border-[#2563eb]"
                                />
                            </div>

                            {/* Preset de Período Rápido */}
                            <div className="sm:col-span-3">
                                <select
                                    value={periodoPreset}
                                    onChange={(e) => applyPreset(e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb]"
                                >
                                    <option value="todos">Período: Todo o Histórico</option>
                                    <option value="hoje">Período: Hoje</option>
                                    <option value="ontem">Período: Ontem</option>
                                    <option value="3dias">Período: Últimos 3 dias</option>
                                    <option value="7dias">Período: Últimos 7 dias</option>
                                    <option value="15dias">Período: Últimos 15 dias</option>
                                    <option value="mes">Período: Este Mês</option>
                                    <option value="6meses">Período: Últimos 6 meses</option>
                                    <option value="1ano">Período: Último 1 ano</option>
                                    <option value="ano_anterior">Período: Ano Anterior</option>
                                    <option value="outros">Período: Personalizado (Datas)</option>
                                </select>
                            </div>

                            {/* Data Início */}
                            <div className="sm:col-span-2.5 flex items-center gap-1.5 bg-[#0d1a26] border border-[#223750] rounded-md px-2.5 py-1.5">
                                <span className="text-[10px] uppercase font-sans text-slate-400 font-medium">De:</span>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => {
                                        setDataInicio(e.target.value);
                                        setPeriodoPreset('outros');
                                    }}
                                    className="w-full bg-transparent text-slate-200 text-xs font-sans focus:outline-none [color-scheme:dark]"
                                />
                            </div>

                            {/* Data Fim */}
                            <div className="sm:col-span-2.5 flex items-center gap-1.5 bg-[#0d1a26] border border-[#223750] rounded-md px-2.5 py-1.5">
                                <span className="text-[10px] uppercase font-sans text-slate-400 font-medium">Até:</span>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => {
                                        setDataFim(e.target.value);
                                        setPeriodoPreset('outros');
                                    }}
                                    className="w-full bg-transparent text-slate-200 text-xs font-sans focus:outline-none [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Linha 2: Província + Município + Estado + Tipologia + Tipo Participação + Botão Filtrar */}
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                            {/* Província */}
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium flex items-center justify-between">
                                    <span>Província</span>
                                    {!pode_ver_todas_provincias && (
                                        <Lock className="w-3 h-3 text-amber-400" title="Jurisdição restrita ao seu comando provincial" />
                                    )}
                                </label>
                                {pode_ver_todas_provincias ? (
                                    <select
                                        value={provinciaId}
                                        onChange={(e) => {
                                            setProvinciaId(e.target.value);
                                            setMunicipioId('');
                                        }}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb]"
                                    >
                                        <option value="">Todas as Províncias (21)</option>
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

                            {/* Município */}
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium">Município</label>
                                <select
                                    value={municipioId}
                                    onChange={(e) => setMunicipioId(e.target.value)}
                                    disabled={!provinciaId && pode_ver_todas_provincias}
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb] disabled:opacity-50"
                                >
                                    <option value="">Todos os Municípios</option>
                                    {municipiosDisponiveis.map((m: any) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium">Estado</label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb]"
                                >
                                    <option value="">Todos os Estados</option>
                                    <option value="REGISTADA">REGISTADA</option>
                                    <option value="EM_TRIAGEM">EM TRIAGEM</option>
                                    <option value="INSTAURADO_PROCESSO">INQUÉRITO INSTAURADO</option>
                                    <option value="ARQUIVADA">ARQUIVADA</option>
                                </select>
                            </div>

                            {/* Tipologia Legal */}
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium">Tipologia Legal</label>
                                <select
                                    value={classificacao}
                                    onChange={(e) => setClassificacao(e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb]"
                                >
                                    <option value="">Todas as Tipologias</option>
                                    {tipologias_lista.map((t) => (
                                        <option key={t.id || t.codigo} value={t.codigo || t.nome}>
                                            {t.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tipo de Participação / Origem */}
                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase mb-1 font-medium">Participação / Origem</label>
                                <select
                                    value={tipoParticipacao}
                                    onChange={(e) => setTipoParticipacao(e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-xs font-sans text-slate-200 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#2563eb]"
                                >
                                    <option value="">Todas as Origens</option>
                                    <option value="PRESENCIAL">Presencial (Denúncia)</option>
                                    <option value="TELEFONICA">Telefónica / Terminal 111</option>
                                    <option value="DENUNCIA_ANONIMA">Denúncia Anónima</option>
                                    <option value="OFICIOSA">Auto Oficioso</option>
                                    <option value="EXPEDIENTE_POP">Expediente POP (PNA)</option>
                                </select>
                            </div>

                            {/* Ações de Filtro */}
                            <div className="flex items-end gap-1.5">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#17283c] hover:bg-[#203650] border border-[#223750] hover:border-[#c5a059]/70 text-slate-100 font-semibold px-3 py-1.5 rounded-md text-xs font-sans flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
                                    <span>Filtrar</span>
                                </button>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        title="Limpar todos os filtros"
                                        className="p-1.5 bg-[#0d1a26] hover:bg-rose-950/40 border border-[#223750] hover:border-rose-800 text-slate-400 hover:text-rose-300 rounded-md text-xs transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Tabela de Ocorrências com Ações e Paginação */}
                <div className="bg-[#132235] border border-[#223750] rounded-lg overflow-hidden shadow-sm">
                    {/* Barra de Status e Contagem */}
                    <div className="px-4 py-2.5 bg-[#0f1b2b] border-b border-[#223750] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-sans text-slate-400">
                        <div>
                            Apresentando <span className="text-slate-100 font-semibold">{ocorrencias.from || 0}</span> a{' '}
                            <span className="text-slate-100 font-semibold">{ocorrencias.to || 0}</span> de{' '}
                            <span className="text-slate-100 font-semibold">{ocorrencias.total}</span> autos de notícia registados
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

                    <table className="w-full text-left border-collapse text-xs font-sans">
                        <thead>
                            <tr className="border-b border-[#223750] bg-[#0d1a26] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="px-4 py-3">Nº Auto de Notícia</th>
                                <th className="px-4 py-3">Tipologia Legal</th>
                                <th className="px-4 py-3">Província / Município</th>
                                <th className="px-4 py-3">Oficial / Interveniente</th>
                                <th className="px-4 py-3">Data e Hora Facto</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#223750]">
                            {ocorrencias.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-mono text-xs">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FileText className="w-8 h-8 text-slate-600" />
                                            <span>Nenhum auto de notícia encontrado para os filtros e jurisdição especificados.</span>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="text-xs text-[#c5a059] hover:underline mt-1"
                                                >
                                                    Limpar filtros para ver todo o registo
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                ocorrencias.data.map((oc) => (
                                    <tr key={oc.id} className="hover:bg-[#17283c]/70 transition-colors group">
                                        <td className="px-4 py-3 text-slate-100">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span className="font-mono text-xs font-medium">{oc.numero_ocorrencia}</span>
                                                {oc.origem_pop && (
                                                    <span className="px-1.5 py-0.5 text-[10px] bg-sky-950/80 text-sky-400 rounded font-sans font-semibold border border-sky-800/80">
                                                        PNA
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-200 font-medium">
                                            {oc.classificacao_codigo}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            {oc.provincia?.nome} <span className="text-slate-500">/</span> {oc.municipio?.nome}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            <div>
                                                <div className="text-[11px] font-medium text-slate-200">
                                                    {oc.utilizador_registo?.nome_completo || 'Oficial SIC'}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-mono">
                                                    {oc.intervenientes && oc.intervenientes.length > 0 ? (
                                                        <span>{oc.intervenientes[0].papel}: {oc.intervenientes[0].nome_identificativo}</span>
                                                    ) : (
                                                        <span>NIP: {oc.utilizador_registo?.nip || 'N/D'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                                            {new Date(oc.data_hora_facto).toLocaleString('pt-AO', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={oc.estado} type="ocorrencia" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                <Link
                                                    href={route('ocorrencias.show', oc.id)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#17283c] hover:bg-[#1e334d] text-slate-200 hover:text-white border border-[#223750] hover:border-slate-500 rounded-md text-xs font-sans font-medium transition-colors"
                                                >
                                                    <span>Consultar</span>
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </Link>

                                                <a
                                                    href={route('ocorrencias.download-pdf', oc.id)}
                                                    download={`Auto_Noticia_${(oc.numero_ocorrencia || 'registo').replace(/[^a-zA-Z0-9_\-]/g, '_')}.pdf`}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#17283c] hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-[#223750] hover:border-rose-700/60 rounded-md text-xs font-sans font-medium transition-colors"
                                                    title="Descarregar Auto de Notícia em formato PDF"
                                                >
                                                    <Download className="w-3.5 h-3.5 text-rose-400" />
                                                    <span className="hidden xl:inline">PDF</span>
                                                </a>

                                                {oc.pode_editar ? (
                                                    <Link
                                                        href={route('ocorrencias.edit', oc.id)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a2d42] hover:bg-[#c5a059] text-[#c5a059] hover:text-[#0d1a26] border border-[#c5a059]/40 hover:border-[#c5a059] rounded-md text-xs font-sans font-medium transition-all cursor-pointer"
                                                        title="Editar este auto de notícia na página completa"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Editar</span>
                                                    </Link>
                                                ) : (
                                                    <span
                                                        title="Edição restrita: Apenas o oficial registador deste auto ou o Administrador do Sistema pode efetuar alterações."
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#0b1622] text-slate-500 border border-[#223750]/40 rounded-md text-[11px] font-mono cursor-not-allowed"
                                                    >
                                                        <Lock className="w-3 h-3 text-slate-500" />
                                                        <span>Bloqueado</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Paginação Completa */}
                    {ocorrencias.last_page > 1 && (
                        <div className="px-4 py-3 bg-[#0f1b2b] border-t border-[#223750] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
                            <div className="text-slate-400">
                                Página <span className="text-slate-100 font-semibold">{ocorrencias.current_page}</span> de{' '}
                                <span className="text-slate-100 font-semibold">{ocorrencias.last_page}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {ocorrencias.links.map((link, idx) => {
                                    let label = link.label;
                                    let isPrevious = label.includes('Previous') || label.includes('&laquo;');
                                    let isNext = label.includes('Next') || label.includes('&raquo;');

                                    if (isPrevious) {
                                        return link.url ? (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                                className="px-2.5 py-1.5 rounded bg-[#17283c] border border-[#223750] text-slate-300 hover:text-white hover:bg-[#1e334d] flex items-center gap-1 transition-colors"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                                <span>Anterior</span>
                                            </Link>
                                        ) : (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1.5 rounded bg-[#0d1a26] border border-[#223750]/60 text-slate-600 flex items-center gap-1 cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                                <span>Anterior</span>
                                            </span>
                                        );
                                    }

                                    if (isNext) {
                                        return link.url ? (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                                className="px-2.5 py-1.5 rounded bg-[#17283c] border border-[#223750] text-slate-300 hover:text-white hover:bg-[#1e334d] flex items-center gap-1 transition-colors"
                                            >
                                                <span>Seguinte</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        ) : (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1.5 rounded bg-[#0d1a26] border border-[#223750]/60 text-slate-600 flex items-center gap-1 cursor-not-allowed"
                                            >
                                                <span>Seguinte</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </span>
                                        );
                                    }

                                    return link.url ? (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                                                link.active
                                                    ? 'bg-[#c5a059] text-[#0d1a26] font-bold shadow-sm'
                                                    : 'bg-[#17283c] text-slate-300 hover:text-white hover:bg-[#1e334d] border border-[#223750]'
                                            }`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
                                        </Link>
                                    ) : (
                                        <span
                                            key={idx}
                                            className="w-8 h-8 flex items-center justify-center rounded text-slate-600 font-mono"
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </TacticalLayout>
    );
}
