import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers, Maximize2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Provincia } from '@/types';

interface MapaOcorrenciasProvinciaProps {
    provincias: (Provincia & { ocorrencias_count: number; processos_count: number })[];
    dataInicio?: string;
    dataFim?: string;
}

// Coordenadas geográficas das capitais/sedes das 21 Províncias de Angola
const COORDENADAS_PROVINCIAS: Record<string, { lat: number; lng: number }> = {
    'Luanda': { lat: -8.8383, lng: 13.2344 },
    'Benguela': { lat: -12.5763, lng: 13.4055 },
    'Huambo': { lat: -12.7761, lng: 15.7392 },
    'Huíla': { lat: -14.9172, lng: 13.5456 },
    'Cabinda': { lat: -5.5500, lng: 12.2000 },
    'Zaire': { lat: -6.2670, lng: 14.2400 },
    'Cunene': { lat: -17.0667, lng: 15.7333 },
    'Uíge': { lat: -7.6086, lng: 15.0614 },
    'Malanje': { lat: -9.5400, lng: 16.3400 },
    'Bengo': { lat: -8.5786, lng: 13.6644 },
    'Icolo e Bengo': { lat: -9.1200, lng: 13.7200 },
    'Cuanza Sul': { lat: -11.2061, lng: 13.8438 },
    'Cuanza Norte': { lat: -9.2978, lng: 14.9116 },
    'Bié': { lat: -12.3833, lng: 16.9333 },
    'Lunda Norte': { lat: -7.3500, lng: 20.8333 },
    'Lunda Sul': { lat: -9.6608, lng: 20.3916 },
    'Moxico': { lat: -11.7833, lng: 19.9167 },
    'Moxico Leste': { lat: -10.7000, lng: 22.2000 },
    'Namibe': { lat: -15.1961, lng: 12.1522 },
    'Cuando': { lat: -14.6585, lng: 17.6910 },
    'Cubango': { lat: -16.5000, lng: 19.5000 },
};

// Centro geográfico da República de Angola
const ANGOLA_CENTER: [number, number] = [-12.2, 17.5];
const DEFAULT_ZOOM = 6;

export const MapaOcorrenciasProvincia: React.FC<MapaOcorrenciasProvinciaProps> = ({
    provincias,
    dataInicio,
    dataFim,
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);

    const [mapStyle, setMapStyle] = useState<'dark' | 'osm'>('dark');
    const [selectedProvincia, setSelectedProvincia] = useState<string | null>(null);

    // Camadas de tiles gratuitos (100% livres de custo, sem chave de API)
    const TILE_LAYERS = {
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
            subdomains: 'abcd',
        },
        osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            subdomains: 'abc',
        },
    };

    // Inicialização do Mapa Leaflet
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Se o mapa já existe, não recriar
        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: ANGOLA_CENTER,
                zoom: DEFAULT_ZOOM,
                minZoom: 5,
                maxZoom: 14,
                zoomControl: false,
            });

            // Controles de zoom no canto superior direito
            L.control.zoom({ position: 'topright' }).addTo(map);

            // Camada de Tiles
            const currentTileConfig = TILE_LAYERS[mapStyle];
            const tileLayer = L.tileLayer(currentTileConfig.url, {
                attribution: currentTileConfig.attribution,
                maxZoom: currentTileConfig.maxZoom,
                subdomains: currentTileConfig.subdomains,
            }).addTo(map);

            tileLayerRef.current = tileLayer;

            // Grupo de Marcadores
            const markersGroup = L.layerGroup().addTo(map);
            markersLayerRef.current = markersGroup;

            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Atualização de estilo de camada (Dark / OSM)
    useEffect(() => {
        if (!mapInstanceRef.current || !tileLayerRef.current) return;

        const currentTileConfig = TILE_LAYERS[mapStyle];
        mapInstanceRef.current.removeLayer(tileLayerRef.current);

        const newTileLayer = L.tileLayer(currentTileConfig.url, {
            attribution: currentTileConfig.attribution,
            maxZoom: currentTileConfig.maxZoom,
            subdomains: currentTileConfig.subdomains,
        }).addTo(mapInstanceRef.current);

        tileLayerRef.current = newTileLayer;
    }, [mapStyle]);

    // Renderização dos marcadores das 21 províncias
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        const markersGroup = markersLayerRef.current;
        markersGroup.clearLayers();

        // Encontrar maior valor para escalonamento visual
        const maxOcorrencias = Math.max(1, ...provincias.map((p) => p.ocorrencias_count || 0));

        provincias.forEach((prov) => {
            const coords = COORDENADAS_PROVINCIAS[prov.nome];
            if (!coords) return;

            const ocorrencias = prov.ocorrencias_count || 0;
            const processos = prov.processos_count || 0;
            const taxa = ocorrencias > 0 ? ((processos / ocorrencias) * 100).toFixed(1) : '0.0';

            // Determinar cor baseada no volume de ocorrências
            let markerColor = '#10b981'; // Verde (Baixo)
            let pulseClass = '';
            let markerSize = 28;

            if (ocorrencias > 0) {
                if (ocorrencias >= maxOcorrencias * 0.7) {
                    markerColor = '#ef4444'; // Vermelho (Alto)
                    pulseClass = 'animate-ping opacity-75';
                    markerSize = 38;
                } else if (ocorrencias >= maxOcorrencias * 0.3) {
                    markerColor = '#f59e0b'; // Âmbar (Médio)
                    markerSize = 32;
                } else {
                    markerColor = '#3b82f6'; // Azul
                    markerSize = 28;
                }
            }

            // Ícone HTML personalizado para estética tática do SIC
            const customIcon = L.divIcon({
                className: 'custom-sic-marker',
                html: `
                    <div style="position: relative; width: ${markerSize}px; height: ${markerSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        ${ocorrencias > 0 ? `<div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${markerColor}; opacity: 0.35;" class="${pulseClass}"></div>` : ''}
                        <div style="
                            position: relative;
                            width: ${markerSize}px;
                            height: ${markerSize}px;
                            border-radius: 9999px;
                            background-color: #0d1a26;
                            border: 2px solid ${markerColor};
                            box-shadow: 0 0 10px ${markerColor}66;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #ffffff;
                            font-size: ${markerSize < 32 ? '10px' : '11px'};
                            font-weight: 700;
                            font-family: ui-sans-serif, system-ui, sans-serif;
                        ">
                            ${ocorrencias}
                        </div>
                        <div style="
                            position: absolute;
                            top: -16px;
                            left: 50%;
                            transform: translateX(-50%);
                            background-color: #132235;
                            border: 1px solid #223750;
                            border-radius: 4px;
                            padding: 1px 4px;
                            font-size: 9px;
                            color: #cbd5e1;
                            font-weight: 600;
                            white-space: nowrap;
                            pointer-events: none;
                        ">
                            ${prov.codigo_iso || prov.nome.substring(0, 3).toUpperCase()}
                        </div>
                    </div>
                `,
                iconSize: [markerSize, markerSize],
                iconAnchor: [markerSize / 2, markerSize / 2],
            });

            const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });

            // Popup informativo do SIC com os dados oficiais da província
            const popupContent = `
                <div style="
                    font-family: ui-sans-serif, system-ui, sans-serif;
                    background-color: #0d1a26;
                    color: #f1f5f9;
                    border: 1px solid #223750;
                    border-radius: 6px;
                    padding: 12px;
                    min-width: 220px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
                ">
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #223750; padding-bottom: 6px; margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 13px; color: #ffffff;">${prov.nome}</span>
                        <span style="background-color: #17283c; border: 1px solid #c5a059; color: #dfc07a; font-size: 10px; padding: 1px 5px; border-radius: 3px; font-weight: 600;">
                            ${prov.codigo_iso}
                        </span>
                    </div>

                    <div style="display: grid; gap: 6px; font-size: 11px;">
                        <div style="display: flex; justify-content: space-between; color: #94a3b8;">
                            <span>Ocorrências Registadas:</span>
                            <span style="font-weight: 700; color: #f8fafc;">${ocorrencias}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; color: #94a3b8;">
                            <span>Inquéritos Instaurados:</span>
                            <span style="font-weight: 700; color: #60a5fa;">${processos}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; color: #94a3b8;">
                            <span>Taxa de Instauração:</span>
                            <span style="font-weight: 700; color: #34d399;">${taxa}%</span>
                        </div>
                    </div>

                    <div style="margin-top: 10px; padding-top: 6px; border-top: 1px solid #223750; display: flex; align-items: center; justify-content: space-between; font-size: 10px;">
                        <span style="color: #10b981; font-weight: 600;">● Comando Integrado</span>
                        <span style="color: #64748b;">SIGD-SIC 2026</span>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, {
                className: 'sic-custom-leaflet-popup',
                closeButton: true,
                offset: [0, -10],
            });

            marker.on('click', () => {
                setSelectedProvincia(prov.nome);
            });

            markersGroup.addLayer(marker);
        });
    }, [provincias]);

    const handleResetView = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(ANGOLA_CENTER, DEFAULT_ZOOM, {
                animate: true,
            });
            setSelectedProvincia(null);
        }
    };

    const totalOcorrenciasNoMapa = provincias.reduce((acc, p) => acc + (p.ocorrencias_count || 0), 0);

    return (
        <section className="w-full bg-[#132235] border border-[#223750] rounded-lg overflow-hidden shadow-sm flex flex-col">
            {/* Cabeçalho da Secção de Toda a Largura */}
            <div className="px-4 py-3 border-b border-[#223750] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f1b2b]">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#17283c] border border-[#223750] text-[#c5a059] rounded-md shadow-sm">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
                            Mapa de Ocorrências e Incidência por Província (21 Províncias)
                        </h2>
                        <p className="text-[11px] text-slate-400 font-sans">
                            Cartografia geoespacial gratuita baseada em OpenStreetMap // {totalOcorrenciasNoMapa} ocorrências distribuídas no território nacional
                        </p>
                    </div>
                </div>

                {/* Controles do Mapa */}
                <div className="flex items-center gap-2">
                    {/* Seletor de Camada */}
                    <div className="flex items-center bg-[#0d1a26] border border-[#223750] rounded-md p-0.5 text-xs font-sans">
                        <button
                            type="button"
                            onClick={() => setMapStyle('dark')}
                            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                                mapStyle === 'dark'
                                    ? 'bg-[#1d4ed8] text-white font-semibold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Tático Noturno
                        </button>
                        <button
                            type="button"
                            onClick={() => setMapStyle('osm')}
                            className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                                mapStyle === 'osm'
                                    ? 'bg-[#1d4ed8] text-white font-semibold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            OpenStreetMap
                        </button>
                    </div>

                    {/* Botão Resetar Visão */}
                    <button
                        type="button"
                        onClick={handleResetView}
                        className="px-2.5 py-1.5 bg-[#17283c] hover:bg-[#1e334d] border border-[#223750] text-slate-300 hover:text-white rounded-md text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Centrar mapa na República de Angola"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span className="hidden md:inline">Centrar Angola</span>
                    </button>
                </div>
            </div>

            {/* Contentor do Mapa (Altura razoável: 480px, Largura total: 100%) */}
            <div className="relative w-full h-[480px] bg-[#09131d]">
                <div ref={mapContainerRef} className="w-full h-full z-0" />

                {/* Legenda Flutuante Tática no Rodapé do Mapa */}
                <div className="absolute bottom-3 left-3 bg-[#09131d]/90 backdrop-blur-md border border-[#223750] p-2.5 rounded-md text-[11px] font-sans text-slate-300 z-[1000] shadow-xl space-y-1.5 hidden sm:block">
                    <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        Incidência por Província
                    </div>
                    <div className="flex items-center gap-4 text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
                            <span>0 - Baixa</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span>
                            <span>Moderada</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
                            <span>Média</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse"></span>
                            <span>Elevada</span>
                        </div>
                    </div>
                </div>

                {/* Resumo do Território Flutuante no Canto Superior Esquerdo */}
                <div className="absolute top-3 left-3 bg-[#09131d]/90 backdrop-blur-md border border-[#223750] px-3 py-2 rounded-md text-xs font-sans text-slate-200 z-[1000] shadow-xl flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-semibold text-slate-100">21 Províncias Conectadas</span>
                    </div>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 text-[11px]">
                        {dataInicio ? `Filtro: ${dataInicio} a ${dataFim || 'Hoje'}` : 'Período Histórico Geral'}
                    </span>
                </div>
            </div>

            {/* Rodapé Informativo */}
            <div className="px-4 py-2 bg-[#0f1b2b] border-t border-[#223750] text-[11px] font-sans text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Dados georreferenciados consolidados sob soberania de dados do SIC e MININT</span>
                </div>
                <div>
                    Clique nos marcadores circulares de cada província para consultar o detalhe de ocorrências e inquéritos.
                </div>
            </div>
        </section>
    );
};
