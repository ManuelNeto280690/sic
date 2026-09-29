<?php

namespace App\Domain\Custodia\Services;

use Carbon\Carbon;
use Illuminate\Support\Str;

class LacreNumberGenerator
{
    /**
     * Gera código oficial de lacre de segurança inviolável: LACRE-SIC-{ANO}-{HASH8}
     * Exemplo: LACRE-SIC-2026-9FA31B82
     */
    public static function generate(): string
    {
        $ano = Carbon::now()->year;
        $hash = strtoupper(substr(md5(Str::random(16) . microtime()), 0, 8));
        return "LACRE-SIC-{$ano}-{$hash}";
    }
}
