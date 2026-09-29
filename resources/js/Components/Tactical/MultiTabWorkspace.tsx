import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    X,
    FileText,
    FolderOpen,
    Shield,
    BarChart3,
    Clock,
    Microscope,
    ShieldCheck,
    Scale,
    PlaneTakeoff,
    SlidersHorizontal,
} from 'lucide-react';
import { getTabsState, saveTabsState } from '@/Services/indexedDbStorage';

export type TabType =
    | 'estatistica'
    | 'ocorrencia'
    | 'processo'
    | 'detidos'
    | 'laboratorio'
    | 'auditoria'
    | 'magistratura'
    | 'sme'
    | 'definicoes'
    | 'geral';

export interface WorkspaceTab {
    id: string;
    title: string;
    url: string;
    type: TabType;
}

interface MultiTabWorkspaceProps {
    currentUrl: string;
    currentTitle?: string;
}

/**
 * Extrai o caminho base (sem parâmetros de consulta nem hash)
 * Ex: '/estatisticas?data_inicio=2026-09-01' -> '/estatisticas'
 */
export const getBasePath = (url: string): string => {
    if (!url) return '';
    return url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
};

/**
 * Determina a chave canónica de agrupamento da aba.
 * Agrupa todas as sub-rotas de um mesmo processo-crime ou auto na mesma aba permanente.
 */
export const getCanonicalTabKey = (url: string): string => {
    const base = getBasePath(url);
    const matchProc = base.match(/^\/processos\/([a-zA-Z0-9\-]+)/);
    if (matchProc && matchProc[1] !== 'criar' && matchProc[1] !== 'instaurar') {
        return `/processos/${matchProc[1]}`;
    }
    const matchOcorr = base.match(/^\/ocorrencias\/([a-zA-Z0-9\-]+)/);
    if (matchOcorr && matchOcorr[1] !== 'criar') {
        return `/ocorrencias/${matchOcorr[1]}`;
    }
    return base;
};

/**
 * Determina o tipo e ícone da aba com base na rota
 */
export const getTabType = (url: string): TabType => {
    const path = getBasePath(url);
    if (path.startsWith('/estatisticas')) return 'estatistica';
    if (path.startsWith('/processos')) return 'processo';
    if (path.startsWith('/ocorrencias')) return 'ocorrencia';
    if (path.startsWith('/detidos')) return 'detidos';
    if (path.startsWith('/laboratorio')) return 'laboratorio';
    if (path.startsWith('/auditoria')) return 'auditoria';
    if (path.startsWith('/magistratura')) return 'magistratura';
    if (path.startsWith('/sme')) return 'sme';
    if (path.startsWith('/definicoes')) return 'definicoes';
    return 'geral';
};

/**
 * Remove abas duplicadas que apontem para a mesma entidade ou página base
 */
const sanitizeTabs = (tabsToClean: WorkspaceTab[]): WorkspaceTab[] => {
    const seenKeys = new Set<string>();
    const cleaned: WorkspaceTab[] = [];
    for (const tab of tabsToClean) {
        if (!tab || !tab.url) continue;
        const key = getCanonicalTabKey(tab.url);
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            cleaned.push({
                ...tab,
                id: tab.id || `tab-${key.replace(/[^a-zA-Z0-9]/g, '_')}`,
                type: getTabType(tab.url),
            });
        }
    }
    return cleaned;
};

export const MultiTabWorkspace: React.FC<MultiTabWorkspaceProps> = ({ currentUrl, currentTitle }) => {
    const [tabs, setTabs] = useState<WorkspaceTab[]>([]);

    useEffect(() => {
        const currentKey = getCanonicalTabKey(currentUrl);
        if (!currentKey) return;

        getTabsState().then((storedTabs) => {
            let loadedTabs: WorkspaceTab[] = [];
            if (storedTabs && Array.isArray(storedTabs) && storedTabs.length > 0) {
                loadedTabs = sanitizeTabs(storedTabs);
            }

            // Se ainda não houver abas guardadas, inicia com a página atual
            if (loadedTabs.length === 0) {
                loadedTabs = [
                    {
                        id: `tab-${currentKey.replace(/[^a-zA-Z0-9]/g, '_')}`,
                        title: currentTitle || 'Visão Geral',
                        url: currentUrl,
                        type: getTabType(currentUrl),
                    },
                ];
            }

            // Verifica se já existe uma aba para esta mesma entidade (ex: mesmo processo ou página)
            const existingTabIndex = loadedTabs.findIndex(
                (t) => getCanonicalTabKey(t.url) === currentKey
            );

            let updated: WorkspaceTab[];
            if (existingTabIndex >= 0) {
                // REUTILIZA A ABA EXISTENTE:
                // Atualiza a URL ativa (mantendo a aba permanente no mesmo lugar)
                // Se a aba já tiver o título oficial do processo (ex: "Proc. ..."), preserva-o
                updated = loadedTabs.map((tab, idx) => {
                    if (idx === existingTabIndex) {
                        const isSubpage = currentUrl.includes('/intervenientes') ||
                            currentUrl.includes('/diligencias') ||
                            currentUrl.includes('/pecas-autos') ||
                            currentUrl.includes('/provas-custodia') ||
                            currentUrl.includes('/remessa-pgr');

                        return {
                            ...tab,
                            url: currentUrl,
                            title: (isSubpage && tab.title.startsWith('Proc.')) ? tab.title : (currentTitle || tab.title),
                            type: getTabType(currentUrl),
                        };
                    }
                    return tab;
                });
            } else if (currentTitle) {
                // Nova aba
                const newTab: WorkspaceTab = {
                    id: `tab-${currentKey.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}`,
                    title: currentTitle,
                    url: currentUrl,
                    type: getTabType(currentUrl),
                };
                updated = [...loadedTabs, newTab];
            } else {
                updated = loadedTabs;
            }
            const finalTabs = sanitizeTabs(updated);
            setTabs(finalTabs);
            saveTabsState(finalTabs);
        });
    }, [currentUrl, currentTitle]);

    const closeTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const tabToClose = tabs.find((t) => t.id === id);
        const filtered = tabs.filter((t) => t.id !== id);
        setTabs(filtered);
        saveTabsState(filtered);

        // Só redireciona se a aba que foi fechada for a que o utilizador está a visualizar
        if (tabToClose && getBasePath(tabToClose.url) === getBasePath(currentUrl)) {
            if (filtered.length > 0) {
                router.visit(filtered[filtered.length - 1].url);
            } else {
                router.visit('/ocorrencias');
            }
        }
    };

    const currentKey = getCanonicalTabKey(currentUrl);

    const selectTab = (targetUrl: string) => {
        // Se clicar numa aba de entidade diferente da atual, navega para essa aba
        if (getCanonicalTabKey(targetUrl) !== currentKey) {
            router.visit(targetUrl);
        }
    };

    const renderIcon = (type: TabType) => {
        switch (type) {
            case 'estatistica':
                return <BarChart3 className="w-3.5 h-3.5 text-[#c5a059]" />;
            case 'processo':
                return <FolderOpen className="w-3.5 h-3.5 text-[#c5a059]" />;
            case 'ocorrencia':
                return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
            case 'detidos':
                return <Clock className="w-3.5 h-3.5 text-amber-400" />;
            case 'laboratorio':
                return <Microscope className="w-3.5 h-3.5 text-cyan-400" />;
            case 'auditoria':
                return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
            case 'magistratura':
                return <Scale className="w-3.5 h-3.5 text-purple-400" />;
            case 'sme':
                return <PlaneTakeoff className="w-3.5 h-3.5 text-emerald-400" />;
            case 'definicoes':
                return <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />;
            default:
                return <Shield className="w-3.5 h-3.5 text-sky-400" />;
        }
    };

    if (tabs.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center bg-[#0d1a26] border-b border-[#223750] px-3 pt-1.5 gap-1.5 overflow-x-auto select-none no-scrollbar print:hidden no-print">
            {tabs.map((tab) => {
                const isActive = getCanonicalTabKey(tab.url) === currentKey;
                return (
                    <div
                        key={tab.id}
                        onClick={() => selectTab(tab.url)}
                        title={tab.title}
                        className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-sans rounded-t-md border-t border-x cursor-pointer transition-colors ${
                            isActive
                                ? 'bg-[#132235] border-[#223750] text-slate-100 font-semibold relative after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-[#132235]'
                                : 'bg-[#09131d] border-transparent text-slate-400 hover:bg-[#132235]/60 hover:text-slate-200'
                        }`}
                    >
                        {renderIcon(tab.type)}

                        <span className="truncate max-w-[150px]">{tab.title}</span>

                        {tabs.length > 1 && (
                            <button
                                onClick={(e) => closeTab(e, tab.id)}
                                title="Fechar aba"
                                className="opacity-40 group-hover:opacity-100 hover:text-rose-400 rounded p-0.5 ml-1 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

