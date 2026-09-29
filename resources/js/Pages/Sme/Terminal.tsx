import React, { useState, useRef, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';
import {
    PlaneTakeoff,
    Search,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    UserX,
    PhoneCall,
    Radio,
    Clock,
    Zap,
    LogOut,
    ArrowRightLeft,
    AlertTriangle,
    Scale,
    Shield,
    Layers,
    ChevronDown,
} from 'lucide-react';
import { IntercepcaoFronteirica } from '@/types';

interface SmeTerminalProps {
    posto_fronteira: string;
    operador_nip: string;
    ultimas_intercepcoes: IntercepcaoFronteirica[];
    estatisticas_turno: {
        total_consultas: number;
        liberados: number;
        retidos: number;
        tempo_resposta_medio_ms: number;
    };
}

export default function SmeTerminal({
    posto_fronteira,
    operador_nip,
    ultimas_intercepcoes,
    estatisticas_turno,
}: SmeTerminalProps) {
    const [documento, setDocumento] = useState('');
    const [resultado, setResultado] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [intercetando, setIntercetando] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [federatedMenuOpen, setFederatedMenuOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleConsultar = (docOverride?: string) => {
        const doc = docOverride || documento.trim();
        if (!doc) return;

        setLoading(true);
        setResultado(null);
        setMensagemSucesso('');

        fetch(route('sme.consultar'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
            },
            body: JSON.stringify({ documento: doc }),
        })
            .then((res) => res.json())
            .then((data) => {
                setResultado(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const handleIntercetar = (sentido: 'ENTRADA' | 'SAIDA') => {
        if (!resultado || !resultado.alerta) return;

        setIntercetando(true);
        fetch(route('sme.intercetar'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
            },
            body: JSON.stringify({
                mandado_id: resultado.alerta.mandado_id,
                sentido: sentido,
                detalhes_acao: `Passageiro intercetado pelo operador ${operador_nip} no posto ${posto_fronteira} em sentido de ${sentido}. Retenção física em sala isolada efetuada.`,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setIntercetando(false);
                setMensagemSucesso(data.mensagem);
            })
            .catch(() => setIntercetando(false));
    };

    const limparTerminal = () => {
        setDocumento('');
        setResultado(null);
        setMensagemSucesso('');
        inputRef.current?.focus();
    };

    return (
        <div className="min-h-screen bg-[#0d1a26] text-slate-100 flex flex-col font-sans select-none">
            {/* Barra de Status do Terminal de Alta Velocidade */}
            <header className="h-14 bg-[#132235] border-b border-[#223750] px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md">
                        <PlaneTakeoff className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tracking-widest text-emerald-400 font-mono">
                                SME // TERMINAL DE FRONTEIRA
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#0d1a26] text-slate-300 font-mono rounded border border-[#223750]">
                                &lt;300MS SLA
                            </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{posto_fronteira}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Latência Média: <strong className="text-slate-200">{estatisticas_turno.tempo_resposta_medio_ms}ms</strong></span>
                    </div>

                    <div className="h-4 w-[1px] bg-[#223750]"></div>

                    {/* Janelas Federadas */}
                    <div className="relative">
                        <button
                            onClick={() => setFederatedMenuOpen(!federatedMenuOpen)}
                            className="px-2.5 py-1 bg-[#17283c] hover:bg-[#1e344d] border border-[#223750] text-emerald-300 hover:text-white rounded text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Alternar entre Janelas Federadas"
                        >
                            <Layers className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline font-medium">Janelas Federadas</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {federatedMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-[#132235] border border-[#223750] rounded-md shadow-2xl p-2 z-50 animate-in fade-in-50 text-xs font-sans">
                                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-[#223750]">
                                    Janelas Federadas do Sistema
                                </div>

                                <Link
                                    href="/sme/terminal"
                                    onClick={() => setFederatedMenuOpen(false)}
                                    className="flex items-center justify-between p-2 rounded hover:bg-emerald-950/60 text-emerald-300 mt-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <PlaneTakeoff className="w-4 h-4 text-emerald-400" />
                                        <span>Terminal SME (Atual)</span>
                                    </div>
                                    <span className="text-[9px] px-1 bg-emerald-900/60 rounded">Ativa</span>
                                </Link>

                                <Link
                                    href="/magistratura"
                                    onClick={() => setFederatedMenuOpen(false)}
                                    className="flex items-center justify-between p-2 rounded hover:bg-purple-950/60 text-purple-300"
                                >
                                    <div className="flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-purple-400" />
                                        <span>Janela da PGR (Mandados)</span>
                                    </div>
                                    <span className="text-[9px] px-1 bg-purple-900/60 rounded">PGR</span>
                                </Link>

                                <Link
                                    href="/ocorrencias"
                                    onClick={() => setFederatedMenuOpen(false)}
                                    className="flex items-center justify-between p-2 rounded hover:bg-[#1a2e46] text-[#c5a059]"
                                >
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-[#c5a059]" />
                                        <span>Comando Operacional SIC</span>
                                    </div>
                                    <span className="text-[9px] px-1 bg-amber-950/60 rounded">Policial</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-[1px] bg-[#223750]"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-300">Operador: <strong className="text-[#c5a059]">{operador_nip}</strong></span>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Sair do Terminal"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Corpo do Terminal */}
            <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
                {/* Leitor Rápido de BI / Passaporte */}
                <div className="bg-[#132235] border border-[#223750] rounded-[6px] p-6 shadow-2xl">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                        <span>Leitura Direta: Leitor Ótico / Código de Barras / Digitação Manual</span>
                        <span className="text-[#c5a059] font-bold">Consulte um passageiro</span>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleConsultar();
                        }}
                        className="flex gap-3"
                    >
                        <div className="relative flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={documento}
                                onChange={(e) => setDocumento(e.target.value.toUpperCase())}
                                placeholder="DIGITE OU ESCANEIE O Nº DO BI (EX: 005421980LA048) OU PASSAPORTE (EX: N2094182)..."
                                className="w-full bg-[#0d1a26] border-2 border-[#223750] focus:border-emerald-500 text-slate-100 px-4 py-3 text-base font-mono rounded-[4px] focus:outline-none tracking-wider placeholder:text-slate-600 uppercase"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-sans font-bold text-sm uppercase tracking-wider rounded-[4px] transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-lg"
                        >
                            <Search className="w-4 h-4" />
                            <span>{loading ? 'Consultando...' : 'Verificar'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={limparTerminal}
                            className="px-4 py-3 bg-[#17283c] hover:bg-[#223750] text-slate-300 font-sans text-xs uppercase rounded border border-[#223750]"
                        >
                            Limpar
                        </button>
                    </form>

                    {/* Atalhos para testar rapidamente */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#223750]/60 text-xs font-sans text-slate-400">
                        <span>Casos Rápidos de Teste:</span>
                        <button
                            onClick={() => {
                                setDocumento('005421980LA048');
                                handleConsultar('005421980LA048');
                            }}
                            className="px-2 py-0.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700 rounded text-[11px]"
                        >
                            🔴 Pedro Cassoma (Mandado Ativo / Alerta Vermelho)
                        </button>
                        <button
                            onClick={() => {
                                setDocumento('007621094LA099');
                                handleConsultar('007621094LA099');
                            }}
                            className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700 rounded text-[11px]"
                        >
                            🔴 António Van-Dúnem (Interdição de Saída)
                        </button>
                        <button
                            onClick={() => {
                                setDocumento('002198731HA031');
                                handleConsultar('002198731HA031');
                            }}
                            className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 rounded text-[11px]"
                        >
                            🟢 Manuel Kitumba (Liberado / Sem Restrições)
                        </button>
                    </div>
                </div>

                {/* ECRÃ DE RESULTADO BINÁRIO (<300ms) */}
                {resultado && (
                    <div>
                        {resultado.status === 'LIBERADO' ? (
                            /* 🟢 ECRÃ VERDE — PASSAGEM AUTORIZADA */
                            <div className="bg-emerald-950/40 border-2 border-emerald-500 rounded-[6px] p-8 shadow-2xl text-center font-mono space-y-4 shadow-sm animate-in zoom-in-95 duration-100">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-extrabold tracking-widest text-emerald-300 uppercase">
                                    🟢 LIBERADO // PASSAGEM AUTORIZADA
                                </h2>
                                <p className="text-base text-slate-200 max-w-xl mx-auto">
                                    {resultado.mensagem}
                                </p>
                                {resultado.individuo && (
                                    <div className="p-3 bg-[#0d1a26] border border-emerald-800 rounded inline-block text-xs text-slate-300">
                                        Passageiro: <strong>{resultado.individuo.nome_completo}</strong> | BI: {resultado.individuo.numero_bi}
                                    </div>
                                )}
                                <div className="text-[11px] text-slate-400 pt-2">
                                    Tempo de Resposta: <strong className="text-emerald-400">{resultado.tempo_ms}ms</strong> | Telemetria SIC-SME Verificada
                                </div>
                            </div>
                        ) : (
                            /* 🔴 ECRÃ VERMELHO — ALARME / RETENÇÃO OBRIGATÓRIA */
                            <div className="bg-rose-950/80 border-4 border-rose-600 rounded-[6px] p-8 shadow-2xl font-mono space-y-6 shadow-sm animate-in zoom-in-95 duration-100">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-rose-700/80 pb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center text-rose-300 animate-pulse">
                                            <ShieldAlert className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-extrabold tracking-widest text-rose-100 uppercase">
                                                🔴 BLOQUEADO // RETENÇÃO OBRIGATÓRIA
                                            </h2>
                                            <div className="text-sm font-bold text-rose-300 mt-0.5">
                                                MANDADO JUDICIAL ATIVO — NÃO AUTORIZAR A PASSAGEM
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs text-rose-200">Tempo de Resposta:</div>
                                        <div className="text-2xl font-bold text-rose-300">{resultado.tempo_ms}ms</div>
                                    </div>
                                </div>

                                {/* Dados do Indivíduo e Mandado */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0d1a26]/90 p-6 rounded border border-rose-700">
                                    {/* Foto e Perigo */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-rose-800/60 pb-4 md:pb-0 md:pr-4">
                                        <div className="w-32 h-40 bg-[#17283c] border-2 border-rose-500 rounded flex items-center justify-center text-slate-500 mb-2">
                                            <UserX className="w-16 h-16 text-rose-400" />
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold text-sm text-slate-100">
                                                {resultado.alerta.individuo.nome_completo}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                BI: {resultado.alerta.individuo.numero_bi}
                                            </div>
                                            {resultado.alerta.individuo.perigoso && (
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-rose-600 text-slate-900 font-bold text-[10px] rounded uppercase">
                                                    ALERTA: INDIVÍDUO PERIGOSO
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Detalhes do Mandado */}
                                    <div className="md:col-span-8 space-y-3 text-xs">
                                        <div>
                                            <span className="text-slate-400 text-[10px] uppercase block">Ordem Oficial / Mandado</span>
                                            <span className="text-base font-bold text-rose-300">{resultado.alerta.numero_mandado}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-slate-400 text-[10px] uppercase block">Tipo de Impedimento</span>
                                                <span className="text-slate-100 font-bold">{resultado.alerta.tipo}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-[10px] uppercase block">Notícia Vermelha INTERPOL</span>
                                                <span className={resultado.alerta.interpol_red_notice ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                                                    {resultado.alerta.interpol_red_notice ? 'SIM (DIFUSÃO RED NOTICE)' : 'NÃO'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 text-[10px] uppercase block">Órgão Emissor / Magistrado</span>
                                            <span className="text-slate-200">{resultado.alerta.orgao_emitente} — {resultado.alerta.magistrado}</span>
                                        </div>

                                        <div className="p-3 bg-rose-950/60 border border-rose-700 rounded text-rose-200">
                                            <strong>Directriz Operacional:</strong> {resultado.alerta.orientacao_operacional}
                                        </div>

                                        <div className="flex items-center gap-2 text-rose-300">
                                            <PhoneCall className="w-4 h-4" />
                                            <span>Piquete do SIC: <strong>{resultado.alerta.contacto_piquete_sic}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de Ação de Interceção */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-rose-800">
                                    <div className="text-xs text-rose-200">
                                        Clique no botão correspondente para notificar o Comando do SIC e registrar a retenção:
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleIntercetar('SAIDA')}
                                            disabled={intercetando}
                                            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded shadow-xl transition-colors cursor-pointer"
                                        >
                                            Intercetado em Saída (Embarque)
                                        </button>
                                        <button
                                            onClick={() => handleIntercetar('ENTRADA')}
                                            disabled={intercetando}
                                            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded shadow-xl transition-colors cursor-pointer"
                                        >
                                            Intercetado em Entrada (Desembarque)
                                        </button>
                                    </div>
                                </div>

                                {mensagemSucesso && (
                                    <div className="p-4 bg-emerald-950 border border-emerald-500 rounded text-emerald-200 text-xs font-bold text-center">
                                        {mensagemSucesso}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Histórico de Interceções Recentes do Posto */}
                <div className="bg-[#132235] border border-[#223750] rounded p-4 font-mono text-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 border-b border-[#223750] pb-2">
                        Últimas Interceções Registadas no Posto
                    </h3>
                    <div className="divide-y divide-[#223750]/50">
                        {ultimas_intercepcoes && ultimas_intercepcoes.length > 0 ? (
                            ultimas_intercepcoes.map((it) => (
                                <div key={it.id} className="py-2.5 flex items-center justify-between text-slate-300">
                                    <div>
                                        <span className="font-bold text-rose-400">[{it.sentido}]</span>{' '}
                                        <span>Alvo: {it.mandado?.individuo?.nome_completo || 'Passageiro'}</span>{' '}
                                        <span className="text-slate-500">({it.mandado?.numero_mandado_oficial})</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        {new Date(it.created_at).toLocaleString('pt-AO')} — Op: {it.operador_sme_nip}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-slate-500 text-xs">
                                Nenhuma interceção registrada neste posto durante o turno atual.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
