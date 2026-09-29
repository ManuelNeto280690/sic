import React from 'react';
import { useForm } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import { Send, CheckCircle2, Shield, FileText, Scale } from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface RemessaProps {
    processo: ProcessoCrime;
}

export default function ProcessosRemessaPgr({ processo }: RemessaProps) {
    const { data, setData, post, processing, errors } = useForm({
        relatorio_final: `Constatada a existência de matéria e indícios suficientes da prática do crime pelo arguido detido, junta-se o expediente das diligências realizadas, os bens apreendidos sob custódia e os laudos técnicos, remetendo-se os autos com proposta de acusação formal nos termos do Código de Processo Penal Angolano.`,
        magistrado_destinatario: processo.magistrado_pgr_responsavel || 'Dr. Amílcar dos Santos (Subprocurador-Geral da República)',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('processos.remessa-pgr.executar', processo.id));
    };

    return (
        <TacticalLayout title={`Proc. ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Cabeçalho Institucional & As 6 Sub-Abas Oficiais */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="remessa"
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">
                            Remessa Solene ao Ministério Público (PGR)
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Conclusão formal da instrução preparatória do inquérito e envio para a Sala Criminal
                        </p>
                    </div>
                </div>

                {processo.estado === 'REMETIDO_AO_MP' ? (
                    <div className="p-8 bg-[#122235] border border-[#20344d] rounded-md text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700 mx-auto flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                            Inquérito Remetido ao Ministério Público
                        </h2>
                        <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                            O processo encontra-se formalmente sob a alçada da Magistratura do Ministério Público ({processo.magistrado_pgr_responsavel}), com remessa registada em {processo.data_remessa_mp || 'Data de envio homologada'}.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Resumo Processual */}
                        <TacticalCard title="Resumo das Diligências e Elementos de Prova" icon={<Scale className="w-4 h-4 text-[#c5a059]" />}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 bg-[#0d1a26] rounded border border-[#20344d]">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Diligências Realizadas</span>
                                    <span className="text-base font-bold text-slate-100 mt-1 block">{processo.diligencias?.length || 0}</span>
                                </div>
                                <div className="p-3 bg-[#0d1a26] rounded border border-[#20344d]">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Bens Apreendidos (Lacres)</span>
                                    <span className="text-base font-bold text-slate-100 mt-1 block">{processo.bens?.length || 0}</span>
                                </div>
                                <div className="p-3 bg-[#0d1a26] rounded border border-[#20344d]">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Arguid(os) Detidos</span>
                                    <span className="text-base font-bold text-slate-100 mt-1 block">{processo.detencoes?.length || 0}</span>
                                </div>
                            </div>
                        </TacticalCard>

                        {/* Formulário de Envio com Relatório Final */}
                        <TacticalCard title="Ofício de Remessa e Proposta Instrutória" icon={<FileText className="w-4 h-4 text-[#c5a059]" />}>
                            <div className="space-y-3 text-xs font-sans">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Magistrado do Ministério Público Destinatário
                                    </label>
                                    <input
                                        type="text"
                                        value={data.magistrado_destinatario}
                                        onChange={(e) => setData('magistrado_destinatario', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2.5 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Fundamentação do Relatório Final de Investigação
                                    </label>
                                    <textarea
                                        value={data.relatorio_final}
                                        onChange={(e) => setData('relatorio_final', e.target.value)}
                                        rows={5}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2.5 rounded focus:border-[#c5a059] leading-relaxed"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-[#20344d]">
                                    <span className="text-[11px] text-slate-400">
                                        Ao remeter, o estado do inquérito passará a <strong>REMETIDO_AO_MP</strong>.
                                    </span>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 bg-[#17283c] hover:bg-[#203854] text-slate-100 border border-[#20344d] hover:border-[#c5a059] font-medium text-xs rounded-md flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                                    >
                                        <Send className="w-3.5 h-3.5 text-[#c5a059]" />
                                        <span>{processing ? 'Formalizando Remessa...' : 'Executar Remessa Solene ao MP'}</span>
                                    </button>
                                </div>
                            </div>
                        </TacticalCard>
                    </form>
                )}
            </div>
        </TacticalLayout>
    );
}
