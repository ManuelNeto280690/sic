<?php

namespace Tests\Feature;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\LogAuditoria;
use App\Models\Utilizador;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CryptographicAuditTest extends TestCase
{
    use DatabaseTransactions;
    /**
     * Testa se a cadeia de blocos de auditoria mantém a integridade SHA-256.
     */
    public function test_audit_chain_integrity_verification(): void
    {
        // 1. A cadeia semeada deve ser válida
        $status = CryptographicAuditService::verifyChainIntegrity();
        $this->assertTrue($status['is_valid']);
        $this->assertNull($status['corrupted_block_id']);

        // 2. Registar novo evento de auditoria
        $novoLog = CryptographicAuditService::log('teste_seguranca', 'UUID-TEST-01', 'OPERACAO_TESTE', [
            'campo' => 'valor_seguro',
        ]);

        $this->assertNotEmpty($novoLog->hash_atual);
        $this->assertEquals(64, strlen($novoLog->hash_atual));

        // 3. A cadeia deve continuar íntegra
        $statusAposNovo = CryptographicAuditService::verifyChainIntegrity();
        $this->assertTrue($statusAposNovo['is_valid']);

        // 4. Teste de Violação: Adulterar intencionalmente um registro no banco de dados
        $novoLog->dados_novos = ['campo' => 'VALOR_ADULTERADO_MANUALMENTE'];
        $novoLog->save();

        // 5. A verificação matemática DEVE acusar quebra de integridade no bloco
        $statusCorrompido = CryptographicAuditService::verifyChainIntegrity();
        $this->assertFalse($statusCorrompido['is_valid']);
        $this->assertEquals($novoLog->id, $statusCorrompido['corrupted_block_id']);

        // 6. Limpeza do registo de teste
        $novoLog->delete();
    }

    /**
     * Testa o isolamento de segurança estrito do operador do SME.
     */
    public function test_sme_security_isolation_blocks_confidential_routes(): void
    {
        $userSme = Utilizador::where('perfil', 'OPERADOR_SME')->first();
        $this->assertNotNull($userSme);

        // Operador SME tentando consultar processos confidenciais do SIC
        $response = $this->actingAs($userSme)->get('/processos');

        // Deve retornar 403 Forbidden
        $response->assertStatus(403);
    }

    /**
     * Testa a consulta de alta velocidade no terminal SME com mandado ativo.
     */
    public function test_sme_terminal_fast_check_returns_blocked_for_wanted_individual(): void
    {
        $userSme = Utilizador::where('perfil', 'OPERADOR_SME')->first();

        // Pedro Cassoma possui mandado de captura ativo emitido pela PGR
        $response = $this->actingAs($userSme)->postJson('/sme/consultar', [
            'documento' => '005421980LA048',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'BLOQUEADO',
            'decisao' => 'RETENCAO_OBRIGATORIA',
        ]);
        $this->assertLessThan(300, $response->json('tempo_ms'));
    }

    /**
     * Testa a consulta de cidadão sem impedimentos retornando passagem liberada.
     */
    public function test_sme_terminal_fast_check_returns_liberated_for_clean_citizen(): void
    {
        $userSme = Utilizador::where('perfil', 'OPERADOR_SME')->first();

        // Manuel Kitumba não possui qualquer impedimento
        $response = $this->actingAs($userSme)->postJson('/sme/consultar', [
            'documento' => '002198731HA031',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'LIBERADO',
            'decisao' => 'PASSAGEM_AUTORIZADA',
        ]);
    }
}
