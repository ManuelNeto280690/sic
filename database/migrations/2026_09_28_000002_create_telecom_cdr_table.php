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
        Schema::create('telecom_cdr_registos', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('processo_id', 36);
            $table->enum('operadora', ['UNITEL', 'AFRICELL', 'MOVICEL']);
            $table->string('numero_alvo_origem', 30);
            $table->string('numero_interlocutor_destino', 30);
            $table->string('imei_equipamento', 25)->nullable();
            $table->string('imsi_sim_card', 25)->nullable();
            $table->enum('tipo_evento', ['CHAMADA_VOZ', 'SMS_TEXTO', 'DADOS_IP', 'MMS'])->default('CHAMADA_VOZ');
            $table->dateTime('data_hora_evento');
            $table->unsignedInteger('duracao_segundos')->default(0);
            $table->string('antena_erb_nome', 120);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->unsignedSmallInteger('azimute_graus')->default(0);
            $table->string('mandado_judicial_referencia', 80);
            $table->boolean('alvo_investigado_principal')->default(false);
            $table->text('notas_analise_inteligencia')->nullable();
            $table->timestamps();

            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('cascade');
            $table->index(['processo_id', 'numero_alvo_origem']);
            $table->index(['data_hora_evento']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telecom_cdr_registos');
    }
};
