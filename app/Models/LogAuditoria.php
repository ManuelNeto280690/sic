<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAuditoria extends Model
{
    protected $table = 'logs_auditoria';
    public $timestamps = false;

    protected $fillable = [
        'utilizador_id',
        'ip_origem',
        'rota_acao',
        'tabela_afetada',
        'registo_id',
        'dados_anteriores',
        'dados_novos',
        'hash_anterior',
        'hash_atual',
        'created_at',
    ];

    protected $casts = [
        'dados_anteriores' => 'array',
        'dados_novos' => 'array',
        'created_at' => 'datetime',
    ];

    public function utilizador(): BelongsTo
    {
        return $this->belongsTo(Utilizador::class, 'utilizador_id');
    }
}
