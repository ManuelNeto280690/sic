<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\InvestigacaoFinanceiraConta;
use App\Models\ProcessoCrime;
use App\Models\TransacaoFinanceiraSuspeita;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestigacaoFinanceiraController extends Controller
{
    /**
     * Painel Consolidado de Investigação Económica, Financeira e Recuperação de Ativos (DNCF / UIF / SENRA).
     */
    public function index(Request $request): Response
    {
        $contas = InvestigacaoFinanceiraConta::with(['processo.provincia', 'transacoes'])
            ->orderBy('saldo_contabilistico_kz', 'desc')
            ->paginate(15);

        $transacoesRecentes = TransacaoFinanceiraSuspeita::with(['conta', 'processo'])
            ->orderBy('data_hora_movimento', 'desc')
            ->limit(20)
            ->get();

        $totalBloqueadoKz = InvestigacaoFinanceiraConta::where('congelamento_cautelar_ativo', true)
            ->sum('saldo_contabilistico_kz');

        $totalApuradoKz = InvestigacaoFinanceiraConta::sum('total_creditos_apurados_kz');

        $estatisticas = [
            'total_contas_auditadas' => InvestigacaoFinanceiraConta::count(),
            'contas_bloqueadas' => InvestigacaoFinanceiraConta::where('congelamento_cautelar_ativo', true)->count(),
            'total_bloqueado_kz' => $totalBloqueadoKz,
            'total_movimentado_apurado_kz' => $totalApuradoKz,
            'alertas_smurfing' => TransacaoFinanceiraSuspeita::where('alerta_padrao_lavagem', 'SMURFING_FRACIONAMENTO')->count(),
            'alertas_passagem' => TransacaoFinanceiraSuspeita::where('alerta_padrao_lavagem', 'CONTA_PASSAGEM_TRANSBORDO')->count(),
        ];

        return Inertia::render('Financeiro/Index', [
            'contas' => $contas,
            'transacoesRecentes' => $transacoesRecentes,
            'estatisticas' => $estatisticas,
        ]);
    }

    /**
     * Ação Imediata: Congelar Cautelarmente Conta Bancária (SENRA / PGR / BNA).
     */
    public function congelarConta(Request $request, string $contaId)
    {
        $conta = InvestigacaoFinanceiraConta::findOrFail($contaId);
        $user = Auth::user();

        $numeroAuto = 'SENRA-BLOQ-' . date('Y') . '/' . strtoupper(substr(uniqid(), -6));

        $conta->update([
            'congelamento_cautelar_ativo' => true,
            'numero_auto_bloqueio_senra' => $numeroAuto,
            'data_hora_bloqueio' => Carbon::now(),
        ]);

        CryptographicAuditService::log('investigacoes_financeiras_contas', $conta->id, 'CONGELAMENTO_CAUTELAR_SENRA', [
            'iban' => $conta->iban_completo,
            'titular' => $conta->titular_nome,
            'banco' => $conta->banco_comercial,
            'saldo_congelado_kz' => $conta->saldo_contabilistico_kz,
            'auto_senra' => $numeroAuto,
            'operador' => $user->nome_completo,
        ]);

        return back()->with('success', "Conta bancária {$conta->iban_completo} do {$conta->banco_comercial} CONGELADA cautelarmente sob o auto {$numeroAuto}. Ofício emitido ao BNA e SENRA.");
    }
}
