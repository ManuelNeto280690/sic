<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\CadastroIndividuo;
use App\Models\Detencao;
use App\Models\MandadoSinalizacao;
use App\Models\ProcessoCrime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MagistraturaController extends Controller
{
    /**
     * Painel da Janela da PGR: Fiscalização da legalidade, mandados e remessas.
     */
    public function index(Request $request): Response
    {
        $mandados = MandadoSinalizacao::with(['individuo', 'processo'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Processos remetidos pelo SIC aguardando despacho da PGR
        $processosRemetidos = ProcessoCrime::with(['provincia', 'investigador', 'detencoes.individuo'])
            ->where('estado', 'REMETIDO_AO_MP')
            ->orderBy('data_remessa_mp', 'desc')
            ->take(10)
            ->get();

        // Fiscalização dos detidos de 48 horas
        $detidosFiscalizacao = Detencao::with(['individuo', 'processo'])
            ->where('estado_custodia', 'CELA_TRANSITORIA')
            ->orderBy('limite_legal_48h', 'asc')
            ->take(10)
            ->get()
            ->map(function ($d) {
                $d->horas_restantes = round(Carbon::now()->diffInMinutes($d->limite_legal_48h, false) / 60, 1);
                return $d;
            });

        return Inertia::render('Magistratura/Index', [
            'mandados' => $mandados,
            'processos_remetidos' => $processosRemetidos,
            'detidos_fiscalizacao' => $detidosFiscalizacao,
            'individuos_lista' => CadastroIndividuo::select('id', 'nome_completo', 'numero_bi', 'passaporte')->orderBy('nome_completo')->get(),
            'processos_lista' => ProcessoCrime::select('id', 'numero_processo', 'tipologia_legal')->get(),
            'estatisticas' => [
                'mandados_ativos' => MandadoSinalizacao::where('estado', 'ATIVO')->count(),
                'interdicoes_saida' => MandadoSinalizacao::where('tipo', 'INTERDICAO_SAIDA')->where('estado', 'ATIVO')->count(),
                'red_notices' => MandadoSinalizacao::where('interpol_red_notice', true)->where('estado', 'ATIVO')->count(),
                'processos_aguardando' => ProcessoCrime::where('estado', 'REMETIDO_AO_MP')->count(),
            ],
        ]);
    }

    /**
     * Emissão digital de Mandados Judiciais e Interdições de Saída com upload de despacho.
     */
    public function emitirMandado(Request $request)
    {
        $validated = $request->validate([
            'individuo_id' => ['required', 'exists:cadastro_individuos,id'],
            'processo_id' => ['nullable', 'exists:processos_crime,id'],
            'tipo' => ['required', 'in:CAPTURA_NACIONAL,INTERDICAO_SAIDA,IMPEDIMENTO_ENTRADA,CAPTURA_INTERPOL'],
            'fundamentacao_legal' => ['required', 'string'],
            'data_validade' => ['required', 'date', 'after:today'],
            'alerta_sme_ativo' => ['boolean'],
            'interpol_red_notice' => ['boolean'],
        ]);

        $user = Auth::user();
        $individuo = CadastroIndividuo::findOrFail($validated['individuo_id']);

        $ano = Carbon::now()->year;
        $siglaTipo = match($validated['tipo']) {
            'CAPTURA_NACIONAL' => 'MAND-PGR',
            'INTERDICAO_SAIDA' => 'INTERD-PGR',
            'CAPTURA_INTERPOL' => 'INTERPOL-PGR',
            default => 'ORDEM-PGR',
        };
        $seq = str_pad((string) (MandadoSinalizacao::count() + 1), 5, '0', STR_PAD_LEFT);
        $numeroOficial = "{$siglaTipo}/{$ano}/{$seq}";

        $mandado = MandadoSinalizacao::create([
            'id' => (string) Str::uuid7(),
            'numero_mandado_oficial' => $numeroOficial,
            'processo_id' => $validated['processo_id'] ?? null,
            'individuo_id' => $individuo->id,
            'tipo' => $validated['tipo'],
            'orgao_emitente' => 'Procuradoria-Geral da República (Magistratura)',
            'magistrado_nome' => $user->nome_completo,
            'fundamentacao_legal' => $validated['fundamentacao_legal'],
            'despacho_assinado_path' => '/storage/mandados/despacho_' . Str::slug($numeroOficial) . '.pdf',
            'data_emissao' => Carbon::now()->toDateString(),
            'data_validade' => $validated['data_validade'],
            'alerta_sme_ativo' => $validated['alerta_sme_ativo'] ?? true,
            'interpol_red_notice' => $validated['interpol_red_notice'] ?? false,
            'estado' => 'ATIVO',
        ]);

        // Se for interdição ou captura, atualiza flag no cadastro do indivíduo
        if (in_array($mandado->tipo, ['INTERDICAO_SAIDA', 'CAPTURA_NACIONAL', 'CAPTURA_INTERPOL'])) {
            $individuo->update(['interdicao_saida' => true]);
        }

        CryptographicAuditService::log('mandados_sinalizacoes', $mandado->id, 'EMISSAO_MANDADO_JUDICIAL_PGR', [
            'numero_oficial' => $numeroOficial,
            'alvo' => $individuo->nome_completo,
            'tipo' => $mandado->tipo,
            'interpol' => $mandado->interpol_red_notice,
            'magistrado' => $user->nome_completo,
        ]);

        return back()->with('success', "Mandado Judicial {$numeroOficial} emitido e difundido imediatamente para o SME e SIC.");
    }

    /**
     * Revogação Soberana em Tempo Real pela Magistratura (baixa imediata no SME e SIC).
     */
    public function revogarMandado(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'motivo_revogacao' => ['required', 'string'],
        ]);

        $mandado = MandadoSinalizacao::with('individuo')->findOrFail($uuid);
        $user = Auth::user();

        $mandado->update([
            'estado' => 'REVOGADO',
            'alerta_sme_ativo' => false,
        ]);

        // Se não houver outros mandados ativos de interdição, limpa no cadastro do indivíduo
        $outrosAtivos = MandadoSinalizacao::where('individuo_id', $mandado->individuo_id)
            ->where('estado', 'ATIVO')
            ->whereIn('tipo', ['INTERDICAO_SAIDA', 'CAPTURA_NACIONAL', 'CAPTURA_INTERPOL'])
            ->exists();

        if (!$outrosAtivos && $mandado->individuo) {
            $mandado->individuo->update(['interdicao_saida' => false]);
        }

        CryptographicAuditService::log('mandados_sinalizacoes', $mandado->id, 'REVOGACAO_SOBERANA_MANDADO_PGR', [
            'numero_oficial' => $mandado->numero_mandado_oficial,
            'alvo' => $mandado->individuo?->nome_completo,
            'motivo' => $validated['motivo_revogacao'],
            'magistrado' => $user->nome_completo,
        ]);

        return back()->with('success', "Mandado {$mandado->numero_mandado_oficial} revogado com soberania. Baixa imediata efetivada no terminal de fronteira do SME.");
    }

    /**
     * Apreciação soberana de inquérito remetido à PGR no próprio ambiente da Magistratura.
     */
    public function showProcesso(string $uuid): Response
    {
        $processo = ProcessoCrime::with([
            'provincia',
            'unidade',
            'investigador',
            'ocorrencia.intervenientes.individuo',
            'diligencias.responsavel',
            'detencoes.individuo',
            'bens.apreendidoPor',
            'pericias.perito',
            'mandados.individuo',
        ])->findOrFail($uuid);

        return Inertia::render('Magistratura/ProcessoShow', [
            'processo' => $processo,
        ]);
    }

    /**
     * Lavratura de Despacho Judicial da PGR no inquérito remetido.
     */
    public function despacharProcesso(Request $request, string $uuid)
    {
        $validated = $request->validate([
            'tipo_despacho' => ['required', 'in:ACUSACAO,DEVOLUCAO_SIC,ARQUIVAMENTO'],
            'texto_despacho' => ['required', 'string'],
        ]);

        $processo = ProcessoCrime::findOrFail($uuid);
        $user = Auth::user();

        $novoEstado = match ($validated['tipo_despacho']) {
            'ACUSACAO' => 'ACUSADO',
            'ARQUIVAMENTO' => 'ARQUIVADO',
            'DEVOLUCAO_SIC' => 'EM_INSTRUCAO',
        };

        $processo->update([
            'estado' => $novoEstado,
            'magistrado_pgr_responsavel' => $user->nome_completo,
        ]);

        CryptographicAuditService::log('processos_crime', $processo->id, 'DESPACHO_MAGISTRADO_PGR', [
            'tipo_despacho' => $validated['tipo_despacho'],
            'novo_estado' => $novoEstado,
            'magistrado' => $user->nome_completo,
            'nip' => $user->nip,
            'texto_despacho' => $validated['texto_despacho'],
        ]);

        $tipoMsg = match ($validated['tipo_despacho']) {
            'ACUSACAO' => 'Acusação formal deduzida com sucesso. Processo remetido à Sala Criminal do Tribunal competente.',
            'DEVOLUCAO_SIC' => 'Processo devolvido ao SIC para realização de diligências complementares de instrução.',
            'ARQUIVAMENTO' => 'Despacho de arquivamento proferido e homologado nos autos.',
        };

        return back()->with('success', $tipoMsg);
    }
}
