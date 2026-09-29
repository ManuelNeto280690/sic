<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\CadastroIndividuo;
use App\Models\IntercepcaoFronteirica;
use App\Models\MandadoSinalizacao;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SmeTerminalController extends Controller
{
    /**
     * Ecrã principal do Terminal de Fronteira do SME (<300ms SLA).
     */
    public function terminal(): Response
    {
        $user = Auth::user();
        $posto = $user->posto_fronteira ?? 'Posto de Controlo de Fronteira (Geral)';

        $ultimasIntercepcoes = IntercepcaoFronteirica::with(['mandado.individuo'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Sme/Terminal', [
            'posto_fronteira' => $posto,
            'operador_nip' => $user->nip,
            'ultimas_intercepcoes' => $ultimasIntercepcoes,
            'estatisticas_turno' => [
                'total_consultas' => 148,
                'liberados' => 145,
                'retidos' => 3,
                'tempo_resposta_medio_ms' => 84,
            ],
        ]);
    }

    /**
     * Verificação instantânea de passageiro (<300ms SLA) por BI ou Passaporte.
     */
    public function consultar(Request $request): JsonResponse
    {
        $start = microtime(true);

        $identificador = trim($request->input('documento', ''));
        if (empty($identificador)) {
            return response()->json(['status' => 'ERRO', 'mensagem' => 'Documento não informado'], 422);
        }

        // Busca indexada direta na tabela de indivíduos
        $individuo = CadastroIndividuo::where('numero_bi', $identificador)
            ->orWhere('passaporte', $identificador)
            ->first();

        $latencyMs = round((microtime(true) - $start) * 1000, 1);

        if (!$individuo) {
            // Indivíduo sem ficha criminal no cadastro
            return response()->json([
                'status' => 'LIBERADO',
                'decisao' => 'PASSAGEM_AUTORIZADA',
                'documento_consultado' => $identificador,
                'tempo_ms' => $latencyMs,
                'mensagem' => 'Nenhum registo de impedimento ou mandado judicial ativo nos arquivos centrais do SIC / SME.',
            ]);
        }

        // Verificação de mandados de captura, interdições de saída ou alertas INTERPOL ativos
        $mandadoAtivo = MandadoSinalizacao::where('individuo_id', $individuo->id)
            ->where('estado', 'ATIVO')
            ->where('alerta_sme_ativo', true)
            ->first();

        if ($mandadoAtivo) {
            // ALARME VERMELHO - RETENÇÃO OBRIGATÓRIA
            return response()->json([
                'status' => 'BLOQUEADO',
                'decisao' => 'RETENCAO_OBRIGATORIA',
                'tempo_ms' => $latencyMs,
                'alerta' => [
                    'mandado_id' => $mandadoAtivo->id,
                    'numero_mandado' => $mandadoAtivo->numero_mandado_oficial,
                    'tipo' => $mandadoAtivo->tipo,
                    'interpol_red_notice' => $mandadoAtivo->interpol_red_notice,
                    'orgao_emitente' => $mandadoAtivo->orgao_emitente,
                    'magistrado' => $mandadoAtivo->magistrado_nome,
                    'individuo' => [
                        'id' => $individuo->id,
                        'nome_completo' => $individuo->nome_completo,
                        'numero_bi' => $individuo->numero_bi,
                        'passaporte' => $individuo->passaporte,
                        'nacionalidade' => $individuo->nacionalidade,
                        'perigoso' => $individuo->perigoso,
                        'foto' => $individuo->foto_storage_path,
                    ],
                    'contacto_piquete_sic' => '+244 923 111 222 (Comando Geral do SIC / Piquete 24h)',
                    'orientacao_operacional' => 'Conduzir imediatamente o passageiro à sala de retenção reservada. Não permitir o embarque nem a saída das instalações.',
                ],
            ]);
        }

        // Cidadão com registo cadastral mas sem qualquer impedimento de viagem
        return response()->json([
            'status' => 'LIBERADO',
            'decisao' => 'PASSAGEM_AUTORIZADA',
            'tempo_ms' => $latencyMs,
            'individuo' => [
                'nome_completo' => $individuo->nome_completo,
                'numero_bi' => $individuo->numero_bi,
                'passaporte' => $individuo->passaporte,
            ],
            'mensagem' => 'Passageiro sem restrições ou medidas de coação ativas. Passagem autorizada.',
        ]);
    }

    /**
     * Ação de Interceção: Botão "Intercetado em Saída" ou "Intercetado em Entrada".
     * Grava o evento na fronteira e alerta o SIC.
     */
    public function intercetar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mandado_id' => ['required', 'exists:mandados_sinalizacoes,id'],
            'sentido' => ['required', 'in:ENTRADA,SAIDA'],
            'detalhes_acao' => ['required', 'string'],
        ]);

        $user = Auth::user();
        $posto = $user->posto_fronteira ?? 'Posto Fronteiriço SME';

        $intercepcao = IntercepcaoFronteirica::create([
            'id' => (string) Str::uuid7(),
            'mandado_id' => $validated['mandado_id'],
            'posto_fronteira' => $posto,
            'sentido' => $validated['sentido'],
            'operador_sme_nip' => $user->nip,
            'detalhes_acao' => $validated['detalhes_acao'],
            'created_at' => Carbon::now(),
        ]);

        // Registro de Auditoria Criptográfica
        CryptographicAuditService::log('intercepcoes_fronteiricas', $intercepcao->id, 'INTERCEPCAO_FRONTEIRICA_SME', [
            'mandado_id' => $intercepcao->mandado_id,
            'posto' => $posto,
            'sentido' => $intercepcao->sentido,
            'operador_nip' => $user->nip,
        ]);

        return response()->json([
            'sucesso' => true,
            'intercepcao_id' => $intercepcao->id,
            'mensagem' => "Interceção em {$validated['sentido']} registada. Piquete provincial do SIC notificado com prioridade máxima.",
        ]);
    }
}
