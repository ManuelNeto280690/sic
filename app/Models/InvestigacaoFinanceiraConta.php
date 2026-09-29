<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvestigacaoFinanceiraConta extends Model
{
    use HasUuidV7;

    protected $table = 'investigacoes_financeiras_contas';

    protected $fillable = [
        'id',
        'processo_id',
        'banco_comercial',
        'titular_nome',
        'titular_nif',
        'iban_completo',
        'numero_conta',
        'mandado_quebra_sigilo',
        'saldo_contabilistico_kz',
        'total_creditos_apurados_kz',
        'total_debitos_apurados_kz',
        'grau_suspeicao',
        'congelamento_cautelar_ativo',
        'numero_auto_bloqueio_senra',
        'data_hora_bloqueio',
        'fundamentacao_financeira',
    ];

    protected $casts = [
        'saldo_contabilistico_kz' => 'decimal:2',
        'total_creditos_apurados_kz' => 'decimal:2',
        'total_debitos_apurados_kz' => 'decimal:2',
        'congelamento_cautelar_ativo' => 'boolean',
        'data_hora_bloqueio' => 'datetime',
    ];

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }

    public function transacoes(): HasMany
    {
        return $this->hasMany(TransacaoFinanceiraSuspeita::class, 'conta_id')->orderBy('data_hora_movimento', 'desc');
    }
}
