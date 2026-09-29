import React, { useState } from 'react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ShieldCheck, Hash, ShieldAlert, CheckCircle2, RefreshCw, Lock, Terminal } from 'lucide-react';
import { LogAuditoria } from '@/types';

interface AuditoriaProps {
    logs: {
        data: LogAuditoria[];
        links: any[];
        total: number;
    };
    chain_status: {
        is_valid: boolean;
        total_blocks: number;
        corrupted_block_id?: number | null;
        last_valid_hash: string;
    };
    filtros: {
        search?: string;
        tabela?: string;
    };
}

export default function AuditoriaIndex({ logs, chain_status, filtros }: AuditoriaProps) {
    const [status, setStatus] = useState(chain_status);
    const [verificando, setVerificando] = useState(false);

    const handleVerificarCadeia = () => {
        setVerificando(true);
        fetch(route('auditoria.verificar'))
            .then((res) => res.json())
            .then((data) => {
                setStatus(data);
                setVerificando(false);
            })
            .catch(() => setVerificando(false));
    };

    return (
        <TacticalLayout title="Auditoria Criptográfica">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                Auditoria Criptográfica Encadeada (SHA-256 Append-Only)
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                            Módulo M10 // Trilha imutável com prova matemática de inviolabilidade dos registos forenses
                        </p>
                    </div>

                    <button
                        onClick={handleVerificarCadeia}
                        disabled={verificando}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-sans uppercase tracking-wider rounded flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 ${verificando ? 'animate-spin' : ''}`} />
                        <span>{verificando ? 'Recalculando Hashes...' : 'Validar Integridade da Cadeia'}</span>
                    </button>
                </div>

                {/* Status da Cadeia Criptográfica */}
                <div
                    className={`p-4 rounded-[4px] border font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        status.is_valid
                            ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                            : 'bg-rose-950/80 border-rose-600 text-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0d1a26] rounded border border-current">
                            {status.is_valid ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : (
                                <ShieldAlert className="w-6 h-6 text-rose-400" />
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-bold uppercase tracking-wider">
                                {status.is_valid
                                    ? 'CADEIA CRIPTOGRÁFICA 100% ÍNTEGRA E INVIOLÁVEL'
                                    : `QUEBRA DE INTEGRIDADE DETETADA NO BLOCO #${status.corrupted_block_id}`}
                            </div>
                            <div className="text-xs opacity-80 mt-0.5">
                                Total de {status.total_blocks} blocos encadeados sequencialmente desde o bloco génese.
                            </div>
                        </div>
                    </div>

                    <div className="text-right text-xs">
                        <div className="text-[10px] opacity-70 uppercase">Último Hash Válido Verificado:</div>
                        <div className="text-xs font-mono font-bold select-all truncate max-w-[260px]">
                            {status.last_valid_hash}
                        </div>
                    </div>
                </div>

                {/* Tabela de Blocos de Auditoria */}
                <div className="bg-[#132235] border border-[#223750] rounded overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans divide-y divide-[#223750]">
                        <thead className="bg-[#17283c] text-slate-400 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-3 py-3">Bloco ID</th>
                                <th className="px-3 py-3">Ação Realizada</th>
                                <th className="px-3 py-3">Tabela Afetada</th>
                                <th className="px-3 py-3">Operador / IP</th>
                                <th className="px-3 py-3">Hash Anterior</th>
                                <th className="px-3 py-3">Hash Atual (SHA-256)</th>
                                <th className="px-3 py-3">Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#223750]/50">
                            {logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-[#17283c]/80 transition-colors">
                                    <td className="px-3 py-3 font-bold text-[#c5a059]">#{log.id}</td>
                                    <td className="px-3 py-3 font-semibold text-slate-200">{log.rota_acao}</td>
                                    <td className="px-3 py-3">
                                        <span className="px-1.5 py-0.5 bg-[#0d1a26] text-slate-300 rounded border border-[#223750]">
                                            {log.tabela_afetada}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-slate-300">
                                        <div>{log.utilizador?.nome_completo || 'Sistema / Central'}</div>
                                        <div className="text-[10px] text-slate-500">IP: {log.ip_origem}</div>
                                    </td>
                                    <td className="px-3 py-3 text-[11px] text-slate-500 truncate max-w-[130px]" title={log.hash_anterior}>
                                        {log.hash_anterior.slice(0, 16)}...
                                    </td>
                                    <td className="px-3 py-3 text-[11px] text-[#DFC07A] font-semibold truncate max-w-[160px]" title={log.hash_atual}>
                                        {log.hash_atual.slice(0, 20)}...
                                    </td>
                                    <td className="px-3 py-3 text-slate-400 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('pt-AO')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </TacticalLayout>
    );
}
