<?php

namespace Database\Seeders;

use App\Models\EstruturaUnidade;
use App\Models\Municipio;
use App\Models\Provincia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EstruturaUnidadesSeeder extends Seeder
{
    /**
     * Seed da estrutura de unidades nos três níveis e postos fronteiriços do SME.
     */
    public function run(): void
    {
        $provLuanda = Provincia::where('nome', 'Luanda')->first();
        $provBenguela = Provincia::where('nome', 'Benguela')->first();
        $provZaire = Provincia::where('nome', 'Zaire')->first();
        $provCunene = Provincia::where('nome', 'Cunene')->first();

        $munLuanda = Municipio::where('nome', 'Luanda')->first();
        $munViana = Municipio::where('nome', 'Viana')->first();
        $munBenguela = Municipio::where('nome', 'Benguela')->first();

        // 1. NÍVEL CENTRAL (LUANDA)
        $direcaoNacional = EstruturaUnidade::firstOrCreate(
            ['sigla' => 'DN-SIC'],
            [
                'id' => (string) Str::uuid7(),
                'nome' => 'Direcção Nacional do SIC',
                'nivel' => 'CENTRAL',
                'provincia_id' => $provLuanda?->id,
                'municipio_id' => $munLuanda?->id,
                'ativo' => true,
            ]
        );

        $departamentosCentrais = [
            ['nome' => 'Direcção Central de Homicídios e Crimes Violentos', 'sigla' => 'DCH-SIC'],
            ['nome' => 'Direcção Central de Cibercrime e Crimes Tecnológicos', 'sigla' => 'DCC-SIC'],
            ['nome' => 'Direcção Central de Combate à Corrupção e Fraude Financeira', 'sigla' => 'DCCF-SIC'],
            ['nome' => 'Direcção Central de Combate ao Narcotráfico', 'sigla' => 'DCN-SIC'],
            ['nome' => 'Laboratório Central de Criminalística e Ciências Forenses', 'sigla' => 'LCCF-SIC'],
            ['nome' => 'Arquivo Central de Identificação e Cadastro Criminal', 'sigla' => 'ACID-SIC'],
            ['nome' => 'Procuradoria-Geral da República — Magistratura Judicial', 'sigla' => 'PGR-MAG'],
        ];

        foreach ($departamentosCentrais as $dep) {
            EstruturaUnidade::firstOrCreate(
                ['sigla' => $dep['sigla']],
                [
                    'id' => (string) Str::uuid7(),
                    'nome' => $dep['nome'],
                    'nivel' => 'CENTRAL',
                    'unidade_superior_id' => $direcaoNacional->id,
                    'provincia_id' => $provLuanda?->id,
                    'municipio_id' => $munLuanda?->id,
                    'ativo' => true,
                ]
            );
        }

        // 2. NÍVEL PROVINCIAL (DIRECÇÕES PROVINCIAIS)
        $dpLuanda = EstruturaUnidade::firstOrCreate(
            ['sigla' => 'DPSIC-LUA'],
            [
                'id' => (string) Str::uuid7(),
                'nome' => 'Direcção Provincial do SIC Luanda',
                'nivel' => 'PROVINCIAL',
                'unidade_superior_id' => $direcaoNacional->id,
                'provincia_id' => $provLuanda?->id,
                'municipio_id' => $munLuanda?->id,
                'ativo' => true,
            ]
        );

        $dpBenguela = EstruturaUnidade::firstOrCreate(
            ['sigla' => 'DPSIC-BGU'],
            [
                'id' => (string) Str::uuid7(),
                'nome' => 'Direcção Provincial do SIC Benguela',
                'nivel' => 'PROVINCIAL',
                'unidade_superior_id' => $direcaoNacional->id,
                'provincia_id' => $provBenguela?->id,
                'municipio_id' => $munBenguela?->id,
                'ativo' => true,
            ]
        );

        // 3. NÍVEL MUNICIPAL
        EstruturaUnidade::firstOrCreate(
            ['sigla' => 'RMSIC-VIA'],
            [
                'id' => (string) Str::uuid7(),
                'nome' => 'Repartição Municipal do SIC Viana',
                'nivel' => 'MUNICIPAL',
                'unidade_superior_id' => $dpLuanda->id,
                'provincia_id' => $provLuanda?->id,
                'municipio_id' => $munViana?->id,
                'ativo' => true,
            ]
        );

        // 4. POSTOS DE FRONTEIRA DO SME (MIGRATÓRIO)
        $postosSme = [
            [
                'nome' => 'Posto de Controlo de Fronteira Aeroporto Internacional 4 de Fevereiro',
                'sigla' => 'SME-AER-4FEV',
                'provincia_id' => $provLuanda?->id,
                'municipio_id' => $munLuanda?->id,
            ],
            [
                'nome' => 'Posto de Controlo Fronteiriço Porto de Luanda',
                'sigla' => 'SME-PORTO-LUA',
                'provincia_id' => $provLuanda?->id,
                'municipio_id' => $munLuanda?->id,
            ],
            [
                'nome' => 'Posto Fronteiriço Terrestre do Luvo',
                'sigla' => 'SME-FRONT-LUV',
                'provincia_id' => $provZaire?->id,
            ],
            [
                'nome' => 'Posto Fronteiriço Terrestre de Santa Clara',
                'sigla' => 'SME-FRONT-SCL',
                'provincia_id' => $provCunene?->id,
            ],
        ];

        foreach ($postosSme as $posto) {
            EstruturaUnidade::firstOrCreate(
                ['sigla' => $posto['sigla']],
                [
                    'id' => (string) Str::uuid7(),
                    'nome' => $posto['nome'],
                    'nivel' => 'MUNICIPAL',
                    'provincia_id' => $posto['provincia_id'],
                    'municipio_id' => $posto['municipio_id'] ?? null,
                    'ativo' => true,
                ]
            );
        }
    }
}
