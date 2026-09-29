<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelecomCdrRegisto extends Model
{
    use HasUuidV7;

    protected $table = 'telecom_cdr_registos';

    protected $fillable = [
        'id',
        'processo_id',
        'operadora',
        'numero_alvo_origem',
        'numero_interlocutor_destino',
        'imei_equipamento',
        'imsi_sim_card',
        'tipo_evento',
        'data_hora_evento',
        'duracao_segundos',
        'antena_erb_nome',
        'latitude',
        'longitude',
        'azimute_graus',
        'mandado_judicial_referencia',
        'alvo_investigado_principal',
        'notas_analise_inteligencia',
    ];

    protected $casts = [
        'data_hora_evento' => 'datetime',
        'duracao_segundos' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'azimute_graus' => 'integer',
        'alvo_investigado_principal' => 'boolean',
    ];

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }
}
