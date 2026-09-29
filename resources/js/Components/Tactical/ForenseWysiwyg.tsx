import React, { useRef, useEffect, useState } from 'react';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Clock,
    FileCode,
    FileText,
    RotateCcw,
    ShieldCheck,
} from 'lucide-react';

interface ForenseWysiwygProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    showTemplates?: boolean;
}

export const ForenseWysiwyg: React.FC<ForenseWysiwygProps> = ({
    value,
    onChange,
    placeholder = 'Redija os factos ou a peça processual formal...',
    className = '',
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');

    // Sincroniza o conteúdo externo com a folha editável quando o valor ou o modo de exibição muda
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value, viewMode]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (cmd: string, val: string | undefined = undefined) => {
        document.execCommand(cmd, false, val);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const insertCarimbo = () => {
        const carimbo = `<div style="display:inline-block; padding: 4px 8px; border: 1px dashed #c5a059; color: #c5a059; font-family: monospace; font-size: 11px; margin: 6px 0; border-radius: 4px;">
            [REGISTO SIC: ${new Date().toLocaleDateString('pt-AO')} às ${new Date().toLocaleTimeString('pt-AO')}]
        </div><p></p>`;
        execCmd('insertHTML', carimbo);
    };

    return (
        <div className={`border border-[#20344d] rounded-md bg-[#09131d] overflow-hidden flex flex-col shadow-sm ${className}`}>
            {/* Barra de Ferramentas Forense */}
            <div className="flex flex-wrap items-center justify-between p-2.5 bg-[#122235] border-b border-[#20344d] gap-2">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => execCmd('bold')}
                        title="Negrito Forense (Ctrl+B)"
                        className="p-1.5 hover:bg-[#1a314d] text-slate-300 hover:text-white rounded border border-transparent hover:border-[#20344d] transition-colors cursor-pointer"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('italic')}
                        title="Itálico / Citação (Ctrl+I)"
                        className="p-1.5 hover:bg-[#1a314d] text-slate-300 hover:text-white rounded border border-transparent hover:border-[#20344d] transition-colors cursor-pointer"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('underline')}
                        title="Sublinhado Legal"
                        className="p-1.5 hover:bg-[#1a314d] text-slate-300 hover:text-white rounded border border-transparent hover:border-[#20344d] transition-colors cursor-pointer"
                    >
                        <Underline className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-[1px] bg-[#20344d] mx-1"></div>

                    <button
                        type="button"
                        onClick={() => execCmd('insertUnorderedList')}
                        title="Lista de Factos"
                        className="p-1.5 hover:bg-[#1a314d] text-slate-300 hover:text-white rounded border border-transparent hover:border-[#20344d] transition-colors cursor-pointer"
                    >
                        <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCmd('insertOrderedList')}
                        title="Numeração Legal"
                        className="p-1.5 hover:bg-[#1a314d] text-slate-300 hover:text-white rounded border border-transparent hover:border-[#20344d] transition-colors cursor-pointer"
                    >
                        <ListOrdered className="w-3.5 h-3.5" />
                    </button>

                    <div className="h-4 w-[1px] bg-[#20344d] mx-1"></div>

                    <button
                        type="button"
                        onClick={insertCarimbo}
                        title="Inserir Carimbo Temporal SIC"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0d1a26] hover:bg-[#1a314d] text-slate-200 text-xs font-sans rounded border border-[#20344d] hover:border-[#c5a059]/50 transition-colors cursor-pointer"
                    >
                        <Clock className="w-3 h-3 text-[#c5a059]" />
                        <span>Carimbo Oficial</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#0d1a26] p-0.5 rounded border border-[#20344d]">
                        <button
                            type="button"
                            onClick={() => setViewMode('visual')}
                            className={`px-2.5 py-1 text-xs font-sans rounded flex items-center gap-1 transition-colors cursor-pointer ${
                                viewMode === 'visual'
                                    ? 'bg-[#17283c] text-white font-medium border border-[#20344d]'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <FileText className="w-3 h-3 text-[#c5a059]" />
                            <span>Documento</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('code')}
                            className={`px-2.5 py-1 text-xs font-sans rounded flex items-center gap-1 transition-colors cursor-pointer ${
                                viewMode === 'code'
                                    ? 'bg-[#17283c] text-white font-medium border border-[#20344d]'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <FileCode className="w-3 h-3 text-slate-400" />
                            <span>Código HTML</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Folha Oficial do Documento (A4 Digital) */}
            <div className="p-4 sm:p-6 bg-[#080e16] min-h-[480px] flex justify-center overflow-x-auto">
                {viewMode === 'visual' ? (
                    <div className="w-full max-w-4xl bg-[#0e1b2a] border border-[#20344d] rounded-md shadow-lg p-6 sm:p-10 text-slate-100 font-sans text-xs leading-relaxed focus-within:border-[#c5a059]/60 transition-colors">
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleInput}
                            onBlur={handleInput}
                            onKeyUp={handleInput}
                            className="outline-none min-h-[380px] space-y-3 prose prose-invert max-w-none text-slate-200 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-100 [&_h4]:text-xs [&_h4]:font-bold [&_h4]:text-slate-200 [&_p]:mb-3 [&_strong]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:border-collapse"
                            data-placeholder={placeholder}
                        />
                    </div>
                ) : (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        rows={18}
                        className="w-full max-w-4xl bg-[#0a1420] text-emerald-300 p-4 font-mono text-xs border border-[#20344d] rounded-md focus:border-[#c5a059] focus:outline-none leading-relaxed"
                        placeholder="Edite o código HTML da peça processual..."
                    />
                )}
            </div>

            <div className="px-4 py-2 bg-[#0d1a26] border-t border-[#20344d] flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Redator Oficial de Peças Processuais — Validação e Assinatura Digital WORM</span>
                </div>
                <span>Clique e edite diretamente o texto na folha.</span>
            </div>
        </div>
    );
};
