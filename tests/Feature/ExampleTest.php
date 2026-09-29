<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_accessing_login_is_redirected(): void
    {
        $user = \App\Models\Utilizador::first();
        $this->assertNotNull($user);

        $response = $this->actingAs($user)->get('/login');

        $response->assertStatus(302);
    }

    public function test_all_major_pages_return_200_ok(): void
    {
        $investigador = \App\Models\Utilizador::where('perfil', 'INVESTIGADOR')->first();
        $this->assertNotNull($investigador);

        // Testa Janela A (SIC Operacional)
        $this->actingAs($investigador)->get('/ocorrencias')->assertStatus(200);
        $this->actingAs($investigador)->get('/ocorrencias/criar')->assertStatus(200);
        $this->actingAs($investigador)->get('/processos')->assertStatus(200);
        $this->actingAs($investigador)->get('/detidos')->assertStatus(200);
        $this->actingAs($investigador)->get('/laboratorio')->assertStatus(200);
        $this->actingAs($investigador)->get('/estatisticas')->assertStatus(200);

        // Testa Janela B (SME Terminal)
        $userSme = \App\Models\Utilizador::where('perfil', 'OPERADOR_SME')->first();
        $this->assertNotNull($userSme);
        $this->actingAs($userSme)->get('/sme/terminal')->assertStatus(200);

        // Testa Janela C (PGR Magistratura)
        $userPgr = \App\Models\Utilizador::where('perfil', 'MAGISTRADO_PGR')->first();
        $this->assertNotNull($userPgr);
        $this->actingAs($userPgr)->get('/magistratura')->assertStatus(200);

        // Testa M9 Auditoria
        $admin = \App\Models\Utilizador::where('perfil', 'ADMIN_SISTEMA')->first();
        $this->assertNotNull($admin);
        $this->actingAs($admin)->get('/auditoria')->assertStatus(200);
    }
}
