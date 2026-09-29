<?php

namespace App\Domain\Processos\Services;

use App\Models\ProcessoCrime;
use App\Models\Provincia;
use Carbon\Carbon;

class ProcessoNumberGenerator
{
    /**
     * Gera número oficial de processo-crime no formato: PROC/{ANO}/{SIGLA_PROV}/{SEQ_5_DIGITOS}
     * Exemplo: PROC/2026/BGU/00182
     */
    public static function generate(string $provinciaId): string
    {
        $provincia = Provincia::findOrFail($provinciaId);
        $sigla = strtoupper(substr($provincia->codigo_iso ?: $provincia->nome, 0, 3));
        $ano = Carbon::now()->year;

        $prefix = "PROC/{$ano}/{$sigla}/";
        $count = ProcessoCrime::where('numero_processo', 'LIKE', "{$prefix}%")->count() + 1;
        $seq = str_pad((string) $count, 5, '0', STR_PAD_LEFT);

        return "{$prefix}{$seq}";
    }
}
