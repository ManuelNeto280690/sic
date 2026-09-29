<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            GeografiaProvinciasSeeder::class,
            GeografiaMunicipiosSeeder::class,
            EstruturaUnidadesSeeder::class,
            UtilizadoresSeeder::class,
            DemoCenariosSeeder::class,
        ]);
    }
}
