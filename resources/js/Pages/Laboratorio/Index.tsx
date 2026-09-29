import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import { LacreBadge } from '@/Components/UI/LacreBadge';
import {
    Microscope,
    Plus,
    CheckCircle2,
    Shield,
    Hash,
    FileCheck,
    Cpu,
    Dna,
    Target,
    Fingerprint,
    FileSearch,
    FlaskConical,
    Search,
    Filter,
    X,
    Eye,
    Printer,
    Copy,
    Check,
    Lock,
} from 'lucide-react';
import { PericiaLaboratorio, ProcessoCrime } from '@/types';

interface PericiaComDetalhes extends PericiaLaboratorio {
    metodologia?: string;
    conclusoes_tecnicas?: string;
    perito?: {
        id?: string;
        nome_completo?: string;
        nip?: string;
    };
}

interface LabProps {
    pericias: {
        data: PericiaComDetalhes[];
        links: any[];
        total: number;
    };
    filtros?: {
        search?: string;
        tipo_pericia?: string;
        estado?: string;
    };
    processos_disponiveis: ProcessoCrime[];
    especialidades?: any[];
    estatisticas: {
        total: number;
        em_analise: number;
        concluidas: number;
        balistica: number;
        biologia_adn: number;
        informatica: number;
    };
}

export default function LaboratorioIndex({
    pericias,
    filtros = {},
    processos_disponiveis = [],
    especialidades = [],
    estatisticas,
}: LabProps) {
    const [modalRequisitar, setModalRequisitar] = useState(false);
    const [modalLaudo, setModalLaudo] = useState<PericiaComDetalhes | null>(null);
    const [modalVerLaudo, setModalVerLaudo] = useState<PericiaComDetalhes | null>(null);
    const [copiadoHash, setCopiadoHash] = useState(false);

    // Filtros Locais
    const [search, setSearch] = useState(filtros.search || '');
    const [tipoPericia, setTipoPericia] = useState(filtros.tipo_pericia || '');
    const [estado, setEstado] = useState(filtros.estado || '');

    const handleFiltrar = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            route('laboratorio.index'),
            {
                search: search || undefined,
                tipo_pericia: tipoPericia || undefined,
                estado: estado || undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleLimparFiltros = () => {
        setSearch('');
        setTipoPericia('');
        setEstado('');
        router.get(route('laboratorio.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const formReq = useForm({
        processo_id: processos_disponiveis[0]?.id || '',
        codigo_vestigio_lacre: `VEST-LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        tipo_pericia: 'BALISTICA',
        descricao_vestigio: '',
    });

    const formLaudo = useForm({
        metodologia: '',
        conclusoes_tecnicas: '',
    });

    const handleRequisitar = (e: React.FormEvent) => {
        e.preventDefault();
        formReq.post(route('laboratorio.store'), {
            onSuccess: () => {
                formReq.reset();
                setModalRequisitar(false);
            },
        });
    };

    const handleAbrirConclusao = (per: PericiaComDetalhes) => {
        formLaudo.setData({
            metodologia: per.metodologia || `Exame comparativo laboratorial com recurso a equipamento ótico calibrado segundo os protocolos oficiais da Direcção Central de Criminalística Forense.`,
            conclusoes_tecnicas: per.conclusoes_tecnicas || '',
        });
        setModalLaudo(per);
    };

    const handleConcluirLaudo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalLaudo) return;

        formLaudo.post(route('laboratorio.concluir-laudo', modalLaudo.id), {
            onSuccess: () => {
                formLaudo.reset();
                setModalLaudo(null);
            },
        });
    };

    const copiarHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        setCopiadoHash(true);
        setTimeout(() => setCopiadoHash(false), 2000);
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'BALISTICA':
                return <Target className="w-4 h-4 text-amber-400" />;
            case 'DACTILOSCOPIA':
                return <Fingerprint className="w-4 h-4 text-sky-400" />;
            case 'INFORMATICA_FORENSE':
                return <Cpu className="w-4 h-4 text-emerald-400" />;
            case 'BIOLOGIA_ADN':
                return <Dna className="w-4 h-4 text-purple-400" />;
            case 'TOXICOLOGIA':
                return <FlaskConical className="w-4 h-4 text-rose-400" />;
            default:
                return <FileSearch className="w-4 h-4 text-slate-400" />;
        }
    };

    const hasActiveFilters = Boolean(search || tipoPericia || estado);

    return (
        <TacticalLayout title="Laboratório Forense">
            <div className="space-y-6">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Microscope className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                Laboratório Central de Criminalística e Ciências Forenses
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                            Módulo M5 // Balística, ADN, Dactiloscopia, Toxicologia e Informática com laudos certificados SHA-256
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            formReq.setData('codigo_vestigio_lacre', `VEST-LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                            setModalRequisitar(true);
                        }}
                        className="px-4 py-2 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs font-mono uppercase tracking-wider rounded flex items-center gap-2 shadow transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Requisitar Exame Pericial</span>
                    </button>
                </div>

                {/* Resumo por Especialidade Forense (KPIs) */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                    <TacticalCard className="!p-3">
                        <div className="text-xs font-sans font-medium text-slate-400">Total de Exames</div>
                        <div className="text-xl font-bold font-mono text-slate-100 mt-1">{estatisticas.total}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] font-mono text-amber-400 uppercase">Em Análise</div>
                        <div className="text-xl font-bold font-mono text-amber-300 mt-1">{estatisticas.em_analise}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] font-mono text-emerald-400 uppercase">Laudos Concluídos</div>
                        <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{estatisticas.concluidas}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] font-mono text-amber-300 uppercase">Balística</div>
                        <div className="text-xl font-bold font-mono text-amber-200 mt-1">{estatisticas.balistica}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] font-mono text-purple-400 uppercase">Biologia / ADN</div>
                        <div className="text-xl font-bold font-mono text-purple-300 mt-1">{estatisticas.biologia_adn}</div>
                    </TacticalCard>
                    <TacticalCard className="!p-3">
                        <div className="text-[10px] font-mono text-sky-400 uppercase">Informática Forense</div>
                        <div className="text-xl font-bold font-mono text-sky-300 mt-1">{estatisticas.informatica}</div>
                    </TacticalCard>
                </div>

                {/* Barra de Filtros e Pesquisa */}
                <form
                    onSubmit={handleFiltrar}
                    className="p-3 bg-[#132235] border border-[#223750] rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                    <div className="sm:col-span-5 relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar por lacre, descrição de vestígio ou processo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0d1a26] border border-[#223750] rounded pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#c5a059]"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={tipoPericia}
                            onChange={(e) => setTipoPericia(e.target.value)}
                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#c5a059]"
                        >
                            <option value="">Todas as Especialidades</option>
                            <option value="BALISTICA">Balística Forense</option>
                            <option value="DACTILOSCOPIA">Dactiloscopia</option>
                            <option value="TOXICOLOGIA">Toxicologia Forense</option>
                            <option value="DOCUMENTOSCOPIA">Documentoscopia</option>
                            <option value="INFORMATICA_FORENSE">Informática Forense</option>
                            <option value="BIOLOGIA_ADN">Biologia / Perfis ADN</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#c5a059]"
                        >
                            <option value="">Todos os Estados</option>
                            <option value="EM_ANALISE">Em Análise</option>
                            <option value="CONCLUIDA">Concluídas (Laudo Assinado)</option>
                            <option value="REQUISITADA">Requisitadas</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] border border-[#c5a059]/40 text-[#c5a059] hover:text-[#DFC07A] text-xs font-mono rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filtrar</span>
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleLimparFiltros}
                                className="p-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-400 hover:text-slate-200 border border-[#223750] rounded"
                                title="Limpar Filtros"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>

                {/* Tabela de Exames Periciais */}
                <div className="bg-[#132235] border border-[#223750] rounded overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans divide-y divide-[#223750]">
                        <thead className="bg-[#17283c] text-slate-400 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Código Vestígio / Lacre</th>
                                <th className="px-4 py-3">Especialidade Forense</th>
                                <th className="px-4 py-3">Processo-Crime</th>
                                <th className="px-4 py-3">Descrição do Vestígio</th>
                                <th className="px-4 py-3">Hash SHA-256 do Laudo</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Ações Periciais</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#223750]/50">
                            {pericias.data.length > 0 ? (
                                pericias.data.map((per) => (
                                    <tr key={per.id} className="hover:bg-[#17283c]/80 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-100">
                                            <LacreBadge codigo={per.codigo_vestigio_lacre} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-slate-200">
                                                {getTipoIcon(per.tipo_pericia)}
                                                <span className="font-medium">{per.tipo_pericia.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            <div className="font-mono text-slate-200">{per.processo?.numero_processo}</div>
                                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{per.processo?.tipologia_legal}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300 truncate max-w-[200px]" title={per.descricao_vestigio}>
                                            {per.descricao_vestigio}
                                        </td>
                                        <td className="px-4 py-3">
                                            {per.hash_laudo_sha256 ? (
                                                <div
                                                    onClick={() => copiarHash(per.hash_laudo_sha256!)}
                                                    className="flex items-center gap-1 text-[10px] text-[#DFC07A] cursor-pointer hover:underline"
                                                    title="Clique para copiar hash SHA-256"
                                                >
                                                    <Hash className="w-3 h-3 text-[#c5a059]" />
                                                    <span className="font-mono select-all truncate max-w-[120px]">{per.hash_laudo_sha256}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-[10px] font-mono">Pendente de laudo</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={per.estado} type="pericia" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Botão de Impressão de Laudo / Ficha */}
                                                <a
                                                    href={route('laboratorio.pdf', per.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 bg-[#0d1a26] hover:bg-[#17283c] border border-[#c5a059]/40 text-[#c5a059] hover:text-[#DFC07A] rounded transition-colors inline-flex items-center justify-center"
                                                    title="Imprimir Laudo Pericial Oficial (PDF)"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </a>

                                                {per.estado === 'CONCLUIDA' ? (
                                                    <button
                                                        onClick={() => setModalVerLaudo(per)}
                                                        className="px-2.5 py-1 bg-[#0d1a26] hover:bg-[#17283c] text-emerald-300 border border-emerald-800 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                                        title="Visualizar laudo pericial e conclusões técnicas"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Ver Laudo</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAbrirConclusao(per)}
                                                        className="px-2.5 py-1 bg-[#17283c] hover:bg-[#223750] text-[#c5a059] border border-[#c5a059]/40 rounded text-[11px] font-mono transition-colors cursor-pointer"
                                                    >
                                                        Emitir Laudo
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <div className="max-w-md mx-auto space-y-3">
                                            <div className="w-12 h-12 mx-auto rounded-full bg-[#0d1a26] border border-[#223750] flex items-center justify-center text-[#c5a059]">
                                                <Microscope className="w-6 h-6" />
                                            </div>
                                            <div className="text-sm font-semibold text-slate-200">
                                                Nenhum exame pericial encontrado
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                {hasActiveFilters
                                                    ? 'Nenhum resultado corresponde aos filtros aplicados. Tente ajustar os parâmetros.'
                                                    : 'Ainda não foram requisitadas perícias laboratoriais no sistema.'}
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    type="button"
                                                    onClick={handleLimparFiltros}
                                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-200 border border-[#223750] rounded text-xs"
                                                >
                                                    Limpar Filtros
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal de Nova Requisição */}
                {modalRequisitar && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-lg bg-[#132235] border border-[#c5a059] rounded-lg p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                    Requisitar Exame Pericial Criminalístico
                                </h2>
                                <button onClick={() => setModalRequisitar(false)} className="text-slate-400 hover:text-white">✕</button>
                            </div>

                            <form onSubmit={handleRequisitar} className="space-y-3 font-sans text-xs">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Processo-Crime de Origem</label>
                                    <select
                                        value={formReq.data.processo_id}
                                        onChange={(e) => formReq.setData('processo_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    >
                                        {processos_disponiveis.map((proc) => (
                                            <option key={proc.id} value={proc.id}>
                                                {proc.numero_processo} — {proc.tipologia_legal}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Especialidade Forense</label>
                                    <select
                                        value={formReq.data.tipo_pericia}
                                        onChange={(e) => formReq.setData('tipo_pericia', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        {especialidades && especialidades.length > 0 ? (
                                            especialidades.map((esp) => (
                                                <option key={esp.codigo} value={esp.codigo}>
                                                    {esp.nome}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="BALISTICA">Balística Forense (Armas, Munições e Projéteis)</option>
                                                <option value="DACTILOSCOPIA">Dactiloscopia (Impressões Papilares)</option>
                                                <option value="TOXICOLOGIA">Toxicologia Forense (Substâncias Psicotrópicas e Químicas)</option>
                                                <option value="DOCUMENTOSCOPIA">Documentoscopia (Grafotecnia e Falsificações)</option>
                                                <option value="INFORMATICA_FORENSE">Informática Forense (Dispositivos e Dados Digitais)</option>
                                                <option value="BIOLOGIA_ADN">Biologia Forense e Perfis Genéticos (ADN)</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Código do Vestígio / Lacre de Entrada</label>
                                    <input
                                        type="text"
                                        value={formReq.data.codigo_vestigio_lacre}
                                        onChange={(e) => formReq.setData('codigo_vestigio_lacre', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059] font-mono"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Descrição Minuciosa do Vestígio Encaminhado</label>
                                    <textarea
                                        value={formReq.data.descricao_vestigio}
                                        onChange={(e) => formReq.setData('descricao_vestigio', e.target.value)}
                                        rows={3}
                                        placeholder="Ex: Invólucro de segurança com projétil de chumbo deformado recolhido no local do crime..."
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalRequisitar(false)}
                                        className="px-3 py-1.5 bg-[#17283c] text-slate-300 rounded border border-[#223750]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formReq.processing}
                                        className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold rounded cursor-pointer"
                                    >
                                        {formReq.processing ? 'A formalizar...' : 'Formalizar Entrada'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Conclusão do Laudo Técnico */}
                {modalLaudo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-xl bg-[#132235] border border-emerald-500 rounded-lg p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                    Emitir e Assinar Laudo Pericial Forense
                                </h2>
                                <button onClick={() => setModalLaudo(null)} className="text-slate-400 hover:text-white">✕</button>
                            </div>

                            <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] text-xs space-y-1 font-sans">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">Vestígio em Exame</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#c5a059] font-mono font-bold">{modalLaudo.codigo_vestigio_lacre}</span>
                                    <span className="text-slate-400">({modalLaudo.tipo_pericia.replace(/_/g, ' ')})</span>
                                </div>
                                <p className="text-slate-300 text-[11px] mt-1">{modalLaudo.descricao_vestigio}</p>
                            </div>

                            <form onSubmit={handleConcluirLaudo} className="space-y-3 font-sans text-xs">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Metodologia Técnico-Científica e Equipamentos Utilizados
                                    </label>
                                    <textarea
                                        value={formLaudo.data.metodologia}
                                        onChange={(e) => formLaudo.setData('metodologia', e.target.value)}
                                        rows={3}
                                        placeholder="Descreva as técnicas, ensaios de microscopia comparativa, reagentes cromóforos ou instrumentos forenses empregues..."
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2.5 rounded focus:border-emerald-500 leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Conclusões Técnico-Científicas do Perito Relator
                                    </label>
                                    <textarea
                                        value={formLaudo.data.conclusoes_tecnicas}
                                        onChange={(e) => formLaudo.setData('conclusoes_tecnicas', e.target.value)}
                                        rows={5}
                                        placeholder="Exponha o parecer conclusivo sobre o nexo material e respostas aos quesitos periciais..."
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2.5 rounded focus:border-emerald-500 leading-relaxed"
                                        required
                                    />
                                </div>

                                <div className="p-3 bg-[#0d1a26] border border-[#223750] rounded text-[11px] text-slate-400 space-y-1">
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase">
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Garantia de Integridade e Inviolabilidade da Prova Técnica</span>
                                    </div>
                                    <p>
                                        Ao submeter, o sistema computará a chave criptográfica SHA-256 do laudo, vinculando a sua assinatura digital aos registos da cadeia de custódia e auditoria do SIGD-SIC.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalLaudo(null)}
                                        className="px-3 py-1.5 bg-[#17283c] text-slate-300 rounded border border-[#223750]"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLaudo.processing}
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{formLaudo.processing ? 'A assinar...' : 'Assinar e Gerar Hash SHA-256'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Visualização do Laudo Pericial Concluído */}
                {modalVerLaudo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-2xl bg-[#132235] border border-[#223750] rounded-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                            Laudo Pericial Oficial de Criminalística
                                        </span>
                                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono rounded font-bold">
                                            ASSINADO E CHANCELADO
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                                        Lacre: <span className="text-[#c5a059] font-bold">{modalVerLaudo.codigo_vestigio_lacre}</span> // {modalVerLaudo.tipo_pericia.replace(/_/g, ' ')}
                                    </div>
                                </div>
                                <button onClick={() => setModalVerLaudo(null)} className="text-slate-400 hover:text-white">✕</button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                                <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] space-y-1">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Processo-Crime</div>
                                    <div className="font-mono text-blue-400 font-bold">{modalVerLaudo.processo?.numero_processo}</div>
                                    <div className="text-slate-300 text-[11px]">{modalVerLaudo.processo?.tipologia_legal}</div>
                                </div>

                                <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] space-y-1">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Perito Relator</div>
                                    <div className="text-slate-100 font-bold">{modalVerLaudo.perito?.nome_completo || 'Perito Criminal Oficial'}</div>
                                    <div className="text-slate-400 text-[11px] font-mono">NIP: {modalVerLaudo.perito?.nip || 'N/D'}</div>
                                </div>
                            </div>

                            <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] text-xs space-y-1">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">Descrição do Vestígio</div>
                                <p className="text-slate-200 leading-relaxed">{modalVerLaudo.descricao_vestigio}</p>
                            </div>

                            <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] text-xs space-y-1">
                                <div className="text-slate-400 text-[10px] uppercase font-bold">Metodologia Científica Aplicada</div>
                                <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                                    {modalVerLaudo.metodologia || 'Protocolos normalizados de microscopia e ensaios físicos comparativos da Direcção Central de Criminalística Forense.'}
                                </p>
                            </div>

                            <div className="p-3 bg-[#0d1a26] rounded border border-emerald-900/40 text-xs space-y-1">
                                <div className="text-emerald-400 text-[10px] uppercase font-bold">Conclusões Técnico-Periciais</div>
                                <p className="text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                                    {modalVerLaudo.conclusoes_tecnicas || 'Laudo homologado em conformidade com as normas procedimentais em vigor.'}
                                </p>
                            </div>

                            {modalVerLaudo.hash_laudo_sha256 && (
                                <div className="p-3 bg-[#0d1a26] rounded border border-[#223750] space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Assinatura Digital SHA-256</span>
                                        <button
                                            type="button"
                                            onClick={() => copiarHash(modalVerLaudo.hash_laudo_sha256!)}
                                            className="text-[10px] text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiadoHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiadoHash ? 'Copiado!' : 'Copiar Hash'}</span>
                                        </button>
                                    </div>
                                    <div className="p-2 bg-[#09111a] rounded font-mono text-[10px] text-emerald-400 break-all select-all">
                                        {modalVerLaudo.hash_laudo_sha256}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-[#223750]">
                                <a
                                    href={route('laboratorio.pdf', modalVerLaudo.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-[#0d1a26] hover:bg-[#17283c] text-[#c5a059] hover:text-[#DFC07A] border border-[#c5a059]/40 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Imprimir Laudo Pericial Oficial (PDF)</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setModalVerLaudo(null)}
                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded text-xs"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TacticalLayout>
    );
}
