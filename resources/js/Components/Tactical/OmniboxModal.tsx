import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, User, FolderOpen, FileText, ShieldAlert, Lock, X, CornerDownLeft } from 'lucide-react';

interface ResultItem {
    categoria: string;
    titulo: string;
    subtitulo: string;
    url: string;
    icone: string;
    badge: string;
    badge_cor: string;
}

interface OmniboxModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const OmniboxModal: React.FC<OmniboxModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(() => {
            fetch(`/api/quick-search?q=${encodeURIComponent(query.trim())}`)
                .then((res) => res.json())
                .then((data) => {
                    setResults(data.resultados || []);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }, 150);

        return () => clearTimeout(timeout);
    }, [query]);

    if (!isOpen) return null;

    const handleSelect = (url: string) => {
        onClose();
        router.visit(url);
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'user':
                return <User className="w-4 h-4 text-sky-400" />;
            case 'folder-open':
                return <FolderOpen className="w-4 h-4 text-[#C5A059]" />;
            case 'file-text':
                return <FileText className="w-4 h-4 text-emerald-400" />;
            case 'shield-alert':
                return <ShieldAlert className="w-4 h-4 text-rose-400" />;
            case 'lock':
                return <Lock className="w-4 h-4 text-[#DFC07A]" />;
            default:
                return <Search className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-2xl bg-[#0D1525] border border-[#1E2E48] rounded-[6px] shadow-2xl overflow-hidden glow-gold">
                {/* Cabeçalho de Busca */}
                <div className="flex items-center px-4 py-3 border-b border-[#1E2E48] bg-[#131F33]">
                    <Search className="w-5 h-5 text-[#C5A059] mr-3 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Busca Tática Omnibox: BI, Passaporte, Nº Processo, Mandado, Lacre ou Auto..."
                        className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0 font-mono"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200 p-1">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#0d1a26] border border-[#1E2E48] rounded">
                        ESC
                    </span>
                </div>

                {/* Lista de Resultados */}
                <div className="max-h-96 overflow-y-auto p-2">
                    {loading && (
                        <div className="py-8 text-center text-xs font-mono text-slate-400 animate-pulse">
                            Consultando arquivos centrais e barramento de dados...
                        </div>
                    )}

                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div className="py-8 text-center text-xs font-mono text-slate-500">
                            Nenhum registo localizado para "{query}".
                        </div>
                    )}

                    {!loading && query.length < 2 && (
                        <div className="py-6 px-4 text-center text-xs text-slate-500 font-mono">
                            Digite pelo menos 2 caracteres para busca unificada em todas as 21 províncias.
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="space-y-1">
                            {results.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelect(item.url)}
                                    className="flex items-center justify-between p-2.5 rounded-[4px] bg-[#131F33]/60 hover:bg-[#1E2E48] cursor-pointer transition-colors border border-transparent hover:border-[#C5A059]/40 group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 bg-[#0d1a26] rounded border border-[#1E2E48]">
                                            {getIcon(item.icone)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                                                    {item.categoria}
                                                </span>
                                                <span className="text-[10px] font-mono px-1 rounded bg-[#0d1a26] text-slate-300 border border-[#1E2E48]">
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <div className="text-sm font-semibold text-slate-100 group-hover:text-[#C5A059] transition-colors truncate font-mono">
                                                {item.titulo}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate">{item.subtitulo}</div>
                                        </div>
                                    </div>
                                    <CornerDownLeft className="w-4 h-4 text-slate-500 group-hover:text-[#C5A059] shrink-0 ml-2" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé Tático */}
                <div className="px-4 py-2 bg-[#0d1a26] border-t border-[#1E2E48] flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <div>Atalho Global: <kbd className="text-[#C5A059]">Ctrl + K</kbd></div>
                    <div>Serviço de Investigação Criminal — MININT Angola</div>
                </div>
            </div>
        </div>
    );
};
