import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import { Users, Phone, FileText, UserCheck, Shield, Plus, Save, Clock, AlertTriangle } from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface IntervenientesProps {
    processo: ProcessoCrime;
}

export default function ProcessosIntervenientes({ processo }: IntervenientesProps) {
    const [showForm, setShowForm] = useState(false);
    const intervenientes = processo.ocorrencia?.intervenientes || [];
    const detencoes = processo.detencoes || [];

    const { data, setData, post, processing, reset, errors } = useForm({
        nome_identificativo: '',
        papel: 'ARGUIDO',
        numero_bi: '',
        contacto_telefone: '',
        declaracoes_resumo: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('processos.intervenientes.store', processo.id), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <TacticalLayout title={`Proc. ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Cabeçalho Institucional & As 6 Sub-Abas Oficiais */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="intervenientes"
                    actions={
                        <button
                            type="button"
                            onClick={() => setShowForm(!showForm)}
                            className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>{showForm ? 'Fechar Cadastro' : 'Adicionar Interveniente'}</span>
                        </button>
                    }
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">
                            Rol de Intervenientes Processuais ({intervenientes.length + detencoes.length})
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Arguidos, ofendidos, testemunhas e declarantes vinculados aos autos de inquérito
                        </p>
                    </div>
                </div>

                {/* Formulário de Registo de Novo Interveniente */}
                {showForm && (
                    <TacticalCard
                        title="Registar Interveniente no Inquérito"
                        icon={<UserCheck className="w-4 h-4 text-[#c5a059]" />}
                    >
                        <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Nome Completo / Identificativo
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nome_identificativo}
                                        onChange={(e) => setData('nome_identificativo', e.target.value)}
                                        placeholder="Ex: João Baptista Silva"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                    {errors.nome_identificativo && (
                                        <span className="text-rose-400 text-[10px] mt-1 block">{errors.nome_identificativo}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Papel Processual
                                    </label>
                                    <select
                                        value={data.papel}
                                        onChange={(e) => setData('papel', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="ARGUIDO">Arguido (Indiciado)</option>
                                        <option value="VITIMA">Vítima / Ofendido</option>
                                        <option value="TESTEMUNHA">Testemunha</option>
                                        <option value="DECLARANTE">Declarante</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Número do Bilhete de Identidade (BI)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.numero_bi}
                                        onChange={(e) => setData('numero_bi', e.target.value)}
                                        placeholder="Ex: 005421980LA048"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059] font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Contacto Telefónico
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contacto_telefone}
                                        onChange={(e) => setData('contacto_telefone', e.target.value)}
                                        placeholder="Ex: +244 923 000 111"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Síntese das Declarações ou Razão da Intervenção
                                    </label>
                                    <input
                                        type="text"
                                        value={data.declaracoes_resumo}
                                        onChange={(e) => setData('declaracoes_resumo', e.target.value)}
                                        placeholder="Ex: Declarante presencial na altura dos factos investigados..."
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#20344d]">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded border border-[#20344d]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#d6b26c] text-[#0b131e] font-bold rounded flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{processing ? 'Gravando...' : 'Gravar Interveniente'}</span>
                                </button>
                            </div>
                        </form>
                    </TacticalCard>
                )}

                {/* Secção de Arguidos Detidos em Celas Transitórias */}
                {detencoes.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase font-semibold tracking-wider text-amber-400 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Arguidos sob Custódia Policial (Celas 48h)</span>
                            </span>
                            <Link href={route('detidos.index')} className="text-xs text-[#c5a059] hover:underline">
                                Ver Gestão de Celas
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {detencoes.map((det) => (
                                <TacticalCard
                                    key={det.id}
                                    title={det.individuo?.nome_completo || 'Indivíduo Detido'}
                                    badge={
                                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-950/80 text-amber-300 border border-amber-700">
                                            ARGUIDO DETIDO (48H)
                                        </span>
                                    }
                                    icon={<Clock className="w-4 h-4 text-amber-400" />}
                                >
                                    <div className="space-y-2 text-xs">
                                        <div className="p-2.5 bg-[#0d1a26] border border-[#20344d] rounded space-y-1">
                                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Identificação e Prazos:</div>
                                            <div className="text-slate-200">BI: <strong className="font-mono">{det.individuo?.numero_bi || 'Não Consta'}</strong></div>
                                            <div className="text-slate-300">
                                                Prazo Constitucional: <strong className="font-mono text-amber-300">{new Date(det.limite_legal_48h || det.created_at).toLocaleString('pt-AO')}</strong>
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Motivo: {det.motivo_detencao}
                                            </div>
                                        </div>
                                    </div>
                                </TacticalCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rol Geral de Intervenientes */}
                {intervenientes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {intervenientes.map((int) => (
                            <TacticalCard
                                key={int.id}
                                title={int.nome_identificativo}
                                badge={
                                    <span className="px-2 py-0.5 text-[10px] font-sans font-medium rounded bg-[#0d1a26] text-[#c5a059] border border-[#20344d]">
                                        {int.papel}
                                    </span>
                                }
                                icon={<Users className="w-4 h-4 text-[#c5a059]" />}
                            >
                                <div className="space-y-2.5 text-xs">
                                    {int.contacto_telefone && (
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{int.contacto_telefone}</span>
                                        </div>
                                    )}

                                    {int.individuo && (
                                        <div className="p-2.5 bg-[#0d1a26] border border-[#20344d] rounded space-y-1">
                                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Dados de Identificação:</div>
                                            <div className="text-slate-200">BI: {int.individuo.numero_bi || 'Não consta'}</div>
                                            {int.individuo.data_nascimento && (
                                                <div className="text-[11px] text-slate-400">
                                                    Nasc: {int.individuo.data_nascimento}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {int.declaracoes_resumo && (
                                        <div className="p-2.5 bg-[#0d1a26]/70 border border-[#20344d] rounded text-slate-300 text-xs leading-relaxed">
                                            <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Síntese das Declarações:</div>
                                            <p>{int.declaracoes_resumo}</p>
                                        </div>
                                    )}
                                </div>
                            </TacticalCard>
                        ))}
                    </div>
                ) : detencoes.length === 0 ? (
                    <div className="p-8 bg-[#122235] border border-[#20344d] rounded-md text-center text-slate-400 text-xs">
                        Nenhum interveniente cadastrado até ao momento neste inquérito.
                    </div>
                ) : null}
            </div>
        </TacticalLayout>
    );
}
