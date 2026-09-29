<?php

namespace App\Domain\Auditoria\Services;

use App\Models\LogAuditoria;
use Carbon\Carbon;
use Illuminate\Support\Facades\Request;

class CryptographicAuditService
{
    const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

    /**
     * Registra uma ação crítica com encadeamento imutável de hash SHA-256.
     */
    public static function log(
        string $tabela,
        string $registoId,
        string $rotaAcao,
        ?array $dadosNovos = null,
        ?array $dadosAnteriores = null,
        ?string $utilizadorId = null
    ): LogAuditoria {
        $lastLog = LogAuditoria::orderBy('id', 'desc')->first();
        $hashAnterior = $lastLog ? $lastLog->hash_atual : self::GENESIS_HASH;

        $userId = $utilizadorId ?? (auth()->check() ? auth()->id() : null);
        $ip = Request::ip() ?? '127.0.0.1';
        $now = Carbon::now();
        $timestampStr = $now->format('Y-m-d H:i:s');

        // Encadeamento Criptográfico SHA-256:
        // Hash_n = SHA256(Hash_{n-1} + userId + ip + rota + tabela + registoId + dadosNovosJson + timestamp)
        $payloadToHash = implode('|', [
            $hashAnterior,
            $userId ?? 'SISTEMA',
            $ip,
            $rotaAcao,
            $tabela,
            $registoId,
            $dadosNovos ? json_encode($dadosNovos, JSON_UNESCAPED_UNICODE) : '',
            $timestampStr,
        ]);

        $hashAtual = hash('sha256', $payloadToHash);

        return LogAuditoria::create([
            'utilizador_id' => $userId,
            'ip_origem' => $ip,
            'rota_acao' => $rotaAcao,
            'tabela_afetada' => $tabela,
            'registo_id' => $registoId,
            'dados_anteriores' => $dadosAnteriores,
            'dados_novos' => $dadosNovos,
            'hash_anterior' => $hashAnterior,
            'hash_atual' => $hashAtual,
            'created_at' => $now,
        ]);
    }

    /**
     * Valida toda a cadeia criptográfica da tabela logs_auditoria.
     * Retorna se a cadeia está íntegra e onde ocorreu a primeira quebra, se houver.
     */
    public static function verifyChainIntegrity(): array
    {
        $logs = LogAuditoria::orderBy('id', 'asc')->get();
        $expectedPreviousHash = self::GENESIS_HASH;
        $corruptedAt = null;

        foreach ($logs as $log) {
            if ($log->hash_anterior !== $expectedPreviousHash) {
                $corruptedAt = $log->id;
                break;
            }

            $payload = implode('|', [
                $log->hash_anterior,
                $log->utilizador_id ?? 'SISTEMA',
                $log->ip_origem,
                $log->rota_acao,
                $log->tabela_afetada,
                $log->registo_id,
                $log->dados_novos ? json_encode($log->dados_novos, JSON_UNESCAPED_UNICODE) : '',
                Carbon::parse($log->created_at)->format('Y-m-d H:i:s'),
            ]);

            $recalculatedHash = hash('sha256', $payload);

            if ($recalculatedHash !== $log->hash_atual) {
                $corruptedAt = $log->id;
                break;
            }

            $expectedPreviousHash = $log->hash_atual;
        }

        return [
            'is_valid' => $corruptedAt === null,
            'total_blocks' => $logs->count(),
            'corrupted_block_id' => $corruptedAt,
            'last_valid_hash' => $expectedPreviousHash,
        ];
    }
}
