import React from 'react';

interface StatusBadgeProps {
    status: string;
    type?: 'ocorrencia' | 'processo' | 'detencao' | 'mandado' | 'pericia';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    let bg = 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    let label = status;

    switch (status) {
        // Ocorrências
        case 'REGISTADA':
            bg = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
            label = 'Registada';
            break;
        case 'EM_TRIAGEM':
            bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            label = 'Em Triagem';
            break;
        case 'INSTAURADO_PROCESSO':
            bg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            label = 'Processo Instaurado';
            break;
        case 'ARQUIVADA':
            bg = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
            label = 'Arquivada';
            break;

        // Processos
        case 'EM_INSTRUCAO':
            bg = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
            label = 'Em Instrução';
            break;
        case 'RELATORIO_CONCLUIDO':
            bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            label = 'Relatório Concluído';
            break;
        case 'REMETIDO_AO_MP':
            bg = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
            label = 'Remetido ao MP';
            break;
        case 'ACUSADO':
            bg = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            label = 'Acusado';
            break;

        // Detenções
        case 'CELA_TRANSITORIA':
            bg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            label = 'Cela Transitória (48h)';
            break;
        case 'APRESENTADO_MP':
            bg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            label = 'Apresentado ao MP';
            break;
        case 'TRANSFERIDO_PRISAO':
            bg = 'bg-slate-500/15 text-slate-300 border-slate-500/30';
            label = 'Estab. Prisional';
            break;

        // Mandados
        case 'ATIVO':
            bg = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            label = 'Mandado Ativo';
            break;
        case 'CUMPRIDO':
            bg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            label = 'Cumprido';
            break;
        case 'REVOGADO':
            bg = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
            label = 'Revogado';
            break;
        case 'EXPIRADO':
            bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            label = 'Expirado';
            break;

        // Perícias
        case 'SOLICITADA':
            bg = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
            label = 'Solicitada';
            break;
        case 'EM_ANALISE':
            bg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            label = 'Em Análise';
            break;
        case 'CONCLUIDA':
            bg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            label = 'Laudo Concluído';
            break;
        case 'RECUSADA':
            bg = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            label = 'Recusada';
            break;

        default:
            label = status.replace(/_/g, ' ');
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-sans font-medium rounded-full border ${bg}`}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
            {label}
        </span>
    );
};
