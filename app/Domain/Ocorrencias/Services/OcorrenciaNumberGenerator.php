<?php

namespace App\Domain\Ocorrencias\Services;

use App\Models\Ocorrencia;
use App\Models\Provincia;
use Carbon\Carbon;

class OcorrenciaNumberGenerator
{
    /**
     * Gera número oficial de ocorrência no formato: OC/{ANO}/{SIGLA_PROV}/{SEQ_5_DIGITOS}
     * Exemplo: OC/2026/LUA/00041
     */
    public static function generate(string $provinciaId): string
    {
        $provincia = Provincia::findOrFail($provinciaId);
        $sigla = strtoupper(substr($provincia->codigo_iso ?: $provincia->nome, 0, 3));
        $ano = Carbon::now()->year;

        $prefix = "OC/{$ano}/{$sigla}/";
        $count = Ocorrencia::where('numero_ocorrencia', 'LIKE', "{$prefix}%")->count() + 1;
        $seq = str_pad((string) $count, 5, '0', STR_PAD_LEFT);

        return "{$prefix}{$seq}";
    }
}
