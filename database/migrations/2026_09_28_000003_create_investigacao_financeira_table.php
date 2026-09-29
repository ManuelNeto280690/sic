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
        Schema::dropIfExists('transacoes_financeiras_suspeitas');
        Schema::dropIfExists('investigacoes_financeiras_contas');

        // 1. Contas Bancárias e Alvos sob Quebra de Sigilo
        Schema::create('investigacoes_financeiras_contas', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('processo_id', 36);
            $table->string('banco_comercial', 80); // BAI, BFA, BIC, ATLANTICO, STANDARD_BANK, BNI, SOL
            $table->string('titular_nome', 150);
            $table->string('titular_nif', 30);
            $table->string('iban_completo', 50)->unique();
            $table->string('numero_conta', 30);
            $table->string('mandado_quebra_sigilo', 80);
            $table->decimal('saldo_contabilistico_kz', 15, 2)->default(0);
            $table->decimal('total_creditos_apurados_kz', 15, 2)->default(0);
            $table->decimal('total_debitos_apurados_kz', 15, 2)->default(0);
            $table->enum('grau_suspeicao', ['CRITICO', 'ALTO', 'MEDIO', 'NORMAL'])->default('MEDIO');
            $table->boolean('congelamento_cautelar_ativo')->default(false);
            $table->string('numero_auto_bloqueio_senra', 80)->nullable();
            $table->dateTime('data_hora_bloqueio')->nullable();
            $table->text('fundamentacao_financeira')->nullable();
            $table->timestamps();

            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('cascade');
        });

        // 2. Transações Financeiras Suspeitas (Follow the Money)
        Schema::create('transacoes_financeiras_suspeitas', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('conta_id', 36);
            $table->char('processo_id', 36);
            $table->dateTime('data_hora_movimento');
            $table->decimal('valor_kz', 15, 2);
            $table->string('moeda', 10)->default('AOA');
            $table->enum('natureza', ['CREDITO', 'DEBITO']);
            $table->enum('tipo_operacao', [
                'DEPOSITO_NUMERARIO',
                'TRANSFERENCIA_IBAN',
                'LEVANTAMENTO_BALCAO',
                'OPERACAO_CAMBIAL_DIVISAS',
                'PAGAMENTO_TPA'
            ]);
            $table->string('iban_contraparte', 50)->nullable();
            $table->string('nome_contraparte', 150)->nullable();
            $table->enum('alerta_padrao_lavagem', [
                'SMURFING_FRACIONAMENTO',
                'CONTA_PASSAGEM_TRANSBORDO',
                'TESTA_DE_FERRO_LARANJA',
                'DESVIO_FUNDO_PUBLICO',
                'REMESSA_EXTERIOR_ILICITA',
                'TRANSACAO_COMPATIVEL'
            ])->default('TRANSACAO_COMPATIVEL');
            $table->text('descricao_extrato');
            $table->timestamps();

            $table->foreign('conta_id')->references('id')->on('investigacoes_financeiras_contas')->onDelete('cascade');
            $table->foreign('processo_id')->references('id')->on('processos_crime')->onDelete('cascade');
            $table->index(['processo_id', 'data_hora_movimento'], 'idx_fin_proc_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transacoes_financeiras_suspeitas');
        Schema::dropIfExists('investigacoes_financeiras_contas');
    }
};
