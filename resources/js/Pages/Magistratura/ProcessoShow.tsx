import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { PgrLayout } from '@/Layouts/PgrLayout';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import {
    Scale,
    ArrowLeft,
    Clock,
    FileText,
    Shield,
    User,
    CheckCircle2,
    Calendar,
    Send,
    Package,
    AlertTriangle,
    FileCheck,
    CheckSquare,
    RotateCcw,
    FolderX,
} from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface ProcessoShowProps {
    processo: ProcessoCrime;
}

export default function MagistraturaProcessoShow({ processo }: ProcessoShowProps) {
    const [subAba, setSubAba] = useState<'relatorio' | 'diligencias' | 'bens' | 'despacho'>('relatorio');

    const formDespacho = useForm({
        tipo_despacho: 'ACUSACAO',
        texto_despacho: `O Ministério Público, nos termos do Código de Processo Penal Angolano, vem deduzir acusação formal contra os arguidos identificados nos autos, porquanto os indícios carreados aos autos mostram-se suficientes para sustentar a responsabilidade criminal perante o Tribunal competente.`,
    });

    const handleSubmeterDespacho = (e: React.FormEvent) => {
        e.preventDefault();
        formDespacho.post(route('magistratura.processos.despacho', processo.id), {
            onSuccess: () => {
                setSubAba('despacho');
            },
        });
    };

    return (
        <PgrLayout title={`Inquérito ${processo.numero_processo}`}>
            <div className="space-y-6">
                {/* BARRA DE NAVEGAÇÃO E RETORNO */}
                <div className="flex items-center justify-between border-b border-[#223750] pb-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('magistratura.index')}
                            className="p-2 bg-[#132235] hover:bg-[#1a2e46] border border-[#223750] text-slate-300 hover:text-white rounded transition-colors flex items-center gap-1.5 text-xs font-sans"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar à Janela da PGR</span>
                        </Link>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-slate-100 font-mono">
                                    {processo.numero_processo}
                                </h1>
                                <StatusBadge status={processo.estado} type="processo" />
                            </div>
                            <p className="text-xs text-slate-400 font-sans mt-0.5">
                                Tipologia Legal: <strong className="text-slate-200">{processo.tipologia_legal}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('sic:open-copilot-processo', { detail: processo }))}
                            className="px-3.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-700/80 rounded flex items-center gap-2 text-xs font-sans font-semibold transition-colors cursor-pointer shadow-sm"
                            title="Abrir Copiloto com análise deste inquérito"
                        >
                            <Scale className="w-4 h-4 text-blue-400" />
                            <span>Analisar no Copiloto</span>
                        </button>

                        <div className="text-right text-xs font-mono">
                            <div className="text-slate-400">Data de Entrada na PGR</div>
                            <div className="text-slate-200 font-bold">
                                {processo.data_remessa_mp
                                    ? new Date(processo.data_remessa_mp).toLocaleString('pt-AO')
                                    : 'Recente'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PAINEL DE DADOS DO INQUÉRITO REMETIDO */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4 space-y-1">
                        <div className="text-[11px] text-slate-400 uppercase font-mono">Origem Policial</div>
                        <div className="text-slate-100 font-semibold">{processo.provincia?.nome || 'Nacional'}</div>
                        <div className="text-slate-400 text-[11px]">{processo.unidade?.nome || 'SIC'}</div>
                    </div>

                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4 space-y-1">
                        <div className="text-[11px] text-slate-400 uppercase font-mono">Investigador Relator</div>
                        <div className="text-slate-100 font-semibold">{processo.investigador?.nome_completo || 'SIC Central'}</div>
                        <div className="text-slate-400 text-[11px] font-mono">NIP: {processo.investigador?.nip || 'N/D'}</div>
                    </div>

                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4 space-y-1">
                        <div className="text-[11px] text-slate-400 uppercase font-mono">Segredo de Justiça</div>
                        <div className="text-slate-100 font-semibold">
                            {processo.segredo_justica ? 'Ativo (Restrito)' : 'Público'}
                        </div>
                        <div className="text-slate-400 text-[11px]">Garantia Processual Penal</div>
                    </div>

                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4 space-y-1">
                        <div className="text-[11px] text-slate-400 uppercase font-mono">Magistrado Responsável</div>
                        <div className="text-blue-400 font-semibold">
                            {processo.magistrado_pgr_responsavel || 'Atribuição ao Gabinete'}
                        </div>
                        <div className="text-slate-400 text-[11px]">Procuradoria-Geral da República</div>
                    </div>
                </div>

                {/* DETIDOS ASSOCIADOS AO PROCESSO */}
                {processo.detencoes && processo.detencoes.length > 0 && (
                    <div className="bg-[#132235] border border-[#223750] rounded-md p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#223750] pb-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                                    Cidadãos Sob Custódia no Âmbito Deste Processo
                                </h3>
                            </div>
                            <span className="text-[11px] text-amber-400 font-mono">
                                Fiscalização das 48h Constitucionais
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {processo.detencoes.map((d) => (
                                <div key={d.id} className="p-3 bg-[#0d1a26] border border-[#223750] rounded text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-200">
                                            {d.individuo?.nome_completo || 'Arguido Detido'}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1a2e46] text-blue-300 font-mono">
                                            {d.estado_custodia}
                                        </span>
                                    </div>
                                    <div className="text-slate-400 font-mono text-[11px]">
                                        BI: {d.individuo?.numero_bi || 'N/D'} • Limite 48h: {new Date(d.limite_legal_48h).toLocaleString('pt-AO')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SUB-ABAS DE APRECIAÇÃO DOS AUTOS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#223750] pb-2 text-xs font-sans">
                        <button
                            onClick={() => setSubAba('relatorio')}
                            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                                subAba === 'relatorio'
                                    ? 'bg-[#1a2e46] text-blue-300 border border-[#2563eb]/60 font-semibold'
                                    : 'bg-[#132235] text-slate-400 hover:text-slate-200 border border-[#223750]'
                            }`}
                        >
                            Relatório da Instrução do SIC
                        </button>

                        <button
                            onClick={() => setSubAba('diligencias')}
                            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                                subAba === 'diligencias'
                                    ? 'bg-[#1a2e46] text-blue-300 border border-[#2563eb]/60 font-semibold'
                                    : 'bg-[#132235] text-slate-400 hover:text-slate-200 border border-[#223750]'
                            }`}
                        >
                            Diligências & Prova ({processo.diligencias?.length || 0})
                        </button>

                        <button
                            onClick={() => setSubAba('bens')}
                            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                                subAba === 'bens'
                                    ? 'bg-[#1a2e46] text-blue-300 border border-[#2563eb]/60 font-semibold'
                                    : 'bg-[#132235] text-slate-400 hover:text-slate-200 border border-[#223750]'
                            }`}
                        >
                            Apreensões & Objetos ({processo.bens?.length || 0})
                        </button>

                        <button
                            onClick={() => setSubAba('despacho')}
                            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                                subAba === 'despacho'
                                    ? 'bg-[#1a2e46] text-blue-300 border border-[#2563eb]/60 font-semibold'
                                    : 'bg-[#132235] text-slate-400 hover:text-slate-200 border border-[#223750]'
                            }`}
                        >
                            Despacho da PGR
                        </button>
                    </div>

                    {/* CONTEÚDO: RELATÓRIO DO SIC */}
                    {subAba === 'relatorio' && (
                        <div className="bg-[#132235] border border-[#223750] rounded-md p-5 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans border-b border-[#223750] pb-2">
                                Síntese Conclusiva da Investigação Remetida pelo SIC
                            </h3>

                            <div className="p-4 bg-[#0d1a26] border border-[#223750] rounded text-slate-200 text-xs leading-relaxed font-sans space-y-3">
                                <p>
                                    Constatada a existência de matéria e indícios suficientes da prática do crime de <strong>{processo.tipologia_legal}</strong>, foram recolhidos os depoimentos das testemunhas e declarações dos intervenientes, assim como apreendidos os objetos materiais conexos.
                                </p>
                                <p>
                                    A instrução preparatória foi concluída pelo investigador responsável ({processo.investigador?.nome_completo || 'SIC'}), remetendo-se os presentes autos ao Digníssimo Magistrado do Ministério Público junto do Tribunal competente para efeitos de apreciação e despacho soberano.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CONTEÚDO: DILIGÊNCIAS */}
                    {subAba === 'diligencias' && (
                        <div className="bg-[#132235] border border-[#223750] rounded-md overflow-hidden">
                            <table className="w-full text-left font-sans text-xs divide-y divide-[#223750]">
                                <thead className="bg-[#0f1b2b] text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                                    <tr>
                                        <th className="px-4 py-3">Tipo de Diligência</th>
                                        <th className="px-4 py-3">Descrição dos Factos Apurados</th>
                                        <th className="px-4 py-3">Data de Realização</th>
                                        <th className="px-4 py-3">Responsável</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#223750]">
                                    {processo.diligencias && processo.diligencias.length > 0 ? (
                                        processo.diligencias.map((dil) => (
                                            <tr key={dil.id} className="hover:bg-[#17283c]">
                                                <td className="px-4 py-3 font-semibold text-slate-200">
                                                    {dil.tipo}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300 max-w-md">
                                                    {dil.descricao_detalhada}
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                                                    {new Date(dil.data_realizacao).toLocaleDateString('pt-AO')}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">
                                                    {dil.responsavel?.nome_completo || 'Investigador'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-6 text-slate-500">
                                                Nenhuma diligência formal cadastrada nestes autos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* CONTEÚDO: BENS APREENDIDOS */}
                    {subAba === 'bens' && (
                        <div className="bg-[#132235] border border-[#223750] rounded-md overflow-hidden">
                            <table className="w-full text-left font-sans text-xs divide-y divide-[#223750]">
                                <thead className="bg-[#0f1b2b] text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                                    <tr>
                                        <th className="px-4 py-3">Item Apreendido</th>
                                        <th className="px-4 py-3">Categoria</th>
                                        <th className="px-4 py-3">Localização / Depósito</th>
                                        <th className="px-4 py-3">Hash de Lacre</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#223750]">
                                    {processo.bens && processo.bens.length > 0 ? (
                                        processo.bens.map((bem) => (
                                            <tr key={bem.id} className="hover:bg-[#17283c]">
                                                <td className="px-4 py-3 font-semibold text-slate-200">
                                                    {bem.descricao}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">
                                                    {bem.categoria}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">
                                                    {bem.localizacao_armazenamento || 'Cofre de Apreensões'}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                                                    {bem.hash_lacre ? `${bem.hash_lacre.substring(0, 16)}...` : 'Lacrado'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-6 text-slate-500">
                                                Nenhum bem ou elemento probatório material anexado aos autos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* CONTEÚDO: DESPACHO JUDICIAL DA PGR */}
                    {subAba === 'despacho' && (
                        <div className="bg-[#132235] border border-[#223750] rounded-md p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-blue-400" />
                                        <span>Despacho Judicial do Ministério Público</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Decisão soberana do Magistrado sobre os autos do inquérito
                                    </p>
                                </div>
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1a2e46] text-blue-300">
                                    Estado Atual: {processo.estado}
                                </span>
                            </div>

                            {processo.estado === 'ACUSADO' || processo.estado === 'ARQUIVADO' ? (
                                <div className="p-4 bg-[#0d1a26] border border-[#223750] rounded space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Despacho Proferido e Homologado</span>
                                    </div>
                                    <p className="text-xs text-slate-300">
                                        O inquérito encontra-se despachado com a decisão: <strong className="text-slate-100 font-mono">{processo.estado}</strong> pelo Magistrado {processo.magistrado_pgr_responsavel}.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmeterDespacho} className="space-y-4 text-xs font-sans">
                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">
                                            Tipo de Decisão / Sentido do Despacho
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <label
                                                className={`p-3 rounded border cursor-pointer transition-colors flex items-center gap-2 ${
                                                    formDespacho.data.tipo_despacho === 'ACUSACAO'
                                                        ? 'bg-[#1a2e46] border-blue-500 text-white'
                                                        : 'bg-[#0d1a26] border-[#223750] text-slate-300 hover:border-slate-500'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tipo_despacho"
                                                    value="ACUSACAO"
                                                    checked={formDespacho.data.tipo_despacho === 'ACUSACAO'}
                                                    onChange={(e) => {
                                                        formDespacho.setData({
                                                            tipo_despacho: e.target.value,
                                                            texto_despacho: `O Ministério Público, nos termos do Código de Processo Penal Angolano, vem deduzir acusação formal contra os arguidos identificados nos autos, porquanto os indícios carreados aos autos mostram-se suficientes para sustentar a responsabilidade criminal perante o Tribunal competente.`,
                                                        });
                                                    }}
                                                    className="sr-only"
                                                />
                                                <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                                                <div>
                                                    <div className="font-semibold">Acusação Formal</div>
                                                    <div className="text-[10px] text-slate-400">Remeter a Julgamento</div>
                                                </div>
                                            </label>

                                            <label
                                                className={`p-3 rounded border cursor-pointer transition-colors flex items-center gap-2 ${
                                                    formDespacho.data.tipo_despacho === 'DEVOLUCAO_SIC'
                                                        ? 'bg-[#1a2e46] border-blue-500 text-white'
                                                        : 'bg-[#0d1a26] border-[#223750] text-slate-300 hover:border-slate-500'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tipo_despacho"
                                                    value="DEVOLUCAO_SIC"
                                                    checked={formDespacho.data.tipo_despacho === 'DEVOLUCAO_SIC'}
                                                    onChange={(e) => {
                                                        formDespacho.setData({
                                                            tipo_despacho: e.target.value,
                                                            texto_despacho: `Devolvam-se os presentes autos ao Serviço de Investigação Criminal (SIC) competente para realização de diligências complementares de instrução indispensáveis à descoberta da verdade material.`,
                                                        });
                                                    }}
                                                    className="sr-only"
                                                />
                                                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                                                <div>
                                                    <div className="font-semibold">Devolver ao SIC</div>
                                                    <div className="text-[10px] text-slate-400">Mais Diligências</div>
                                                </div>
                                            </label>

                                            <label
                                                className={`p-3 rounded border cursor-pointer transition-colors flex items-center gap-2 ${
                                                    formDespacho.data.tipo_despacho === 'ARQUIVAMENTO'
                                                        ? 'bg-[#1a2e46] border-blue-500 text-white'
                                                        : 'bg-[#0d1a26] border-[#223750] text-slate-300 hover:border-slate-500'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tipo_despacho"
                                                    value="ARQUIVAMENTO"
                                                    checked={formDespacho.data.tipo_despacho === 'ARQUIVAMENTO'}
                                                    onChange={(e) => {
                                                        formDespacho.setData({
                                                            tipo_despacho: e.target.value,
                                                            texto_despacho: `Determina-se o arquivamento do presente inquérito nos termos da lei processual penal, por insuficiência manifesta de indícios probatórios recolhidos na instrução.`,
                                                        });
                                                    }}
                                                    className="sr-only"
                                                />
                                                <FolderX className="w-4 h-4 text-rose-400 shrink-0" />
                                                <div>
                                                    <div className="font-semibold">Arquivamento</div>
                                                    <div className="text-[10px] text-slate-400">Insuficiência de Provas</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-[11px] mb-1">
                                            Fundamentação do Despacho Judicial
                                        </label>
                                        <textarea
                                            value={formDespacho.data.texto_despacho}
                                            onChange={(e) => formDespacho.setData('texto_despacho', e.target.value)}
                                            rows={4}
                                            className="w-full bg-[#0d1a26] border border-[#223750] text-slate-100 p-3 rounded focus:border-blue-500 focus:outline-none leading-relaxed"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={formDespacho.processing}
                                            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded flex items-center gap-2 shadow transition-colors cursor-pointer"
                                        >
                                            <Scale className="w-4 h-4" />
                                            <span>{formDespacho.processing ? 'Assinando...' : 'Lavrar e Assinar Despacho'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PgrLayout>
    );
}
