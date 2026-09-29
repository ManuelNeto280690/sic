import React, { useState } from 'react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ForenseWysiwyg } from '@/Components/Tactical/ForenseWysiwyg';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import {
    FileText,
    Printer,
    Save,
    CheckCircle2,
    BookOpen,
    UserCheck,
    Users,
    Shield,
    FileCheck,
    ScrollText,
    Eye,
    Download,
    X,
    ExternalLink,
} from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface PecasProps {
    processo: ProcessoCrime;
}

export default function ProcessosPecasAutos({ processo }: PecasProps) {
    const dataHoje = new Date().toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const titularNome = processo.investigador?.nome_completo || 'Inspector de 1ª Classe em Serviço';
    const titularNip = processo.investigador?.nip || 'SIC-NIP-OFICIAL';
    const provinciaNome = processo.provincia?.nome || 'Benguela';
    const unidadeNome = processo.unidade?.nome || 'Direcção Provincial do SIC';

    // Modelos oficiais forenses pré-formatados com rigor processual
    const modelosOficiais: Record<string, { titulo: string; icon: any; gerarHtml: () => string }> = {
        interrogatorio: {
            titulo: 'Auto de Interrogatório de Arguido',
            icon: UserCheck,
            gerarHtml: () => `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h4 style="margin: 0; text-transform: uppercase;">REPÚBLICA DE ANGOLA</h4>
                    <h5 style="margin: 3px 0; text-transform: uppercase;">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style="margin: 2px 0; font-size: 11px;">${unidadeNome} &mdash; Província de ${provinciaNome}</p>
                    <h3 style="margin-top: 14px; text-decoration: underline;">AUTO DE INTERROGATÓRIO DE ARGUIDO</h3>
                    <p style="font-family: monospace; font-size: 11px;">PROCESSO-CRIME Nº: <strong>${processo.numero_processo}</strong></p>
                </div>

                <p>Aos ${dataHoje}, nas instalações do Serviço de Investigação Criminal em ${provinciaNome}, perante mim, <strong>${titularNome}</strong> (NIP: ${titularNip}), Instrutor do Processo, compareceu o cidadão indiciado nos autos:</p>

                <p><strong>QUALIFICAÇÃO DO ARGUIDO:</strong><br/>
                Nome Completo: [Nome Completo do Arguido]<br/>
                Filiação: Filho de [Nome do Pai] e de [Nome da Mãe]<br/>
                Naturalidade: [Município/Província], Data de Nascimento: [DD/MM/AAAA], Estado Civil: [Solteiro(a)/Casado(a)]<br/>
                Profissão: [Profissão/Ocupação], Residência habitual: [Bairro, Rua, Casa nº]<br/>
                Documento de Identificação: B.I. nº [Número do BI], emitido pelo Arquivo de Identificação de [Local].</p>

                <p><strong>ADVERTÊNCIA LEGAL (Código de Processo Penal Angolano):</strong><br/>
                O arguido foi expressamente advertido de que não é obrigado a responder às perguntas que lhe forem formuladas sobre os factos que lhe são imputados, assistindo-lhe o direito ao silêncio sem que desse silêncio resulte qualquer presunção de culpa contra si, bem como o direito de ser assistido por Advogado constituído ou Defensor Oficioso nomeado nos termos da lei.</p>

                <p><strong>INTERROGADO DECLAROU QUE:</strong><br/>
                Quanto aos factos investigados nos presentes autos relativos ao crime de <em>${processo.tipologia_legal}</em>, esclarece que: [Escreva aqui a transcrição detalhada das declarações e respostas prestadas pelo arguido]...</p>

                <p>E nada mais disse nem lhe foi perguntado. Lido o presente auto, achado conforme e ratificado, vai devidamente assinado.</p>

                <br/><br/>
                <table style="width: 100%; text-align: center; font-size: 12px; margin-top: 30px;">
                    <tr>
                        <td style="width: 50%;">___________________________________<br/><strong>O Arguido</strong></td>
                        <td style="width: 50%;">___________________________________<br/><strong>O Instrutor do Processo (SIC)</strong></td>
                    </tr>
                </table>
            `,
        },
        tir: {
            titulo: 'Termo de Identidade e Residência (TIR)',
            icon: Shield,
            gerarHtml: () => `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h4 style="margin: 0; text-transform: uppercase;">REPÚBLICA DE ANGOLA</h4>
                    <h5 style="margin: 3px 0; text-transform: uppercase;">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style="margin: 2px 0; font-size: 11px;">${unidadeNome} &mdash; Província de ${provinciaNome}</p>
                    <h3 style="margin-top: 14px; text-decoration: underline;">TERMO DE IDENTIDADE E RESIDÊNCIA (T.I.R.)</h3>
                    <p style="font-family: monospace; font-size: 11px;">PROCESSO-CRIME Nº: <strong>${processo.numero_processo}</strong></p>
                </div>

                <p>Aos ${dataHoje}, nas instalações do Serviço de Investigação Criminal em ${provinciaNome}, perante mim, <strong>${titularNome}</strong> (NIP: ${titularNip}), Instrutor do Processo, nos termos das disposições aplicáveis do Código de Processo Penal Angolano, foi formalmente lavrado o presente Termo de Identidade e Residência ao arguido indiciado nos autos:</p>

                <p><strong>QUALIFICAÇÃO DO ARGUIDO:</strong><br/>
                Nome Completo: [Nome Completo do Arguido]<br/>
                Filiação: Filho de [Nome do Pai] e de [Nome da Mãe]<br/>
                Naturalidade: [Município/Província], Data de Nascimento: [DD/MM/AAAA], Estado Civil: [Solteiro(a)/Casado(a)]<br/>
                Profissão: [Profissão], Contacto Telefónico: [+244 9XX XXX XXX]<br/>
                Residência habitual e permanente: [Bairro, Rua, Casa nº, Município]<br/>
                Documento de Identificação: B.I. nº [Número do BI], emitido pelo Arquivo de Identificação de [Local].</p>

                <p><strong>OBRIGAÇÕES PROCESSUAIS LEGAIS ASSUMIDAS:</strong></p>
                <ol>
                    <li>Não mudar de residência nem dela se ausentar por mais de 5 (cinco) dias sem prévia comunicação à autoridade judiciária ou instrutora competente;</li>
                    <li>Indicar o local onde possa ser encontrado e manter permanentemente actualizados os seus dados de contacto;</li>
                    <li>Comparecer perante o Serviço de Investigação Criminal, Ministério Público ou Tribunal sempre que para tal for devidamente notificado;</li>
                    <li>As notificações remetidas para a morada indicada consideram-se plenamente válidas e eficazes para todos os efeitos legais, incorrendo em desobediência em caso de incumprimento injustificado.</li>
                </ol>

                <p>E para constar, lavrou-se o presente termo que, lido perante o arguido e por este achado conforme, vai devidamente assinado pelos intervenientes.</p>

                <br/><br/>
                <table style="width: 100%; text-align: center; font-size: 12px; margin-top: 30px;">
                    <tr>
                        <td style="width: 50%;">___________________________________<br/><strong>O Arguido (Notificado)</strong></td>
                        <td style="width: 50%;">___________________________________<br/><strong>O Instrutor do Processo (SIC)</strong></td>
                    </tr>
                </table>
            `,
        },
        testemunha: {
            titulo: 'Auto de Inquirição de Testemunha',
            icon: Users,
            gerarHtml: () => `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h4 style="margin: 0; text-transform: uppercase;">REPÚBLICA DE ANGOLA</h4>
                    <h5 style="margin: 3px 0; text-transform: uppercase;">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style="margin: 2px 0; font-size: 11px;">${unidadeNome} &mdash; Província de ${provinciaNome}</p>
                    <h3 style="margin-top: 14px; text-decoration: underline;">AUTO DE INQUIRIÇÃO DE TESTEMUNHA</h3>
                    <p style="font-family: monospace; font-size: 11px;">PROCESSO-CRIME Nº: <strong>${processo.numero_processo}</strong></p>
                </div>

                <p>Aos ${dataHoje}, nas instalações do Serviço de Investigação Criminal em ${provinciaNome}, perante o Instrutor do Processo, <strong>${titularNome}</strong> (NIP: ${titularNip}), compareceu a testemunha a seguir qualificada:</p>

                <p><strong>QUALIFICAÇÃO DA TESTEMUNHA:</strong><br/>
                Nome Completo: [Nome Completo da Testemunha]<br/>
                Filiação: Filho(a) de [Nome do Pai] e de [Nome da Mãe]<br/>
                Naturalidade: [Naturalidade], Data de Nascimento: [DD/MM/AAAA], Estado Civil: [Solteiro(a)/Casado(a)]<br/>
                Profissão: [Profissão/Ocupação], Residência habitual: [Bairro, Rua, Casa nº, Município]<br/>
                Documento de Identificação: B.I. nº [Número do BI], emitido pelo Arquivo de Identificação de [Local].</p>

                <p><strong>JURAMENTO LEGAL & ADVERTÊNCIA:</strong><br/>
                A testemunha prestou o juramento legal sob compromisso de honra de dizer toda a verdade e nada mais que a verdade, tendo sido expressamente advertida das consequências penais cominadas ao crime de falso testemunho previsto e punível pela legislação penal angolana vigente caso preste declarações falsas ou oculte factos de que tenha conhecimento.</p>

                <p><strong>INQUIRIDA AOS FACTOS DA CAUSA DECLAROU:</strong><br/>
                Quanto à matéria investigada nos autos, respeitante ao crime de <em>${processo.tipologia_legal}</em>, disse que: [Descreva aqui as declarações pormenorizadas prestadas pela testemunha presencial ou abonatória]...</p>

                <p>E nada mais disse nem lhe foi perguntado. Lido o presente auto e achado conforme em todo o seu teor, vai devidamente assinado.</p>

                <br/><br/>
                <table style="width: 100%; text-align: center; font-size: 12px; margin-top: 30px;">
                    <tr>
                        <td style="width: 50%;">___________________________________<br/><strong>A Testemunha Inquirida</strong></td>
                        <td style="width: 50%;">___________________________________<br/><strong>O Instrutor do Processo (SIC)</strong></td>
                    </tr>
                </table>
            `,
        },
        apreensao: {
            titulo: 'Auto de Apreensão e Depósito de Provas',
            icon: FileCheck,
            gerarHtml: () => `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h4 style="margin: 0; text-transform: uppercase;">REPÚBLICA DE ANGOLA</h4>
                    <h5 style="margin: 3px 0; text-transform: uppercase;">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style="margin: 2px 0; font-size: 11px;">${unidadeNome} &mdash; Província de ${provinciaNome}</p>
                    <h3 style="margin-top: 14px; text-decoration: underline;">AUTO DE APREENSÃO E DEPÓSITO DE PROVAS</h3>
                    <p style="font-family: monospace; font-size: 11px;">PROCESSO-CRIME Nº: <strong>${processo.numero_processo}</strong></p>
                </div>

                <p>Aos ${dataHoje}, em cumprimento das disposições do Código de Processo Penal Angolano e das directrizes da cadeia de custódia do SIC, procedeu-se nas imediações de [Local da Apreensão] à apreensão e depósito formal dos seguintes bens, instrumentos e elementos probatórios associados ao crime de <em>${processo.tipologia_legal}</em>:</p>

                <p><strong>DISCRIMINAÇÃO DOS ELEMENTOS APREENDIDOS:</strong></p>
                <ul>
                    <li>01 (um/uma) [Descrição detalhada do Bem / Objeto / Arma / Veículo], acondicionado sob o <strong>Lacre Inviolável nº [LACRE-SIC-BGU-00000]</strong>.</li>
                    <li>01 (um/uma) [Descrição adicional de documentos ou vestígios materiais apreendidos, estado de conservação e marcas identificativas].</li>
                </ul>

                <p><strong>DESTINO E FIEL DEPÓSITO:</strong><br/>
                Os referidos bens ficam depositados à ordem do Ministério Público no Cofre de Custódia Judicial de Provas do SIC sob responsabilidade do fiel depositário designado, garantindo-se a sua integridade probatória.</p>

                <p>E para constar, lavrou-se o presente auto que, lido e achado conforme, vai devidamente assinado pelos intervenientes.</p>

                <br/><br/>
                <table style="width: 100%; text-align: center; font-size: 12px; margin-top: 30px;">
                    <tr>
                        <td style="width: 50%;">___________________________________<br/><strong>O Declarante / Detentor</strong></td>
                        <td style="width: 50%;">___________________________________<br/><strong>O Agente Apreensor (SIC)</strong></td>
                    </tr>
                </table>
            `,
        },
        relatorio: {
            titulo: 'Relatório Preliminar de Investigação',
            icon: ScrollText,
            gerarHtml: () => `
                <div style="text-align: center; margin-bottom: 24px;">
                    <h4 style="margin: 0; text-transform: uppercase;">REPÚBLICA DE ANGOLA</h4>
                    <h5 style="margin: 3px 0; text-transform: uppercase;">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style="margin: 2px 0; font-size: 11px;">${unidadeNome} &mdash; Província de ${provinciaNome}</p>
                    <h3 style="margin-top: 14px; text-decoration: underline;">RELATÓRIO PRELIMINAR DE INVESTIGAÇÃO</h3>
                    <p style="font-family: monospace; font-size: 11px;">PROCESSO-CRIME Nº: <strong>${processo.numero_processo}</strong></p>
                </div>

                <p><strong>I. INTRODUÇÃO & NOTÍCIA-CRIME:</strong><br/>
                O presente inquérito preparatório teve início com base na notícia-crime referente aos factos que consubstanciam o crime de <em>${processo.tipologia_legal}</em>, ocorrido na circunscrição de ${provinciaNome}.</p>

                <p><strong>II. DILIGÊNCIAS INVESTIGATÓRIAS EFECTUADAS:</strong><br/>
                No decurso da instrução preliminar foram ouvidos os queixosos e testemunhas presenciais, procedeu-se ao interrogatório dos cidadãos indiciados nos autos e foram realizadas perícias de criminalística laboratorial com preservação da cadeia de custódia das provas materiais recolhidas.</p>

                <p><strong>III. CONCLUSÃO & PROPOSTA:</strong><br/>
                Em face do acervo probatório coligido, consideram-se reunidos os indícios suficientes de autoria e materialidade delituosa, propondo-se a remessa dos autos ao Digníssimo Magistrado do Ministério Público junto do Tribunal competente para efeitos de acusação e prosseguimento da acção penal.</p>

                <br/><br/>
                <div style="text-align: right; margin-top: 35px;">
                    <p>Serviço de Investigação Criminal em ${provinciaNome}, aos ${dataHoje}.</p>
                    <p style="margin-top: 25px;">____________________________________________<br/>
                    <strong>${titularNome}</strong><br/>
                    Instrutor do Processo &mdash; NIP: ${titularNip}</p>
                </div>
            `,
        },
    };

    const [modeloAtivo, setModeloAtivo] = useState<string>('interrogatorio');
    const [conteudo, setConteudo] = useState<string>(() => modelosOficiais.interrogatorio.gerarHtml());
    const [salvo, setSalvo] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [gerandoPdf, setGerandoPdf] = useState(false);

    const carregarModelo = (chave: string) => {
        setModeloAtivo(chave);
        if (modelosOficiais[chave]) {
            const novoHtml = modelosOficiais[chave].gerarHtml();
            setConteudo(novoHtml);
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
                setPdfBlobUrl(null);
            }
            if (showPdfModal) {
                compilarPdf(false, novoHtml, chave);
            }
        }
    };

    const handleSalvar = () => {
        setSalvo(true);
        setTimeout(() => setSalvo(false), 4000);
    };

    // Compilação dinâmica do PDF com o conteúdo exato e atualizado do editor
    const compilarPdf = async (download = false, overrideConteudo?: string, overrideModelo?: string) => {
        setGerandoPdf(true);
        if (!download) {
            setShowPdfModal(true);
        }
        try {
            const modAtivo = overrideModelo || modeloAtivo;
            const htmlEnviar = overrideConteudo !== undefined ? overrideConteudo : conteudo;
            const getCookie = (name: string) => {
                const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
                return match ? decodeURIComponent(match[3]) : null;
            };
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const xsrfCookie = getCookie('XSRF-TOKEN') || '';

            const response = await fetch(route('processos.pecas-autos.pdf.post', processo.id), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-XSRF-TOKEN': xsrfCookie,
                    'Accept': 'application/pdf',
                },
                body: JSON.stringify({
                    titulo_peca: modelosOficiais[modAtivo]?.titulo || 'Peça Processual dos Autos',
                    conteudo_html: htmlEnviar,
                    tipo: modAtivo,
                    download: download,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('HTTP Error compilando PDF:', response.status, errText);
                throw new Error(`Falha ao compilar documento (HTTP ${response.status})`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (download) {
                const a = document.createElement('a');
                a.href = url;
                const nomeSaneado = (modelosOficiais[modAtivo]?.titulo || 'Peca').replace(/[^a-zA-Z0-9_-]/g, '_');
                a.download = `${nomeSaneado}_${processo.numero_processo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
                setPdfBlobUrl(url);
            }
        } catch (err) {
            console.error('Erro ao compilar PDF:', err);
            alert('Não foi possível compilar o documento em PDF. Por favor tente novamente.');
        } finally {
            setGerandoPdf(false);
        }
    };

    const handleAbrirNovaAba = () => {
        if (pdfBlobUrl) {
            window.open(pdfBlobUrl, '_blank');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <TacticalLayout title={`Proc. ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Cabeçalho Institucional & As 6 Sub-Abas Oficiais */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="pecas"
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Visualizar em PDF */}
                            <button
                                type="button"
                                onClick={() => compilarPdf(false)}
                                disabled={gerandoPdf}
                                className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                title="Pré-visualizar Documento Oficial em PDF com as informações do editor"
                            >
                                <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>{gerandoPdf ? 'A compilar...' : 'Visualizar em PDF'}</span>
                            </button>

                            {/* Descarregar PDF */}
                            <button
                                type="button"
                                onClick={() => compilarPdf(true)}
                                disabled={gerandoPdf}
                                className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                title="Descarregar Ficheiro PDF com as informações do editor"
                            >
                                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>Descarregar PDF</span>
                            </button>

                            {/* Imprimir Peça */}
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                title="Imprimir Auto em Papel A4"
                            >
                                <Printer className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>Imprimir Peça</span>
                            </button>

                            {/* Gravar no Processo */}
                            <button
                                type="button"
                                onClick={handleSalvar}
                                className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#d6b26c] text-[#0b131e] font-bold text-xs font-sans rounded-md flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>{salvo ? 'Peça Gravada!' : 'Gravar no Processo'}</span>
                            </button>
                        </div>
                    }
                />

                {salvo && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-mono rounded flex items-center gap-2 shadow-lg animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Peça processual vinculada formalmente ao inquérito e registada com assinatura digital na auditoria forense SHA-256.</span>
                    </div>
                )}

                {/* Biblioteca de Modelos Forenses Oficiais */}
                <div className="bg-[#132235] border border-[#223750] rounded-lg p-3 shadow-sm">
                    <div className="text-[10px] uppercase font-sans font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Carregar Modelo Oficial Pré-formatado (Clique para preencher e emitir em PDF):</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {Object.entries(modelosOficiais).map(([chave, mod]) => {
                            const Icon = mod.icon;
                            const isSelected = modeloAtivo === chave;
                            return (
                                <button
                                    key={chave}
                                    type="button"
                                    onClick={() => carregarModelo(chave)}
                                    className={`p-2.5 rounded-md border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#1a2d42] border-[#c5a059] text-white shadow-md'
                                            : 'bg-[#0d1a26] border-[#223750] text-slate-300 hover:bg-[#17283c] hover:border-slate-500'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#c5a059]' : 'text-slate-400'}`} />
                                        <span className="font-bold text-[11px] truncate">{mod.titulo}</span>
                                    </div>
                                    <span className={`text-[9px] truncate ${isSelected ? 'text-[#c5a059] font-semibold' : 'text-slate-500'}`}>
                                        {isSelected ? '● Carregado no Editor' : 'Clique para carregar'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Editor Forense com Folha Oficial */}
                <TacticalCard
                    title={`Editor Forense Oficial: ${modelosOficiais[modeloAtivo]?.titulo || 'Peça Processual'}`}
                    icon={<FileText className="w-4 h-4 text-[#c5a059]" />}
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => compilarPdf(false)}
                                disabled={gerandoPdf}
                                className="text-xs text-[#c5a059] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{gerandoPdf ? 'A compilar...' : 'Ver em PDF'}</span>
                            </button>
                            <span className="text-slate-500">|</span>
                            <button
                                type="button"
                                onClick={() => compilarPdf(true)}
                                disabled={gerandoPdf}
                                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Baixar PDF</span>
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-3">
                        <ForenseWysiwyg value={conteudo} onChange={setConteudo} />
                    </div>
                </TacticalCard>

                {/* Elemento oculto do ecrã, mas visível durante a impressão direta A4 (@media print) */}
                <div id="documento-imprimir-a4" className="hidden print:block font-serif text-black p-8">
                    <div className="text-center border-b-2 border-black pb-4 mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest">REPÚBLICA DE ANGOLA</h2>
                        <h3 className="text-xs font-bold uppercase">MINISTÉRIO DO INTERIOR</h3>
                        <h4 className="text-xs font-bold uppercase text-[#855d14]">SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h4>
                        <p className="text-[10px] text-gray-600 mt-1">{unidadeNome} — Província de {provinciaNome}</p>
                    </div>

                    <div className="text-center my-4">
                        <h1 className="text-base font-bold uppercase underline">{modelosOficiais[modeloAtivo]?.titulo}</h1>
                        <p className="font-mono text-xs font-bold mt-1">PROCESSO-CRIME Nº: {processo.numero_processo}</p>
                    </div>

                    <div
                        className="text-xs leading-relaxed space-y-3 my-6"
                        dangerouslySetInnerHTML={{ __html: conteudo }}
                    />

                    <div className="mt-12 pt-4 border-t border-dashed border-gray-400 text-[9px] text-gray-500 text-center font-mono">
                        DOCUMENTO PROCESSUAL OFICIAL DO SIC &bull; VALIDAÇÃO CRIPTOGRÁFICA SHA-256 &bull; {processo.numero_processo}
                    </div>
                </div>

                {/* Modal Solene de Pré-Visualização do PDF Oficial */}
                {showPdfModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-[#0e1b2a] border border-[#20344d] rounded-lg shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
                            {/* Cabeçalho do Modal */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#132235] border-b border-[#20344d]">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#c5a059]" />
                                    <span className="text-sm font-semibold text-slate-100">
                                        Pré-Visualização do PDF Oficial: {modelosOficiais[modeloAtivo]?.titulo}
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-mono bg-[#0d1a26] text-[#c5a059] border border-[#20344d] rounded">
                                        A4 Solene
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAbrirNovaAba}
                                        disabled={!pdfBlobUrl}
                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] text-slate-200 hover:text-white text-xs font-sans rounded border border-[#20344d] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                                        <span>Abrir em Nova Aba</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => compilarPdf(true)}
                                        disabled={gerandoPdf}
                                        className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] text-slate-200 hover:text-white text-xs font-sans rounded border border-[#20344d] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                    >
                                        <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                                        <span>Descarregar</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowPdfModal(false)}
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-[#17283c] rounded border border-transparent hover:border-[#20344d] transition-colors cursor-pointer"
                                        title="Fechar Visualizador"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Iframe embutido com o PDF compilado dinamicamente */}
                            <div className="flex-1 bg-[#09131d] p-1 flex flex-col">
                                {gerandoPdf ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3 p-8">
                                        <div className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
                                        <div className="text-xs font-mono text-[#c5a059] tracking-wider uppercase">
                                            A compilar documento solene com as informações do editor...
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            A formatar tipografia oficial, cabeçalho da República e chancela de segurança do SIC.
                                        </div>
                                    </div>
                                ) : pdfBlobUrl ? (
                                    <iframe
                                        src={pdfBlobUrl}
                                        title="PDF Oficial"
                                        className="w-full h-full rounded border-none bg-white"
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-8">
                                        <p>Ocorreu uma falha na compilação do documento.</p>
                                        <button
                                            type="button"
                                            onClick={() => compilarPdf(false)}
                                            className="mt-2 px-3 py-1.5 bg-[#17283c] text-[#c5a059] border border-[#20344d] rounded text-xs cursor-pointer"
                                        >
                                            Tentar Novamente
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Rodapé do Modal */}
                            <div className="px-4 py-2 bg-[#132235] border-t border-[#20344d] flex items-center justify-between text-xs text-slate-400">
                                <span>Emitido nos termos do Código de Processo Penal Angolano com chancela do SIC.</span>
                                <button
                                    type="button"
                                    onClick={() => setShowPdfModal(false)}
                                    className="px-4 py-1 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded border border-[#20344d] cursor-pointer"
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
