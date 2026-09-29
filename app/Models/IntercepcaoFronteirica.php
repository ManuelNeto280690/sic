<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntercepcaoFronteirica extends Model
{
    use HasUuidV7;

    protected $table = 'intercepcoes_fronteiricas';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'mandado_id',
        'posto_fronteira',
        'sentido',
        'operador_sme_nip',
        'detalhes_acao',
        'created_at',
    ];

    public function mandado(): BelongsTo
    {
        return $this->belongsTo(MandadoSinalizacao::class, 'mandado_id');
    }
}
