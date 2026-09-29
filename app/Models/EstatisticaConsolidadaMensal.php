<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EstatisticaConsolidadaMensal extends Model
{
    use HasUuidV7;

    protected $table = 'estatisticas_consolidadas_mensais';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'provincia_id',
        'ano',
        'mes',
        'total_ocorrencias',
        'total_processos_instaurados',
        'total_detencoes',
        'total_remetidos_mp',
        'crimes_patrimonio',
        'crimes_pessoas',
        'crimes_economicos',
        'crimes_estupefacientes',
        'cibercrimes',
    ];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }
}
