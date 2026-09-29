<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('juiz_garantias_audiencias', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('processo_id', 36);
            $table->char('detencao_id', 36)->nullable();
            $table->string('numero_auto_audiencia', 80)->unique();
            $table->enum('tipo_ato', [
                'PRIMEIRO_INTERROGATORIO_JUDICIAL',
                'VALIDACAO_BUSCA_DOMICILIARIA',
                'QUEBRA_SIGILO_BANCARIO_TELEFONICO',
                'APRECIACAO_HABEAS_CORPUS'
            ])->default('PRIMEIRO_INTERROGATORIO_JUDICIAL');
            $table->string('magistrado_juiz_nome', 150);
            $table->string('tribunal_comarca', 150);
            $table->dateTime('data_hora_audiencia');
            $table->unsignedInteger('horas_decorridas_detencao')->default(0);
            $table->boolean('dentro_prazo_48h')->default(true);
            $table->enum('decisao_judicial', [
                'MANUTENCAO_PRISAO_PREVENTIVA',
                'TERMO_IDENTIDADE_RESIDENCIA',
                'LIBERDADE_PROVISORIA_CAUCAO',
                'INTERDICAO_SAIDA',
                'RELAXAMENTO_PRISAO_ILEGAL'
            ]);
            $table->decimal('valor_caucao_kz', 15, 2)->nullable();
            $table->longText('fundamentacao_despacho');
            $table->string('oficial_diligencia_nip', 30);
            $table->string('defensor_advogado_nome', 150)->nullable();
            $table->string('auto_assinado_path', 255)->nullable();
            $table->timestamps();

            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('cascade');
            $table->foreign('detencao_id')->references('id')->on('detencoes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('juiz_garantias_audiencias');
    }
};
