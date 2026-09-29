<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provincia extends Model
{
    use HasUuidV7;

    protected $table = 'geografia_provincias';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'codigo_iso',
        'nome',
    ];

    public function municipios(): HasMany
    {
        return $this->hasMany(Municipio::class, 'provincia_id');
    }

    public function unidades(): HasMany
    {
        return $this->hasMany(EstruturaUnidade::class, 'provincia_id');
    }

    public function ocorrencias(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'provincia_id');
    }

    public function processos(): HasMany
    {
        return $this->hasMany(ProcessoCrime::class, 'provincia_id');
    }
}
