<?php

namespace Database\Seeders;

use App\Models\EstruturaUnidade;
use App\Models\Utilizador;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UtilizadoresSeeder extends Seeder
{
    /**
     * Seed dos 9 perfis operacionais de utilizadores do SIGD-SIC.
     */
    public function run(): void
    {
        $password = Hash::make('SicAngola#2026');

        $dn = EstruturaUnidade::where('sigla', 'DN-SIC')->first();
        $dch = EstruturaUnidade::where('sigla', 'DCH-SIC')->first();
        $dpBgu = EstruturaUnidade::where('sigla', 'DPSIC-BGU')->first();
        $dpLua = EstruturaUnidade::where('sigla', 'DPSIC-LUA')->first();
        $pgr = EstruturaUnidade::where('sigla', 'PGR-MAG')->first();
        $smeAer = EstruturaUnidade::where('sigla', 'SME-AER-4FEV')->first();

        $perfis = [
            [
                'nip' => 'SIC-ADM-001',
                'nome_completo' => 'Comissário-Geral Manuel Pascoal (Administrador)',
                'email' => 'admin@sic.gov.ao',
                'perfil' => 'ADMIN_SISTEMA',
                'unidade_id' => $dn->id,
                'posto_fronteira' => null,
            ],
            [
                'nip' => 'SIC-DIR-001',
                'nome_completo' => 'Diretor Nacional Dr. António Sebastião',
                'email' => 'diretor.nacional@sic.gov.ao',
                'perfil' => 'DIRETOR_NACIONAL',
                'unidade_id' => $dn->id,
                'posto_fronteira' => null,
            ],
            [
                'nip' => 'SIC-CMD-BGU',
                'nome_completo' => 'Subcomissário Mateus Fernandes (Benguela)',
                'email' => 'comando.benguela@sic.gov.ao',
                'perfil' => 'COMANDANTE_PROVINCIAL',
                'unidade_id' => $dpBgu->id,
                'posto_fronteira' => null,
            ],
            [
                'nip' => 'SIC-CHF-HOM',
                'nome_completo' => 'Intendente Domingos Capenda (Homicídios)',
                'email' => 'chefe.homicidios@sic.gov.ao',
                'perfil' => 'CHEFE_DEPARTAMENTO',
                'unidade_id' => $dch->id,
                'posto_fronteira' => null,
            ],
            [
                'nip' => 'SIC-INV-0042',
                'nome_completo' => 'Inspector de 1ª Classe João Afonso',
                'email' => 'investigador.luanda@sic.gov.ao',
                'perfil' => 'INVESTIGADOR',
                'unidade_id' => $dpLua->id,
                'posto_fronteira' => null,
            ],
            [
                'nip' => 'SIC-SEC-0012',
                'nome_completo' => 'Oficial de Secretaria Teresa Baptista',
                'email' => 'secretaria.geral@sic.gov.ao',
                'perfil' => 'OFICIAL_SECRETARIA',
                'unidade_id' => $dn->id,
                'posto_fronteira' => null,
            ],
            [
                'nip' => 'SME-AER-007',
                'nome_completo' => 'Subinspetor Valente Kiala (SME Fronteira)',
                'email' => 'operador.fronteira@sme.gov.ao',
                'perfil' => 'OPERADOR_SME',
                'unidade_id' => $smeAer->id,
                'posto_fronteira' => 'Aeroporto Internacional 4 de Fevereiro (Terminal 1)',
            ],
            [
                'nip' => 'PGR-MAG-0099',
                'nome_completo' => 'Subprocurador-Geral Dr. Amílcar dos Santos',
                'email' => 'magistrado.pgr@pgr.ao',
                'perfil' => 'MAGISTRADO_PGR',
                'unidade_id' => $pgr->id,
                'posto_fronteira' => null,
            ],
            [
                'nip' => 'MININT-EST-01',
                'nome_completo' => 'Analista Estatístico Gabriel Mutamba',
                'email' => 'estatistica@minint.gov.ao',
                'perfil' => 'CONSULTA_ESTATISTICA',
                'unidade_id' => $dn->id,
                'posto_fronteira' => null,
            ],
        ];

        foreach ($perfis as $p) {
            Utilizador::firstOrCreate(
                ['email' => $p['email']],
                [
                    'id' => (string) Str::uuid7(),
                    'nip' => $p['nip'],
                    'nome_completo' => $p['nome_completo'],
                    'password' => $password,
                    'perfil' => $p['perfil'],
                    'unidade_id' => $p['unidade_id'],
                    'posto_fronteira' => $p['posto_fronteira'],
                    'requer_2fa' => false,
                    'ativo' => true,
                ]
            );
        }
    }
}
