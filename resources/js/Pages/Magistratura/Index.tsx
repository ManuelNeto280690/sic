import React, { useState, useMemo } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { PgrLayout } from '@/Layouts/PgrLayout';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import {
    Scale,
    Plus,
    ShieldAlert,
    Clock,
    FileText,
    Search,
    UserX,
    ArrowUpRight,
    Globe,
    CheckCircle2,
    X,
} from 'lucide-react';
import { MandadoSinalizacao, ProcessoCrime, Detencao, CadastroIndividuo } from '@/types';

interface MagistraturaProps {
    mandados: {
        data: MandadoSinalizacao[];
        links: any[];
        total: number;
    };
    processos_remetidos: ProcessoCrime[];
    detidos_fiscalizacao: (Detencao & { horas_restantes: number })[];
    individuos_lista: CadastroIndividuo[];
    processos_lista: ProcessoCrime[];
    estatisticas: {
        mandados_ativos: number;
        interdicoes_saida: number;
        red_notices: number;
        processos_aguardando: number;
    };
}

export default function MagistraturaIndex({
    mandados,
    processos_remetidos = [],
    detidos_fiscalizacao = [],
    individuos_lista = [],
    processos_lista = [],
    estatisticas,
}: MagistraturaProps) {
    const [abaAtiva, setAbaAtiva] = useState<'mandados' | 'inqueritos' | 'celas'>('mandados');
    const [modalEmitir, setModalEmitir] = useState(false);
    const [modalRevogar, setModalRevogar] = useState<MandadoSinalizacao | null>(null);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
    const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

    const formEmitir = useForm({
        individuo_id: individuos_lista[0]?.id || '',
        processo_id: processos_lista[0]?.id || '',
        tipo: 'CAPTURA_NACIONAL',
        fundamentacao_legal:
            'Artigo 288º do Código de Processo Penal Angolano: Perigo iminente de fuga e forte perturbação da ordem e tranquilidade públicas.',
        data_validade: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
        alerta_sme_ativo: true,
        interpol_red_notice: false,
    });

    const formRevogar = useForm({
        motivo_revogacao:
            'Apresentação espontânea do arguido / Decisão de aplicação de medida de coação não privativa da liberdade proferida pelo Magistrado.',
    });

    const handleEmitir = (e: React.FormEvent) => {
        e.preventDefault();
        formEmitir.post(route('magistratura.mandados.emitir'), {
            onSuccess: () => {
                formEmitir.reset();
                setModalEmitir(false);
            },
        });
    };

    const handleRevogar = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalRevogar) return;

        formRevogar.post(route('magistratura.mandados.revogar', modalRevogar.id), {
            onSuccess: () => {
                formRevogar.reset();
                setModalRevogar(null);
            },
        });
    };

    // Filtros de mandados
    const mandadosFiltrados = useMemo(() => {
        return mandados.data.filter((m) => {
            const matchTexto =
                !filtroTexto ||
                m.numero_mandado_oficial.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                m.individuo?.nome_completo?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                m.individuo?.numero_bi?.toLowerCase().includes(filtroTexto.toLowerCase());

            const matchTipo = filtroTipo === 'TODOS' || m.tipo === filtroTipo;
            const matchEstado = filtroEstado === 'TODOS' || m.estado === filtroEstado;

            return matchTexto && matchTipo && matchEstado;
        });
    }, [mandados.data, filtroTexto, filtroTipo, filtroEstado]);

    return (
        <PgrLayout title="Janela da PGR — Ministério Público">
            <div className="space-y-6">
                {/* CABEÇALHO LIMPO DA JANELA DA PGR */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-400" />
                            <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                Janela da PGR — Fiscalização da Legalidade & Mandados
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                            Ministério Público de Angola • Emissão e revogação soberana de ordens judiciais
                        </p>
                    </div>

                    <button
                        onClick={() => setModalEmitir(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold text-xs rounded flex items-center gap-2 shadow transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Novo Mandado / Interdição</span>
                    </button>
                </div>

                {/* KPIS LIMPOS EM TONS DE AZUL */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4">
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                            Mandados Ativos
                        </div>
                        <div className="text-2xl font-bold text-slate-100 mt-1">
                            {estatisticas.mandados_ativos}
                        </div>
                    </div>

                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4">
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                            Interdições de Saída
                        </div>
                        <div className="text-2xl font-bold text-slate-100 mt-1">
                            {estatisticas.interdicoes_saida}
                        </div>
                    </div>

                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4">
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                            Inquéritos para Despacho
                        </div>
                        <div className="text-2xl font-bold text-blue-400 mt-1">
                            {estatisticas.processos_aguardando}
                        </div>
                    </div>

                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4">
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                            Fiscalização de Celas (48h)
                        </div>
                        <div className="text-2xl font-bold text-slate-100 mt-1">
                            {detidos_fiscalizacao.length}
                        </div>
                    </div>
                </div>

                {/* NAVEGAÇÃO LIMPA EM ABAS */}
                <div className="flex items-center gap-2 border-b border-[#223750] pb-2 text-xs font-sans">
                    <button
                        onClick={() => setAbaAtiva('mandados')}
                        className={`px-4 py-2 rounded font-medium transition-colors cursor-pointer ${
                            abaAtiva === 'mandados'
                                ? 'bg-[#1a2e46] text-blue-300 border border-[#2563eb]/60 font-semibold'
                                : 'bg-[#132235] text-slate-400 hover:text-slate-200 border border-[#223750]'
                        }`}
                    >
                        Mandados & Interdições ({mandados.total})
                    </button>

                    <button
                        onClick={() => setAbaAtiva('inqueritos')}
                        className={`px-4 py-2 rounded font-medium transition-colors cursor-pointer ${
                            abaAtiva === 'inqueritos'
                                ? 'bg-[#1a2e46] text-blue-300 border border-[#2563eb]/60 font-semibold'
                                : 'bg-[#132235] text-slate-400 hover:text-slate-200 border border-[#223750]'
                        }`}
                    >
                        Inquéritos para Despacho ({processos_remetidos.length})
                    </button>

                    <button
                        onClick={() => setAbaAtiva('celas')}
                        className={`px-4 py-2 rounded font-medium transition-colors cursor-pointer ${
                            abaAtiva === 'celas'
                                ? 'bg-[#1a2e46] text-blue-300 border border-[#2563eb]/60 font-semibold'
                                : 'bg-[#132235] text-slate-400 hover:text-slate-200 border border-[#223750]'
                        }`}
                    >
                        Fiscalização das Celas 48h ({detidos_fiscalizacao.length})
                    </button>
                </div>

                {/* ABA 1: MANDADOS JUDICIAIS */}
                {abaAtiva === 'mandados' && (
                    <div className="space-y-4">
                        {/* Barra de Filtro Simples */}
                        <div className="bg-[#132235] border border-[#223750] rounded-md p-3 flex flex-col md:flex-row items-center justify-between gap-3">
                            <div className="relative w-full md:w-96">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por Nº do mandado, nome ou BI..."
                                    value={filtroTexto}
                                    onChange={(e) => setFiltroTexto(e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#223750] rounded text-xs text-slate-200 pl-9 pr-3 py-1.5 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 font-sans"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="bg-[#0d1a26] border border-[#223750] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="TODOS">Todos os Tipos</option>
                                    <option value="CAPTURA_NACIONAL">Captura Nacional</option>
                                    <option value="INTERDICAO_SAIDA">Interdição de Saída</option>
                                    <option value="IMPEDIMENTO_ENTRADA">Impedimento de Entrada</option>
                                    <option value="CAPTURA_INTERPOL">Captura INTERPOL</option>
                                </select>

                                <select
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                    className="bg-[#0d1a26] border border-[#223750] text-slate-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="TODOS">Todos os Estados</option>
                                    <option value="ATIVO">Ativos</option>
                                    <option value="REVOGADO">Revogados</option>
                                </select>

                                {(filtroTexto || filtroTipo !== 'TODOS' || filtroEstado !== 'TODOS') && (
                                    <button
                                        onClick={() => {
                                            setFiltroTexto('');
                                            setFiltroTipo('TODOS');
                                            setFiltroEstado('TODOS');
                                        }}
                                        className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tabela de Mandados */}
                        <div className="bg-[#132235] border border-[#223750] rounded-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans divide-y divide-[#223750]">
                                    <thead className="bg-[#0f1b2b] text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                                        <tr>
                                            <th className="px-4 py-3">Número Oficial</th>
                                            <th className="px-4 py-3">Cidadão / Alvo</th>
                                            <th className="px-4 py-3">Tipo de Ordem</th>
                                            <th className="px-4 py-3">Validade</th>
                                            <th className="px-4 py-3">Estado</th>
                                            <th className="px-4 py-3 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#223750]">
                                        {mandadosFiltrados.length > 0 ? (
                                            mandadosFiltrados.map((mand) => (
                                                <tr key={mand.id} className="hover:bg-[#17283c] transition-colors">
                                                    <td className="px-4 py-3 font-mono font-bold text-slate-100">
                                                        {mand.numero_mandado_oficial}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-200">
                                                        <div className="font-medium">{mand.individuo?.nome_completo}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            BI: {mand.individuo?.numero_bi || 'N/D'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                                                        {mand.tipo.replace('_', ' ')}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                                                        {mand.data_validade}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={mand.estado} type="mandado" />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {mand.estado === 'ATIVO' ? (
                                                            <button
                                                                onClick={() => setModalRevogar(mand)}
                                                                className="px-2.5 py-1 bg-[#1a2e46] hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-[#223750] hover:border-rose-700 rounded text-[11px] font-mono transition-colors cursor-pointer"
                                                            >
                                                                Revogar Mandado
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-500 text-[11px] font-mono">
                                                                Revogado
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                                                    Nenhum mandado judicial encontrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 2: INQUÉRITOS PARA DESPACHO */}
                {abaAtiva === 'inqueritos' && (
                    <div className="bg-[#132235] border border-[#223750] rounded-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans text-xs divide-y divide-[#223750]">
                                <thead className="bg-[#0f1b2b] text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                                    <tr>
                                        <th className="px-4 py-3">Processo Nº</th>
                                        <th className="px-4 py-3">Tipologia Legal</th>
                                        <th className="px-4 py-3">Comando de Origem</th>
                                        <th className="px-4 py-3">Investigador</th>
                                        <th className="px-4 py-3">Data de Entrada</th>
                                        <th className="px-4 py-3 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#223750]">
                                    {processos_remetidos.length > 0 ? (
                                        processos_remetidos.map((proc) => (
                                            <tr key={proc.id} className="hover:bg-[#17283c] transition-colors">
                                                <td className="px-4 py-3 font-mono font-bold text-slate-100">
                                                    {proc.numero_processo}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">
                                                    {proc.tipologia_legal}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">
                                                    {proc.provincia?.nome || 'Nacional'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">
                                                    {proc.investigador?.nome_completo || 'SIC'}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-300">
                                                    {proc.data_remessa_mp
                                                        ? new Date(proc.data_remessa_mp).toLocaleDateString('pt-AO')
                                                        : 'Recente'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => window.dispatchEvent(new CustomEvent('sic:open-copilot-processo', { detail: proc }))}
                                                            className="px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800/80 rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
                                                            title="Analisar Autos no Copiloto Jurídico"
                                                        >
                                                            <Scale className="w-3 h-3 text-blue-400" />
                                                            <span>Copiloto</span>
                                                        </button>
                                                        <Link
                                                            href={route('magistratura.processos.show', proc.id)}
                                                            className="px-3 py-1 bg-[#1a2e46] hover:bg-[#223750] text-blue-300 border border-[#223750] rounded text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                                                        >
                                                            <span>Apreciar Autos</span>
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                                                Nenhum inquérito pendente de despacho da PGR neste momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ABA 3: FISCALIZAÇÃO DAS CELAS 48H */}
                {abaAtiva === 'celas' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {detidos_fiscalizacao.length > 0 ? (
                                detidos_fiscalizacao.map((det) => {
                                    const horas = det.horas_restantes;
                                    const isCritico = horas <= 6;
                                    const isUrgente = horas > 6 && horas <= 18;
                                    const isVencido = horas <= 0;

                                    return (
                                        <div
                                            key={det.id}
                                            className="bg-[#132235] border border-[#223750] rounded-md p-4 space-y-3"
                                        >
                                            <div className="flex items-center justify-between border-b border-[#223750] pb-2">
                                                <span className="font-mono text-xs font-bold text-slate-100">
                                                    {det.individuo?.nome_completo || 'Cidadão Sob Custódia'}
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                        isVencido
                                                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                                            : isCritico
                                                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                                            : isUrgente
                                                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                                    }`}
                                                >
                                                    {isVencido ? 'PRAZO EXPIRADO' : `${horas.toFixed(1)}h restantes`}
                                                </span>
                                            </div>

                                            <div className="text-xs space-y-1 font-mono text-slate-300">
                                                <div className="text-slate-400">
                                                    BI: <strong className="text-slate-200">{det.individuo?.numero_bi || 'N/D'}</strong>
                                                </div>
                                                <div className="text-slate-400">
                                                    Processo: <strong className="text-slate-200">{det.processo?.numero_processo || 'Auto de Flagrante'}</strong>
                                                </div>
                                                <div className="text-slate-400">
                                                    Limite Legal: <strong className="text-slate-200">{new Date(det.limite_legal_48h).toLocaleString('pt-AO')}</strong>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-[#223750] flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => window.dispatchEvent(new CustomEvent('sic:open-copilot-processo', {
                                                        detail: {
                                                            id: det.processo_id,
                                                            numero_processo: det.processo?.numero_processo || 'Flagrante Delito',
                                                            tipologia_crime: 'Custódia em Celas Transitórias (Art. 63º CRA)',
                                                            detencao: det,
                                                            data_detencao: det.data_hora_detencao,
                                                        }
                                                    }))}
                                                    className="text-amber-400 hover:text-amber-300 text-[11px] font-mono inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Scale className="w-3 h-3" />
                                                    <span>Auditar no Copiloto</span>
                                                </button>

                                                {det.processo_id && (
                                                    <Link
                                                        href={route('magistratura.processos.show', det.processo_id)}
                                                        className="text-blue-400 hover:text-blue-300 text-[11px] font-mono inline-flex items-center gap-1"
                                                    >
                                                        <span>Ver Auto</span>
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-3 text-center py-10 bg-[#132235] border border-[#223750] rounded-md text-slate-500 text-xs">
                                    Nenhum detido em cela transitória aguardando fiscalização.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL DE EMISSÃO DE MANDADO JUDICIAL */}
                {modalEmitir && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                        <div className="w-full max-w-lg bg-[#132235] border border-[#223750] rounded-md p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <h2 className="text-sm font-bold text-slate-100 font-sans">
                                    Novo Mandado Judicial / Interdição
                                </h2>
                                <button
                                    onClick={() => setModalEmitir(false)}
                                    className="text-slate-400 hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEmitir} className="space-y-3 font-sans text-xs">
                                <div>
                                    <label className="block text-slate-400 text-[11px] mb-1">
                                        Cidadão / Alvo
                                    </label>
                                    <select
                                        value={formEmitir.data.individuo_id}
                                        onChange={(e) => formEmitir.setData('individuo_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-blue-500 focus:outline-none"
                                        required
                                    >
                                        {individuos_lista.map((ind) => (
                                            <option key={ind.id} value={ind.id}>
                                                {ind.nome_completo} (BI: {ind.numero_bi || 'N/D'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">
                                            Tipo de Ordem
                                        </label>
                                        <select
                                            value={formEmitir.data.tipo}
                                            onChange={(e) => formEmitir.setData('tipo', e.target.value as any)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="CAPTURA_NACIONAL">Captura Nacional</option>
                                            <option value="INTERDICAO_SAIDA">Interdição de Saída</option>
                                            <option value="IMPEDIMENTO_ENTRADA">Impedimento de Entrada</option>
                                            <option value="CAPTURA_INTERPOL">Captura INTERPOL</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">
                                            Data de Validade
                                        </label>
                                        <input
                                            type="date"
                                            value={formEmitir.data.data_validade}
                                            onChange={(e) => formEmitir.setData('data_validade', e.target.value)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-blue-500 focus:outline-none font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[11px] mb-1">
                                        Fundamentação Legal do Despacho
                                    </label>
                                    <textarea
                                        value={formEmitir.data.fundamentacao_legal}
                                        onChange={(e) => formEmitir.setData('fundamentacao_legal', e.target.value)}
                                        rows={3}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-blue-500 focus:outline-none leading-relaxed"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalEmitir(false)}
                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#223750] text-slate-300 rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formEmitir.processing}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded"
                                    >
                                        {formEmitir.processing ? 'Emitindo...' : 'Emitir Mandado'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DE REVOGAÇÃO */}
                {modalRevogar && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                        <div className="w-full max-w-lg bg-[#132235] border border-[#223750] rounded-md p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <h2 className="text-sm font-bold text-slate-100 font-sans">
                                    Revogação de Mandado Judicial
                                </h2>
                                <button
                                    onClick={() => setModalRevogar(null)}
                                    className="text-slate-400 hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-300">
                                Mandado: <strong className="text-slate-100 font-mono">{modalRevogar.numero_mandado_oficial}</strong> | Alvo: {modalRevogar.individuo?.nome_completo}
                            </p>

                            <form onSubmit={handleRevogar} className="space-y-3 font-sans text-xs">
                                <div>
                                    <label className="block text-slate-400 text-[11px] mb-1">
                                        Motivação do Despacho de Revogação
                                    </label>
                                    <textarea
                                        value={formRevogar.data.motivo_revogacao}
                                        onChange={(e) => formRevogar.setData('motivo_revogacao', e.target.value)}
                                        rows={3}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalRevogar(null)}
                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#223750] text-slate-300 rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formRevogar.processing}
                                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded"
                                    >
                                        {formRevogar.processing ? 'Revogando...' : 'Confirmar Revogação'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PgrLayout>
    );
}
