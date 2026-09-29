export type PerfilUtilizador = 
    | 'ADMIN_SISTEMA'
    | 'DIRETOR_NACIONAL'
    | 'COMANDANTE_PROVINCIAL'
    | 'CHEFE_DEPARTAMENTO'
    | 'INVESTIGADOR'
    | 'OFICIAL_SECRETARIA'
    | 'OPERADOR_SME'
    | 'MAGISTRADO_PGR'
    | 'CONSULTA_ESTATISTICA';

export interface Utilizador {
    id: string;
    nip: string;
    nome_completo: string;
    email: string;
    perfil: PerfilUtilizador;
    unidade_id: string;
    unidade?: EstruturaUnidade;
    posto_fronteira?: string | null;
    requer_2fa: boolean;
    ativo: boolean;
}

export interface Provincia {
    id: string;
    codigo_iso: string;
    nome: string;
    municipios_count?: number;
    ocorrencias_count?: number;
    processos_count?: number;
}

export interface Municipio {
    id: string;
    provincia_id: string;
    nome: string;
    codigo_geocodigo?: string | null;
    provincia?: Provincia;
}

export interface EstruturaUnidade {
    id: string;
    nome: string;
    sigla: string;
    nivel: 'CENTRAL' | 'PROVINCIAL' | 'MUNICIPAL';
    unidade_superior_id?: string | null;
    provincia_id?: string | null;
    municipio_id?: string | null;
    provincia?: Provincia;
    ativo: boolean;
}

export interface Individuo {
    id: string;
    numero_bi?: string | null;
    passaporte?: string | null;
    nome_completo: string;
    nome_pai?: string | null;
    nome_mae?: string | null;
    alcunhas?: string[] | null;
    data_nascimento?: string | null;
    genero?: 'M' | 'F' | null;
    nacionalidade: string;
    sinais_particulares?: string | null;
    foto_storage_path?: string | null;
    perigoso: boolean;
    interdicao_saida: boolean;
    mandados_ativos_count?: number;
}

export type TipoParticipacao = 'PRESENCIAL' | 'TELEFONICA' | 'DENUNCIA_ANONIMA' | 'OFICIOSA' | 'EXPEDIENTE_POP';
export type EstadoOcorrencia = 'REGISTADA' | 'EM_TRIAGEM' | 'INSTAURADO_PROCESSO' | 'ARQUIVADA';

export interface OcorrenciaInterveniente {
    id: string;
    ocorrencia_id: string;
    individuo_id?: string | null;
    papel: 'VITIMA' | 'SUSPEITO' | 'TESTEMUNHA' | 'DENUNCIANTE' | 'DECLARANTE';
    nome_identificativo: string;
    contacto_telefone?: string | null;
    declaracoes_resumo?: string | null;
    individuo?: Individuo;
}

export interface OcorrenciaAnexo {
    id: string;
    ocorrencia_id: string;
    tipo_ficheiro: string;
    storage_path: string;
    nome_original: string;
    tamanho_bytes: number;
    hash_sha256: string;
    created_at: string;
}

export interface Ocorrencia {
    id: string;
    numero_ocorrencia: string;
    tipo_participacao: TipoParticipacao;
    origem_pop: boolean;
    documento_pop_escaneado_path?: string | null;
    descricao_facto_html: string;
    data_hora_facto: string;
    provincia_id: string;
    municipio_id: string;
    local_detalhado: string;
    coordenadas_lat?: number;
    coordenadas_lng?: number;
    classificacao_codigo: string;
    unidade_registo_id: string;
    utilizador_registo_id: string;
    estado: EstadoOcorrencia;
    created_at: string;
    provincia?: Provincia;
    municipio?: Municipio;
    unidade?: EstruturaUnidade;
    utilizador?: Utilizador;
    intervenientes?: OcorrenciaInterveniente[];
    anexos?: OcorrenciaAnexo[];
}

export type EstadoProcesso = 'EM_INSTRUCAO' | 'RELATORIO_CONCLUIDO' | 'REMETIDO_AO_MP' | 'ACUSADO' | 'ARQUIVADO';

export interface ProcessoDiligencia {
    id: string;
    processo_id: string;
    tipo: string;
    descricao_detalhada: string;
    resultado: string;
    data_realizacao: string;
    responsavel_id: string;
    responsavel?: Utilizador;
    anexo_auto_path?: string | null;
}

export interface BemCustodia {
    id: string;
    detencao_id?: string | null;
    processo_id: string;
    numero_lacre_seguranca: string;
    descricao_bem: string;
    tipo_objeto: 'ARMA_FOGO' | 'SUBSTANCIA_ENTORPECENTE' | 'VALOR_MONETARIO' | 'VIATURA' | 'EQUIPAMENTO_ELETRONICO' | 'OUTRO';
    local_cofre_deposito: string;
    apreendido_por_id: string;
    entregue_a_terceiro: boolean;
    created_at: string;
}

export interface ProcessoCrime {
    id: string;
    numero_processo: string;
    ocorrencia_origem_id?: string | null;
    provincia_id: string;
    unidade_competente_id: string;
    investigador_titular_id?: string | null;
    tipologia_legal: string;
    segredo_justica: boolean;
    data_abertura: string;
    data_limite_instrucao: string;
    estado: EstadoProcesso;
    data_remessa_mp?: string | null;
    magistrado_pgr_responsavel?: string | null;
    created_at: string;
    provincia?: Provincia;
    unidade?: EstruturaUnidade;
    investigador?: Utilizador;
    ocorrencia?: Ocorrencia;
    diligencias?: ProcessoDiligencia[];
    bens?: BemCustodia[];
}

export type EstadoCustodia = 'CELA_TRANSITORIA' | 'APRESENTADO_MP' | 'TRANSFERIDO_PRISAO' | 'LIBERTADO';

export interface Detencao {
    id: string;
    individuo_id: string;
    processo_id?: string | null;
    data_hora_detencao: string;
    limite_legal_48h: string;
    local_detencao: string;
    auto_detencao_path: string;
    efetivo_captor_nip: string;
    estado_custodia: EstadoCustodia;
    motivo_legal: string;
    individuo?: Individuo;
    processo?: ProcessoCrime;
    horas_restantes?: number;
}

export type TipoPericia = 'BALISTICA' | 'DACTILOSCOPIA' | 'TOXICOLOGIA' | 'DOCUMENTOSCOPIA' | 'INFORMATICA_FORENSE' | 'BIOLOGIA_ADN';
export type EstadoPericia = 'REQUISITADA' | 'EM_ANALISE' | 'CONCLUIDA' | 'RECUSADA';

export interface PericiaLaboratorio {
    id: string;
    processo_id: string;
    codigo_vestigio_lacre: string;
    tipo_pericia: TipoPericia;
    descricao_vestigio: string;
    estado: EstadoPericia;
    perito_responsavel_id?: string | null;
    perito?: Utilizador;
    laudo_pericial_path?: string | null;
    hash_laudo_sha256?: string | null;
    data_requisicao: string;
    data_conclusao?: string | null;
    processo?: ProcessoCrime;
}

export type TipoMandado = 'CAPTURA_NACIONAL' | 'INTERDICAO_SAIDA' | 'IMPEDIMENTO_ENTRADA' | 'CAPTURA_INTERPOL';
export type EstadoMandado = 'ATIVO' | 'CUMPRIDO' | 'REVOGADO' | 'CADUCADO';

export interface MandadoSinalizacao {
    id: string;
    numero_mandado_oficial: string;
    processo_id?: string | null;
    individuo_id: string;
    tipo: TipoMandado;
    orgao_emitente: string;
    magistrado_nome: string;
    fundamentacao_legal: string;
    despacho_assinado_path: string;
    data_emissao: string;
    data_validade: string;
    alerta_sme_ativo: boolean;
    interpol_red_notice: boolean;
    estado: EstadoMandado;
    individuo?: Individuo;
    processo?: ProcessoCrime;
}

export interface IntercepcaoFronteirica {
    id: string;
    mandado_id: string;
    posto_fronteira: string;
    sentido: 'ENTRADA' | 'SAIDA';
    operador_sme_nip: string;
    detalhes_acao: string;
    created_at: string;
    mandado?: MandadoSinalizacao;
}

export interface LogAuditoria {
    id: number;
    utilizador_id?: string | null;
    ip_origem: string;
    rota_acao: string;
    tabela_afetada: string;
    registo_id: string;
    dados_anteriores?: any;
    dados_novos?: any;
    hash_anterior: string;
    hash_atual: string;
    created_at: string;
    utilizador?: Utilizador;
}

export interface PageProps {
    auth: {
        user: Utilizador;
        active_provincia?: Provincia;
    };
    flash: {
        success?: string;
        error?: string;
        alert?: string;
    };
    prazos_urgentes?: {
        total_48h_urgentes: number;
        detidos_criticos: Detencao[];
    };
}
