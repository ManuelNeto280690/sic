<?php

namespace Tests\Feature;

use App\Models\EstruturaUnidade;
use App\Models\Municipio;
use App\Models\Ocorrencia;
use App\Models\Provincia;
use App\Models\Utilizador;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OcorrenciaSecurityTest extends TestCase
{
    public function test_admin_can_view_all_provinces_and_edit_any_occurrence(): void
    {
        $admin = Utilizador::where('email', 'admin@sic.gov.ao')->first();
        $this->actingAs($admin);

        $response = $this->get(route('ocorrencias.index'));
        $response->assertStatus(200);

        // O admin tem permissão nacional (todas as 21 províncias)
        $response->assertInertia(fn ($page) => $page
            ->component('Ocorrencias/Index')
            ->where('pode_ver_todas_provincias', true)
        );

        // Deve conseguir atualizar qualquer ocorrência
        $ocorrencia = Ocorrencia::first();
        $updateResponse = $this->put(route('ocorrencias.update', $ocorrencia->id), [
            'classificacao_codigo' => 'CP-ART-398 (Roubo Agravado)',
            'local_detalhado' => 'Localização revista por auditoria administrativa',
            'descricao_facto_html' => 'Descrição revista pelo Administrador do Sistema.',
            'tipo_participacao' => 'PRESENCIAL',
            'data_hora_facto' => Carbon::now()->toDateTimeString(),
            'estado' => 'EM_TRIAGEM',
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('ocorrencias', [
            'id' => $ocorrencia->id,
            'local_detalhado' => 'Localização revista por auditoria administrativa',
        ]);
    }

    public function test_investigator_scoped_to_province_and_can_only_edit_own_occurrence(): void
    {
        $investigador = Utilizador::where('email', 'investigador.luanda@sic.gov.ao')->first();
        $this->actingAs($investigador);

        $response = $this->get(route('ocorrencias.index'));
        $response->assertStatus(200);

        // Investigador provincial tem escopo restrito à sua província (Luanda)
        $response->assertInertia(fn ($page) => $page
            ->component('Ocorrencias/Index')
            ->where('pode_ver_todas_provincias', false)
            ->has('jurisdicao_usuario')
        );

        // Encontra ocorrência criada por outro utilizador (ex: Admin em Luanda)
        $ocOutro = Ocorrencia::where('utilizador_registo_id', '!=', $investigador->id)->first();
        if ($ocOutro) {
            // Tentar editar a ocorrência de outro utilizador deve falhar com 403 Forbidden
            $unauthorizedResponse = $this->put(route('ocorrencias.update', $ocOutro->id), [
                'classificacao_codigo' => 'CP-ART-419 (Burla)',
                'local_detalhado' => 'Tentativa de alteração não autorizada',
                'descricao_facto_html' => 'Texto não autorizado.',
                'tipo_participacao' => 'PRESENCIAL',
                'data_hora_facto' => Carbon::now()->toDateTimeString(),
                'estado' => 'REGISTADA',
            ]);

            $unauthorizedResponse->assertStatus(403);
        }

        // Encontra ocorrência criada pelo próprio investigador
        $ocPropria = Ocorrencia::where('utilizador_registo_id', $investigador->id)->first();
        if ($ocPropria) {
            $authorizedResponse = $this->put(route('ocorrencias.update', $ocPropria->id), [
                'classificacao_codigo' => $ocPropria->classificacao_codigo,
                'local_detalhado' => 'Local atualizado pelo próprio instrutor Afonso',
                'descricao_facto_html' => 'Aditamento aos factos registados pelo instrutor titular.',
                'tipo_participacao' => $ocPropria->tipo_participacao,
                'data_hora_facto' => Carbon::now()->toDateTimeString(),
                'estado' => 'REGISTADA',
            ]);

            $authorizedResponse->assertRedirect();
            $this->assertDatabaseHas('ocorrencias', [
                'id' => $ocPropria->id,
                'local_detalhado' => 'Local atualizado pelo próprio instrutor Afonso',
            ]);
        }
    }

    public function test_user_can_access_edit_page_with_proper_authorization(): void
    {
        $admin = Utilizador::where('email', 'admin@sic.gov.ao')->first();
        $this->actingAs($admin);

        $ocorrencia = Ocorrencia::first();

        // Admin can access edit page
        $response = $this->get(route('ocorrencias.edit', $ocorrencia->id));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Ocorrencias/Create')
            ->where('is_edit', true)
            ->has('ocorrencia')
        );

        // Investigator from Luanda trying to access edit page of an occurrence created by someone else
        $investigador = Utilizador::where('email', 'investigador.luanda@sic.gov.ao')->first();
        $this->actingAs($investigador);

        $ocOutro = Ocorrencia::where('utilizador_registo_id', '!=', $investigador->id)->first();
        if ($ocOutro) {
            $unauthorizedResponse = $this->get(route('ocorrencias.edit', $ocOutro->id));
            $unauthorizedResponse->assertStatus(403);
        }

        // Investigator accessing own occurrence edit page
        $ocPropria = Ocorrencia::where('utilizador_registo_id', $investigador->id)->first();
        if ($ocPropria) {
            $authorizedResponse = $this->get(route('ocorrencias.edit', $ocPropria->id));
            $authorizedResponse->assertStatus(200);
            $authorizedResponse->assertInertia(fn ($page) => $page
                ->component('Ocorrencias/Create')
                ->where('is_edit', true)
                ->where('ocorrencia.id', $ocPropria->id)
            );
        }
    }

    public function test_user_can_generate_pdf_for_authorized_occurrence(): void
    {
        $admin = Utilizador::where('email', 'admin@sic.gov.ao')->first();
        $this->actingAs($admin);

        $ocorrencia = Ocorrencia::first();

        $response = $this->get(route('ocorrencias.pdf', $ocorrencia->id));
        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));

        // Test with download parameter
        $downloadResponse = $this->get(route('ocorrencias.pdf', ['uuid' => $ocorrencia->id, 'download' => 1]));
        $downloadResponse->assertStatus(200);
        $this->assertEquals('application/pdf', $downloadResponse->headers->get('content-type'));

        // Test dedicated download-pdf route
        $directDownload = $this->get(route('ocorrencias.download-pdf', $ocorrencia->id));
        $directDownload->assertStatus(200);
        $this->assertEquals('application/pdf', $directDownload->headers->get('content-type'));
        $this->assertStringContainsString('attachment;', $directDownload->headers->get('content-disposition'));
        $this->assertStringContainsString('.pdf', $directDownload->headers->get('content-disposition'));
    }
}
