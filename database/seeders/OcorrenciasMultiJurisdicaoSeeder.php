<?php

namespace Database\Seeders;

use App\Models\EstruturaUnidade;
use App\Models\Municipio;
use App\Models\Ocorrencia;
use App\Models\OcorrenciaInterveniente;
use App\Models\Provincia;
use App\Models\Utilizador;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OcorrenciasMultiJurisdicaoSeeder extends Seeder
{
    public function run(): void
    {
        $provLuanda = Provincia::where('nome', 'Luanda')->first();
        $munLuanda = Municipio::where('provincia_id', $provLuanda?->id)->first();
        $dpLua = EstruturaUnidade::where('sigla', 'DPSIC-LUA')->first();

        $provBenguela = Provincia::where('nome', 'Benguela')->first();
        $munBenguela = Municipio::where('provincia_id', $provBenguela?->id)->first();
        $dpBgu = EstruturaUnidade::where('sigla', 'DPSIC-BGU')->first();

        $provHuambo = Provincia::where('nome', 'Huambo')->first();
        $munHuambo = Municipio::where('provincia_id', $provHuambo?->id)->first();

        $admin = Utilizador::where('email', 'admin@sic.gov.ao')->first();
        $cmdBgu = Utilizador::where('email', 'comando.benguela@sic.gov.ao')->first();
        $dirNac = Utilizador::where('email', 'diretor.nacional@sic.gov.ao')->first();

        // 1. Ocorrência em Luanda registada pelo Administrador (para testar que o Investigador de Luanda NÃO pode editar esta)
        if ($provLuanda && $admin) {
            $ocLuaAdmin = Ocorrencia::firstOrCreate(
                ['numero_ocorrencia' => 'OC/2026/LUA/00088'],
                [
                    'id' => (string) Str::uuid7(),
                    'tipo_participacao' => 'PRESENCIAL',
                    'origem_pop' => false,
                    'descricao_facto_html' => '<p>Fraude bancária eletrónica e burla qualificada através de transferência não autorizada via canais de internet banking, lesando entidade comercial em Luanda.</p>',
                    'data_hora_facto' => Carbon::now()->subHours(14),
                    'provincia_id' => $provLuanda->id,
                    'municipio_id' => $munLuanda?->id,
                    'local_detalhado' => 'Rua Rainha Ginga, Edifício De Beers, Maianga, Luanda',
                    'coordenadas' => DB::raw("Point(13.2350, -8.8150)"),
                    'classificacao_codigo' => 'CP-ART-419 (Burla)',
                    'unidade_registo_id' => $admin->unidade_id,
                    'utilizador_registo_id' => $admin->id,
                    'estado' => 'EM_TRIAGEM',
                ]
            );

            OcorrenciaInterveniente::firstOrCreate(
                ['ocorrencia_id' => $ocLuaAdmin->id, 'nome_identificativo' => 'Sociedade Comercial AngoDistribuição Lda'],
                [
                    'id' => (string) Str::uuid7(),
                    'papel' => 'VITIMA',
                    'contacto_telefone' => '+244 923 111 222',
                    'declaracoes_resumo' => 'Comunicação bancária de transferências suspeitas fracionadas.',
                ]
            );
        }

        // 2. Ocorrência em Benguela registada pelo Comandante Mateus Fernandes (Benguela)
        if ($provBenguela && $cmdBgu) {
            $ocBgu = Ocorrencia::firstOrCreate(
                ['numero_ocorrencia' => 'OC/2026/BGU/00015'],
                [
                    'id' => (string) Str::uuid7(),
                    'tipo_participacao' => 'EXPEDIENTE_POP',
                    'origem_pop' => true,
                    'descricao_facto_html' => '<p>Confronto armado entre grupos rivais na zona portuária do Lobito, resultando em homicídio de um cidadão e apreensão de armas de fabrico artesanal.</p>',
                    'data_hora_facto' => Carbon::now()->subDays(1),
                    'provincia_id' => $provBenguela->id,
                    'municipio_id' => $munBenguela?->id,
                    'local_detalhado' => 'Bairro da Caponte, Lobito, Benguela',
                    'coordenadas' => DB::raw("Point(13.5420, -12.3580)"),
                    'classificacao_codigo' => 'CP-ART-142 (Homicídio)',
                    'unidade_registo_id' => $cmdBgu->unidade_id,
                    'utilizador_registo_id' => $cmdBgu->id,
                    'estado' => 'REGISTADA',
                ]
            );

            OcorrenciaInterveniente::firstOrCreate(
                ['ocorrencia_id' => $ocBgu->id, 'nome_identificativo' => 'Domingos Faustino Kimbemba'],
                [
                    'id' => (string) Str::uuid7(),
                    'papel' => 'VITIMA',
                    'contacto_telefone' => '+244 914 555 777',
                    'declaracoes_resumo' => 'Óbito confirmado pelo corpo clínico hospitalar do Lobito.',
                ]
            );
        }

        // 3. Ocorrência no Huambo registada pelo Diretor Nacional
        if ($provHuambo && $dirNac) {
            $ocHua = Ocorrencia::firstOrCreate(
                ['numero_ocorrencia' => 'OC/2026/HUA/00007'],
                [
                    'id' => (string) Str::uuid7(),
                    'tipo_participacao' => 'DENUNCIA_ANONIMA',
                    'origem_pop' => false,
                    'descricao_facto_html' => '<p>Contrabando e tráfico de combustível e mercadorias contrafeitas intercetado no posto de controlo rodoviário da Caála.</p>',
                    'data_hora_facto' => Carbon::now()->subDays(3),
                    'provincia_id' => $provHuambo->id,
                    'municipio_id' => $munHuambo?->id,
                    'local_detalhado' => 'EN-260, Cruzamento de Caála, Huambo',
                    'coordenadas' => DB::raw("Point(15.7330, -12.7750)"),
                    'classificacao_codigo' => 'CP-ART-388 (Furto)',
                    'unidade_registo_id' => $dirNac->unidade_id,
                    'utilizador_registo_id' => $dirNac->id,
                    'estado' => 'EM_TRIAGEM',
                ]
            );
        }
    }
}
