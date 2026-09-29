<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\LogAuditoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditoriaController extends Controller
{
    /**
     * M10: Livro imutável de logs de auditoria encadeados via SHA-256 (Append-Only).
     */
    public function index(Request $request): Response
    {
        $query = LogAuditoria::with('utilizador');

        if ($request->filled('tabela')) {
            $query->where('tabela_afetada', $request->input('tabela'));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('rota_acao', 'LIKE', $term)
                  ->orWhere('hash_atual', 'LIKE', $term)
                  ->orWhere('registo_id', 'LIKE', $term);
            });
        }

        $logs = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();
        $chainStatus = CryptographicAuditService::verifyChainIntegrity();

        return Inertia::render('Auditoria/Index', [
            'logs' => $logs,
            'chain_status' => $chainStatus,
            'filtros' => $request->only(['search', 'tabela']),
        ]);
    }

    /**
     * Executa a verificação matemática da cadeia de blocos de auditoria em tempo real.
     */
    public function verificar(): JsonResponse
    {
        $result = CryptographicAuditService::verifyChainIntegrity();
        return response()->json($result);
    }
}
