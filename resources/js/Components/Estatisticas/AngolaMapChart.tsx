import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart3, MapPin, TrendingUp, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { Provincia } from '@/types';
import rawMapData from './angolaMapData.json';

interface AngolaMapChartProps {
    provincias: (Provincia & { ocorrencias_count: number; processos_count: number })[];
    dataInicio?: string;
    dataFim?: string;
}

// Mapeamento dos macro-territórios das 21 Províncias de Angola
const MACRO_REGIOES: Record<string, string[]> = {
    'NORTE': ['Cabinda', 'Zaire', 'Uíge', 'Bengo', 'Luanda', 'Icolo e Bengo', 'Cuanza Norte'],
    'CENTRO': ['Cuanza Sul', 'Benguela', 'Huambo', 'Bié', 'Malanje'],
    'LESTE': ['Lunda Norte', 'Lunda Sul', 'Moxico', 'Moxico Leste'],
    'SUL': ['Huíla', 'Namibe', 'Cunene', 'Cuando', 'Cubango'],
};

// Coordenadas das 21 Províncias no SVG (viewBox 0 0 960 1080)
const CENTROIDES_PROVINCIAS: Record<string, { cx: number; cy: number; iso: string }> = {
    'Cabinda': { cx: 70, cy: 70, iso: 'CAB' },
    'Zaire': { cx: 165, cy: 195, iso: 'ZAI' },
    'Uíge': { cx: 315, cy: 250, iso: 'UIG' },
    'Bengo': { cx: 190, cy: 360, iso: 'BGO' },
    'Luanda': { cx: 140, cy: 380, iso: 'LUA' },
    'Icolo e Bengo': { cx: 185, cy: 420, iso: 'ICB' },
    'Cuanza Norte': { cx: 265, cy: 375, iso: 'CNO' },
    'Malanje': { cx: 430, cy: 430, iso: 'MAL' },
    'Lunda Norte': { cx: 605, cy: 360, iso: 'LNO' },
    'Lunda Sul': { cx: 710, cy: 490, iso: 'LSU' },
    'Cuanza Sul': { cx: 275, cy: 515, iso: 'CSU' },
    'Benguela': { cx: 195, cy: 695, iso: 'BGU' },
    'Huambo': { cx: 330, cy: 665, iso: 'HUA' },
    'Bié': { cx: 470, cy: 630, iso: 'BIE' },
    'Moxico': { cx: 680, cy: 660, iso: 'MOX' },
    'Moxico Leste': { cx: 830, cy: 620, iso: 'MXL' },
    'Huíla': { cx: 270, cy: 830, iso: 'HUI' },
    'Namibe': { cx: 100, cy: 900, iso: 'NAM' },
    'Cunene': { cx: 290, cy: 950, iso: 'CNN' },
    'Cuando': { cx: 480, cy: 880, iso: 'CDO' },
    'Cubango': { cx: 680, cy: 930, iso: 'CBG' },
};

export const AngolaMapChart: React.FC<AngolaMapChartProps> = ({
    provincias,
    dataInicio,
    dataFim,
}) => {
    const [selectedProvinciaNome, setSelectedProvinciaNome] = useState<string | null>('Luanda');
    const [hoveredProvinciaNome, setHoveredProvinciaNome] = useState<string | null>(null);
    const [regiaoFiltro, setRegiaoFiltro] = useState<'TODAS' | 'NORTE' | 'CENTRO' | 'LESTE' | 'SUL'>('TODAS');

    // Referências para cada item da lista de ranking para permitir scroll automático ao clicar no mapa
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Normalização de nomes entre geometrias e base de dados
    const normalizeName = (name: string): string => {
        if (name === 'Cuando Cubango') return 'Cuando';
        return name;
    };

    // Mapeamento rápido de contagens por nome de província
    const statsPorNome = useMemo(() => {
        const map = new Map<string, { ocorrencias: number; processos: number; iso: string }>();
        provincias.forEach((p) => {
            map.set(p.nome, {
                ocorrencias: p.ocorrencias_count || 0,
                processos: p.processos_count || 0,
                iso: p.codigo_iso || 'AO',
            });
        });
        return map;
    }, [provincias]);

    const maxOcorrencias = useMemo(() => {
        return Math.max(1, ...provincias.map((p) => p.ocorrencias_count || 0));
    }, [provincias]);

    // Função de clique na província (seja pelo mapa SVG, marcador ou lista)
    const handleSelectProvincia = (rawName: string) => {
        const target = normalizeName(rawName);
        setSelectedProvinciaNome(target);
        setHoveredProvinciaNome(target);

        // Se a província pertencer a outra região filtrada, reseta o filtro para TODAS
        if (regiaoFiltro !== 'TODAS' && !MACRO_REGIOES[regiaoFiltro]?.includes(target)) {
            setRegiaoFiltro('TODAS');
        }

        // Foca e faz scroll suave até o item correspondente no ranking lateral
        setTimeout(() => {
            if (itemRefs.current[target]) {
                itemRefs.current[target]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }, 50);
    };

    // Província ativa para exibição no card de detalhes
    const activeProvNome = hoveredProvinciaNome || selectedProvinciaNome || 'Luanda';
    const activeStats = statsPorNome.get(activeProvNome) || {
        ocorrencias: 0,
        processos: 0,
        iso: 'AO',
    };

    const taxaInstauracao =
        activeStats.ocorrencias > 0
            ? ((activeStats.processos / activeStats.ocorrencias) * 100).toFixed(1)
            : '0.0';

    // Províncias ordenadas para o gráfico de barras
    const provinciasOrdenadas = useMemo(() => {
        return [...provincias]
            .filter((p) => {
                if (regiaoFiltro === 'TODAS') return true;
                return MACRO_REGIOES[regiaoFiltro]?.includes(p.nome);
            })
            .sort((a, b) => (b.ocorrencias_count || 0) - (a.ocorrencias_count || 0));
    }, [provincias, regiaoFiltro]);

    const totalNacionalOcorrencias = useMemo(() => {
        return provincias.reduce((acc, p) => acc + (p.ocorrencias_count || 0), 0);
    }, [provincias]);

    // Cor do mapa coroplético
    const getChoroplethColor = (ocorrencias: number, isHovered: boolean, isSelected: boolean) => {
        if (isSelected) return '#2563eb'; // Destaque selecionado
        if (isHovered) return '#1d4ed8'; // Hover

        if (ocorrencias === 0) return '#132235'; // Sem ocorrência
        if (ocorrencias >= maxOcorrencias * 0.7) return '#dc2626'; // Alta incidência
        if (ocorrencias >= maxOcorrencias * 0.3) return '#d97706'; // Média incidência
        return '#0284c7'; // Baixa incidência
    };

    return (
        <section className="w-full bg-[#132235] border border-[#223750] rounded-lg overflow-hidden shadow-sm flex flex-col">
            {/* Cabeçalho do Gráfico de Mapa */}
            <div className="px-4 py-3.5 border-b border-[#223750] bg-[#0f1b2b] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#17283c] border border-[#223750] text-[#c5a059] rounded-md shadow-sm">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                            Mapa Cartográfico de Incidência Criminal — 21 Províncias de Angola
                        </h2>
                        <p className="text-[11px] text-slate-400 font-sans">
                            Gráfico coroplético vetorial interativo // Total Nacional: <strong>{totalNacionalOcorrencias}</strong> ocorrências
                        </p>
                    </div>
                </div>

                {/* Filtro por Macro-Regiões */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-sans text-slate-400 mr-1 hidden sm:inline">Região:</span>
                    {(['TODAS', 'NORTE', 'CENTRO', 'LESTE', 'SUL'] as const).map((reg) => (
                        <button
                            key={reg}
                            type="button"
                            onClick={() => setRegiaoFiltro(reg)}
                            className={`px-2.5 py-1 rounded text-xs font-sans transition-colors cursor-pointer ${
                                regiaoFiltro === reg
                                    ? 'bg-[#1d4ed8] text-white font-semibold shadow-sm'
                                    : 'bg-[#0d1a26] text-slate-400 hover:text-slate-200 border border-[#223750]'
                            }`}
                        >
                            {reg === 'TODAS' ? 'Todas (21)' : reg}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout em Grid Otimizado (Sem espaços vazios no fundo) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
                {/* Coluna do Mapa SVG (7 Colunas) */}
                <div className="lg:col-span-7 p-4 bg-[#09131d] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#223750]">
                    {/* SVG Map Chart de Angola */}
                    <div className="w-full max-w-[560px] mx-auto aspect-[960/1080] relative flex items-center justify-center">
                        <svg
                            viewBox="0 0 960 1080"
                            className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] select-none"
                        >
                            {/* Polígonos das Províncias */}
                            {rawMapData.map((provData) => {
                                const rawName = provData.name;
                                const normalized = normalizeName(rawName);
                                const stats = statsPorNome.get(normalized) || { ocorrencias: 0 };
                                const isSelected = selectedProvinciaNome === normalized;
                                const isHovered = hoveredProvinciaNome === normalized;
                                const color = getChoroplethColor(stats.ocorrencias, isHovered, isSelected);

                                return (
                                    <path
                                        key={rawName}
                                        d={provData.d}
                                        fill={color}
                                        stroke={isSelected ? '#c5a059' : isHovered ? '#60a5fa' : '#223750'}
                                        strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.2}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        className="transition-all duration-200 cursor-pointer"
                                        onMouseEnter={() => setHoveredProvinciaNome(normalized)}
                                        onMouseLeave={() => setHoveredProvinciaNome(null)}
                                        onClick={() => handleSelectProvincia(normalized)}
                                    />
                                );
                            })}

                            {/* Marcadores e Rótulos Centrais das 21 Províncias */}
                            {Object.entries(CENTROIDES_PROVINCIAS).map(([nome, { cx, cy, iso }]) => {
                                const stats = statsPorNome.get(nome) || { ocorrencias: 0 };
                                const isSelected = selectedProvinciaNome === nome;
                                const isHovered = hoveredProvinciaNome === nome;
                                const hasData = stats.ocorrencias > 0;

                                return (
                                    <g
                                        key={nome}
                                        transform={`translate(${cx}, ${cy})`}
                                        className="cursor-pointer transition-transform duration-200"
                                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                                        onMouseEnter={() => setHoveredProvinciaNome(nome)}
                                        onMouseLeave={() => setHoveredProvinciaNome(null)}
                                        onClick={() => handleSelectProvincia(nome)}
                                    >
                                        {/* Círculo indicador */}
                                        <circle
                                            r={isSelected ? 15 : isHovered ? 14 : hasData ? 12 : 9}
                                            fill={isSelected ? '#c5a059' : hasData ? '#0d1a26' : '#17283c'}
                                            stroke={isSelected ? '#ffffff' : hasData ? '#38bdf8' : '#334155'}
                                            strokeWidth={isSelected ? 2.5 : 1.5}
                                            className="transition-all"
                                        />

                                        {/* Número de ocorrências */}
                                        <text
                                            textAnchor="middle"
                                            dy="3.5"
                                            fontSize={isSelected || isHovered ? '10' : '9'}
                                            fontWeight="bold"
                                            fill={isSelected ? '#09131d' : '#f8fafc'}
                                            className="font-sans pointer-events-none"
                                        >
                                            {stats.ocorrencias}
                                        </text>

                                        {/* Código ISO da província */}
                                        <text
                                            textAnchor="middle"
                                            y="-16"
                                            fontSize="9"
                                            fontWeight="700"
                                            fill={isSelected ? '#dfc07a' : isHovered ? '#ffffff' : '#94a3b8'}
                                            className="font-sans pointer-events-none"
                                        >
                                            {iso}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* Legenda Coroplética */}
                    <div className="w-full mt-3 pt-2.5 border-t border-[#223750]/60 flex flex-wrap items-center justify-between text-[11px] font-sans text-slate-400">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase font-semibold text-slate-500">Escala de Incidência:</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-[#132235] border border-[#223750]"></span>
                                <span>0</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-[#0284c7]"></span>
                                <span>Baixa</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-[#d97706]"></span>
                                <span>Média</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-[#dc2626]"></span>
                                <span>Alta</span>
                            </div>
                        </div>

                        <div className="text-[10px] text-slate-400 font-medium">
                            Clique numa província no mapa para sincronizar a lista
                        </div>
                    </div>
                </div>

                {/* Coluna Analítica / Ranking de Incidência à Direita (5 Colunas - Sem Espaço Vazio) */}
                <div className="lg:col-span-5 p-4 bg-[#132235] flex flex-col h-full space-y-3">
                    {/* Card de Foco da Província Ativa/Selecionada */}
                    <div className="bg-[#0d1a26] border border-[#223750] rounded-lg p-3.5 shadow-sm space-y-2.5 shrink-0">
                        <div className="flex items-center justify-between border-b border-[#223750] pb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                                <h3 className="text-sm font-bold text-slate-100 font-sans">
                                    Província de {activeProvNome}
                                </h3>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-[#17283c] border border-[#c5a059]/50 text-[#dfc07a] rounded text-xs font-mono font-bold">
                                    {activeStats.iso}
                                </span>
                                {selectedProvinciaNome === activeProvNome && (
                                    <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-[9px] font-sans font-semibold">
                                        SELECIONADA
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-[#132235] border border-[#223750] rounded-md p-2">
                                <div className="text-[10px] font-sans text-slate-400 font-medium">Ocorrências</div>
                                <div className="text-lg font-bold font-sans text-slate-100 mt-0.5">
                                    {activeStats.ocorrencias}
                                </div>
                            </div>

                            <div className="bg-[#132235] border border-[#223750] rounded-md p-2">
                                <div className="text-[10px] font-sans text-sky-400 font-medium">Inquéritos</div>
                                <div className="text-lg font-bold font-sans text-sky-300 mt-0.5">
                                    {activeStats.processos}
                                </div>
                            </div>

                            <div className="bg-[#132235] border border-[#223750] rounded-md p-2">
                                <div className="text-[10px] font-sans text-emerald-400 font-medium">Taxa Res.</div>
                                <div className="text-lg font-bold font-sans text-emerald-300 mt-0.5">
                                    {taxaInstauracao}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Barras e Ranking de Ocorrências (Preenche Todo o Espaço Vertical) */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between text-xs font-sans text-slate-300 font-semibold border-b border-[#223750] pb-2 mb-2 shrink-0">
                            <span className="flex items-center gap-1.5">
                                <BarChart3 className="w-3.5 h-3.5 text-[#c5a059]" />
                                Ranking de Ocorrências ({provinciasOrdenadas.length} províncias)
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Total</span>
                        </div>

                        {/* Lista com scroll que ocupa até o final da secção */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar min-h-[380px] max-h-[520px]">
                            {provinciasOrdenadas.map((prov, idx) => {
                                const ocorrencias = prov.ocorrencias_count || 0;
                                const percentual =
                                    maxOcorrencias > 0
                                        ? Math.max(8, Math.round((ocorrencias / maxOcorrencias) * 100))
                                        : 8;
                                const isSelected = selectedProvinciaNome === prov.nome;
                                const isHovered = hoveredProvinciaNome === prov.nome;

                                return (
                                    <div
                                        key={prov.id}
                                        ref={(el) => {
                                            itemRefs.current[prov.nome] = el;
                                        }}
                                        onMouseEnter={() => setHoveredProvinciaNome(prov.nome)}
                                        onMouseLeave={() => setHoveredProvinciaNome(null)}
                                        onClick={() => handleSelectProvincia(prov.nome)}
                                        className={`p-2 rounded-md transition-all cursor-pointer border ${
                                            isSelected
                                                ? 'bg-[#1a2e46] border-[#c5a059] shadow-md ring-1 ring-[#c5a059]/50'
                                                : isHovered
                                                ? 'bg-[#17283c] border-[#2563eb]'
                                                : 'bg-[#0d1a26]/80 border-[#223750]/70 hover:border-[#223750] hover:bg-[#132235]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-xs font-sans mb-1.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className={`text-[10px] font-mono w-5 font-semibold ${
                                                        idx < 3 ? 'text-[#c5a059]' : 'text-slate-500'
                                                    }`}
                                                >
                                                    #{idx + 1}
                                                </span>
                                                <span
                                                    className={`font-medium truncate ${
                                                        isSelected ? 'text-[#dfc07a] font-bold' : 'text-slate-200'
                                                    }`}
                                                >
                                                    {prov.nome}
                                                </span>
                                                {isSelected && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shrink-0"></span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-mono font-bold text-xs text-slate-100">
                                                    {ocorrencias}
                                                </span>
                                                <ChevronRight
                                                    className={`w-3 h-3 transition-transform ${
                                                        isSelected ? 'text-[#c5a059] translate-x-0.5' : 'text-slate-600'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full h-1.5 bg-[#17283c] rounded-full overflow-hidden border border-[#223750]/50">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    ocorrencias > 0
                                                        ? isSelected
                                                            ? 'bg-[#c5a059]'
                                                            : 'bg-[#1d4ed8]'
                                                        : 'bg-slate-700'
                                                }`}
                                                style={{ width: `${percentual}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Rodapé do Painel Sem Espaços Mortos */}
                    <div className="pt-2 border-t border-[#223750] flex items-center justify-between text-[11px] font-sans text-slate-400 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>Integração 21 Províncias</span>
                        </div>
                        <span className="font-mono text-slate-300 font-semibold">SIGD-SIC BI</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
