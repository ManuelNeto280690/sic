<?php

namespace Database\Seeders;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\BemCustodia;
use App\Models\CadastroIndividuo;
use App\Models\Detencao;
use App\Models\EstruturaUnidade;
use App\Models\MandadoSinalizacao;
use App\Models\Municipio;
use App\Models\Ocorrencia;
use App\Models\OcorrenciaAnexo;
use App\Models\OcorrenciaInterveniente;
use App\Models\PericiaLaboratorio;
use App\Models\ProcessoCrime;
use App\Models\ProcessoDiligencia;
use App\Models\Provincia;
use App\Models\Utilizador;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoCenariosSeeder extends Seeder
{
    /**
     * Seed de cenários operacionais realistas para validação integral das 3 janelas.
     */
    public function run(): void
    {
        $provLuanda = Provincia::where('nome', 'Luanda')->first();
        $munLuanda = Municipio::where('nome', 'Luanda')->first();
        $dpLua = EstruturaUnidade::where('sigla', 'DPSIC-LUA')->first();
        $invAfonso = Utilizador::where('email', 'investigador.luanda@sic.gov.ao')->first();
        $pgrUser = Utilizador::where('email', 'magistrado.pgr@pgr.ao')->first();

        // 1. M3: CADASTRO DE INDIVÍDUOS (ARQUIVO CENTRAL)
        $suspeito1 = CadastroIndividuo::create([
            'id' => (string) Str::uuid7(),
            'numero_bi' => '005421980LA048',
            'passaporte' => 'N2094182',
            'nome_completo' => 'Pedro Miguel Cassoma',
            'nome_pai' => 'Manuel Cassoma',
            'nome_mae' => 'Esperança Nzuzi',
            'alcunhas' => ['Doberman', 'Pedrito das Armas'],
            'data_nascimento' => '1988-06-14',
            'genero' => 'M',
            'nacionalidade' => 'Angolana',
            'sinais_particulares' => 'Cicatriz cirúrgica linear de 6cm no antebraço direito; tatuagem de escorpião na omoplata esquerda.',
            'perigoso' => true,
            'interdicao_saida' => true,
        ]);

        $cidadao2 = CadastroIndividuo::create([
            'id' => (string) Str::uuid7(),
            'numero_bi' => '002198731HA031',
            'passaporte' => 'N1882031',
            'nome_completo' => 'Manuel Domingos Kitumba',
            'nome_pai' => 'Domingos Kitumba',
            'nome_mae' => 'Ana Teresa Kitumba',
            'data_nascimento' => '1992-11-03',
            'genero' => 'M',
            'nacionalidade' => 'Angolana',
            'sinais_particulares' => 'Nenhum registo relevante.',
            'perigoso' => false,
            'interdicao_saida' => false,
        ]);

        $interdito3 = CadastroIndividuo::create([
            'id' => (string) Str::uuid7(),
            'numero_bi' => '007621094LA099',
            'passaporte' => 'N3011294',
            'nome_completo' => 'António Carlos Van-Dúnem',
            'nome_pai' => 'Carlos Van-Dúnem',
            'nome_mae' => 'Maria de Fátima Van-Dúnem',
            'data_nascimento' => '1979-03-22',
            'genero' => 'M',
            'nacionalidade' => 'Angolana',
            'sinais_particulares' => 'Uso de óculos graduados permanentes.',
            'perigoso' => false,
            'interdicao_saida' => true,
        ]);

        // 2. M1: REGISTO DE OCORRÊNCIA E LIVRO DE AUTOS
        $ocorrencia = Ocorrencia::create([
            'id' => (string) Str::uuid7(),
            'numero_ocorrencia' => 'OC/2026/LUA/00041',
            'tipo_participacao' => 'EXPEDIENTE_POP',
            'origem_pop' => true,
            'documento_pop_escaneado_path' => '/storage/autos_pna/auto_noticia_pop_41_lua.pdf',
            'descricao_facto_html' => '<p>Aos 14 dias do mês corrente, pelas 21h30, na via pública junto ao nó rodoviário de Talatona, elementos armados não identificados interceptaram a viatura da vítima subtraindo valores em moeda fiduciária e equipamentos de telecomunicação sob ameaça de arma de fogo do tipo pistola.</p>',
            'data_hora_facto' => Carbon::now()->subDays(2),
            'provincia_id' => $provLuanda->id,
            'municipio_id' => $munLuanda->id,
            'local_detalhado' => 'Avenida Pedro de Castro Van-Dúnem Loy, Talatona, Luanda',
            'coordenadas' => \Illuminate\Support\Facades\DB::raw("Point(13.2343, -8.8390)"),
            'classificacao_codigo' => 'CP-ART-398 (Roubo Agravado)',
            'unidade_registo_id' => $dpLua->id,
            'utilizador_registo_id' => $invAfonso->id,
            'estado' => 'INSTAURADO_PROCESSO',
        ]);

        OcorrenciaInterveniente::create([
            'id' => (string) Str::uuid7(),
            'ocorrencia_id' => $ocorrencia->id,
            'individuo_id' => $suspeito1->id,
            'papel' => 'SUSPEITO',
            'nome_identificativo' => $suspeito1->nome_completo,
            'contacto_telefone' => '+244 923 000 111',
            'declaracoes_resumo' => 'Reconhecido fotograficamente no Arquivo Central pelas testemunhas oculares.',
        ]);

        OcorrenciaInterveniente::create([
            'id' => (string) Str::uuid7(),
            'ocorrencia_id' => $ocorrencia->id,
            'individuo_id' => $cidadao2->id,
            'papel' => 'VITIMA',
            'nome_identificativo' => $cidadao2->nome_completo,
            'contacto_telefone' => '+244 912 345 678',
            'declaracoes_resumo' => 'Confirmou a subtração dos valores e agressão verbal sob ameaça direta de cano de fogo.',
        ]);

        OcorrenciaAnexo::create([
            'id' => (string) Str::uuid7(),
            'ocorrencia_id' => $ocorrencia->id,
            'tipo_ficheiro' => 'application/pdf',
            'storage_path' => '/storage/provas/auto_pop_0041.pdf',
            'nome_original' => 'auto_noticia_original_pna.pdf',
            'tamanho_bytes' => 148590,
            'hash_sha256' => '8f480329a738a80d52ec06f7b767d1326c2cf42b78a9c240974b78996b876402',
            'enviado_por_id' => $invAfonso->id,
        ]);

        // 3. M2: PROCESSO-CRIME (INQUÉRITO DE INSTRUÇÃO PREPARATÓRIA)
        $processo = ProcessoCrime::create([
            'id' => (string) Str::uuid7(),
            'numero_processo' => 'PROC/2026/LUA/00041',
            'ocorrencia_origem_id' => $ocorrencia->id,
            'provincia_id' => $provLuanda->id,
            'unidade_competente_id' => $dpLua->id,
            'investigador_titular_id' => $invAfonso->id,
            'tipologia_legal' => 'Roubo Concorrido com Posse Ilegal de Arma de Fogo (Art. 398º e 440º CP)',
            'segredo_justica' => true,
            'data_abertura' => Carbon::now()->subDays(1)->toDateString(),
            'data_limite_instrucao' => Carbon::now()->addMonths(6)->toDateString(),
            'estado' => 'EM_INSTRUCAO',
            'magistrado_pgr_responsavel' => 'Dr. Amílcar dos Santos (PGR)',
        ]);

        ProcessoDiligencia::create([
            'id' => (string) Str::uuid7(),
            'processo_id' => $processo->id,
            'tipo' => 'Busca e Apreensão Domiciliária com Mandado Judicial',
            'descricao_detalhada' => 'Diligência executada na residência do suspeito na zona do Morro Bento, apreendendo a arma utilizada no crime e parte dos valores.',
            'resultado' => 'Positivo com localização da pistola Makarov 9mm e estojos de munições correspondentes.',
            'data_realizacao' => Carbon::now()->subHours(18),
            'responsavel_id' => $invAfonso->id,
        ]);

        // 4. M4: DETENÇÃO E CONTAGEM CONSTITUCIONAL DE 48H
        // Limite legal de 48h definido para daqui a 7 horas e meia (alerta urgente no HUD!)
        $detencao = Detencao::create([
            'id' => (string) Str::uuid7(),
            'individuo_id' => $suspeito1->id,
            'processo_id' => $processo->id,
            'data_hora_detencao' => Carbon::now()->subHours(40)->subMinutes(30),
            'limite_legal_48h' => Carbon::now()->addHours(7)->addMinutes(30),
            'local_detencao' => 'Cela Transitória do Piquete Provincial do SIC Luanda',
            'auto_detencao_path' => '/storage/detencoes/auto_detencao_pedro_cassoma.pdf',
            'efetivo_captor_nip' => $invAfonso->nip,
            'estado_custodia' => 'CELA_TRANSITORIA',
            'motivo_legal' => 'Flagrante delito diferido com mandado de detenção fora de flagrante por crime violento punível com pena maior.',
        ]);

        // 5. CADEIA DE CUSTÓDIA COM LACRES INVIOLÁVEIS
        BemCustodia::create([
            'id' => (string) Str::uuid7(),
            'detencao_id' => $detencao->id,
            'processo_id' => $processo->id,
            'numero_lacre_seguranca' => 'LACRE-SIC-2026-9FA31B82',
            'descricao_bem' => 'Pistola semi-automática calibre 9x18mm Makarov, nº de série raspado 449-X, com carregador contendo 6 munições intactas.',
            'tipo_objeto' => 'ARMA_FOGO',
            'local_cofre_deposito' => 'Cofre Forte de Balística Forense — Armário B-04',
            'apreendido_por_id' => $invAfonso->id,
            'entregue_a_terceiro' => false,
        ]);

        BemCustodia::create([
            'id' => (string) Str::uuid7(),
            'detencao_id' => $detencao->id,
            'processo_id' => $processo->id,
            'numero_lacre_seguranca' => 'LACRE-SIC-2026-7C81AE04',
            'descricao_bem' => 'Soma em numerário no valor de 12.500.000,00 Kz (Doze Milhões e Quinhentos Mil Kwanzas) em notas de 5.000 Kz.',
            'tipo_objeto' => 'VALOR_MONETARIO',
            'local_cofre_deposito' => 'Cofre Provincial de Custódia Financeira — Depósito 01',
            'apreendido_por_id' => $invAfonso->id,
            'entregue_a_terceiro' => false,
        ]);

        // 6. M5: PERÍCIAS FORENSES E CRIMINALÍSTICA
        PericiaLaboratorio::create([
            'id' => (string) Str::uuid7(),
            'processo_id' => $processo->id,
            'codigo_vestigio_lacre' => 'LACRE-SIC-2026-9FA31B82',
            'tipo_pericia' => 'BALISTICA',
            'descricao_vestigio' => 'Confronto microscópico de ranhuras e estrias balísticas entre a pistola Makarov apreendida e os estojos recolhidos no local do facto.',
            'estado' => 'EM_ANALISE',
            'perito_responsavel_id' => $invAfonso->id,
            'hash_laudo_sha256' => null,
            'data_requisicao' => Carbon::now()->subHours(12),
        ]);

        // 7. M7/M8/M9: MANDADOS JUDICIAIS E SINCRONIZAÇÃO SME / INTERPOL
        MandadoSinalizacao::create([
            'id' => (string) Str::uuid7(),
            'numero_mandado_oficial' => 'MAND-PGR/2026/00489',
            'processo_id' => $processo->id,
            'individuo_id' => $suspeito1->id,
            'tipo' => 'CAPTURA_NACIONAL',
            'orgao_emitente' => 'Procuradoria-Geral da República — Sala Criminal de Luanda',
            'magistrado_nome' => 'Dr. Amílcar dos Santos',
            'fundamentacao_legal' => 'Artigo 288º do Código de Processo Penal Angolano: Perigo iminente de fuga e reiteração de atividade criminosa armada.',
            'despacho_assinado_path' => '/storage/mandados/despacho_pgr_mandado_489.pdf',
            'data_emissao' => Carbon::now()->subDays(3)->toDateString(),
            'data_validade' => Carbon::now()->addYear()->toDateString(),
            'alerta_sme_ativo' => true,
            'interpol_red_notice' => true,
            'estado' => 'ATIVO',
        ]);

        MandadoSinalizacao::create([
            'id' => (string) Str::uuid7(),
            'numero_mandado_oficial' => 'INTERD-PGR/2026/00102',
            'processo_id' => null,
            'individuo_id' => $interdito3->id,
            'tipo' => 'INTERDICAO_SAIDA',
            'orgao_emitente' => 'Direcção Nacional de Investigação e Acção Penal (DNIAP / PGR)',
            'magistrado_nome' => 'Dr. Manuel Bernardo (Procurador da República)',
            'fundamentacao_legal' => 'Inquérito preliminar por branqueamento de capitais e evasão cambial (Art. 240º CPP). Proibição judicial de transpor fronteiras nacionais.',
            'despacho_assinado_path' => '/storage/mandados/despacho_dniap_interdicao_102.pdf',
            'data_emissao' => Carbon::now()->subDays(10)->toDateString(),
            'data_validade' => Carbon::now()->addMonths(6)->toDateString(),
            'alerta_sme_ativo' => true,
            'interpol_red_notice' => false,
            'estado' => 'ATIVO',
        ]);

        // 8. M10: ENCADEAMENTO DE AUDITORIA CRIPTOGRÁFICA SHA-256
        CryptographicAuditService::log('ocorrencias', $ocorrencia->id, 'CRIAR_OCORRENCIA_AUTO', [
            'numero' => $ocorrencia->numero_ocorrencia,
            'classificacao' => $ocorrencia->classificacao_codigo,
        ], null, $invAfonso->id);

        CryptographicAuditService::log('processos_crime', $processo->id, 'INSTAURAR_PROCESSO_CRIME', [
            'numero_processo' => $processo->numero_processo,
            'tipologia' => $processo->tipologia_legal,
        ], null, $invAfonso->id);

        CryptographicAuditService::log('detencoes', $detencao->id, 'REGISTO_CELA_TRANSITORIA', [
            'individuo' => $suspeito1->nome_completo,
            'limite_legal_48h' => $detencao->limite_legal_48h->toIso8601String(),
        ], null, $invAfonso->id);

        CryptographicAuditService::log('mandados_sinalizacoes', 'MAND-PGR/2026/00489', 'EMISSAO_MANDADO_CAPTURA_PGR', [
            'alvo' => $suspeito1->nome_completo,
            'tipo' => 'CAPTURA_NACIONAL',
            'interpol' => true,
        ], null, $pgrUser?->id);
    }
}
