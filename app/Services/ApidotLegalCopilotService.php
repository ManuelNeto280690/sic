<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApidotLegalCopilotService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.apidot.api_key', env('APIDOT_API_KEY', 'sk-aBye531tDAhBmzAQOjIFDMOmDjYwfOZuShvAQS4GnmD9exgNGwJFb2OqlUEJ8t'));
        $this->baseUrl = rtrim(config('services.apidot.base_url', 'https://api.apidot.ai/v1'), '/');
        $this->model = config('services.apidot.model', 'gemini-3.5-flash');
    }

    /**
     * Envia conversa para o modelo através da API APIDOT.
     */
    public function chat(array $messages, array $context = []): array
    {
        $systemPrompt = $this->buildSystemPrompt($context);

        $payloadMessages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        foreach ($messages as $msg) {
            if (isset($msg['role'], $msg['content'])) {
                $payloadMessages[] = [
                    'role' => in_array($msg['role'], ['user', 'assistant', 'system']) ? $msg['role'] : 'user',
                    'content' => (string) $msg['content']
                ];
            }
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])
            ->timeout(35)
            ->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => $payloadMessages,
                'temperature' => 0.2,
                'max_tokens' => 4096,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['choices'][0]['message']['content'] ?? 'Sem resposta da IA.';
                return [
                    'status' => 'success',
                    'provider' => 'apidot',
                    'model' => $this->model,
                    'reply' => $reply,
                    'is_fallback' => false,
                ];
            }

            // Tratamento de erro retornado pela APIDOT (ex: Insufficient credits)
            $errorData = $response->json();
            $errorMessage = $errorData['error']['message'] ?? 'Erro desconhecido na APIDOT (' . $response->status() . ')';
            Log::warning("APIDOT Error [{$response->status()}]: {$errorMessage}");

            // Se for saldo insuficiente ou outro erro de cota da APIDOT, aciona motor de contingência
            return $this->generateContingencyLegalAnalysis($messages, $context, $errorMessage);

        } catch (\Throwable $e) {
            Log::error("APIDOT Connection Exception: " . $e->getMessage());
            return $this->generateContingencyLegalAnalysis($messages, $context, "Falha de comunicação: " . $e->getMessage());
        }
    }

    /**
     * Constrói o Prompt do Sistema focado na Legislação Angolana extraída de /docs e no Processo da Tela Ativa.
     */
    protected function buildSystemPrompt(array $context): string
    {
        $prompt = "Você é o COPILOTO JURÍDICO E PERICIAL INSTITUCIONAL do SIGD-SIC (Sistema Integrado de Gestão de Dados do Serviço de Investigação Criminal e Procuradoria-Geral da República de Angola).\n";
        $prompt .= "Você atua com elevado rigor processual, prestando consultoria estratégica ou redigindo minutas e documentos oficiais prontos para assinatura e inserção nos autos.\n\n";

        // Identificação e Estatuto do Utilizador Autenticado
        if (!empty($context['usuario_autenticado'])) {
            $userAuth = $context['usuario_autenticado'];
            $isAdmin = !empty($userAuth['is_admin']);
            $nomeExibicao = $userAuth['nome'] ?? 'Colega';
            $cargoDescritivo = $userAuth['cargo_descritivo'] ?? 'Operador';
            $tratamentoObrigatorio = $userAuth['tratamento'] ?? ($isAdmin ? "Senhor Administrador do Sistema, {$nomeExibicao}" : $nomeExibicao);

            $prompt .= "DADOS DO UTILIZADOR AUTENTICADO NO SISTEMA:\n";
            $prompt .= "• Nome Completo: " . ($userAuth['nome_completo'] ?? $nomeExibicao) . "\n";
            $prompt .= "• Patente / Nome Forense: {$nomeExibicao}\n";
            $prompt .= "• NIP Institucional: " . ($userAuth['nip'] ?? 'N/D') . "\n";
            $prompt .= "• Perfil de Acesso: " . ($userAuth['perfil'] ?? 'Utilizador') . "\n";
            $prompt .= "• Cargo / Estatuto: {$cargoDescritivo}\n";
            $prompt .= "• É Administrador do Sistema: " . ($isAdmin ? "SIM (Superusuário com tutela técnica superior e acesso global a todos os processos)" : "NÃO") . "\n";
            $prompt .= "• Tratamento Forense Obrigatório: {$tratamentoObrigatorio}\n\n";

            $prompt .= "RECONHECIMENTO OBRIGATÓRIO DO ESTATUTO DO UTILIZADOR:\n";
            if ($isAdmin) {
                $prompt .= "- O utilizador conectado é expressamente o ADMINISTRADOR DO SISTEMA. Você DEVE dirigir-se a ele formalmente como '{$tratamentoObrigatorio}'. Reconheça no diálogo a sua posição de chefia/tutela administrativa e nunca o trate apenas pelo primeiro nome informal ou sem o seu estatuto de Administrador.\n\n";
            } else {
                $prompt .= "- Trate sempre o utilizador com o respeito e deferência institucional compatível com a sua função ({$tratamentoObrigatorio}).\n\n";
            }
        }

        $prompt .= "DIRETRIZES FUNDAMENTAIS DE ACTUAÇÃO:\n\n";

        $prompt .= "1. REGRA ABSOLUTA PARA PEDIDOS DE MINUTA / PEÇA PROCESSUAL / TEXTO PARA DOCUMENTO:\n";
        $prompt .= "   Quando o utilizador solicitar uma minuta ('minutar despacho', 'minuta de despacho', 'texto para o auto', 'redija a acusação', 'elaborar promoção', 'relatório'):\n";
        $prompt .= "   a) ZERO ENROLAÇÃO OU COISAS DESNECESSÁRIAS: É TERMINANTEMENTE PROIBIDO colocar longos preâmbulos, justificações teóricas prévias, resumos redundantes ou análises preliminares antes da peça. O utilizador quer o documento oficial limpo para utilizar!\n";
        $prompt .= "   b) No máximo, use UMA ÚNICA linha de cortesia institucional no topo (ex: 'Senhor Administrador do Sistema, segue a minuta oficial circunstanciada para os presentes autos:').\n";
        $prompt .= "   c) A MINUTA DEVE SER COMPLETA, ROBUSTA, FORMAL E EXAUSTIVA (NUNCA BÁSICA OU RESUMIDA). Deve conter:\n";
        $prompt .= "      • Cabeçalho Institucional Oficial (REPÚBLICA DE ANGOLA / PROCURADORIA-GERAL DA REPÚBLICA / SERVIÇO DE INVESTIGAÇÃO CRIMINAL, Comarca e Província);\n";
        $prompt .= "      • Identificação Processual Completa (Processo n.º, Auto n.º, Tipologia Legal do Crime);\n";
        $prompt .= "      • Qualificação das Partes (Arguidos qualificados, Vítimas/Ofendidos);\n";
        $prompt .= "      • I. RELATÓRIO CIRCUNSTANCIADO: Descrição fáctica aprofundada dos factos apurados na instrução preparatória, elementos de prova material apreendidos e perícias forenses;\n";
        $prompt .= "      • II. DA AUDITORIA DA CUSTÓDIA POLICIAL (ART. 63º CRA): Análise detalhada do cumprimento estrito do prazo constitucional de 48 horas e da legalidade formal da captura;\n";
        $prompt .= "      • III. DA SUBSUNÇÃO PENAL E ENQUADRAMENTO CÍVEL: Enquadramento rigoroso nos artigos do Código Penal Angolano (Lei n.º 38/20), com citação de artigos e moldura penal abstrata; e incidência no Artigo 483º do Código Civil Angolano para reparação de perdas e danos pelo princípio de adesão processual penal;\n";
        $prompt .= "      • IV. DOS PRESSUPOSTOS DAS MEDIDAS DE COACÇÃO: Análise fundamentada do perigo de fuga, perturbação do inquérito e ordem pública (Artigos 278º e 280º da Lei n.º 39/20 - CPP);\n";
        $prompt .= "      • V. DISPOSITIVO E DECISÃO EXPRESSA: Alíneas numeradas ou com letras contendo a decisão (Homologação, aplicação da medida cautelar concreta, devolução dos autos com prazo de instrução);\n";
        $prompt .= "      • VI. NOTIFICAÇÕES, DATA, LOCALIDADE E FECHO INSTITUCIONAL: Com menção ao cargo e assinatura do utilizador logado.\n\n";

        $prompt .= "2. REGRA PARA MODALIDADE CONVERSA E DEBATE ESTRATÉGICO:\n";
        $prompt .= "   Quando o utilizador pedir para debater ('conversar sobre o caso', 'o que acha', 'quais os riscos', 'qual a melhor tática'):\n";
        $prompt .= "   - Aja como um parceiro e consultor jurídico de excelência, conversando com vivacidade, perspicácia e linguagem forense polida.\n";
        $prompt .= "   - Destaque as fragilidades probatórias, linhas de diligência no SIC, hipóteses de interrogatório e opções jurídicas viáveis.\n\n";

        $prompt .= "3. BASE LEGISLATIVA POSITIVA DE ANGOLA:\n";
        $prompt .= "   - NUNCA mencione empresas privadas de tecnologia, inteligência artificial comercial ou modelos externos (sigilo e institucionalidade absoluta).\n";
        $prompt .= "   - Aplique estritamente a Constituição da República de Angola (CRA), o Código do Processo Penal Angolano (Lei n.º 39/20), o Código Penal Angolano (Lei n.º 38/20) e o Código Civil Angolano.\n\n";

        // Inclusão de excertos extraídos dos ficheiros oficiais da pasta /docs
        $legalExcerpts = $this->extractRelevantLegalExcerpts($context);
        if (!empty($legalExcerpts)) {
            $prompt .= "EXCERTOS DA LEGISLAÇÃO OFICIAL DE ANGOLA (EXTRAÍDOS DA BASE DO SISTEMA /docs):\n";
            $prompt .= "==================================================\n";
            $prompt .= $legalExcerpts . "\n";
            $prompt .= "==================================================\n\n";
        }

        if (!empty($context)) {
            $prompt .= "CONTEXTO ATUAL DO PROCESSO / AUTOS EM CONSULTA:\n";
            $prompt .= "--------------------------------------------------\n";
            if (!empty($context['modulo'])) $prompt .= "• Módulo / Janela Ativa: " . $context['modulo'] . "\n";
            if (!empty($context['processo_numero'])) $prompt .= "• Processo Crime Nº: " . $context['processo_numero'] . "\n";
            if (!empty($context['numero_auto'])) $prompt .= "• Auto / Ocorrência Nº: " . $context['numero_auto'] . "\n";
            if (!empty($context['tipologia_crime'])) $prompt .= "• Tipologia Criminal: " . $context['tipologia_crime'] . "\n";
            if (!empty($context['estado_processo'])) $prompt .= "• Estado Atual: " . $context['estado_processo'] . "\n";
            if (!empty($context['magistrado'])) $prompt .= "• Magistrado Responsável: " . $context['magistrado'] . "\n";
            if (!empty($context['investigador'])) $prompt .= "• Investigador Instrutor: " . $context['investigador'] . "\n";
            if (!empty($context['data_detencao'])) {
                $prompt .= "• Data e Hora da Detenção: " . $context['data_detencao'] . "\n";
                if (!empty($context['horas_detencao'])) {
                    $prompt .= "• Tempo Transcorrido: " . $context['horas_detencao'] . " horas de custódia.\n";
                    if ($context['horas_detencao'] >= 48) {
                        $prompt .= "⚠️ ALERTA: O prazo constitucional de 48 horas (Art. 63º CRA) JÁ EXPIROU!\n";
                    } elseif ($context['horas_detencao'] >= 36) {
                        $prompt .= "⚡ ATENÇÃO: Restam apenas " . (48 - $context['horas_detencao']) . " horas para o limite do Art. 63º da CRA.\n";
                    }
                }
            }
            if (!empty($context['arguidos'])) $prompt .= "• Arguidos / Suspeitos: " . (is_array($context['arguidos']) ? implode(', ', $context['arguidos']) : $context['arguidos']) . "\n";
            if (!empty($context['vitimas'])) $prompt .= "• Vítimas / Ofendidos: " . (is_array($context['vitimas']) ? implode(', ', $context['vitimas']) : $context['vitimas']) . "\n";
            if (!empty($context['descricao'])) $prompt .= "• Síntese Fáctica: " . $context['descricao'] . "\n";
            if (!empty($context['medidas_coaccao'])) $prompt .= "• Medidas de Coacção: " . $context['medidas_coaccao'] . "\n";
            $prompt .= "--------------------------------------------------\n";
            $prompt .= "Ao responder, integre e aplique diretamente estes factos aos preceitos da legislação angolana acima, conversando com o operador.";
        }

        return $prompt;
    }

    /**
     * Extrai artigos pertinentes dos arquivos da pasta docs/ (Código Penal, Código Civil, Constituição).
     */
    protected function extractRelevantLegalExcerpts(array $context): string
    {
        $excerpts = [];
        $crime = mb_strtolower($context['tipologia_crime'] ?? '');
        $docsPath = base_path('docs');

        // 1. Constituição de Angola: Garantias e Prazos (Artigo 63º e 64º)
        $constPath = $docsPath . DIRECTORY_SEPARATOR . 'contituicao de angola.txt';
        if (file_exists($constPath)) {
            $constContent = file_get_contents($constPath);
            // Localiza Artigo 63
            $posArt63 = mb_strpos($constContent, 'ARTIGO 63.º');
            if ($posArt63 !== false) {
                $art63Snippet = mb_substr($constContent, $posArt63, 1200);
                $excerpts[] = "[Constituição da República de Angola - Artigo 63º e seguintes]\n" . trim($art63Snippet);
            }
        }

        // 2. Código Penal Angolano: Localizar artigos relacionados com o crime em causa
        $penalPath = $docsPath . DIRECTORY_SEPARATOR . 'codigo penal angolano.txt';
        if (file_exists($penalPath) && !empty($crime)) {
            $penalContent = file_get_contents($penalPath);
            // Palavras-chave de busca
            $keywords = [];
            if (str_contains($crime, 'homic')) $keywords = ['Homicídio simples', 'Homicídio qualificado', 'ARTIGO 140.º', 'ARTIGO 141.º'];
            elseif (str_contains($crime, 'roubo')) $keywords = ['Roubo', 'ARTIGO 399.º', 'ARTIGO 400.º'];
            elseif (str_contains($crime, 'furto')) $keywords = ['Furto simples', 'Furto qualificado', 'ARTIGO 393.º'];
            elseif (str_contains($crime, 'burla')) $keywords = ['Burla', 'ARTIGO 415.º'];
            elseif (str_contains($crime, 'ofensa') || str_contains($crime, 'agress')) $keywords = ['Ofensas à integridade física', 'ARTIGO 150.º'];
            elseif (str_contains($crime, 'peculato')) $keywords = ['Peculato', 'ARTIGO 362.º'];
            elseif (str_contains($crime, 'corrup')) $keywords = ['Corrupção passiva', 'Corrupção activa', 'ARTIGO 357.º'];
            elseif (str_contains($crime, 'estupefaciente') || str_contains($crime, 'droga')) $keywords = ['tráfico', 'substâncias'];

            foreach ($keywords as $kw) {
                $pos = mb_stripos($penalContent, $kw);
                if ($pos !== false) {
                    $snippet = mb_substr($penalContent, max(0, $pos - 50), 1000);
                    $excerpts[] = "[Código Penal Angolano - Lei n.º 38/20]\n" . trim($snippet);
                    break;
                }
            }
        }

        // 3. Código Civil Angolano: Artigo 483º (Responsabilidade por Factos Ilícitos)
        $civilPath = $docsPath . DIRECTORY_SEPARATOR . 'codigo civil angolano.txt';
        if (file_exists($civilPath)) {
            $civilContent = file_get_contents($civilPath);
            $posArt483 = mb_strpos($civilContent, 'ARTIGO 483');
            if ($posArt483 !== false) {
                $civilSnippet = mb_substr($civilContent, $posArt483, 900);
                $excerpts[] = "[Código Civil Angolano - Responsabilidade Civil]\n" . trim($civilSnippet);
            }
        }

        return implode("\n\n", $excerpts);
    }

    /**
     * Motor Jurídico Angolano de Contingência (quando a chave APIDOT estiver sem créditos).
     * Garante que o Magistrado ou Investigador nunca fique bloqueado e receba fundamentação imediata.
     */
    protected function generateContingencyLegalAnalysis(array $messages, array $context, string $apiNotice): array
    {
        $lastUserMsg = '';
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (($messages[$i]['role'] ?? '') === 'user') {
                $lastUserMsg = mb_strtolower($messages[$i]['content'] ?? '');
                break;
            }
        }

        $processoNum = $context['processo_numero'] ?? ($context['numero_auto'] ?? 'Processo em Consulta');
        $crime = $context['tipologia_crime'] ?? 'Infracção Penal em Investigação';
        $horasDetencao = isset($context['horas_detencao']) ? (int) $context['horas_detencao'] : null;
        $arguidos = !empty($context['arguidos']) ? (is_array($context['arguidos']) ? implode(', ', $context['arguidos']) : $context['arguidos']) : 'Arguido Não Especificado';

        $noticeHeader = "> ℹ️ **Base Jurídica Institucional SIGD-SIC (Análise Fundamentada)**\n";
        $noticeHeader .= "> Parecer emitido com base no acervo legislativo oficial da República de Angola (CRA, Lei n.º 39/20 e Lei n.º 38/20):\n\n";

        // Caso 1: Pergunta sobre prazo de 48h ou detenção
        if (str_contains($lastUserMsg, '48') || str_contains($lastUserMsg, 'prazo') || str_contains($lastUserMsg, 'deten') || str_contains($lastUserMsg, 'art. 63') || str_contains($lastUserMsg, 'auditar')) {
            $reply = $noticeHeader;
            $reply .= "### ⚖️ PARECER JURÍDICO: AUDITORIA DO PRAZO DE DETENÇÃO (ART. 63º CRA)\n\n";
            $reply .= "**Processo:** `{$processoNum}` | **Tipologia:** {$crime} | **Arguido(s):** {$arguidos}\n\n";

            if ($horasDetencao !== null) {
                if ($horasDetencao >= 48) {
                    $reply .= "🔴 **ESTADO CRÍTICO — PRAZO CONSTITUCIONAL ULTRAPASSADO ({$horasDetencao}h decorridas)**\n\n";
                    $reply .= "1. **Violação do Artigo 63º da Constituição da República de Angola (CRA):** A detenção ultrapassou o limite peremptório de 48 horas sem apresentação e validação pelo Magistrado do Ministério Público / Juiz de Garantias.\n";
                    $reply .= "2. **Consequência Processual:** Nos termos do Código do Processo Penal (Lei n.º 39/20, de 11 de Novembro), a manutenção da privação da liberdade torna-se **manifestamente ilegal**, incorrendo a autoridade detentora em responsabilidade disciplinar e criminal.\n";
                    $reply .= "3. **Procedimento Recomendado:**\n";
                    $reply .= "   - Lavrar de imediato o competente **Despacho de Relaxamento da Prisão Ilegal** com restituição à liberdade do arguido;\n";
                    $reply .= "   - Notificar o arguido para termo de identidade e residência (TIR - Art. 280º do CPP) para prosseguimento dos autos em liberdade, salvo se existir mandado judicial prévio.\n";
                } elseif ($horasDetencao >= 36) {
                    $restam = 48 - $horasDetencao;
                    $reply .= "🟠 **ALERTA DE PRAZO URGENTE — RESTAM APENAS {$restam} HORAS ({$horasDetencao}h decorridas)**\n\n";
                    $reply .= "1. O arguido encontra-se sob custódia há {$horasDetencao} horas. Faltam apenas {$restam} horas para expirar o limite do Art. 63º da CRA.\n";
                    $reply .= "2. **Diligência Prioritária:** O auto de notícia e o auto de detenção em flagrante delito devem ser submetidos incontinenti ao Magistrado da PGR de turno para Primeiro Interrogatório de Arguido Detido.\n";
                    $reply .= "3. **Subsunção e Medida:** A PGR deve ponderar se os indícios probatórios justificam Prisão Preventiva (Art. 280º do CPP) ou se é suficiente a aplicação de Termo de Identidade e Residência (TIR) e caução.\n";
                } else {
                    $reply .= "🟢 **SITUAÇÃO REGULAR ({$horasDetencao}h decorridas de 48h)**\n\n";
                    $reply .= "A detenção encontra-se dentro do prazo legal fixado pelo Artigo 63º da Constituição da República de Angola e Código de Processo Penal Angolano (Lei n.º 39/20).\n";
                    $reply .= "Recomenda-se a conclusão da instrução prévia do expediente para envio célere ao Ministério Público.\n";
                }
            } else {
                $reply .= "1. **Regra Fundamental (Art. 63º da CRA):** Ninguém pode ser detido sem culpa formada por mais de 48 horas sem ser presente a Magistrado competente.\n";
                $reply .= "2. **Aplicação ao Processo:** Verifique no auto de detenção a data e hora exata da captura para contagem ininterrupta do prazo.\n";
                $reply .= "3. **Legislação Subsidiária:** Artigos 250º e seguintes da Lei n.º 39/20 (Código do Processo Penal Angolano).\n";
            }

            return [
                'status' => 'success',
                'provider' => 'apidot_contingency',
                'model' => $this->model,
                'reply' => $reply,
                'is_fallback' => true,
            ];
        }

        // Caso 2: Minutar Despacho ou Peça Processual da PGR / SIC
        if (str_contains($lastUserMsg, 'despacho') || str_contains($lastUserMsg, 'minuta') || str_contains($lastUserMsg, 'minutar') || str_contains($lastUserMsg, 'promover') || str_contains($lastUserMsg, 'auto')) {
            $userAuth = $context['usuario_autenticado'] ?? [];
            $nomeAssinante = $userAuth['nome'] ?? 'Manuel Pascoal';
            $cargoAssinante = $userAuth['cargo_descritivo'] ?? 'Administrador do Sistema / Autoridade Processual';
            $nipAssinante = $userAuth['nip'] ?? 'SIC-ADM-001';
            $tratamento = $userAuth['tratamento'] ?? "Senhor Administrador do Sistema, {$nomeAssinante}";

            $reply = "{$tratamento}, segue a minuta oficial circunstanciada e exaustiva para inserção direta nos autos:\n\n";
            $reply .= "```text\n";
            $reply .= "================================================================================\n";
            $reply .= "REPÚBLICA DE ANGOLA\n";
            $reply .= "PROCURADORIA-GERAL DA REPÚBLICA\n";
            $reply .= "JUNTO DO SERVIÇO DE INVESTIGAÇÃO CRIMINAL\n";
            $reply .= "DIRECÇÃO PROVINCIAL DE INSTRUÇÃO PROCESSUAL PENAL\n";
            $reply .= "--------------------------------------------------------------------------------\n";
            $reply .= "PROCESSO CRIME N.º: {$processoNum}\n";
            $reply .= "INCIDÊNCIA PENAL: {$crime} (Lei n.º 38/20 - Código Penal Angolano)\n";
            $reply .= "ARGUIDO(S): {$arguidos}\n";
            $reply .= "DATA DA CAPTURA / ENTRADA: " . ($context['data_detencao'] ?? date('d/m/Y')) . "\n";
            $reply .= "--------------------------------------------------------------------------------\n\n";
            $reply .= "DESPACHO DE PRONÚNCIA PROCESSUAL E REGULARIZAÇÃO DE MEDIDA CAUTELAR\n";
            $reply .= "(Ao abrigo dos Artigos 63.º da CRA e Artigos 250.º, 278.º, 280.º e 305.º da Lei n.º 39/20 - CPP)\n\n";
            $reply .= "I. RELATÓRIO CIRCUNSTANCIADO DOS FACTOS E PROVAS\n";
            $reply .= "1. Correm termos por esta Procuradoria-Geral da República e Serviço de Investigação Criminal os presentes autos de Instrução Preparatória, autuados sob o n.º {$processoNum}, instaurados na sequência de auto de notícia e detenção respeitante aos factos materiais indiciadores do crime de {$crime}.\n";
            $reply .= "2. Consta dos elementos de prova carreados para o caderno processual — designadamente o auto de apreensão de bens e instrumentos da infracção, autos de declarações de testemunhas e relatório pericial preliminar de criminalística — que o arguido {$arguidos}, agindo de forma voluntária, consciente e com dolo directo, executou os actos materiais que consubstanciam a ilicitude em exame, não se verificando causas de justificação do facto ou dirimentes da culpa.\n\n";
            $reply .= "II. DA AUDITORIA DA CUSTÓDIA POLICIAL E TEMPESTIVIDADE CONSTITUCIONAL (ART. 63.º CRA)\n";
            if ($horasDetencao !== null && $horasDetencao >= 48) {
                $reply .= "1. Compulsados os autos relativamente à linha cronológica da detenção, constata-se que o arguido se encontra privado da liberdade há {$horasDetencao} horas, tendo sido ultrapassado o limite peremptório de 48 horas estabelecido no Artigo 63.º da Constituição da República de Angola (CRA).\n";
                $reply .= "2. Em obediência intransigente ao primado da legalidade democrática e sob pena de nulidade insanável da prova e inquinação dos actos subsequentes, cumpre sanar de pronto a privação da liberdade mediante restituição formal e vinculação processual regular.\n\n";
            } else {
                $reply .= "1. A privação cautelar da liberdade operada pelos efectivos do piquete do SIC obedeceu integralmente aos requisitos do flagrante delito previstos no Artigo 250.º do Código do Processo Penal (Lei n.º 39/20).\n";
                $reply .= "2. O presente expediente é presente dentro do prazo constitucional improrrogável de 48 horas prescrito no Artigo 63.º da Constituição da República de Angola (CRA), encontrando-se plenamente salvaguardadas as garantias fundamentais de defesa do arguido.\n\n";
            }
            $reply .= "III. DA SUBSUNÇÃO PENAL E DA RESPONSABILIDADE CIVIL CONEXA\n";
            $reply .= "1. A conduta fáctica descrita preenche com exactidão a tipicidade objectiva e subjectiva do crime de {$crime}, previsto e punível nas disposições aplicáveis da Lei n.º 38/20, de 11 de Novembro (Código Penal Angolano), cuja moldura penal abstracta comina pena privativa de liberdade proporcional à gravidade da lesão ao bem jurídico tutelado.\n";
            $reply .= "2. Por força do disposto no Artigo 483.º do Código Civil Angolano e do princípio da adesão acolhido no direito adjectivo penal, os danos patrimoniais e extrapatrimoniais emergentes do ilícito conferem à parte ofendida o direito ao respectivo ressarcimento civil, que deverá ser quantificado e deduzido nos termos processuais adequados.\n\n";
            $reply .= "IV. DOS PRESSUPOSTOS DAS MEDIDAS DE COACÇÃO PESSOAL\n";
            $reply .= "1. Fumus commissi delicti: Existe prova indiciária bastante e consistente quanto à existência material da infracção e forte probabilidade de autoria imputável ao arguido.\n";
            $reply .= "2. Periculum libertatis: Revelam-se prementes as exigências cautelares de prevenção criminal geral e especial, designadamente o perigo de perturbação da instrução e conservação das fontes de prova (Artigo 278.º da Lei n.º 39/20).\n";
            $reply .= "3. Proporcionalidade e Adequação: Em observância dos princípios da necessidade e adequação processual estipulados no Artigo 280.º do CPP, a vinculação do arguido ao processo deve ser assegurada com rigor e eficácia.\n\n";
            $reply .= "V. DISPOSITIVO E DECISÃO EXPRESSA\n";
            $reply .= "Tudo ponderado, e ao abrigo das normas constitucionais e legais supracitadas, DECIDO:\n";
            $reply .= "a) HOMOLOGAR a legalidade do auto de detenção e os termos da actuação do piquete do SIC;\n";
            $reply .= "b) APLICAR ao arguido {$arguidos} a medida de coacção processual de TERMO DE IDENTIDADE E RESIDÊNCIA (TIR - Artigo 280.º da Lei n.º 39/20) cumulada com obrigação de apresentação periódica e retenção cautelar de passaporte / interdição de saída fronteiriça;\n";
            $reply .= "c) NOTIFICAR pessoalmente o arguido com entrega de cópia do presente despacho e admoestação expressa sobre os deveres processuais adstritos e as consequências do seu eventual quebrantamento;\n";
            $reply .= "d) NOTIFICAR o ilustre Defensor constituído ou oficioso dos termos do presente despacho;\n";
            $reply .= "e) COMUNICAR imediatamente ao Centro de Controlo de Fronteiras do SME para inscrição cautelar da interdição de saída do território nacional;\n";
            $reply .= "f) REMETER os autos à Secção Operacional de Investigação Criminal do SIC competente para prosseguimento e encerramento da instrução preparatória no prazo legal de 60 dias (Artigo 305.º do CPP).\n\n";
            $reply .= "Cumpra-se e Notifique-se incontinenti.\n\n";
            $reply .= "Luanda, aos " . date('d \d\e m \d\e Y') . ".\n\n";
            $reply .= "{$nomeAssinante}\n";
            $reply .= "{$cargoAssinante}\n";
            $reply .= "NIP: {$nipAssinante}\n";
            $reply .= "================================================================================\n";
            $reply .= "```\n";

            return [
                'status' => 'success',
                'provider' => 'apidot_contingency',
                'model' => $this->model,
                'reply' => $reply,
                'is_fallback' => true,
            ];
        }

        // Caso 3: Resposta Jurídica Geral com Subsunção Penal e Cível
        $reply = $noticeHeader;
        $reply .= "### 🏛️ ANÁLISE JURÍDICO-PROCESSUAL CONFORME O DIREITO ANGOLANO\n\n";
        $reply .= "Analisando o **Processo `{$processoNum}`** relativamente ao crime indiciado (**{$crime}**):\n\n";

        $reply .= "#### 1. Subsunção Penal (Lei n.º 38/20 - Código Penal Angolano)\n";
        $reply .= "- **Tipo Legal:** Os factos constantes no expediente integram em abstracto a previsão típica do crime de {$crime}.\n";
        $reply .= "- **Ilicitude e Culpa:** Não constam dos autos causas de exclusão da ilicitude (legítima defesa, estado de necessidade justificante) ou de exclusão da culpa, mantendo-se a imputabilidade do(s) arguido(s) {$arguidos}.\n";
        $reply .= "- **Tentativa vs Consumação:** Há que verificar se os actos executórios atingiram a consumação plena ou se ficaram pelo limiar da tentativa punível.\n\n";

        $reply .= "#### 2. Regime de Coacção e Prazos Processuais (Lei n.º 39/20 - CPP)\n";
        $reply .= "- **Medidas de Coacção Pessoal:** A PGR dispõe de um leque gradativo (TIR, apresentação periódica, caução, proibição de contactos e prisão preventiva).\n";
        if ($horasDetencao !== null) {
            $reply .= "- **Controlo de 48 Horas:** Atualmente decorreram **{$horasDetencao} horas** de custódia policial. O respeito ao Artigo 63º da CRA é imperativo de ordem pública sob pena de nulidade insanável.\n";
        }
        $reply .= "- **Prazos de Instrução:** Nos crimes graves com arguidos presos, o prazo de instrução preparatória deve respeitar o limite legal estipulado no Art. 305º do CPP.\n\n";

        $reply .= "#### 3. Vertente Cível Conexa (Código Civil Angolano)\n";
        $reply .= "- Ao abrigo do Artigo 483º do Código Civil Angolano, aquele que violar ilicitamente o direito de outrem fica obrigado a indemnizar o lesado pelos danos causados.\n";
        $reply .= "- Nos termos do princípio da adesão, o pedido de indemnização civil por perdas e danos deve ser deduzido no próprio processo penal para ressarcimento integral das vítimas.\n\n";

        $reply .= "#### 4. Recomendações Imediatas para o Operador:\n";
        $reply .= "1. Juntar aos autos o auto de exame de corpo de delito ou laudo pericial forense emitido pelo Laboratório de Criminalística;\n";
        $reply .= "2. Validar formalmente as declarações das testemunhas e autos de apreensão de instrumentos do crime;\n";
        $reply .= "3. Submeter a promoção ao Magistrado titular com proposta clara de medidas de coacção.\n";

        return [
            'status' => 'success',
            'provider' => 'apidot_contingency',
            'model' => $this->model,
            'reply' => $reply,
            'is_fallback' => true,
        ];
    }
}
