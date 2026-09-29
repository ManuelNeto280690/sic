import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import {
    Clock,
    Plus,
    AlertOctagon,
    AlertTriangle,
    CheckCircle2,
    Shield,
    UserCheck,
    Search,
    ChevronRight,
    Filter,
    X,
    Eye,
    Send,
    LogOut,
    ArrowUpRight,
    Lock,
    Building2,
    MapPin,
    FileText,
    Printer,
} from 'lucide-react';
import { Detencao, CadastroIndividuo, ProcessoCrime, Provincia } from '@/types';

interface DetidosProps {
    detencoes: {
        data: (Detencao & { horas_restantes: number; urgente: boolean; expirado: boolean })[];
        links: any[];
        total: number;
    };
    filtros: {
        search?: string;
        estado?: string;
        provincia_id?: string;
    };
    provincias_lista?: Provincia[];
    jurisdicao_nome?: string;
    individuos_disponiveis: CadastroIndividuo[];
    processos_disponiveis: ProcessoCrime[];
    estatisticas: {
        total_em_cela: number;
        criticos_12h: number;
        apresentados_mp: number;
        transferidos: number;
        libertados?: number;
    };
}

export default function DetidosIndex({
    detencoes,
    filtros = {},
    provincias_lista = [],
    jurisdicao_nome = 'Nacional',
    individuos_disponiveis = [],
    processos_disponiveis = [],
    estatisticas,
}: DetidosProps) {
    const [showModal, setShowModal] = useState(false);
    const [detalhesModal, setDetalhesModal] = useState<any | null>(null);
    const [modalTramitacao, setModalTramitacao] = useState<{ id: string; novoEstado: string; titulo: string; defaultObs: string; nome: string } | null>(null);
    const [obsTramitacao, setObsTramitacao] = useState('');
    const [tramitando, setTramitando] = useState(false);
    const [now, setNow] = useState(new Date());

    // Filtros Locais
    const [search, setSearch] = useState(filtros.search || '');
    const [estado, setEstado] = useState(filtros.estado || '');
    const [provinciaId, setProvinciaId] = useState(filtros.provincia_id || '');

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleFiltrar = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            route('detidos.index'),
            {
                search: search || undefined,
                estado: estado || undefined,
                provincia_id: provinciaId || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleLimparFiltros = () => {
        setSearch('');
        setEstado('');
        setProvinciaId('');
        router.get(route('detidos.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const { data, setData, post, processing, reset, errors } = useForm({
        individuo_id: individuos_disponiveis[0]?.id || '',
        processo_id: processos_disponiveis[0]?.id || '',
        data_hora_detencao: new Date().toISOString().slice(0, 16),
        local_detencao: `Cela Transitória do Piquete Central (${jurisdicao_nome})`,
        motivo_legal: 'Detenção em flagrante delito / Mandado de Captura por crime violento sob alçada do Art. 63º CRA.',
    });

    const handleNovaDetencao = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('detidos.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    const handleAbrirTramitacao = (det: any, novoEstado: string) => {
        let titulo = 'Atualizar Custódia';
        let defaultObs = '';
        if (novoEstado === 'APRESENTADO_MP') {
            titulo = 'Apresentar Cidadão ao Ministério Público (Art. 63º CRA)';
            defaultObs = `Remessa para 1º Interrogatório Judicial de Arguido Preso junto do Digno Magistrado do Ministério Público.`;
        } else if (novoEstado === 'LIBERTADO') {
            titulo = 'Registar Soltura do Cidadão';
            defaultObs = `Soltura efetuada por Despacho / Termo de Identidade e Residência (TIR).`;
        } else if (novoEstado === 'TRANSFERIDO_PRISAO') {
            titulo = 'Transferência para Estabelecimento Prisional';
            defaultObs = `Transferência efetuada para o Estabelecimento Prisional sob mandado de condução à cadeia.`;
        }
        setObsTramitacao(defaultObs);
        setModalTramitacao({
            id: det.id,
            novoEstado,
            titulo,
            defaultObs,
            nome: det.individuo?.nome_completo || 'Cidadão Detido',
        });
    };

    const handleConfirmarTramitacao = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalTramitacao) return;

        setTramitando(true);
        router.patch(route('detidos.update-estado', modalTramitacao.id), {
            estado_custodia: modalTramitacao.novoEstado,
            observacoes_tramitacao: obsTramitacao,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                if (detalhesModal && detalhesModal.id === modalTramitacao.id) {
                    setDetalhesModal((prev: any) => prev ? {
                        ...prev,
                        estado_custodia: modalTramitacao.novoEstado,
                        observacoes_tramitacao: obsTramitacao,
                    } : null);
                }
                setModalTramitacao(null);
                setTramitando(false);
            },
            onError: () => {
                setTramitando(false);
            },
        });
    };

    const getRemainingFormatted = (deadlineStr: string) => {
        const diffMs = new Date(deadlineStr).getTime() - now.getTime();
        const diffSecs = Math.floor(diffMs / 1000);

        if (diffSecs <= 0) {
            return {
                text: 'EXPIRADO (VIOLAÇÃO ART. 63º CRA)',
                isExpired: true,
                isCritical: false,
                percentual: 100,
            };
        }

        const h = Math.floor(diffSecs / 3600);
        const m = Math.floor((diffSecs % 3600) / 60);
        const s = diffSecs % 60;
        const total48hSecs = 48 * 3600;
        const passedSecs = total48hSecs - diffSecs;
        const percentual = Math.min(100, Math.max(0, Math.round((passedSecs / total48hSecs) * 100)));

        return {
            text: `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`,
            isExpired: false,
            isCritical: diffSecs <= 12 * 3600,
            percentual,
        };
    };

    const hasActiveFilters = Boolean(search || estado || provinciaId);

    return (
        <TacticalLayout title="Celas Transitórias">
            <div className="space-y-6">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                Controlo de Celas Transitórias & Prazos Constitucionais (48h)
                            </h1>
                            <span className="px-2 py-0.5 bg-[#17283c] border border-[#223750] text-[#c5a059] text-[10px] font-mono rounded font-semibold">
                                {jurisdicao_nome}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                            Módulo M4 // Garantia de Legalidade e Fiscalização do Artigo 63º da Constituição da República de Angola
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs font-mono uppercase tracking-wider rounded flex items-center gap-2 shadow transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Registar Entrada em Cela</span>
                    </button>
                </div>

                {/* Resumo de Prazos Constitucionais (KPIs) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <TacticalCard className="!p-3 border-amber-500/30">
                        <div className="text-[10px] font-mono text-amber-400 uppercase">Em Cela Transitória</div>
                        <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{estatisticas.total_em_cela}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Custódia ativa &lt; 48h</div>
                    </TacticalCard>

                    <TacticalCard className="!p-3" glow={estatisticas.criticos_12h > 0 ? 'red' : 'none'}>
                        <div className="text-[10px] font-mono text-rose-400 uppercase flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            Prazos Críticos (&lt;12h)
                        </div>
                        <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{estatisticas.criticos_12h}</div>
                        <div className="text-[10px] text-rose-400/80 mt-1">Risco de violação legal</div>
                    </TacticalCard>

                    <TacticalCard className="!p-3 border-emerald-500/30">
                        <div className="text-[10px] font-mono text-emerald-400 uppercase">Apresentados ao MP</div>
                        <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{estatisticas.apresentados_mp}</div>
                        <div className="text-[10px] text-emerald-400/80 mt-1">1º Interrogatório judicial</div>
                    </TacticalCard>

                    <TacticalCard className="!p-3">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Estab. Prisional</div>
                        <div className="text-2xl font-bold font-mono text-slate-200 mt-1">{estatisticas.transferidos}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Medida coativa prisão preventiva</div>
                    </TacticalCard>

                    <TacticalCard className="!p-3">
                        <div className="text-[10px] font-mono text-sky-400 uppercase">Libertados / Despacho</div>
                        <div className="text-2xl font-bold font-mono text-sky-300 mt-1">{estatisticas.libertados || 0}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Termo de identidade e soltura</div>
                    </TacticalCard>
                </div>

                {/* Barra de Filtros e Pesquisa */}
                <form onSubmit={handleFiltrar} className="flex flex-wrap items-center gap-3 p-3 bg-[#132235] border border-[#223750] rounded-md shadow-sm">
                    <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-[#0d1a26] border border-[#223750] rounded px-3 py-1.5 focus-within:border-[#c5a059]">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pesquisar por Nome, BI, NIP do Captor, Cela..."
                            className="bg-transparent text-slate-100 text-xs font-sans w-full focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="bg-[#0d1a26] border border-[#223750] text-slate-200 text-xs font-sans rounded px-3 py-1.5 focus:border-[#c5a059]"
                        >
                            <option value="">Todos os Estados de Custódia</option>
                            <option value="CELA_TRANSITORIA">Em Cela Transitória (48h)</option>
                            <option value="APRESENTADO_MP">Apresentado ao Ministério Público</option>
                            <option value="TRANSFERIDO_PRISAO">Transferido a Estab. Prisional</option>
                            <option value="LIBERTADO">Libertado (Alvará de Soltura)</option>
                        </select>

                        {provincias_lista && provincias_lista.length > 0 && (
                            <select
                                value={provinciaId}
                                onChange={(e) => setProvinciaId(e.target.value)}
                                className="bg-[#0d1a26] border border-[#223750] text-slate-200 text-xs font-sans rounded px-3 py-1.5 focus:border-[#c5a059]"
                            >
                                <option value="">Todas as Províncias (Nacional)</option>
                                {provincias_lista.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} ({p.codigo_iso})
                                    </option>
                                ))}
                            </select>
                        )}

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-200 border border-[#223750] hover:border-slate-400 rounded text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Filtrar</span>
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleLimparFiltros}
                                className="p-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-400 hover:text-slate-200 rounded border border-[#223750] transition-colors cursor-pointer"
                                title="Limpar filtros"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </form>

                {/* Tabela de Detidos e Countdown 48h */}
                <div className="bg-[#132235] border border-[#223750] rounded overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans divide-y divide-[#223750]">
                            <thead className="bg-[#0e1824] text-slate-400 uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Cidadão Sob Custódia</th>
                                    <th className="px-4 py-3">Processo-Crime / Jurisdição</th>
                                    <th className="px-4 py-3">Início da Detenção</th>
                                    <th className="px-4 py-3">Prazo Constitucional (48h)</th>
                                    <th className="px-4 py-3">Relógio Regressivo</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Gestão da Custódia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#223750]/50">
                                {detencoes.data.length > 0 ? (
                                    detencoes.data.map((det) => {
                                        const rem = getRemainingFormatted(det.limite_legal_48h);

                                        return (
                                            <tr key={det.id} className="hover:bg-[#17283c]/80 transition-colors group">
                                                <td className="px-4 py-3 font-semibold text-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded bg-[#0d1a26] border border-[#223750] flex items-center justify-center text-slate-300 shrink-0 font-mono text-[11px] font-bold">
                                                            {det.individuo?.nome_completo?.charAt(0) || 'D'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-100">{det.individuo?.nome_completo}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">
                                                                BI: {det.individuo?.numero_bi || 'N/D'} • {det.local_detencao}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-slate-300">
                                                    {det.processo ? (
                                                        <div>
                                                            <span className="font-mono text-blue-400 font-medium">
                                                                {det.processo.numero_processo}
                                                            </span>
                                                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                                                                {det.processo.tipologia_legal}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-500 italic">
                                                            Auto Direto (Sem Inquérito)
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                                                    {new Date(det.data_hora_detencao).toLocaleString('pt-AO', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>

                                                <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                                                    {new Date(det.limite_legal_48h).toLocaleString('pt-AO', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {det.estado_custodia === 'CELA_TRANSITORIA' ? (
                                                        <div className="space-y-1">
                                                            <div
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider ${
                                                                    rem.isExpired
                                                                        ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                                                                        : rem.isCritical
                                                                        ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                                                                        : 'bg-[#0d1a26] text-emerald-300 border border-emerald-800'
                                                                }`}
                                                            >
                                                                {rem.isExpired ? (
                                                                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                                                                ) : rem.isCritical ? (
                                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                                                ) : (
                                                                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                                                )}
                                                                <span>{rem.text}</span>
                                                            </div>
                                                            <div className="w-28 h-1 bg-[#0d1a26] rounded-full overflow-hidden border border-[#223750]">
                                                                <div
                                                                    className={`h-full ${
                                                                        rem.isExpired
                                                                            ? 'bg-rose-600'
                                                                            : rem.isCritical
                                                                            ? 'bg-amber-500'
                                                                            : 'bg-emerald-500'
                                                                    }`}
                                                                    style={{ width: `${rem.percentual}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-500 font-mono">
                                                            Prazo Concluído
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <StatusBadge status={det.estado_custodia} type="detencao" />
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={route('detidos.pdf', det.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 bg-[#0d1a26] hover:bg-[#17283c] border border-[#c5a059]/40 text-[#c5a059] hover:text-[#DFC07A] rounded transition-colors inline-flex items-center justify-center"
                                                            title="Imprimir Auto de Detenção e Guia 48h (PDF Oficial)"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </a>

                                                        <button
                                                            onClick={() => setDetalhesModal(det)}
                                                            className="p-1 bg-[#0d1a26] hover:bg-[#17283c] border border-[#223750] text-slate-300 hover:text-white rounded transition-colors"
                                                            title="Ver Ficha Completa de Custódia"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>

                                                        {det.estado_custodia === 'CELA_TRANSITORIA' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAbrirTramitacao(det, 'APRESENTADO_MP')}
                                                                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                                                    title="Apresentar formalmente ao Ministério Público (PGR)"
                                                                >
                                                                    <Send className="w-3 h-3 text-emerald-400" />
                                                                    <span>Apresentar MP</span>
                                                                </button>

                                                                <button
                                                                    onClick={() => handleAbrirTramitacao(det, 'LIBERTADO')}
                                                                    className="px-2 py-1 bg-[#132235] hover:bg-slate-800 text-slate-300 border border-[#223750] rounded text-[11px] font-mono transition-colors cursor-pointer"
                                                                    title="Soltura por Termo de Identidade e Residência ou Despacho"
                                                                >
                                                                    Soltar
                                                                </button>
                                                            </>
                                                        )}

                                                        {det.estado_custodia === 'APRESENTADO_MP' && (
                                                            <button
                                                                onClick={() => handleAbrirTramitacao(det, 'TRANSFERIDO_PRISAO')}
                                                                className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-700 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                                                title="Transferir para Estabelecimento Prisional"
                                                            >
                                                                <Lock className="w-3 h-3 text-blue-400" />
                                                                <span>Prisão Efetiva</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            <div className="max-w-md mx-auto space-y-3">
                                                <div className="w-12 h-12 mx-auto rounded-full bg-[#0d1a26] border border-[#223750] flex items-center justify-center text-[#c5a059]">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <div className="text-sm font-semibold text-slate-200">
                                                    Nenhum cidadão detido sob custódia nas celas desta jurisdição
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {hasActiveFilters
                                                        ? 'Nenhum resultado corresponde aos filtros aplicados. Tente ajustar os parâmetros.'
                                                        : `As celas transitórias de ${jurisdicao_nome} encontram-se atualmente sem detidos pendentes.`}
                                                </p>
                                                {hasActiveFilters ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleLimparFiltros}
                                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-200 border border-[#223750] rounded text-xs"
                                                    >
                                                        Limpar Filtros de Pesquisa
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowModal(true)}
                                                        className="px-3 py-1.5 bg-[#c5a059] text-[#0d1a26] font-bold rounded text-xs uppercase"
                                                    >
                                                        Registar Nova Detenção
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Detalhes da Ficha de Custódia */}
                {detalhesModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-2xl bg-[#132235] border border-[#c5a059] rounded-lg p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-[#c5a059]" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                        Ficha de Custódia & Prazos Constitucionais (48h)
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setDetalhesModal(null)}
                                    className="text-slate-400 hover:text-slate-200 p-1 rounded"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                                <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] space-y-2">
                                    <div className="text-slate-400 text-[10px] uppercase font-bold">Identificação do Suspeito</div>
                                    <div className="text-sm font-bold text-slate-100">{detalhesModal.individuo?.nome_completo}</div>
                                    <div className="text-slate-300">BI: {detalhesModal.individuo?.numero_bi || 'Não Informado'}</div>
                                    <div className="text-slate-400 text-[11px]">Nacionalidade: Angolana</div>
                                </div>

                                <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] space-y-2">
                                    <div className="text-slate-400 text-[10px] uppercase font-bold">Vínculo Processual</div>
                                    <div className="text-sm font-mono text-blue-400 font-bold">
                                        {detalhesModal.processo?.numero_processo || 'Auto de Detenção Direto'}
                                    </div>
                                    <div className="text-slate-300">{detalhesModal.processo?.tipologia_legal || 'Aguardando formalização'}</div>
                                    <div className="text-slate-400 text-[11px]">Jurisdição: {detalhesModal.processo?.provincia?.nome || jurisdicao_nome}</div>
                                </div>
                            </div>

                            <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] space-y-2 text-xs">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">Registo da Captura e Controlo 48h</div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Data/Hora da Detenção:</span>
                                        <span className="text-slate-200 font-mono">
                                            {new Date(detalhesModal.data_hora_detencao).toLocaleString('pt-AO')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Limite Legal Inviolável (48h):</span>
                                        <span className="text-amber-400 font-mono font-bold">
                                            {new Date(detalhesModal.limite_legal_48h).toLocaleString('pt-AO')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[10px]">Efetivo Captor (NIP):</span>
                                        <span className="text-slate-200 font-mono">{detalhesModal.efetivo_captor_nip}</span>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-[#223750]">
                                    <span className="text-slate-400 block text-[10px]">Local de Custódia:</span>
                                    <span className="text-slate-200 font-medium">{detalhesModal.local_detencao}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] text-xs space-y-1">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">Fundamentação Legal da Restrição de Liberdade</div>
                                <p className="text-slate-200 font-sans leading-relaxed">{detalhesModal.motivo_legal}</p>
                            </div>

                            {detalhesModal.observacoes_tramitacao && (
                                <div className="p-3 bg-[#0d1a26] rounded border border-blue-900/40 text-xs space-y-1">
                                    <div className="text-blue-400 text-[10px] uppercase font-bold">Observações de Tramitação / Despacho</div>
                                    <p className="text-slate-200 font-sans leading-relaxed">{detalhesModal.observacoes_tramitacao}</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#223750]">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">Estado Atual:</span>
                                    <StatusBadge status={detalhesModal.estado_custodia} type="detencao" />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <a
                                        href={route('detidos.pdf', detalhesModal.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-[#0d1a26] hover:bg-[#17283c] text-[#c5a059] hover:text-[#DFC07A] border border-[#c5a059]/40 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Imprimir Auto (Art. 63º CRA)</span>
                                    </a>

                                    {detalhesModal.estado_custodia === 'CELA_TRANSITORIA' && (
                                        <button
                                            type="button"
                                            onClick={() => handleAbrirTramitacao(detalhesModal, 'APRESENTADO_MP')}
                                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold"
                                        >
                                            Apresentar MP
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setDetalhesModal(null)}
                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded text-xs"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Nova Detenção */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-lg bg-[#132235] border border-[#c5a059] rounded-lg p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                    Formalizar Entrada em Cela Transitória (48 Horas)
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
                            </div>

                            <form onSubmit={handleNovaDetencao} className="space-y-3 font-sans text-xs">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Cidadão / Suspeito Capturado</label>
                                    <select
                                        value={data.individuo_id}
                                        onChange={(e) => setData('individuo_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    >
                                        {individuos_disponiveis.map((ind) => (
                                            <option key={ind.id} value={ind.id}>
                                                {ind.nome_completo} (BI: {ind.numero_bi || 'N/D'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Processo-Crime Vinculado</label>
                                    <select
                                        value={data.processo_id}
                                        onChange={(e) => setData('processo_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="">Sem inquérito associado (Auto de Detenção Direta)</option>
                                        {processos_disponiveis.map((proc) => (
                                            <option key={proc.id} value={proc.id}>
                                                {proc.numero_processo} — {proc.tipologia_legal}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Data e Hora Exata da Captura</label>
                                    <input
                                        type="datetime-local"
                                        value={data.data_hora_detencao}
                                        onChange={(e) => setData('data_hora_detencao', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059] [color-scheme:dark]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Cela / Posto de Custódia</label>
                                    <input
                                        type="text"
                                        value={data.local_detencao}
                                        onChange={(e) => setData('local_detencao', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Fundamentação Jurídica da Detenção</label>
                                    <textarea
                                        value={data.motivo_legal}
                                        onChange={(e) => setData('motivo_legal', e.target.value)}
                                        rows={3}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded border border-[#223750]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold rounded cursor-pointer"
                                    >
                                        {processing ? 'Formalizando...' : 'Iniciar Contagem 48h'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Confirmação de Tramitação de Custódia */}
                {modalTramitacao && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-md bg-[#132235] border border-[#c5a059] rounded-lg p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                    {modalTramitacao.titulo}
                                </h2>
                                <button onClick={() => setModalTramitacao(null)} className="text-slate-400 hover:text-white">✕</button>
                            </div>

                            <form onSubmit={handleConfirmarTramitacao} className="space-y-3 font-sans text-xs">
                                <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] space-y-1">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Cidadão em Custódia</div>
                                    <div className="text-sm font-bold text-slate-100">{modalTramitacao.nome}</div>
                                    <div className="text-[11px] text-[#c5a059]">
                                        Novo Estado: <strong>{modalTramitacao.novoEstado.replace(/_/g, ' ')}</strong>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Observações / Referência do Despacho ou Ofício
                                    </label>
                                    <textarea
                                        value={obsTramitacao}
                                        onChange={(e) => setObsTramitacao(e.target.value)}
                                        rows={4}
                                        placeholder="Registe o número do ofício da PGR, despacho do juiz de garantias ou motivo da soltura..."
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2.5 rounded focus:border-[#c5a059] text-xs leading-relaxed"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalTramitacao(null)}
                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded border border-[#223750]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={tramitando}
                                        className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold rounded cursor-pointer flex items-center gap-1.5"
                                    >
                                        {tramitando ? 'A processar...' : 'Confirmar Tramitação'}
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
