<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Utilizador extends Model implements AuthenticatableContract
{
    use Authenticatable, HasUuidV7, Notifiable;

    protected $table = 'utilizadores';

    protected $fillable = [
        'id',
        'nip',
        'nome_completo',
        'email',
        'password',
        'perfil',
        'unidade_id',
        'posto_fronteira',
        'requer_2fa',
        'two_factor_secret',
        'ativo',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'remember_token',
    ];

    protected $casts = [
        'requer_2fa' => 'boolean',
        'ativo' => 'boolean',
        'password' => 'hashed',
    ];

    public function unidade(): BelongsTo
    {
        return $this->belongsTo(EstruturaUnidade::class, 'unidade_id');
    }

    public function ocorrenciasRegistadas(): HasMany
    {
        return $this->hasMany(Ocorrencia::class, 'utilizador_registo_id');
    }

    public function processosComoTitular(): HasMany
    {
        return $this->hasMany(ProcessoCrime::class, 'investigador_titular_id');
    }

    public function diligencias(): HasMany
    {
        return $this->hasMany(ProcessoDiligencia::class, 'responsavel_id');
    }

    public function isCentral(): bool
    {
        return in_array($this->perfil, ['ADMIN_SISTEMA', 'DIRETOR_NACIONAL']);
    }

    public function isSme(): bool
    {
        return $this->perfil === 'OPERADOR_SME';
    }

    public function isPgr(): bool
    {
        return $this->perfil === 'MAGISTRADO_PGR';
    }

    public function isInvestigador(): bool
    {
        return in_array($this->perfil, ['INVESTIGADOR', 'CHEFE_DEPARTAMENTO', 'COMANDANTE_PROVINCIAL', 'OFICIAL_SECRETARIA']);
    }

    public function temPermissao(string $modulo, string $acao): bool
    {
        if ($this->perfil === 'ADMIN_SISTEMA') {
            return true;
        }

        $rp = RolePermissao::where('perfil', $this->perfil)->where('modulo', $modulo)->first();
        if (!$rp || !isset($rp->permissoes[$acao])) {
            return false;
        }

        return (bool) $rp->permissoes[$acao];
    }

    public function podeVerTodasProvincias(): bool
    {
        if ($this->isCentral() || $this->perfil === 'ADMIN_SISTEMA' || $this->perfil === 'DIRETOR_NACIONAL') {
            return true;
        }

        return $this->temPermissao('ocorrencias', 'ver_todas_provincias');
    }

    public function podeEditarOcorrencia(Ocorrencia $ocorrencia): bool
    {
        // Administrador do sistema e Diretor Nacional têm autoridade plena
        if ($this->perfil === 'ADMIN_SISTEMA' || $this->perfil === 'DIRETOR_NACIONAL') {
            return true;
        }

        // Verifica a permissão de edição no módulo de ocorrências
        $rp = RolePermissao::where('perfil', $this->perfil)->where('modulo', 'ocorrencias')->first();
        if ($rp && isset($rp->permissoes['editar'])) {
            if (!$rp->permissoes['editar']) {
                return false;
            }
        } else {
            // Caso não esteja definida na matriz, habilita por defeito para perfis operacionais de investigação
            if (!$this->isInvestigador()) {
                return false;
            }
        }

        // Regra restrita: apenas pode editar o que é DELE (registado pelo próprio)
        return $ocorrencia->utilizador_registo_id === $this->id;
    }
}

