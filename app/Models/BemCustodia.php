<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BemCustodia extends Model
{
    use HasUuidV7;

    protected $table = 'bens_apreendidos_custodia';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'detencao_id',
        'processo_id',
        'numero_lacre_seguranca',
        'descricao_bem',
        'tipo_objeto',
        'local_cofre_deposito',
        'apreendido_por_id',
        'entregue_a_terceiro',
        'created_at',
    ];

    protected $casts = [
        'entregue_a_terceiro' => 'boolean',
    ];

    public function detencao(): BelongsTo
    {
        return $this->belongsTo(Detencao::class, 'detencao_id');
    }

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }

    public function apreendidoPor(): BelongsTo
    {
        return $this->belongsTo(Utilizador::class, 'apreendido_por_id');
    }
}
