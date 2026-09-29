import React, { useState, useMemo } from 'react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import {
    Network,
    Users,
    ShieldAlert,
    Lock,
    Activity,
    FileCheck,
    Search,
    Filter,
    Download,
    Share2,
    AlertTriangle,
    Eye,
    ChevronRight,
    MapPin,
    Clock,
    Scale
} from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface VinculosProps {
    processo: ProcessoCrime;
    cruzamento_inteligencia?: {
        mandados_ativos_total: number;
        tem_interdicao_sme: boolean;
        tem_mandado_captura: boolean;
        pericias_total: number;
        pericias_concluidas: number;
        horas_detencao_max: number | null;
        mandados_detalhes: { numero: string; tipo: string; alvo: string }[];
    };
}

interface GraphNode {
    id: string;
    label: string;
    sublabel: string;
    type: 'PROCESSO' | 'ARGUIDO' | 'VITIMA' | 'TESTEMUNHA' | 'BEM_APREENDIDO' | 'DILIGENCIA' | 'PERICIA';
    x: number;
    y: number;
    data: any;
    risco?: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAIXO';
}

interface GraphEdge {
    source: string;
    target: string;
    label: string;
    tipo: 'AUTORIA' | 'VITIMIZACAO' | 'APREENSAO' | 'INVESTIGACAO' | 'PROVA';
}

export default function ProcessosVinculos({ processo, cruzamento_inteligencia }: VinculosProps) {
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [filterType, setFilterType] = useState<string>('TODOS');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Construção dos nós e arestas com base no inquérito real
    const { nodes, edges } = useMemo(() => {
        const nodeList: GraphNode[] = [];
        const edgeList: GraphEdge[] = [];

        // 1. Nó Central: O Processo-Crime
        const centerNode: GraphNode = {
            id: 'proc-root',
            label: processo.numero_processo,
            sublabel: processo.tipologia_legal,
            type: 'PROCESSO',
            x: 450,
            y: 280,
            data: {
                numero: processo.numero_processo,
                crime: processo.tipologia_legal,
                estado: processo.estado,
                magistrado: processo.magistrado_pgr_responsavel || 'PGR Titular',
                investigador: processo.investigador?.nome_completo || 'SIC Instrutor',
                provincia: processo.provincia?.nome || 'Angola',
            },
            risco: 'ALTO',
        };
        nodeList.push(centerNode);

        // 2. Intervenientes da Ocorrência e Detenções
        const intervenientes = processo.ocorrencia?.intervenientes || [];
        const detencoes = processo.detencoes || [];

        // Adicionar Arguidos / Suspeitos
        let idxArg = 0;
        detencoes.forEach((det, i) => {
            const ind = det.individuo;
            const argId = `arg-${det.id || i}`;
            const nome = ind?.nome_completo || det.motivo_detencao || `Suspeito #${i + 1}`;
            
            // Posição em semi-círculo à esquerda
            const angle = Math.PI * 0.7 + (idxArg * 0.4);
            const radius = 230;
            const x = 450 - Math.cos(angle) * radius;
            const y = 280 - Math.sin(angle) * radius;

            nodeList.push({
                id: argId,
                label: nome,
                sublabel: `Arguido Detido • BI: ${ind?.numero_bi || 'Em apuração'}`,
                type: 'ARGUIDO',
                x,
                y,
                data: {
                    nome,
                    bi: ind?.numero_bi || 'Não especificado',
                    alcunhas: ind?.alcunhas || [],
                    data_detencao: det.data_hora_detencao,
                    estado_custodia: det.estado_custodia || 'CELA_TRANSITORIA',
                    motivo: det.motivo_detencao,
                    nacionalidade: ind?.nacionalidade || 'Angolana',
                },
                risco: 'CRITICO',
            });

            edgeList.push({
                source: argId,
                target: 'proc-root',
                label: 'Autor Material / Detido',
                tipo: 'AUTORIA',
            });
            idxArg++;
        });

        // Intervenientes adicionais (Vítimas e Testemunhas)
        let idxOutros = 0;
        intervenientes.forEach((interv, i) => {
            const intervId = `interv-${interv.id || i}`;
            const isVitima = interv.papel === 'VITIMA';
            const isTestemunha = interv.papel === 'TESTEMUNHA' || interv.papel === 'DECLARANTE';
            
            // Posição à direita
            const angle = -Math.PI * 0.3 + (idxOutros * 0.4);
            const radius = 230;
            const x = 450 + Math.cos(angle) * radius;
            const y = 280 + Math.sin(angle) * radius;

            nodeList.push({
                id: intervId,
                label: interv.nome_identificativo || 'Cidadão',
                sublabel: interv.papel,
                type: isVitima ? 'VITIMA' : (isTestemunha ? 'TESTEMUNHA' : 'ARGUIDO'),
                x,
                y,
                data: {
                    nome: interv.nome_identificativo,
                    papel: interv.papel,
                    bi: interv.numero_bi || 'N/D',
                    contacto: interv.contacto_telefone || 'N/D',
                    resumo: interv.declaracoes_resumo || 'Sem registo prévio',
                },
                risco: isVitima ? 'BAIXO' : 'MEDIO',
            });

            edgeList.push({
                source: 'proc-root',
                target: intervId,
                label: isVitima ? 'Ofendido / Lesado' : 'Depoimento Prestado',
                tipo: isVitima ? 'VITIMIZACAO' : 'INVESTIGACAO',
            });
            idxOutros++;
        });

        // 3. Bens e Evidências Apreendidas (Cadeia de Custódia)
        const bens = processo.bens || [];
        bens.forEach((bem, i) => {
            const bemId = `bem-${bem.id || i}`;
            const angle = Math.PI * 0.5 + (i * 0.5);
            const radius = 210;
            const x = 450 + Math.cos(angle) * radius;
            const y = 280 + Math.sin(angle) * radius;

            nodeList.push({
                id: bemId,
                label: bem.numero_lacre_seguranca || `Lacre #${i + 1}`,
                sublabel: bem.descricao_bem,
                type: 'BEM_APREENDIDO',
                x,
                y,
                data: {
                    lacre: bem.numero_lacre_seguranca,
                    descricao: bem.descricao_bem,
                    tipo: bem.tipo_objeto,
                    cofre: bem.local_cofre_deposito,
                    apreendido_por: bem.apreendido_por?.nome_completo || 'Piquete SIC',
                },
                risco: 'MEDIO',
            });

            edgeList.push({
                source: 'proc-root',
                target: bemId,
                label: 'Apreendido nos Autos',
                tipo: 'APREENSAO',
            });

            // Se houver arguido detido, vincula a prova ao primeiro arguido
            if (nodeList.some(n => n.type === 'ARGUIDO')) {
                const firstArg = nodeList.find(n => n.type === 'ARGUIDO');
                if (firstArg) {
                    edgeList.push({
                        source: firstArg.id,
                        target: bemId,
                        label: 'Posse no Flagrante',
                        tipo: 'PROVA',
                    });
                }
            }
        });

        // 4. Diligências de Instrução
        const diligencias = processo.diligencias || [];
        diligencias.slice(0, 3).forEach((dil, i) => {
            const dilId = `dil-${dil.id || i}`;
            const x = 200 + (i * 240);
            const y = 90;

            nodeList.push({
                id: dilId,
                label: dil.tipo,
                sublabel: dil.data_realizacao || 'Diligência',
                type: 'DILIGENCIA',
                x,
                y,
                data: {
                    tipo: dil.tipo,
                    descricao: dil.descricao_detalhada,
                    resultado: dil.resultado,
                    responsavel: dil.responsavel?.nome_completo || 'Investigador',
                },
                risco: 'BAIXO',
            });

            edgeList.push({
                source: 'proc-root',
                target: dilId,
                label: 'Diligência Realizada',
                tipo: 'INVESTIGACAO',
            });
        });

        return { nodes: nodeList, edges: edgeList };
    }, [processo]);

    // Filtragem visual
    const filteredNodes = useMemo(() => {
        return nodes.filter(node => {
            const matchesFilter = filterType === 'TODOS' || node.type === filterType;
            const matchesSearch = searchTerm === '' ||
                node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.sublabel.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [nodes, filterType, searchTerm]);

    const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

    const filteredEdges = useMemo(() => {
        return edges.filter(edge => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target));
    }, [edges, filteredNodeIds]);

    const getNodeColor = (type: GraphNode['type']) => {
        switch (type) {
            case 'PROCESSO': return { bg: 'fill-blue-900', border: 'stroke-blue-400', text: 'text-blue-300', dot: 'bg-blue-400' };
            case 'ARGUIDO': return { bg: 'fill-rose-950', border: 'stroke-rose-500', text: 'text-rose-300', dot: 'bg-rose-500' };
            case 'VITIMA': return { bg: 'fill-emerald-950', border: 'stroke-emerald-500', text: 'text-emerald-300', dot: 'bg-emerald-400' };
            case 'TESTEMUNHA': return { bg: 'fill-sky-950', border: 'stroke-sky-500', text: 'text-sky-300', dot: 'bg-sky-400' };
            case 'BEM_APREENDIDO': return { bg: 'fill-amber-950', border: 'stroke-amber-500', text: 'text-amber-300', dot: 'bg-amber-400' };
            case 'DILIGENCIA': return { bg: 'fill-purple-950', border: 'stroke-purple-500', text: 'text-purple-300', dot: 'bg-purple-400' };
            case 'PERICIA': return { bg: 'fill-indigo-950', border: 'stroke-indigo-500', text: 'text-indigo-300', dot: 'bg-indigo-400' };
            default: return { bg: 'fill-slate-900', border: 'stroke-slate-500', text: 'text-slate-300', dot: 'bg-slate-400' };
        }
    };

    return (
        <TacticalLayout title={`Grafo de Vínculos • ${processo.numero_processo}`}>
            <div className="space-y-5 max-w-7xl mx-auto font-sans">
                {/* Abas Superiores do Processo */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="vinculos"
                    actions={
                        <button
                            onClick={() => window.print()}
                            className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Exportar Grafo de Inteligência</span>
                        </button>
                    }
                />

                {/* Barra de Filtros e Ferramentas Tácticas */}
                <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1 mr-1">
                            <Filter className="w-3.5 h-3.5 text-blue-400" /> Filtrar Rede:
                        </span>
                        {[
                            { key: 'TODOS', label: 'Todos os Nós' },
                            { key: 'ARGUIDO', label: 'Arguidos / Suspeitos', color: 'text-rose-400' },
                            { key: 'VITIMA', label: 'Vítimas & Ofendidos', color: 'text-emerald-400' },
                            { key: 'BEM_APREENDIDO', label: 'Armas & Bens (Lacres)', color: 'text-amber-400' },
                            { key: 'DILIGENCIA', label: 'Diligências Policiais', color: 'text-purple-400' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilterType(f.key)}
                                className={`px-2.5 py-1 rounded text-[11px] font-sans transition-colors cursor-pointer border ${
                                    filterType === f.key
                                        ? 'bg-blue-600 text-white border-blue-500 font-medium'
                                        : 'bg-[#152538] text-slate-300 border-[#20344d] hover:bg-[#1e344e]'
                                }`}
                            >
                                <span className={f.color}>{f.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                            <input
                                type="text"
                                placeholder="Localizar pessoa, lacre ou diligência..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1 bg-[#0b1523] border border-[#20344d] rounded text-slate-200 text-xs w-56 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Grade Principal: Visualizador do Grafo (Esquerda) + Ficha Forense de Inteligência (Direita) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* SVG CANVAS DO GRAFO INTERATIVO */}
                    <div className="lg:col-span-2 bg-[#09111c] border border-[#1e2f42] rounded-lg overflow-hidden relative shadow-2xl min-h-[560px] flex flex-col">
                        <div className="px-4 py-2.5 bg-[#0f1b29] border-b border-[#1e2f42] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 font-mono text-slate-300">
                                <Network className="w-4 h-4 text-blue-400" />
                                <span className="font-semibold text-blue-200">Mapa Topológico de Vínculos</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-[11px] text-slate-400">{filteredNodes.length} Entidades • {filteredEdges.length} Conexões</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                                Modo Interativo (Clique nos Nós)
                            </span>
                        </div>

                        <div className="flex-1 w-full h-full relative overflow-auto bg-[radial-gradient(#182a40_1px,transparent_1px)] [background-size:24px_24px]">
                            <svg viewBox="0 0 900 580" className="w-full h-full min-h-[540px]">
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                                    </marker>
                                    <marker id="arrow-red" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                                    </marker>
                                    <marker id="arrow-gold" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                                    </marker>
                                </defs>

                                {/* 1. Linhas de Conexão / Arestas */}
                                {filteredEdges.map((edge, i) => {
                                    const sourceNode = filteredNodes.find(n => n.id === edge.source);
                                    const targetNode = filteredNodes.find(n => n.id === edge.target);
                                    if (!sourceNode || !targetNode) return null;

                                    const isSelected = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);
                                    const strokeColor = edge.tipo === 'AUTORIA' ? '#ef4444' : edge.tipo === 'APREENSAO' ? '#f59e0b' : '#3b82f6';
                                    const markerId = edge.tipo === 'AUTORIA' ? 'url(#arrow-red)' : edge.tipo === 'APREENSAO' ? 'url(#arrow-gold)' : 'url(#arrow)';

                                    const midX = (sourceNode.x + targetNode.x) / 2;
                                    const midY = (sourceNode.y + targetNode.y) / 2;

                                    return (
                                        <g key={`edge-${i}`} className="transition-opacity duration-300">
                                            <line
                                                x1={sourceNode.x}
                                                y1={sourceNode.y}
                                                x2={targetNode.x}
                                                y2={targetNode.y}
                                                stroke={strokeColor}
                                                strokeWidth={isSelected ? '2.5' : '1.2'}
                                                strokeDasharray={edge.tipo === 'INVESTIGACAO' ? '4 3' : 'none'}
                                                opacity={isSelected ? 1 : 0.65}
                                                markerEnd={markerId}
                                            />
                                            {/* Rótulo da Relação */}
                                            <rect
                                                x={midX - 35}
                                                y={midY - 9}
                                                width="70"
                                                height="18"
                                                rx="4"
                                                fill="#070d14"
                                                stroke={strokeColor}
                                                strokeWidth="0.8"
                                                opacity="0.9"
                                            />
                                            <text
                                                x={midX}
                                                y={midY + 3}
                                                textAnchor="middle"
                                                fill="#cbd5e1"
                                                fontSize="8.5"
                                                fontFamily="monospace"
                                            >
                                                {edge.label}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* 2. Nós Interativos */}
                                {filteredNodes.map(node => {
                                    const colors = getNodeColor(node.type);
                                    const isSelected = selectedNode?.id === node.id;
                                    const isCenter = node.type === 'PROCESSO';

                                    return (
                                        <g
                                            key={node.id}
                                            transform={`translate(${node.x}, ${node.y})`}
                                            onClick={() => setSelectedNode(node)}
                                            className="cursor-pointer group"
                                        >
                                            {/* Efeito de Destaque / Pulsação para Nó Selecionado */}
                                            {isSelected && (
                                                <circle
                                                    r={isCenter ? 44 : 32}
                                                    fill="none"
                                                    stroke="#60a5fa"
                                                    strokeWidth="2"
                                                    strokeDasharray="4 4"
                                                    className="animate-spin"
                                                    style={{ animationDuration: '6s' }}
                                                />
                                            )}

                                            {/* Círculo Principal do Nó */}
                                            <circle
                                                r={isCenter ? 36 : 24}
                                                className={`${colors.bg} ${colors.border} transition-all duration-200 group-hover:scale-110`}
                                                strokeWidth={isSelected ? '3' : '1.5'}
                                                filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.6))"
                                            />

                                            {/* Ícone ou Indicador interno */}
                                            <circle
                                                r={isCenter ? 8 : 5}
                                                className={colors.dot}
                                            />

                                            {/* Rótulo e Subtítulo */}
                                            <text
                                                y={isCenter ? 50 : 36}
                                                textAnchor="middle"
                                                fill="#f8fafc"
                                                fontSize={isCenter ? '11' : '9.5'}
                                                fontWeight={isCenter ? 'bold' : '600'}
                                                className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                                            >
                                                {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                                            </text>
                                            <text
                                                y={isCenter ? 62 : 46}
                                                textAnchor="middle"
                                                fill="#94a3b8"
                                                fontSize={isCenter ? '9' : '8'}
                                                fontFamily="monospace"
                                            >
                                                {node.sublabel.length > 24 ? node.sublabel.substring(0, 22) + '...' : node.sublabel}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Legenda de Tipologia no Fundo */}
                        <div className="p-2.5 bg-[#0b1523] border-t border-[#1e2f42] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Processo Central</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Arguidos / Cúmplices</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Vítimas</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Provas e Armas (Lacres)</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Diligências do SIC</span>
                            </div>
                        </div>
                    </div>

                    {/* FICHA LATERAL DE INTELIGÊNCIA CRIMINAL & RISCO FORENSE */}
                    <div className="space-y-4">
                        <TacticalCard
                            title={selectedNode ? `Inteligência: ${selectedNode.label}` : 'Ficha de Inteligência do Nó'}
                            icon={<ShieldAlert className="w-4 h-4 text-[#c5a059]" />}
                        >
                            {selectedNode ? (
                                <div className="space-y-4 text-xs font-sans">
                                    <div className="p-3 bg-[#0d1a26] border border-[#20344d] rounded-md space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Tipo de Entidade</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                selectedNode.type === 'ARGUIDO' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                                selectedNode.type === 'BEM_APREENDIDO' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                                selectedNode.type === 'VITIMA' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                                'bg-blue-950 text-blue-300 border border-blue-800'
                                            }`}>
                                                {selectedNode.type}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-100">{selectedNode.label}</h3>
                                        <p className="text-[11px] text-slate-300">{selectedNode.sublabel}</p>
                                    </div>

                                    {/* Detalhes específicos conforme o tipo de nó */}
                                    {selectedNode.type === 'ARGUIDO' && (
                                        <div className="space-y-2 text-slate-300 text-[11px] font-mono bg-[#080d14] p-3 rounded border border-[#1e2f42]">
                                            <div><span className="text-slate-500">Nome Completo:</span> {selectedNode.data.nome}</div>
                                            <div><span className="text-slate-500">B.I. nº:</span> {selectedNode.data.bi}</div>
                                            <div><span className="text-slate-500">Nacionalidade:</span> {selectedNode.data.nacionalidade}</div>
                                            <div><span className="text-slate-500">Situação Prisional:</span> <span className="text-amber-400 font-bold">{selectedNode.data.estado_custodia}</span></div>
                                            {selectedNode.data.data_detencao && (
                                                <div><span className="text-slate-500">Capturado em:</span> {selectedNode.data.data_detencao}</div>
                                            )}
                                        </div>
                                    )}

                                    {selectedNode.type === 'BEM_APREENDIDO' && (
                                        <div className="space-y-2 text-slate-300 text-[11px] font-mono bg-[#080d14] p-3 rounded border border-[#1e2f42]">
                                            <div><span className="text-slate-500">Lacre Inviolável:</span> <strong className="text-amber-400">{selectedNode.data.lacre}</strong></div>
                                            <div><span className="text-slate-500">Categoria:</span> {selectedNode.data.tipo}</div>
                                            <div><span className="text-slate-500">Depósito/Cofre:</span> {selectedNode.data.cofre}</div>
                                            <div><span className="text-slate-500">Apreendido por:</span> {selectedNode.data.apreendido_por}</div>
                                        </div>
                                    )}

                                    {selectedNode.type === 'PROCESSO' && (
                                        <div className="space-y-2 text-slate-300 text-[11px] font-mono bg-[#080d14] p-3 rounded border border-[#1e2f42]">
                                            <div><span className="text-slate-500">Número Oficial:</span> {selectedNode.data.numero}</div>
                                            <div><span className="text-slate-500">Incidência Penal:</span> {selectedNode.data.crime}</div>
                                            <div><span className="text-slate-500">Magistrado Titular:</span> {selectedNode.data.magistrado}</div>
                                            <div><span className="text-slate-500">Instrutor do SIC:</span> {selectedNode.data.investigador}</div>
                                            <div><span className="text-slate-500">Província:</span> {selectedNode.data.provincia}</div>
                                        </div>
                                    )}

                                    {/* Análise de Risco & Reincidência */}
                                    <div className="p-3 bg-[#0d1723] rounded border border-blue-900/50 space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                                            <Scale className="w-3.5 h-3.5" />
                                            <span>Grau de Centralidade & Risco</span>
                                        </div>
                                        <p className="text-[11px] text-slate-300">
                                            Entidade conectada a {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} vértices probatórios nos autos.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 font-mono text-xs space-y-2">
                                    <Share2 className="w-8 h-8 text-slate-600 mx-auto" />
                                    <p>Clique em qualquer nó ou interveniente no mapa topológico para carregar a ficha de inteligência criminal associada.</p>
                                </div>
                            )}
                        </TacticalCard>

                        {/* Cartão de Ações Rápidas de Investigação (Totalmente Dinâmico da BD) */}
                        <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-3 text-xs space-y-2">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center justify-between">
                                <span>Cruzamento de Inteligência (BD Real)</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            </span>
                            
                            <div className="flex items-center justify-between text-slate-300 text-[11px] py-1.5 border-b border-[#1e2f42]">
                                <span>Controlo Fronteiriço (SME)</span>
                                <span className={`font-bold font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                    cruzamento_inteligencia?.tem_interdicao_sme
                                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                }`}>
                                    {cruzamento_inteligencia?.tem_interdicao_sme ? '⚠️ Interdição Ativa' : '🟢 Regular no SME'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300 text-[11px] py-1.5 border-b border-[#1e2f42]">
                                <span>Laboratório de Criminalística</span>
                                <span className="font-bold font-mono text-[10px] text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                                    {cruzamento_inteligencia?.pericias_total > 0
                                        ? `🔬 ${cruzamento_inteligencia.pericias_concluidas}/${cruzamento_inteligencia.pericias_total} Laudos`
                                        : 'Sem Laudos Pendentes'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300 text-[11px] py-1.5">
                                <span>Auditoria 48h (Art. 63º CRA)</span>
                                <span className={`font-bold font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                    cruzamento_inteligencia?.horas_detencao_max !== null
                                        ? (cruzamento_inteligencia.horas_detencao_max >= 48
                                            ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                            : 'bg-amber-950 text-amber-300 border border-amber-800')
                                        : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {cruzamento_inteligencia?.horas_detencao_max !== null
                                        ? `${cruzamento_inteligencia.horas_detencao_max}h Custódia (${cruzamento_inteligencia.horas_detencao_max >= 48 ? 'EXPIRADO' : 'Em Prazo'})`
                                        : 'Sem Arguidos em Cela'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TacticalLayout>
    );
}
