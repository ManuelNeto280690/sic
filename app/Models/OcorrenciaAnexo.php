<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OcorrenciaAnexo extends Model
{
    use HasUuidV7;

    protected $table = 'ocorrencia_anexos';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'ocorrencia_id',
        'tipo_ficheiro',
        'storage_path',
        'nome_original',
        'tamanho_bytes',
        'hash_sha256',
        'enviado_por_id',
        'created_at',
    ];

    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class, 'ocorrencia_id');
    }

    public function enviadoPor(): BelongsTo
    {
        return $this->belongsTo(Utilizador::class, 'enviado_por_id');
    }
}
