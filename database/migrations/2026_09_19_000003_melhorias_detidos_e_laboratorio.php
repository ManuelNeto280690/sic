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
        Schema::table('pericias_laboratorio', function (Blueprint $table) {
            $table->text('metodologia')->nullable()->after('descricao_vestigio');
            $table->longText('conclusoes_tecnicas')->nullable()->after('metodologia');
        });

        Schema::table('detencoes', function (Blueprint $table) {
            $table->text('observacoes_tramitacao')->nullable()->after('motivo_legal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pericias_laboratorio', function (Blueprint $table) {
            $table->dropColumn(['metodologia', 'conclusoes_tecnicas']);
        });

        Schema::table('detencoes', function (Blueprint $table) {
            $table->dropColumn('observacoes_tramitacao');
        });
    }
};
