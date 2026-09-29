import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { LacreBadge } from '@/Components/UI/LacreBadge';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import { Lock, Plus, Save, ShieldCheck, Printer, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { ProcessoCrime } from '@/types';

interface CustodiaProps {
    processo: ProcessoCrime;
    lacre_sugerido: string;
}

export default function ProcessosCustodia({ processo, lacre_sugerido }: CustodiaProps) {
    const [showForm, setShowForm] = useState(false);
    const [selectedBemParaEtiqueta, setSelectedBemParaEtiqueta] = useState<any>(null);
    const [qrModalUrl, setQrModalUrl] = useState<string>('');

    // Gera QR Code 100% autêntico e escaneável para a etiqueta física do bem
    useEffect(() => {
        if (!selectedBemParaEtiqueta) {
            setQrModalUrl('');
            return;
        }
        const qrPayload = `SIGD-SIC-CUSTODIA|PROC:${processo.numero_processo}|LACRE:${selectedBemParaEtiqueta.numero_lacre_seguranca}|TIPO:${selectedBemParaEtiqueta.tipo_objeto}|LOCAL:${selectedBemParaEtiqueta.local_cofre_deposito}`;
        QRCode.toDataURL(qrPayload, {
            width: 256,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        }).then(url => {
            setQrModalUrl(url);
        }).catch(err => {
            console.error('Falha ao gerar QR Code autêntico da prova:', err);
        });
    }, [selectedBemParaEtiqueta, processo.numero_processo]);

    const { data, setData, post, processing, reset } = useForm({
        descricao_bem: '',
        tipo_objeto: 'ARMA_FOGO',
        local_cofre_deposito: 'Cofre Forte de Balística Forense — Gaveta A',
        detencao_id: processo.detencoes && processo.detencoes[0] ? processo.detencoes[0].id : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('processos.provas-custodia.store', processo.id), {
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
                    activeTab="custodia"
                    actions={
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>{showForm ? 'Fechar Formulário' : 'Apreender e Lacrar Bem'}</span>
                        </button>
                    }
                />

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-100">
                            Inventário de Provas & Cadeia de Custódia ({processo.bens?.length || 0})
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Rastreio forense de armas, entorpecentes e valores sob lacres de segurança invioláveis
                        </p>
                    </div>
                </div>

                {/* Formulário de Depósito de Bem Apreendido */}
                {showForm && (
                    <TacticalCard title="Lavrar Depósito de Bem Apreendido" icon={<Lock className="w-4 h-4 text-[#c5a059]" />}>
                        <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
                            <div className="p-3 bg-[#0d1a26] border border-[#20344d] rounded-md flex items-center justify-between">
                                <span className="text-slate-400 text-xs">Código de Lacre Automático Atribuído:</span>
                                <LacreBadge codigo={lacre_sugerido} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Classificação do Objeto</label>
                                    <select
                                        value={data.tipo_objeto}
                                        onChange={(e) => setData('tipo_objeto', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="ARMA_FOGO">Arma de Fogo / Munições</option>
                                        <option value="SUBSTANCIA_ENTORPECENTE">Substância Entorpecente</option>
                                        <option value="VALOR_MONETARIO">Valor Monetário / Divisas</option>
                                        <option value="VIATURA">Viatura / Meio de Transporte</option>
                                        <option value="EQUIPAMENTO_ELETRONICO">Equipamento Eletrónico / Telemóvel</option>
                                        <option value="OUTRO">Outro Objeto Probante</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Local do Cofre / Depósito Judicial</label>
                                    <input
                                        type="text"
                                        value={data.local_cofre_deposito}
                                        onChange={(e) => setData('local_cofre_deposito', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Descrição Pormenorizada do Bem e Estado Físico</label>
                                <textarea
                                    value={data.descricao_bem}
                                    onChange={(e) => setData('descricao_bem', e.target.value)}
                                    rows={3}
                                    placeholder="Ex: Pistola calibre 9x18mm Makarov com número de série parcialmente raspado..."
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
                                    <span>{processing ? 'Lacrando...' : 'Efetivar Lacre e Custódia'}</span>
                                </button>
                            </div>
                        </form>
                    </TacticalCard>
                )}

                {/* Inventário dos Bens em Depósito */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processo.bens && processo.bens.length > 0 ? (
                        processo.bens.map((bem) => (
                            <TacticalCard
                                key={bem.id}
                                title={bem.tipo_objeto.replace('_', ' ')}
                                badge={<LacreBadge codigo={bem.numero_lacre_seguranca} />}
                                icon={<Lock className="w-4 h-4 text-[#c5a059]" />}
                            >
                                <div className="space-y-2.5 text-xs font-sans">
                                    <div className="text-slate-200 leading-relaxed bg-[#0d1a26] p-3 rounded border border-[#20344d]">
                                        {bem.descricao_bem}
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>Localização: <strong className="text-slate-300 font-normal">{bem.local_cofre_deposito}</strong></span>
                                        <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                                            <ShieldCheck className="w-3 h-3" /> INTATO
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        Apreendido por: {bem.apreendidoPor?.nome_completo || 'Investigador Titular'}
                                    </div>

                                    {/* Linha do Tempo e Ações Forenses com QR Code */}
                                    <div className="pt-2 border-t border-[#20344d] flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                            <div className="w-5 h-5 rounded bg-[#17283c] border border-[#20344d] flex items-center justify-center text-amber-400">
                                                <QrCode className="w-3.5 h-3.5" />
                                            </div>
                                            <span>Lacre Rastreável</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedBemParaEtiqueta(bem)}
                                            className="px-2.5 py-1 bg-[#17283c] hover:bg-[#1f3752] text-amber-300 border border-amber-800/60 rounded text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Printer className="w-3 h-3" />
                                            <span>Etiqueta Forense</span>
                                        </button>
                                    </div>
                                </div>
                            </TacticalCard>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-12 text-slate-500 text-xs bg-[#122235] border border-[#20344d] rounded-md">
                            Nenhum bem apreendido ou vestígio sob custódia neste processo.
                        </div>
                    )}
                </div>

                {/* MODAL INSTITUCIONAL DE ETIQUETA ADESIVA FORENSE INVIOLÁVEL */}
                {selectedBemParaEtiqueta && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f1b29] border border-[#223750] rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#20344d] pb-3">
                                <div className="flex items-center gap-2 text-slate-100 font-bold text-xs uppercase font-mono">
                                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                                    <span>Etiqueta Forense de Lacre Inviolável</span>
                                </div>
                                <button
                                    onClick={() => setSelectedBemParaEtiqueta(null)}
                                    className="text-slate-400 hover:text-rose-400 font-bold p-1 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Cartão de Etiqueta Imprimível */}
                            <div className="bg-white text-slate-900 rounded border-2 border-slate-900 p-5 space-y-3 font-mono text-[11px] shadow-inner">
                                <div className="text-center border-b border-slate-800 pb-2">
                                    <div className="font-bold text-xs">REPÚBLICA DE ANGOLA &bull; SIC</div>
                                    <div className="text-[10px] text-slate-600 font-sans font-semibold">CADEIA DE CUSTÓDIA DE PROVAS &bull; LACRE INVIOLÁVEL</div>
                                </div>

                                <div className="flex items-center justify-between gap-4 py-2 border-b border-dashed border-slate-400">
                                    <div className="space-y-1">
                                        <div>PROCESSO: <strong>{processo.numero_processo}</strong></div>
                                        <div>LACRE Nº: <strong className="text-sm bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded">{selectedBemParaEtiqueta.numero_lacre_seguranca}</strong></div>
                                        <div>TIPO: {selectedBemParaEtiqueta.tipo_objeto}</div>
                                        <div>LOCAL: {selectedBemParaEtiqueta.local_cofre_deposito}</div>
                                    </div>
                                    <div className="w-20 h-20 border-2 border-slate-900 rounded p-1 bg-white shrink-0 flex items-center justify-center">
                                        {qrModalUrl ? (
                                            <img
                                                src={qrModalUrl}
                                                alt={`QR Code Lacre - ${selectedBemParaEtiqueta.numero_lacre_seguranca}`}
                                                className="w-full h-full object-contain block"
                                            />
                                        ) : (
                                            <span className="text-[8px] font-mono text-slate-500">Gerando QR...</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-[10px] text-slate-700 italic">
                                    "A violação deste lacre constitui crime de descaminho ou inutilização de prova judicial (Art. 350.º Lei 38/20)."
                                </div>

                                <div className="pt-2 text-center text-[10px] border-t border-slate-300">
                                    <div>Fiel Depositário / Perito Responsável:</div>
                                    <div className="font-bold underline mt-1">{selectedBemParaEtiqueta.apreendidoPor?.nome_completo || 'Inspector do SIC'}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setSelectedBemParaEtiqueta(null)}
                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] text-slate-300 rounded text-xs cursor-pointer"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Imprimir Etiqueta Autocolante</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TacticalLayout>
    );
}
