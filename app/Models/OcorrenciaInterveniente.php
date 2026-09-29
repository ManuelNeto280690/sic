<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OcorrenciaInterveniente extends Model
{
    use HasUuidV7;

    protected $table = 'ocorrencia_intervenientes';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'ocorrencia_id',
        'individuo_id',
        'papel',
        'nome_identificativo',
        'contacto_telefone',
        'declaracoes_resumo',
        'created_at',
    ];

    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class, 'ocorrencia_id');
    }

    public function individuo(): BelongsTo
    {
        return $this->belongsTo(CadastroIndividuo::class, 'individuo_id');
    }
}
