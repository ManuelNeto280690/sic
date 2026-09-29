<?php

namespace App\Http\Middleware;

use App\Models\Detencao;
use App\Models\Provincia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing(['unidade.provincia']);
        }

        $activeProvinciaId = $request->session()->get('active_provincia_id');
        $activeProvincia = null;
        if ($activeProvinciaId) {
            $activeProvincia = Provincia::find($activeProvinciaId);
        } elseif ($user && $user->unidade && $user->unidade->provincia) {
            $activeProvincia = $user->unidade->provincia;
        }

        // HUD Prazos Constitucionais de 48 horas: buscar detidos sob custódia
        $detidosUrgentes = [];
        $total48hUrgentes = 0;

        if ($user && !$user->isSme()) {
            $query = Detencao::with(['individuo'])
                ->where('estado_custodia', 'CELA_TRANSITORIA')
                ->where('limite_legal_48h', '<=', Carbon::now()->addHours(24))
                ->orderBy('limite_legal_48h', 'asc');

            if (!$user->isCentral() && $user->unidade && $user->unidade->provincia_id) {
                $query->whereHas('processo', function ($q) use ($user) {
                    $q->where('provincia_id', $user->unidade->provincia_id);
                });
            }

            $detidosUrgentes = $query->take(5)->get()->map(function ($d) {
                return [
                    'id' => $d->id,
                    'nome' => $d->individuo ? $d->individuo->nome_completo : 'Detido Sem Identificação',
                    'limite_legal_48h' => $d->limite_legal_48h->toIso8601String(),
                    'horas_restantes' => $d->horas_restantes,
                    'local_detencao' => $d->local_detencao,
                ];
            });

            $total48hUrgentes = $query->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'nip' => $user->nip,
                    'nome_completo' => $user->nome_completo,
                    'email' => $user->email,
                    'perfil' => $user->perfil,
                    'unidade_id' => $user->unidade_id,
                    'unidade' => $user->unidade ? [
                        'id' => $user->unidade->id,
                        'nome' => $user->unidade->nome,
                        'sigla' => $user->unidade->sigla,
                        'nivel' => $user->unidade->nivel,
                        'provincia_id' => $user->unidade->provincia_id,
                        'provincia_nome' => $user->unidade->provincia?->nome,
                    ] : null,
                    'posto_fronteira' => $user->posto_fronteira,
                ] : null,
                'active_provincia' => $activeProvincia ? [
                    'id' => $activeProvincia->id,
                    'nome' => $activeProvincia->nome,
                    'codigo_iso' => $activeProvincia->codigo_iso,
                ] : null,
            ],
            'provincias_lista' => Provincia::select('id', 'nome', 'codigo_iso')->orderBy('nome')->get(),
            'prazos_urgentes' => [
                'total_48h_urgentes' => $total48hUrgentes,
                'detidos_criticos' => $detidosUrgentes,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'alert' => $request->session()->get('alert'),
            ],
            'configuracoes_globais' => \App\Models\ConfiguracaoSistema::pluck('valor', 'chave')->toArray(),
        ];
    }
}
