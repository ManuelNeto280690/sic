import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import { FolhaOficialA4 } from '@/Components/Ocorrencias/FolhaOficialA4';
import {
    ArrowLeft,
    FileText,
    FolderPlus,
    Printer,
    Download,
    Eye,
    Shield,
    Users,
    Paperclip,
    CheckCircle2,
    Calendar,
    MapPin,
    Hash,
    Edit3,
    Lock,
    AlertTriangle,
    X,
} from 'lucide-react';
import { Ocorrencia } from '@/types';

interface ShowProps {
    ocorrencia: Ocorrencia;
}

export default function OcorrenciasShow({ ocorrencia }: ShowProps) {
    const [instaurando, setInstaurando] = useState(false);
    const [erroInstaurar, setErroInstaurar] = useState<string | null>(null);
    const [abaAtiva, setAbaAtiva] = useState<'folha_a4' | 'ficha_tatica'>('folha_a4');

    useEffect(() => {
        let savedTitle = document.title;
        const handleBeforePrint = () => {
            savedTitle = document.title;
            document.title = '';
        };
        const handleAfterPrint = () => {
            document.title = savedTitle || `Auto ${ocorrencia.numero_ocorrencia} — SIC`;
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [ocorrencia.numero_ocorrencia]);

    const handleInstaurarProcesso = () => {
        setInstaurando(true);
        setErroInstaurar(null);
        router.post(
            route('processos.instaurar'),
            {
                ocorrencia_id: ocorrencia.id,
                tipologia_legal: ocorrencia.classificacao_codigo,
                provincia_id: ocorrencia.provincia_id,
            },
            {
                preserveScroll: true,
                onError: (errs) => {
                    setInstaurando(false);
                    const msg = errs.erro || Object.values(errs)[0] || 'Falha ao instaurar processo-crime.';
                    setErroInstaurar(typeof msg === 'string' ? msg : 'Falha na validação dos dados.');
                },
                onFinish: () => {
                    setInstaurando(false);
                },
            }
        );
    };

    const handleImprimir = () => {
        setAbaAtiva('folha_a4');
        const originalTitle = document.title;
        document.title = '';
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.title = originalTitle;
            }, 1000);
        }, 50);
    };

    return (
        <TacticalLayout title={`Auto ${ocorrencia.numero_ocorrencia}`}>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Cabeçalho de Ações e Estado (Escondido na Impressão) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('ocorrencias.index')}
                            className="p-1.5 bg-[#17283c] hover:bg-[#223750] text-slate-300 rounded border border-[#223750] transition-colors"
                            title="Voltar aos Autos de Notícia"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                    Auto de Notícia: {ocorrencia.numero_ocorrencia}
                                </h1>
                                <StatusBadge status={ocorrencia.estado} type="ocorrencia" />
                            </div>
                            <p className="text-xs text-slate-400 font-sans mt-0.5">
                                Protocolado na {ocorrencia.unidadeRegisto?.nome || ocorrencia.unidade?.nome} — Província de {ocorrencia.provincia?.nome}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Botão Imprimir Documento Solene */}
                        <button
                            type="button"
                            onClick={handleImprimir}
                            className="px-3 py-1.5 bg-[#17283c] hover:bg-[#223750] border border-[#223750] text-slate-200 text-xs font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:border-[#c5a059]"
                            title="Imprimir a Folha Oficial A4 do Auto de Notícia"
                        >
                            <Printer className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Imprimir Auto</span>
                        </button>

                        {/* Botão Baixar PDF */}
                        <a
                            href={route('ocorrencias.download-pdf', ocorrencia.id)}
                            download={`Auto_Noticia_${(ocorrencia.numero_ocorrencia || 'registo').replace(/[^a-zA-Z0-9_\-]/g, '_')}.pdf`}
                            className="px-3 py-1.5 bg-[#17283c] hover:bg-rose-950/80 border border-[#223750] hover:border-rose-700 text-slate-200 hover:text-rose-200 text-xs font-mono rounded flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Descarregar ficheiro oficial em formato PDF"
                        >
                            <Download className="w-3.5 h-3.5 text-rose-400" />
                            <span>Baixar PDF</span>
                        </a>

                        {/* Botão Abrir PDF no Separador */}
                        <a
                            href={route('ocorrencias.pdf', { uuid: ocorrencia.id })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#17283c] hover:bg-sky-950/80 border border-[#223750] hover:border-sky-700 text-slate-200 hover:text-sky-200 text-xs font-mono rounded flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Visualizar documento PDF nativo num novo separador"
                        >
                            <FileText className="w-3.5 h-3.5 text-sky-400" />
                            <span>Ver PDF</span>
                        </a>

                        {/* Botão Editar Auto (Página Completa de Cadastro) */}
                        {ocorrencia.pode_editar ? (
                            <Link
                                href={route('ocorrencias.edit', ocorrencia.id)}
                                className="px-3.5 py-1.5 bg-[#1a2d42] hover:bg-[#c5a059] text-[#c5a059] hover:text-[#0d1a26] border border-[#c5a059]/50 hover:border-[#c5a059] text-xs font-sans font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                title="Editar auto na página completa de registo"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar Auto</span>
                            </Link>
                        ) : (
                            <span
                                title="Edição restrita: Apenas o oficial registador deste auto ou o Administrador do Sistema pode efetuar alterações."
                                className="px-3 py-1.5 bg-[#0b1622] text-slate-500 border border-[#223750]/50 rounded text-xs font-mono flex items-center gap-1.5 cursor-not-allowed"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Edição Bloqueada</span>
                            </span>
                        )}

                        {/* Botão Instaurar Processo */}
                        {!ocorrencia.processo && (
                            <button
                                type="button"
                                onClick={handleInstaurarProcesso}
                                disabled={instaurando}
                                className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs font-sans uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                            >
                                <FolderPlus className="w-4 h-4" />
                                <span>{instaurando ? 'Instaurando...' : 'Instaurar Processo-Crime'}</span>
                            </button>
                        )}

                        {ocorrencia.processo && (
                            <Link
                                href={route('processos.show', ocorrencia.processo.id)}
                                className="px-4 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-100 font-bold text-xs font-mono uppercase tracking-wider rounded flex items-center gap-1.5 border border-purple-600 transition-colors"
                            >
                                <FolderPlus className="w-4 h-4" />
                                <span>Ver Processo {ocorrencia.processo.numero_processo}</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Banner de Erro na Instauração */}
                {erroInstaurar && (
                    <div className="p-3.5 bg-rose-950/90 border border-rose-600 rounded-lg flex items-center justify-between gap-3 text-rose-200 text-xs font-sans shadow-lg animate-in fade-in">
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{erroInstaurar}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErroInstaurar(null)}
                            className="p-1 hover:bg-rose-900/60 rounded text-rose-300 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Seletor de Abas: Documento A4 Solene vs. Ficha Forense (Escondido na Impressão) */}
                <div className="flex items-center justify-between border-b border-[#223750] print:hidden">
                    <div className="flex items-center gap-1 -mb-px">
                        <button
                            type="button"
                            onClick={() => setAbaAtiva('folha_a4')}
                            className={`px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                                abaAtiva === 'folha_a4'
                                    ? 'border-[#c5a059] text-[#c5a059] bg-[#132235]/60'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Folha Oficial A4 (Documento Solene)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setAbaAtiva('ficha_tatica')}
                            className={`px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                                abaAtiva === 'ficha_tatica'
                                    ? 'border-[#c5a059] text-[#c5a059] bg-[#132235]/60'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                            }`}
                        >
                            <Shield className="w-4 h-4" />
                            <span>Ficha Tática e Cadeia de Custódia</span>
                        </button>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Autenticidade SHA-256 Confirmada</span>
                    </div>
                </div>

                {/* ================================================================= */}
                {/* ABA 1: FOLHA OFICIAL A4 DO AUTO DE NOTÍCIA (O DOCUMENTO PREVISTO) */}
                {/* ================================================================= */}
                <div className={abaAtiva === 'folha_a4' ? 'block' : 'hidden print:block'}>
                    {/* Barra de Instrução Visual (Apenas Ecrã) */}
                    <div className="p-3 bg-[#132235] border border-[#223750] rounded-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-slate-300 print:hidden">
                        <div className="flex items-center gap-2.5">
                            <Eye className="w-4 h-4 text-[#c5a059]" />
                            <span>
                                Este é o <strong>documento oficial lavrado</strong>. Ao clicar em <strong>"Imprimir Auto"</strong> ou <strong>"Baixar PDF"</strong>, este é exactamente o formato gerado.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleImprimir}
                                className="px-3 py-1 bg-[#c5a059] hover:bg-[#dfc07a] text-[#0d1a26] font-bold rounded text-xs uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Imprimir Agora</span>
                            </button>
                        </div>
                    </div>

                    {/* Contentor Centrado da Folha A4 Solene */}
                    <div className="py-2 flex justify-center bg-transparent">
                        <FolhaOficialA4 ocorrencia={ocorrencia} />
                    </div>
                </div>

                {/* ================================================================= */}
                {/* ABA 2: FICHA TÁTICA, ANEXOS DIGITAIS E METADADOS FORENSES        */}
                {/* ================================================================= */}
                <div className={abaAtiva === 'ficha_tatica' ? 'block print:hidden' : 'hidden'}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Coluna Esquerda: Detalhes do Auto */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Narrativa do Facto */}
                            <TacticalCard title="Descrição Circunstanciada dos Factos" icon={<FileText className="w-4 h-4" />}>
                                <div
                                    className="prose prose-invert max-w-none text-xs font-sans text-slate-200 bg-[#0d1a26] p-4 rounded border border-[#223750] leading-relaxed select-all"
                                    dangerouslySetInnerHTML={{ __html: ocorrencia.descricao_facto_html }}
                                />
                            </TacticalCard>

                            {/* Intervenientes Processuais */}
                            <TacticalCard title="Intervenientes Qualificados nos Autos" icon={<Users className="w-4 h-4" />}>
                                <div className="divide-y divide-[#223750] font-mono text-xs">
                                    {ocorrencia.intervenientes?.map((int) => (
                                        <div key={int.id} className="py-3 flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-100">{int.nome_identificativo}</span>
                                                    <span className="px-1.5 py-0.2 bg-[#0d1a26] text-[10px] text-[#c5a059] border border-[#223750] rounded">
                                                        {int.papel}
                                                    </span>
                                                </div>
                                                {int.contacto_telefone && (
                                                    <div className="text-[11px] text-slate-400 mt-1">
                                                        Contacto: {int.contacto_telefone}
                                                    </div>
                                                )}
                                                {int.declaracoes_resumo && (
                                                    <div className="text-[11px] text-slate-300 italic mt-1 bg-[#0d1a26] p-2 rounded border border-[#223750]/60">
                                                        "{int.declaracoes_resumo}"
                                                    </div>
                                                )}
                                            </div>

                                            {int.individuo && (
                                                <div className="text-right text-[10px] text-slate-400">
                                                    <div>BI: {int.individuo.numero_bi || 'N/D'}</div>
                                                    {int.individuo.perigoso && (
                                                        <span className="text-rose-400 font-bold">ALERTA: PERIGOSO</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TacticalCard>

                            {/* Provas e Anexos Digitais com Hash SHA-256 */}
                            <TacticalCard title="Cadeia de Custódia Digital & Provas Anexadas" icon={<Paperclip className="w-4 h-4" />}>
                                {ocorrencia.anexos && ocorrencia.anexos.length > 0 ? (
                                    <div className="space-y-2 font-mono text-xs">
                                        {ocorrencia.anexos.map((anx) => (
                                            <div key={anx.id} className="p-3 bg-[#0d1a26] border border-[#223750] rounded flex items-center justify-between">
                                                <div className="min-w-0 pr-4">
                                                    <div className="font-semibold text-slate-200 truncate">{anx.nome_original}</div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                        <Hash className="w-3 h-3 text-[#c5a059]" />
                                                        <span className="select-all font-mono">SHA-256: {anx.hash_sha256}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> WORM VÁLIDO
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs font-mono text-slate-500 py-4 text-center">
                                        Nenhum anexo digital anexado a este auto.
                                    </div>
                                )}
                            </TacticalCard>
                        </div>

                        {/* Coluna Direita: Metadados Forenses */}
                        <div className="lg:col-span-4 space-y-4">
                            <TacticalCard title="Dados de Qualificação Forense">
                                <div className="space-y-3 font-mono text-xs">
                                    <div>
                                        <span className="text-slate-500 text-[10px] uppercase block">Tipologia Legal</span>
                                        <span className="text-slate-100 font-semibold">{ocorrencia.classificacao_codigo}</span>
                                    </div>

                                    <div>
                                        <span className="text-slate-500 text-[10px] uppercase block">Data e Hora do Facto</span>
                                        <span className="text-slate-100">
                                            {new Date(ocorrencia.data_hora_facto).toLocaleString('pt-AO')}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-slate-500 text-[10px] uppercase block">Jurisdição e Localização</span>
                                        <span className="text-slate-100">
                                            {ocorrencia.local_detalhado} ({ocorrencia.municipio?.nome}, {ocorrencia.provincia?.nome})
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-slate-500 text-[10px] uppercase block">Origem do Registo</span>
                                        <span className="text-slate-100">
                                            {ocorrencia.tipo_participacao}
                                            {ocorrencia.origem_pop ? ' (Auto Remetido pela PNA)' : ''}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-slate-500 text-[10px] uppercase block">Oficial / Investigador de Registo</span>
                                        <span className="text-slate-100">{ocorrencia.utilizador_registo?.nome_completo}</span>
                                        <span className="text-[10px] text-[#c5a059] block">NIP: {ocorrencia.utilizador_registo?.nip}</span>
                                    </div>

                                    <div className="pt-2 border-t border-[#223750]">
                                        <span className="text-slate-500 text-[10px] uppercase block">Identificador Único Universal</span>
                                        <span className="text-[10px] text-slate-400 font-mono select-all break-all">{ocorrencia.id}</span>
                                    </div>
                                </div>
                            </TacticalCard>
                        </div>
                    </div>
                </div>
            </div>
        </TacticalLayout>
    );
}
