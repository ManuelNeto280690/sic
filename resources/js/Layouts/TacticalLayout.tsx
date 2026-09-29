import React from 'react';
import { usePage } from '@inertiajs/react';
import { TacticalHeader } from '@/Components/Tactical/TacticalHeader';
import { TacticalSidebar } from '@/Components/Tactical/TacticalSidebar';
import { MultiTabWorkspace } from '@/Components/Tactical/MultiTabWorkspace';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { PageProps } from '@/types';
import { LegalCopilotDrawer } from '@/Components/Copilot/LegalCopilotDrawer';

interface TacticalLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export const TacticalLayout: React.FC<TacticalLayoutProps> = ({ title, children }) => {
    const { url } = usePage();
    const { flash } = usePage<PageProps>().props;

    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sic_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sic_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

    return (
        <div className="h-screen w-full overflow-hidden bg-[#0d1a26] text-slate-100 flex flex-col font-sans antialiased">
            {/* Cabeçalho Institucional Fixo no Topo com HUD 48h */}
            <div className="shrink-0 z-30 print:hidden no-print">
                <TacticalHeader onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            </div>

            <div className="flex-1 flex overflow-hidden min-h-0 print:overflow-visible print:block">
                {/* Barra Lateral Solene Fixa à Esquerda */}
                <div className="h-full shrink-0 print:hidden no-print">
                    <TacticalSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
                </div>

                {/* Área de Trabalho Principal com Scroll Próprio e Multi-Abas */}
                <main className="flex-1 flex flex-col min-w-0 min-h-0 h-full bg-[#0d1a26] overflow-y-auto print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
                    {/* Workspace Multi-Abas (IndexedDB) */}
                    <div className="shrink-0 print:hidden no-print sticky top-0 z-20 bg-[#0d1a26]">
                        <MultiTabWorkspace currentUrl={url} currentTitle={title} />
                    </div>

                    {/* Mensagens Flash */}
                    {flash?.success && (
                        <div className="m-4 mb-0 p-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 rounded-[3px] text-xs font-mono flex items-center gap-2 shadow-lg animate-in fade-in duration-150 print:hidden no-print">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="m-4 mb-0 p-3 bg-rose-950/80 border border-rose-700/80 text-rose-200 rounded-[3px] text-xs font-mono flex items-center gap-2 shadow-lg animate-in fade-in duration-150 print:hidden no-print">
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    )}
                    {flash?.alert && (
                        <div className="m-4 mb-0 p-3 bg-amber-950/80 border border-amber-700/80 text-amber-200 rounded-[3px] text-xs font-mono flex items-center gap-2 shadow-lg animate-in fade-in duration-150 print:hidden no-print">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{flash.alert}</span>
                        </div>
                    )}

                    {/* Conteúdo da Página */}
                    <div className="p-4 sm:p-6 flex-1 print:p-0 print:m-0 print:block">{children}</div>
                </main>
            </div>

            {/* COPILOTO JURÍDICO IA APIDOT (gemini-3.5-flash) */}
            <div className="print:hidden no-print">
                <LegalCopilotDrawer />
            </div>
        </div>
    );
};
