<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JuizGarantiasAudiencia extends Model
{
    use HasUuidV7;

    protected $table = 'juiz_garantias_audiencias';

    protected $fillable = [
        'id',
        'processo_id',
        'detencao_id',
        'numero_auto_audiencia',
        'tipo_ato',
        'magistrado_juiz_nome',
        'tribunal_comarca',
        'data_hora_audiencia',
        'horas_decorridas_detencao',
        'dentro_prazo_48h',
        'decisao_judicial',
        'valor_caucao_kz',
        'fundamentacao_despacho',
        'oficial_diligencia_nip',
        'defensor_advogado_nome',
        'auto_assinado_path',
    ];

    protected $casts = [
        'data_hora_audiencia' => 'datetime',
        'dentro_prazo_48h' => 'boolean',
        'horas_decorridas_detencao' => 'integer',
        'valor_caucao_kz' => 'decimal:2',
    ];

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }

    public function detencao(): BelongsTo
    {
        return $this->belongsTo(Detencao::class, 'detencao_id');
    }
}
