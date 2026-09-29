<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\CadastroIndividuo;
use App\Models\Detencao;
use App\Models\ProcessoCrime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DetencaoController extends Controller
{
    /**
     * M4: Controlo nacional de celas transitórias e contagem regressiva de 48h.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $podeVerTodas = $user->podeVerTodasProvincias();
        $userProvinciaId = $user->unidade ? $user->unidade->provincia_id : null;

        $query = Detencao::with(['individuo', 'processo.provincia', 'bens']);

        // Segregação Territorial Estrita
        if (!$podeVerTodas && $userProvinciaId) {
            $query->where(function ($q) use ($userProvinciaId, $user) {
                $q->whereHas('processo', function ($sub) use ($userProvinciaId) {
                    $sub->where('provincia_id', $userProvinciaId);
                })
                ->orWhere('efetivo_captor_nip', $user->nip);
            });
        } elseif ($request->filled('provincia_id')) {
            $provId = $request->input('provincia_id');
            $query->whereHas('processo', function ($sub) use ($provId) {
                $sub->where('provincia_id', $provId);
            });
        }

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('local_detencao', 'LIKE', $term)
                  ->orWhere('efetivo_captor_nip', 'LIKE', $term)
                  ->orWhere('motivo_legal', 'LIKE', $term)
                  ->orWhereHas('individuo', function ($sub) use ($term) {
                      $sub->where('nome_completo', 'LIKE', $term)
                          ->orWhere('numero_bi', 'LIKE', $term);
                  });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado_custodia', $request->input('estado'));
        }

        $detencoes = $query->orderBy('limite_legal_48h', 'asc')->paginate(15)->withQueryString();

        $agora = Carbon::now();
        $detencoes->getCollection()->transform(function ($d) use ($agora) {
            $diffMinutes = $agora->diffInMinutes($d->limite_legal_48h, false);
            $d->horas_restantes = round($diffMinutes / 60, 1);
            $d->urgente = $diffMinutes <= (12 * 60) && $diffMinutes > 0;
            $d->expirado = $diffMinutes <= 0;
            return $d;
        });

        // Estatísticas territoriais fiéis
        $statsBase = Detencao::query();
        if (!$podeVerTodas && $userProvinciaId) {
            $statsBase->where(function ($q) use ($userProvinciaId, $user) {
                $q->whereHas('processo', function ($sub) use ($userProvinciaId) {
                    $sub->where('provincia_id', $userProvinciaId);
                })
                ->orWhere('efetivo_captor_nip', $user->nip);
            });
        } elseif ($request->filled('provincia_id')) {
            $provId = $request->input('provincia_id');
            $statsBase->whereHas('processo', function ($sub) use ($provId) {
                $sub->where('provincia_id', $provId);
            });
        }

        $estatisticas = [
            'total_em_cela' => (clone $statsBase)->where('estado_custodia', 'CELA_TRANSITORIA')->count(),
            'criticos_12h' => (clone $statsBase)->where('estado_custodia', 'CELA_TRANSITORIA')
                ->whereBetween('limite_legal_48h', [Carbon::now(), Carbon::now()->addHours(12)])
                ->count(),
            'apresentados_mp' => (clone $statsBase)->where('estado_custodia', 'APRESENTADO_MP')->count(),
            'transferidos' => (clone $statsBase)->where('estado_custodia', 'TRANSFERIDO_PRISAO')->count(),
            'libertados' => (clone $statsBase)->where('estado_custodia', 'LIBERTADO')->count(),
        ];

        // Processos disponíveis para vinculação
        $procQuery = ProcessoCrime::select('id', 'numero_processo', 'tipologia_legal', 'provincia_id')->where('estado', 'EM_INSTRUCAO');
        if (!$podeVerTodas && $userProvinciaId) {
            $procQuery->where('provincia_id', $userProvinciaId);
        }

        return Inertia::render('Detidos/Index', [
            'detencoes' => $detencoes,
            'filtros' => $request->only(['search', 'estado', 'provincia_id']),
            'provincias_lista' => $podeVerTodas ? \App\Models\Provincia::orderBy('nome')->get(['id', 'nome', 'codigo_iso']) : [],
            'jurisdicao_nome' => $user->unidade?->provincia?->nome ?? 'Nacional',
            'individuos_disponiveis' => CadastroIndividuo::select('id', 'nome_completo', 'numero_bi')->orderBy('nome_completo')->get(),
            'processos_disponiveis' => $procQuery->get(),
            'estatisticas' => $estatisticas,
        ]);
    }

    /**
     * Registo formal de detenção com relógio automático de 48h.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'individuo_id' => ['required', 'exists:cadastro_individuos,id'],
            'processo_id' => ['nullable', 'exists:processos_crime,id'],
            'data_hora_detencao' => ['required', 'date'],
            'local_detencao' => ['required', 'string', 'max:150'],
            'motivo_legal' => ['required', 'string'],
        ]);

        $user = Auth::user();
        $dtDetencao = Carbon::parse($validated['data_hora_detencao']);
        $limite48h = (clone $dtDetencao)->addHours(48);

        $detencao = Detencao::create([
            'id' => (string) Str::uuid7(),
            'individuo_id' => $validated['individuo_id'],
            'processo_id' => $validated['processo_id'] ?? null,
            'data_hora_detencao' => $dtDetencao,
            'limite_legal_48h' => $limite48h,
            'local_detencao' => $validated['local_detencao'],
            'auto_detencao_path' => '/storage/detencoes/auto_detencao_' . time() . '.pdf',
            'efetivo_captor_nip' => $user->nip,
            'estado_custodia' => 'CELA_TRANSITORIA',
            'motivo_legal' => $validated['motivo_legal'],
        ]);

        CryptographicAuditService::log('detencoes', $detencao->id, 'ENTRADA_CELA_TRANSITORIA', [
            'individuo_id' => $detencao->individuo_id,
            'limite_legal_48h' => $limite48h->toIso8601String(),
            'captor_nip' => $user->nip,
        ]);

        return back()->with('success', 'Detenção formalizada com contagem regressiva de 48h iniciada.');
    }

    /**
     * Atualização do estado de custódia (ex: Apresentado ao MP ou Transferido).
     */
    public function updateEstado(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'estado_custodia' => ['required', 'in:CELA_TRANSITORIA,APRESENTADO_MP,TRANSFERIDO_PRISAO,LIBERTADO'],
            'observacoes_tramitacao' => ['nullable', 'string', 'max:1000'],
        ]);

        $detencao = Detencao::findOrFail($uuid);
        $anterior = $detencao->estado_custodia;

        $updateData = ['estado_custodia' => $validated['estado_custodia']];
        if (isset($validated['observacoes_tramitacao']) && !empty($validated['observacoes_tramitacao'])) {
            $updateData['observacoes_tramitacao'] = $validated['observacoes_tramitacao'];
        }

        $detencao->update($updateData);

        CryptographicAuditService::log('detencoes', $detencao->id, 'ALTERACAO_ESTADO_CUSTODIA', [
            'estado_anterior' => $anterior,
            'novo_estado' => $detencao->estado_custodia,
            'observacoes' => $validated['observacoes_tramitacao'] ?? null,
        ]);

        return back()->with('success', "Estado de custódia do detido atualizado para {$validated['estado_custodia']}.");
    }

    /**
     * Emissão e visualização do Auto de Detenção e Guia de Entrada em Cela 48h em PDF.
     */
    public function gerarAutoDetencaoPdf(string $uuid)
    {
        $user = Auth::user();
        $detencao = Detencao::with(['individuo', 'processo.provincia', 'bens'])->findOrFail($uuid);

        if (!$user->podeVerTodasProvincias()) {
            $userProvinciaId = $user->unidade?->provincia_id;
            if ($userProvinciaId && $detencao->processo && $detencao->processo->provincia_id !== $userProvinciaId && $detencao->efetivo_captor_nip !== $user->nip) {
                abort(403, 'Acesso Negado: Registo de detenção fora da jurisdição territorial atribuída.');
            }
        }

        $dataEmissao = Carbon::now()->locale('pt_AO')->isoFormat('D [de] MMMM [de] YYYY');
        $horaEmissao = Carbon::now()->format('H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.auto_detencao', [
            'detencao' => $detencao,
            'dataEmissao' => $dataEmissao,
            'horaEmissao' => $horaEmissao,
        ])->setPaper('a4', 'portrait');

        $nomeIndividuo = $detencao->individuo?->nome_completo ? Str::slug($detencao->individuo->nome_completo) : 'detido';
        $nomeFicheiro = "Auto_Detencao_{$nomeIndividuo}_{$detencao->id}.pdf";

        return $pdf->stream($nomeFicheiro);
    }
}
