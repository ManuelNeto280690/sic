import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Shield, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface PerfilDemo {
    id: string;
    nip: string;
    nome: string;
    email: string;
    perfil: string;
    unidade?: string;
    provincia: string;
}

interface LoginProps {
    perfis_demo: PerfilDemo[];
}

export default function Login({ perfis_demo }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        identificador: 'SIC-DIR-001',
        password: 'SicAngola#2026',
    });

    const [selectedRole, setSelectedRole] = useState('SIC-DIR-001');

    const handleSelectDemo = (nip: string) => {
        setSelectedRole(nip);
        setData({
            identificador: nip,
            password: 'SicAngola#2026',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login.post'));
    };

    return (
        <div className="min-h-screen bg-[#0d1a26] text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans">
            {/* Linha de topo indicativa */}
            <div className="w-full max-w-4xl flex items-center justify-between py-2.5 px-4 mb-4 bg-[#132235] border border-[#223750] rounded-lg text-xs font-sans text-slate-300 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Servidor Nacional SIGD-SIC • Auditoria Imutável SHA-256 Ativa</span>
                </div>
                <div className="text-slate-200 font-semibold tracking-wide">República de Angola — MININT</div>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#132235] border border-[#223750] rounded-xl shadow-2xl p-6 md:p-8">
                {/* Coluna Esquerda: Formulário de Autenticação */}
                <div className="md:col-span-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#223750] pb-6 md:pb-0 md:pr-8">
                    <div>
                        <div className="flex items-center gap-3.5 mb-6">
                            <div className="w-11 h-11 rounded-lg bg-[#17283c] border border-[#c5a059]/60 flex items-center justify-center text-[#c5a059] shadow-sm">
                                <Shield className="w-6 h-6 fill-[#c5a059]/20" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-wide text-slate-100 font-sans">SIGD-SIC</h1>
                                <p className="text-xs text-slate-400 font-sans">Sistema Integrado de Gestão de Dados Forenses</p>
                            </div>
                        </div>

                        {errors.identificador && (
                            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-sans rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{errors.identificador}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-sans font-medium text-slate-300 mb-1.5">
                                    NIP Operacional ou E-mail Institucional
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.identificador}
                                        onChange={(e) => setData('identificador', e.target.value)}
                                        placeholder="Ex: SIC-INV-0042 ou investigador@sic.gov.ao"
                                        required
                                        className="w-full bg-[#0d1a26] border border-[#223750] focus:border-[#2563eb] text-slate-100 pl-10 pr-3 py-2.5 text-xs font-sans rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-sans font-medium text-slate-300 mb-1.5">
                                    Senha Operacional
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="w-full bg-[#0d1a26] border border-[#223750] focus:border-[#2563eb] text-slate-100 pl-10 pr-3 py-2.5 text-xs font-sans rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563eb] transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-sans font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
                            >
                                <span>{processing ? 'A validar credenciais...' : 'Aceder ao Sistema'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#223750] text-[11px] font-sans text-slate-400 flex items-center justify-between">
                        <span>Acesso restrito e auditado</span>
                        <span className="font-mono text-slate-400">v2.0 Segura</span>
                    </div>
                </div>

                {/* Coluna Direita: Seleção Rápida para Homologação */}
                <div className="md:col-span-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                                Perfis Pré-Configurados (Homologação)
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mb-3 leading-relaxed">
                            Selecione um perfil operacional para autenticar e testar as três janelas federadas (SIC, SME e PGR):
                        </p>

                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {perfis_demo.map((p) => {
                                const isSelected = selectedRole === p.nip;
                                return (
                                    <div
                                        key={p.nip}
                                        onClick={() => handleSelectDemo(p.nip)}
                                        className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-[#1a2e46] border-[#2563eb] text-slate-100 shadow-sm'
                                                : 'bg-[#17283c] border-[#223750] text-slate-300 hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium truncate font-sans">{p.nome}</span>
                                            <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-[#0d1a26] text-slate-300 border border-[#223750]">
                                                {p.perfil.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-sans text-slate-400">
                                            <span className="font-mono">NIP: {p.nip}</span>
                                            <span>{p.provincia}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 p-2.5 bg-[#0d1a26] border border-[#223750] rounded-lg text-xs font-sans text-slate-400">
                        <span className="text-slate-200 font-semibold">Registo Criptográfico:</span> Todos os acessos são encadeados via hash SHA-256 no registo imutável de auditoria.
                    </div>
                </div>
            </div>
        </div>
    );
}
