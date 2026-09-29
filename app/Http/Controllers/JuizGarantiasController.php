<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\Detencao;
use App\Models\JuizGarantiasAudiencia;
use App\Models\ProcessoCrime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class JuizGarantiasController extends Controller
{
    /**
     * Painel Consolidado de Audiências de Garantia & Controlo das 48 Horas Constitucionais.
     */
    public function index(Request $request): Response
    {
        $audiencias = JuizGarantiasAudiencia::with([
            'processo.provincia',
            'detencao.individuo'
        ])
        ->orderBy('data_hora_audiencia', 'desc')
        ->paginate(15);

        // Detenções ativas que aguardam 1.º interrogatório nas 48h
        $detencoesPendentes = Detencao::with(['individuo', 'processo'])
            ->whereIn('estado_custodia', ['CELA_TRANSITORIA', 'APRESENTADO_MP'])
            ->orderBy('data_hora_detencao', 'asc')
            ->get()
            ->map(function ($det) {
                $horas = (int) round(Carbon::parse($det->data_hora_detencao)->diffInHours(Carbon::now()));
                return [
                    'id' => $det->id,
                    'processo_id' => $det->processo_id,
                    'numero_processo' => $det->processo?->numero_processo ?? 'Sem Processo',
                    'individuo_nome' => $det->individuo?->nome_completo ?? 'Não identificado',
                    'bi' => $det->individuo?->numero_bi ?? 'N/D',
                    'data_hora_detencao' => $det->data_hora_detencao->format('d/m/Y H:i'),
                    'horas_decorridas' => $horas,
                    'limite_48h' => $det->limite_legal_48h->format('d/m/Y H:i'),
                    'expirado' => $horas >= 48,
                    'estado_custodia' => $det->estado_custodia,
                ];
            });

        $estatisticas = [
            'total_audiencias' => JuizGarantiasAudiencia::count(),
            'prisoes_preventivas' => JuizGarantiasAudiencia::where('decisao_judicial', 'MANUTENCAO_PRISAO_PREVENTIVA')->count(),
            'liberdades_concedidas' => JuizGarantiasAudiencia::whereIn('decisao_judicial', ['TERMO_IDENTIDADE_RESIDENCIA', 'LIBERDADE_PROVISORIA_CAUCAO', 'RELAXAMENTO_PRISAO_ILEGAL'])->count(),
            'taxa_respeito_48h' => JuizGarantiasAudiencia::count() > 0 
                ? round((JuizGarantiasAudiencia::where('dentro_prazo_48h', true)->count() / JuizGarantiasAudiencia::count()) * 100, 1)
                : 100,
        ];

        return Inertia::render('Garantias/Index', [
            'audiencias' => $audiencias,
            'detencoesPendentes' => $detencoesPendentes,
            'estatisticas' => $estatisticas,
        ]);
    }
}
