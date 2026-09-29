import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import { Activity, Plus, Save, Calendar, CheckCircle2 } from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface DiligenciasProps {
    processo: ProcessoCrime;
}

export default function ProcessosDiligencias({ processo }: DiligenciasProps) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        tipo: 'Busca e Apreensão Domiciliária',
        descricao_detalhada: '',
        resultado: '',
        data_realizacao: new Date().toISOString().slice(0, 16),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('processos.diligencias.store', processo.id), {
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
                    activeTab="diligencias"
                    actions={
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>{showForm ? 'Fechar Registo' : 'Nova Diligência'}</span>
                        </button>
                    }
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">
                            Diário Oficial de Diligências de Instrução ({processo.diligencias?.length || 0})
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Registo cronológico de buscas, exames de local, reconhecimentos e inquirições
                        </p>
                    </div>
                </div>

                {/* Formulário de Nova Diligência */}
                {showForm && (
                    <TacticalCard title="Lavrar Registo de Diligência de Investigação" icon={<Activity className="w-4 h-4 text-[#c5a059]" />}>
                        <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Tipo de Acto / Diligência</label>
                                    <select
                                        value={data.tipo}
                                        onChange={(e) => setData('tipo', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="Busca e Apreensão Domiciliária">Busca e Apreensão Domiciliária</option>
                                        <option value="Auto de Interrogatório de Arguido">Auto de Interrogatório de Arguido</option>
                                        <option value="Auto de Inquirição de Testemunha">Auto de Inquirição de Testemunha</option>
                                        <option value="Auto de Reconhecimento Presencial">Auto de Reconhecimento Presencial</option>
                                        <option value="Inspeção e Exame do Local do Crime">Inspeção e Exame do Local do Crime</option>
                                        <option value="Vigilância e Rastreio Operacional">Vigilância e Rastreio Operacional</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Data e Hora de Execução</label>
                                    <input
                                        type="datetime-local"
                                        value={data.data_realizacao}
                                        onChange={(e) => setData('data_realizacao', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059] [color-scheme:dark]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Descrição Circunstanciada dos Factos e Actos Praticados</label>
                                <textarea
                                    value={data.descricao_detalhada}
                                    onChange={(e) => setData('descricao_detalhada', e.target.value)}
                                    rows={3}
                                    placeholder="Descreva pormenorizadamente o desenrolar da diligência policial..."
                                    className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059] leading-relaxed"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Resultado da Diligência & Elementos Probantes Colhidos</label>
                                <input
                                    type="text"
                                    value={data.resultado}
                                    onChange={(e) => setData('resultado', e.target.value)}
                                    placeholder="Ex: Positivo com apreensão de vestígios e formalização de confissão..."
                                    className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    required
                                />
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
                                    <span>{processing ? 'Gravando...' : 'Gravar no Diário'}</span>
                                </button>
                            </div>
                        </form>
                    </TacticalCard>
                )}

                {/* Linha do Tempo das Diligências */}
                <div className="bg-[#122235] border border-[#20344d] rounded-md p-6 shadow-sm">
                    {processo.diligencias && processo.diligencias.length > 0 ? (
                        <div className="relative pl-7 border-l border-[#20344d] space-y-6">
                            {processo.diligencias.map((dil) => (
                                <div key={dil.id} className="relative">
                                    <div className="absolute -left-[35px] top-1.5 w-3 h-3 rounded-full bg-[#c5a059] border-2 border-[#122235]"></div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                                        <span>Data: <strong className="text-slate-300 font-normal">{new Date(dil.data_realizacao).toLocaleString('pt-AO')}</strong></span>
                                        <span>Instrutor: <strong className="text-slate-300 font-normal">{dil.responsavel?.nome_completo}</strong></span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-100 mt-1">{dil.tipo}</h3>
                                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-[#0d1a26] p-3 rounded border border-[#20344d]">
                                        {dil.descricao_detalhada}
                                    </p>
                                    <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5 bg-[#0d1a26]/60 p-2 rounded border border-[#20344d]">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span><strong className="text-slate-400 font-medium">Resultado:</strong> {dil.resultado}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500 text-xs">
                            Nenhuma diligência registada no diário de investigação deste inquérito.
                        </div>
                    )}
                </div>
            </div>
        </TacticalLayout>
    );
}
