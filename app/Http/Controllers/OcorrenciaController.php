<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Domain\Ocorrencias\Services\OcorrenciaNumberGenerator;
use App\Models\CadastroIndividuo;
use App\Models\Municipio;
use App\Models\Ocorrencia;
use App\Models\OcorrenciaAnexo;
use App\Models\OcorrenciaInterveniente;
use App\Models\Provincia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OcorrenciaController extends Controller
{
    /**
     * Registo de Autos de Notícia e Mapa Tático de Angola.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $podeVerTodas = $user->podeVerTodasProvincias();
        $userProvinciaId = $user->unidade ? $user->unidade->provincia_id : null;
        $userMunicipioId = $user->unidade ? $user->unidade->municipio_id : null;

        $query = Ocorrencia::with(['provincia', 'municipio', 'unidadeRegisto', 'utilizadorRegisto', 'intervenientes']);

        // Segregação Territorial Estrita:
        // Se o utilizador NÃO tiver permissão de âmbito nacional/todas as províncias,
        // apenas pode aceder a dados da sua própria província ou município.
        if (!$podeVerTodas) {
            if ($userMunicipioId) {
                $query->where('municipio_id', $userMunicipioId);
            } elseif ($userProvinciaId) {
                $query->where('provincia_id', $userProvinciaId);
                // Pode filtrar por município apenas dentro da sua província autorizada
                if ($request->filled('municipio_id')) {
                    $query->where('municipio_id', $request->input('municipio_id'));
                }
            }
        } else {
            // Utilizador com autorização nacional (Admin / Diretor Nacional):
            if ($request->filled('provincia_id')) {
                $query->where('provincia_id', $request->input('provincia_id'));
            }

            if ($request->filled('municipio_id')) {
                $query->where('municipio_id', $request->input('municipio_id'));
            }
        }

        if ($request->filled('classificacao_codigo')) {
            $query->where('classificacao_codigo', $request->input('classificacao_codigo'));
        }

        if ($request->filled('tipo_participacao')) {
            $query->where('tipo_participacao', $request->input('tipo_participacao'));
        }

        if ($request->filled('origem_pop') && $request->input('origem_pop') !== '') {
            $query->where('origem_pop', filter_var($request->input('origem_pop'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('data_inicio')) {
            $query->where('data_hora_facto', '>=', $request->input('data_inicio') . ' 00:00:00');
        }

        if ($request->filled('data_fim')) {
            $query->where('data_hora_facto', '<=', $request->input('data_fim') . ' 23:59:59');
        }

        // Filtro de busca textual geral
        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('numero_ocorrencia', 'LIKE', $term)
                  ->orWhere('classificacao_codigo', 'LIKE', $term)
                  ->orWhere('local_detalhado', 'LIKE', $term)
                  ->orWhereHas('intervenientes', function ($sub) use ($term) {
                      $sub->where('nome_identificativo', 'LIKE', $term);
                  });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $ocorrencias = $query->orderBy('data_hora_facto', 'desc')->paginate(12)->withQueryString();

        // Anexa a cada ocorrência a indicação se o utilizador logado tem permissão para editar
        $ocorrencias->getCollection()->transform(function ($oc) use ($user) {
            $oc->pode_editar = $user->podeEditarOcorrencia($oc);
            return $oc;
        });

        $tipologiasLista = \App\Models\TabelaParametrica::porCategoria('tipologia_legal')->ativos()->get();
        $participacoesLista = \App\Models\TabelaParametrica::porCategoria('tipo_participacao')->ativos()->get();

        // Lista de províncias disponível no seletor de filtros:
        // Se restrito, apenas a província autorizada do utilizador é listada.
        if (!$podeVerTodas && $userProvinciaId) {
            $provinciasLista = Provincia::where('id', $userProvinciaId)->with('municipios')->get();
        } else {
            $provinciasLista = Provincia::with('municipios')->orderBy('nome')->get();
        }

        // Estatísticas com escopo territorial coerente com as permissões do utilizador
        $statsBase = Ocorrencia::query();
        if (!$podeVerTodas) {
            if ($userMunicipioId) {
                $statsBase->where('municipio_id', $userMunicipioId);
            } elseif ($userProvinciaId) {
                $statsBase->where('provincia_id', $userProvinciaId);
            }
        }

        return Inertia::render('Ocorrencias/Index', [
            'ocorrencias' => $ocorrencias,
            'provincias_lista' => $provinciasLista,
            'tipologias_lista' => $tipologiasLista,
            'participacoes_lista' => $participacoesLista,
            'pode_ver_todas_provincias' => $podeVerTodas,
            'jurisdicao_usuario' => [
                'provincia_id' => $userProvinciaId,
                'provincia_nome' => $user->unidade?->provincia?->nome,
                'municipio_id' => $userMunicipioId,
                'municipio_nome' => $user->unidade?->municipio?->nome,
                'unidade_nome' => $user->unidade?->nome,
                'unidade_sigla' => $user->unidade?->sigla,
                'perfil' => $user->perfil,
            ],
            'filtros' => [
                ...$request->only([
                    'search',
                    'estado',
                    'classificacao_codigo',
                    'tipo_participacao',
                    'origem_pop',
                    'data_inicio',
                    'data_fim',
                    'municipio_id',
                ]),
                // Se for restrito, a província ativa é sempre a do utilizador
                'provincia_id' => !$podeVerTodas ? (string) $userProvinciaId : $request->input('provincia_id', ''),
            ],
            'estatisticas_resumo' => [
                'total' => (clone $statsBase)->count(),
                'em_triagem' => (clone $statsBase)->where('estado', 'EM_TRIAGEM')->count(),
                'processadas' => (clone $statsBase)->where('estado', 'INSTAURADO_PROCESSO')->count(),
                'origem_pop' => (clone $statsBase)->where('origem_pop', true)->count(),
            ],
        ]);
    }

    /**
     * Formulário guiado com passos sequenciais e modo Split-View OCR para autos PNA/POP.
     */
    public function create(): Response
    {
        $user = Auth::user();
        $defaultProvinciaId = $user->unidade ? $user->unidade->provincia_id : null;

        $tipologiasPenais = \App\Models\TabelaParametrica::porCategoria('tipologia_legal')->ativos()->get()->map(function ($t) {
            return $t->nome;
        })->toArray();

        if (empty($tipologiasPenais)) {
            $tipologiasPenais = [
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

        $tiposParticipacao = \App\Models\TabelaParametrica::porCategoria('tipo_participacao')->ativos()->get();
        $papeisInterveniente = \App\Models\TabelaParametrica::porCategoria('papel_interveniente')->ativos()->get();

        $podeVerTodas = $user->podeVerTodasProvincias();

        return Inertia::render('Ocorrencias/Create', [
            'provincias' => Provincia::with('municipios')->orderBy('nome')->get(),
            'default_provincia_id' => $defaultProvinciaId,
            'tipologias_penais' => $tipologiasPenais,
            'tipos_participacao' => $tiposParticipacao,
            'papeis_interveniente' => $papeisInterveniente,
            'pode_ver_todas_provincias' => $podeVerTodas,
            'jurisdicao_usuario' => [
                'provincia_id' => $user->unidade?->provincia_id,
                'provincia_nome' => $user->unidade?->provincia?->nome,
                'municipio_id' => $user->unidade?->municipio_id,
                'municipio_nome' => $user->unidade?->municipio?->nome,
                'unidade_nome' => $user->unidade?->nome,
                'unidade_sigla' => $user->unidade?->sigla,
                'perfil' => $user->perfil,
            ],
        ]);
    }

    /**
     * Registo formal do auto de notícia preliminar.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_participacao' => ['required', 'string'],
            'origem_pop' => ['boolean'],
            'descricao_facto_html' => ['required', 'string'],
            'data_hora_facto' => ['required', 'date'],
            'provincia_id' => ['required', 'exists:geografia_provincias,id'],
            'municipio_id' => ['required', 'exists:geografia_municipios,id'],
            'local_detalhado' => ['required', 'string', 'max:255'],
            'classificacao_codigo' => ['required', 'string', 'max:150'],
            'intervenientes' => ['required', 'array', 'min:1'],
            'intervenientes.*.papel' => ['required', 'string'],
            'intervenientes.*.nome_identificativo' => ['required', 'string', 'max:200'],
            'intervenientes.*.contacto_telefone' => ['nullable', 'string', 'max:40'],
            'intervenientes.*.declaracoes_resumo' => ['nullable', 'string'],
        ]);

        $user = Auth::user();
        $numeroOcorrencia = OcorrenciaNumberGenerator::generate($validated['provincia_id']);

        DB::beginTransaction();
        try {
            $ocorrencia = Ocorrencia::create([
                'id' => (string) Str::uuid7(),
                'numero_ocorrencia' => $numeroOcorrencia,
                'tipo_participacao' => $validated['tipo_participacao'],
                'origem_pop' => $validated['origem_pop'] ?? false,
                'documento_pop_escaneado_path' => $request->input('documento_pop_escaneado_path'),
                'descricao_facto_html' => $validated['descricao_facto_html'],
                'data_hora_facto' => $validated['data_hora_facto'],
                'provincia_id' => $validated['provincia_id'],
                'municipio_id' => $validated['municipio_id'],
                'local_detalhado' => $validated['local_detalhado'],
                'coordenadas' => DB::raw("Point(13.2343, -8.8390)"),
                'classificacao_codigo' => $validated['classificacao_codigo'],
                'unidade_registo_id' => $user->unidade_id,
                'utilizador_registo_id' => $user->id,
                'estado' => 'REGISTADA',
            ]);

            foreach ($validated['intervenientes'] as $int) {
                // Tenta vincular ao cadastro unificado por nome
                $individuo = CadastroIndividuo::where('nome_completo', $int['nome_identificativo'])->first();

                OcorrenciaInterveniente::create([
                    'id' => (string) Str::uuid7(),
                    'ocorrencia_id' => $ocorrencia->id,
                    'individuo_id' => $individuo?->id,
                    'papel' => $int['papel'],
                    'nome_identificativo' => $int['nome_identificativo'],
                    'contacto_telefone' => $int['contacto_telefone'] ?? null,
                    'declaracoes_resumo' => $int['declaracoes_resumo'] ?? null,
                ]);
            }

            // Anexo simulado/gerado com hash SHA-256
            if ($request->filled('anexo_nome')) {
                $hash = hash('sha256', $numeroOcorrencia . microtime());
                OcorrenciaAnexo::create([
                    'id' => (string) Str::uuid7(),
                    'ocorrencia_id' => $ocorrencia->id,
                    'tipo_ficheiro' => 'application/pdf',
                    'storage_path' => '/storage/autos/' . $numeroOcorrencia . '.pdf',
                    'nome_original' => $request->input('anexo_nome'),
                    'tamanho_bytes' => 204800,
                    'hash_sha256' => $hash,
                    'enviado_por_id' => $user->id,
                ]);
            }

            // Auditoria Criptográfica Encadeada
            CryptographicAuditService::log('ocorrencias', $ocorrencia->id, 'REGISTO_AUTO_OCORRENCIA', [
                'numero' => $numeroOcorrencia,
                'classificacao' => $ocorrencia->classificacao_codigo,
                'intervenientes_total' => count($validated['intervenientes']),
            ]);

            DB::commit();

            return redirect()->route('ocorrencias.show', $ocorrencia->id)
                ->with('success', "Auto de Notícia {$numeroOcorrencia} registado com sucesso com integridade criptográfica assegurada.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['erro' => 'Falha na gravação do auto: ' . $e->getMessage()]);
        }
    }

    /**
     * Ficha detalhada do Auto de Notícia preliminar com controlo de segurança.
     */
    public function show(string $uuid): Response
    {
        $user = Auth::user();
        $ocorrencia = Ocorrencia::with([
            'provincia',
            'municipio',
            'unidadeRegisto',
            'utilizadorRegisto',
            'intervenientes.individuo',
            'anexos',
            'processo',
        ])->findOrFail($uuid);

        // Se o utilizador não tem permissão para ver todas as províncias,
        // valida se a ocorrência pertence à sua província/jurisdição
        if (!$user->podeVerTodasProvincias()) {
            $userProvinciaId = $user->unidade?->provincia_id;
            if ($userProvinciaId && $ocorrencia->provincia_id !== $userProvinciaId) {
                abort(403, 'Acesso Negado: Este auto de notícia pertence a uma jurisdição provincial fora do seu âmbito de atuação.');
            }
        }

        // Anexa permissão de edição
        $ocorrencia->pode_editar = $user->podeEditarOcorrencia($ocorrencia);

        return Inertia::render('Ocorrencias/Show', [
            'ocorrencia' => $ocorrencia,
        ]);
    }

    /**
     * Emissão e descarregamento formal do Auto de Notícia em PDF (A4 Solene).
     */
    public function gerarPdf(Request $request, string $uuid)
    {
        $user = Auth::user();
        $ocorrencia = Ocorrencia::with([
            'provincia',
            'municipio',
            'unidadeRegisto',
            'utilizadorRegisto',
            'intervenientes.individuo',
            'anexos',
        ])->findOrFail($uuid);

        if (!$user->podeVerTodasProvincias()) {
            $userProvinciaId = $user->unidade?->provincia_id;
            if ($userProvinciaId && $ocorrencia->provincia_id !== $userProvinciaId) {
                abort(403, 'Acesso Negado: Este auto de notícia pertence a uma jurisdição provincial fora do seu âmbito de atuação.');
            }
        }

        $dataEmissao = Carbon::now()->locale('pt_AO')->isoFormat('D [de] MMMM [de] YYYY');
        $horaEmissao = Carbon::now()->format('H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.auto_noticia', [
            'ocorrencia' => $ocorrencia,
            'dataEmissao' => $dataEmissao,
            'horaEmissao' => $horaEmissao,
        ])->setPaper('a4', 'portrait');

        $numeroSanitizado = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ocorrencia->numero_ocorrencia);
        $nomeFicheiro = 'Auto_Noticia_' . $numeroSanitizado . '.pdf';

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $nomeFicheiro . '"',
        ]);
    }

    /**
     * Força o descarregamento imediato do ficheiro PDF para o computador do utilizador.
     */
    public function downloadPdf(string $uuid)
    {
        $user = Auth::user();
        $ocorrencia = Ocorrencia::with([
            'provincia',
            'municipio',
            'unidadeRegisto',
            'utilizadorRegisto',
            'intervenientes.individuo',
            'anexos',
        ])->findOrFail($uuid);

        if (!$user->podeVerTodasProvincias()) {
            $userProvinciaId = $user->unidade?->provincia_id;
            if ($userProvinciaId && $ocorrencia->provincia_id !== $userProvinciaId) {
                abort(403, 'Acesso Negado: Este auto de notícia pertence a uma jurisdição provincial fora do seu âmbito de atuação.');
            }
        }

        $dataEmissao = Carbon::now()->locale('pt_AO')->isoFormat('D [de] MMMM [de] YYYY');
        $horaEmissao = Carbon::now()->format('H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.auto_noticia', [
            'ocorrencia' => $ocorrencia,
            'dataEmissao' => $dataEmissao,
            'horaEmissao' => $horaEmissao,
        ])->setPaper('a4', 'portrait');

        $numeroSanitizado = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ocorrencia->numero_ocorrencia);
        $nomeFicheiro = 'Auto_Noticia_' . $numeroSanitizado . '.pdf';

        return $pdf->download($nomeFicheiro);
    }

    /**
     * Ecrã de edição completa do auto de notícia (reutiliza a experiência em passos, com dados carregados e botão Atualizar).
     */
    public function edit(string $uuid): Response
    {
        $user = Auth::user();
        $ocorrencia = Ocorrencia::with([
            'provincia',
            'municipio',
            'unidadeRegisto',
            'utilizadorRegisto',
            'intervenientes',
        ])->findOrFail($uuid);

        if (!$user->podeEditarOcorrencia($ocorrencia)) {
            abort(403, 'Acesso Negado: Apenas o oficial/investigador registador deste auto ou o Administrador do Sistema tem autorização para efetuar alterações.');
        }

        $defaultProvinciaId = $ocorrencia->provincia_id ?: ($user->unidade ? $user->unidade->provincia_id : null);

        $tipologiasPenais = \App\Models\TabelaParametrica::porCategoria('tipologia_legal')->ativos()->get()->map(function ($t) {
            return $t->nome;
        })->toArray();

        if (empty($tipologiasPenais)) {
            $tipologiasPenais = [
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

        $tiposParticipacao = \App\Models\TabelaParametrica::porCategoria('tipo_participacao')->ativos()->get();
        $papeisInterveniente = \App\Models\TabelaParametrica::porCategoria('papel_interveniente')->ativos()->get();
        $podeVerTodas = $user->podeVerTodasProvincias();

        return Inertia::render('Ocorrencias/Create', [
            'ocorrencia' => $ocorrencia,
            'is_edit' => true,
            'provincias' => Provincia::with('municipios')->orderBy('nome')->get(),
            'default_provincia_id' => $defaultProvinciaId,
            'tipologias_penais' => $tipologiasPenais,
            'tipos_participacao' => $tiposParticipacao,
            'papeis_interveniente' => $papeisInterveniente,
            'pode_ver_todas_provincias' => $podeVerTodas,
            'jurisdicao_usuario' => [
                'provincia_id' => $user->unidade?->provincia_id,
                'provincia_nome' => $user->unidade?->provincia?->nome,
                'municipio_id' => $user->unidade?->municipio_id,
                'municipio_nome' => $user->unidade?->municipio?->nome,
                'unidade_nome' => $user->unidade?->nome,
                'unidade_sigla' => $user->unidade?->sigla,
                'perfil' => $user->perfil,
            ],
        ]);
    }

    /**
     * Edição do auto de notícia com autorização estrita (apenas criador ou admin)
     * e registo criptográfico na cadeia de auditoria SHA-256.
     */
    public function update(Request $request, string $uuid)
    {
        $user = Auth::user();
        $ocorrencia = Ocorrencia::findOrFail($uuid);

        // Segurança Estrita: Apenas quem registou ou Admin/Diretor tem permissão
        if (!$user->podeEditarOcorrencia($ocorrencia)) {
            abort(403, 'Acesso Negado: Apenas o oficial/investigador registador deste auto ou o Administrador do Sistema tem autorização para efetuar alterações.');
        }

        $validated = $request->validate([
            'classificacao_codigo' => ['required', 'string', 'max:150'],
            'local_detalhado' => ['required', 'string', 'max:255'],
            'descricao_facto_html' => ['required', 'string'],
            'tipo_participacao' => ['nullable', 'string', 'max:100'],
            'provincia_id' => ['nullable', 'exists:geografia_provincias,id'],
            'municipio_id' => ['nullable', 'exists:geografia_municipios,id'],
            'data_hora_facto' => ['required', 'date'],
            'estado' => ['nullable', 'string', 'in:REGISTADA,EM_TRIAGEM,INSTAURADO_PROCESSO,ARQUIVADA'],
            'intervenientes' => ['nullable', 'array'],
            'intervenientes.*.papel' => ['required_with:intervenientes', 'string'],
            'intervenientes.*.nome_identificativo' => ['required_with:intervenientes', 'string', 'max:200'],
            'intervenientes.*.contacto_telefone' => ['nullable', 'string', 'max:40'],
            'intervenientes.*.declaracoes_resumo' => ['nullable', 'string'],
        ]);

        $dadosAnteriores = [
            'classificacao_codigo' => $ocorrencia->classificacao_codigo,
            'local_detalhado' => $ocorrencia->local_detalhado,
            'descricao_facto_html' => $ocorrencia->descricao_facto_html,
            'data_hora_facto' => $ocorrencia->data_hora_facto,
            'estado' => $ocorrencia->estado,
        ];

        $ocorrencia->update([
            'classificacao_codigo' => $validated['classificacao_codigo'],
            'local_detalhado' => $validated['local_detalhado'],
            'descricao_facto_html' => $validated['descricao_facto_html'],
            'tipo_participacao' => $validated['tipo_participacao'] ?? $ocorrencia->tipo_participacao,
            'provincia_id' => $validated['provincia_id'] ?? $ocorrencia->provincia_id,
            'municipio_id' => $validated['municipio_id'] ?? $ocorrencia->municipio_id,
            'data_hora_facto' => $validated['data_hora_facto'],
            'estado' => $validated['estado'] ?? $ocorrencia->estado,
        ]);

        // Atualização dos intervenientes se fornecidos
        if ($request->has('intervenientes')) {
            $ocorrencia->intervenientes()->delete();
            foreach ($request->input('intervenientes') as $int) {
                if (!empty($int['nome_identificativo'])) {
                    $individuo = \App\Models\CadastroIndividuo::where('nome_completo', $int['nome_identificativo'])->first();
                    \App\Models\OcorrenciaInterveniente::create([
                        'id' => (string) \Illuminate\Support\Str::uuid7(),
                        'ocorrencia_id' => $ocorrencia->id,
                        'individuo_id' => $individuo?->id,
                        'papel' => $int['papel'] ?? 'TESTEMUNHA',
                        'nome_identificativo' => $int['nome_identificativo'],
                        'contacto_telefone' => $int['contacto_telefone'] ?? null,
                        'declaracoes_resumo' => $int['declaracoes_resumo'] ?? null,
                    ]);
                }
            }
        }

        // Registo na Cadeia de Auditoria Criptográfica com SHA-256
        CryptographicAuditService::log('ocorrencias', $ocorrencia->id, 'EDICAO_AUTO_OCORRENCIA', [
            'numero' => $ocorrencia->numero_ocorrencia,
            'alterado_por_nip' => $user->nip,
            'alterado_por_nome' => $user->nome_completo,
            'dados_anteriores' => $dadosAnteriores,
            'novos_dados' => [
                'classificacao_codigo' => $ocorrencia->classificacao_codigo,
                'local_detalhado' => $ocorrencia->local_detalhado,
                'estado' => $ocorrencia->estado,
                'data_hora_facto' => $ocorrencia->data_hora_facto,
            ],
        ], null, $user->id);

        return redirect()->route('ocorrencias.show', $ocorrencia->id)
            ->with('success', "Auto de Notícia {$ocorrencia->numero_ocorrencia} atualizado com sucesso.");
    }
}

