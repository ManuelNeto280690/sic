<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MandadoSinalizacao extends Model
{
    use HasUuidV7;

    protected $table = 'mandados_sinalizacoes';

    protected $fillable = [
        'id',
        'numero_mandado_oficial',
        'processo_id',
        'individuo_id',
        'tipo',
        'orgao_emitente',
        'magistrado_nome',
        'fundamentacao_legal',
        'despacho_assinado_path',
        'data_emissao',
        'data_validade',
        'alerta_sme_ativo',
        'interpol_red_notice',
        'estado',
    ];

    protected $casts = [
        'data_emissao' => 'date',
        'data_validade' => 'date',
        'alerta_sme_ativo' => 'boolean',
        'interpol_red_notice' => 'boolean',
    ];

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }

    public function individuo(): BelongsTo
    {
        return $this->belongsTo(CadastroIndividuo::class, 'individuo_id');
    }

    public function intercepcoes(): HasMany
    {
        return $this->hasMany(IntercepcaoFronteirica::class, 'mandado_id');
    }
}
