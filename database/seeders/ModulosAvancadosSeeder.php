<?php

namespace Database\Seeders;

use App\Models\Detencao;
use App\Models\InvestigacaoFinanceiraConta;
use App\Models\JuizGarantiasAudiencia;
use App\Models\ProcessoCrime;
use App\Models\TelecomCdrRegisto;
use App\Models\TransacaoFinanceiraSuspeita;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ModulosAvancadosSeeder extends Seeder
{
    public function run(): void
    {
        $processos = ProcessoCrime::with(['detencoes.individuo', 'provincia'])->get();

        if ($processos->isEmpty()) {
            return;
        }

        foreach ($processos as $proc) {
            // =========================================================================
            // 1. SEED: JUIZ DE GARANTIAS & 48H
            // =========================================================================
            $detencao = $proc->detencoes->first();
            $nomeArguido = $detencao && $detencao->individuo ? $detencao->individuo->nome_completo : 'Arguido em Investigação';
            $dataDetencao = $detencao ? $detencao->data_hora_detencao : Carbon::now()->subHours(36);
            $horasDecorridas = (int) round(Carbon::parse($dataDetencao)->diffInHours(Carbon::now()));
            if ($horasDecorridas > 48) $horasDecorridas = 38; // Garantir exemplo realista dentro do prazo

            JuizGarantiasAudiencia::firstOrCreate(
                ['numero_auto_audiencia' => 'JUGAR-2026-' . strtoupper(substr($proc->numero_processo, -6)) . '-01'],
                [
                    'id' => (string) Str::uuid7(),
                    'processo_id' => $proc->id,
                    'detencao_id' => $detencao ? $detencao->id : null,
                    'tipo_ato' => 'PRIMEIRO_INTERROGATORIO_JUDICIAL',
                    'magistrado_juiz_nome' => 'Dr. Augusto Domingos Sambongo (Juiz de Garantias)',
                    'tribunal_comarca' => 'Tribunal de Comarca de ' . ($proc->provincia->nome ?? 'Luanda') . ' — 1.ª Secção Criminal',
                    'data_hora_audiencia' => Carbon::now()->subHours(6),
                    'horas_decorridas_detencao' => $horasDecorridas,
                    'dentro_prazo_48h' => $horasDecorridas <= 48,
                    'decisao_judicial' => 'MANUTENCAO_PRISAO_PREVENTIVA',
                    'valor_caucao_kz' => null,
                    'fundamentacao_despacho' => "Compulsados os autos em sede de 1.º Interrogatório Judicial, verificam-se fortes indícios de perigo de fuga e perturbação da instrução probatória (Art. 63.º CRA e Art. 250.º do Código de Processo Penal Angolano). Determina-se a manutenção da custódia sob medida de coacção máxima de Prisão Preventiva.",
                    'oficial_diligencia_nip' => 'SIC-OF-2041',
                    'defensor_advogado_nome' => 'Dra. Elsa Maria Quitumba (OAA n.º 4120)',
                    'auto_assinado_path' => '/storage/autos_judiciais/termo_jugar_' . $proc->id . '.pdf',
                ]
            );

            // =========================================================================
            // 2. SEED: ANÁLISE DE METADADOS / CDR & ANTENAS ERB
            // =========================================================================
            $coordenadasBase = [
                ['nome' => 'ERB-TALATONA-SUL-01', 'lat' => -8.9142, 'lng' => 13.1852, 'op' => 'UNITEL'],
                ['nome' => 'ERB-MAIANGA-ROCHA-03', 'lat' => -8.8351, 'lng' => 13.2384, 'op' => 'UNITEL'],
                ['nome' => 'ERB-VIANA-ESTRADA-CATETE-02', 'lat' => -8.9021, 'lng' => 13.3689, 'op' => 'AFRICELL'],
                ['nome' => 'ERB-BENFICA-KIANZA-04', 'lat' => -8.9612, 'lng' => 13.1512, 'op' => 'MOVICEL'],
                ['nome' => 'ERB-LOBITO-RESTINGA-01', 'lat' => -12.3512, 'lng' => 13.5412, 'op' => 'UNITEL'],
            ];

            $telefones = [
                ['origem' => '+244 923 881 204', 'destino' => '+244 945 110 932', 'tipo' => 'CHAMADA_VOZ', 'seg' => 312, 'alvo' => true],
                ['origem' => '+244 923 881 204', 'destino' => '+244 912 344 001', 'tipo' => 'SMS_TEXTO', 'seg' => 0, 'alvo' => true],
                ['origem' => '+244 945 110 932', 'destino' => '+244 923 881 204', 'tipo' => 'CHAMADA_VOZ', 'seg' => 84, 'alvo' => false],
                ['origem' => '+244 923 881 204', 'destino' => '+244 990 771 882', 'tipo' => 'CHAMADA_VOZ', 'seg' => 640, 'alvo' => true],
                ['origem' => '+244 931 550 120', 'destino' => '+244 923 881 204', 'tipo' => 'DADOS_IP', 'seg' => 1200, 'alvo' => true],
            ];

            foreach ($telefones as $idx => $t) {
                $erb = $coordenadasBase[$idx % count($coordenadasBase)];
                TelecomCdrRegisto::firstOrCreate(
                    [
                        'processo_id' => $proc->id,
                        'numero_alvo_origem' => $t['origem'],
                        'numero_interlocutor_destino' => $t['destino'],
                        'data_hora_evento' => Carbon::now()->subHours(12 + ($idx * 4)),
                    ],
                    [
                        'id' => (string) Str::uuid7(),
                        'operadora' => $erb['op'],
                        'imei_equipamento' => '8604920482910' . $idx,
                        'imsi_sim_card' => '631020084920' . $idx,
                        'tipo_evento' => $t['tipo'],
                        'duracao_segundos' => $t['seg'],
                        'antena_erb_nome' => $erb['nome'],
                        'latitude' => $erb['lat'],
                        'longitude' => $erb['lng'],
                        'azimute_graus' => ($idx * 75) % 360,
                        'mandado_judicial_referencia' => 'MAND-PGR/TC-2026/089-A',
                        'alvo_investigado_principal' => $t['alvo'],
                        'notas_analise_inteligencia' => 'Contacto interceptado no perímetro tático. Dispositivo com alta densidade de tráfego antes da ocorrência dos factos.',
                    ]
                );
            }

            // =========================================================================
            // 3. SEED: INVESTIGAÇÃO ECONÓMICA & FINANCEIRA (FOLLOW THE MONEY)
            // =========================================================================
            $conta1 = InvestigacaoFinanceiraConta::firstOrCreate(
                ['iban_completo' => 'AO06.0040.0000.1829.4018.1012.3'],
                [
                    'id' => (string) Str::uuid7(),
                    'processo_id' => $proc->id,
                    'banco_comercial' => 'BANCO ANGOLANO DE INVESTIMENTOS (BAI)',
                    'titular_nome' => $nomeArguido,
                    'titular_nif' => '005421980LA048',
                    'numero_conta' => '1829401810',
                    'mandado_quebra_sigilo' => 'DESP-PGR-SIG-2026/041',
                    'saldo_contabilistico_kz' => 48750000.00,
                    'total_creditos_apurados_kz' => 165000000.00,
                    'total_debitos_apurados_kz' => 116250000.00,
                    'grau_suspeicao' => 'CRITICO',
                    'congelamento_cautelar_ativo' => true,
                    'numero_auto_bloqueio_senra' => 'SENRA-BLOQ-2026/0048-A',
                    'data_hora_bloqueio' => Carbon::now()->subDays(1),
                    'fundamentacao_financeira' => 'Identificado padrão de fracionamento de montantes em numerário (Smurfing) com imediata conversão para compra de ativos de elevado valor.',
                ]
            );

            $conta2 = InvestigacaoFinanceiraConta::firstOrCreate(
                ['iban_completo' => 'AO06.0006.0000.9912.8471.2019.8'],
                [
                    'id' => (string) Str::uuid7(),
                    'processo_id' => $proc->id,
                    'banco_comercial' => 'BANCO DE FOMENTO ANGOLA (BFA)',
                    'titular_nome' => 'Kassoma & Filhos Comércio Geral Lda (Empresa de Fachada)',
                    'titular_nif' => '5418902181',
                    'numero_conta' => '9912847120',
                    'mandado_quebra_sigilo' => 'DESP-PGR-SIG-2026/041',
                    'saldo_contabilistico_kz' => 12400000.00,
                    'total_creditos_apurados_kz' => 89000000.00,
                    'total_debitos_apurados_kz' => 76600000.00,
                    'grau_suspeicao' => 'ALTO',
                    'congelamento_cautelar_ativo' => false,
                    'numero_auto_bloqueio_senra' => null,
                    'data_hora_bloqueio' => null,
                    'fundamentacao_financeira' => 'Conta utilizada como transbordo sem registo de atividade mercantil substantiva ou faturação no sistema tributário da AGT.',
                ]
            );

            // Transações Suspeitas da Conta 1
            $transacoes1 = [
                [
                    'valor' => 4950000.00,
                    'natureza' => 'CREDITO',
                    'tipo' => 'DEPOSITO_NUMERARIO',
                    'contraparte_iban' => 'AO06.0040.0000.0000.0000.0000.0',
                    'contraparte_nome' => 'Depósito em Numerário ao Balcão - Agência Talatona',
                    'alerta' => 'SMURFING_FRACIONAMENTO',
                    'desc' => 'Depósito fracionado abaixo do limiar de notificação obrigatória do BNA (Art. 39.º Lei 5/20)',
                    'dias' => 4,
                ],
                [
                    'valor' => 4900000.00,
                    'natureza' => 'CREDITO',
                    'tipo' => 'DEPOSITO_NUMERARIO',
                    'contraparte_iban' => 'AO06.0040.0000.0000.0000.0000.0',
                    'contraparte_nome' => 'Depósito em Numerário ao Balcão - Agência Maianga',
                    'alerta' => 'SMURFING_FRACIONAMENTO',
                    'desc' => 'Depósito fracionado sucessivo efetuado 2 horas após o anterior em agência distinta',
                    'dias' => 4,
                ],
                [
                    'valor' => 38000000.00,
                    'natureza' => 'DEBITO',
                    'tipo' => 'TRANSFERENCIA_IBAN',
                    'contraparte_iban' => 'AO06.0006.0000.9912.8471.2019.8',
                    'contraparte_nome' => 'Kassoma & Filhos Comércio Geral Lda',
                    'alerta' => 'CONTA_PASSAGEM_TRANSBORDO',
                    'desc' => 'Transferência imediata para empresa de fachada sem justificação comercial aparente',
                    'dias' => 3,
                ],
                [
                    'valor' => 25000000.00,
                    'natureza' => 'DEBITO',
                    'tipo' => 'PAGAMENTO_TPA',
                    'contraparte_iban' => 'AO06.0051.0000.1102.3394.8812.1',
                    'contraparte_nome' => 'Auto Stand Luanda Motors Lda',
                    'alerta' => 'TESTA_DE_FERRO_LARANJA',
                    'desc' => 'Aquisição de viatura de luxo (Viatura tipo Toyota Land Cruiser V8)',
                    'dias' => 2,
                ],
            ];

            foreach ($transacoes1 as $t) {
                TransacaoFinanceiraSuspeita::firstOrCreate(
                    [
                        'conta_id' => $conta1->id,
                        'processo_id' => $proc->id,
                        'descricao_extrato' => $t['desc'],
                    ],
                    [
                        'id' => (string) Str::uuid7(),
                        'data_hora_movimento' => Carbon::now()->subDays($t['dias']),
                        'valor_kz' => $t['valor'],
                        'moeda' => 'AOA',
                        'natureza' => $t['natureza'],
                        'tipo_operacao' => $t['tipo'],
                        'iban_contraparte' => $t['contraparte_iban'],
                        'nome_contraparte' => $t['contraparte_nome'],
                        'alerta_padrao_lavagem' => $t['alerta'],
                    ]
                );
            }
        }
    }
}
