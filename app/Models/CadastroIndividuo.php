<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CadastroIndividuo extends Model
{
    use HasUuidV7;

    protected $table = 'cadastro_individuos';

    protected $fillable = [
        'id',
        'numero_bi',
        'passaporte',
        'nome_completo',
        'nome_pai',
        'nome_mae',
        'alcunhas',
        'data_nascimento',
        'genero',
        'nacionalidade',
        'sinais_particulares',
        'foto_storage_path',
        'metadados_biometricos',
        'perigoso',
        'interdicao_saida',
    ];

    protected $casts = [
        'alcunhas' => 'array',
        'metadados_biometricos' => 'array',
        'perigoso' => 'boolean',
        'interdicao_saida' => 'boolean',
        'data_nascimento' => 'date',
    ];

    public function detencoes(): HasMany
    {
        return $this->hasMany(Detencao::class, 'individuo_id');
    }

    public function mandados(): HasMany
    {
        return $this->hasMany(MandadoSinalizacao::class, 'individuo_id');
    }

    public function intervencoes(): HasMany
    {
        return $this->hasMany(OcorrenciaInterveniente::class, 'individuo_id');
    }

    public function mandadosAtivos(): HasMany
    {
        return $this->hasMany(MandadoSinalizacao::class, 'individuo_id')->where('estado', 'ATIVO');
    }
}
