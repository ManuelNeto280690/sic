<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProcessoCrime extends Model
{
    use HasUuidV7;

    protected $table = 'processos_crime';

    protected $fillable = [
        'id',
        'numero_processo',
        'ocorrencia_origem_id',
        'provincia_id',
        'unidade_competente_id',
        'investigador_titular_id',
        'tipologia_legal',
        'segredo_justica',
        'data_abertura',
        'data_limite_instrucao',
        'estado',
        'data_remessa_mp',
        'magistrado_pgr_responsavel',
    ];

    protected $casts = [
        'segredo_justica' => 'boolean',
        'data_abertura' => 'date',
        'data_limite_instrucao' => 'date',
        'data_remessa_mp' => 'datetime',
    ];

    public function ocorrencia(): BelongsTo
    {
        return $this->belongsTo(Ocorrencia::class, 'ocorrencia_origem_id');
    }

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }

    public function unidade(): BelongsTo
    {
        return $this->belongsTo(EstruturaUnidade::class, 'unidade_competente_id');
    }

    public function investigador(): BelongsTo
    {
        return $this->belongsTo(Utilizador::class, 'investigador_titular_id');
    }

    public function diligencias(): HasMany
    {
        return $this->hasMany(ProcessoDiligencia::class, 'processo_id')->orderBy('data_realizacao', 'desc');
    }

    public function detencoes(): HasMany
    {
        return $this->hasMany(Detencao::class, 'processo_id');
    }

    public function bens(): HasMany
    {
        return $this->hasMany(BemCustodia::class, 'processo_id');
    }

    public function pericias(): HasMany
    {
        return $this->hasMany(PericiaLaboratorio::class, 'processo_id');
    }

    public function mandados(): HasMany
    {
        return $this->hasMany(MandadoSinalizacao::class, 'processo_id');
    }

    public function audienciasGarantias(): HasMany
    {
        return $this->hasMany(JuizGarantiasAudiencia::class, 'processo_id')->orderBy('data_hora_audiencia', 'desc');
    }

    public function registosTelecom(): HasMany
    {
        return $this->hasMany(TelecomCdrRegisto::class, 'processo_id')->orderBy('data_hora_evento', 'desc');
    }

    public function contasFinanceiras(): HasMany
    {
        return $this->hasMany(InvestigacaoFinanceiraConta::class, 'processo_id')->orderBy('saldo_contabilistico_kz', 'desc');
    }

    public function transacoesFinanceiras(): HasMany
    {
        return $this->hasMany(TransacaoFinanceiraSuspeita::class, 'processo_id')->orderBy('data_hora_movimento', 'desc');
    }
}
