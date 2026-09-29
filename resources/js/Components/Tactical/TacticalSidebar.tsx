import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    FileText,
    FolderGit2,
    Clock,
    Microscope,
    BarChart3,
    PlaneTakeoff,
    Scale,
    ShieldCheck,
    PlusCircle,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    Radio,
    Landmark,
} from 'lucide-react';
import { PageProps } from '@/types';

interface TacticalSidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export const TacticalSidebar: React.FC<TacticalSidebarProps> = ({
    collapsed = false,
    onToggle,
}) => {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const isSme = user?.perfil === 'OPERADOR_SME';
    const isPgr = user?.perfil === 'MAGISTRADO_PGR';
    const isAdmin = user?.perfil === 'ADMIN_SISTEMA' || user?.perfil === 'DIRETOR_NACIONAL';

    // Todas as seções e itens operacionais do SIGD-SIC sempre visíveis
    const sections: {
        section: string;
        items: {
            name: string;
            href: string;
            icon: any;
            active: boolean;
            highlight?: boolean;
            badge?: string;
            color?: string;
        }[];
    }[] = [
        {
            section: 'PAINEL GERAL & ESTATÍSTICA',
            items: [
                {
                    name: 'Estatísticas',
                    href: '/estatisticas',
                    icon: BarChart3,
                    active: url === '/estatisticas' || url.startsWith('/estatisticas'),
                },
            ],
        },
        {
            section: 'INVESTIGAÇÃO OPERACIONAL (SIC)',
            items: [
                {
                    name: 'Autos de Notícia',
                    href: '/ocorrencias',
                    icon: FileText,
                    active: url === '/ocorrencias' || (url.startsWith('/ocorrencias') && url !== '/ocorrencias/criar'),
                },
                {
                    name: 'Novo Auto de Notícia',
                    href: '/ocorrencias/criar',
                    icon: PlusCircle,
                    active: url === '/ocorrencias/criar',
                    highlight: true,
                },
                {
                    name: 'Processos-Crime',
                    href: '/processos',
                    icon: FolderGit2,
                    active: url.startsWith('/processos'),
                },
                {
                    name: 'Celas Transitórias (48h)',
                    href: '/detidos',
                    icon: Clock,
                    active: url.startsWith('/detidos'),
                },
                {
                    name: 'Criminalística Forense',
                    href: '/laboratorio',
                    icon: Microscope,
                    active: url.startsWith('/laboratorio'),
                },
                {
                    name: 'Juiz de Garantias (48h)',
                    href: '/garantias',
                    icon: Scale,
                    active: url.startsWith('/garantias'),
                    color: 'amber',
                },
                {
                    name: 'Telecom & CDR (ERB)',
                    href: '/telecom-cdr',
                    icon: Radio,
                    active: url.startsWith('/telecom-cdr'),
                },
                {
                    name: 'Investigação Financeira',
                    href: '/financeiro',
                    icon: Landmark,
                    active: url.startsWith('/financeiro'),
                },
            ],
        },
        {
            section: 'JANELAS FEDERADAS DE ACESSO',
            items: [
                {
                    name: 'Terminal SME (Fronteiras)',
                    href: '/sme/terminal',
                    icon: PlaneTakeoff,
                    active: url.startsWith('/sme'),
                    badge: '<300ms',
                    color: 'emerald',
                    highlight: isSme,
                },
                {
                    name: 'Janela da PGR (Mandados)',
                    href: '/magistratura',
                    icon: Scale,
                    active: url.startsWith('/magistratura'),
                    badge: 'PGR',
                    color: 'purple',
                    highlight: isPgr,
                },
            ],
        },
        {
            section: 'ADMINISTRAÇÃO & SISTEMA',
            items: [
                {
                    name: 'Auditoria SHA-256',
                    href: '/auditoria',
                    icon: ShieldCheck,
                    active: url.startsWith('/auditoria'),
                },
                {
                    name: 'Definições do Sistema',
                    href: '/definicoes',
                    icon: SlidersHorizontal,
                    active: url.startsWith('/definicoes'),
                },
            ],
        },
    ];

    return (
        <aside
            className={`${
                collapsed ? 'w-16' : 'w-72'
            } bg-[#09131d] border-r border-[#223750] flex flex-col shrink-0 select-none z-20 transition-all duration-200 h-full max-h-screen`}
        >
            {/* Lista com scroll independente */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {sections.map((sec, idx) => (
                    <div key={idx}>
                        {!collapsed && (
                            <div className="px-3 mb-1.5 text-[10px] font-sans uppercase tracking-wider text-slate-400 font-semibold truncate">
                                {sec.section}
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {sec.items.map((item) => {
                                const Icon = item.icon;
                                const isCurrent = item.active;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        title={collapsed ? item.name : undefined}
                                        className={`flex items-center ${
                                            collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                                        } rounded-md text-xs font-sans transition-all ${
                                            isCurrent
                                                ? 'bg-[#1a2e46] text-white font-semibold border-l-2 border-[#2563eb] shadow-sm'
                                                : 'text-slate-300 hover:text-white hover:bg-[#132235]'
                                        } ${
                                            item.highlight && !isCurrent
                                                ? 'bg-[#132235] text-[#dfc07a] border border-[#c5a059]/30 hover:border-[#c5a059]'
                                                : ''
                                        }`}
                                    >
                                        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'justify-center' : ''}`}>
                                            <Icon
                                                className={`w-4 h-4 shrink-0 ${
                                                    isCurrent ? 'text-sky-400' : item.highlight ? 'text-[#c5a059]' : 'text-slate-400'
                                                }`}
                                            />
                                            {!collapsed && <span className="truncate">{item.name}</span>}
                                        </div>

                                        {!collapsed && item.badge && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#132235] text-slate-400 border border-[#223750]">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Botão para colapsar/expandir na base do sidebar */}
            {onToggle && (
                <div className="px-3 py-2 border-t border-[#223750] bg-[#0b1622] flex items-center justify-between shrink-0">
                    {!collapsed ? (
                        <>
                            <span className="text-[10px] font-sans uppercase text-slate-400 font-semibold tracking-wider">
                                Menu Lateral
                            </span>
                            <button
                                type="button"
                                onClick={onToggle}
                                className="p-1.5 hover:bg-[#17283c] rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Recolher menu lateral"
                            >
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="w-full flex items-center justify-center p-1.5 hover:bg-[#17283c] rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Expandir menu lateral"
                        >
                            <ChevronRight className="w-4 h-4 text-[#c5a059]" />
                        </button>
                    )}
                </div>
            )}

            {/* Status fixo na base (só no modo expandido) */}
            {!collapsed && (
                <div className="p-3 border-t border-[#223750] bg-[#0d1a26] text-[11px] font-sans text-slate-400 space-y-1 shrink-0">
                    <div className="flex items-center justify-between">
                        <span>Barramento Central:</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                        <span>Criptografia:</span>
                        <span className="text-slate-300 font-mono">SHA-256 / WORM</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                        <span>Jurisdição:</span>
                        <span className="text-slate-300 font-medium">21 Províncias</span>
                    </div>
                </div>
            )}
        </aside>
    );
};
