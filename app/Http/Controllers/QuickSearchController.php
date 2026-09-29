<?php

namespace App\Http\Controllers;

use App\Models\BemCustodia;
use App\Models\CadastroIndividuo;
use App\Models\MandadoSinalizacao;
use App\Models\Ocorrencia;
use App\Models\ProcessoCrime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuickSearchController extends Controller
{
    /**
     * Omnibox Global (Ctrl + K): Busca unificada ultra rápida.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        if (strlen($q) < 2) {
            return response()->json(['resultados' => []]);
        }

        $term = "%{$q}%";
        $resultados = [];

        // 1. Indivíduos (BI, Passaporte, Nome)
        $individuos = CadastroIndividuo::where('numero_bi', 'LIKE', $term)
            ->orWhere('passaporte', 'LIKE', $term)
            ->orWhere('nome_completo', 'LIKE', $term)
            ->take(4)
            ->get();

        foreach ($individuos as $ind) {
            $resultados[] = [
                'categoria' => 'Indivíduo (Cadastro Central)',
                'titulo' => $ind->nome_completo,
                'subtitulo' => "BI: " . ($ind->numero_bi ?? 'N/D') . " | Passaporte: " . ($ind->passaporte ?? 'N/D'),
                'url' => route('ocorrencias.index', ['search' => $ind->nome_completo]),
                'icone' => 'user',
                'badge' => $ind->perigoso ? 'PERIGOSO' : 'REGISTADO',
                'badge_cor' => $ind->perigoso ? 'red' : 'blue',
            ];
        }

        // 2. Processos-Crime
        $processos = ProcessoCrime::where('numero_processo', 'LIKE', $term)
            ->orWhere('tipologia_legal', 'LIKE', $term)
            ->take(4)
            ->get();

        foreach ($processos as $proc) {
            $resultados[] = [
                'categoria' => 'Processo-Crime',
                'titulo' => $proc->numero_processo,
                'subtitulo' => $proc->tipologia_legal,
                'url' => route('processos.show', $proc->id),
                'icone' => 'folder-open',
                'badge' => $proc->estado,
                'badge_cor' => 'gold',
            ];
        }

        // 3. Ocorrências / Autos de Notícia
        $ocorrencias = Ocorrencia::where('numero_ocorrencia', 'LIKE', $term)
            ->orWhere('classificacao_codigo', 'LIKE', $term)
            ->orWhere('local_detalhado', 'LIKE', $term)
            ->take(4)
            ->get();

        foreach ($ocorrencias as $oc) {
            $resultados[] = [
                'categoria' => 'Auto de Ocorrência',
                'titulo' => $oc->numero_ocorrencia,
                'subtitulo' => "{$oc->classificacao_codigo} — {$oc->local_detalhado}",
                'url' => route('ocorrencias.show', $oc->id),
                'icone' => 'file-text',
                'badge' => $oc->estado,
                'badge_cor' => 'emerald',
            ];
        }

        // 4. Mandados Judiciais da PGR
        $mandados = MandadoSinalizacao::with('individuo')
            ->where('numero_mandado_oficial', 'LIKE', $term)
            ->take(3)
            ->get();

        foreach ($mandados as $mand) {
            $resultados[] = [
                'categoria' => 'Mandado Judicial (PGR)',
                'titulo' => $mand->numero_mandado_oficial,
                'subtitulo' => "Alvo: " . ($mand->individuo?->nome_completo ?? 'N/D') . " — " . $mand->tipo,
                'url' => route('magistratura.index'),
                'icone' => 'shield-alert',
                'badge' => $mand->estado,
                'badge_cor' => $mand->estado === 'ATIVO' ? 'red' : 'gray',
            ];
        }

        // 5. Lacres de Segurança
        $lacres = BemCustodia::where('numero_lacre_seguranca', 'LIKE', $term)
            ->take(3)
            ->get();

        foreach ($lacres as $bem) {
            $resultados[] = [
                'categoria' => 'Lacre de Custódia',
                'titulo' => $bem->numero_lacre_seguranca,
                'subtitulo' => "{$bem->tipo_objeto}: {$bem->descricao_bem}",
                'url' => route('processos.show', $bem->processo_id),
                'icone' => 'lock',
                'badge' => 'LACRADO',
                'badge_cor' => 'gold',
            ];
        }

        return response()->json(['resultados' => $resultados]);
    }
}
