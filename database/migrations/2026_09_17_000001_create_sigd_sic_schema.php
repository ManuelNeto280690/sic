<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        // 1. GEOGRAFIA PROVÍNCIAS (21 Províncias de Angola)
        Schema::create('geografia_provincias', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('codigo_iso', 10)->unique();
            $table->string('nome', 60)->unique();
        });

        // 2. GEOGRAFIA MUNICÍPIOS
        Schema::create('geografia_municipios', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('provincia_id', 36);
            $table->string('nome', 100);
            $table->string('codigo_geocodigo', 20)->nullable()->unique();

            $table->foreign('provincia_id')->references('id')->on('geografia_provincias')->onDelete('restrict');
        });

        // 3. ESTRUTURA UNIDADES (Níveis Central, Provincial, Municipal)
        Schema::create('estrutura_unidades', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('nome', 150);
            $table->string('sigla', 30);
            $table->enum('nivel', ['CENTRAL', 'PROVINCIAL', 'MUNICIPAL']);
            $table->char('unidade_superior_id', 36)->nullable();
            $table->char('provincia_id', 36)->nullable();
            $table->char('municipio_id', 36)->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('unidade_superior_id')->references('id')->on('estrutura_unidades')->onDelete('set null');
            $table->foreign('provincia_id')->references('id')->on('geografia_provincias')->onDelete('set null');
            $table->foreign('municipio_id')->references('id')->on('geografia_municipios')->onDelete('set null');
        });

        // 4. GESTÃO DE UTILIZADORES E CONTROLO DE ACESSO (M10 - 9 Perfis)
        Schema::create('utilizadores', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('nip', 30)->unique();
            $table->string('nome_completo', 150);
            $table->string('email', 120)->unique();
            $table->string('password');
            $table->enum('perfil', [
                'ADMIN_SISTEMA',
                'DIRETOR_NACIONAL',
                'COMANDANTE_PROVINCIAL',
                'CHEFE_DEPARTAMENTO',
                'INVESTIGADOR',
                'OFICIAL_SECRETARIA',
                'OPERADOR_SME',
                'MAGISTRADO_PGR',
                'CONSULTA_ESTATISTICA'
            ]);
            $table->char('unidade_id', 36);
            $table->string('posto_fronteira', 100)->nullable();
            $table->boolean('requer_2fa')->default(true);
            $table->string('two_factor_secret')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->foreign('unidade_id')->references('id')->on('estrutura_unidades')->onDelete('restrict');
        });

        // 5. M3: ARQUIVO CENTRAL DE IDENTIFICAÇÃO CRIMINAL (CADASTRO UNIFICADO)
        Schema::create('cadastro_individuos', function (Blueprint $table) use ($driver) {
            $table->char('id', 36)->primary();
            $table->string('numero_bi', 30)->nullable()->unique();
            $table->string('passaporte', 30)->nullable()->index();
            $table->string('nome_completo', 200);
            $table->string('nome_pai', 150)->nullable();
            $table->string('nome_mae', 150)->nullable();
            $table->json('alcunhas')->nullable();
            $table->date('data_nascimento')->nullable();
            $table->enum('genero', ['M', 'F'])->nullable();
            $table->string('nacionalidade', 60)->default('Angolana');
            $table->text('sinais_particulares')->nullable();
            $table->string('foto_storage_path', 255)->nullable();
            $table->json('metadados_biometricos')->nullable();
            $table->boolean('perigoso')->default(false);
            $table->boolean('interdicao_saida')->default(false);
            $table->timestamps();

            if ($driver === 'mysql') {
                $table->fullText('nome_completo');
            }
        });

        // 6. M1: REGISTO DE OCORRÊNCIAS E LIVRO DE AUTOS
        Schema::create('ocorrencias', function (Blueprint $table) use ($driver) {
            $table->char('id', 36)->primary();
            $table->string('numero_ocorrencia', 60)->unique();
            $table->enum('tipo_participacao', ['PRESENCIAL', 'TELEFONICA', 'DENUNCIA_ANONIMA', 'OFICIOSA', 'EXPEDIENTE_POP']);
            $table->boolean('origem_pop')->default(false);
            $table->string('documento_pop_escaneado_path', 255)->nullable();
            $table->longText('descricao_facto_html');
            $table->dateTime('data_hora_facto');
            $table->char('provincia_id', 36);
            $table->char('municipio_id', 36);
            $table->string('local_detalhado', 255);

            if ($driver === 'mysql') {
                $table->geometry('coordenadas', subtype: 'point', srid: 4326)->nullable();
            } else {
                $table->string('coordenadas')->default('POINT(13.2343 -8.8390)');
            }

            $table->string('classificacao_codigo', 30);
            $table->char('unidade_registo_id', 36);
            $table->char('utilizador_registo_id', 36);
            $table->enum('estado', ['REGISTADA', 'EM_TRIAGEM', 'INSTAURADO_PROCESSO', 'ARQUIVADA'])->default('REGISTADA');
            $table->timestamps();

            $table->foreign('provincia_id')->references('id')->on('geografia_provincias')->onDelete('restrict');
            $table->foreign('municipio_id')->references('id')->on('geografia_municipios')->onDelete('restrict');
            $table->foreign('unidade_registo_id')->references('id')->on('estrutura_unidades')->onDelete('restrict');
            $table->foreign('utilizador_registo_id')->references('id')->on('utilizadores')->onDelete('restrict');
        });

        // 7. OCORRÊNCIA INTERVENIENTES
        Schema::create('ocorrencia_intervenientes', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('ocorrencia_id', 36);
            $table->char('individuo_id', 36)->nullable();
            $table->enum('papel', ['VITIMA', 'SUSPEITO', 'TESTEMUNHA', 'DENUNCIANTE', 'DECLARANTE']);
            $table->string('nome_identificativo', 200);
            $table->string('contacto_telefone', 40)->nullable();
            $table->longText('declaracoes_resumo')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('ocorrencia_id')->references('id')->on('ocorrencias')->onDelete('cascade');
            $table->foreign('individuo_id')->references('id')->on('cadastro_individuos')->onDelete('set null');
        });

        // 8. OCORRÊNCIA ANEXOS (COM HASH SHA-256)
        Schema::create('ocorrencia_anexos', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('ocorrencia_id', 36);
            $table->string('tipo_ficheiro', 50);
            $table->string('storage_path', 255);
            $table->string('nome_original', 255);
            $table->unsignedBigInteger('tamanho_bytes');
            $table->char('hash_sha256', 64);
            $table->char('enviado_por_id', 36);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('ocorrencia_id')->references('id')->on('ocorrencias')->onDelete('cascade');
            $table->foreign('enviado_por_id')->references('id')->on('utilizadores')->onDelete('restrict');
        });

        // 9. M2: GESTÃO DE PROCESSOS-CRIME (INQUÉRITOS & INSTRUÇÃO)
        Schema::create('processos_crime', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('numero_processo', 60)->unique();
            $table->char('ocorrencia_origem_id', 36)->nullable();
            $table->char('provincia_id', 36);
            $table->char('unidade_competente_id', 36);
            $table->char('investigador_titular_id', 36)->nullable();
            $table->string('tipologia_legal', 100);
            $table->boolean('segredo_justica')->default(true);
            $table->date('data_abertura');
            $table->date('data_limite_instrucao');
            $table->enum('estado', ['EM_INSTRUCAO', 'RELATORIO_CONCLUIDO', 'REMETIDO_AO_MP', 'ACUSADO', 'ARQUIVADO'])->default('EM_INSTRUCAO');
            $table->dateTime('data_remessa_mp')->nullable();
            $table->string('magistrado_pgr_responsavel', 150)->nullable();
            $table->timestamps();

            $table->foreign('ocorrencia_origem_id')->references('id')->on('ocorrencias')->onDelete('set null');
            $table->foreign('provincia_id')->references('id')->on('geografia_provincias')->onDelete('restrict');
            $table->foreign('unidade_competente_id')->references('id')->on('estrutura_unidades')->onDelete('restrict');
            $table->foreign('investigador_titular_id')->references('id')->on('utilizadores')->onDelete('set null');
        });

        // 10. PROCESSO DILIGÊNCIAS
        Schema::create('processo_diligencias', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('processo_id', 36);
            $table->string('tipo', 100);
            $table->longText('descricao_detalhada');
            $table->text('resultado');
            $table->dateTime('data_realizacao');
            $table->char('responsavel_id', 36);
            $table->string('anexo_auto_path', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('cascade');
            $table->foreign('responsavel_id')->references('id')->on('utilizadores')->onDelete('restrict');
        });

        // 11. M4: GESTÃO DE DETIDOS (48H CONSTITUCIONAIS)
        Schema::create('detencoes', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('individuo_id', 36);
            $table->char('processo_id', 36)->nullable();
            $table->dateTime('data_hora_detencao');
            $table->dateTime('limite_legal_48h');
            $table->string('local_detencao', 150);
            $table->string('auto_detencao_path', 255)->nullable();
            $table->string('efetivo_captor_nip', 30);
            $table->enum('estado_custodia', ['CELA_TRANSITORIA', 'APRESENTADO_MP', 'TRANSFERIDO_PRISAO', 'LIBERTADO'])->default('CELA_TRANSITORIA');
            $table->text('motivo_legal');
            $table->timestamps();

            $table->foreign('individuo_id')->references('id')->on('cadastro_individuos')->onDelete('restrict');
            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('set null');
        });

        // 12. BENS APREENDIDOS E CADEIA DE CUSTÓDIA (LACRES INVIOLÁVEIS)
        Schema::create('bens_apreendidos_custodia', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('detencao_id', 36)->nullable();
            $table->char('processo_id', 36);
            $table->string('numero_lacre_seguranca', 100)->unique();
            $table->text('descricao_bem');
            $table->enum('tipo_objeto', ['ARMA_FOGO', 'SUBSTANCIA_ENTORPECENTE', 'VALOR_MONETARIO', 'VIATURA', 'EQUIPAMENTO_ELETRONICO', 'OUTRO']);
            $table->string('local_cofre_deposito', 120);
            $table->char('apreendido_por_id', 36);
            $table->boolean('entregue_a_terceiro')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('detencao_id')->references('id')->on('detencoes')->onDelete('set null');
            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('cascade');
            $table->foreign('apreendido_por_id')->references('id')->on('utilizadores')->onDelete('restrict');
        });

        // 13. M5: PERÍCIAS E LABORATÓRIO FORENSE (CRIMINALÍSTICA)
        Schema::create('pericias_laboratorio', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('processo_id', 36);
            $table->string('codigo_vestigio_lacre', 100)->unique();
            $table->enum('tipo_pericia', ['BALISTICA', 'DACTILOSCOPIA', 'TOXICOLOGIA', 'DOCUMENTOSCOPIA', 'INFORMATICA_FORENSE', 'BIOLOGIA_ADN']);
            $table->text('descricao_vestigio');
            $table->enum('estado', ['REQUISITADA', 'EM_ANALISE', 'CONCLUIDA', 'RECUSADA'])->default('REQUISITADA');
            $table->char('perito_responsavel_id', 36)->nullable();
            $table->string('laudo_pericial_path', 255)->nullable();
            $table->char('hash_laudo_sha256', 64)->nullable();
            $table->timestamp('data_requisicao')->useCurrent();
            $table->dateTime('data_conclusao')->nullable();

            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('cascade');
            $table->foreign('perito_responsavel_id')->references('id')->on('utilizadores')->onDelete('set null');
        });

        // 14. M7/M8/M9: JANELA SME, PGR E DIFUSÃO DE MANDADOS (SIC ↔ SME ↔ PGR ↔ INTERPOL)
        Schema::create('mandados_sinalizacoes', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('numero_mandado_oficial', 80)->unique();
            $table->char('processo_id', 36)->nullable();
            $table->char('individuo_id', 36);
            $table->enum('tipo', ['CAPTURA_NACIONAL', 'INTERDICAO_SAIDA', 'IMPEDIMENTO_ENTRADA', 'CAPTURA_INTERPOL']);
            $table->string('orgao_emitente', 100);
            $table->string('magistrado_nome', 150);
            $table->text('fundamentacao_legal');
            $table->string('despacho_assinado_path', 255)->nullable();
            $table->date('data_emissao');
            $table->date('data_validade');
            $table->boolean('alerta_sme_ativo')->default(true);
            $table->boolean('interpol_red_notice')->default(false);
            $table->enum('estado', ['ATIVO', 'CUMPRIDO', 'REVOGADO', 'CADUCADO'])->default('ATIVO');
            $table->timestamps();

            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('set null');
            $table->foreign('individuo_id')->references('id')->on('cadastro_individuos')->onDelete('restrict');
        });

        // 15. INTERCEPÇÕES FRONTEIRIÇAS (SME TERMINAL)
        Schema::create('intercepcoes_fronteiricas', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('mandado_id', 36);
            $table->string('posto_fronteira', 100);
            $table->enum('sentido', ['ENTRADA', 'SAIDA']);
            $table->string('operador_sme_nip', 30);
            $table->text('detalhes_acao');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('mandado_id')->references('id')->on('mandados_sinalizacoes')->onDelete('restrict');
        });

        // 16. M6: CONSOLIDAÇÃO ESTATÍSTICA MENSAL DAS 21 PROVÍNCIAS
        Schema::create('estatisticas_consolidadas_mensais', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('provincia_id', 36);
            $table->smallInteger('ano');
            $table->tinyInteger('mes');
            $table->unsignedInteger('total_ocorrencias')->default(0);
            $table->unsignedInteger('total_processos_instaurados')->default(0);
            $table->unsignedInteger('total_detencoes')->default(0);
            $table->unsignedInteger('total_remetidos_mp')->default(0);
            $table->unsignedInteger('crimes_patrimonio')->default(0);
            $table->unsignedInteger('crimes_pessoas')->default(0);
            $table->unsignedInteger('crimes_economicos')->default(0);
            $table->unsignedInteger('crimes_estupefacientes')->default(0);
            $table->unsignedInteger('cibercrimes')->default(0);
            $table->timestamp('atualizado_em')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['provincia_id', 'ano', 'mes'], 'uq_estat_mes');
            $table->foreign('provincia_id')->references('id')->on('geografia_provincias')->onDelete('cascade');
        });

        // 17. M10: AUDITORIA IMUTÁVEL COM HASH ENCHAINMENT (APPEND-ONLY)
        Schema::create('logs_auditoria', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('utilizador_id', 36)->nullable();
            $table->string('ip_origem', 45);
            $table->string('rota_acao', 150);
            $table->string('tabela_afetada', 60);
            $table->char('registo_id', 36);
            $table->json('dados_anteriores')->nullable();
            $table->json('dados_novos')->nullable();
            $table->char('hash_anterior', 64);
            $table->char('hash_atual', 64);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['tabela_afetada', 'registo_id'], 'idx_aud_reg');
            $table->foreign('utilizador_id')->references('id')->on('utilizadores')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs_auditoria');
        Schema::dropIfExists('estatisticas_consolidadas_mensais');
        Schema::dropIfExists('intercepcoes_fronteiricas');
        Schema::dropIfExists('mandados_sinalizacoes');
        Schema::dropIfExists('pericias_laboratorio');
        Schema::dropIfExists('bens_apreendidos_custodia');
        Schema::dropIfExists('detencoes');
        Schema::dropIfExists('processo_diligencias');
        Schema::dropIfExists('processos_crime');
        Schema::dropIfExists('ocorrencia_anexos');
        Schema::dropIfExists('ocorrencia_intervenientes');
        Schema::dropIfExists('ocorrencias');
        Schema::dropIfExists('cadastro_individuos');
        Schema::dropIfExists('utilizadores');
        Schema::dropIfExists('estrutura_unidades');
        Schema::dropIfExists('geografia_municipios');
        Schema::dropIfExists('geografia_provincias');
    }
};
