<?php

namespace Database\Seeders;

use App\Models\Provincia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GeografiaProvinciasSeeder extends Seeder
{
    /**
     * Seed das 21 Províncias Oficiais da República de Angola.
     */
    public function run(): void
    {
        $provincias = [
            ['codigo' => 'BGO', 'nome' => 'Bengo'],
            ['codigo' => 'BGU', 'nome' => 'Benguela'],
            ['codigo' => 'BIE', 'nome' => 'Bié'],
            ['codigo' => 'CAB', 'nome' => 'Cabinda'],
            ['codigo' => 'CDO', 'nome' => 'Cuando'],
            ['codigo' => 'CBG', 'nome' => 'Cubango'],
            ['codigo' => 'CNO', 'nome' => 'Cuanza Norte'],
            ['codigo' => 'CSU', 'nome' => 'Cuanza Sul'],
            ['codigo' => 'CNN', 'nome' => 'Cunene'],
            ['codigo' => 'HUA', 'nome' => 'Huambo'],
            ['codigo' => 'HUI', 'nome' => 'Huíla'],
            ['codigo' => 'ICB', 'nome' => 'Icolo e Bengo'],
            ['codigo' => 'LUA', 'nome' => 'Luanda'],
            ['codigo' => 'LNO', 'nome' => 'Lunda Norte'],
            ['codigo' => 'LSU', 'nome' => 'Lunda Sul'],
            ['codigo' => 'MAL', 'nome' => 'Malanje'],
            ['codigo' => 'MOX', 'nome' => 'Moxico'],
            ['codigo' => 'MXL', 'nome' => 'Moxico Leste'],
            ['codigo' => 'NAM', 'nome' => 'Namibe'],
            ['codigo' => 'UIG', 'nome' => 'Uíge'],
            ['codigo' => 'ZAI', 'nome' => 'Zaire'],
        ];

        foreach ($provincias as $prov) {
            Provincia::firstOrCreate(
                ['nome' => $prov['nome']],
                [
                    'id' => (string) Str::uuid7(),
                    'codigo_iso' => $prov['codigo'],
                ]
            );
        }
    }
}
