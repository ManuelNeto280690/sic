<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Detencao extends Model
{
    use HasUuidV7;

    protected $table = 'detencoes';

    protected $fillable = [
        'id',
        'individuo_id',
        'processo_id',
        'data_hora_detencao',
        'limite_legal_48h',
        'local_detencao',
        'auto_detencao_path',
        'efetivo_captor_nip',
        'estado_custodia',
        'motivo_legal',
        'observacoes_tramitacao',
    ];

    protected $casts = [
        'data_hora_detencao' => 'datetime',
        'limite_legal_48h' => 'datetime',
    ];

    public function individuo(): BelongsTo
    {
        return $this->belongsTo(CadastroIndividuo::class, 'individuo_id');
    }

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }

    public function bens(): HasMany
    {
        return $this->hasMany(BemCustodia::class, 'detencao_id');
    }

    /**
     * Calcula as horas restantes para o limite constitucional de 48 horas.
     */
    public function getHorasRestantesAttribute(): float
    {
        return round(Carbon::now()->diffInMinutes($this->limite_legal_48h, false) / 60, 1);
    }
}
