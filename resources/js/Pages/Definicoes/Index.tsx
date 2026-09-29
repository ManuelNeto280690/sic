import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import {
    SlidersHorizontal,
    FileText,
    Users,
    Building2,
    ShieldAlert,
    Database,
    Plus,
    Edit3,
    CheckCircle2,
    XCircle,
    KeyRound,
    Save,
    Eye,
    Shield,
    FileCheck,
    Search,
    Lock,
    Scale,
    PlaneTakeoff,
    Microscope,
    FolderGit2,
    BarChart3,
    X,
    Upload,
    Trash2,
} from 'lucide-react';

interface Props {
    configuracoes: Record<string, string>;
    utilizadores_sic: any[];
    utilizadores_sme: any[];
    utilizadores_pgr: any[];
    unidades: any[];
    provincias: any[];
    municipios: any[];
    catalogos: any[];
    roles_permissoes: any[];
    perfis_lista: any[];
}

export default function DefinicoesIndex({
    configuracoes,
    utilizadores_sic,
    utilizadores_sme,
    utilizadores_pgr,
    unidades,
    provincias,
    municipios,
    catalogos,
    roles_permissoes,
    perfis_lista,
}: Props) {
    // Aba Principal ativa
    const [abaPrincipal, setAbaPrincipal] = useState<
        'documentos' | 'utilizadores' | 'departamentos' | 'permissoes' | 'catalogos'
    >('documentos');

    // Sub-aba de Utilizadores (SIC, SME, PGR)
    const [abaUtilizador, setAbaUtilizador] = useState<'SIC' | 'SME' | 'PGR'>('SIC');

    // Categoria ativa no Catálogo Dinâmico
    const [categoriaCatalogo, setCategoriaCatalogo] = useState<
        'tipologia_legal' | 'papel_interveniente' | 'tipo_participacao' | 'especialidade_forense' | 'medida_judicial'
    >('tipologia_legal');

    // Perfil selecionado na Matriz de Permissões
    const [perfilPermissao, setPerfilPermissao] = useState<string>('INVESTIGADOR');

    // Filtros de pesquisa rápida
    const [buscaUtilizador, setBuscaUtilizador] = useState('');
    const [buscaCatalogo, setBuscaCatalogo] = useState('');

    // Modais
    const [modalUserOpen, setModalUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);

    const [modalDeptOpen, setModalDeptOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<any | null>(null);

    const [modalCatOpen, setModalCatOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<any | null>(null);

    const [logoPreview, setLogoPreview] = useState<string | null>(configuracoes.logo_emblema_url || null);

    // ==========================================
    // 1. FORMULÁRIO DE DOCUMENTOS E IDENTIDADE
    // ==========================================
    const formDoc = useForm<{
        pais_nome: string;
        ministerio_nome: string;
        direcao_geral: string;
        direcao_nacional: string;
        lema_institucional: string;
        marca_dagua_documento: string;
        titulo_assinatura_central: string;
        titulo_assinatura_provincial: string;
        titulo_assinatura_investigador: string;
        titulo_assinatura_magistrado: string;
        formula_encerramento_autos: string;
        rodape_oficial_documentos: string;
        logo_emblema_url: string;
        logo_ficheiro: File | null;
        remover_logo: boolean;
    }>({
        pais_nome: configuracoes.pais_nome || 'REPÚBLICA DE ANGOLA',
        ministerio_nome: configuracoes.ministerio_nome || 'MINISTÉRIO DO INTERIOR',
        direcao_geral: configuracoes.direcao_geral || 'SERVIÇO DE INVESTIGAÇÃO CRIMINAL',
        direcao_nacional: configuracoes.direcao_nacional || 'DIRECÇÃO NACIONAL DE OPERAÇÕES E ESTATÍSTICA POLICIAL (DNOEP)',
        lema_institucional: configuracoes.lema_institucional || 'HONRA, LEALDADE E LEGALIDADE',
        marca_dagua_documento: configuracoes.marca_dagua_documento || 'CONFIDENCIAL // USO EXCLUSIVO POLICIAL',
        titulo_assinatura_central: configuracoes.titulo_assinatura_central || 'Comissário-Geral // Director Geral do SIC',
        titulo_assinatura_provincial: configuracoes.titulo_assinatura_provincial || 'Subcomissário // Comandante Provincial do SIC',
        titulo_assinatura_investigador: configuracoes.titulo_assinatura_investigador || 'Inspector // Instrutor do Processo-Crime',
        titulo_assinatura_magistrado: configuracoes.titulo_assinatura_magistrado || 'Subprocurador-Geral // Magistrado do Ministério Público',
        formula_encerramento_autos: configuracoes.formula_encerramento_autos || 'E por nada mais haver a constar, lavrou-se o presente auto que, lido e achado conforme, vai devidamente assinado pelo declarante, instrutor e escrivão que o redigiu.',
        rodape_oficial_documentos: configuracoes.rodape_oficial_documentos || 'Serviço de Investigação Criminal — Direcção Central: Av. 4 de Fevereiro, Luanda, Angola • Central Operacional: (+244) 222 334 455 • dnoep@sic.gov.ao',
        logo_emblema_url: configuracoes.logo_emblema_url || '',
        logo_ficheiro: null,
        remover_logo: false,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            formDoc.setData((prev) => ({
                ...prev,
                logo_ficheiro: file,
                remover_logo: false,
            }));
            const reader = new FileReader();
            reader.onload = (ev) => {
                setLogoPreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoverLogo = () => {
        formDoc.setData((prev) => ({
            ...prev,
            logo_ficheiro: null,
            remover_logo: true,
            logo_emblema_url: '',
        }));
        setLogoPreview(null);
    };

    const handleSalvarDocumentos = (e: React.FormEvent) => {
        e.preventDefault();
        formDoc.post(route('definicoes.institucional.salvar'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    // ==========================================
    // 2. FORMULÁRIO DE UTILIZADOR
    // ==========================================
    const formUser = useForm({
        nip: '',
        nome_completo: '',
        email: '',
        password: '',
        perfil: 'INVESTIGADOR',
        unidade_id: unidades[0]?.id || '',
        posto_fronteira: '',
        requer_2fa: true,
        ativo: true,
    });

    const openCreateUserModal = () => {
        setEditingUser(null);
        let defaultPerfil = 'INVESTIGADOR';
        if (abaUtilizador === 'SME') defaultPerfil = 'OPERADOR_SME';
        if (abaUtilizador === 'PGR') defaultPerfil = 'MAGISTRADO_PGR';

        formUser.setData({
            nip: '',
            nome_completo: '',
            email: '',
            password: 'SicAngola#2026',
            perfil: defaultPerfil,
            unidade_id: unidades[0]?.id || '',
            posto_fronteira: '',
            requer_2fa: true,
            ativo: true,
        });
        setModalUserOpen(true);
    };

    const openEditUserModal = (u: any) => {
        setEditingUser(u);
        formUser.setData({
            nip: u.nip,
            nome_completo: u.nome_completo,
            email: u.email,
            password: '',
            perfil: u.perfil,
            unidade_id: u.unidade_id,
            posto_fronteira: u.posto_fronteira || '',
            requer_2fa: Boolean(u.requer_2fa),
            ativo: Boolean(u.ativo),
        });
        setModalUserOpen(true);
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            formUser.put(route('definicoes.utilizadores.update', editingUser.id), {
                preserveScroll: true,
                onSuccess: () => setModalUserOpen(false),
            });
        } else {
            formUser.post(route('definicoes.utilizadores.store'), {
                preserveScroll: true,
                onSuccess: () => setModalUserOpen(false),
            });
        }
    };

    const handleToggleUserStatus = (userId: string) => {
        router.post(route('definicoes.utilizadores.toggle-status', userId), {}, { preserveScroll: true });
    };

    const handleResetPassword = (userId: string, nome: string) => {
        if (confirm(`Tem a certeza que deseja redefinir a senha do utilizador "${nome}" para o padrão temporário 'SicAngola#2026'?`)) {
            router.post(route('definicoes.utilizadores.reset-password', userId), {}, { preserveScroll: true });
        }
    };

    // ==========================================
    // 3. FORMULÁRIO DE DEPARTAMENTO / UNIDADE
    // ==========================================
    const formDept = useForm({
        nome: '',
        sigla: '',
        nivel: 'PROVINCIAL',
        unidade_superior_id: '',
        provincia_id: provincias[0]?.id || '',
        municipio_id: '',
        ativo: true,
    });

    const openCreateDeptModal = () => {
        setEditingDept(null);
        formDept.setData({
            nome: '',
            sigla: '',
            nivel: 'PROVINCIAL',
            unidade_superior_id: '',
            provincia_id: provincias[0]?.id || '',
            municipio_id: '',
            ativo: true,
        });
        setModalDeptOpen(true);
    };

    const openEditDeptModal = (d: any) => {
        setEditingDept(d);
        formDept.setData({
            nome: d.nome,
            sigla: d.sigla,
            nivel: d.nivel,
            unidade_superior_id: d.unidade_superior_id || '',
            provincia_id: d.provincia_id || '',
            municipio_id: d.municipio_id || '',
            ativo: Boolean(d.ativo),
        });
        setModalDeptOpen(true);
    };

    const handleSaveDept = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDept) {
            formDept.put(route('definicoes.departamentos.update', editingDept.id), {
                preserveScroll: true,
                onSuccess: () => setModalDeptOpen(false),
            });
        } else {
            formDept.post(route('definicoes.departamentos.store'), {
                preserveScroll: true,
                onSuccess: () => setModalDeptOpen(false),
            });
        }
    };

    // ==========================================
    // 4. FORMULÁRIO DE CATÁLOGO PARAMÉTRICO
    // ==========================================
    const formCat = useForm({
        categoria: categoriaCatalogo,
        codigo: '',
        nome: '',
        descricao: '',
        metadados_artigo: '',
        metadados_moldura: '',
        ativo: true,
        ordem: 0,
    });

    const openCreateCatModal = () => {
        setEditingCat(null);
        formCat.setData({
            categoria: categoriaCatalogo,
            codigo: '',
            nome: '',
            descricao: '',
            metadados_artigo: '',
            metadados_moldura: '',
            ativo: true,
            ordem: 0,
        });
        setModalCatOpen(true);
    };

    const openEditCatModal = (c: any) => {
        setEditingCat(c);
        formCat.setData({
            categoria: c.categoria,
            codigo: c.codigo,
            nome: c.nome,
            descricao: c.descricao || '',
            metadados_artigo: c.metadados?.artigo_cp || '',
            metadados_moldura: c.metadados?.moldura || '',
            ativo: Boolean(c.ativo),
            ordem: c.ordem || 0,
        });
        setModalCatOpen(true);
    };

    const handleSaveCat = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formCat.data,
            categoria: categoriaCatalogo,
            metadados: formCat.data.metadados_artigo || formCat.data.metadados_moldura ? {
                artigo_cp: formCat.data.metadados_artigo,
                moldura: formCat.data.metadados_moldura,
            } : null,
        };

        if (editingCat) {
            router.put(route('definicoes.catalogos.update', editingCat.id), payload, {
                preserveScroll: true,
                onSuccess: () => setModalCatOpen(false),
            });
        } else {
            router.post(route('definicoes.catalogos.store'), payload, {
                preserveScroll: true,
                onSuccess: () => setModalCatOpen(false),
            });
        }
    };

    const handleToggleCatStatus = (id: string) => {
        router.post(route('definicoes.catalogos.toggle-status', id), {}, { preserveScroll: true });
    };

    // ==========================================
    // 5. MATRIZ DE PERMISSÕES
    // ==========================================
    const modulosPermissoesDef = [
        {
            modulo: 'ocorrencias',
            titulo: 'Autos de Notícia & Notícias-Crime',
            acoes: [
                { key: 'visualizar', label: 'Visualizar Autos de Notícia' },
                { key: 'ver_todas_provincias', label: 'Ver Autos de Todas as Províncias (Nacional)' },
                { key: 'criar', label: 'Registar Novo Auto de Notícia' },
                { key: 'editar', label: 'Editar Auto de Notícia (Próprio ou Admin)' },
                { key: 'triagem', label: 'Efetuar Triagem Policial' },
                { key: 'arquivar', label: 'Despacho de Arquivamento' },
            ],
        },
        {
            modulo: 'processos',
            titulo: 'Gestão de Processos-Crime & Inquéritos',
            acoes: [
                { key: 'visualizar', label: 'Consultar Autos de Processo' },
                { key: 'instaurar', label: 'Instaurar Novo Inquérito' },
                { key: 'diligencias', label: 'Registar Diário de Diligências' },
                { key: 'pecas', label: 'Redigir Peças & Autos' },
                { key: 'custodia', label: 'Cadeia de Custódia & Lacres' },
                { key: 'remessa_pgr', label: 'Remessa ao Ministério Público' },
            ],
        },
        {
            modulo: 'detidos',
            titulo: 'Celas Transitórias & Controlo de 48h',
            acoes: [
                { key: 'visualizar', label: 'Monitorizar Prazos de Detidos' },
                { key: 'registar', label: 'Entrada de Detido em Cela' },
                { key: 'atualizar_48h', label: 'Atualizar Estado de Custódia' },
                { key: 'apresentar_mp', label: 'Apresentar ao 1º Interrogatório Judicial' },
            ],
        },
        {
            modulo: 'laboratorio',
            titulo: 'Criminalística & Laboratório Forense',
            acoes: [
                { key: 'visualizar', label: 'Ver Laudos e Perícias' },
                { key: 'requisitar', label: 'Requisitar Perícia Forense' },
                { key: 'emitir_laudo', label: 'Concluir Laudo Pericial' },
                { key: 'validar_sha256', label: 'Assinatura Digital Forense' },
            ],
        },
        {
            modulo: 'estatisticas',
            titulo: 'Painel Estatístico 21 Províncias & BI',
            acoes: [
                { key: 'visualizar', label: 'Acesso ao Painel BI' },
                { key: 'filtrar_provincias', label: 'Filtragem Avançada' },
                { key: 'exportar_pdf', label: 'Exportar Relatórios PDF' },
                { key: 'exportar_excel', label: 'Exportar Ficheiro Excel' },
            ],
        },
        {
            modulo: 'sme',
            titulo: 'Terminal SME (Fronteiras e Aeroportos)',
            acoes: [
                { key: 'terminal_acesso', label: 'Acesso ao Terminal <300ms' },
                { key: 'consultar_passageiro', label: 'Consulta em Tempo Real' },
                { key: 'intercetar_fronteira', label: 'Executar Interceção de Saída' },
            ],
        },
        {
            modulo: 'magistratura',
            titulo: 'Janela da Magistratura (PGR)',
            acoes: [
                { key: 'painel_pgr', label: 'Acesso à Magistratura PGR' },
                { key: 'emitir_mandados', label: 'Emitir Mandados Judiciais' },
                { key: 'revogar_mandados', label: 'Revogar ou Cancelar Mandados' },
            ],
        },
        {
            modulo: 'auditoria',
            titulo: 'Cibersegurança & Auditoria SHA-256',
            acoes: [
                { key: 'visualizar_logs', label: 'Consultar Rasto de Ações' },
                { key: 'verificar_cadeia_sha256', label: 'Verificar Cadeia Criptográfica' },
            ],
        },
        {
            modulo: 'definicoes',
            titulo: 'Administração & Definições do Sistema',
            acoes: [
                { key: 'gerir_utilizadores', label: 'Gerir Utilizadores & Credenciais' },
                { key: 'parametrizar_catalogos', label: 'Configurar Catálogos Dinâmicos' },
                { key: 'editar_identidade_documentos', label: 'Editar Cabeçalhos & Modelos de Documento' },
            ],
        },
    ];

    const getPermissaoValue = (mod: string, acao: string): boolean => {
        const row = roles_permissoes.find((r) => r.perfil === perfilPermissao && r.modulo === mod);
        if (!row || !row.permissoes) return false;
        return Boolean(row.permissoes[acao]);
    };

    const handleTogglePermissao = (mod: string, acao: string) => {
        const row = roles_permissoes.find((r) => r.perfil === perfilPermissao && r.modulo === mod);
        const currentPerms = row && row.permissoes ? { ...row.permissoes } : {};
        currentPerms[acao] = !currentPerms[acao];

        router.post(
            route('definicoes.permissoes.salvar'),
            {
                perfil: perfilPermissao,
                modulo: mod,
                permissoes: currentPerms,
            },
            { preserveScroll: true }
        );
    };

    // Dados filtrados de utilizadores
    const currentUtilizadores =
        abaUtilizador === 'SIC'
            ? utilizadores_sic
            : abaUtilizador === 'SME'
            ? utilizadores_sme
            : utilizadores_pgr;

    const filteredUtilizadores = currentUtilizadores.filter((u) => {
        const termo = buscaUtilizador.toLowerCase();
        return (
            u.nome_completo?.toLowerCase().includes(termo) ||
            u.nip?.toLowerCase().includes(termo) ||
            u.email?.toLowerCase().includes(termo) ||
            u.unidade?.nome?.toLowerCase().includes(termo)
        );
    });

    // Dados filtrados de catálogos
    const currentCatalogos = catalogos.filter((c) => c.categoria === categoriaCatalogo);
    const filteredCatalogos = currentCatalogos.filter((c) => {
        const termo = buscaCatalogo.toLowerCase();
        return (
            c.nome?.toLowerCase().includes(termo) ||
            c.codigo?.toLowerCase().includes(termo) ||
            c.descricao?.toLowerCase().includes(termo)
        );
    });

    return (
        <TacticalLayout title="Definições Enterprise do Sistema">
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Cabeçalho do Módulo */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5 text-[#c5a059]" />
                            <h1 className="text-base font-bold uppercase tracking-wider text-slate-100 font-sans">
                                Definições & Parametrização Global Enterprise
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                            Módulo M11 // Identidade documental, utilizadores federados (SIC/SME/PGR), permissões e catálogos dinâmicos
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 bg-[#132235] border border-[#223750] text-[#c5a059] rounded-md font-semibold">
                            MODO ENTERPRISE
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded-md">
                            21 PROVÍNCIAS SINC.
                        </span>
                    </div>
                </div>

                {/* Barra de Abas Principais de Nível Enterprise */}
                <div className="flex items-center gap-2 border-b border-[#223750] pb-1 overflow-x-auto select-none no-scrollbar">
                    <button
                        onClick={() => setAbaPrincipal('documentos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition-colors cursor-pointer ${
                            abaPrincipal === 'documentos'
                                ? 'bg-[#132235] border-[#223750] text-[#c5a059] border-b-2 border-b-[#132235]'
                                : 'bg-[#09131d] border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#132235]/50'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Identidade & Documentos</span>
                    </button>

                    <button
                        onClick={() => setAbaPrincipal('utilizadores')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition-colors cursor-pointer ${
                            abaPrincipal === 'utilizadores'
                                ? 'bg-[#132235] border-[#223750] text-[#c5a059] border-b-2 border-b-[#132235]'
                                : 'bg-[#09131d] border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#132235]/50'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Utilizadores Federados (SIC / SME / PGR)</span>
                    </button>

                    <button
                        onClick={() => setAbaPrincipal('departamentos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition-colors cursor-pointer ${
                            abaPrincipal === 'departamentos'
                                ? 'bg-[#132235] border-[#223750] text-[#c5a059] border-b-2 border-b-[#132235]'
                                : 'bg-[#09131d] border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#132235]/50'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>Departamentos & Estrutura</span>
                    </button>

                    <button
                        onClick={() => setAbaPrincipal('permissoes')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition-colors cursor-pointer ${
                            abaPrincipal === 'permissoes'
                                ? 'bg-[#132235] border-[#223750] text-[#c5a059] border-b-2 border-b-[#132235]'
                                : 'bg-[#09131d] border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#132235]/50'
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Funções (Roles) & Permissões</span>
                    </button>

                    <button
                        onClick={() => setAbaPrincipal('catalogos')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-t-md text-xs font-sans font-bold uppercase tracking-wider border-t border-x transition-colors cursor-pointer ${
                            abaPrincipal === 'catalogos'
                                ? 'bg-[#132235] border-[#223750] text-[#c5a059] border-b-2 border-b-[#132235]'
                                : 'bg-[#09131d] border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#132235]/50'
                        }`}
                    >
                        <Database className="w-4 h-4" />
                        <span>Catálogos Dinâmicos do Sistema</span>
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* 1. ABA IDENTIDADE E MODELOS DE DOCUMENTOS OFICIAIS                        */}
                {/* ========================================================================= */}
                {abaPrincipal === 'documentos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Formulário de Configuração */}
                        <div className="lg:col-span-6 space-y-6">
                            <form onSubmit={handleSalvarDocumentos} className="space-y-6">
                                {/* CARD: UPLOAD DO LOGÓTIPO INSTITUCIONAL */}
                                <TacticalCard
                                    title="Logótipo e Insígnia Oficial da Instituição"
                                    subtitle="Este logótipo será impresso no topo de todos os autos, inquéritos e documentos PDF"
                                    icon={<Upload className="w-4 h-4 text-[#c5a059]" />}
                                >
                                    <div className="space-y-4 text-xs font-sans">
                                        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#0d1a26] border border-[#223750] rounded-md">
                                            {/* Pré-visualização do Logótipo */}
                                            <div className="w-24 h-24 rounded-md bg-[#132235] border-2 border-dashed border-[#223750] flex flex-col items-center justify-center p-2 shrink-0 relative overflow-hidden shadow-inner">
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logótipo Oficial"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="text-center text-slate-500">
                                                        <Shield className="w-7 h-7 mx-auto text-slate-600 mb-1" />
                                                        <span className="text-[9px] block font-mono text-slate-500">Sem Logótipo</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Controles de Upload */}
                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                <div className="text-xs font-semibold text-slate-200">
                                                    Carregar Logótipo / Insígnia da Instituição
                                                </div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                                    Formatos suportados: <strong>PNG, SVG, JPG, WebP</strong> (Máx. 5MB).
                                                    O logótipo selecionado substitui a insígnia padrão e figurará automaticamente em todos os documentos oficiais em PDF.
                                                </p>

                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                                    <label className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e344d] border border-[#223750] hover:border-[#c5a059] text-slate-200 text-xs font-semibold rounded cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                                                        <Upload className="w-3.5 h-3.5 text-[#c5a059]" />
                                                        <span>Escolher Imagem</span>
                                                        <input
                                                            type="file"
                                                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                            onChange={handleLogoChange}
                                                            className="hidden"
                                                        />
                                                    </label>

                                                    {logoPreview && (
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoverLogo}
                                                            className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>Remover Logótipo</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TacticalCard>

                                <TacticalCard
                                    title="Cabeçalhos Oficiais da República de Angola"
                                    icon={<FileText className="w-4 h-4" />}
                                >
                                    <div className="space-y-3.5 text-xs font-sans">
                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Designação Oficial do Estado
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.pais_nome}
                                                onChange={(e) => formDoc.setData('pais_nome', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Ministério de Tutela
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.ministerio_nome}
                                                onChange={(e) => formDoc.setData('ministerio_nome', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Órgão Superior de Polícia Judiciária
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.direcao_geral}
                                                onChange={(e) => formDoc.setData('direcao_geral', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Direcção Operacional Emissora Padrão
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.direcao_nacional}
                                                onChange={(e) => formDoc.setData('direcao_nacional', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                    Lema Institucional
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formDoc.data.lema_institucional}
                                                    onChange={(e) => formDoc.setData('lema_institucional', e.target.value)}
                                                    className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                    Texto da Marca de Água
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formDoc.data.marca_dagua_documento}
                                                    onChange={(e) => formDoc.setData('marca_dagua_documento', e.target.value)}
                                                    className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TacticalCard>

                                <TacticalCard
                                    title="Títulos das Assinaturas na Parte Inferior dos Documentos"
                                    icon={<FileCheck className="w-4 h-4 text-[#c5a059]" />}
                                >
                                    <div className="space-y-3.5 text-xs font-sans">
                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Título/Posto do Director Nacional (Nível Central)
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.titulo_assinatura_central}
                                                onChange={(e) => formDoc.setData('titulo_assinatura_central', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Título/Posto do Comandante Provincial (Nível Provincial)
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.titulo_assinatura_provincial}
                                                onChange={(e) => formDoc.setData('titulo_assinatura_provincial', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Título/Posto do Instrutor Processual (Investigador)
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.titulo_assinatura_investigador}
                                                onChange={(e) => formDoc.setData('titulo_assinatura_investigador', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Título/Posto do Magistrado da PGR (Ministério Público)
                                            </label>
                                            <input
                                                type="text"
                                                value={formDoc.data.titulo_assinatura_magistrado}
                                                onChange={(e) => formDoc.setData('titulo_assinatura_magistrado', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Fórmula Oficial de Encerramento dos Autos
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formDoc.data.formula_encerramento_autos}
                                                onChange={(e) => formDoc.setData('formula_encerramento_autos', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none leading-relaxed font-sans"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase font-medium mb-1">
                                                Texto Oficial de Rodapé e Certificação Criptográfica
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={formDoc.data.rodape_oficial_documentos}
                                                onChange={(e) => formDoc.setData('rodape_oficial_documentos', e.target.value)}
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none leading-relaxed font-sans text-[11px]"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#223750] flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={formDoc.processing}
                                            className="px-5 py-2 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{formDoc.processing ? 'A Guardar...' : 'Guardar Alterações Documentais'}</span>
                                        </button>
                                    </div>
                                </TacticalCard>
                            </form>
                        </div>

                        {/* Pré-visualização ao Vivo do Modelo Oficial A4 */}
                        <div className="lg:col-span-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                                    <Eye className="w-4 h-4 text-[#c5a059]" />
                                    <span>Simulador de Impressão Solene Oficial (Folha A4)</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">Pré-visualização Dinâmica</span>
                            </div>

                            {/* Folha Oficial A4 Renderizada */}
                            <div className="bg-white text-black p-8 rounded-md shadow-2xl border-4 border-slate-300 relative overflow-hidden font-serif min-h-[620px] flex flex-col justify-between select-text">
                                {/* Marca de Água Diagonal de Fundo */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-30deg]">
                                    <span className="text-4xl font-extrabold tracking-widest text-black uppercase text-center border-4 border-black p-6">
                                        {formDoc.data.marca_dagua_documento}
                                    </span>
                                </div>

                                {/* Cabeçalho Oficial */}
                                <div className="text-center border-b-2 border-black pb-4">
                                    <div className="flex justify-center mb-2">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logótipo Oficial da Instituição"
                                                className="max-h-14 max-w-[150px] object-contain"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 border border-slate-400 rounded-full flex items-center justify-center bg-slate-50 font-bold text-xs text-slate-700">
                                                INSÍGNIA
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-bold text-sm tracking-wider uppercase">
                                        {formDoc.data.pais_nome}
                                    </div>
                                    <div className="font-bold text-xs uppercase mt-0.5">
                                        {formDoc.data.ministerio_nome}
                                    </div>
                                    <div className="font-bold text-xs uppercase text-slate-800 mt-0.5">
                                        {formDoc.data.direcao_geral}
                                    </div>
                                    <div className="text-[10px] uppercase font-sans font-semibold text-slate-600 mt-0.5">
                                        {formDoc.data.direcao_nacional}
                                    </div>
                                    <div className="text-[9px] italic text-slate-500 mt-1">
                                        «{formDoc.data.lema_institucional}»
                                    </div>

                                    <div className="mt-3 py-1 bg-slate-100 border border-slate-300 font-sans font-bold text-xs uppercase tracking-wider">
                                        AUTO DE NOTÍCIA / INQUÉRITO PREPARATÓRIO Nº 2026/LUA/0091
                                    </div>
                                </div>

                                {/* Corpo Simulado da Peça */}
                                <div className="my-6 text-xs leading-relaxed space-y-3 font-sans">
                                    <p className="text-justify indent-6">
                                        Aos 18 dias do mês de Setembro do ano de 2026, nesta cidade de Luanda, nas instalações oficiais do Serviço de Investigação Criminal, perante a autoridade competente abaixo assinada, foi formalizado o presente expediente em estrita conformidade com os artigos aplicáveis do Código de Processo Penal Angolano.
                                    </p>
                                    <p className="text-justify indent-6">
                                        Constatada a veracidade dos elementos recolhidos, a integridade da cadeia de custódia e a preservação das provas materiais com gravação em registo imutável SHA-256.
                                    </p>
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] italic">
                                        «{formDoc.data.formula_encerramento_autos}»
                                    </div>
                                </div>

                                {/* Bloco Solene de Assinaturas na Parte Inferior */}
                                <div className="border-t border-slate-300 pt-6 mt-6 font-sans">
                                    <div className="grid grid-cols-2 gap-8 text-center text-xs">
                                        <div>
                                            <div className="border-b border-black w-4/5 mx-auto mb-1.5 h-6"></div>
                                            <div className="font-bold uppercase text-[11px]">
                                                {formDoc.data.titulo_assinatura_investigador}
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-mono">
                                                Inspector Policial // NIP: SIC-INV-0042
                                            </div>
                                        </div>

                                        <div>
                                            <div className="border-b border-black w-4/5 mx-auto mb-1.5 h-6"></div>
                                            <div className="font-bold uppercase text-[11px]">
                                                {formDoc.data.titulo_assinatura_provincial}
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-mono">
                                                Comando Provincial // Chancelado
                                            </div>
                                        </div>
                                    </div>

                                    {/* Carimbo de Certificação & Rodapé */}
                                    <div className="mt-8 pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500 font-mono">
                                        <div className="max-w-[70%] text-left">
                                            {formDoc.data.rodape_oficial_documentos}
                                        </div>
                                        <div className="text-right">
                                            HASH SHA-256: 4F2C99...A7B1
                                            <br />
                                            AUTENTICAÇÃO: CONFORME
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 2. ABA GESTÃO DE UTILIZADORES FEDERADOS (SUB-ABAS: SIC, SME, PGR)         */}
                {/* ========================================================================= */}
                {abaPrincipal === 'utilizadores' && (
                    <div className="space-y-6">
                        {/* Sub-abas de Órgãos Federados */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAbaUtilizador('SIC')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        abaUtilizador === 'SIC'
                                            ? 'bg-[#1a2e46] text-[#c5a059] border border-[#c5a059]/40 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Pessoal & Oficiais do SIC ({utilizadores_sic.length})</span>
                                </button>

                                <button
                                    onClick={() => setAbaUtilizador('SME')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        abaUtilizador === 'SME'
                                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <PlaneTakeoff className="w-3.5 h-3.5" />
                                    <span>Operadores de Fronteiras SME ({utilizadores_sme.length})</span>
                                </button>

                                <button
                                    onClick={() => setAbaUtilizador('PGR')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        abaUtilizador === 'PGR'
                                            ? 'bg-purple-950/80 text-purple-300 border border-purple-600 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <Scale className="w-3.5 h-3.5" />
                                    <span>Magistrados Judiciais PGR ({utilizadores_pgr.length})</span>
                                </button>
                            </div>

                            {/* Barra de Pesquisa e Botão Criar */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar por NIP, nome..."
                                        value={buscaUtilizador}
                                        onChange={(e) => setBuscaUtilizador(e.target.value)}
                                        className="bg-[#0d1a26] border border-[#223750] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:border-[#2563eb] focus:outline-none w-56"
                                    />
                                </div>

                                <button
                                    onClick={openCreateUserModal}
                                    className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Novo Utilizador</span>
                                </button>
                            </div>
                        </div>

                        {/* Tabela de Utilizadores */}
                        <div className="bg-[#132235] border border-[#223750] rounded-md overflow-hidden shadow-xl">
                            <table className="w-full text-left text-xs font-sans">
                                <thead className="bg-[#09131d] border-b border-[#223750] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">NIP / Identificador</th>
                                        <th className="px-4 py-3">Nome Completo & E-mail</th>
                                        <th className="px-4 py-3">Função / Perfil</th>
                                        <th className="px-4 py-3">Unidade / Posto</th>
                                        <th className="px-4 py-3 text-center">Segurança 2FA</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#223750] text-slate-200">
                                    {filteredUtilizadores.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                                                Nenhum utilizador encontrado para este critério.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUtilizadores.map((u) => (
                                            <tr key={u.id} className="hover:bg-[#17283c]/50 transition-colors">
                                                <td className="px-4 py-3 font-mono font-bold text-[#c5a059]">
                                                    {u.nip}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-slate-100">{u.nome_completo}</div>
                                                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0d1a26] border border-[#223750] text-sky-400">
                                                        {u.perfil}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>{u.unidade?.nome || 'Não atribuída'}</div>
                                                    {u.posto_fronteira && (
                                                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                                            {u.posto_fronteira}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {u.requer_2fa ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                                            <Lock className="w-3 h-3" /> Ativo
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 text-[11px]">Desativado</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleToggleUserStatus(u.id)}
                                                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                                            u.ativo
                                                                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                                                                : 'bg-rose-950/70 border-rose-700 text-rose-300 hover:bg-rose-900'
                                                        }`}
                                                    >
                                                        {u.ativo ? 'ATIVO' : 'INATIVO'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openEditUserModal(u)}
                                                            title="Editar Utilizador"
                                                            className="p-1.5 bg-[#0d1a26] hover:bg-[#1a2e46] border border-[#223750] text-slate-300 hover:text-white rounded transition-colors"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetPassword(u.id, u.nome_completo)}
                                                            title="Redefinir Senha"
                                                            className="p-1.5 bg-[#0d1a26] hover:bg-amber-950/70 border border-[#223750] text-amber-400 hover:text-amber-200 rounded transition-colors"
                                                        >
                                                            <KeyRound className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 3. ABA DEPARTAMENTOS & UNIDADES ORGÂNICAS                                  */}
                {/* ========================================================================= */}
                {abaPrincipal === 'departamentos' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-sans">
                                    Estrutura Orgânica & Comandos Territoriais
                                </h2>
                                <p className="text-xs text-slate-400 font-sans mt-0.5">
                                    Níveis Central (Direcção Nacional), Provincial (21 Comandos) e Municipal (Esquadras)
                                </p>
                            </div>

                            <button
                                onClick={openCreateDeptModal}
                                className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nova Unidade Orgânica</span>
                            </button>
                        </div>

                        <div className="bg-[#132235] border border-[#223750] rounded-md overflow-hidden shadow-xl">
                            <table className="w-full text-left text-xs font-sans">
                                <thead className="bg-[#09131d] border-b border-[#223750] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Sigla</th>
                                        <th className="px-4 py-3">Designação da Unidade</th>
                                        <th className="px-4 py-3">Nível Orgânico</th>
                                        <th className="px-4 py-3">Província / Jurisdição</th>
                                        <th className="px-4 py-3">Unidade Superior</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#223750] text-slate-200">
                                    {unidades.map((d) => (
                                        <tr key={d.id} className="hover:bg-[#17283c]/50 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-[#c5a059]">{d.sigla}</td>
                                            <td className="px-4 py-3 font-medium text-slate-100">{d.nome}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                        d.nivel === 'CENTRAL'
                                                            ? 'bg-purple-950/80 border border-purple-800 text-purple-300'
                                                            : d.nivel === 'PROVINCIAL'
                                                            ? 'bg-sky-950/80 border border-sky-800 text-sky-300'
                                                            : 'bg-slate-900 border border-slate-700 text-slate-300'
                                                    }`}
                                                >
                                                    {d.nivel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {d.provincia?.nome ? (
                                                    <span>{d.provincia.nome}</span>
                                                ) : (
                                                    <span className="text-slate-500 italic">Âmbito Nacional</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {d.unidade_superior?.sigla || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                                        d.ativo
                                                            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                                                            : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                                                    }`}
                                                >
                                                    {d.ativo ? 'OPERACIONAL' : 'INATIVO'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => openEditDeptModal(d)}
                                                    title="Editar Departamento"
                                                    className="p-1.5 bg-[#0d1a26] hover:bg-[#1a2e46] border border-[#223750] text-slate-300 hover:text-white rounded transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 4. ABA FUNÇÕES (ROLES) & MATRIZ DE PERMISSÕES                             */}
                {/* ========================================================================= */}
                {abaPrincipal === 'permissoes' && (
                    <div className="space-y-6">
                        {/* Seletor de Perfil / Função */}
                        <div className="bg-[#132235] border border-[#223750] p-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <label className="block text-slate-400 text-[11px] uppercase font-sans font-semibold mb-1">
                                    Selecione o Perfil para Configurar a Matriz de Controlo de Acesso:
                                </label>
                                <div className="text-xs text-slate-300">
                                    As permissões aplicam-se em cascata para todos os utilizadores federados vinculados a este perfil.
                                </div>
                            </div>

                            <select
                                value={perfilPermissao}
                                onChange={(e) => setPerfilPermissao(e.target.value)}
                                className="bg-[#0d1a26] border border-[#223750] text-slate-100 text-xs font-sans rounded px-3 py-2 focus:border-[#2563eb] focus:outline-none min-w-[320px] font-semibold"
                            >
                                {perfis_lista.map((p) => (
                                    <option key={p.codigo} value={p.codigo}>
                                        {p.nome} ({p.codigo})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Matriz de Permissões por Módulo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {modulosPermissoesDef.map((modDef) => (
                                <TacticalCard
                                    key={modDef.modulo}
                                    title={modDef.titulo}
                                    icon={<Shield className="w-4 h-4 text-[#c5a059]" />}
                                >
                                    <div className="space-y-2.5 text-xs font-sans">
                                        {modDef.acoes.map((acao) => {
                                            const isChecked = getPermissaoValue(modDef.modulo, acao.key);
                                            return (
                                                <label
                                                    key={acao.key}
                                                    className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                                                        isChecked
                                                            ? 'bg-[#1a2e46] border-sky-800 text-slate-100'
                                                            : 'bg-[#0d1a26] border-[#223750] text-slate-400 hover:text-slate-300'
                                                    }`}
                                                >
                                                    <span className="text-[11px] font-medium">{acao.label}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleTogglePermissao(modDef.modulo, acao.key)}
                                                        className="w-4 h-4 rounded bg-[#09131d] border-[#223750] text-[#c5a059] focus:ring-0 cursor-pointer"
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </TacticalCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 5. ABA CATÁLOGOS DINÂMICOS DO SISTEMA (TABELAS PARAMÉTRICAS)              */}
                {/* ========================================================================= */}
                {abaPrincipal === 'catalogos' && (
                    <div className="space-y-6">
                        {/* Seletor de Categoria de Catálogo */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#223750] pb-3">
                            <div className="flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
                                <button
                                    onClick={() => setCategoriaCatalogo('tipologia_legal')}
                                    className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        categoriaCatalogo === 'tipologia_legal'
                                            ? 'bg-[#1a2e46] text-[#c5a059] border border-[#c5a059]/40 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <Scale className="w-3.5 h-3.5" />
                                    <span>Tipologia Legal (Crimes CP)</span>
                                </button>

                                <button
                                    onClick={() => setCategoriaCatalogo('papel_interveniente')}
                                    className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        categoriaCatalogo === 'papel_interveniente'
                                            ? 'bg-[#1a2e46] text-[#c5a059] border border-[#c5a059]/40 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Papel do Interveniente</span>
                                </button>

                                <button
                                    onClick={() => setCategoriaCatalogo('tipo_participacao')}
                                    className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        categoriaCatalogo === 'tipo_participacao'
                                            ? 'bg-[#1a2e46] text-[#c5a059] border border-[#c5a059]/40 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Tipo de Participação</span>
                                </button>

                                <button
                                    onClick={() => setCategoriaCatalogo('especialidade_forense')}
                                    className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        categoriaCatalogo === 'especialidade_forense'
                                            ? 'bg-[#1a2e46] text-[#c5a059] border border-[#c5a059]/40 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <Microscope className="w-3.5 h-3.5" />
                                    <span>Especialidade Forense</span>
                                </button>

                                <button
                                    onClick={() => setCategoriaCatalogo('medida_judicial')}
                                    className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                                        categoriaCatalogo === 'medida_judicial'
                                            ? 'bg-[#1a2e46] text-[#c5a059] border border-[#c5a059]/40 shadow-sm'
                                            : 'bg-[#0d1a26] text-slate-400 border border-[#223750] hover:text-slate-200'
                                    }`}
                                >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>Tipo de Medida Judicial</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar catálogo..."
                                        value={buscaCatalogo}
                                        onChange={(e) => setBuscaCatalogo(e.target.value)}
                                        className="bg-[#0d1a26] border border-[#223750] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:border-[#2563eb] focus:outline-none w-48"
                                    />
                                </div>

                                <button
                                    onClick={openCreateCatModal}
                                    className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-md cursor-pointer transition-colors whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Novo Registo</span>
                                </button>
                            </div>
                        </div>

                        {/* Tabela do Catálogo */}
                        <div className="bg-[#132235] border border-[#223750] rounded-md overflow-hidden shadow-xl">
                            <table className="w-full text-left text-xs font-sans">
                                <thead className="bg-[#09131d] border-b border-[#223750] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Código</th>
                                        <th className="px-4 py-3">Designação Oficial</th>
                                        <th className="px-4 py-3">Descrição Operacional</th>
                                        <th className="px-4 py-3">Parâmetros / Metadados</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                        <th className="px-4 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#223750] text-slate-200">
                                    {filteredCatalogos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                                                Nenhum registo cadastrado nesta categoria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCatalogos.map((c) => (
                                            <tr key={c.id} className="hover:bg-[#17283c]/50 transition-colors">
                                                <td className="px-4 py-3 font-mono font-bold text-[#c5a059]">{c.codigo}</td>
                                                <td className="px-4 py-3 font-medium text-slate-100">{c.nome}</td>
                                                <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                                                    {c.descricao || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                                                    {c.metadados ? (
                                                        <div className="space-y-0.5">
                                                            {c.metadados.artigo_cp && (
                                                                <div>Art. {c.metadados.artigo_cp}º</div>
                                                            )}
                                                            {c.metadados.moldura && (
                                                                <div className="text-amber-300 font-sans">
                                                                    Moldura: {c.metadados.moldura}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleToggleCatStatus(c.id)}
                                                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                                            c.ativo
                                                                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                                                                : 'bg-rose-950/70 border-rose-700 text-rose-300 hover:bg-rose-900'
                                                        }`}
                                                    >
                                                        {c.ativo ? 'ATIVO' : 'DESATIVADO'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => openEditCatModal(c)}
                                                        title="Editar Registo"
                                                        className="p-1.5 bg-[#0d1a26] hover:bg-[#1a2e46] border border-[#223750] text-slate-300 hover:text-white rounded transition-colors"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL: CRIAR / EDITAR UTILIZADOR                                          */}
                {/* ========================================================================= */}
                {modalUserOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-[#132235] border border-[#223750] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#c5a059]" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                        {editingUser ? 'Editar Utilizador Federado' : 'Registar Novo Utilizador'}
                                    </h3>
                                </div>
                                <button onClick={() => setModalUserOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs font-sans">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">NIP Oficial</label>
                                        <input
                                            type="text"
                                            required
                                            value={formUser.data.nip}
                                            onChange={(e) => formUser.setData('nip', e.target.value)}
                                            placeholder="SIC-INV-0099"
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 font-mono focus:border-[#2563eb] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">E-mail Institucional</label>
                                        <input
                                            type="email"
                                            required
                                            value={formUser.data.email}
                                            onChange={(e) => formUser.setData('email', e.target.value)}
                                            placeholder="agente@sic.gov.ao"
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 font-mono focus:border-[#2563eb] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formUser.data.nome_completo}
                                        onChange={(e) => formUser.setData('nome_completo', e.target.value)}
                                        placeholder="Ex: Inspector Mário Manuel dos Santos"
                                        className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                    />
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Senha Temporária</label>
                                        <input
                                            type="password"
                                            required
                                            value={formUser.data.password}
                                            onChange={(e) => formUser.setData('password', e.target.value)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 font-mono focus:border-[#2563eb] focus:outline-none"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Perfil / Função</label>
                                        <select
                                            value={formUser.data.perfil}
                                            onChange={(e) => formUser.setData('perfil', e.target.value)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none font-semibold"
                                        >
                                            {perfis_lista.map((p) => (
                                                <option key={p.codigo} value={p.codigo}>
                                                    {p.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Unidade / Departamento</label>
                                        <select
                                            value={formUser.data.unidade_id}
                                            onChange={(e) => formUser.setData('unidade_id', e.target.value)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                        >
                                            {unidades.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.sigla} — {u.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {formUser.data.perfil === 'OPERADOR_SME' && (
                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">
                                            Posto de Fronteira Atribuído
                                        </label>
                                        <input
                                            type="text"
                                            value={formUser.data.posto_fronteira}
                                            onChange={(e) => formUser.setData('posto_fronteira', e.target.value)}
                                            placeholder="Ex: Aeroporto 4 de Fevereiro / Porto de Luanda"
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={formUser.data.requer_2fa}
                                            onChange={(e) => formUser.setData('requer_2fa', e.target.checked)}
                                            className="w-4 h-4 rounded bg-[#0d1a26] border-[#223750] text-[#c5a059]"
                                        />
                                        <span>Exigir 2FA no Login</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={formUser.data.ativo}
                                            onChange={(e) => formUser.setData('ativo', e.target.checked)}
                                            className="w-4 h-4 rounded bg-[#0d1a26] border-[#223750] text-emerald-500"
                                        />
                                        <span>Utilizador Ativo</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalUserOpen(false)}
                                        className="px-4 py-2 bg-[#0d1a26] border border-[#223750] text-slate-300 hover:text-white rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formUser.processing}
                                        className="px-5 py-2 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded"
                                    >
                                        {editingUser ? 'Atualizar Utilizador' : 'Gravar Utilizador'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL: CRIAR / EDITAR DEPARTAMENTO                                        */}
                {/* ========================================================================= */}
                {modalDeptOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-[#132235] border border-[#223750] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-[#c5a059]" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                        {editingDept ? 'Editar Unidade Orgânica' : 'Nova Unidade Orgânica'}
                                    </h3>
                                </div>
                                <button onClick={() => setModalDeptOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveDept} className="space-y-3.5 text-xs font-sans">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Sigla</label>
                                        <input
                                            type="text"
                                            required
                                            value={formDept.data.sigla}
                                            onChange={(e) => formDept.setData('sigla', e.target.value)}
                                            placeholder="DPSIC-LUA"
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 font-mono focus:border-[#2563eb] focus:outline-none uppercase"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Nível Hierárquico</label>
                                        <select
                                            value={formDept.data.nivel}
                                            onChange={(e) => formDept.setData('nivel', e.target.value as any)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                        >
                                            <option value="CENTRAL">CENTRAL (Direcção Nacional)</option>
                                            <option value="PROVINCIAL">PROVINCIAL (Comando Provincial)</option>
                                            <option value="MUNICIPAL">MUNICIPAL (Esquadra / Repartição)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Designação Oficial da Unidade</label>
                                    <input
                                        type="text"
                                        required
                                        value={formDept.data.nome}
                                        onChange={(e) => formDept.setData('nome', e.target.value)}
                                        placeholder="Ex: Direcção Provincial do SIC em Luanda"
                                        className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Província</label>
                                        <select
                                            value={formDept.data.provincia_id}
                                            onChange={(e) => formDept.setData('provincia_id', e.target.value)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                        >
                                            <option value="">Âmbito Nacional / Central</option>
                                            {provincias.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Unidade Superior</label>
                                        <select
                                            value={formDept.data.unidade_superior_id}
                                            onChange={(e) => formDept.setData('unidade_superior_id', e.target.value)}
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                        >
                                            <option value="">Nenhuma (Unidade de Cúpula)</option>
                                            {unidades.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.sigla} — {u.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalDeptOpen(false)}
                                        className="px-4 py-2 bg-[#0d1a26] border border-[#223750] text-slate-300 hover:text-white rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formDept.processing}
                                        className="px-5 py-2 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded"
                                    >
                                        {editingDept ? 'Atualizar Unidade' : 'Gravar Unidade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* MODAL: CRIAR / EDITAR CATÁLOGO PARAMÉTRICO                                */}
                {/* ========================================================================= */}
                {modalCatOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-[#132235] border border-[#223750] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between border-b border-[#223750] pb-3">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-[#c5a059]" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans">
                                        {editingCat ? 'Editar Registo de Catálogo' : 'Novo Registo Paramétrico'}
                                    </h3>
                                </div>
                                <button onClick={() => setModalCatOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCat} className="space-y-3.5 text-xs font-sans">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Categoria</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={categoriaCatalogo}
                                            className="w-full bg-[#09131d] border border-[#223750] rounded px-3 py-2 text-slate-400 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Código Interno</label>
                                        <input
                                            type="text"
                                            required
                                            value={formCat.data.codigo}
                                            onChange={(e) => formCat.setData('codigo', e.target.value.toUpperCase())}
                                            placeholder="EX: CRIME_NOVO"
                                            className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 font-mono focus:border-[#2563eb] focus:outline-none uppercase"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Designação Oficial</label>
                                    <input
                                        type="text"
                                        required
                                        value={formCat.data.nome}
                                        onChange={(e) => formCat.setData('nome', e.target.value)}
                                        placeholder="Ex: Associação Criminosa e Organização Ilegal"
                                        className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Descrição Detalhada</label>
                                    <textarea
                                        rows={2}
                                        value={formCat.data.descricao}
                                        onChange={(e) => formCat.setData('descricao', e.target.value)}
                                        placeholder="Descrição e enquadramento legal..."
                                        className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 focus:border-[#2563eb] focus:outline-none"
                                    />
                                </div>

                                {categoriaCatalogo === 'tipologia_legal' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Artigo do CP</label>
                                            <input
                                                type="text"
                                                value={formCat.data.metadados_artigo}
                                                onChange={(e) => formCat.setData('metadados_artigo', e.target.value)}
                                                placeholder="Ex: 142"
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-400 text-[11px] uppercase mb-1 font-medium">Moldura Penal Prevista</label>
                                            <input
                                                type="text"
                                                value={formCat.data.metadados_moldura}
                                                onChange={(e) => formCat.setData('metadados_moldura', e.target.value)}
                                                placeholder="Ex: 20 a 25 anos"
                                                className="w-full bg-[#0d1a26] border border-[#223750] rounded px-3 py-2 text-slate-100 font-mono"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-4 border-t border-[#223750]">
                                    <button
                                        type="button"
                                        onClick={() => setModalCatOpen(false)}
                                        className="px-4 py-2 bg-[#0d1a26] border border-[#223750] text-slate-300 hover:text-white rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-[#c5a059] hover:bg-[#DFC07A] text-[#0d1a26] font-bold text-xs uppercase tracking-wider rounded"
                                    >
                                        {editingCat ? 'Atualizar Catálogo' : 'Gravar no Catálogo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </TacticalLayout>
    );
}
