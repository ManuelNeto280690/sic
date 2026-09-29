<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessoDiligencia extends Model
{
    use HasUuidV7;

    protected $table = 'processo_diligencias';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'processo_id',
        'tipo',
        'descricao_detalhada',
        'resultado',
        'data_realizacao',
        'responsavel_id',
        'anexo_auto_path',
        'created_at',
    ];

    protected $casts = [
        'data_realizacao' => 'datetime',
    ];

    public function processo(): BelongsTo
    {
        return $this->belongsTo(ProcessoCrime::class, 'processo_id');
    }

    public function responsavel(): BelongsTo
    {
        return $this->belongsTo(Utilizador::class, 'responsavel_id');
    }
}
