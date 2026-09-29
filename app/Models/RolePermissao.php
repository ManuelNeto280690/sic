<?php

namespace App\Models;

use App\Traits\HasUuidV7;
use Illuminate\Database\Eloquent\Model;

class RolePermissao extends Model
{
    use HasUuidV7;

    protected $table = 'roles_permissoes';

    protected $fillable = [
        'id',
        'perfil',
        'modulo',
        'permissoes',
    ];

    protected $casts = [
        'permissoes' => 'array',
    ];
}
