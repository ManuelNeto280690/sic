<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Configurações Gerais do Sistema (Cabeçalhos, Logótipo, Assinaturas, Fórmulas de Encerramento)
        Schema::create('configuracoes_sistema', function (Blueprint $table) {
            $table->id();
            $table->string('chave', 80)->unique();
            $table->longText('valor')->nullable();
            $table->string('grupo', 50)->default('geral');
            $table->string('descricao', 255)->nullable();
            $table->timestamps();
        });

        // 2. Tabelas Paramétricas e Catálogos Dinâmicos
        // Categoria: tipologia_legal, papel_interveniente, tipo_participacao, especialidade_forense, medida_judicial
        Schema::create('tabelas_parametricas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('categoria', 60)->index();
            $table->string('codigo', 60);
            $table->string('nome', 180);
            $table->text('descricao')->nullable();
            $table->json('metadados')->nullable();
            $table->boolean('ativo')->default(true);
            $table->integer('ordem')->default(0);
            $table->timestamps();

            $table->unique(['categoria', 'codigo']);
        });

        // 3. Matriz de Funções e Permissões do Sistema
        Schema::create('roles_permissoes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('perfil', 60)->index();
            $table->string('modulo', 60);
            $table->json('permissoes');
            $table->timestamps();

            $table->unique(['perfil', 'modulo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles_permissoes');
        Schema::dropIfExists('tabelas_parametricas');
        Schema::dropIfExists('configuracoes_sistema');
    }
};
