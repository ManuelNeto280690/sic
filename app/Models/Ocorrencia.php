<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ocorrencia extends Model
{
    use HasUuidV7;

    protected $table = 'ocorrencias';

    protected $fillable = [
        'id',
        'numero_ocorrencia',
        'tipo_participacao',
        'origem_pop',
        'documento_pop_escaneado_path',
        'descricao_facto_html',
        'data_hora_facto',
        'provincia_id',
        'municipio_id',
        'local_detalhado',
        'coordenadas',
        'classificacao_codigo',
        'unidade_registo_id',
        'utilizador_registo_id',
        'estado',
    ];

    protected $casts = [
        'origem_pop' => 'boolean',
        'data_hora_facto' => 'datetime',
    ];

    /**
     * Garante que o campo espacial (POINT) seja sempre retornado como string segura UTF-8 ou null,
     * prevenindo erro de Malformed UTF-8 no json_encode da API/Inertia.
     */
    public function getCoordenadasAttribute($value)
    {
        if (empty($value)) {
            return null;
        }

        if (is_string($value)) {
            if (mb_check_encoding($value, 'UTF-8') && (str_starts_with($value, 'POINT') || str_starts_with($value, '{'))) {
                return $value;
            }

            if (strlen($value) >= 21) {
                try {
                    $offset = (strlen($value) === 25) ? 4 : 0;
                    $endian = ord($value[$offset]);
                    $unpacked = unpack($endian === 1 ? 'corder/Vtype/dx/dy' : 'corder/Ntype/dx/dy', substr($value, $offset));
                    if (isset($unpacked['x']) && isset($unpacked['y'])) {
                        return sprintf('POINT(%.6f %.6f)', $unpacked['x'], $unpacked['y']);
                    }
                } catch (\Throwable $e) {
                    return null;
                }
            }

            return null;
        }

        return null;
    }

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'provincia_id');
    }

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    public function unidadeRegisto(): BelongsTo
    {
        return $this->belongsTo(EstruturaUnidade::class, 'unidade_registo_id');
    }

    public function utilizadorRegisto(): BelongsTo
    {
        return $this->belongsTo(Utilizador::class, 'utilizador_registo_id');
    }

    public function intervenientes(): HasMany
    {
        return $this->hasMany(OcorrenciaInterveniente::class, 'ocorrencia_id');
    }

    public function anexos(): HasMany
    {
        return $this->hasMany(OcorrenciaAnexo::class, 'ocorrencia_id');
    }

    public function processo(): HasOne
    {
        return $this->hasOne(ProcessoCrime::class, 'ocorrencia_origem_id');
    }
}
