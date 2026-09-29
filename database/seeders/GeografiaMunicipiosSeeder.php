<?php

namespace Database\Seeders;

use App\Models\Municipio;
use App\Models\Provincia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GeografiaMunicipiosSeeder extends Seeder
{
    /**
     * Seed dos municípios-chave de Angola.
     */
    public function run(): void
    {
        $map = [
            'Luanda' => ['Luanda', 'Belas', 'Cazenga', 'Cacuaco', 'Viana', 'Kilamba Kiaxi', 'Talatona'],
            'Benguela' => ['Benguela', 'Lobito', 'Baía Farta', 'Catumbela', 'Ganda', 'Cubal'],
            'Huambo' => ['Huambo', 'Caála', 'Bailundo', 'Longonjo'],
            'Huíla' => ['Lubango', 'Humpata', 'Chibia', 'Matala'],
            'Cabinda' => ['Cabinda', 'Cacongo', 'Buco-Zau', 'Belize'],
            'Zaire' => ['Mbanza Kongo', 'Soyo', 'Nóqui', 'Cuimba'],
            'Cunene' => ['Ondjiva', 'Cuanhama', 'Namacunde', 'Ombadja'],
            'Uíge' => ['Uíge', 'Negage', 'Maquela do Zombo', 'Damba'],
            'Malanje' => ['Malanje', 'Cacuso', 'Calandula'],
            'Bengo' => ['Caxito', 'Dande', 'Ambriz', 'Bula Atumba'],
            'Icolo e Bengo' => ['Catete', 'Bela Vista', 'Cassoneca'],
            'Cuanza Sul' => ['Sumbe', 'Porto Amboim', 'Gabela', 'Waku Kungo'],
            'Cuanza Norte' => ['Ndalatando', 'Cazengo', 'Cambambe'],
            'Bié' => ['Kuito', 'Camacupa', 'Andulo'],
            'Lunda Norte' => ['Dundo', 'Chitato', 'Cambulo'],
            'Lunda Sul' => ['Saurimo', 'Muconda', 'Dala'],
            'Moxico' => ['Luena', 'Camanongue', 'Léua'],
            'Moxico Leste' => ['Luau', 'Alto Zambeze'],
            'Namibe' => ['Moçâmedes', 'Tômbwa', 'Bibala'],
            'Cuando' => ['Menongue', 'Cuchi', 'Cuito Cuanavale'],
            'Cubango' => ['Mavinga', 'Rivungo', 'Dirico'],
        ];

        foreach ($map as $provNome => $municipios) {
            $prov = Provincia::where('nome', $provNome)->first();
            if (!$prov) continue;

            foreach ($municipios as $munNome) {
                Municipio::firstOrCreate(
                    ['provincia_id' => $prov->id, 'nome' => $munNome],
                    [
                        'id' => (string) Str::uuid7(),
                        'codigo_geocodigo' => Str::upper(Str::ascii(mb_substr($provNome, 0, 3))) . '-' . Str::upper(Str::ascii(mb_substr($munNome, 0, 3))),
                    ]
                );
            }
        }
    }
}
