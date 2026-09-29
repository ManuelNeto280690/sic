import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import {
    FileText,
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    ArrowRight,
    ZoomIn,
    ZoomOut,
    Shield,
    CheckCircle2,
    Lock,
    ScanText,
    X,
    Eye,
    Sparkles,
    AlertCircle,
    UserCheck,
    FileCheck2,
    ChevronRight,
    MapPin,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import { Provincia, Ocorrencia } from '@/types';

interface CreateProps {
    ocorrencia?: Ocorrencia & {
        intervenientes?: {
            id?: string;
            papel: string;
            nome_identificativo: string;
            contacto_telefone?: string;
            declaracoes_resumo?: string;
        }[];
    };
    is_edit?: boolean;
    provincias: (Provincia & { municipios: any[] })[];
    default_provincia_id?: string;
    tipologias_penais: string[];
    tipos_participacao?: any[];
    papeis_interveniente?: any[];
    pode_ver_todas_provincias?: boolean;
    jurisdicao_usuario?: {
        provincia_id: string | null;
        provincia_nome: string | null;
        municipio_id: string | null;
        municipio_nome: string | null;
        unidade_nome: string | null;
        unidade_sigla: string | null;
        perfil: string | null;
    };
}

// Converte texto normal (com quebras de linha) em HTML limpo para persistência
const convertPlainTextToHtml = (text: string): string => {
    if (!text || !text.trim()) return '<p>Sem descrição circunstanciada registada.</p>';
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs
        .map((p) => {
            const clean = p.trim();
            if (!clean) return '';
            if (/^(AUTO DE NOTÍCIA|[0-9]+\.\s+[A-ZÀ-Ú]+|[A-ZÀ-Ú\s]{6,}:)/.test(clean)) {
                return `<h4><strong>${clean.replace(/\n/g, '<br/>')}</strong></h4>`;
            }
            return `<p>${clean.replace(/\n/g, '<br/>')}</p>`;
        })
        .filter(Boolean)
        .join('\n');
};

// Converte HTML em texto normal puro (sem tags)
const extractPlainTextFromHtml = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>|<\/h4>|<\/h3>/gi, '\n\n')
        .replace(/<[^>]*>/g, '')
        .trim();
};

export default function OcorrenciasCreate({
    ocorrencia,
    is_edit = false,
    provincias,
    default_provincia_id,
    tipologias_penais,
    tipos_participacao,
    papeis_interveniente,
    pode_ver_todas_provincias = true,
    jurisdicao_usuario,
}: CreateProps) {
    // Gestão de Passos (Passo 1: Dados & Intervenientes; Passo 2: Redação em Texto Normal & Folha A4)
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    // Província inicial respeitando a jurisdição do utilizador ou a ocorrência em edição
    const initialProvinciaId = is_edit && ocorrencia
        ? ocorrencia.provincia_id
        : !pode_ver_todas_provincias && jurisdicao_usuario?.provincia_id
        ? jurisdicao_usuario.provincia_id
        : default_provincia_id || (provincias[0] ? provincias[0].id : '');

    // Formatação da data para datetime-local
    let initialDateTime = new Date().toISOString().slice(0, 16);
    if (is_edit && ocorrencia?.data_hora_facto) {
        try {
            const dt = new Date(ocorrencia.data_hora_facto);
            initialDateTime = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        } catch (e) {
            initialDateTime = new Date().toISOString().slice(0, 16);
        }
    }

    // Texto normal padrão ou existente na ocorrência
    const defaultTextoNormal = `AUTO DE NOTÍCIA PRELIMINAR DE CRIME

Aos ${new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}, compareceu nesta Direcção Provincial do Serviço de Investigação Criminal o participador devidamente qualificado nos autos.

1. CIRCUNSTÂNCIAS DO FACTO:
Pelas 21h30, na via pública, elementos armados não identificados interceptaram a vítima, subtraindo valores em moeda fiduciária e equipamentos telefónicos sob ameaça directa à vida.

2. PROVIDÊNCIAS POLICIAIS IMEDIATAS:
Foi accionado o piquete de investigação criminal e preservado o local da ocorrência para realização das perícias preliminares de balística e impressões papilares.`;

    const initialTextoNormal = is_edit && ocorrencia
        ? extractPlainTextFromHtml(ocorrencia.descricao_facto_html)
        : defaultTextoNormal;

    const [textoNormal, setTextoNormal] = useState<string>(initialTextoNormal);

    // Intervenientes iniciais
    const initialIntervenientes = is_edit && ocorrencia?.intervenientes && ocorrencia.intervenientes.length > 0
        ? ocorrencia.intervenientes.map((i) => ({
              papel: i.papel,
              nome_identificativo: i.nome_identificativo,
              contacto_telefone: i.contacto_telefone || '',
              declaracoes_resumo: i.declaracoes_resumo || '',
          }))
        : [
              {
                  papel: 'VITIMA',
                  nome_identificativo: '',
                  contacto_telefone: '',
                  declaracoes_resumo: '',
              },
              {
                  papel: 'SUSPEITO',
                  nome_identificativo: '',
                  contacto_telefone: '',
                  declaracoes_resumo: '',
              },
          ];

    const { data, setData, post, put, processing, errors } = useForm({
        tipo_participacao: is_edit && ocorrencia ? ocorrencia.tipo_participacao : 'EXPEDIENTE_POP',
        origem_pop: is_edit && ocorrencia ? Boolean(ocorrencia.origem_pop) : true,
        documento_pop_escaneado_path: is_edit && ocorrencia ? ocorrencia.documento_pop_escaneado_path || '' : '/storage/autos_pna/amostra_auto_noticia_pna.pdf',
        descricao_facto_html: convertPlainTextToHtml(initialTextoNormal),
        data_hora_facto: initialDateTime,
        provincia_id: initialProvinciaId,
        municipio_id: is_edit && ocorrencia ? ocorrencia.municipio_id || '' : (!pode_ver_todas_provincias && jurisdicao_usuario?.municipio_id ? jurisdicao_usuario.municipio_id : ''),
        local_detalhado: is_edit && ocorrencia ? ocorrencia.local_detalhado || '' : '',
        classificacao_codigo: is_edit && ocorrencia ? ocorrencia.classificacao_codigo : (tipologias_penais[0] || 'CP-ART-398 (Roubo Agravado)'),
        estado: is_edit && ocorrencia ? ocorrencia.estado : 'REGISTADA',
        anexo_nome: 'auto_noticia_original_pna.pdf',
        intervenientes: initialIntervenientes,
    });

    // Modal OCR
    const [ocrModalOpen, setOcrModalOpen] = useState(false);
    const [ocrZoom, setOcrZoom] = useState(100);
    const [ocrTextoExtraido, setOcrTextoExtraido] = useState(
`EXPEDIENTE DA POLÍCIA NACIONAL DE ANGOLA (PNA)
Comando Provincial de Luanda — Esquadra Territorial da Samba
Expediente POP Nº 441/2026

Aos 14 dias do mês corrente, pelas 21h30, compareceu nesta Esquadra Territorial o cidadão Manuel Domingos Kitumba, titular do BI 002198731HA031, queixando-se de roubo qualificado com cano de fogo.

DESCRIÇÃO SUMÁRIA DOS FACTOS:
Quando circulava na via pública junto à rotunda de Talatona, foi interceptado por indivíduos armados que, sob ameaça de pistola Makarov 9mm, subtraíram a quantia de Kz 12.500.000,00 e telemóveis.

SUSPEITO APONTADO NO TERRENO:
Indivíduo conhecido pela alcunha de "Doberman" (Pedro Cassoma).

Remete-se o presente expediente ao Serviço de Investigação Criminal (SIC) para abertura da competente instrução processual preparatória.`
    );

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [validationNotice, setValidationNotice] = useState<string | null>(null);

    const selectedProvincia = provincias.find((p) => p.id === data.provincia_id);
    const municipios = selectedProvincia ? selectedProvincia.municipios : [];

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Atualização de texto normal sincronizando o HTML para persistência
    const handleTextoChange = (newText: string) => {
        setTextoNormal(newText);
        setData('descricao_facto_html', convertPlainTextToHtml(newText));
    };

    // Gestão de Intervenientes
    const addInterveniente = () => {
        setData('intervenientes', [
            ...data.intervenientes,
            { papel: 'TESTEMUNHA', nome_identificativo: '', contacto_telefone: '', declaracoes_resumo: '' },
        ]);
    };

    const removeInterveniente = (index: number) => {
        setData('intervenientes', data.intervenientes.filter((_, i) => i !== index));
    };

    const updateInterveniente = (index: number, field: string, val: string) => {
        const copy = [...data.intervenientes];
        (copy[index] as any)[field] = val;
        setData('intervenientes', copy);
    };

    // Validação ao tentar avançar do Passo 1 para o Passo 2
    const handleNextStep = () => {
        setValidationNotice(null);
        if (!data.local_detalhado.trim()) {
            setValidationNotice('Atenção: Indique a localização detalhada onde o facto ocorreu.');
            return;
        }
        if (!data.municipio_id && municipios.length > 0) {
            setValidationNotice('Atenção: Selecione o município competente.');
            return;
        }
        if (data.intervenientes.length === 0 || !data.intervenientes[0].nome_identificativo.trim()) {
            setValidationNotice('Atenção: Indique o nome do primeiro interveniente (ex: nome da vítima ou queixoso).');
            return;
        }
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Submissão Final do Auto (disparada pelo botão no Passo 2)
    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationNotice(null);

        if (!data.local_detalhado.trim()) {
            setValidationNotice('O campo de localização detalhada é obrigatório.');
            setCurrentStep(1);
            return;
        }
        if (!data.municipio_id && municipios.length > 0) {
            setValidationNotice('Selecione o município no Passo 1.');
            setCurrentStep(1);
            return;
        }
        if (!data.intervenientes[0]?.nome_identificativo?.trim()) {
            setValidationNotice('Identifique o nome do primeiro interveniente no Passo 1.');
            setCurrentStep(1);
            return;
        }
        if (!textoNormal.trim()) {
            setValidationNotice('O texto circunstanciado dos factos não pode estar vazio.');
            return;
        }

        const finalHtml = convertPlainTextToHtml(textoNormal);
        data.descricao_facto_html = finalHtml;

        if (is_edit && ocorrencia) {
            put(route('ocorrencias.update', ocorrencia.id), {
                preserveScroll: true,
                onError: (errs) => {
                    console.error('Erros na atualização do auto:', errs);
                    const firstErr = Object.values(errs)[0];
                    setValidationNotice(`Não foi possível atualizar o auto: ${firstErr}`);
                },
            });
        } else {
            post(route('ocorrencias.store'), {
                preserveScroll: true,
                onError: (errs) => {
                    console.error('Erros no envio do auto:', errs);
                    const firstErr = Object.values(errs)[0];
                    setValidationNotice(`Não foi possível protocolar o auto: ${firstErr}`);
                },
            });
        }
    };

    // Inserção do texto reconhecido pelo OCR
    const handleAplicarOcr = (modo: 'substituir' | 'acrescentar') => {
        let updated = '';
        if (modo === 'substituir') {
            updated = ocrTextoExtraido;
            showToast('Texto do expediente da PNA transferido para o auto com sucesso!');
        } else {
            updated = textoNormal + '\n\n' + ocrTextoExtraido;
            showToast('Texto do expediente PNA anexado aos factos!');
        }
        handleTextoChange(updated);
        setOcrModalOpen(false);
    };

    // Inserção de modelos oficiais em texto normal (sem tags HTML)
    const insertPlainTemplate = (tipo: 'inicio' | 'apreensao' | 'encerramento') => {
        const dataHoje = new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' });
        let snippet = '';
        if (tipo === 'inicio') {
            snippet = `AUTO DE NOTÍCIA PRELIMINAR DE CRIME\n\nAos ${dataHoje}, nesta cidade de ${selectedProvincia?.nome || 'Luanda'}, compareceu perante esta autoridade policial o participador qualificado nos autos.\n\n`;
        } else if (tipo === 'apreensao') {
            snippet = `APREENSÃO E CADEIA DE CUSTÓDIA:\nProcedeu-se à arrecadação e apreensão formal dos objectos materiais e vestígios encontrados no local, lacrados sob a respectiva cadeia de custódia.\n\n`;
        } else {
            snippet = `ENCERRAMENTO:\nE nada mais havendo a constar, lavrou-se o presente auto de notícia que vai devidamente assinado nos termos da legislação processual penal angolana.\n\n`;
        }
        handleTextoChange(textoNormal + '\n\n' + snippet);
        showToast('Fórmula oficial inserida no texto.');
    };

    const displayNumeroAuto = is_edit && ocorrencia
        ? ocorrencia.numero_ocorrencia
        : `OC/${new Date().getFullYear()}/${selectedProvincia?.codigo_iso || 'LUA'}/AUTO-NOVO`;

    return (
        <TacticalLayout title={is_edit ? `Editar Auto ${ocorrencia?.numero_ocorrencia}` : 'Novo Auto de Notícia'}>
            <div className="space-y-4 max-w-7xl mx-auto">
                {/* Toast de Sucesso */}
                {toastMessage && (
                    <div className="fixed top-5 right-5 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-sans animate-in slide-in-from-top">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Banner de Aviso de Validação / Erro */}
                {(validationNotice || Object.keys(errors).length > 0) && (
                    <div className="p-3.5 bg-rose-950/80 border border-rose-600 rounded-lg flex items-start gap-3 text-rose-200 text-xs font-sans shadow-lg animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="font-bold text-white">Atenção ao preenchimento:</div>
                            <div className="mt-0.5">{validationNotice || Object.values(errors)[0]}</div>
                        </div>
                    </div>
                )}

                {/* Cabeçalho e Navegação de Passos (Step Wizard) */}
                <div className="bg-[#132235] border border-[#223750] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                    <div className="flex items-center gap-3">
                        <Link
                            href={is_edit && ocorrencia ? route('ocorrencias.show', ocorrencia.id) : route('ocorrencias.index')}
                            className="p-2 bg-[#0d1a26] hover:bg-[#1e334d] text-slate-300 rounded-md border border-[#223750] transition-colors"
                            title="Voltar"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                    {is_edit ? `Atualização do Auto: ${ocorrencia?.numero_ocorrencia}` : 'Novo Auto de Notícia Preliminar'}
                                </h1>
                                {is_edit && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono bg-[#c5a059]/20 border border-[#c5a059]/60 text-[#c5a059] rounded font-bold">
                                        MODO EDIÇÃO
                                    </span>
                                )}
                                {!pode_ver_todas_provincias && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950/80 border border-amber-600/70 text-amber-300 rounded flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        <span>JURISDIÇÃO: {jurisdicao_usuario?.provincia_nome?.toUpperCase()}</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-sans mt-0.5">
                                {is_edit
                                    ? 'Revisão circunstanciada do auto com gravação na cadeia de auditoria SHA-256'
                                    : 'Emissão formal e assinatura digital com cadeia de auditoria criptográfica SHA-256'}
                            </p>
                        </div>
                    </div>

                    {/* Barra de Passos Sequenciais */}
                    <div className="flex items-center gap-2 bg-[#0d1a26] p-1.5 rounded-lg border border-[#223750] font-sans text-xs">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
                                currentStep === 1
                                    ? 'bg-[#c5a059] text-[#0d1a26] shadow-sm font-bold'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#17283c]'
                            }`}
                        >
                            <span className="w-5 h-5 rounded-full bg-[#0d1a26]/40 flex items-center justify-center text-[10px] font-bold">
                                1
                            </span>
                            <span>Dados & Intervenientes</span>
                        </button>

                        <ChevronRight className="w-4 h-4 text-slate-600" />

                        <button
                            type="button"
                            onClick={handleNextStep}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
                                currentStep === 2
                                    ? 'bg-[#c5a059] text-[#0d1a26] shadow-sm font-bold'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#17283c]'
                            }`}
                        >
                            <span className="w-5 h-5 rounded-full bg-[#0d1a26]/40 flex items-center justify-center text-[10px] font-bold">
                                2
                            </span>
                            <span>Redação & Folha Oficial A4</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* PASSO 1: DADOS GERAIS, TERRITORIAIS E INTERVENIENTES                     */}
                {/* ========================================================================= */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        {/* Bloco 1: Forma de Entrada / Tipo de Participação */}
                        <TacticalCard title="1. Origem e Tipo de Participação Policial" icon={<FileCheck2 className="w-4 h-4 text-[#c5a059]" />}>
                            <div className="space-y-3 font-sans text-xs">
                                <div>
                                    <label className="block text-slate-400 text-[11px] uppercase mb-1.5 font-semibold">
                                        Forma de Entrada do Auto
                                    </label>
                                    <select
                                        value={data.tipo_participacao}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData((prev) => ({
                                                ...prev,
                                                tipo_participacao: val,
                                                origem_pop: val === 'EXPEDIENTE_POP',
                                            }));
                                        }}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-100 p-2.5 rounded-md focus:border-[#c5a059] focus:outline-none font-medium"
                                    >
                                        <option value="EXPEDIENTE_POP">Expediente Remetido pela Polícia de Ordem Pública (PNA / POP)</option>
                                        <option value="PRESENCIAL">Participação Presencial Directa no Piquete do SIC</option>
                                        <option value="TELEFONICA">Denúncia Telefónica / Terminal 111</option>
                                        <option value="DENUNCIA_ANONIMA">Denúncia Anónima Verificada</option>
                                        <option value="OFICIOSA">Iniciativa Oficiosa do Investigador Criminal</option>
                                    </select>
                                </div>

                                {data.origem_pop ? (
                                    <div className="p-3 bg-sky-950/50 border border-sky-800 rounded-md flex items-start gap-2.5 text-sky-200 text-xs">
                                        <Shield className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-sky-100">
                                                Expediente da Polícia de Ordem Pública (PNA) Detetado
                                            </div>
                                            <p className="text-[11px] text-sky-200/90 mt-0.5">
                                                No <strong>Passo 2 (Redação)</strong> terá disponível o <strong>Scanner OCR</strong> para extrair e preencher automaticamente todo o texto do auto físico da esquadra da PNA.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2.5 bg-[#0d1a26] border border-[#223750] rounded-md text-slate-400 text-[11px] flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span>Participação civil/direta. O scanner OCR fica dispensado para este tipo de registo.</span>
                                    </div>
                                )}
                            </div>
                        </TacticalCard>

                        {/* Bloco 2: Circunscrição Territorial e Localização */}
                        <TacticalCard title="2. Circunscrição Territorial e Data do Facto" icon={<MapPin className="w-4 h-4 text-[#c5a059]" />}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold flex items-center justify-between">
                                        <span>Província</span>
                                        {!pode_ver_todas_provincias && (
                                            <span className="text-amber-400 text-[10px] flex items-center gap-1 font-mono">
                                                <Lock className="w-3 h-3" /> Fixa
                                            </span>
                                        )}
                                    </label>
                                    {pode_ver_todas_provincias ? (
                                        <select
                                            value={data.provincia_id}
                                            onChange={(e) => {
                                                setData((prev) => ({
                                                    ...prev,
                                                    provincia_id: e.target.value,
                                                    municipio_id: '',
                                                }));
                                            }}
                                            className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                        >
                                            {provincias.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nome} ({p.codigo_iso})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select
                                            disabled
                                            value={data.provincia_id}
                                            className="w-full bg-[#0b1622] border border-amber-900/50 text-amber-200/90 p-2 rounded-md cursor-not-allowed opacity-90 font-medium"
                                        >
                                            <option value={data.provincia_id}>
                                                {selectedProvincia?.nome || jurisdicao_usuario?.provincia_nome} (Jurisdição Operacional)
                                            </option>
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                        Município *
                                    </label>
                                    <select
                                        value={data.municipio_id}
                                        onChange={(e) => setData('municipio_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                        required
                                    >
                                        <option value="">Selecione o Município...</option>
                                        {municipios.map((m: any) => (
                                            <option key={m.id} value={m.id}>
                                                {m.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                        Data e Hora do Facto *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.data_hora_facto}
                                        onChange={(e) => setData('data_hora_facto', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none [color-scheme:dark]"
                                        required
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                        Local Detalhado do Facto *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.local_detalhado}
                                        onChange={(e) => setData('local_detalhado', e.target.value)}
                                        placeholder="Ex: Avenida Deolinda Rodrigues, junto ao nó viário da Maianga, Luanda"
                                        className="w-full bg-[#0d1a26] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </TacticalCard>

                        {/* Bloco 3: Qualificação Jurídico-Penal */}
                        <TacticalCard title="3. Qualificação Jurídico-Penal (Código Penal Angolano)" icon={<Shield className="w-4 h-4 text-[#c5a059]" />}>
                            <div className="font-sans text-xs">
                                <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                    Tipologia Penal Principal
                                </label>
                                <select
                                    value={data.classificacao_codigo}
                                    onChange={(e) => setData('classificacao_codigo', e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#223750] text-[#DFC07A] font-bold p-2.5 rounded-md focus:border-[#c5a059] focus:outline-none"
                                >
                                    {tipologias_penais.map((tip) => (
                                        <option key={tip} value={tip}>
                                            {tip}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </TacticalCard>

                        {/* Bloco 4: Intervenientes Qualificados */}
                        <TacticalCard
                            title="4. Intervenientes Processuais (Vítimas, Suspeitos, Testemunhas)"
                            icon={<UserCheck className="w-4 h-4 text-[#c5a059]" />}
                            actions={
                                <button
                                    type="button"
                                    onClick={addInterveniente}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0d1a26] hover:bg-[#223750] text-[#c5a059] border border-[#c5a059]/40 rounded-md text-xs font-sans font-semibold transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Adicionar Interveniente</span>
                                </button>
                            }
                        >
                            <div className="space-y-3 font-sans text-xs">
                                {data.intervenientes.map((int, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-[#0d1a26] border border-[#223750] rounded-md grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                                    >
                                        <div className="sm:col-span-3">
                                            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                                Papel Processual
                                            </label>
                                            <select
                                                value={int.papel}
                                                onChange={(e) => updateInterveniente(idx, 'papel', e.target.value)}
                                                className="w-full bg-[#17283c] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                            >
                                                {papeis_interveniente && papeis_interveniente.length > 0 ? (
                                                    papeis_interveniente.map((pi) => (
                                                        <option key={pi.codigo} value={pi.codigo}>
                                                            {pi.nome}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="VITIMA">Vítima / Ofendido</option>
                                                        <option value="SUSPEITO">Suspeito / Indiciado</option>
                                                        <option value="TESTEMUNHA">Testemunha Presencial</option>
                                                        <option value="DENUNCIANTE">Denunciante</option>
                                                        <option value="DECLARANTE">Declarante</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        <div className="sm:col-span-5">
                                            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                                Nome Completo *
                                            </label>
                                            <input
                                                type="text"
                                                value={int.nome_identificativo}
                                                onChange={(e) => updateInterveniente(idx, 'nome_identificativo', e.target.value)}
                                                placeholder="Nome completo do cidadão..."
                                                className="w-full bg-[#17283c] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                                Contacto Telefónico
                                            </label>
                                            <input
                                                type="text"
                                                value={int.contacto_telefone}
                                                onChange={(e) => updateInterveniente(idx, 'contacto_telefone', e.target.value)}
                                                placeholder="+244 9..."
                                                className="w-full bg-[#17283c] border border-[#223750] text-slate-200 p-2 rounded-md focus:border-[#c5a059] focus:outline-none"
                                            />
                                        </div>

                                        <div className="sm:col-span-1 flex justify-center pb-1">
                                            {data.intervenientes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeInterveniente(idx)}
                                                    className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                                                    title="Remover interveniente"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TacticalCard>

                        {/* Botão para Avançar para o Passo 2 */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#223750]">
                            <span className="text-slate-400 text-xs font-sans">
                                Passo 1 de 2: Conclua os dados gerais para avançar para a redação em texto normal.
                            </span>

                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#dfc07a] text-[#0d1a26] font-sans font-bold text-xs uppercase tracking-wider rounded-md shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <span>Avançar para Redação & Folha A4</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* PASSO 2: SPLIT-VIEW — EDITOR EM TEXTO NORMAL DE UM LADO E FOLHA A4 DO OUTRO */}
                {/* ========================================================================= */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        {/* Barra Superior do Passo 2 */}
                        <div className="bg-[#132235] border border-[#223750] rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="px-3 py-1.5 bg-[#0d1a26] hover:bg-[#17283c] border border-[#223750] text-slate-300 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Voltar aos Dados (Passo 1)</span>
                                </button>
                                <span className="text-slate-300 font-medium">
                                    Redija em texto normal. Cada linha e parágrafo aparece de imediato na folha oficial ao lado.
                                </span>
                            </div>

                            {/* Botão de Scanner OCR SÓ APARECE se a forma de entrada for da Ordem Pública (PNA) */}
                            {data.origem_pop ? (
                                <button
                                    type="button"
                                    onClick={() => setOcrModalOpen(true)}
                                    className="px-4 py-2 bg-[#1a2d42] hover:bg-[#223b56] text-[#c5a059] border border-[#c5a059] rounded-md font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                                    title="Digitalizar e extrair o auto da Esquadra da PNA"
                                >
                                    <ScanText className="w-4 h-4 text-[#c5a059]" />
                                    <span>Scanner OCR (Expediente PNA)</span>
                                </button>
                            ) : (
                                <span className="text-[11px] text-slate-500 font-mono italic">
                                    (Entrada direta sem auto físico da PNA — OCR dispensado)
                                </span>
                            )}
                        </div>

                        {/* Split-View: Lado Esquerdo Editor Normal, Lado Direito Folha Oficial A4 */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* LADO ESQUERDO: EDITOR EM TEXTO NORMAL (SEM CÓDIGO HTML) */}
                            <div className="lg:col-span-6 bg-[#132235] border border-[#223750] rounded-lg flex flex-col h-[820px] overflow-hidden shadow-lg">
                                {/* Barra Superior com Inserção de Cláusulas Táticas Rápidas */}
                                <div className="p-3 bg-[#0f1b2b] border-b border-[#223750] flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-slate-200 font-bold text-xs font-sans">
                                        <FileText className="w-4 h-4 text-[#c5a059]" />
                                        <span>Redação do Auto (Texto Normal)</span>
                                    </div>

                                    {/* Botões de Fórmulas Oficiais em Texto Limpo */}
                                    <div className="flex items-center gap-1.5 text-[10px] font-sans">
                                        <span className="text-slate-500 uppercase font-semibold">Inserir:</span>
                                        <button
                                            type="button"
                                            onClick={() => insertPlainTemplate('inicio')}
                                            className="px-2 py-1 bg-[#17283c] hover:bg-[#223750] text-[#c5a059] border border-[#223750] rounded transition-colors cursor-pointer"
                                        >
                                            + Início Solene
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertPlainTemplate('apreensao')}
                                            className="px-2 py-1 bg-[#17283c] hover:bg-[#223750] text-slate-200 border border-[#223750] rounded transition-colors cursor-pointer"
                                        >
                                            + Apreensão
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => insertPlainTemplate('encerramento')}
                                            className="px-2 py-1 bg-[#17283c] hover:bg-[#223750] text-slate-200 border border-[#223750] rounded transition-colors cursor-pointer"
                                        >
                                            + Encerramento
                                        </button>
                                    </div>
                                </div>

                                {/* Textarea de Texto Puro */}
                                <div className="flex-1 p-4 bg-[#0d1a26] flex flex-col">
                                    <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                        Descrição Circunstanciada dos Factos (Texto Simples em Português)
                                    </label>
                                    <textarea
                                        value={textoNormal}
                                        onChange={(e) => handleTextoChange(e.target.value)}
                                        rows={26}
                                        className="w-full flex-1 bg-[#111e2e] border border-[#223750] rounded-md p-4 text-slate-100 text-xs font-sans leading-relaxed focus:border-[#c5a059] focus:outline-none resize-none whitespace-pre-wrap select-text"
                                        placeholder="Escreva aqui normalmente os factos ocorridos... (Use Enter para parágrafos)"
                                        required
                                    />
                                    <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500 font-mono">
                                        <span>Modo Texto Natural Ativo (Sem código HTML)</span>
                                        <span>{textoNormal.length} caracteres</span>
                                    </div>
                                </div>
                            </div>

                            {/* LADO DIREITO: A FOLHA OFICIAL A4 DO AUTO (LIVE PREVIEW) */}
                            <div className="lg:col-span-6 bg-[#132235] border border-[#223750] rounded-lg flex flex-col h-[820px] overflow-hidden shadow-2xl">
                                <div className="p-3 bg-[#0f1b2b] border-b border-[#223750] flex items-center justify-between text-xs font-sans text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-[#c5a059]" />
                                        <span className="font-bold text-slate-100">Folha Oficial A4 — Pré-visualização Solene</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] font-mono rounded">
                                        SINCRONIZAÇÃO EM TEMPO REAL
                                    </span>
                                </div>

                                {/* Conteúdo da Folha A4 */}
                                <div className="flex-1 overflow-auto p-4 bg-[#0a121c] flex justify-center">
                                    <div className="w-full max-w-[540px] bg-white text-slate-900 p-8 rounded shadow-2xl font-serif text-[11px] leading-relaxed border border-slate-300 flex flex-col justify-between select-text min-h-[720px]">
                                        {/* Cabeçalho da Folha A4 */}
                                        <div>
                                            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                                                <div className="text-center mb-1">
                                                    <div className="inline-block p-1 border border-slate-400 rounded-full mb-1">
                                                        <Shield className="w-6 h-6 text-slate-800 mx-auto" />
                                                    </div>
                                                </div>
                                                <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900">
                                                    REPÚBLICA DE ANGOLA
                                                </div>
                                                <div className="font-bold text-[10px] uppercase text-slate-800">
                                                    MINISTÉRIO DO INTERIOR
                                                </div>
                                                <div className="font-bold text-[10px] uppercase text-[#8f6d28] tracking-wide">
                                                    SERVIÇO DE INVESTIGAÇÃO CRIMINAL
                                                </div>
                                                <div className="text-[9px] text-slate-700 mt-0.5">
                                                    Direcção Provincial de {selectedProvincia?.nome || 'Luanda'}
                                                </div>
                                            </div>

                                            {/* Título e Número */}
                                            <div className="text-center mb-4">
                                                <div className="font-bold text-xs uppercase tracking-wider underline">
                                                    AUTO DE NOTÍCIA PRELIMINAR DE CRIME
                                                </div>
                                                <div className="font-mono text-[10px] font-bold text-slate-700 mt-0.5">
                                                    Nº OFICIAL: {displayNumeroAuto}
                                                </div>
                                            </div>

                                            {/* Caixa de Metadados preenchidos no Passo 1 */}
                                            <div className="bg-slate-100 border border-slate-300 rounded p-2.5 mb-4 text-[10px] font-sans space-y-1">
                                                <div>
                                                    <span className="font-bold text-slate-700">TIPOLOGIA LEGAL:</span>{' '}
                                                    <span className="font-semibold text-slate-900">{data.classificacao_codigo}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-700">CIRCUNSCRIÇÃO / LOCAL:</span>{' '}
                                                    <span>{data.local_detalhado || 'Local a indicar'}, {municipios.find((m: any) => m.id === data.municipio_id)?.nome || 'Município'}, {selectedProvincia?.nome}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-700">DATA/HORA DO FACTO:</span>{' '}
                                                    <span>{new Date(data.data_hora_facto).toLocaleString('pt-AO')}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-700">FORMA DE ENTRADA:</span>{' '}
                                                    <span>{data.tipo_participacao} {data.origem_pop ? '(Remetido pela Polícia Nacional)' : ''}</span>
                                                </div>
                                                <div className="pt-1 border-t border-slate-200">
                                                    <span className="font-bold text-slate-700">INTERVENIENTES QUALIFICADOS:</span>
                                                    <ul className="list-disc pl-4 mt-0.5">
                                                        {data.intervenientes.map((int, i) => (
                                                            <li key={i}>
                                                                <strong>[{int.papel}]</strong> {int.nome_identificativo || 'Por qualificar'}{' '}
                                                                {int.contacto_telefone ? `(Tel: ${int.contacto_telefone})` : ''}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Corpo do Auto (Texto escrito pelo polícia renderizado perfeitamente com parágrafos) */}
                                            <div className="text-slate-900 leading-relaxed text-justify whitespace-pre-wrap font-serif mb-6">
                                                {textoNormal}
                                            </div>
                                        </div>

                                        {/* Rodapé Oficial da Peça */}
                                        <div className="border-t border-slate-300 pt-4 mt-6">
                                            <div className="flex justify-between items-end text-[9px] font-sans text-slate-600 mb-6">
                                                <div>
                                                    <div>Lavrado aos {new Date().toLocaleDateString('pt-AO')}.</div>
                                                    <div>Serviço de Investigação Criminal — SIGD-SIC</div>
                                                </div>
                                                <div className="text-center w-48">
                                                    <div className="border-b border-slate-800 mb-1"></div>
                                                    <div className="font-bold text-slate-800 uppercase text-[9px]">
                                                        O Instrutor / Oficial de Registo
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-[8px] font-mono text-slate-400 flex justify-between border-t border-dashed border-slate-300 pt-1">
                                                <span>Protocolo WORM / SHA-256</span>
                                                <span>DOCUMENTO OFICIAL DA REPÚBLICA DE ANGOLA</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Barra de Submissão e Gravação Final */}
                        <div className="bg-[#132235] border border-[#223750] rounded-lg p-4 flex items-center justify-between shadow-lg">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="px-4 py-2.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 text-xs font-sans rounded-md border border-[#223750] flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Voltar ao Passo 1</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={processing}
                                className="px-8 py-3 bg-[#c5a059] hover:bg-[#dfc07a] text-[#0d1a26] font-sans font-bold text-xs uppercase tracking-widest rounded-md shadow-xl flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {is_edit ? (
                                    <>
                                        <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                                        <span>{processing ? 'A atualizar Auto...' : 'Atualizar Auto de Notícia'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{processing ? 'A protocolar no Sistema...' : 'Emitir e Salvar Auto de Notícia'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL PROFISSIONAL DE SCANNER OCR (EXPEDIENTE DA POLÍCIA DE ORDEM PÚBLICA) */}
                {/* ========================================================================= */}
                {ocrModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#132235] border border-[#223750] rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                            {/* Cabeçalho do Modal OCR */}
                            <div className="px-5 py-3.5 border-b border-[#223750] flex items-center justify-between bg-[#0f1b2b]">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-sky-950 text-sky-400 border border-sky-800 rounded">
                                        <ScanText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-sans">
                                            Digitalizador OCR — Expediente da Polícia de Ordem Pública (PNA)
                                        </h2>
                                        <p className="text-[11px] text-slate-400 font-sans">
                                            Reconhecimento Óptico de Caracteres do auto físico remetido pela Esquadra da PNA
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOcrModalOpen(false)}
                                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#17283c] transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Conteúdo do Modal */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden bg-[#0d1a26]">
                                {/* Lado Esquerdo: Auto Físico Escaneado */}
                                <div className="bg-[#111e2e] border border-[#223750] rounded-lg flex flex-col overflow-hidden">
                                    <div className="p-2.5 bg-[#17283c] border-b border-[#223750] flex items-center justify-between text-xs font-sans text-slate-300">
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <FileText className="w-3.5 h-3.5 text-[#c5a059]" />
                                            <span>Documento Físico Escaneado (PNA)</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-mono text-[10px]">
                                            <button
                                                type="button"
                                                onClick={() => setOcrZoom(Math.max(60, ocrZoom - 15))}
                                                className="p-1 hover:bg-[#223750] rounded cursor-pointer"
                                                title="Reduzir zoom"
                                            >
                                                <ZoomOut className="w-3.5 h-3.5" />
                                            </button>
                                            <span>{ocrZoom}%</span>
                                            <button
                                                type="button"
                                                onClick={() => setOcrZoom(Math.min(160, ocrZoom + 15))}
                                                className="p-1 hover:bg-[#223750] rounded cursor-pointer"
                                                title="Aumentar zoom"
                                            >
                                                <ZoomIn className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#070e17]">
                                        <div
                                            style={{ transform: `scale(${ocrZoom / 100})`, transformOrigin: 'top center' }}
                                            className="w-[380px] bg-slate-100 text-slate-900 p-6 rounded shadow-xl font-serif text-[10px] leading-relaxed border border-slate-300 transition-transform select-none"
                                        >
                                            <div className="text-center border-b border-slate-400 pb-2 mb-2">
                                                <div className="font-bold text-[9px] uppercase">REPÚBLICA DE ANGOLA</div>
                                                <div className="font-bold text-[9px] uppercase">POLÍCIA NACIONAL DE ANGOLA (PNA)</div>
                                                <div className="text-[8px]">Comando Provincial — Esquadra Territorial da Samba</div>
                                                <div className="font-mono text-[9px] font-bold text-red-700 mt-0.5">EXPEDIENTE POP Nº 441/2026</div>
                                            </div>
                                            <div className="space-y-2 text-justify">
                                                <p><strong>AUTO DE NOTÍCIA PRELIMINAR:</strong></p>
                                                <p>Aos 14 dias do corrente mês, pelas 21h30, compareceu nesta Esquadra o cidadão Manuel Domingos Kitumba, BI 002198731HA031, queixando-se de roubo qualificado com cano de fogo.</p>
                                                <p><strong>FACTOS:</strong> Circulava junto ao viaduto quando elementos armados subtraíram Kz 12.500.000,00 e telemóveis.</p>
                                                <p><strong>SUSPEITO:</strong> Indivíduo com a alcunha de "Doberman" (Pedro Cassoma).</p>
                                                <p className="pt-2">O Chefe do Posto: <em>Sub-Inspector Manuel António (PNA)</em></p>
                                            </div>
                                            <div className="mt-4 pt-2 border-t border-dashed border-slate-400 text-[8px] font-mono text-slate-500 flex justify-between">
                                                <span>Carimbo PNA Oficial</span>
                                                <span>Digest SHA-256</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lado Direito: Texto Reconhecido pelo OCR (Texto Puro em Português) */}
                                <div className="bg-[#111e2e] border border-[#223750] rounded-lg flex flex-col overflow-hidden">
                                    <div className="p-2.5 bg-[#17283c] border-b border-[#223750] flex items-center justify-between text-xs font-sans">
                                        <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Texto Extraído (Sem tags HTML)</span>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded font-mono">
                                            100% CONFIABILIDADE
                                        </span>
                                    </div>

                                    <div className="flex-1 p-3 flex flex-col overflow-hidden bg-[#0d1a26]">
                                        <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">
                                            Pode rever ou alterar o texto antes de transferir para o auto:
                                        </label>
                                        <textarea
                                            value={ocrTextoExtraido}
                                            onChange={(e) => setOcrTextoExtraido(e.target.value)}
                                            className="w-full flex-1 bg-[#09111a] border border-[#223750] rounded p-3 text-slate-200 text-xs font-sans leading-relaxed focus:border-[#c5a059] focus:outline-none resize-none whitespace-pre-wrap select-text"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rodapé do Modal */}
                            <div className="px-5 py-3 border-t border-[#223750] bg-[#0f1b2b] flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setOcrModalOpen(false)}
                                    className="px-4 py-2 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 text-xs font-sans rounded-md border border-[#223750] transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAplicarOcr('acrescentar')}
                                        className="px-4 py-2 bg-[#1e334d] hover:bg-[#254163] text-slate-100 text-xs font-sans font-semibold rounded-md border border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <span>Anexar ao Final dos Factos</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleAplicarOcr('substituir')}
                                        className="px-5 py-2 bg-[#c5a059] hover:bg-[#dfc07a] text-[#0d1a26] text-xs font-sans font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Transferir para o Editor do Auto</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TacticalLayout>
    );
}
