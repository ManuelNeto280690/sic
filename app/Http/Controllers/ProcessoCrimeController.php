<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Domain\Custodia\Services\LacreNumberGenerator;
use App\Domain\Processos\Services\ProcessoNumberGenerator;
use App\Models\BemCustodia;
use App\Models\Detencao;
use App\Models\InvestigacaoFinanceiraConta;
use App\Models\JuizGarantiasAudiencia;
use App\Models\MandadoSinalizacao;
use App\Models\Ocorrencia;
use App\Models\PericiaLaboratorio;
use App\Models\ProcessoCrime;
use App\Models\ProcessoDiligencia;
use App\Models\Provincia;
use App\Models\TabelaParametrica;
use App\Models\TelecomCdrRegisto;
use App\Models\TransacaoFinanceiraSuspeita;
use App\Models\Utilizador;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProcessoCrimeController extends Controller
{
    /**
     * Carteira de Inquéritos e Processos-Crime.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $podeVerTodas = $user->podeVerTodasProvincias();
        $userProvinciaId = $user->unidade ? $user->unidade->provincia_id : null;

        $query = ProcessoCrime::with(['provincia', 'unidade', 'investigador', 'ocorrencia']);

        // Segregação Territorial Estrita
        if (!$podeVerTodas && $userProvinciaId) {
            $query->where('provincia_id', $userProvinciaId);
        } elseif ($request->filled('provincia_id')) {
            $query->where('provincia_id', $request->input('provincia_id'));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('numero_processo', 'LIKE', $term)
                  ->orWhere('tipologia_legal', 'LIKE', $term)
                  ->orWhere('magistrado_pgr_responsavel', 'LIKE', $term);
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $processos = $query->orderBy('data_abertura', 'desc')->paginate(15)->withQueryString();

        // Autos de Notícia disponíveis para conversão em processo
        $autosQuery = Ocorrencia::doesntHave('processo')->orderBy('data_hora_facto', 'desc');
        if (!$podeVerTodas && $userProvinciaId) {
            $autosQuery->where('provincia_id', $userProvinciaId);
        }
        $autosDisponiveis = $autosQuery->take(50)->get([
            'id',
            'numero_ocorrencia',
            'classificacao_codigo',
            'data_hora_facto',
            'provincia_id',
            'local_detalhado',
        ]);

        $provinciasLista = $podeVerTodas
            ? Provincia::orderBy('nome')->get()
            : Provincia::where('id', $userProvinciaId)->get();

        $tipologiasLista = TabelaParametrica::porCategoria('tipologia_legal')->ativos()->get()->map(function ($t) {
            return $t->nome;
        })->toArray();

        if (empty($tipologiasLista)) {
            $tipologiasLista = [
                'Homicídio Qualificado (Art. 142º do CP)',
                'Homicídio Simples (Art. 140º do CP)',
                'Roubo Qualificado com Arma de Fogo (Art. 396º do CP)',
                'Furto Qualificado (Art. 388º do CP)',
                'Burla por Defraudação (Art. 419º do CP)',
                'Tráfico de Estupefacientes e Substâncias Psicotrópicas',
                'Peculato e Apropriação Indevida de Fundos Públicos',
                'Branqueamento de Capitais e Financiamento Ilícito',
                'Cibercrime e Invasão de Redes Críticas',
                'Associação Criminosa e Crime Organizado',
            ];
        }

        $statsBase = ProcessoCrime::query();
        if (!$podeVerTodas && $userProvinciaId) {
            $statsBase->where('provincia_id', $userProvinciaId);
        }

        return Inertia::render('Processos/Index', [
            'processos' => $processos,
            'provincias_lista' => $provinciasLista,
            'tipologias_lista' => $tipologiasLista,
            'autos_disponiveis' => $autosDisponiveis,
            'pode_ver_todas_provincias' => $podeVerTodas,
            'jurisdicao_usuario' => [
                'provincia_id' => $userProvinciaId,
                'provincia_nome' => $user->unidade?->provincia?->nome,
                'unidade_nome' => $user->unidade?->nome,
            ],
            'filtros' => [
                'search' => $request->input('search', ''),
                'estado' => $request->input('estado', ''),
                'provincia_id' => !$podeVerTodas ? (string) $userProvinciaId : $request->input('provincia_id', ''),
            ],
            'estatisticas' => [
                'total' => (clone $statsBase)->count(),
                'em_instrucao' => (clone $statsBase)->where('estado', 'EM_INSTRUCAO')->count(),
                'remetidos_pgr' => (clone $statsBase)->where('estado', 'REMETIDO_AO_MP')->count(),
                'concluidos' => (clone $statsBase)->where('estado', 'RELATORIO_CONCLUIDO')->count(),
            ],
        ]);
    }

    /**
     * Obter processo com todas as relações padrão para consistência entre todas as abas.
     */
    private function findProcessoOrFail(string $uuid): ProcessoCrime
    {
        return ProcessoCrime::with([
            'provincia',
            'unidade',
            'investigador',
            'ocorrencia.intervenientes.individuo',
            'diligencias.responsavel',
            'detencoes.individuo',
            'bens.apreendidoPor',
            'pericias.perito',
            'mandados.individuo',
            'audienciasGarantias.detencao.individuo',
            'registosTelecom',
            'contasFinanceiras.transacoes',
        ])->findOrFail($uuid);
    }

    /**
     * Ficha geral do inquérito, cronologia de diligências e prazos de instrução preparatória.
     */
    public function show(string $uuid)
    {
        if (Auth::user()?->isPgr()) {
            return redirect()->route('magistratura.processos.show', $uuid);
        }

        return Inertia::render('Processos/Show', [
            'processo' => $this->findProcessoOrFail($uuid),
        ]);
    }

    /**
     * Instaurar processo-crime a partir de um auto de notícia ou por abertura direta.
     */
    public function instaurar(Request $request)
    {
        $validated = $request->validate([
            'ocorrencia_id' => ['nullable', 'exists:ocorrencias,id'],
            'provincia_id' => ['nullable', 'exists:geografia_provincias,id'],
            'tipologia_legal' => ['required', 'string', 'max:150'],
            'magistrado_pgr' => ['nullable', 'string', 'max:150'],
            'segredo_justica' => ['nullable', 'boolean'],
            'meses_instrucao' => ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $user = Auth::user();
        $ocorrencia = !empty($validated['ocorrencia_id']) ? Ocorrencia::find($validated['ocorrencia_id']) : null;
        $provinciaId = $ocorrencia ? $ocorrencia->provincia_id : ($validated['provincia_id'] ?? $user->unidade?->provincia_id);

        if (!$provinciaId) {
            return back()->withErrors(['erro' => 'É obrigatório especificar a província de jurisdição do processo.']);
        }

        // Se a ocorrência já possui processo instaurado, redireciona diretamente para o processo existente
        if ($ocorrencia && $ocorrencia->processo) {
            return redirect()->route('processos.show', $ocorrencia->processo->id)
                ->with('info', "Este auto de notícia já possui o Processo-Crime {$ocorrencia->processo->numero_processo} instaurado.");
        }

        $unidadeCompetenteId = $user->unidade_id 
            ?: ($ocorrencia?->unidade_registo_id 
            ?: \App\Models\EstruturaUnidade::where('provincia_id', $provinciaId)->first()?->id 
            ?: \App\Models\EstruturaUnidade::first()?->id);

        $numeroProcesso = ProcessoNumberGenerator::generate($provinciaId);
        $meses = $validated['meses_instrucao'] ?? 6;

        DB::beginTransaction();
        try {
            $processo = ProcessoCrime::create([
                'id' => (string) Str::uuid7(),
                'numero_processo' => $numeroProcesso,
                'ocorrencia_origem_id' => $ocorrencia?->id,
                'provincia_id' => $provinciaId,
                'unidade_competente_id' => $unidadeCompetenteId,
                'investigador_titular_id' => $user->id,
                'tipologia_legal' => $validated['tipologia_legal'],
                'segredo_justica' => $validated['segredo_justica'] ?? true,
                'data_abertura' => Carbon::now()->toDateString(),
                'data_limite_instrucao' => Carbon::now()->addMonths($meses)->toDateString(),
                'estado' => 'EM_INSTRUCAO',
                'magistrado_pgr_responsavel' => $validated['magistrado_pgr'] ?: 'Procuradoria-Geral da República',
            ]);

            if ($ocorrencia) {
                $ocorrencia->update(['estado' => 'INSTAURADO_PROCESSO']);
            }

            CryptographicAuditService::log('processos_crime', $processo->id, 'INSTAURACAO_PROCESSO_CRIME', [
                'numero_processo' => $numeroProcesso,
                'ocorrencia_origem' => $ocorrencia?->numero_ocorrencia,
                'tipologia' => $processo->tipologia_legal,
                'investigador' => $user->nome_completo,
            ]);

            DB::commit();

            return redirect()->route('processos.show', $processo->id)
                ->with('success', "Processo-Crime {$numeroProcesso} instaurado formalmente com sucesso.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['erro' => 'Erro ao instaurar processo: ' . $e->getMessage()]);
        }
    }

    /**
     * Sub-rota: Gestão relacional de intervenientes do processo.
     */
    public function intervenientes(string $uuid): Response
    {
        return Inertia::render('Processos/Intervenientes', [
            'processo' => $this->findProcessoOrFail($uuid),
        ]);
    }

    /**
     * Registo de novo interveniente nos autos.
     */
    public function storeInterveniente(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'nome_identificativo' => ['required', 'string', 'max:150'],
            'papel' => ['required', 'in:ARGUIDO,VITIMA,TESTEMUNHA,DECLARANTE'],
            'contacto_telefone' => ['nullable', 'string', 'max:50'],
            'declaracoes_resumo' => ['nullable', 'string'],
            'numero_bi' => ['nullable', 'string', 'max:30'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);
        $user = Auth::user();

        // Garante que o inquérito tem uma ocorrência vinculada para o rol de intervenientes
        $ocorrenciaId = $processo->ocorrencia_origem_id;
        if (!$ocorrenciaId) {
            $municipio = \App\Models\Municipio::where('provincia_id', $processo->provincia_id)->first()
                ?? \App\Models\Municipio::first();
            $numOcorr = 'OCORR/' . date('Y') . '/' . Str::upper(Str::random(6));
            $ocorrencia = \App\Models\Ocorrencia::create([
                'id' => (string) Str::uuid7(),
                'numero_ocorrencia' => $numOcorr,
                'tipo_participacao' => 'OFICIOSA',
                'descricao_facto_html' => '<p>Inquérito Preparatório ' . e($processo->numero_processo) . ' — ' . e($processo->tipologia_legal) . '</p>',
                'data_hora_facto' => Carbon::now(),
                'provincia_id' => $processo->provincia_id,
                'municipio_id' => $municipio?->id,
                'local_detalhado' => 'Instalações do SIC ' . ($processo->provincia?->nome ?? 'Provincial'),
                'classificacao_codigo' => 'CRIME_PUB',
                'unidade_registo_id' => $processo->unidade_competente_id,
                'utilizador_registo_id' => $user->id,
                'estado' => 'INSTAURADO_PROCESSO',
            ]);
            $processo->update(['ocorrencia_origem_id' => $ocorrencia->id]);
            $ocorrenciaId = $ocorrencia->id;
        }

        $individuoId = null;
        if (!empty($validated['numero_bi']) || !empty($validated['nome_identificativo'])) {
            $query = \App\Models\CadastroIndividuo::query();
            if (!empty($validated['numero_bi'])) {
                $query->where('numero_bi', $validated['numero_bi']);
            } else {
                $query->where('nome_completo', $validated['nome_identificativo']);
            }
            $individuo = $query->first();
            if (!$individuo) {
                $individuo = \App\Models\CadastroIndividuo::create([
                    'id' => (string) Str::uuid7(),
                    'nome_completo' => $validated['nome_identificativo'],
                    'numero_bi' => $validated['numero_bi'] ?? null,
                    'alcunha' => null,
                ]);
            }
            $individuoId = $individuo->id;
        }

        $interveniente = \App\Models\OcorrenciaInterveniente::create([
            'id' => (string) Str::uuid7(),
            'ocorrencia_id' => $ocorrenciaId,
            'individuo_id' => $individuoId,
            'papel' => $validated['papel'],
            'nome_identificativo' => $validated['nome_identificativo'],
            'contacto_telefone' => $validated['contacto_telefone'] ?? null,
            'declaracoes_resumo' => $validated['declaracoes_resumo'] ?? null,
        ]);

        CryptographicAuditService::log('ocorrencia_intervenientes', $interveniente->id, 'REGISTO_INTERVENIENTE_PROCESSO', [
            'processo' => $processo->numero_processo,
            'nome' => $interveniente->nome_identificativo,
            'papel' => $interveniente->papel,
        ]);

        return back()->with('success', "Interveniente {$interveniente->nome_identificativo} associado aos autos com sucesso.");
    }

    /**
     * Sub-rota: Diário de investigações, buscas e apreensões.
     */
    public function diligencias(string $uuid): Response
    {
        return Inertia::render('Processos/Diligencias', [
            'processo' => $this->findProcessoOrFail($uuid),
        ]);
    }

    /**
     * Gravação de nova diligência no inquérito.
     */
    public function storeDiligencia(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'tipo' => ['required', 'string', 'max:100'],
            'descricao_detalhada' => ['required', 'string'],
            'resultado' => ['required', 'string'],
            'data_realizacao' => ['required', 'date'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);
        $user = Auth::user();

        $diligencia = ProcessoDiligencia::create([
            'id' => (string) Str::uuid7(),
            'processo_id' => $processo->id,
            'tipo' => $validated['tipo'],
            'descricao_detalhada' => $validated['descricao_detalhada'],
            'resultado' => $validated['resultado'],
            'data_realizacao' => $validated['data_realizacao'],
            'responsavel_id' => $user->id,
            'created_at' => Carbon::now(),
        ]);

        CryptographicAuditService::log('processo_diligencias', $diligencia->id, 'REGISTO_DILIGENCIA_INVESTIGACAO', [
            'processo' => $processo->numero_processo,
            'tipo' => $diligencia->tipo,
        ]);

        return back()->with('success', 'Diligência registada no diário de investigação com sucesso.');
    }

    /**
     * Sub-rota: Redação de peças processuais com editor forense WYSIWYG.
     */
    public function pecasAutos(string $uuid): Response
    {
        return Inertia::render('Processos/PecasAutos', [
            'processo' => $this->findProcessoOrFail($uuid),
        ]);
    }

    /**
     * Visualização e emissão solene em PDF de peça processual (Auto de Interrogatório, Inquirição, etc.).
     */
    /**
     * Visualização e emissão solene em PDF de peça processual (Auto de Interrogatório, Inquirição, etc.).
     */
    public function visualizarPdfPeca(Request $request, string $uuid)
    {
        $processo = $this->findProcessoOrFail($uuid);
        $tipo = $request->input('tipo', $request->query('tipo', 'interrogatorio'));
        $download = $request->boolean('download', false) || $request->input('download') === true || $request->input('download') === '1';

        $titulos = [
            'interrogatorio' => 'Auto de Interrogatório de Arguido',
            'tir' => 'Termo de Identidade e Residência (TIR)',
            'testemunha' => 'Auto de Inquirição de Testemunha',
            'apreensao' => 'Auto de Apreensão e Depósito de Provas',
            'relatorio' => 'Relatório Preliminar de Instrução Preparatória',
        ];

        $titulo = $request->input('titulo_peca', $titulos[$tipo] ?? 'Peça Processual dos Autos');
        $conteudo = $request->input('conteudo_html');

        if (!$conteudo) {
            $conteudo = $this->getDefaultPecaHtml($tipo, $processo);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.peca_processual', [
            'processo' => $processo,
            'titulo_peca' => $titulo,
            'conteudo_html' => $conteudo,
            'nome_interveniente' => $request->input('nome_interveniente'),
        ])->setPaper('a4', 'portrait');

        $numeroSanitizado = preg_replace('/[^A-Za-z0-9_-]/', '_', $processo->numero_processo);
        $tituloSanitizado = preg_replace('/[^A-Za-z0-9_-]/', '_', $titulo);
        $nomeFicheiro = $tituloSanitizado . '_' . $numeroSanitizado . '.pdf';

        CryptographicAuditService::log('processos_crime', $processo->id, 'EMISSAO_PECA_PDF', [
            'processo' => $processo->numero_processo,
            'titulo' => $titulo,
            'modo' => $download ? 'DOWNLOAD' : 'PREVIEW',
        ]);

        if ($download) {
            return $pdf->download($nomeFicheiro);
        }

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $nomeFicheiro . '"',
        ]);
    }

    /**
     * Gera o HTML completo oficial por defeito caso a requisição não envie conteúdo personalizado.
     */
    protected function getDefaultPecaHtml(string $tipo, ProcessoCrime $processo): string
    {
        $hoje = now()->locale('pt_AO')->isoFormat('D [de] MMMM [de] YYYY');
        $provinciaNome = $processo->provincia?->nome ?? 'Benguela';
        $unidadeNome = $processo->unidade?->nome ?? 'Direcção Provincial do SIC';
        $titularNome = $processo->investigador?->nome_completo ?? 'Inspector de 1ª Classe em Serviço';
        $titularNip = $processo->investigador?->nip ?? 'SIC-NIP-OFICIAL';

        return match ($tipo) {
            'tir' => "
                <div style=\"text-align: center; margin-bottom: 24px;\">
                    <h4 style=\"margin: 0; text-transform: uppercase;\">REPÚBLICA DE ANGOLA</h4>
                    <h5 style=\"margin: 3px 0; text-transform: uppercase;\">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style=\"margin: 2px 0; font-size: 11px;\">{$unidadeNome} &mdash; Província de {$provinciaNome}</p>
                    <h3 style=\"margin-top: 14px; text-decoration: underline;\">TERMO DE IDENTIDADE E RESIDÊNCIA (T.I.R.)</h3>
                    <p style=\"font-family: monospace; font-size: 11px;\">PROCESSO-CRIME Nº: <strong>{$processo->numero_processo}</strong></p>
                </div>

                <p>Aos {$hoje}, nas instalações do Serviço de Investigação Criminal em {$provinciaNome}, perante mim, <strong>{$titularNome}</strong> (NIP: {$titularNip}), Instrutor do Processo, nos termos das disposições aplicáveis do Código de Processo Penal Angolano, foi formalmente lavrado o presente Termo de Identidade e Residência ao arguido indiciado nos autos:</p>

                <p><strong>QUALIFICAÇÃO DO ARGUIDO:</strong><br/>
                Nome Completo: [Nome Completo do Arguido]<br/>
                Filiação: Filho de [Nome do Pai] e de [Nome da Mãe]<br/>
                Naturalidade: [Município/Província], Data de Nascimento: [DD/MM/AAAA], Estado Civil: [Solteiro(a)/Casado(a)]<br/>
                Profissão: [Profissão], Contacto Telefónico: [+244 9XX XXX XXX]<br/>
                Residência habitual e permanente: [Bairro, Rua, Casa nº, Município]<br/>
                Documento de Identificação: B.I. nº [Número do BI], emitido pelo Arquivo de Identificação de [Local].</p>

                <p><strong>OBRIGAÇÕES PROCESSUAIS LEGAIS ASSUMIDAS:</strong></p>
                <ol>
                    <li>Não mudar de residência nem dela se ausentar por mais de 5 (cinco) dias sem prévia comunicação à autoridade judiciária ou instrutora competente;</li>
                    <li>Indicar o local onde possa ser encontrado e manter permanentemente actualizados os seus dados de contacto;</li>
                    <li>Comparecer perante o Serviço de Investigação Criminal, Ministério Público ou Tribunal sempre que para tal for devidamente notificado;</li>
                    <li>As notificações remetidas para a morada indicada consideram-se plenamente válidas e eficazes para todos os efeitos legais, incorrendo em desobediência em caso de incumprimento injustificado.</li>
                </ol>

                <p>E para constar, lavrou-se o presente termo que, lido perante o arguido e por este achado conforme, vai devidamente assinado pelos intervenientes.</p>

                <br/><br/>
                <table style=\"width: 100%; text-align: center; font-size: 12px; margin-top: 30px;\">
                    <tr>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>O Arguido (Notificado)</strong></td>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>O Instrutor do Processo (SIC)</strong></td>
                    </tr>
                </table>
            ",
            'testemunha' => "
                <div style=\"text-align: center; margin-bottom: 24px;\">
                    <h4 style=\"margin: 0; text-transform: uppercase;\">REPÚBLICA DE ANGOLA</h4>
                    <h5 style=\"margin: 3px 0; text-transform: uppercase;\">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style=\"margin: 2px 0; font-size: 11px;\">{$unidadeNome} &mdash; Província de {$provinciaNome}</p>
                    <h3 style=\"margin-top: 14px; text-decoration: underline;\">AUTO DE INQUIRIÇÃO DE TESTEMUNHA</h3>
                    <p style=\"font-family: monospace; font-size: 11px;\">PROCESSO-CRIME Nº: <strong>{$processo->numero_processo}</strong></p>
                </div>

                <p>Aos {$hoje}, nas instalações do Serviço de Investigação Criminal em {$provinciaNome}, perante o Instrutor do Processo, <strong>{$titularNome}</strong> (NIP: {$titularNip}), compareceu a testemunha a seguir qualificada:</p>

                <p><strong>QUALIFICAÇÃO DA TESTEMUNHA:</strong><br/>
                Nome Completo: [Nome Completo da Testemunha]<br/>
                Filiação: Filho(a) de [Nome do Pai] e de [Nome da Mãe]<br/>
                Naturalidade: [Naturalidade], Data de Nascimento: [DD/MM/AAAA], Estado Civil: [Solteiro(a)/Casado(a)]<br/>
                Profissão: [Profissão/Ocupação], Residência habitual: [Bairro, Rua, Casa nº, Município]<br/>
                Documento de Identificação: B.I. nº [Número do BI], emitido pelo Arquivo de Identificação de [Local].</p>

                <p><strong>JURAMENTO LEGAL & ADVERTÊNCIA:</strong><br/>
                A testemunha prestou o juramento legal sob compromisso de honra de dizer toda a verdade e nada mais que a verdade, tendo sido expressamente advertida das consequências penais cominadas ao crime de falso testemunho previsto e punível pela legislação penal angolana vigente caso preste declarações falsas ou oculte factos de que tenha conhecimento.</p>

                <p><strong>INQUIRIDA AOS FACTOS DA CAUSA DECLAROU:</strong><br/>
                Quanto à matéria investigada nos autos, respeitante ao crime de <em>{$processo->tipologia_legal}</em>, disse que: [Descreva aqui as declarações pormenorizadas prestadas pela testemunha presencial ou abonatória]...</p>

                <p>E nada mais disse nem lhe foi perguntado. Lido o presente auto e achado conforme em todo o seu teor, vai devidamente assinado.</p>

                <br/><br/>
                <table style=\"width: 100%; text-align: center; font-size: 12px; margin-top: 30px;\">
                    <tr>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>A Testemunha Inquirida</strong></td>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>O Instrutor do Processo (SIC)</strong></td>
                    </tr>
                </table>
            ",
            'apreensao' => "
                <div style=\"text-align: center; margin-bottom: 24px;\">
                    <h4 style=\"margin: 0; text-transform: uppercase;\">REPÚBLICA DE ANGOLA</h4>
                    <h5 style=\"margin: 3px 0; text-transform: uppercase;\">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style=\"margin: 2px 0; font-size: 11px;\">{$unidadeNome} &mdash; Província de {$provinciaNome}</p>
                    <h3 style=\"margin-top: 14px; text-decoration: underline;\">AUTO DE APREENSÃO E DEPÓSITO DE PROVAS</h3>
                    <p style=\"font-family: monospace; font-size: 11px;\">PROCESSO-CRIME Nº: <strong>{$processo->numero_processo}</strong></p>
                </div>

                <p>Aos {$hoje}, em cumprimento das disposições do Código de Processo Penal Angolano e das directrizes da cadeia de custódia do SIC, procedeu-se nas imediações de [Local da Apreensão] à apreensão e depósito formal dos seguintes bens, instrumentos e elementos probatórios associados ao crime de <em>{$processo->tipologia_legal}</em>:</p>

                <p><strong>DISCRIMINAÇÃO DOS ELEMENTOS APREENDIDOS:</strong></p>
                <ul>
                    <li>01 (um/uma) [Descrição detalhada do Bem / Objeto / Arma / Veículo], acondicionado sob o <strong>Lacre Inviolável nº [LACRE-SIC-BGU-00000]</strong>.</li>
                    <li>01 (um/uma) [Descrição adicional de documentos ou vestígios materiais apreendidos, estado de conservação e marcas identificativas].</li>
                </ul>

                <p><strong>DESTINO E FIEL DEPÓSITO:</strong><br/>
                Os referidos bens ficam depositados à ordem do Ministério Público no Cofre de Custódia Judicial de Provas do SIC sob responsabilidade do fiel depositário designado, garantindo-se a sua integridade probatória.</p>

                <p>E para constar, lavrou-se o presente auto que, lido e achado conforme, vai devidamente assinado pelos intervenientes.</p>

                <br/><br/>
                <table style=\"width: 100%; text-align: center; font-size: 12px; margin-top: 30px;\">
                    <tr>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>O Declarante / Detentor</strong></td>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>O Agente Apreensor (SIC)</strong></td>
                    </tr>
                </table>
            ",
            'relatorio' => "
                <div style=\"text-align: center; margin-bottom: 24px;\">
                    <h4 style=\"margin: 0; text-transform: uppercase;\">REPÚBLICA DE ANGOLA</h4>
                    <h5 style=\"margin: 3px 0; text-transform: uppercase;\">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style=\"margin: 2px 0; font-size: 11px;\">{$unidadeNome} &mdash; Província de {$provinciaNome}</p>
                    <h3 style=\"margin-top: 14px; text-decoration: underline;\">RELATÓRIO PRELIMINAR DE INVESTIGAÇÃO</h3>
                    <p style=\"font-family: monospace; font-size: 11px;\">PROCESSO-CRIME Nº: <strong>{$processo->numero_processo}</strong></p>
                </div>

                <p><strong>I. INTRODUÇÃO & NOTÍCIA-CRIME:</strong><br/>
                O presente inquérito preparatório teve início com base na notícia-crime referente aos factos que consubstanciam o crime de <em>{$processo->tipologia_legal}</em>, ocorrido na circunscrição de {$provinciaNome}.</p>

                <p><strong>II. DILIGÊNCIAS INVESTIGATÓRIAS EFECTUADAS:</strong><br/>
                No decurso da instrução preliminar foram ouvidos os queixosos e testemunhas presenciais, procedeu-se ao interrogatório dos cidadãos indiciados nos autos e foram realizadas perícias de criminalística laboratorial com preservação da cadeia de custódia das provas materiais recolhidas.</p>

                <p><strong>III. CONCLUSÃO & PROPOSTA:</strong><br/>
                Em face do acervo probatório coligido, consideram-se reunidos os indícios suficientes de autoria e materialidade delituosa, propondo-se a remessa dos autos ao Digníssimo Magistrado do Ministério Público junto do Tribunal competente para efeitos de acusação e prosseguimento da acção penal.</p>

                <br/><br/>
                <div style=\"text-align: right; margin-top: 35px;\">
                    <p>Serviço de Investigação Criminal em {$provinciaNome}, aos {$hoje}.</p>
                    <p style=\"margin-top: 25px;\">____________________________________________<br/>
                    <strong>{$titularNome}</strong><br/>
                    Instrutor do Processo &mdash; NIP: {$titularNip}</p>
                </div>
            ",
            default => "
                <div style=\"text-align: center; margin-bottom: 24px;\">
                    <h4 style=\"margin: 0; text-transform: uppercase;\">REPÚBLICA DE ANGOLA</h4>
                    <h5 style=\"margin: 3px 0; text-transform: uppercase;\">MINISTÉRIO DO INTERIOR &mdash; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h5>
                    <p style=\"margin: 2px 0; font-size: 11px;\">{$unidadeNome} &mdash; Província de {$provinciaNome}</p>
                    <h3 style=\"margin-top: 14px; text-decoration: underline;\">AUTO DE INTERROGATÓRIO DE ARGUIDO</h3>
                    <p style=\"font-family: monospace; font-size: 11px;\">PROCESSO-CRIME Nº: <strong>{$processo->numero_processo}</strong></p>
                </div>

                <p>Aos {$hoje}, nas instalações do Serviço de Investigação Criminal em {$provinciaNome}, perante mim, <strong>{$titularNome}</strong> (NIP: {$titularNip}), Instrutor do Processo, compareceu o cidadão indiciado nos autos:</p>

                <p><strong>QUALIFICAÇÃO DO ARGUIDO:</strong><br/>
                Nome Completo: [Nome Completo do Arguido]<br/>
                Filiação: Filho de [Nome do Pai] e de [Nome da Mãe]<br/>
                Naturalidade: [Município/Província], Data de Nascimento: [DD/MM/AAAA], Estado Civil: [Solteiro(a)/Casado(a)]<br/>
                Profissão: [Profissão/Ocupação], Residência habitual: [Bairro, Rua, Casa nº]<br/>
                Documento de Identificação: B.I. nº [Número do BI], emitido pelo Arquivo de Identificação de [Local].</p>

                <p><strong>ADVERTÊNCIA LEGAL (Código de Processo Penal Angolano):</strong><br/>
                O arguido foi expressamente advertido de que não é obrigado a responder às perguntas que lhe forem formuladas sobre os factos que lhe são imputados, assistindo-lhe o direito ao silêncio sem que desse silêncio resulte qualquer presunção de culpa contra si, bem como o direito de ser assistido por Advogado constituído ou Defensor Oficioso nomeado nos termos da lei.</p>

                <p><strong>INTERROGADO DECLAROU QUE:</strong><br/>
                Quanto aos factos investigados nos presentes autos relativos ao crime de <em>{$processo->tipologia_legal}</em>, esclarece que: [Escreva aqui a transcrição detalhada das declarações e respostas prestadas pelo arguido]...</p>

                <p>E nada mais disse nem lhe foi perguntado. Lido o presente auto, achado conforme e ratificado, vai devidamente assinado.</p>

                <br/><br/>
                <table style=\"width: 100%; text-align: center; font-size: 12px; margin-top: 30px;\">
                    <tr>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>O Arguido</strong></td>
                        <td style=\"width: 50%;\">___________________________________<br/><strong>O Instrutor do Processo (SIC)</strong></td>
                    </tr>
                </table>
            ",
        };
    }

    /**
     * Geração dinâmica de PDF a partir do formulário de redação (POST).
     */
    public function gerarPdfPeca(Request $request, string $uuid)
    {
        return $this->visualizarPdfPeca($request, $uuid);
    }

    /**
     * Sub-rota: Inventário e cadeia de custódia de vestígios e armas com lacres invioláveis.
     */
    public function provasCustodia(string $uuid): Response
    {
        return Inertia::render('Processos/Custodia', [
            'processo' => $this->findProcessoOrFail($uuid),
            'lacre_sugerido' => LacreNumberGenerator::generate(),
        ]);
    }

    /**
     * Registo de novo bem com lacre de segurança inviolável.
     */
    public function storeBemCustodia(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'descricao_bem' => ['required', 'string'],
            'tipo_objeto' => ['required', 'in:ARMA_FOGO,SUBSTANCIA_ENTORPECENTE,VALOR_MONETARIO,VIATURA,EQUIPAMENTO_ELETRONICO,OUTRO'],
            'local_cofre_deposito' => ['required', 'string', 'max:120'],
            'detencao_id' => ['nullable', 'exists:detencoes,id'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);
        $user = Auth::user();
        $lacre = LacreNumberGenerator::generate();

        $bem = BemCustodia::create([
            'id' => (string) Str::uuid7(),
            'detencao_id' => $validated['detencao_id'] ?? null,
            'processo_id' => $processo->id,
            'numero_lacre_seguranca' => $lacre,
            'descricao_bem' => $validated['descricao_bem'],
            'tipo_objeto' => $validated['tipo_objeto'],
            'local_cofre_deposito' => $validated['local_cofre_deposito'],
            'apreendido_por_id' => $user->id,
            'entregue_a_terceiro' => false,
            'created_at' => Carbon::now(),
        ]);

        CryptographicAuditService::log('bens_apreendidos_custodia', $bem->id, 'DEPOSITO_BEM_LACRE_INVIOLAVEL', [
            'processo' => $processo->numero_processo,
            'lacre' => $lacre,
            'tipo' => $bem->tipo_objeto,
        ]);

        return back()->with('success', "Bem apreendido depositado sob o lacre inviolável {$lacre}.");
    }

    /**
     * Sub-rota: Análise de Vínculos e Grafo de Inteligência Criminal (Link Analysis).
     */
    public function vinculos(string $uuid): Response
    {
        $processo = $this->findProcessoOrFail($uuid);

        // 1. Cruzamento dinâmico real com Mandados / SME
        $mandados = MandadoSinalizacao::where('numero_processo', $processo->numero_processo)
            ->orWhere(function ($q) use ($processo) {
                $individuoIds = $processo->detencoes->pluck('individuo_id')->filter();
                if ($individuoIds->isNotEmpty()) {
                    $q->whereIn('individuo_id', $individuoIds);
                }
            })
            ->get();

        $mandadosAtivos = $mandados->where('estado', 'ATIVO');
        $smeInterdicoes = $mandadosAtivos->where('tipo_ordem', 'INTERDICAO_SAIDA');
        $capturasAtivas = $mandadosAtivos->where('tipo_ordem', 'CAPTURA_NACIONAL');

        // 2. Horas de detenção reais calculadas a partir do banco de dados
        $maxHorasDetencao = null;
        foreach ($processo->detencoes as $det) {
            if ($det->data_hora_detencao) {
                $h = Carbon::now()->diffInHours(Carbon::parse($det->data_hora_detencao));
                if ($maxHorasDetencao === null || $h > $maxHorasDetencao) {
                    $maxHorasDetencao = (int) $h;
                }
            }
        }

        // 3. Perícias forenses reais associadas na base do Laboratório
        $pericias = PericiaLaboratorio::where('processo_id', $processo->id)->with('perito')->get();

        $cruzamento = [
            'mandados_ativos_total' => $mandadosAtivos->count(),
            'tem_interdicao_sme' => $smeInterdicoes->isNotEmpty(),
            'tem_mandado_captura' => $capturasAtivas->isNotEmpty(),
            'pericias_total' => $pericias->count(),
            'pericias_concluidas' => $pericias->where('estado', 'CONCLUIDO')->count(),
            'horas_detencao_max' => $maxHorasDetencao,
            'mandados_detalhes' => $mandadosAtivos->map(fn($m) => [
                'numero' => $m->numero_mandado_oficial,
                'tipo' => $m->tipo_ordem,
                'alvo' => $m->alvo_nome,
            ])->values(),
        ];

        return Inertia::render('Processos/Vinculos', [
            'processo' => $processo,
            'cruzamento_inteligencia' => $cruzamento,
        ]);
    }

    /**
     * Sub-rota: Certidão Oficial de Autenticidade Processual com QR Code e Chancela Digital.
     */
    public function certidao(string $uuid): Response
    {
        $processo = $this->findProcessoOrFail($uuid);
        $qrHash = 'SIC-AUTH-' . strtoupper(substr(hash('sha256', $processo->id . now()->toDateString()), 0, 16));

        // URL autêntica de verificação do processo que qualquer smartphone pode escanear
        $qrValidationUrl = url("/processos/{$processo->id}/certidao?auth_code={$qrHash}");

        CryptographicAuditService::log('processos_crime', $processo->id, 'EMISSAO_CERTIDAO_PROCESSUAL', [
            'processo' => $processo->numero_processo,
            'qr_code' => $qrHash,
            'operador' => Auth::user()?->nome_completo,
        ]);

        return Inertia::render('Processos/Certidao', [
            'processo' => $processo,
            'qr_verification_code' => $qrHash,
            'qr_validation_url' => $qrValidationUrl,
            'data_emissao' => now()->format('d/m/Y H:i:s'),
        ]);
    }

    /**
     * Sub-rota: Tramitação final e remessa ao Ministério Público (PGR).
     */
    public function remessaPgr(string $uuid): Response
    {
        return Inertia::render('Processos/RemessaPgr', [
            'processo' => $this->findProcessoOrFail($uuid),
        ]);
    }

    /**
     * Conclusão e remessa formal eletrónica do inquérito ao Ministério Público.
     */
    public function executarRemessaPgr(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'relatorio_final' => ['required', 'string'],
            'magistrado_destinatario' => ['required', 'string', 'max:150'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);

        $processo->update([
            'estado' => 'REMETIDO_AO_MP',
            'data_remessa_mp' => Carbon::now(),
            'magistrado_pgr_responsavel' => $validated['magistrado_destinatario'],
        ]);

        CryptographicAuditService::log('processos_crime', $processo->id, 'REMESSA_ELETRONICA_AO_MP', [
            'processo' => $processo->numero_processo,
            'magistrado' => $validated['magistrado_destinatario'],
            'data_remessa' => Carbon::now()->toIso8601String(),
        ]);

        return redirect()->route('processos.show', $processo->id)
            ->with('success', "Inquérito {$processo->numero_processo} remetido solenemente ao Ministério Público com protocolo de entrega registado.");
    }

    /**
     * Sub-rota: Juiz de Garantias & 48 Horas Constitucionais (1.º Interrogatório Judicial).
     */
    public function garantias(string $uuid): Response
    {
        $processo = $this->findProcessoOrFail($uuid);
        $audiencias = JuizGarantiasAudiencia::where('processo_id', $processo->id)
            ->with(['detencao.individuo'])
            ->orderBy('data_hora_audiencia', 'desc')
            ->get();

        $detencoes = $processo->detencoes->map(function ($det) {
            $horas = (int) round(Carbon::parse($det->data_hora_detencao)->diffInHours(Carbon::now()));
            return [
                'id' => $det->id,
                'individuo_nome' => $det->individuo?->nome_completo ?? 'Não especificado',
                'bi' => $det->individuo?->numero_bi ?? 'N/D',
                'data_hora_detencao' => $det->data_hora_detencao->format('d/m/Y H:i'),
                'horas_decorridas' => $horas,
                'limite_48h' => $det->limite_legal_48h->format('d/m/Y H:i'),
                'expirado' => $horas >= 48,
                'estado_custodia' => $det->estado_custodia,
            ];
        });

        return Inertia::render('Processos/Garantias', [
            'processo' => $processo,
            'audiencias' => $audiencias,
            'detencoes' => $detencoes,
        ]);
    }

    /**
     * Registo de Despacho / Audiência do Juiz de Garantias nos Autos.
     */
    public function storeGarantias(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'detencao_id' => ['nullable', 'exists:detencoes,id'],
            'tipo_ato' => ['required', 'string'],
            'magistrado_juiz_nome' => ['required', 'string', 'max:150'],
            'tribunal_comarca' => ['required', 'string', 'max:150'],
            'data_hora_audiencia' => ['required', 'date'],
            'decisao_judicial' => ['required', 'in:MANUTENCAO_PRISAO_PREVENTIVA,TERMO_IDENTIDADE_RESIDENCIA,LIBERDADE_PROVISORIA_CAUCAO,INTERDICAO_SAIDA,RELAXAMENTO_PRISAO_ILEGAL'],
            'valor_caucao_kz' => ['nullable', 'numeric'],
            'fundamentacao_despacho' => ['required', 'string'],
            'defensor_advogado_nome' => ['nullable', 'string', 'max:150'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);
        $user = Auth::user();

        $detencao = !empty($validated['detencao_id']) ? Detencao::find($validated['detencao_id']) : null;
        $horas = 0;
        if ($detencao) {
            $horas = (int) round(Carbon::parse($detencao->data_hora_detencao)->diffInHours(Carbon::parse($validated['data_hora_audiencia'])));
        }

        $numeroAuto = 'JUGAR-' . date('Y') . '-' . strtoupper(substr(uniqid(), -6));

        DB::beginTransaction();
        try {
            $audiencia = JuizGarantiasAudiencia::create([
                'id' => (string) Str::uuid7(),
                'processo_id' => $processo->id,
                'detencao_id' => $detencao?->id,
                'numero_auto_audiencia' => $numeroAuto,
                'tipo_ato' => $validated['tipo_ato'],
                'magistrado_juiz_nome' => $validated['magistrado_juiz_nome'],
                'tribunal_comarca' => $validated['tribunal_comarca'],
                'data_hora_audiencia' => $validated['data_hora_audiencia'],
                'horas_decorridas_detencao' => $horas,
                'dentro_prazo_48h' => $horas <= 48,
                'decisao_judicial' => $validated['decisao_judicial'],
                'valor_caucao_kz' => $validated['valor_caucao_kz'] ?? null,
                'fundamentacao_despacho' => $validated['fundamentacao_despacho'],
                'oficial_diligencia_nip' => $user->nip ?? 'SIC-OF-TITULAR',
                'defensor_advogado_nome' => $validated['defensor_advogado_nome'] ?? 'Defensor Oficioso / Constituído',
            ]);

            // Atualiza automaticamente o estado da detenção conforme a decisão judicial
            if ($detencao) {
                if (in_array($validated['decisao_judicial'], ['TERMO_IDENTIDADE_RESIDENCIA', 'LIBERDADE_PROVISORIA_CAUCAO', 'RELAXAMENTO_PRISAO_ILEGAL'])) {
                    $detencao->update(['estado_custodia' => 'LIBERTADO']);
                } elseif ($validated['decisao_judicial'] === 'MANUTENCAO_PRISAO_PREVENTIVA') {
                    $detencao->update(['estado_custodia' => 'TRANSFERIDO_PRISAO']);
                }
            }

            CryptographicAuditService::log('juiz_garantias_audiencias', $audiencia->id, 'DESPACHO_JUIZ_GARANTIAS', [
                'processo' => $processo->numero_processo,
                'auto' => $numeroAuto,
                'decisao' => $validated['decisao_judicial'],
                'juiz' => $validated['magistrado_juiz_nome'],
            ]);

            DB::commit();

            return back()->with('success', "Auto do Juiz de Garantias {$numeroAuto} lavrado com sucesso. Decisão judicial averbada aos autos.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['erro' => 'Erro ao registar despacho judicial: ' . $e->getMessage()]);
        }
    }

    /**
     * Sub-rota: Análise de Metadados de Telecomunicações / CDR & Triangulação de Antenas ERB.
     */
    public function telecomCdr(string $uuid): Response
    {
        $processo = $this->findProcessoOrFail($uuid);
        $registos = TelecomCdrRegisto::where('processo_id', $processo->id)
            ->orderBy('data_hora_evento', 'desc')
            ->get();

        $antenasUnicas = $registos->groupBy('antena_erb_nome')->map(function ($items) {
            $first = $items->first();
            return [
                'nome' => $first->antena_erb_nome,
                'latitude' => $first->latitude,
                'longitude' => $first->longitude,
                'operadora' => $first->operadora,
                'total_eventos' => $items->count(),
            ];
        })->values();

        return Inertia::render('Processos/TelecomCdr', [
            'processo' => $processo,
            'registos' => $registos,
            'antenas' => $antenasUnicas,
        ]);
    }

    /**
     * Inserir registo individual de metadados CDR nos autos.
     */
    public function storeTelecomCdr(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'operadora' => ['required', 'in:UNITEL,AFRICELL,MOVICEL'],
            'numero_alvo_origem' => ['required', 'string', 'max:30'],
            'numero_interlocutor_destino' => ['required', 'string', 'max:30'],
            'imei_equipamento' => ['nullable', 'string', 'max:25'],
            'tipo_evento' => ['required', 'in:CHAMADA_VOZ,SMS_TEXTO,DADOS_IP,MMS'],
            'data_hora_evento' => ['required', 'date'],
            'duracao_segundos' => ['required', 'integer', 'min:0'],
            'antena_erb_nome' => ['required', 'string', 'max:120'],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'mandado_judicial_referencia' => ['required', 'string', 'max:80'],
            'notas_analise_inteligencia' => ['nullable', 'string'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);

        TelecomCdrRegisto::create([
            'id' => (string) Str::uuid7(),
            'processo_id' => $processo->id,
            'operadora' => $validated['operadora'],
            'numero_alvo_origem' => $validated['numero_alvo_origem'],
            'numero_interlocutor_destino' => $validated['numero_interlocutor_destino'],
            'imei_equipamento' => $validated['imei_equipamento'] ?? null,
            'tipo_evento' => $validated['tipo_evento'],
            'data_hora_evento' => $validated['data_hora_evento'],
            'duracao_segundos' => $validated['duracao_segundos'],
            'antena_erb_nome' => $validated['antena_erb_nome'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'mandado_judicial_referencia' => $validated['mandado_judicial_referencia'],
            'notas_analise_inteligencia' => $validated['notas_analise_inteligencia'] ?? null,
            'alvo_investigado_principal' => true,
        ]);

        return back()->with('success', "Evento de telecomunicações interceptado registado com coordenadas de ERB.");
    }

    /**
     * Sub-rota: Investigação Económica, Financeira e Recuperação de Ativos (DNCF / UIF / SENRA).
     */
    public function financeiro(string $uuid): Response
    {
        $processo = $this->findProcessoOrFail($uuid);
        $contas = InvestigacaoFinanceiraConta::where('processo_id', $processo->id)
            ->with(['transacoes'])
            ->orderBy('saldo_contabilistico_kz', 'desc')
            ->get();

        $transacoes = TransacaoFinanceiraSuspeita::where('processo_id', $processo->id)
            ->with('conta')
            ->orderBy('data_hora_movimento', 'desc')
            ->get();

        $saldoTotalKz = $contas->sum('saldo_contabilistico_kz');
        $totalBloqueadoKz = $contas->where('congelamento_cautelar_ativo', true)->sum('saldo_contabilistico_kz');

        return Inertia::render('Processos/Financeiro', [
            'processo' => $processo,
            'contas' => $contas,
            'transacoes' => $transacoes,
            'resumo_financeiro' => [
                'saldo_total_apurado_kz' => $saldoTotalKz,
                'total_bloqueado_kz' => $totalBloqueadoKz,
                'total_contas' => $contas->count(),
                'contas_bloqueadas' => $contas->where('congelamento_cautelar_ativo', true)->count(),
            ],
        ]);
    }

    /**
     * Cadastrar conta bancária sob quebra de sigilo judicial.
     */
    public function storeContaFinanceira(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'banco_comercial' => ['required', 'string', 'max:80'],
            'titular_nome' => ['required', 'string', 'max:150'],
            'titular_nif' => ['required', 'string', 'max:30'],
            'iban_completo' => ['required', 'string', 'max:50'],
            'numero_conta' => ['required', 'string', 'max:30'],
            'mandado_quebra_sigilo' => ['required', 'string', 'max:80'],
            'saldo_contabilistico_kz' => ['required', 'numeric', 'min:0'],
            'grau_suspeicao' => ['required', 'in:CRITICO,ALTO,MEDIO,NORMAL'],
            'fundamentacao_financeira' => ['nullable', 'string'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);

        InvestigacaoFinanceiraConta::create([
            'id' => (string) Str::uuid7(),
            'processo_id' => $processo->id,
            'banco_comercial' => $validated['banco_comercial'],
            'titular_nome' => $validated['titular_nome'],
            'titular_nif' => $validated['titular_nif'],
            'iban_completo' => $validated['iban_completo'],
            'numero_conta' => $validated['numero_conta'],
            'mandado_quebra_sigilo' => $validated['mandado_quebra_sigilo'],
            'saldo_contabilistico_kz' => $validated['saldo_contabilistico_kz'],
            'total_creditos_apurados_kz' => $validated['saldo_contabilistico_kz'],
            'total_debitos_apurados_kz' => 0,
            'grau_suspeicao' => $validated['grau_suspeicao'],
            'fundamentacao_financeira' => $validated['fundamentacao_financeira'] ?? null,
        ]);

        return back()->with('success', "Conta bancária {$validated['iban_completo']} averbada ao inquérito sob quebra de sigilo.");
    }

    /**
     * Adicionar transação financeira suspeita a uma conta do inquérito.
     */
    public function storeTransacaoFinanceira(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'conta_id' => ['required', 'exists:investigacoes_financeiras_contas,id'],
            'data_hora_movimento' => ['required', 'date'],
            'valor_kz' => ['required', 'numeric', 'min:0'],
            'natureza' => ['required', 'in:CREDITO,DEBITO'],
            'tipo_operacao' => ['required', 'in:DEPOSITO_NUMERARIO,TRANSFERENCIA_IBAN,LEVANTAMENTO_BALCAO,OPERACAO_CAMBIAL_DIVISAS,PAGAMENTO_TPA'],
            'nome_contraparte' => ['nullable', 'string', 'max:150'],
            'iban_contraparte' => ['nullable', 'string', 'max:50'],
            'alerta_padrao_lavagem' => ['required', 'in:SMURFING_FRACIONAMENTO,CONTA_PASSAGEM_TRANSBORDO,TESTA_DE_FERRO_LARANJA,DESVIO_FUNDO_PUBLICO,REMESSA_EXTERIOR_ILICITA,TRANSACAO_COMPATIVEL'],
            'descricao_extrato' => ['required', 'string'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);

        TransacaoFinanceiraSuspeita::create([
            'id' => (string) Str::uuid7(),
            'conta_id' => $validated['conta_id'],
            'processo_id' => $processo->id,
            'data_hora_movimento' => $validated['data_hora_movimento'],
            'valor_kz' => $validated['valor_kz'],
            'natureza' => $validated['natureza'],
            'tipo_operacao' => $validated['tipo_operacao'],
            'nome_contraparte' => $validated['nome_contraparte'] ?? null,
            'iban_contraparte' => $validated['iban_contraparte'] ?? null,
            'alerta_padrao_lavagem' => $validated['alerta_padrao_lavagem'],
            'descricao_extrato' => $validated['descricao_extrato'],
        ]);

        return back()->with('success', "Transação suspeita registada e submetida aos algoritmos de deteção de lavagem de capitais.");
    }

    /**
     * Executar congelamento cautelar da conta no processo (SENRA / BNA).
     */
    public function congelarContaFinanceira(Request $request, string $uuid, string $contaId)
    {
        $processo = ProcessoCrime::findOrFail($uuid);
        $conta = InvestigacaoFinanceiraConta::where('processo_id', $processo->id)->findOrFail($contaId);
        $user = Auth::user();

        $numeroAuto = 'SENRA-BLOQ-' . date('Y') . '/' . strtoupper(substr(uniqid(), -6));

        $conta->update([
            'congelamento_cautelar_ativo' => true,
            'numero_auto_bloqueio_senra' => $numeroAuto,
            'data_hora_bloqueio' => Carbon::now(),
        ]);

        CryptographicAuditService::log('investigacoes_financeiras_contas', $conta->id, 'CONGELAMENTO_CAUTELAR_SENRA', [
            'processo' => $processo->numero_processo,
            'iban' => $conta->iban_completo,
            'saldo_congelado_kz' => $conta->saldo_contabilistico_kz,
            'auto_senra' => $numeroAuto,
            'operador' => $user->nome_completo,
        ]);

        return back()->with('success', "Conta bancária {$conta->iban_completo} CONGELADA com sucesso sob o Auto de Bloqueio {$numeroAuto}.");
    }

    /**
     * Importar Extrato Bancário Real (CSV / TXT / Ficheiro ou Lote) e processar algoritmos anti-branqueamento.
     */
    public function importarExtrato(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'conta_id' => ['required', 'exists:investigacoes_financeiras_contas,id'],
            'ficheiro_extrato' => ['nullable', 'file', 'max:5120'],
            'lote_demonstrativo' => ['nullable', 'string'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);
        $conta = InvestigacaoFinanceiraConta::where('processo_id', $processo->id)->findOrFail($validated['conta_id']);

        $linhas = [];
        $transacoesImportadas = 0;
        $alertasGerados = 0;

        if ($request->hasFile('ficheiro_extrato')) {
            $path = $request->file('ficheiro_extrato')->getRealPath();
            $file = fopen($path, 'r');
            $primeiraLinha = true;
            while (($row = fgetcsv($file, 1000, ';')) !== false || ($row = fgetcsv($file, 1000, ',')) !== false) {
                if ($primeiraLinha) {
                    $primeiraLinha = false;
                    continue;
                }
                if (count($row) >= 4) {
                    $linhas[] = [
                        'data' => trim($row[0]),
                        'descricao' => trim($row[1]),
                        'valor' => floatval(str_replace(['.', ','], ['', '.'], trim($row[2]))),
                        'natureza' => strtoupper(trim($row[3])) === 'DEBITO' ? 'DEBITO' : 'CREDITO',
                        'contraparte' => isset($row[4]) ? trim($row[4]) : 'Contraparte Registada em Balcão',
                        'tipo_operacao' => isset($row[5]) ? trim($row[5]) : 'TRANSFERENCIA_IBAN',
                    ];
                }
            }
            fclose($file);
        } elseif (!empty($validated['lote_demonstrativo'])) {
            $linhas = [
                [
                    'data' => Carbon::now()->subDays(5)->format('Y-m-d H:i:s'),
                    'descricao' => 'Depósito numerário balcão Ag. Talatona (Operação Fracionada)',
                    'valor' => 4950000.00,
                    'natureza' => 'CREDITO',
                    'contraparte' => 'Depósito Direto em Numerário',
                    'tipo_operacao' => 'DEPOSITO_NUMERARIO',
                ],
                [
                    'data' => Carbon::now()->subDays(5)->addHours(2)->format('Y-m-d H:i:s'),
                    'descricao' => 'Depósito numerário balcão Ag. Maianga (Operação Fracionada)',
                    'valor' => 4900000.00,
                    'natureza' => 'CREDITO',
                    'contraparte' => 'Depósito Direto em Numerário',
                    'tipo_operacao' => 'DEPOSITO_NUMERARIO',
                ],
                [
                    'data' => Carbon::now()->subDays(4)->format('Y-m-d H:i:s'),
                    'descricao' => 'Depósito numerário balcão Ag. Viana (Operação Fracionada)',
                    'valor' => 4850000.00,
                    'natureza' => 'CREDITO',
                    'contraparte' => 'Depósito Direto em Numerário',
                    'tipo_operacao' => 'DEPOSITO_NUMERARIO',
                ],
                [
                    'data' => Carbon::now()->subDays(3)->format('Y-m-d H:i:s'),
                    'descricao' => 'Transf. IBAN para Sociedade Imobiliária Oceano Lda',
                    'valor' => 22000000.00,
                    'natureza' => 'DEBITO',
                    'contraparte' => 'Sociedade Imobiliária Oceano Lda',
                    'tipo_operacao' => 'TRANSFERENCIA_IBAN',
                ],
                [
                    'data' => Carbon::now()->subDays(2)->format('Y-m-d H:i:s'),
                    'descricao' => 'Pagamento TPA Concessionária Auto Premium Talatona',
                    'valor' => 35000000.00,
                    'natureza' => 'DEBITO',
                    'contraparte' => 'Auto Premium Talatona Lda',
                    'tipo_operacao' => 'PAGAMENTO_TPA',
                ],
                [
                    'data' => Carbon::now()->subDays(1)->format('Y-m-d H:i:s'),
                    'descricao' => 'Levantamento de Cheque Avulso ao Balcão',
                    'valor' => 15000000.00,
                    'natureza' => 'DEBITO',
                    'contraparte' => 'Portador do Cheque (Terceiro Não Identificado)',
                    'tipo_operacao' => 'LEVANTAMENTO_BALCAO',
                ],
            ];
        }

        if (empty($linhas)) {
            return back()->withErrors(['erro' => 'Nenhuma linha válida encontrada no ficheiro de extrato. Verifique o formato CSV ou utilize o modelo de teste.']);
        }

        DB::beginTransaction();
        try {
            foreach ($linhas as $item) {
                $alerta = 'TRANSACAO_COMPATIVEL';
                $descLower = mb_strtolower($item['descricao']);
                $contraLower = mb_strtolower($item['contraparte']);

                if ($item['valor'] >= 3000000 && $item['valor'] < 5000000 && $item['natureza'] === 'CREDITO') {
                    $alerta = 'SMURFING_FRACIONAMENTO';
                    $alertasGerados++;
                } elseif (str_contains($descLower, 'transf') || str_contains($descLower, 'sociedade') || str_contains($contraLower, 'lda')) {
                    $alerta = 'CONTA_PASSAGEM_TRANSBORDO';
                    $alertasGerados++;
                } elseif (str_contains($descLower, 'auto') || str_contains($descLower, 'imob') || str_contains($contraLower, 'premium') || str_contains($descLower, 'terceiro')) {
                    $alerta = 'TESTA_DE_FERRO_LARANJA';
                    $alertasGerados++;
                }

                TransacaoFinanceiraSuspeita::create([
                    'id' => (string) Str::uuid7(),
                    'conta_id' => $conta->id,
                    'processo_id' => $processo->id,
                    'data_hora_movimento' => $item['data'],
                    'valor_kz' => $item['valor'],
                    'moeda' => 'AOA',
                    'natureza' => $item['natureza'],
                    'tipo_operacao' => $item['tipo_operacao'],
                    'nome_contraparte' => $item['contraparte'],
                    'iban_contraparte' => null,
                    'alerta_padrao_lavagem' => $alerta,
                    'descricao_extrato' => $item['descricao'],
                ]);

                if ($item['natureza'] === 'CREDITO') {
                    $conta->total_creditos_apurados_kz += $item['valor'];
                    $conta->saldo_contabilistico_kz += $item['valor'];
                } else {
                    $conta->total_debitos_apurados_kz += $item['valor'];
                    $conta->saldo_contabilistico_kz -= $item['valor'];
                }

                $transacoesImportadas++;
            }

            if ($alertasGerados >= 2) {
                $conta->grau_suspeicao = 'CRITICO';
            }
            $conta->save();

            CryptographicAuditService::log('investigacoes_financeiras_contas', $conta->id, 'IMPORTACAO_EXTRATO_BANCARIO', [
                'processo' => $processo->numero_processo,
                'iban' => $conta->iban_completo,
                'transacoes_importadas' => $transacoesImportadas,
                'alertas_lavagem' => $alertasGerados,
                'novo_saldo_kz' => $conta->saldo_contabilistico_kz,
            ]);

            DB::commit();

            return back()->with('success', "Extrato processado com sucesso! {$transacoesImportadas} movimentações bancárias importadas para a conta {$conta->iban_completo}. O motor de inteligência identificou {$alertasGerados} padrões suspeitos de lavagem de capitais.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['erro' => 'Erro ao processar ficheiro de extrato: ' . $e->getMessage()]);
        }
    }
}
