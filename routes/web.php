<?php

use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CopilotoJuridicoController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\DefinicoesController;
use App\Http\Controllers\DetencaoController;
use App\Http\Controllers\EstatisticaController;
use App\Http\Controllers\InvestigacaoFinanceiraController;
use App\Http\Controllers\JuizGarantiasController;
use App\Http\Controllers\LaboratorioController;
use App\Http\Controllers\MagistraturaController;
use App\Http\Controllers\OcorrenciaController;
use App\Http\Controllers\ProcessoCrimeController;
use App\Http\Controllers\QuickSearchController;
use App\Http\Controllers\SmeTerminalController;
use App\Http\Controllers\TelecomCdrController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SIGD-SIC: Rotas Web do Sistema Integrado de Gestão de Dados do SIC
|--------------------------------------------------------------------------
*/

// Rota raiz e autenticação
Route::get('/', DashboardRedirectController::class)->name('dashboard.redirect');
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/switch-profile', [AuthController::class, 'switchProfile'])->name('profile.switch');

// API Omnibox Global (Ctrl + K) e Copiloto Jurídico IA (APIDOT gemini-3.5-flash)
Route::get('/api/quick-search', QuickSearchController::class)->middleware('auth')->name('quick-search');
Route::post('/copiloto/chat', [CopilotoJuridicoController::class, 'chat'])->middleware('auth')->name('copiloto.chat');

// ÁREA PROTEGIDA POR AUTENTICAÇÃO
Route::middleware(['auth'])->group(function () {

    // =========================================================================
    // JANELA B: JANELA DO SME (FRONTEIRAS E PORTOS — TERMINAL DE ALTA VELOCIDADE)
    // =========================================================================
    Route::prefix('sme')->name('sme.')->group(function () {
        Route::get('/terminal', [SmeTerminalController::class, 'terminal'])->name('terminal');
        Route::post('/consultar', [SmeTerminalController::class, 'consultar'])->name('consultar');
        Route::post('/intercetar', [SmeTerminalController::class, 'intercetar'])->name('intercetar');
    });

    // =========================================================================
    // JANELA C: JANELA DA PGR (MINISTÉRIO PÚBLICO — MAGISTRATURA JUDICIAL)
    // =========================================================================
    Route::prefix('magistratura')->name('magistratura.')->group(function () {
        Route::get('/', [MagistraturaController::class, 'index'])->name('index');
        Route::get('/processos/{uuid}', [MagistraturaController::class, 'showProcesso'])->name('processos.show');
        Route::post('/processos/{uuid}/despacho', [MagistraturaController::class, 'despacharProcesso'])->name('processos.despacho');
        Route::post('/mandados', [MagistraturaController::class, 'emitirMandado'])->name('mandados.emitir');
        Route::post('/mandados/{uuid}/revogar', [MagistraturaController::class, 'revogarMandado'])->name('mandados.revogar');
    });

    // =========================================================================
    // JANELA A: JANELA OPERACIONAL DO SIC (INVESTIGAÇÃO E COMANDO)
    // =========================================================================

    // M1: Registo de Ocorrências e Livro de Autos
    Route::prefix('ocorrencias')->name('ocorrencias.')->group(function () {
        Route::get('/', [OcorrenciaController::class, 'index'])->name('index');
        Route::get('/criar', [OcorrenciaController::class, 'create'])->name('create');
        Route::post('/', [OcorrenciaController::class, 'store'])->name('store');
        Route::get('/{uuid}', [OcorrenciaController::class, 'show'])->name('show');
        Route::get('/{uuid}/auto-noticia-download.pdf', [OcorrenciaController::class, 'downloadPdf'])->name('download-pdf');
        Route::get('/{uuid}/download-pdf', [OcorrenciaController::class, 'downloadPdf']);
        Route::get('/{uuid}/auto-noticia.pdf', [OcorrenciaController::class, 'gerarPdf'])->name('pdf');
        Route::get('/{uuid}/pdf', [OcorrenciaController::class, 'gerarPdf']);
        Route::get('/{uuid}/editar', [OcorrenciaController::class, 'edit'])->name('edit');
        Route::put('/{uuid}', [OcorrenciaController::class, 'update'])->name('update');
    });


    // M2: Gestão de Processos-Crime (Inquéritos & Diligências Solenes)
    Route::prefix('processos')->name('processos.')->group(function () {
        Route::get('/', [ProcessoCrimeController::class, 'index'])->name('index');
        Route::post('/instaurar', [ProcessoCrimeController::class, 'instaurar'])->name('instaurar');
        Route::get('/{uuid}', [ProcessoCrimeController::class, 'show'])->name('show');
        Route::get('/{uuid}/intervenientes', [ProcessoCrimeController::class, 'intervenientes'])->name('intervenientes');
        Route::post('/{uuid}/intervenientes', [ProcessoCrimeController::class, 'storeInterveniente'])->name('intervenientes.store');
        Route::get('/{uuid}/diligencias', [ProcessoCrimeController::class, 'diligencias'])->name('diligencias');
        Route::post('/{uuid}/diligencias', [ProcessoCrimeController::class, 'storeDiligencia'])->name('diligencias.store');
        Route::get('/{uuid}/pecas-autos', [ProcessoCrimeController::class, 'pecasAutos'])->name('pecas-autos');
        Route::get('/{uuid}/pecas-autos/pdf', [ProcessoCrimeController::class, 'visualizarPdfPeca'])->name('pecas-autos.pdf');
        Route::post('/{uuid}/pecas-autos/pdf', [ProcessoCrimeController::class, 'gerarPdfPeca'])->name('pecas-autos.pdf.post');
        Route::get('/{uuid}/provas-custodia', [ProcessoCrimeController::class, 'provasCustodia'])->name('provas-custodia');
        Route::post('/{uuid}/provas-custodia', [ProcessoCrimeController::class, 'storeBemCustodia'])->name('provas-custodia.store');
        Route::get('/{uuid}/vinculos', [ProcessoCrimeController::class, 'vinculos'])->name('vinculos');
        Route::get('/{uuid}/certidao', [ProcessoCrimeController::class, 'certidao'])->name('certidao');
        Route::get('/{uuid}/garantias', [ProcessoCrimeController::class, 'garantias'])->name('garantias');
        Route::post('/{uuid}/garantias', [ProcessoCrimeController::class, 'storeGarantias'])->name('garantias.store');
        Route::get('/{uuid}/telecom-cdr', [ProcessoCrimeController::class, 'telecomCdr'])->name('telecom-cdr');
        Route::post('/{uuid}/telecom-cdr', [ProcessoCrimeController::class, 'storeTelecomCdr'])->name('telecom-cdr.store');
        Route::get('/{uuid}/financeiro', [ProcessoCrimeController::class, 'financeiro'])->name('financeiro');
        Route::post('/{uuid}/financeiro/contas', [ProcessoCrimeController::class, 'storeContaFinanceira'])->name('financeiro.contas.store');
        Route::post('/{uuid}/financeiro/transacoes', [ProcessoCrimeController::class, 'storeTransacaoFinanceira'])->name('financeiro.transacoes.store');
        Route::post('/{uuid}/financeiro/importar-extrato', [ProcessoCrimeController::class, 'importarExtrato'])->name('financeiro.importar-extrato');
        Route::post('/{uuid}/financeiro/contas/{contaId}/congelar', [ProcessoCrimeController::class, 'congelarContaFinanceira'])->name('financeiro.contas.congelar');
        Route::get('/{uuid}/remessa-pgr', [ProcessoCrimeController::class, 'remessaPgr'])->name('remessa-pgr');
        Route::post('/{uuid}/remessa-pgr', [ProcessoCrimeController::class, 'executarRemessaPgr'])->name('remessa-pgr.executar');
    });

    // M12: Juiz de Garantias & Controlo das 48h
    Route::get('/garantias', [JuizGarantiasController::class, 'index'])->name('garantias.index');

    // M13: Centro de Análise de Metadados / CDR & Triangulação ERB
    Route::get('/telecom-cdr', [TelecomCdrController::class, 'index'])->name('telecom-cdr.index');

    // M14: Investigação Económica, Financeira e Recuperação de Ativos (DNCF / UIF / SENRA)
    Route::prefix('financeiro')->name('financeiro.')->group(function () {
        Route::get('/', [InvestigacaoFinanceiraController::class, 'index'])->name('index');
        Route::post('/contas/{contaId}/congelar', [InvestigacaoFinanceiraController::class, 'congelarConta'])->name('contas.congelar');
    });

    // M4: Gestão de Detidos e Prazos Constitucionais de 48h
    Route::prefix('detidos')->name('detidos.')->group(function () {
        Route::get('/', [DetencaoController::class, 'index'])->name('index');
        Route::post('/', [DetencaoController::class, 'store'])->name('store');
        Route::patch('/{uuid}/estado', [DetencaoController::class, 'updateEstado'])->name('update-estado');
        Route::get('/{uuid}/pdf', [DetencaoController::class, 'gerarAutoDetencaoPdf'])->name('pdf');
    });

    // M5: Perícias e Criminalística Forense
    Route::prefix('laboratorio')->name('laboratorio.')->group(function () {
        Route::get('/', [LaboratorioController::class, 'index'])->name('index');
        Route::post('/', [LaboratorioController::class, 'store'])->name('store');
        Route::post('/{uuid}/concluir', [LaboratorioController::class, 'concluirLaudo'])->name('concluir-laudo');
        Route::get('/{uuid}/pdf', [LaboratorioController::class, 'gerarLaudoPdf'])->name('pdf');
    });

    // M6: Estatísticas, Indicadores e Dashboards das 21 Províncias
    Route::get('/estatisticas/exportar-excel', [EstatisticaController::class, 'exportarExcel'])->name('estatisticas.exportar-excel');
    Route::get('/estatisticas', [EstatisticaController::class, 'index'])->name('estatisticas.index');

    // M10: Auditoria Criptográfica com Encadeamento de Hash SHA-256
    Route::prefix('auditoria')->name('auditoria.')->group(function () {
        Route::get('/', [AuditoriaController::class, 'index'])->name('index');
        Route::get('/verificar-cadeia', [AuditoriaController::class, 'verificar'])->name('verificar');
    });

    // M11: Definições e Configurações Enterprise do SIGD-SIC
    Route::prefix('definicoes')->name('definicoes.')->group(function () {
        Route::get('/', [DefinicoesController::class, 'index'])->name('index');
        Route::post('/institucional', [DefinicoesController::class, 'salvarInstitucional'])->name('institucional.salvar');
        Route::post('/permissoes', [DefinicoesController::class, 'salvarPermissoes'])->name('permissoes.salvar');

        // Gestão de Utilizadores Federados (SIC, SME, PGR)
        Route::post('/utilizadores', [DefinicoesController::class, 'storeUtilizador'])->name('utilizadores.store');
        Route::put('/utilizadores/{id}', [DefinicoesController::class, 'updateUtilizador'])->name('utilizadores.update');
        Route::post('/utilizadores/{id}/toggle-status', [DefinicoesController::class, 'toggleStatusUtilizador'])->name('utilizadores.toggle-status');
        Route::post('/utilizadores/{id}/reset-password', [DefinicoesController::class, 'resetPasswordUtilizador'])->name('utilizadores.reset-password');

        // Estrutura de Unidades e Departamentos
        Route::post('/departamentos', [DefinicoesController::class, 'storeDepartamento'])->name('departamentos.store');
        Route::put('/departamentos/{id}', [DefinicoesController::class, 'updateDepartamento'])->name('departamentos.update');

        // Catálogos e Tabelas Paramétricas Dinâmicas
        Route::post('/catalogos', [DefinicoesController::class, 'storeCatalogo'])->name('catalogos.store');
        Route::put('/catalogos/{id}', [DefinicoesController::class, 'updateCatalogo'])->name('catalogos.update');
        Route::post('/catalogos/{id}/toggle-status', [DefinicoesController::class, 'toggleStatusCatalogo'])->name('catalogos.toggle-status');
    });
});
