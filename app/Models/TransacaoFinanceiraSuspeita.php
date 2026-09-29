<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransacaoFinanceiraSuspeita extends Model
{
    use HasUuidV7;

    protected $table = 'transacoes_financeiras_suspeitas';

    protected $fillable = [
        'id',
        'conta_id',
        'processo_id',
        'data_hora_movimento',
        'valor_kz',
        'moeda',
        'natureza',
        'tipo_operacao',
        'iban_contraparte',
        'nome_contraparte',
        'alerta_padrao_lavagem',
        'descricao_extrato',
    ];

    protected $casts = [
        'data_hora_movimento' => 'datetime',
        'valor_kz' => 'decimal:2',
    ];

    public function conta(): BelongsTo
    {
        return $this->belongsTo(InvestigacaoFinanceiraConta::class, 'conta_id');
    }

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }
}
