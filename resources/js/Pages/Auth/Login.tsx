import React from 'react';
import { useForm } from '@inertiajs/react';
import { Shield, Lock, User, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        identificador: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login.post'));
    };

    return (
        <div className="min-h-screen bg-[#080e16] text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans">
            {/* Linha de topo: Indicador de Segurança e Jurisdição */}
            <div className="w-full max-w-md flex items-center justify-between py-2 px-4 mb-4 bg-[#0d1622] border border-[#1b2b3d] rounded-lg text-xs text-slate-400 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-mono text-[11px]">NÓ CENTRAL • AUDITORIA SHA-256 ATIVA</span>
                </div>
                <div className="text-slate-300 font-medium text-[11px]">MININT • ANGOLA</div>
            </div>

            {/* Cartão Central de Login Oficial */}
            <div className="w-full max-w-md bg-[#0f1b29] border border-[#20344d] rounded-2xl shadow-2xl p-8 space-y-6">
                {/* Cabeçalho Institucional */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-[#142334] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] shadow-lg">
                        <Shield className="w-8 h-8 fill-[#c5a059]/15" />
                    </div>

                    <div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-[#c5a059] font-bold">
                            República de Angola &bull; Ministério do Interior
                        </div>
                        <h1 className="text-lg font-bold text-slate-100 uppercase tracking-wide mt-1">
                            Serviço de Investigação Criminal
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Sistema Integrado de Gestão Delituosa & Investigação Forense (SIGD-SIC)
                        </p>
                    </div>
                </div>

                {/* Mensagens de Erro de Validação */}
                {errors.identificador && (
                    <div className="p-3 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs rounded-lg flex items-center gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{errors.identificador}</span>
                    </div>
                )}

                {/* Formulário de Credenciais */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            NIP Operacional ou E-mail Institucional
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={data.identificador}
                                onChange={(e) => setData('identificador', e.target.value)}
                                placeholder="Insira o seu NIP ou email institucional"
                                required
                                autoFocus
                                autoComplete="username"
                                className="w-full bg-[#09111c] border border-[#20344d] focus:border-[#c5a059] text-slate-100 pl-10 pr-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Palavra-passe / Chave de Acesso
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <KeyRound className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Insira a sua senha operacional"
                                required
                                autoComplete="current-password"
                                className="w-full bg-[#09111c] border border-[#20344d] focus:border-[#c5a059] text-slate-100 pl-10 pr-3.5 py-2.5 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 px-4 bg-[#c5a059] hover:bg-[#d6b26c] disabled:opacity-50 text-[#0b131e] font-bold text-xs rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                        <span>{processing ? 'A validar credenciais...' : 'Entrar no Sistema'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* Nota Legal e de Segurança */}
                <div className="pt-4 border-t border-[#1b2b3d] text-[11px] text-slate-400 text-center leading-relaxed">
                    <p>
                        Acesso estritamente restrito a investigadores, peritos e magistrados credenciados. Todas as sessões e consultas aos inquéritos são registadas de forma imutável.
                    </p>
                </div>
            </div>

            {/* Rodapé Informativo */}
            <div className="mt-6 text-[11px] text-slate-500 font-mono text-center">
                Direcção Nacional de Telecomunicações e Tecnologias de Informação &bull; SIC &bull; 2026
            </div>
        </div>
    );
}
