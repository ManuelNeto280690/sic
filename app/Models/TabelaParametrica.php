<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;

class TabelaParametrica extends Model
{
    use HasUuidV7;

    protected $table = 'tabelas_parametricas';

    protected $fillable = [
        'id',
        'categoria',
        'codigo',
        'nome',
        'descricao',
        'metadados',
        'ativo',
        'ordem',
    ];

    protected $casts = [
        'metadados' => 'array',
        'ativo' => 'boolean',
        'ordem' => 'integer',
    ];

    public function scopeAtivos($query)
    {
        return $query->where('ativo', true)->orderBy('ordem')->orderBy('nome');
    }

    public function scopePorCategoria($query, string $categoria)
    {
        return $query->where('categoria', $categoria)->orderBy('ordem')->orderBy('nome');
    }
}
