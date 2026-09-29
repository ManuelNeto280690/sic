<?php

namespace App\Http\Controllers;

use App\Models\ProcessoCrime;
use App\Models\Detencao;
use App\Models\Ocorrencia;
use App\Services\ApidotLegalCopilotService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CopilotoJuridicoController extends Controller
{
    protected ApidotLegalCopilotService $copilotService;

    public function __construct(ApidotLegalCopilotService $copilotService)
    {
        $this->copilotService = $copilotService;
    }

    /**
     * Endpoint para envio de mensagens ao Copiloto Jurídico.
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|string|in:user,assistant,system',
            'messages.*.content' => 'required|string',
            'context' => 'nullable|array',
        ]);

        $messages = $request->input('messages');
        $context = $request->input('context', []);

        // Identificar o utilizador autenticado, cargo e estatuto de Administrador
        $user = $request->user();
        if ($user) {
            $nomeLimpo = trim(preg_replace('/\s*\(Administrador\)\s*/i', '', $user->nome_completo ?? 'Manuel Pascoal'));
            $isAdmin = ($user->perfil === 'ADMIN_SISTEMA');

            $cargoDescritivo = match ($user->perfil) {
                'ADMIN_SISTEMA' => 'Administrador do Sistema SIGD-SIC (Tutela Técnica e Supervisão Geral)',
                'DIRETOR_NACIONAL' => 'Director Nacional do Serviço de Investigação Criminal',
                'COMANDANTE_PROVINCIAL' => 'Comandante Provincial do SIC',
                'CHEFE_DEPARTAMENTO' => 'Chefe de Departamento de Investigação de Ilícitos Penais',
                'INVESTIGADOR' => 'Investigador Criminal do SIC',
                'OFICIAL_SECRETARIA' => 'Oficial de Secretaria Judiciária',
                'OPERADOR_SME' => 'Oficial de Migração e Estrangeiros (SME)',
                'MAGISTRADO_PGR' => 'Magistrado do Ministério Público (PGR)',
                'CONSULTA_ESTATISTICA' => 'Analista de Estatística Criminal',
                default => 'Operador do Sistema',
            };

            $tratamento = match ($user->perfil) {
                'ADMIN_SISTEMA' => "Senhor Administrador do Sistema, {$nomeLimpo}",
                'MAGISTRADO_PGR' => "Digno Magistrado do Ministério Público, {$nomeLimpo}",
                'DIRETOR_NACIONAL' => "Senhor Director Nacional, {$nomeLimpo}",
                'COMANDANTE_PROVINCIAL' => "Senhor Comandante Provincial, {$nomeLimpo}",
                'CHEFE_DEPARTAMENTO' => "Senhor Chefe de Departamento, {$nomeLimpo}",
                'INVESTIGADOR' => "Senhor Investigador Criminal, {$nomeLimpo}",
                'OPERADOR_SME' => "Senhor Oficial do SME, {$nomeLimpo}",
                default => "Senhor(a) {$nomeLimpo}",
            };

            $context['usuario_autenticado'] = [
                'nome' => $nomeLimpo,
                'nome_completo' => $user->nome_completo,
                'nip' => $user->nip,
                'perfil' => $user->perfil,
                'is_admin' => $isAdmin,
                'cargo_descritivo' => $cargoDescritivo,
                'tratamento' => $tratamento,
            ];
        }

        // Enriquecer contexto com dados do banco de dados caso seja passado um ID/UUID de processo ou detenção
        if (!empty($context['processo_id'])) {
            $processo = ProcessoCrime::find($context['processo_id']);
            if ($processo) {
                $context = $this->enrichFromProcesso($context, $processo);
            }
        } elseif (!empty($context['processo_numero'])) {
            $processo = ProcessoCrime::where('numero_processo', $context['processo_numero'])->first();
            if ($processo) {
                $context = $this->enrichFromProcesso($context, $processo);
            }
        } elseif (!empty($context['detencao_id'])) {
            $detencao = Detencao::find($context['detencao_id']);
            if ($detencao) {
                $context = $this->enrichFromDetencao($context, $detencao);
            }
        }

        $result = $this->copilotService->chat($messages, $context);

        return response()->json($result);
    }

    /**
     * Enriquece os metadados a partir de um ProcessoCrime.
     */
    protected function enrichFromProcesso(array $context, ProcessoCrime $processo): array
    {
        $context['processo_numero'] = $processo->numero_processo;
        $context['tipologia_crime'] = $processo->tipologia_legal ?? ($processo->tipologia_crime ?? ($context['tipologia_crime'] ?? 'Não especificada'));
        $context['estado_processo'] = $processo->estado ?? ($context['estado_processo'] ?? 'Em instrução');
        $context['descricao'] = $processo->resumo_factos ?? ($processo->descricao ?? ($context['descricao'] ?? ''));

        if ($processo->data_abertura) {
            $context['data_abertura'] = Carbon::parse($processo->data_abertura)->format('d/m/Y');
        }

        // Tentar obter detenção associada
        $detencao = Detencao::where('processo_id', $processo->id)->with('individuo')->latest()->first();
        if ($detencao && $detencao->data_hora_detencao) {
            $dataDetencao = Carbon::parse($detencao->data_hora_detencao);
            $context['data_detencao'] = $dataDetencao->format('d/m/Y H:i');
            $context['horas_detencao'] = (int) $dataDetencao->diffInHours(now());
            if ($detencao->individuo?->nome_completo) {
                $context['arguidos'] = [$detencao->individuo->nome_completo];
            }
        }

        return $context;
    }

    /**
     * Enriquece os metadados a partir de uma Detencao.
     */
    protected function enrichFromDetencao(array $context, Detencao $detencao): array
    {
        if ($detencao->data_hora_detencao) {
            $dataDetencao = Carbon::parse($detencao->data_hora_detencao);
            $context['data_detencao'] = $dataDetencao->format('d/m/Y H:i');
            $context['horas_detencao'] = (int) $dataDetencao->diffInHours(now());
        }

        if ($detencao->individuo?->nome_completo) {
            $context['arguidos'] = [$detencao->individuo->nome_completo];
        }

        if ($detencao->motivo_legal) {
            $context['tipologia_crime'] = $detencao->motivo_legal;
        }

        return $context;
    }
}
