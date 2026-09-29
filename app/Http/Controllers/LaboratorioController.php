<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\PericiaLaboratorio;
use App\Models\ProcessoCrime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LaboratorioController extends Controller
{
    /**
     * M5: Fila e acompanhamento de exames periciais forenses.
     */
    public function index(Request $request): Response
    {
        $query = PericiaLaboratorio::with(['processo.provincia', 'perito']);

        if ($request->filled('tipo_pericia')) {
            $query->where('tipo_pericia', $request->input('tipo_pericia'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('codigo_vestigio_lacre', 'LIKE', $term)
                  ->orWhere('descricao_vestigio', 'LIKE', $term)
                  ->orWhereHas('processo', function ($sub) use ($term) {
                      $sub->where('numero_processo', 'LIKE', $term);
                  });
            });
        }

        $pericias = $query->orderBy('data_requisicao', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Laboratorio/Index', [
            'pericias' => $pericias,
            'filtros' => $request->only(['search', 'tipo_pericia', 'estado']),
            'processos_disponiveis' => ProcessoCrime::select('id', 'numero_processo', 'tipologia_legal')->get(),
            'especialidades' => \App\Models\TabelaParametrica::porCategoria('especialidade_forense')->ativos()->get(),
            'estatisticas' => [
                'total' => PericiaLaboratorio::count(),
                'em_analise' => PericiaLaboratorio::where('estado', 'EM_ANALISE')->count(),
                'concluidas' => PericiaLaboratorio::where('estado', 'CONCLUIDA')->count(),
                'balistica' => PericiaLaboratorio::where('tipo_pericia', 'BALISTICA')->count(),
                'biologia_adn' => PericiaLaboratorio::where('tipo_pericia', 'BIOLOGIA_ADN')->count(),
                'informatica' => PericiaLaboratorio::where('tipo_pericia', 'INFORMATICA_FORENSE')->count(),
            ],
        ]);
    }

    /**
     * Requisição de nova perícia forense.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'processo_id' => ['required', 'exists:processos_crime,id'],
            'codigo_vestigio_lacre' => ['required', 'string', 'max:100', 'unique:pericias_laboratorio,codigo_vestigio_lacre'],
            'tipo_pericia' => ['required', 'in:BALISTICA,DACTILOSCOPIA,TOXICOLOGIA,DOCUMENTOSCOPIA,INFORMATICA_FORENSE,BIOLOGIA_ADN'],
            'descricao_vestigio' => ['required', 'string'],
        ]);

        $user = Auth::user();

        $pericia = PericiaLaboratorio::create([
            'id' => (string) Str::uuid7(),
            'processo_id' => $validated['processo_id'],
            'codigo_vestigio_lacre' => $validated['codigo_vestigio_lacre'],
            'tipo_pericia' => $validated['tipo_pericia'],
            'descricao_vestigio' => $validated['descricao_vestigio'],
            'estado' => 'EM_ANALISE',
            'perito_responsavel_id' => $user->id,
            'data_requisicao' => Carbon::now(),
        ]);

        CryptographicAuditService::log('pericias_laboratorio', $pericia->id, 'REQUISICAO_PERICIA_FORENSE', [
            'codigo_vestigio' => $pericia->codigo_vestigio_lacre,
            'tipo' => $pericia->tipo_pericia,
            'processo_id' => $pericia->processo_id,
        ]);

        return back()->with('success', "Requisição pericial de {$pericia->tipo_pericia} registada com sucesso.");
    }

    /**
     * Conclusão de laudo pericial com cálculo de hash SHA-256 da prova técnica.
     */
    public function concluirLaudo(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'conclusoes_tecnicas' => ['required', 'string'],
            'metodologia' => ['nullable', 'string'],
        ]);

        $pericia = PericiaLaboratorio::findOrFail($uuid);
        $user = Auth::user();

        // Geração do hash SHA-256 do laudo pericial
        $payloadLaudo = implode('|', [
            $pericia->codigo_vestigio_lacre,
            $pericia->tipo_pericia,
            $validated['metodologia'] ?? '',
            $validated['conclusoes_tecnicas'],
            $user->nip,
            Carbon::now()->toIso8601String(),
        ]);

        $hashSha256 = hash('sha256', $payloadLaudo);

        $pericia->update([
            'estado' => 'CONCLUIDA',
            'metodologia' => $validated['metodologia'] ?? null,
            'conclusoes_tecnicas' => $validated['conclusoes_tecnicas'],
            'laudo_pericial_path' => '/storage/laudos/laudo_' . Str::slug($pericia->codigo_vestigio_lacre) . '.pdf',
            'hash_laudo_sha256' => $hashSha256,
            'perito_responsavel_id' => $user->id,
            'data_conclusao' => Carbon::now(),
        ]);

        CryptographicAuditService::log('pericias_laboratorio', $pericia->id, 'CONCLUSAO_LAUDO_PERICIAL', [
            'codigo_lacre' => $pericia->codigo_vestigio_lacre,
            'hash_laudo_sha256' => $hashSha256,
            'perito_nip' => $user->nip,
        ]);

        return back()->with('success', "Laudo pericial assinado digitalmente com hash SHA-256: {$hashSha256}");
    }

    /**
     * Emissão e visualização do Laudo Pericial Forense Oficial em PDF.
     */
    public function gerarLaudoPdf(string $uuid)
    {
        $pericia = PericiaLaboratorio::with(['processo.provincia', 'perito'])->findOrFail($uuid);

        $dataEmissao = Carbon::now()->locale('pt_AO')->isoFormat('D [de] MMMM [de] YYYY');
        $horaEmissao = Carbon::now()->format('H:i');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.laudo_pericial', [
            'pericia' => $pericia,
            'dataEmissao' => $dataEmissao,
            'horaEmissao' => $horaEmissao,
        ])->setPaper('a4', 'portrait');

        $codigoSanitizado = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $pericia->codigo_vestigio_lacre);
        $nomeFicheiro = "Laudo_Pericial_{$codigoSanitizado}.pdf";

        return $pdf->stream($nomeFicheiro);
    }
}
