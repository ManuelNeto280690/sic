import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Scale,
    Bot,
    Send,
    X,
    Copy,
    Check,
    RotateCcw,
    Clock,
    FileText,
    ShieldAlert,
    ChevronDown,
    ChevronUp,
    FolderOpen,
    CheckCircle2
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    isFallback?: boolean;
}

export const LegalCopilotDrawer: React.FC = () => {
    const page = usePage<any>();
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showContextDetails, setShowContextDetails] = useState(false);
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Detecção do contexto da página atual (Processo, Ocorrência, Detenção, Módulo)
    const url = page.url || '';
    const props = page.props || {};

    let moduloNome = 'Geral';
    if (url.includes('/magistratura')) moduloNome = 'PGR - Magistratura Judicial';
    else if (url.includes('/sme')) moduloNome = 'SME - Controlo de Fronteiras';
    else if (url.includes('/ocorrencias')) moduloNome = 'SIC - Ocorrências & Autos';
    else if (url.includes('/detidos')) moduloNome = 'SIC - Registo de Detidos (48h)';
    else if (url.includes('/processos-crime')) moduloNome = 'SIC - Instrução Processual';
    else if (url.includes('/laboratorio')) moduloNome = 'SIC - Laboratório Criminalística';
    else if (url.includes('/definicoes')) moduloNome = 'Definições do Sistema';

    // Priorizar o caso selecionado por clique, ou os props da página aberta
    const activeProcesso = selectedCase || props.processo || props.processoCrime || null;
    const activeOcorrencia = selectedCase?.ocorrencia || props.ocorrencia || null;
    const activeDetencao = selectedCase?.detencao || props.detencao || props.detido || activeProcesso?.detencao || null;

    const casoNumero = activeProcesso?.numero_processo || activeOcorrencia?.numero_auto || activeDetencao?.numero_mandado || null;
    const tipologiaCrime = activeProcesso?.tipologia_legal || activeProcesso?.tipologia_crime || activeOcorrencia?.natureza_crime || activeDetencao?.motivo_detencao || null;
    const estadoCaso = activeProcesso?.estado || activeOcorrencia?.estado || null;

    // Cálculo de horas da detenção (se disponível)
    const dataHoraDetencao = activeDetencao?.data_hora_detencao || null;
    let horasDetencao: number | null = null;
    if (dataHoraDetencao) {
        const diffMs = new Date().getTime() - new Date(dataHoraDetencao).getTime();
        horasDetencao = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    }

    const authUser = props.auth?.user;
    const isAdmin = authUser?.perfil === 'ADMIN_SISTEMA';
    const nomeLimpo = authUser?.nome_completo
        ? authUser.nome_completo.replace(/\s*\(Administrador\)\s*/i, '').trim()
        : 'Manuel Pascoal';

    const cargoFormatado = isAdmin
        ? 'Administrador do Sistema'
        : authUser?.perfil === 'MAGISTRADO_PGR'
        ? 'Magistrado do Ministério Público'
        : authUser?.perfil === 'INVESTIGADOR'
        ? 'Investigador Criminal'
        : authUser?.perfil === 'DIRETOR_NACIONAL'
        ? 'Director Nacional'
        : (authUser?.perfil || 'Operador SIGD-SIC');

    const saudacaoUsuario = authUser
        ? (isAdmin
            ? `Senhor Administrador do Sistema, ${nomeLimpo}`
            : authUser.perfil === 'MAGISTRADO_PGR'
            ? `Digno Magistrado do Ministério Público, ${nomeLimpo}`
            : authUser.perfil === 'INVESTIGADOR'
            ? `Senhor Investigador Criminal, ${nomeLimpo}`
            : `Senhor(a) ${nomeLimpo}`)
        : 'Colega';

    // 1. Escuta evento global disparado ao clicar em qualquer processo nas tabelas/listas
    useEffect(() => {
        const handleProcessoSelect = (e: any) => {
            const proc = e.detail;
            if (proc) {
                setSelectedCase(proc);
                setIsOpen(true);
                const pNum = proc.numero_processo || proc.numero_auto || proc.numero_mandado_oficial || 'Auto Selecionado';
                const pCrime = proc.tipologia_legal || proc.tipologia_crime || proc.natureza_crime || proc.tipo || 'Em investigação';
                
                const alertMsg: ChatMessage = {
                    id: `proc-sel-${Date.now()}`,
                    role: 'assistant',
                    content: `📋 **Autos em Análise:** \`${pNum}\`\nSaudações, **${saudacaoUsuario}**! Carreguei os autos relativos a **${pCrime}**.\n\nO acervo da Constituição da República de Angola (Art. 63º), Código de Processo Penal (Lei 39/20) e Código Penal (Lei 38/20) está sincronizado. Posso debater a estratégia do inquérito consigo ou **redigir a minuta oficial circunstanciada** para o processo. Como deseja orientar a diligência?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, alertMsg]);
            }
        };

        window.addEventListener('sic:open-copilot-processo', handleProcessoSelect);
        return () => window.removeEventListener('sic:open-copilot-processo', handleProcessoSelect);
    }, [saudacaoUsuario]);

    // 2. Detecção automática quando a rota muda para visualização de um processo
    const lastLoadedIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (props.processo && props.processo.id !== lastLoadedIdRef.current) {
            lastLoadedIdRef.current = props.processo.id;
            setSelectedCase(props.processo);
            const pNum = props.processo.numero_processo;
            const pCrime = props.processo.tipologia_legal || props.processo.tipologia_crime || 'Matéria Criminal';
            
            const alertMsg: ChatMessage = {
                id: `proc-page-${Date.now()}`,
                role: 'assistant',
                content: `⚖️ **Processo Carregado:** \`${pNum}\` (${pCrime})\nSaudações, **${saudacaoUsuario}**! Os autos deste inquérito estão agora no foco do Copiloto. Posso redigir a minuta oficial de despacho, auditar prazos da detenção ou esclarecer qualquer dúvida de direito positivo.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, alertMsg]);
        }
    }, [props.processo, saudacaoUsuario]);

    // Mensagens iniciais de boas-vindas conversacionais
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        return [
            {
                id: 'init-1',
                role: 'assistant',
                content: `🏛️ **Copiloto Jurídico e Pericial Institucional**\n\nSaudações institucionais, **${saudacaoUsuario}**!\nReconheço o vosso acesso com perfil de **${cargoFormatado}**${isAdmin ? ' (Tutela Técnica e Supervisão Geral)' : ''}.\n\nEstou a acompanhar o vosso trabalho no módulo **${moduloNome}**${casoNumero ? ` sobre os autos do **${casoNumero}**` : ''}.\n\nAlém de fundamentar as questões nas leis de Angola (CRA, Lei 39/20, Lei 38/20 e Código Civil), estou pronto para **conversar e dialogar sobre a estratégia do caso** ou **gerar minutas completas e robustas** para despachos e peças processuais sem divagações desnecessárias.\n\nComo posso ser útil hoje?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
        ];
    });

    // Auto-scroll para a última mensagem
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Tecla de atalho Alt + J para alternar o Copiloto
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && (e.key === 'j' || e.key === 'J')) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSendMessage = async (customText?: string) => {
        const text = (customText || inputMessage).trim();
        if (!text || isLoading) return;

        const userMsg: ChatMessage = {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        if (!customText) setInputMessage('');
        setIsLoading(true);

        try {
            // Contexto montado a partir dos dados do ecrã e do processo ativo
            const contextPayload = {
                modulo: moduloNome,
                url: url,
                processo_id: activeProcesso?.id,
                processo_numero: casoNumero,
                tipologia_crime: tipologiaCrime,
                estado_processo: estadoCaso,
                data_detencao: dataHoraDetencao,
                horas_detencao: horasDetencao,
                arguidos: activeProcesso?.arguidos || (activeDetencao?.nome_completo ? [activeDetencao.nome_completo] : []),
                vitimas: activeProcesso?.vitimas || (activeOcorrencia?.vitima ? [activeOcorrencia.vitima] : []),
                descricao: activeProcesso?.resumo_factos || activeOcorrencia?.descricao_factos || activeDetencao?.circunstancias || '',
            };

            const response = await axios.post('/copiloto/chat', {
                messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                context: contextPayload,
            });

            if (response.data && response.data.reply) {
                const botMsg: ChatMessage = {
                    id: `bot-${Date.now()}`,
                    role: 'assistant',
                    content: response.data.reply,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isFallback: response.data.is_fallback,
                };
                setMessages(prev => [...prev, botMsg]);
            }
        } catch (error: any) {
            const botErrorMsg: ChatMessage = {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ Não foi possível obter o parecer no momento. Detalhe técnico: ${error.response?.data?.message || error.message}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, botErrorMsg]);
        } finally {
            setIsLoading(false);
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    const handleCopy = (text: string, id: string) => {
        let cleanText = text;
        const codeBlockMatch = text.match(/```(?:text|markdown)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            cleanText = codeBlockMatch[1].trim();
        } else {
            cleanText = cleanText.replace(/^[^\n]*segue a minuta[^\n]*\n+/i, '').trim();
        }

        navigator.clipboard.writeText(cleanText || text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: 'init-fresh',
                role: 'assistant',
                content: `Conversa reiniciada. O Copiloto Jurídico está pronto para analisar os autos de **${casoNumero || 'qualquer processo em aberto'}**.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
        ]);
    };

    // Renderizador de formatação textual forense
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            if (line.startsWith('> ')) {
                return (
                    <blockquote key={idx} className="my-1.5 pl-3 border-l-2 border-blue-500 bg-blue-500/10 text-blue-200 py-1 px-2 rounded-r text-[11px] font-sans">
                        {renderInlineFormatting(line.substring(2))}
                    </blockquote>
                );
            }
            if (line.startsWith('### ')) {
                return (
                    <h4 key={idx} className="text-xs font-bold text-blue-300 mt-2.5 mb-1 tracking-wide uppercase font-sans">
                        {renderInlineFormatting(line.substring(4))}
                    </h4>
                );
            }
            if (line.startsWith('#### ')) {
                return (
                    <h5 key={idx} className="text-[11px] font-semibold text-slate-200 mt-2 mb-0.5 font-sans">
                        {renderInlineFormatting(line.substring(5))}
                    </h5>
                );
            }
            if (line.trim() === '---') {
                return <hr key={idx} className="my-2 border-[#223750]" />;
            }
            if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
                return (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 my-0.5 leading-relaxed pl-1">
                        <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                        <span>{renderInlineFormatting(line.substring(2))}</span>
                    </div>
                );
            }
            const numMatch = line.match(/^(\d+)\.\s+(.*)/);
            if (numMatch) {
                return (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 my-0.5 leading-relaxed pl-1">
                        <span className="text-blue-400 font-mono text-[10px] mt-0.5 shrink-0">{numMatch[1]}.</span>
                        <span>{renderInlineFormatting(numMatch[2])}</span>
                    </div>
                );
            }
            if (!line.trim()) {
                return <div key={idx} className="h-1.5" />;
            }
            return (
                <p key={idx} className="text-xs text-slate-300 leading-relaxed my-0.5">
                    {renderInlineFormatting(line)}
                </p>
            );
        });
    };

    const renderInlineFormatting = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="bg-[#0f172a] text-blue-300 px-1 py-0.5 rounded text-[10px] font-mono border border-[#1e293b]">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    return (
        <>
            {/* BOTÃO FLUTUANTE DE ACESSO RÁPIDO (CANTO INFERIOR DIREITO) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#132235]/95 hover:bg-[#1a2e46] text-slate-100 rounded-full border border-blue-500/40 hover:border-blue-400 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 group cursor-pointer"
                    title="Abrir Copiloto Jurídico Institucional (Alt + J)"
                >
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                            <Scale className="w-4 h-4" />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#132235]"></span>
                    </div>
                    <div className="text-left pr-1">
                        <div className="text-[11px] font-bold text-slate-200 tracking-wide font-sans flex items-center gap-1.5">
                            <span>Copiloto Jurídico</span>
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded border border-blue-500/30 font-mono">PGR • SIC</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                            {casoNumero ? `Processo: ${casoNumero}` : 'Alt + J'}
                        </div>
                    </div>
                </button>
            )}

            {/* PAINEL LATERAL DE CIMA A BAIXO (FULL-HEIGHT RIGHT DRAWER) */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] md:w-[500px] h-screen bg-[#0b1523] border-l border-[#223750] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                aria-label="Copiloto Jurídico e Pericial"
            >
                {/* 1. CABEÇALHO INSTITUCIONAL */}
                <div className="h-14 bg-[#111e2e] border-b border-[#223750] px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400">
                            <Scale className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-100 tracking-wider font-sans uppercase">
                                    Copiloto Jurídico & Pericial
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 bg-blue-950 text-blue-300 font-mono rounded border border-blue-800/80 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    Acervo Oficial
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans">
                                Direito Penal, Processual & Constitucional de Angola
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleClearChat}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1a2e46] rounded transition-colors cursor-pointer"
                            title="Reiniciar Sessão"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1a2e46] rounded transition-colors cursor-pointer"
                            title="Fechar Painel (Alt + J)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 1.1 BARRA DE ESTATUTO E PERFIL DO UTILIZADOR AUTENTICADO */}
                <div className="bg-[#0b1726] border-b border-[#1b2b3e] px-4 py-1.5 flex items-center justify-between text-[11px] font-sans shrink-0">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400 ring-2 ring-amber-400/30' : 'bg-blue-400'}`}></span>
                        <span className="font-semibold text-slate-200 truncate max-w-[240px]">{nomeLimpo}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 shrink-0 ${
                        isAdmin 
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' 
                            : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                    }`}>
                        {isAdmin ? '🛡️ Administrador do Sistema' : cargoFormatado}
                    </span>
                </div>

                {/* 2. CARD DE IDENTIFICAÇÃO DO PROCESSO ATIVO NO ECRÃ */}
                <div className="bg-[#0f1b29] border-b border-[#1e2f42] px-4 py-2.5 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="font-semibold text-blue-200">
                                {casoNumero ? `Processo: ${casoNumero}` : moduloNome}
                            </span>
                            {tipologiaCrime && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                                    • {tipologiaCrime}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowContextDetails(!showContextDetails)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer"
                        >
                            <span>{showContextDetails ? 'Ocultar' : 'Ver Dados'}</span>
                            {showContextDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    </div>

                    {/* HUD Rápido de Detenção (se houver detenção) */}
                    {horasDetencao !== null && (
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono">
                            <span className={`px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                                horasDetencao >= 48
                                    ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                                    : horasDetencao >= 36
                                    ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                                    : 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                            }`}>
                                <Clock className="w-3 h-3" />
                                <span>Custódia: <strong>{horasDetencao}h</strong> / 48h (Art. 63º CRA)</span>
                            </span>
                            {horasDetencao >= 48 && (
                                <span className="text-rose-400 font-bold animate-pulse">PRAZO ULTRAPASSADO</span>
                            )}
                        </div>
                    )}

                    {/* Detalhes expandidos */}
                    {showContextDetails && (
                        <div className="mt-2.5 p-2 bg-[#080d14] rounded border border-[#1e2f42] text-[10px] font-mono space-y-1 text-slate-300 animate-in fade-in duration-150">
                            <div><span className="text-slate-500">Módulo:</span> {moduloNome}</div>
                            {casoNumero && <div><span className="text-slate-500">Nº Oficial:</span> {casoNumero}</div>}
                            {tipologiaCrime && <div><span className="text-slate-500">Crime:</span> {tipologiaCrime}</div>}
                            {estadoCaso && <div><span className="text-slate-500">Estado:</span> {estadoCaso}</div>}
                            {dataHoraDetencao && <div><span className="text-slate-500">Detenção:</span> {dataHoraDetencao} ({horasDetencao}h decorridas)</div>}
                            <div className="pt-1 text-blue-400/80 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Legislação Angolana Sincronizada (docs/)</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. AÇÕES RÁPIDAS (PROMPTS DE CONVERSAÇÃO E REDAÇÃO OFICIAL) */}
                <div className="px-3 py-2 bg-[#0d1723] border-b border-[#1e2f42] shrink-0 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
                    <button
                        onClick={() => handleSendMessage('Gere a minuta oficial completa e circunstanciada do despacho da PGR/SIC para este processo, sem preâmbulos desnecessários ou explicações preliminares. Inicie logo com a peça oficial exaustiva (cabeçalho formal, qualificação, I. Relatório Fáctico, II. Auditoria da Custódia e Art. 63 CRA, III. Subsunção Penal Lei 38/20 e Cível Art. 483 CC, IV. Juízo Cautelar de Medidas de Coacção Lei 39/20, V. Dispositivo Decisório e VI. Notificações e Assinatura com o cargo oficial).')}
                        disabled={isLoading}
                        className="px-2.5 py-1 bg-[#132235] hover:bg-[#1a2e46] text-blue-300 rounded border border-blue-900/60 hover:border-blue-700 text-[10px] font-sans font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span>Minutar Despacho Oficial</span>
                    </button>
                    <button
                        onClick={() => handleSendMessage('Gere o texto técnico circunstanciado para inserção direta no auto deste processo: com narração fáctica minuciosa de tempo, modo e lugar, apreensões realizadas, enquadramento no Código Penal Angolano (Lei 38/20) e fundamentação de legalidade.')}
                        disabled={isLoading}
                        className="px-2.5 py-1 bg-[#132235] hover:bg-[#1a2e46] text-blue-300 rounded border border-blue-900/60 hover:border-blue-700 text-[10px] font-sans font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <ShieldAlert className="w-3 h-3 text-blue-400" />
                        <span>Texto para o Auto</span>
                    </button>
                    <button
                        onClick={() => handleSendMessage('Senhor Copiloto, vamos debater a estratégia probatória deste caso: que fragilidades identifica no inquérito, que diligências periciais prioritárias recomenda no Laboratório e quais as melhores opções táticas?')}
                        disabled={isLoading}
                        className="px-2.5 py-1 bg-[#132235] hover:bg-[#1a2e46] text-blue-300 rounded border border-blue-900/60 hover:border-blue-700 text-[10px] font-sans font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <Scale className="w-3 h-3 text-purple-400" />
                        <span>Conversar sobre o Caso</span>
                    </button>
                    <button
                        onClick={() => handleSendMessage('Auditar a tempestividade e legalidade da custódia do arguido nos termos do Artigo 63º da Constituição da República de Angola e Código do Processo Penal.')}
                        disabled={isLoading}
                        className="px-2.5 py-1 bg-[#132235] hover:bg-[#1a2e46] text-blue-300 rounded border border-blue-900/60 hover:border-blue-700 text-[10px] font-sans font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                    >
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Auditar 48h (CRA)</span>
                    </button>
                </div>

                {/* 4. ÁREA DE MENSAGENS / PARECERES */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0b1523]">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-slate-400">
                                {msg.role === 'assistant' ? (
                                    <>
                                        <Bot className="w-3 h-3 text-blue-400" />
                                        <span className="font-semibold text-blue-300">Copiloto Jurídico</span>
                                    </>
                                ) : (
                                    <span className="font-semibold text-slate-300">Você</span>
                                )}
                                <span>•</span>
                                <span>{msg.timestamp}</span>
                            </div>

                            <div
                                className={`relative group max-w-[94%] rounded-lg p-3 text-xs shadow-sm ${
                                    msg.role === 'user'
                                        ? 'bg-[#1a365d] text-slate-100 border border-blue-600/40 rounded-tr-none'
                                        : 'bg-[#111e2e] text-slate-200 border border-[#223750] rounded-tl-none'
                                }`}
                            >
                                <div className="space-y-1">
                                    {renderMarkdown(msg.content)}
                                </div>

                                {/* Botão de cópia para despachos */}
                                {msg.role === 'assistant' && (
                                    <div className="mt-2.5 pt-2 border-t border-[#223750]/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                        <span className="text-[9px] text-slate-500">SIGD-SIC • Redação Oficial</span>
                                        <button
                                            onClick={() => handleCopy(msg.content, msg.id)}
                                            className="flex items-center gap-1.5 hover:text-blue-200 px-2 py-1 rounded bg-[#16273b] hover:bg-[#1f3752] border border-[#233852] transition-colors cursor-pointer text-slate-300"
                                            title="Copiar texto para usar no despacho ou documento oficial"
                                        >
                                            {copiedId === msg.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400 font-bold">Copiado para o Documento!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                                                    <span>Copiar para Documento</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Indicador de processamento */}
                    {isLoading && (
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-slate-400">
                                <Bot className="w-3 h-3 text-blue-400" />
                                <span className="font-semibold text-blue-300">Copiloto Jurídico</span>
                                <span>•</span>
                                <span>A fundamentar normas e factos...</span>
                            </div>
                            <div className="bg-[#111e2e] border border-[#223750] rounded-lg rounded-tl-none p-3 max-w-[85%] flex items-center gap-2 text-xs text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                                <span className="font-mono text-[11px] text-blue-300">Consultando Código Penal, CPP e Constituição...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* 5. ÁREA DE INPUT E SUBMISSÃO */}
                <div className="p-3 bg-[#111e2e] border-t border-[#223750] shrink-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                        className="space-y-2"
                    >
                        <div className="relative flex items-end bg-[#0b1523] border border-[#223750] focus-within:border-blue-500 rounded-lg p-2 transition-colors">
                            <textarea
                                ref={textareaRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                rows={2}
                                placeholder="Faça uma consulta jurídica sobre o processo (ou use Alt+J)..."
                                className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 resize-none outline-none font-sans leading-relaxed"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading}
                                className="p-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-[#1a2e46] text-white disabled:text-slate-500 transition-colors cursor-pointer shrink-0 ml-1.5"
                                title="Enviar Consulta (Enter)"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-sans px-1">
                            <span>Enter para enviar • Shift + Enter para quebra de linha</span>
                            <span className="font-mono text-slate-600">SIGD-SIC</span>
                        </div>
                    </form>
                </div>
            </aside>
        </>
    );
};
