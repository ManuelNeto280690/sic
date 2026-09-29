<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipio extends Model
{
    use HasUuidV7;

    protected $table = 'geografia_municipios';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'provincia_id',
        'nome',
        'codigo_geocodigo',
    ];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }

    public function unidades(): HasMany
    {
        return $this->hasMany(EstruturaUnidade::class, 'municipio_id');
    }

    public function ocorrencias(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'municipio_id');
    }
}
