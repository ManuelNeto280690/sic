import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    FolderGit2,
    Users,
    Activity,
    FileEdit,
    Lock,
    Send,
    Shield,
    Clock,
} from 'lucide-react';
import { ProcessoCrime } from '@/types';
import { StatusBadge } from '@/Components/UI/StatusBadge';
import { Network, QrCode, Scale, Radio, Landmark } from 'lucide-react';

interface ProcessoHeaderTabsProps {
    processo: ProcessoCrime;
    activeTab: 'show' | 'intervenientes' | 'diligencias' | 'pecas' | 'custodia' | 'vinculos' | 'certidao' | 'garantias' | 'telecom' | 'financeiro' | 'remessa';
    actions?: React.ReactNode;
}

export const ProcessoHeaderTabs: React.FC<ProcessoHeaderTabsProps> = ({
    processo,
    activeTab,
    actions,
}) => {
    const tabs = [
        {
            key: 'show',
            name: 'Ficha Geral',
            href: route('processos.show', processo.id),
            icon: FolderGit2,
            active: activeTab === 'show',
        },
        {
            key: 'intervenientes',
            name: 'Intervenientes',
            href: route('processos.intervenientes', processo.id),
            icon: Users,
            active: activeTab === 'intervenientes',
            badge: ((processo.ocorrencia?.intervenientes?.length || 0) + (processo.detencoes?.length || 0)) || undefined,
        },
        {
            key: 'diligencias',
            name: 'Diário de Diligências',
            href: route('processos.diligencias', processo.id),
            icon: Activity,
            active: activeTab === 'diligencias',
            badge: processo.diligencias?.length,
        },
        {
            key: 'pecas',
            name: 'Redação de Peças',
            href: route('processos.pecas-autos', processo.id),
            icon: FileEdit,
            active: activeTab === 'pecas',
        },
        {
            key: 'custodia',
            name: 'Cadeia de Custódia',
            href: route('processos.provas-custodia', processo.id),
            icon: Lock,
            active: activeTab === 'custodia',
            badge: processo.bens?.length,
        },
        {
            key: 'vinculos',
            name: 'Análise de Vínculos',
            href: route('processos.vinculos', processo.id),
            icon: Network,
            active: activeTab === 'vinculos',
        },
        {
            key: 'garantias',
            name: 'Juiz de Garantias (48h)',
            href: route('processos.garantias', processo.id),
            icon: Scale,
            active: activeTab === 'garantias',
        },
        {
            key: 'telecom',
            name: 'Telecom & CDR',
            href: route('processos.telecom-cdr', processo.id),
            icon: Radio,
            active: activeTab === 'telecom',
        },
        {
            key: 'financeiro',
            name: 'Investigação Financeira',
            href: route('processos.financeiro', processo.id),
            icon: Landmark,
            active: activeTab === 'financeiro',
        },
        {
            key: 'certidao',
            name: 'Certidão Oficial (QR)',
            href: route('processos.certidao', processo.id),
            icon: QrCode,
            active: activeTab === 'certidao',
        },
        {
            key: 'remessa',
            name: 'Remessa ao MP',
            href: route('processos.remessa-pgr', processo.id),
            icon: Send,
            active: activeTab === 'remessa',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Cabeçalho Institucional do Processo */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#20344d] pb-4">
                <div className="flex items-start gap-3">
                    <Link
                        href={route('processos.index')}
                        className="p-2 bg-[#122235] hover:bg-[#1a314d] text-slate-300 hover:text-white rounded-md border border-[#20344d] transition-colors shrink-0 mt-0.5"
                        title="Voltar à Carteira de Processos-Crime"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400">
                                Inquérito Preparatório
                            </span>
                            <span className="text-base font-bold font-mono text-slate-100 tracking-wide">
                                {processo.numero_processo}
                            </span>
                            <StatusBadge status={processo.estado} type="processo" />
                            {processo.segredo_justica && (
                                <span className="px-2 py-0.5 text-[10px] font-sans font-bold bg-rose-950/80 text-rose-300 rounded border border-rose-800 tracking-wide">
                                    SEGREDO DE JUSTIÇA
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-sans text-slate-400">
                            <span className="text-slate-200 font-medium">{processo.tipologia_legal}</span>
                            <span>•</span>
                            <span>Jurisdição: <strong className="text-slate-300 font-normal">{processo.provincia?.nome || 'Nacional'}</strong></span>
                            {processo.unidade?.sigla && (
                                <>
                                    <span>•</span>
                                    <span className="text-slate-400 font-mono text-[11px]">{processo.unidade.sigla}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-center">
                    {actions}
                </div>
            </div>

            {/* As 6 Sub-Abas do Processo-Crime (Nunca desaparecem em nenhuma sub-página) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0 border-b border-[#20344d] select-none no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-md text-xs font-sans font-medium border-t border-x transition-all whitespace-nowrap relative ${
                                tab.active
                                    ? 'bg-[#122235] text-white border-[#20344d] font-semibold border-b-[#122235] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-[#c5a059]'
                                    : 'bg-[#09131d] text-slate-400 border-transparent hover:bg-[#122235]/60 hover:text-slate-200'
                            }`}
                        >
                            <Icon
                                className={`w-3.5 h-3.5 shrink-0 ${
                                    tab.active ? 'text-[#c5a059]' : 'text-slate-400'
                                }`}
                            />
                            <span>{tab.name}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span
                                    className={`px-1.5 py-0.2 text-[10px] font-mono rounded border ${
                                        tab.active
                                            ? 'bg-[#0d1a26] text-[#c5a059] border-[#c5a059]/40'
                                            : 'bg-[#122235] text-slate-400 border-[#20344d]'
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
