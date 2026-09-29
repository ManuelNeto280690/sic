import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Shield, Search, UserCheck, LogOut, MapPin, Radio, KeyRound, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { PageProps } from '@/types';
import { HudConstitutional48h } from './HudConstitutional48h';
import { OmniboxModal } from './OmniboxModal';

interface TacticalHeaderProps {
    onToggleSidebar?: () => void;
    sidebarCollapsed?: boolean;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
    onToggleSidebar,
    sidebarCollapsed = false,
}) => {
    const { auth, provincias_lista } = usePage<PageProps & { provincias_lista: any[] }>().props;
    const user = auth.user;
    const activeProv = auth.active_provincia;

    const [isOmniboxOpen, setIsOmniboxOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    // Atalho global Ctrl + K
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOmniboxOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSwitchProvincia = (provId: string) => {
        router.visit(window.location.pathname + `?switch_provincia_id=${provId}`, {
            preserveState: false,
        });
    };

    const handleSwitchPerfil = (userId: string) => {
        router.post(route('profile.switch'), { user_id: userId }, {
            onSuccess: () => setProfileModalOpen(false),
        });
    };

    const demoUsers = [
        { id: '1', perfil: 'DIRETOR_NACIONAL', label: 'Diretor Nacional (Luanda Central)', nip: 'SIC-DIR-001' },
        { id: '2', perfil: 'INVESTIGADOR', label: 'Investigador (Luanda)', nip: 'SIC-INV-0042' },
        { id: '3', perfil: 'COMANDANTE_PROVINCIAL', label: 'Comando Provincial (Benguela)', nip: 'SIC-CMD-BGU' },
        { id: '4', perfil: 'OPERADOR_SME', label: 'Operador SME (Fronteira 4 de Fevereiro)', nip: 'SME-AER-007' },
        { id: '5', perfil: 'MAGISTRADO_PGR', label: 'Magistrado PGR (Ministério Público)', nip: 'PGR-MAG-0099' },
        { id: '6', perfil: 'ADMIN_SISTEMA', label: 'Administrador de Sistema (Cibersegurança)', nip: 'SIC-ADM-001' },
    ];

    return (
        <>
            <header className="h-14 bg-[#09131d] border-b border-[#223750] px-3 sm:px-6 flex items-center justify-between select-none z-30 sticky top-0">
                {/* Lado Esquerdo: Identidade Institucional & Província */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {onToggleSidebar && (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            className="p-1.5 bg-[#132235] hover:bg-[#1e334d] border border-[#223750] hover:border-[#c5a059]/60 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
                            title={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
                        >
                            {sidebarCollapsed ? (
                                <PanelLeftOpen className="w-4 h-4 text-[#c5a059]" />
                            ) : (
                                <PanelLeftClose className="w-4 h-4 text-slate-400" />
                            )}
                        </button>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#132235] border border-[#c5a059]/70 flex items-center justify-center text-[#c5a059] shadow-sm">
                            <Shield className="w-4 h-4 fill-[#c5a059]/20" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold tracking-wider text-slate-100 font-sans">SIGD-SIC</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-[#17283c] text-slate-300 rounded font-sans font-semibold border border-[#223750]">
                                    ANGOLA
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans tracking-normal font-medium">
                                Ministério do Interior • Serviço de Investigação Criminal
                            </div>
                        </div>
                    </div>

                    <div className="h-5 w-[1px] bg-[#223750] hidden sm:block"></div>

                    {/* Província Ativa / Seletor Nível Central */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs font-sans text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                        {user?.perfil === 'DIRETOR_NACIONAL' || user?.perfil === 'ADMIN_SISTEMA' ? (
                            <select
                                value={activeProv?.id || ''}
                                onChange={(e) => handleSwitchProvincia(e.target.value)}
                                className="bg-[#132235] border border-[#223750] text-slate-200 text-xs font-sans rounded-md px-2.5 py-1 focus:border-[#2563eb] focus:outline-none transition-colors"
                            >
                                <option value="">21 Províncias (Visão Nacional Transversal)</option>
                                {provincias_lista?.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} ({p.codigo_iso})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <span className="font-medium text-slate-200">
                                {activeProv?.nome ?? 'Nacional'} <span className="text-slate-400 font-normal">({user?.unidade?.sigla})</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Centro: Barra de Busca Rápida Omnibox (Ctrl + K) */}
                <div className="flex items-center justify-center flex-1 max-w-md mx-4">
                    <button
                        onClick={() => setIsOmniboxOpen(true)}
                        className="w-full flex items-center justify-between px-3 py-1.5 bg-[#132235] border border-[#223750] hover:border-slate-500 rounded-md text-xs text-slate-400 font-sans transition-all shadow-sm group"
                    >
                        <div className="flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                            <span className="truncate">Pesquisa Rápida Omnibox (BI, Processo, Lacre...)</span>
                        </div>
                        <kbd className="px-1.5 py-0.5 text-[10px] bg-[#17283c] text-slate-400 group-hover:text-slate-200 rounded border border-[#223750] font-mono">
                            Ctrl + K
                        </kbd>
                    </button>
                </div>

                {/* Lado Direito: HUD 48h, Perfil e Switcher */}
                <div className="flex items-center gap-3">
                    {/* HUD Prazos Constitucionais 48h */}
                    <HudConstitutional48h />

                    <div className="h-5 w-[1px] bg-[#223750] hidden sm:block"></div>

                    {/* Botão de Troca Rápida de Perfil */}
                    <button
                        onClick={() => setProfileModalOpen(true)}
                        title="Alternar Perfil para Homologação Operacional"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#132235] border border-[#223750] hover:border-slate-500 rounded-md text-xs font-sans text-slate-200 transition-colors"
                    >
                        <KeyRound className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span className="hidden xl:inline text-[11px] font-medium">{user?.perfil?.replace('_', ' ')}</span>
                    </button>

                    {/* Identificação do Operador */}
                    <div className="hidden lg:flex flex-col items-end leading-tight text-right">
                        <span className="text-xs font-medium text-slate-200 truncate max-w-[170px]">
                            {user?.nome_completo}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                            NIP: <span className="text-slate-200">{user?.nip}</span>
                        </span>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => router.post(route('logout'))}
                        title="Terminar Sessão"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-md border border-transparent hover:border-rose-900/40 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Modal de Busca Omnibox */}
            <OmniboxModal isOpen={isOmniboxOpen} onClose={() => setIsOmniboxOpen(false)} />

            {/* Modal de Homologação / Troca Rápida de Perfil */}
            {profileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-[#132235] border border-[#223750] rounded-lg p-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-[#223750]">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-[#c5a059]" />
                                <h3 className="text-sm font-semibold text-slate-100 font-sans">
                                    Troca de Perfil Operacional (Homologação)
                                </h3>
                            </div>
                            <button onClick={() => setProfileModalOpen(false)} className="text-slate-400 hover:text-slate-200 p-1">
                                ✕
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 mb-4 font-sans">
                            Selecione qualquer um dos perfis para testar as regras de acesso e janelas especializadas.
                        </p>
                        <div className="space-y-2">
                            {demoUsers.map((d) => (
                                <button
                                    key={d.nip}
                                    onClick={() => {
                                        router.post(route('login.post'), {
                                            identificador: d.nip,
                                            password: 'SicAngola#2026',
                                        }, {
                                            onSuccess: () => setProfileModalOpen(false),
                                        });
                                    }}
                                    className="w-full flex items-center justify-between p-3 bg-[#17283c] hover:bg-[#1e334d] border border-[#223750] hover:border-slate-500 rounded-md text-left transition-colors font-sans group"
                                >
                                    <div>
                                        <div className="text-xs font-semibold text-slate-100 group-hover:text-white">{d.label}</div>
                                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">NIP: {d.nip} • {d.perfil}</div>
                                    </div>
                                    <span className="text-xs text-slate-400 group-hover:text-slate-200">Selecionar →</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
