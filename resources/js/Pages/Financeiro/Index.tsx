import React from 'react';
import { Link, router } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import {
    Landmark,
    Lock,
    Unlock,
    Shield,
    TrendingDown,
    TrendingUp,
    Scale,
    AlertTriangle,
    ArrowRight,
    DollarSign,
} from 'lucide-react';

interface Props {
    contas: {
        data: any[];
        links: any[];
        total: number;
    };
    transacoesRecentes: any[];
    estatisticas: {
        total_contas_auditadas: number;
        contas_bloqueadas: number;
        total_bloqueado_kz: number;
        total_movimentado_apurado_kz: number;
        alertas_smurfing: number;
        alertas_passagem: number;
    };
}

export default function FinanceiroIndex({ contas, transacoesRecentes, estatisticas }: Props) {
    const formatKz = (val: number) => {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA',
            maximumFractionDigits: 2,
        }).format(val);
    };

    const handleCongelar = (contaId: string, iban: string) => {
        if (confirm(`Confirmar bloqueio cautelar imediato da conta ${iban} junto do Banco e SENRA?`)) {
            router.post(route('financeiro.contas.congelar', contaId));
        }
    };

    return (
        <TacticalLayout title="Investigação Económica, Financeira & Recuperação de Ativos">
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20344d] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
                                Direcção Nacional de Combate à Corrupção & Crimes Financeiros (DNCF / UIF)
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Auditoria bancária sob sigilo quebrado, rastreio de fluxos ilícitos (*Follow the Money*) e medidas cautelares com o SENRA/PGR
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="px-2.5 py-1 rounded bg-[#0d1a26] border border-[#20344d] text-rose-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            <span>{estatisticas.contas_bloqueadas} Contas Congeladas</span>
                        </span>
                    </div>
                </div>

                {/* Banner de Fluxo Operacional: Como Trabalha a DNCF/SIC */}
                <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#142334] border border-[#223954] flex items-center justify-center text-[#c5a059] shrink-0">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-100 flex items-center gap-2">
                                <span>Fluxo de Investigação Económica: Quebra de Sigilo &bull; Ingestão de Extratos &bull; Congelamento</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Aceda a qualquer inquérito para carregar ficheiros CSV/Excel de extratos bancários, ativar a deteção automática de fracionamento (Smurfing) e emitir autos de bloqueio imediato ao SENRA e BNA.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/processos"
                        className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shrink-0"
                    >
                        <span>Abrir Inquérito para Carregar Extrato</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
                    </Link>
                </div>

                {/* Métricas Globais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Fundos Auditados Totais</span>
                        <div className="text-xl font-bold font-mono text-slate-100">{formatKz(estatisticas.total_movimentado_apurado_kz)}</div>
                        <span className="text-[11px] text-slate-400">Volume financeiro nos inquéritos</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Total Congelado (SENRA)</span>
                        <div className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
                            <span>{formatKz(estatisticas.total_bloqueado_kz)}</span>
                            {estatisticas.total_bloqueado_kz > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60 font-sans font-normal">Cautelar</span>
                            )}
                        </div>
                        <span className="text-[11px] text-slate-400">Prevenção de dissipação de ativos</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Alertas de Smurfing</span>
                        <div className="text-xl font-bold font-mono text-slate-100">{estatisticas.alertas_smurfing} <span className="text-xs font-normal text-slate-400">Casos</span></div>
                        <span className="text-[11px] text-slate-400">Fracionamento em numerário &lt; 5M</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Contas de Passagem</span>
                        <div className="text-xl font-bold font-mono text-slate-100">{estatisticas.alertas_passagem} <span className="text-xs font-normal text-slate-400">Casos</span></div>
                        <span className="text-[11px] text-slate-400">Transbordo sem causa comercial</span>
                    </div>
                </div>

                {/* PAINEL DE CONTAS BANCÁRIAS CONSOLIDADAS */}
                <TacticalCard
                    title={`Contas Bancárias sob Quebra de Sigilo Judicial (${contas.total})`}
                    icon={<Landmark className="w-4 h-4 text-[#c5a059]" />}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead>
                                <tr className="border-b border-[#20344d] text-slate-400 text-[10px] uppercase font-mono">
                                    <th className="py-2.5 px-3">Banco Comercial</th>
                                    <th className="py-2.5 px-3">Titular / Alvo</th>
                                    <th className="py-2.5 px-3">NIF</th>
                                    <th className="py-2.5 px-3">IBAN</th>
                                    <th className="py-2.5 px-3">Processo</th>
                                    <th className="py-2.5 px-3">Saldo Atual</th>
                                    <th className="py-2.5 px-3">Suspeição</th>
                                    <th className="py-2.5 px-3">Estado SENRA</th>
                                    <th className="py-2.5 px-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e2f42] text-slate-200 font-mono text-[11px]">
                                {contas.data.map(c => (
                                    <tr key={c.id} className="hover:bg-[#0f1b29] transition-colors">
                                        <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">
                                            {c.banco_comercial}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-100 font-sans">
                                            {c.titular_nome}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400">
                                            {c.titular_nif}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300">
                                            {c.iban_completo}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300">
                                            {c.processo?.numero_processo || 'N/D'}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-slate-100">
                                            {formatKz(c.saldo_contabilistico_kz)}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                c.grau_suspeicao === 'CRITICO' ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60' :
                                                'bg-[#132233] text-slate-300 border border-[#223954]'
                                            }`}>
                                                {c.grau_suspeicao}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                            {c.congelamento_cautelar_ativo ? (
                                                <span className="text-rose-400 font-medium flex items-center gap-1 text-[10px]">
                                                    <Lock className="w-3 h-3" /> BLOQUEADA ({c.numero_auto_bloqueio_senra})
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                                                    <Unlock className="w-3 h-3 text-slate-500" /> Ativa
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {!c.congelamento_cautelar_ativo && (
                                                    <button
                                                        onClick={() => handleCongelar(c.id, c.iban_completo)}
                                                        className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-200 rounded text-[10px] font-sans font-medium cursor-pointer"
                                                    >
                                                        Congelar
                                                    </button>
                                                )}
                                                {c.processo?.id && (
                                                    <Link
                                                        href={route('processos.financeiro', c.processo.id)}
                                                        className="px-2 py-0.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] text-slate-200 rounded text-[10px] inline-flex items-center gap-1"
                                                    >
                                                        <span>Ver</span>
                                                        <ArrowRight className="w-2.5 h-2.5" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TacticalCard>

                {/* PAINEL DE TRANSAÇÕES SUSPEITAS RECENTES */}
                <TacticalCard
                    title="Feed Operacional de Transações Suspeitas (DNCF / UIF)"
                    icon={<TrendingDown className="w-4 h-4 text-[#c5a059]" />}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead>
                                <tr className="border-b border-[#20344d] text-slate-400 text-[10px] uppercase font-mono">
                                    <th className="py-2.5 px-3">Data</th>
                                    <th className="py-2.5 px-3">Processo</th>
                                    <th className="py-2.5 px-3">Montante (AOA)</th>
                                    <th className="py-2.5 px-3">Operação</th>
                                    <th className="py-2.5 px-3">Padrão de Lavagem</th>
                                    <th className="py-2.5 px-3">Contraparte</th>
                                    <th className="py-2.5 px-3">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e2f42] text-slate-200 font-mono text-[11px]">
                                {transacoesRecentes.map(t => (
                                    <tr key={t.id} className="hover:bg-[#0f1b29] transition-colors">
                                        <td className="py-2.5 px-3 text-slate-400">
                                            {t.data_hora_movimento}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300">
                                            {t.processo?.numero_processo || 'N/D'}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-slate-100">
                                            {formatKz(t.valor_kz)}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300">
                                            {t.tipo_operacao.replace(/_/g, ' ')}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#132233] text-slate-200 border border-[#223954]">
                                                {t.alerta_padrao_lavagem.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-300 font-sans">
                                            {t.nome_contraparte || '—'}
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400 text-[10px] font-sans max-w-xs truncate">
                                            {t.descricao_extrato}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TacticalCard>
            </div>
        </TacticalLayout>
    );
}
