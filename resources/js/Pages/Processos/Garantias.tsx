import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import { ProcessoCrime } from '@/types';
import {
    Scale,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
    Plus,
    Save,
    FileText,
    Gavel,
    UserCheck,
    Printer,
} from 'lucide-react';

interface Audiencia {
    id: string;
    numero_auto_audiencia: string;
    tipo_ato: string;
    magistrado_juiz_nome: string;
    tribunal_comarca: string;
    data_hora_audiencia: string;
    horas_decorridas_detencao: number;
    dentro_prazo_48h: boolean;
    decisao_judicial: string;
    valor_caucao_kz?: number;
    fundamentacao_despacho: string;
    defensor_advogado_nome?: string;
    detencao?: {
        id: string;
        individuo?: {
            nome_completo: string;
            numero_bi: string;
        };
    };
}

interface DetencaoInfo {
    id: string;
    individuo_nome: string;
    bi: string;
    data_hora_detencao: string;
    horas_decorridas: number;
    limite_48h: string;
    expirado: boolean;
    estado_custodia: string;
}

interface GarantiasProps {
    processo: ProcessoCrime;
    audiencias: Audiencia[];
    detencoes: DetencaoInfo[];
}

export default function ProcessosGarantias({ processo, audiencias, detencoes }: GarantiasProps) {
    const [showForm, setShowForm] = useState(false);
    const [selectedAudienciaParaTermo, setSelectedAudienciaParaTermo] = useState<Audiencia | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        detencao_id: detencoes.length > 0 ? detencoes[0].id : '',
        tipo_ato: 'PRIMEIRO_INTERROGATORIO_JUDICIAL',
        magistrado_juiz_nome: 'Dr. Augusto Domingos Sambongo (Juiz de Garantias)',
        tribunal_comarca: `Tribunal de Comarca de ${processo.provincia?.nome || 'Luanda'} — 1.ª Secção Criminal`,
        data_hora_audiencia: new Date().toISOString().slice(0, 16),
        decisao_judicial: 'MANUTENCAO_PRISAO_PREVENTIVA',
        valor_caucao_kz: '',
        fundamentacao_despacho: 'Em sede de 1.º Interrogatório Judicial perante o Juiz de Garantias, confirmam-se os fortes indícios da prática criminosa e o manifesto perigo de fuga e perturbação probatória (Art. 63.º da CRA e Art. 250.º do CPP). Determina-se a manutenção da prisão preventiva.',
        defensor_advogado_nome: 'Dra. Elsa Maria Quitumba (OAA n.º 4120)',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('processos.garantias.store', processo.id), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <TacticalLayout title={`Juiz de Garantias • ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Abas Oficiais do Processo */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="garantias"
                    actions={
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>{showForm ? 'Fechar Formulário' : 'Lavrar Audiência de Garantia'}</span>
                        </button>
                    }
                />

                {/* PAINEL DE CONTROLO CONSTITUCIONAL: AUDITORIA DAS 48 HORAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-mono uppercase font-bold text-[10px]">Prazos Constitucionais</span>
                            <Scale className="w-4 h-4 text-[#c5a059]" />
                        </div>
                        <div className="text-xl font-bold font-mono text-slate-100">Art. 63.º CRA</div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Apresentação obrigatória ao Juiz de Garantias no prazo máximo de <strong>48 horas</strong> a contar da detenção celular.
                        </p>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-mono uppercase font-bold text-[10px]">Arguid(os) sob Custódia</span>
                            <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xl font-bold font-mono text-slate-100">
                            {detencoes.length} {detencoes.length === 1 ? 'Detido' : 'Detidos'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                            {detencoes.some(d => d.expirado) ? (
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> ALERTA: Prazo de 48h excedido!
                                </span>
                            ) : (
                                <span className="text-slate-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-slate-400" /> Prazos em conformidade legal
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-mono uppercase font-bold text-[10px]">Audiências Judiciais</span>
                            <Gavel className="w-4 h-4 text-[#c5a059]" />
                        </div>
                        <div className="text-xl font-bold font-mono text-slate-100">
                            {audiencias.length} Registadas
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Decisões proferidas por magistrados judiciais competentes
                        </p>
                    </div>
                </div>

                {/* FORMULÁRIO DE AUDIÊNCIA DO JUIZ DE GARANTIAS */}
                {showForm && (
                    <TacticalCard
                        title="Lavrar Despacho / Audiência do Juiz de Garantias (1.º Interrogatório)"
                        icon={<Scale className="w-4 h-4 text-[#c5a059]" />}
                    >
                        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Arguido Apresentado à Audiência
                                    </label>
                                    <select
                                        value={data.detencao_id}
                                        onChange={e => setData('detencao_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="">Ato Geral sem Arguido Específico</option>
                                        {detencoes.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.individuo_nome} (BI: {d.bi}) — {d.horas_decorridas}h de cela
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Tipo de Ato Jurisdicional de Garantia
                                    </label>
                                    <select
                                        value={data.tipo_ato}
                                        onChange={e => setData('tipo_ato', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="PRIMEIRO_INTERROGATORIO_JUDICIAL">1.º Interrogatório Judicial de Arguido Detido</option>
                                        <option value="VALIDACAO_BUSCA_DOMICILIARIA">Validação Judicial de Busca Domiciliária</option>
                                        <option value="QUEBRA_SIGILO_BANCARIO_TELEFONICO">Autorização de Quebra de Sigilo Bancário / Telefónico</option>
                                        <option value="APRECIACAO_HABEAS_CORPUS">Apreciação de Providência de Habeas Corpus</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Magistrado Judicial (Juiz de Garantias)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.magistrado_juiz_nome}
                                        onChange={e => setData('magistrado_juiz_nome', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Tribunal de Comarca Competente
                                    </label>
                                    <input
                                        type="text"
                                        value={data.tribunal_comarca}
                                        onChange={e => setData('tribunal_comarca', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Data e Hora da Audiência Real
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.data_hora_audiencia}
                                        onChange={e => setData('data_hora_audiencia', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Decisão Jurisdicional / Medida de Coacção Pessoal
                                    </label>
                                    <select
                                        value={data.decisao_judicial}
                                        onChange={e => setData('decisao_judicial', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    >
                                        <option value="MANUTENCAO_PRISAO_PREVENTIVA">Prisão Preventiva (Art. 250.º CPP)</option>
                                        <option value="TERMO_IDENTIDADE_RESIDENCIA">Termo de Identidade e Residência (TIR)</option>
                                        <option value="LIBERDADE_PROVISORIA_CAUCAO">Liberdade Provisória sob Caução</option>
                                        <option value="INTERDICAO_SAIDA">Interdição de Saída do País com Apresentação Periódica</option>
                                        <option value="RELAXAMENTO_PRISAO_ILEGAL">Relaxamento Imediato da Prisão (Excesso de Prazo / Ilegal)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Defensor / Advogado Constituído
                                    </label>
                                    <input
                                        type="text"
                                        value={data.defensor_advogado_nome}
                                        onChange={e => setData('defensor_advogado_nome', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                    Fundamentação Fáctico-Jurídica do Despacho Judicial
                                </label>
                                <textarea
                                    value={data.fundamentacao_despacho}
                                    onChange={e => setData('fundamentacao_despacho', e.target.value)}
                                    rows={3}
                                    className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059] leading-relaxed"
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
                                    <span>{processing ? 'Averbando...' : 'Averbar Despacho nos Autos'}</span>
                                </button>
                            </div>
                        </form>
                    </TacticalCard>
                )}

                {/* LISTA HISTÓRICA DE ATOS DO JUIZ DE GARANTIAS */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-200">
                            Registo Oficial de Audiências e Intervenções Jurisdicionais ({audiencias.length})
                        </h3>
                    </div>

                    {audiencias.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {audiencias.map(aud => (
                                <TacticalCard
                                    key={aud.id}
                                    title={aud.tipo_ato.replace(/_/g, ' ')}
                                    badge={
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                                            aud.decisao_judicial === 'MANUTENCAO_PRISAO_PREVENTIVA'
                                                ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60'
                                                : 'bg-[#132233] text-slate-200 border border-[#223954]'
                                        }`}>
                                            {aud.decisao_judicial.replace(/_/g, ' ')}
                                        </span>
                                    }
                                    icon={<Scale className="w-4 h-4 text-[#c5a059]" />}
                                >
                                    <div className="space-y-3 text-xs">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0d1a26] p-3 rounded border border-[#20344d] font-mono text-[11px]">
                                            <div>
                                                <span className="text-slate-500 block">Número do Auto:</span>
                                                <strong className="text-slate-200">{aud.numero_auto_audiencia}</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">Magistrado Titular:</span>
                                                <strong className="text-slate-200">{aud.magistrado_juiz_nome}</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">Tribunal:</span>
                                                <span className="text-slate-300">{aud.tribunal_comarca}</span>
                                            </div>
                                        </div>

                                        <div className="text-slate-200 leading-relaxed bg-[#0b1523] p-3 rounded border border-[#1e2f42]">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                                Fundamentação Decisória:
                                            </span>
                                            {aud.fundamentacao_despacho}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-2 border-t border-[#20344d]">
                                            <div className="flex items-center gap-4">
                                                <span>Data: <strong className="text-slate-300 font-mono">{aud.data_hora_audiencia}</strong></span>
                                                <span>Auditado em: <strong className="text-slate-300 font-mono">{aud.horas_decorridas_detencao}h após detenção</strong></span>
                                                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                                    aud.dentro_prazo_48h
                                                        ? 'bg-[#132233] text-slate-300 border border-[#223954]'
                                                        : 'bg-rose-950/60 text-rose-300 border border-rose-900/60'
                                                }`}>
                                                    {aud.dentro_prazo_48h ? '✓ Dentro das 48h' : '⚠️ Prazo 48h Excedido'}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedAudienciaParaTermo(aud)}
                                                className="px-2.5 py-1 bg-[#17283c] hover:bg-[#1f3752] text-slate-200 border border-[#20344d] hover:border-[#c5a059]/60 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Printer className="w-3.5 h-3.5 text-[#c5a059]" />
                                                <span>Termo de Audiência Oficial</span>
                                            </button>
                                        </div>
                                    </div>
                                </TacticalCard>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500 text-xs bg-[#122235] border border-[#20344d] rounded-md">
                            Nenhuma audiência do Juiz de Garantias averbada até ao momento neste inquérito.
                        </div>
                    )}
                </div>

                {/* MODAL DE IMPRESSÃO DO TERMO DE AUDIÊNCIA DO JUIZ DE GARANTIAS */}
                {selectedAudienciaParaTermo && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-[#0f1b29] border border-[#223750] rounded-xl max-w-2xl w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-[#20344d] pb-3">
                                <div className="flex items-center gap-2 text-slate-100 font-bold text-xs uppercase font-mono">
                                    <Scale className="w-4 h-4 text-amber-400" />
                                    <span>Termo Oficial do Juiz de Garantias</span>
                                </div>
                                <button
                                    onClick={() => setSelectedAudienciaParaTermo(null)}
                                    className="text-slate-400 hover:text-rose-400 font-bold p-1 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Folha Oficial A4 */}
                            <div className="bg-white text-slate-900 rounded p-8 space-y-4 font-serif text-xs border border-slate-300">
                                <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                                    <div className="font-bold text-sm uppercase">REPÚBLICA DE ANGOLA</div>
                                    <div className="font-bold text-xs uppercase text-slate-700">{selectedAudienciaParaTermo.tribunal_comarca}</div>
                                    <div className="font-mono text-[10px] text-slate-500">SECRETARIA JUDICIAL &bull; JURISDIÇÃO DE GARANTIAS</div>
                                </div>

                                <div className="text-center py-2">
                                    <div className="font-bold text-xs uppercase underline">
                                        AUTO DE 1.º INTERROGATÓRIO JUDICIAL DE ARGUIDO DETIDO
                                    </div>
                                    <div className="font-mono text-[10px] text-slate-600 mt-1">
                                        PROCESSO-CRIME N.º: <strong>{processo.numero_processo}</strong> &bull; AUTO: <strong>{selectedAudienciaParaTermo.numero_auto_audiencia}</strong>
                                    </div>
                                </div>

                                <p className="text-justify leading-relaxed font-sans text-xs">
                                    Aos {selectedAudienciaParaTermo.data_hora_audiencia}, perante o Meritíssimo Juiz de Garantias, <strong>{selectedAudienciaParaTermo.magistrado_juiz_nome}</strong>, foi presente o arguido detido, tendo a audiência decorrido com a assistência do defensor <strong>{selectedAudienciaParaTermo.defensor_advogado_nome || 'Defensor Oficioso'}</strong>, nos termos dos artigos 63.º e 67.º da Constituição da República de Angola e Código de Processo Penal Angolano (Lei n.º 39/20).
                                </p>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded font-sans text-xs space-y-1">
                                    <div><strong>DELIBERAÇÃO JURISDICIONAL:</strong> <span className="font-bold text-slate-900">{selectedAudienciaParaTermo.decisao_judicial.replace(/_/g, ' ')}</span></div>
                                    <div><strong>CONTROLO DE 48H:</strong> {selectedAudienciaParaTermo.horas_decorridas_detencao} horas decorridas desde a detenção ({selectedAudienciaParaTermo.dentro_prazo_48h ? 'Tempestivo' : 'Intempestivo'}).</div>
                                    <div className="mt-2 text-slate-700 italic">"{selectedAudienciaParaTermo.fundamentacao_despacho}"</div>
                                </div>

                                <div className="pt-8 grid grid-cols-2 text-center text-[10px] font-sans">
                                    <div>
                                        <div className="w-48 border-b border-slate-800 mx-auto mb-1"></div>
                                        <div>O Defensor / Advogado</div>
                                    </div>
                                    <div>
                                        <div className="w-48 border-b border-slate-800 mx-auto mb-1"></div>
                                        <div><strong>{selectedAudienciaParaTermo.magistrado_juiz_nome}</strong></div>
                                        <div className="text-slate-500">Juiz de Garantias</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setSelectedAudienciaParaTermo(null)}
                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] text-slate-300 rounded text-xs cursor-pointer"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Imprimir Termo Judicial</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TacticalLayout>
    );
}
