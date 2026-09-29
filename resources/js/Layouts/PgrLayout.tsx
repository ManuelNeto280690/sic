import React from 'react';
import { usePage, router } from '@inertiajs/react';
import { Scale, LogOut, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { PageProps } from '@/types';
import { LegalCopilotDrawer } from '@/Components/Copilot/LegalCopilotDrawer';

interface PgrLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export const PgrLayout: React.FC<PgrLayoutProps> = ({
    title = 'Janela da PGR',
    children,
}) => {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth?.user;

    return (
        <div className="min-h-screen bg-[#0d1a26] text-slate-100 flex flex-col font-sans select-none antialiased">
            {/* CABEÇALHO DA PROCURADORIA-GERAL DA REPÚBLICA (TEMA AZUL LIMPO) */}
            <header className="h-14 bg-[#132235] border-b border-[#223750] px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                {/* Lado Esquerdo: Identidade Institucional PGR */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#1a2e46] border border-[#2563eb]/50 flex items-center justify-center text-blue-400">
                        <Scale className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tracking-wider text-slate-100 font-sans uppercase">
                                PROCURADORIA-GERAL DA REPÚBLICA
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#0d1a26] text-blue-300 font-mono rounded border border-[#223750]">
                                MINISTÉRIO PÚBLICO
                            </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                            Magistratura Judicial • Fiscalização da Legalidade e Mandados
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Identificação do Magistrado e Ações */}
                <div className="flex items-center gap-4 text-xs font-sans">
                    <div className="text-right">
                        <div className="text-slate-200 font-medium">
                            {user?.nome_completo || 'Magistrado do Ministério Público'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                            NIP: {user?.nip || 'PGR-MAG-0099'}
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-[#223750]"></div>

                    <button
                        onClick={() => router.post(route('logout'))}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Terminar Sessão"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* MENSAGENS FLASH */}
            {flash?.success && (
                <div className="max-w-7xl mx-auto w-full px-6 pt-4">
                    <div className="p-3 bg-emerald-950/70 border border-emerald-700/80 text-emerald-200 rounded text-xs font-mono flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash?.error && (
                <div className="max-w-7xl mx-auto w-full px-6 pt-4">
                    <div className="p-3 bg-rose-950/80 border border-rose-700/80 text-rose-200 rounded text-xs font-mono flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}
            {flash?.alert && (
                <div className="max-w-7xl mx-auto w-full px-6 pt-4">
                    <div className="p-3 bg-amber-950/80 border border-amber-700/80 text-amber-200 rounded text-xs font-mono flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{flash.alert}</span>
                    </div>
                </div>
            )}

            {/* CONTEÚDO PRINCIPAL LIMPO */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
                {children}
            </main>

            {/* RODAPÉ DISCRETO */}
            <footer className="border-t border-[#223750] bg-[#0d1a26] px-6 py-3 text-xs text-slate-500 font-sans">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px]">
                    <span>Procuradoria-Geral da República • República de Angola</span>
                    <span className="font-mono text-slate-600">SIC-SIGD v2.0</span>
                </div>
            </footer>

            {/* COPILOTO JURÍDICO IA APIDOT (gemini-3.5-flash) */}
            <LegalCopilotDrawer />
        </div>
    );
};
