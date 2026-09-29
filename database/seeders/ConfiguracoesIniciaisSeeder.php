<?php

namespace Database\Seeders;

use App\Models\ConfiguracaoSistema;
use App\Models\RolePermissao;
use App\Models\TabelaParametrica;
use Illuminate\Database\Seeder;

class ConfiguracoesIniciaisSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Configurações Institucionais e Documentais
        $configuracoes = [
            // Identidade Institucional
            ['chave' => 'pais_nome', 'valor' => 'REPÚBLICA DE ANGOLA', 'grupo' => 'institucional', 'descricao' => 'Designação oficial do Estado'],
            ['chave' => 'ministerio_nome', 'valor' => 'MINISTÉRIO DO INTERIOR', 'grupo' => 'institucional', 'descricao' => 'Ministério de tutela'],
            ['chave' => 'direcao_geral', 'valor' => 'SERVIÇO DE INVESTIGAÇÃO CRIMINAL', 'grupo' => 'institucional', 'descricao' => 'Órgão de Polícia Judiciária'],
            ['chave' => 'direcao_nacional', 'valor' => 'DIRECÇÃO NACIONAL DE OPERAÇÕES E ESTATÍSTICA POLICIAL (DNOEP)', 'grupo' => 'institucional', 'descricao' => 'Direcção Operacional Central'],
            ['chave' => 'lema_institucional', 'valor' => 'HONRA, LEALDADE E LEGALIDADE', 'grupo' => 'institucional', 'descricao' => 'Lema oficial dos autos'],
            ['chave' => 'marca_dagua_documento', 'valor' => 'CONFIDENCIAL // USO EXCLUSIVO POLICIAL', 'grupo' => 'documentos', 'descricao' => 'Texto de segurança da marca de água'],

            // Títulos dos Signatários nos Documentos Oficiais
            ['chave' => 'titulo_assinatura_central', 'valor' => 'Comissário-Geral // Director Geral do SIC', 'grupo' => 'documentos', 'descricao' => 'Cargo/Posto do Diretor Nacional'],
            ['chave' => 'titulo_assinatura_provincial', 'valor' => 'Subcomissário // Comandante Provincial do SIC', 'grupo' => 'documentos', 'descricao' => 'Cargo/Posto do Comandante Provincial'],
            ['chave' => 'titulo_assinatura_investigador', 'valor' => 'Inspector // Instrutor do Processo-Crime', 'grupo' => 'documentos', 'descricao' => 'Cargo/Posto do Instrutor do Inquérito'],
            ['chave' => 'titulo_assinatura_magistrado', 'valor' => 'Subprocurador-Geral // Magistrado do Ministério Público', 'grupo' => 'documentos', 'descricao' => 'Cargo/Posto do Magistrado PGR titular'],

            // Fórmulas Oficiais
            ['chave' => 'formula_encerramento_autos', 'valor' => 'E por nada mais haver a constar, lavrou-se o presente auto que, lido e achado conforme, vai devidamente assinado pelo declarante, instrutor policial e escrivão que o redigiu em conformidade com o Código de Processo Penal Angolano.', 'grupo' => 'documentos', 'descricao' => 'Fórmula solene de encerramento de peças e autos'],
            ['chave' => 'rodape_oficial_documentos', 'valor' => 'Serviço de Investigação Criminal — Direcção Central: Av. 4 de Fevereiro, Luanda, Angola • Central Operacional: (+244) 222 334 455 • dnoep@sic.gov.ao • Certificação Criptográfica SHA-256', 'grupo' => 'documentos', 'descricao' => 'Rodapé impresso nas peças e relatórios'],
        ];

        foreach ($configuracoes as $cfg) {
            ConfiguracaoSistema::setValor($cfg['chave'], $cfg['valor'], $cfg['grupo'], $cfg['descricao']);
        }

        // 2. Catálogos Dinâmicos / Tabelas Paramétricas
        $catalogos = [
            // TIPOLOGIAS LEGAIS (Código Penal Angolano)
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'HOMICIDIO_QUALIFICADO',
                'nome' => 'Homicídio Qualificado (Art. 142º do CP)',
                'descricao' => 'Crime contra a vida em circunstâncias agravantes especiais. Moldura penal de 20 a 25 anos de prisão maior.',
                'metadados' => ['artigo_cp' => '142', 'capitulo' => 'Crimes contra as Pessoas', 'moldura' => '20 a 25 anos'],
                'ordem' => 1,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'HOMICIDIO_SIMPLES',
                'nome' => 'Homicídio Simples (Art. 140º do CP)',
                'descricao' => 'Crime contra a vida humana voluntário. Moldura penal de 16 a 20 anos de prisão maior.',
                'metadados' => ['artigo_cp' => '140', 'capitulo' => 'Crimes contra as Pessoas', 'moldura' => '16 a 20 anos'],
                'ordem' => 2,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'ROUBO_QUALIFICADO',
                'nome' => 'Roubo Qualificado com Arma de Fogo (Art. 396º do CP)',
                'descricao' => 'Subtração violenta de bens com recurso a armas de fogo ou em bando.',
                'metadados' => ['artigo_cp' => '396', 'capitulo' => 'Crimes contra o Património', 'moldura' => '8 a 16 anos'],
                'ordem' => 3,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'FURTO_QUALIFICADO',
                'nome' => 'Furto Qualificado (Art. 388º do CP)',
                'descricao' => 'Subtração de coisa móvel alheia mediante arrombamento ou escalamento.',
                'metadados' => ['artigo_cp' => '388', 'capitulo' => 'Crimes contra o Património', 'moldura' => '2 a 8 anos'],
                'ordem' => 4,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'BURLA_DEFRAUDACAO',
                'nome' => 'Burla por Defraudação (Art. 419º do CP)',
                'descricao' => 'Engano ardiloso com intenção de obter benefício patrimonial ilegítimo.',
                'metadados' => ['artigo_cp' => '419', 'capitulo' => 'Crimes contra o Património', 'moldura' => '2 a 8 anos'],
                'ordem' => 5,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'TRAFICO_ESTUPEFACIENTES',
                'nome' => 'Tráfico de Estupefacientes e Substâncias Psicotrópicas',
                'descricao' => 'Importação, exportação, fabrico ou distribuição ilícita de drogas e entorpecentes.',
                'metadados' => ['artigo_cp' => 'Lei 3/99', 'capitulo' => 'Crimes contra a Saúde Pública', 'moldura' => '8 a 16 anos'],
                'ordem' => 6,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'PECULATO',
                'nome' => 'Peculato e Apropriação Indevida de Fundos Públicos',
                'descricao' => 'Apropriação ilegítima de bens públicos por funcionário no exercício de funções.',
                'metadados' => ['artigo_cp' => '362', 'capitulo' => 'Crimes contra o Estado e a Administração', 'moldura' => '8 a 12 anos'],
                'ordem' => 7,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'BRANQUEAMENTO_CAPITAIS',
                'nome' => 'Branqueamento de Capitais e Financiamento Ilícito',
                'descricao' => 'Dissimulação da origem ilícita de fundos e bens.',
                'metadados' => ['artigo_cp' => 'Lei 5/20', 'capitulo' => 'Crimes Económico-Financeiros', 'moldura' => '5 a 12 anos'],
                'ordem' => 8,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'CIBERCRIME_ACESSO_ILEGITIMO',
                'nome' => 'Cibercrime e Invasão de Redes Críticas',
                'descricao' => 'Acesso não autorizado a sistemas informáticos, sabotagem e interceção ilícita.',
                'metadados' => ['artigo_cp' => 'Lei 7/17', 'capitulo' => 'Crimes Tecnológicos', 'moldura' => '2 a 8 anos'],
                'ordem' => 9,
            ],
            [
                'categoria' => 'tipologia_legal',
                'codigo' => 'ASSOCIACAO_CRIMINOSA',
                'nome' => 'Associação Criminosa e Crime Organizado',
                'descricao' => 'Grupo estruturado de três ou mais indivíduos para a prática reiterada de crimes.',
                'metadados' => ['artigo_cp' => '299', 'capitulo' => 'Crimes contra a Paz Pública', 'moldura' => '5 a 12 anos'],
                'ordem' => 10,
            ],

            // PAPEL DO INTERVENIENTE
            ['categoria' => 'papel_interveniente', 'codigo' => 'VITIMA', 'nome' => 'Vítima', 'descricao' => 'Pessoa que sofreu direta ou indiretamente o dano criminal', 'ordem' => 1],
            ['categoria' => 'papel_interveniente', 'codigo' => 'SUSPEITO', 'nome' => 'Suspeito', 'descricao' => 'Indivíduo sob investigação sobre o qual recaem indícios', 'ordem' => 2],
            ['categoria' => 'papel_interveniente', 'codigo' => 'ARGUIDO', 'nome' => 'Arguido Constituído', 'descricao' => 'Cidadão formalmente constituído arguido com garantias de defesa', 'ordem' => 3],
            ['categoria' => 'papel_interveniente', 'codigo' => 'QUEIXOSO', 'nome' => 'Queixoso / Ofendido', 'descricao' => 'Titular do direito de queixa criminal', 'ordem' => 4],
            ['categoria' => 'papel_interveniente', 'codigo' => 'TESTEMUNHA', 'nome' => 'Testemunha Presencial', 'descricao' => 'Pessoa que presenciou ou possui conhecimento direto dos factos', 'ordem' => 5],
            ['categoria' => 'papel_interveniente', 'codigo' => 'DENUNCIANTE', 'nome' => 'Denunciante', 'descricao' => 'Cidadão que comunica a ocorrência de um crime público', 'ordem' => 6],
            ['categoria' => 'papel_interveniente', 'codigo' => 'DECLARANTE', 'nome' => 'Declarante', 'descricao' => 'Prestador de declarações instrutórias complementares', 'ordem' => 7],
            ['categoria' => 'papel_interveniente', 'codigo' => 'PERITO', 'nome' => 'Perito Criminalístico', 'descricao' => 'Especialista forense responsável por laudo pericial', 'ordem' => 8],

            // TIPO DE PARTICIPAÇÃO
            ['categoria' => 'tipo_participacao', 'codigo' => 'PRESENCIAL', 'nome' => 'Presencial (Auto de Notícia na Esquadra)', 'descricao' => 'Comparecimento físico do queixoso ou interveniente nas instalações policiais', 'ordem' => 1],
            ['categoria' => 'tipo_participacao', 'codigo' => 'TELEFONICA', 'nome' => 'Telefónica (Linha 111 / Central de Atendimento)', 'descricao' => 'Comunicação via central telefónica de emergência policial', 'ordem' => 2],
            ['categoria' => 'tipo_participacao', 'codigo' => 'DENUNCIA_ANONIMA', 'nome' => 'Denúncia Anónima / Piquete Digital', 'descricao' => 'Informação de inteligência remetida sob anonimato protegido', 'ordem' => 3],
            ['categoria' => 'tipo_participacao', 'codigo' => 'OFICIOSA', 'nome' => 'Oficiosa (Intervenção Direta de Patrulha)', 'descricao' => 'Constatação direta do crime pelas forças de patrulha do SIC/PNA', 'ordem' => 4],
            ['categoria' => 'tipo_participacao', 'codigo' => 'EXPEDIENTE_POP', 'nome' => 'Expediente Remetido pela Polícia de Ordem Pública (POP)', 'descricao' => 'Ofício e expediente de entrega formal pela Polícia de Ordem Pública', 'ordem' => 5],

            // ESPECIALIDADE FORENSE (Laboratório de Criminalística)
            ['categoria' => 'especialidade_forense', 'codigo' => 'BALISTICA', 'nome' => 'Balística Forense e Identificação de Armas', 'descricao' => 'Exame e confronto microscópico de armas de fogo, projéteis e invólucros', 'ordem' => 1],
            ['categoria' => 'especialidade_forense', 'codigo' => 'DACTILOSCOPIA', 'nome' => 'Dactiloscopia & Lofoscopia Digital', 'descricao' => 'Revelação, colheita e identificação biométrica de impressões papilares', 'ordem' => 2],
            ['categoria' => 'especialidade_forense', 'codigo' => 'TOXICOLOGIA', 'nome' => 'Toxicologia Forense e Narcóticos', 'descricao' => 'Deteção laboratorial de drogas, venenos, álcool e substâncias químicas', 'ordem' => 3],
            ['categoria' => 'especialidade_forense', 'codigo' => 'DOCUMENTOSCOPIA', 'nome' => 'Documentoscopia e Grafotecnia', 'descricao' => 'Perícia de assinaturas, documentos de identificação e notas falsas', 'ordem' => 4],
            ['categoria' => 'especialidade_forense', 'codigo' => 'INFORMATICA_FORENSE', 'nome' => 'Informática Forense e Extração de Telemóveis', 'descricao' => 'Preservação de vestígios digitais, discos rígidos e comunicações móveis', 'ordem' => 5],
            ['categoria' => 'especialidade_forense', 'codigo' => 'BIOLOGIA_ADN', 'nome' => 'Biologia Forense e Perfil Genético (ADN)', 'descricao' => 'Tipificação genética e confronto de amostras biológicas humanas', 'ordem' => 6],
            ['categoria' => 'especialidade_forense', 'codigo' => 'MEDICINA_LEGAL', 'nome' => 'Medicina Legal e Tanatologia Forense', 'descricao' => 'Autópsias forenses, exames de corpo de delito e avaliação de lesões corporais', 'ordem' => 7],

            // TIPO DE MEDIDA JUDICIAL / CAUTELAR
            ['categoria' => 'medida_judicial', 'codigo' => 'TIR', 'nome' => 'Termo de Identidade e Residência (TIR)', 'descricao' => 'Medida geral obrigatória de fixação de residência perante a autoridade judiciária', 'ordem' => 1],
            ['categoria' => 'medida_judicial', 'codigo' => 'PRISAO_PREVENTIVA', 'nome' => 'Prisão Preventiva (Mandado Judicial)', 'descricao' => 'Privação cautelar de liberdade decretada por Magistrado da PGR / Juiz de Garantias', 'ordem' => 2],
            ['categoria' => 'medida_judicial', 'codigo' => 'INTERDICAO_SAIDA', 'nome' => 'Interdição de Saída do País (Sinalização SME)', 'descricao' => 'Proibição de ausentar-se do território nacional com alerta imediato em fronteiras', 'ordem' => 3],
            ['categoria' => 'medida_judicial', 'codigo' => 'CAUCAO_ECONOMICA', 'nome' => 'Caução Económica e Patrimonial', 'descricao' => 'Prestação de garantia pecuniária para assegurar o cumprimento de obrigações processuais', 'ordem' => 4],
            ['categoria' => 'medida_judicial', 'codigo' => 'APRESENTACAO_PERIODICA', 'nome' => 'Apresentação Periódica às Autoridades', 'descricao' => 'Obrigação de comparência periódica na esquadra ou comando do SIC da área de residência', 'ordem' => 5],
            ['categoria' => 'medida_judicial', 'codigo' => 'SUSPENSAO_FUNCOES', 'nome' => 'Suspensão de Funções Públicas', 'descricao' => 'Afastamento preventivo do cargo em crimes de peculato, corrupção ou abuso de poder', 'ordem' => 6],
        ];

        foreach ($catalogos as $cat) {
            TabelaParametrica::updateOrCreate(
                ['categoria' => $cat['categoria'], 'codigo' => $cat['codigo']],
                [
                    'nome' => $cat['nome'],
                    'descricao' => $cat['descricao'],
                    'metadados' => $cat['metadados'] ?? null,
                    'ativo' => true,
                    'ordem' => $cat['ordem'] ?? 0,
                ]
            );
        }

        // 3. Matriz Padrão de Permissões por Perfil
        $modulos = [
            'ocorrencias' => ['visualizar', 'criar', 'triagem', 'arquivar'],
            'processos' => ['visualizar', 'instaurar', 'diligencias', 'pecas', 'custodia', 'remessa_pgr'],
            'detidos' => ['visualizar', 'registar', 'atualizar_48h', 'apresentar_mp'],
            'laboratorio' => ['visualizar', 'requisitar', 'emitir_laudo', 'validar_sha256'],
            'estatisticas' => ['visualizar', 'filtrar_provincias', 'exportar_pdf', 'exportar_excel'],
            'sme' => ['terminal_acesso', 'consultar_passageiro', 'intercetar_fronteira'],
            'magistratura' => ['painel_pgr', 'emitir_mandados', 'revogar_mandados'],
            'auditoria' => ['visualizar_logs', 'verificar_cadeia_sha256'],
            'definicoes' => ['gerir_utilizadores', 'parametrizar_catalogos', 'editar_identidade_documentos'],
        ];

        $perfisConfig = [
            'ADMIN_SISTEMA' => ['*'],
            'DIRETOR_NACIONAL' => ['ocorrencias.*', 'processos.*', 'detidos.*', 'laboratorio.*', 'estatisticas.*', 'sme.*', 'magistratura.painel_pgr', 'auditoria.*', 'definicoes.*'],
            'COMANDANTE_PROVINCIAL' => ['ocorrencias.*', 'processos.*', 'detidos.*', 'laboratorio.visualizar', 'estatisticas.*', 'auditoria.visualizar_logs'],
            'CHEFE_DEPARTAMENTO' => ['ocorrencias.*', 'processos.*', 'detidos.*', 'laboratorio.*', 'estatisticas.visualizar', 'estatisticas.exportar_pdf'],
            'INVESTIGADOR' => ['ocorrencias.visualizar', 'ocorrencias.criar', 'processos.*', 'detidos.visualizar', 'detidos.registar', 'laboratorio.visualizar', 'laboratorio.requisitar'],
            'OFICIAL_SECRETARIA' => ['ocorrencias.visualizar', 'ocorrencias.criar', 'processos.visualizar', 'detidos.visualizar', 'estatisticas.visualizar'],
            'OPERADOR_SME' => ['sme.*', 'ocorrencias.visualizar'],
            'MAGISTRADO_PGR' => ['magistratura.*', 'processos.visualizar', 'detidos.visualizar', 'estatisticas.visualizar'],
            'CONSULTA_ESTATISTICA' => ['estatisticas.*'],
        ];

        foreach ($perfisConfig as $perfil => $regras) {
            foreach ($modulos as $mod => $acoes) {
                $permissoesAtivas = [];
                foreach ($acoes as $acao) {
                    $hasWildcard = in_array('*', $regras);
                    $hasModuleWildcard = in_array("$mod.*", $regras);
                    $hasExact = in_array("$mod.$acao", $regras);
                    $permissoesAtivas[$acao] = ($hasWildcard || $hasModuleWildcard || $hasExact);
                }

                RolePermissao::updateOrCreate(
                    ['perfil' => $perfil, 'modulo' => $mod],
                    ['permissoes' => $permissoesAtivas]
                );
            }
        }
    }
}
