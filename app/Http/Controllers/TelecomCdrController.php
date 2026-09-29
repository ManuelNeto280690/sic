<?php

namespace App\Http\Controllers;

use App\Models\ProcessoCrime;
use App\Models\TelecomCdrRegisto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TelecomCdrController extends Controller
{
    /**
     * Centro de Análise de Metadados / CDR & Triangulação de Antenas ERB.
     */
    public function index(Request $request): Response
    {
        $query = TelecomCdrRegisto::with(['processo.provincia']);

        if ($request->filled('operadora')) {
            $query->where('operadora', $request->operadora);
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('numero_alvo_origem', 'LIKE', $term)
                  ->orWhere('numero_interlocutor_destino', 'LIKE', $term)
                  ->orWhere('antena_erb_nome', 'LIKE', $term)
                  ->orWhere('imei_equipamento', 'LIKE', $term);
            });
        }

        $registos = $query->orderBy('data_hora_evento', 'desc')->paginate(20)->withQueryString();

        $antenasAgrupadas = TelecomCdrRegisto::select('antena_erb_nome', 'latitude', 'longitude', 'operadora')
            ->selectRaw('count(*) as total_eventos')
            ->groupBy('antena_erb_nome', 'latitude', 'longitude', 'operadora')
            ->get();

        $estatisticas = [
            'total_registos' => TelecomCdrRegisto::count(),
            'total_unitel' => TelecomCdrRegisto::where('operadora', 'UNITEL')->count(),
            'total_africell' => TelecomCdrRegisto::where('operadora', 'AFRICELL')->count(),
            'total_movicel' => TelecomCdrRegisto::where('operadora', 'MOVICEL')->count(),
            'antenas_unicas' => $antenasAgrupadas->count(),
        ];

        return Inertia::render('Telecom/Index', [
            'registos' => $registos,
            'antenas' => $antenasAgrupadas,
            'estatisticas' => $estatisticas,
            'filtros' => $request->only(['operadora', 'search']),
        ]);
    }
}
