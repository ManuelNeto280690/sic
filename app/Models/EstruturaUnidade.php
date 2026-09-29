<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstruturaUnidade extends Model
{
    use HasUuidV7;

    protected $table = 'estrutura_unidades';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'nome',
        'sigla',
        'nivel',
        'unidade_superior_id',
        'provincia_id',
        'municipio_id',
        'ativo',
        'created_at',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function unidadeSuperior(): BelongsTo
    {
        return $this->belongsTo(EstruturaUnidade::class, 'unidade_superior_id');
    }

    public function subunidades(): HasMany
    {
        return $this->hasMany(EstruturaUnidade::class, 'unidade_superior_id');
    }

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    public function utilizadores(): HasMany
    {
        return $this->hasMany(Utilizador::class, 'unidade_id');
    }
}
