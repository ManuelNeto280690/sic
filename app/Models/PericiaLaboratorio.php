<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PericiaLaboratorio extends Model
{
    use HasUuidV7;

    protected $table = 'pericias_laboratorio';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'processo_id',
        'codigo_vestigio_lacre',
        'tipo_pericia',
        'descricao_vestigio',
        'metodologia',
        'conclusoes_tecnicas',
        'estado',
        'perito_responsavel_id',
        'laudo_pericial_path',
        'hash_laudo_sha256',
        'data_requisicao',
        'data_conclusao',
    ];

    protected $casts = [
        'data_requisicao' => 'datetime',
        'data_conclusao' => 'datetime',
    ];

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }

    public function perito(): BelongsTo
    {
        return $this->belongsTo(Utilizador::class, 'perito_responsavel_id');
    }
}
