<?php

namespace App\Http\Controllers;

use App\Models\ConfiguracaoSistema;
use App\Models\EstruturaUnidade;
use App\Models\GeografiaMunicipio;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\RolePermissao;
use App\Models\TabelaParametrica;
use App\Models\Utilizador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DefinicoesController extends Controller
{
    /**
     * Ecrã principal do Módulo Enterprise de Definições e Configurações Globais.
     */
    public function index(Request $request): Response
    {
        // 1. Configurações Chave-Valor
        $configRows = ConfiguracaoSistema::all();
        $configuracoes = [];
        foreach ($configRows as $row) {
            $configuracoes[$row->chave] = $row->valor;
        }

        // 2. Utilizadores Federados divididos por Órgão
        $utilizadoresSic = Utilizador::whereNotIn('perfil', ['OPERADOR_SME', 'MAGISTRADO_PGR'])
            ->with(['unidade.provincia'])
            ->orderBy('nome_completo')
            ->get();

        $utilizadoresSme = Utilizador::where('perfil', 'OPERADOR_SME')
            ->with(['unidade.provincia'])
            ->orderBy('nome_completo')
            ->get();

        $utilizadoresPgr = Utilizador::where('perfil', 'MAGISTRADO_PGR')
            ->with(['unidade.provincia'])
            ->orderBy('nome_completo')
            ->get();

        // 3. Estrutura de Unidades / Departamentos
        $unidades = EstruturaUnidade::with(['provincia', 'municipio', 'unidadeSuperior'])
            ->orderBy('nome')
            ->get();

        // 4. Geografia
        $provincias = Provincia::orderBy('nome')->get();
        $municipios = Municipio::orderBy('nome')->get();

        // 5. Catálogos Paramétricos
        $catalogos = TabelaParametrica::orderBy('categoria')
            ->orderBy('ordem')
            ->orderBy('nome')
            ->get();

        // 6. Matriz de Permissões
        $rolesPermissoes = RolePermissao::all();

        // 7. Lista de Perfis Oficiais
        $perfisLista = [
            ['codigo' => 'ADMIN_SISTEMA', 'nome' => 'Administrador de Sistema (Cibersegurança & TI)', 'orgao' => 'SIC', 'nivel' => 'CENTRAL'],
            ['codigo' => 'DIRETOR_NACIONAL', 'nome' => 'Diretor Nacional do SIC (Comissário-Geral)', 'orgao' => 'SIC', 'nivel' => 'CENTRAL'],
            ['codigo' => 'COMANDANTE_PROVINCIAL', 'nome' => 'Comandante Provincial (Subcomissário)', 'orgao' => 'SIC', 'nivel' => 'PROVINCIAL'],
            ['codigo' => 'CHEFE_DEPARTAMENTO', 'nome' => 'Chefe de Departamento Especializado (Intendente)', 'orgao' => 'SIC', 'nivel' => 'CENTRAL'],
            ['codigo' => 'INVESTIGADOR', 'nome' => 'Investigador Criminal / Instrutor Processual (Inspector)', 'orgao' => 'SIC', 'nivel' => 'OPERACIONAL'],
            ['codigo' => 'OFICIAL_SECRETARIA', 'nome' => 'Oficial de Secretaria & Cartório Policial', 'orgao' => 'SIC', 'nivel' => 'OPERACIONAL'],
            ['codigo' => 'OPERADOR_SME', 'nome' => 'Operador de Fronteira & Controlo Migratório (SME)', 'orgao' => 'SME', 'nivel' => 'FEDERADO'],
            ['codigo' => 'MAGISTRADO_PGR', 'nome' => 'Magistrado do Ministério Público (PGR)', 'orgao' => 'PGR', 'nivel' => 'FEDERADO'],
            ['codigo' => 'CONSULTA_ESTATISTICA', 'nome' => 'Analista Estatístico & Planeamento (MININT)', 'orgao' => 'MININT', 'nivel' => 'ESTATISTICA'],
        ];

        return Inertia::render('Definicoes/Index', [
            'configuracoes' => $configuracoes,
            'utilizadores_sic' => $utilizadoresSic,
            'utilizadores_sme' => $utilizadoresSme,
            'utilizadores_pgr' => $utilizadoresPgr,
            'unidades' => $unidades,
            'provincias' => $provincias,
            'municipios' => $municipios,
            'catalogos' => $catalogos,
            'roles_permissoes' => $rolesPermissoes,
            'perfis_lista' => $perfisLista,
        ]);
    }

    /**
     * Guarda as parametrizações de identidade institucional e documentos.
     */
    public function salvarInstitucional(Request $request)
    {
        $dados = $request->validate([
            'pais_nome' => 'required|string|max:150',
            'ministerio_nome' => 'required|string|max:150',
            'direcao_geral' => 'required|string|max:150',
            'direcao_nacional' => 'required|string|max:180',
            'lema_institucional' => 'nullable|string|max:150',
            'marca_dagua_documento' => 'nullable|string|max:150',
            'titulo_assinatura_central' => 'required|string|max:150',
            'titulo_assinatura_provincial' => 'required|string|max:150',
            'titulo_assinatura_investigador' => 'required|string|max:150',
            'titulo_assinatura_magistrado' => 'required|string|max:150',
            'formula_encerramento_autos' => 'nullable|string',
            'rodape_oficial_documentos' => 'nullable|string',
            'logo_emblema_url' => 'nullable|string|max:255',
            'logo_ficheiro' => 'nullable|file|mimes:jpeg,png,jpg,svg,webp|max:5120',
            'remover_logo' => 'nullable|boolean',
        ]);

        if ($request->boolean('remover_logo')) {
            ConfiguracaoSistema::setValor('logo_emblema_url', null, 'institucional', 'Logótipo oficial da instituição');
        } elseif ($request->hasFile('logo_ficheiro')) {
            $file = $request->file('logo_ficheiro');
            $filename = 'logo_instituicao_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('institucional', $filename, 'public');
            $url = '/storage/' . $path;
            ConfiguracaoSistema::setValor('logo_emblema_url', $url, 'institucional', 'Logótipo oficial da instituição');
        } elseif (isset($dados['logo_emblema_url'])) {
            ConfiguracaoSistema::setValor('logo_emblema_url', $dados['logo_emblema_url'], 'institucional', 'Logótipo oficial da instituição');
        }

        unset($dados['logo_ficheiro'], $dados['remover_logo'], $dados['logo_emblema_url']);

        foreach ($dados as $chave => $valor) {
            $grupo = Str::contains($chave, ['assinatura', 'formula', 'rodape', 'marca']) ? 'documentos' : 'institucional';
            ConfiguracaoSistema::setValor($chave, $valor, $grupo);
        }

        return back()->with('success', 'Identidade institucional, modelos de documentos e logótipo oficial atualizados com sucesso.');
    }

    /**
     * Atualiza a matriz de permissões de um perfil.
     */
    public function salvarPermissoes(Request $request)
    {
        $request->validate([
            'perfil' => 'required|string',
            'modulo' => 'required|string',
            'permissoes' => 'required|array',
        ]);

        RolePermissao::updateOrCreate(
            ['perfil' => $request->perfil, 'modulo' => $request->modulo],
            ['permissoes' => $request->permissoes]
        );

        return back()->with('flash', [
            'success' => "Matriz de permissões para o módulo '{$request->modulo}' atualizada com sucesso.",
        ]);
    }

    /**
     * Registo de novo utilizador federado (SIC, SME, PGR).
     */
    public function storeUtilizador(Request $request)
    {
        $validated = $request->validate([
            'nip' => 'required|string|max:40|unique:utilizadores,nip',
            'nome_completo' => 'required|string|max:150',
            'email' => 'required|email|max:120|unique:utilizadores,email',
            'password' => 'required|string|min:6',
            'perfil' => 'required|string',
            'unidade_id' => 'required|string|exists:estrutura_unidades,id',
            'posto_fronteira' => 'nullable|string|max:120',
            'requer_2fa' => 'boolean',
            'ativo' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['requer_2fa'] = $validated['requer_2fa'] ?? true;
        $validated['ativo'] = $validated['ativo'] ?? true;

        Utilizador::create($validated);

        return back()->with('flash', [
            'success' => "Utilizador {$validated['nome_completo']} ({$validated['nip']}) registado com sucesso no sistema.",
        ]);
    }

    /**
     * Atualização de utilizador existente.
     */
    public function updateUtilizador(Request $request, string $id)
    {
        $utilizador = Utilizador::findOrFail($id);

        $validated = $request->validate([
            'nip' => "required|string|max:40|unique:utilizadores,nip,{$id}",
            'nome_completo' => 'required|string|max:150',
            'email' => "required|email|max:120|unique:utilizadores,email,{$id}",
            'perfil' => 'required|string',
            'unidade_id' => 'required|string|exists:estrutura_unidades,id',
            'posto_fronteira' => 'nullable|string|max:120',
            'requer_2fa' => 'boolean',
            'ativo' => 'boolean',
        ]);

        $utilizador->update($validated);

        return back()->with('flash', [
            'success' => "Dados do utilizador {$utilizador->nome_completo} atualizados com sucesso.",
        ]);
    }

    /**
     * Alterna o estado ativo/inativo do utilizador.
     */
    public function toggleStatusUtilizador(string $id)
    {
        $utilizador = Utilizador::findOrFail($id);
        $utilizador->ativo = !$utilizador->ativo;
        $utilizador->save();

        $estadoStr = $utilizador->ativo ? 'ativado' : 'desativado';
        return back()->with('flash', [
            'success' => "Utilizador {$utilizador->nome_completo} {$estadoStr} com sucesso.",
        ]);
    }

    /**
     * Redefine a senha de acesso do utilizador.
     */
    public function resetPasswordUtilizador(Request $request, string $id)
    {
        $utilizador = Utilizador::findOrFail($id);
        $novaSenha = $request->input('password', 'SicAngola#2026');

        $utilizador->password = Hash::make($novaSenha);
        $utilizador->save();

        return back()->with('flash', [
            'success' => "Senha do utilizador {$utilizador->nome_completo} redefinida com sucesso para '{$novaSenha}'.",
        ]);
    }

    /**
     * Registo de novo departamento / unidade orgânica.
     */
    public function storeDepartamento(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:150',
            'sigla' => 'required|string|max:30',
            'nivel' => 'required|in:CENTRAL,PROVINCIAL,MUNICIPAL',
            'unidade_superior_id' => 'nullable|string|exists:estrutura_unidades,id',
            'provincia_id' => 'nullable|string|exists:geografia_provincias,id',
            'municipio_id' => 'nullable|string|exists:geografia_municipios,id',
            'ativo' => 'boolean',
        ]);

        $validated['ativo'] = $validated['ativo'] ?? true;
        EstruturaUnidade::create($validated);

        return back()->with('flash', [
            'success' => "Unidade Orgânica '{$validated['nome']}' ({$validated['sigla']}) criada com sucesso.",
        ]);
    }

    /**
     * Atualização de departamento / unidade orgânica.
     */
    public function updateDepartamento(Request $request, string $id)
    {
        $unidade = EstruturaUnidade::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'required|string|max:150',
            'sigla' => 'required|string|max:30',
            'nivel' => 'required|in:CENTRAL,PROVINCIAL,MUNICIPAL',
            'unidade_superior_id' => 'nullable|string|exists:estrutura_unidades,id',
            'provincia_id' => 'nullable|string|exists:geografia_provincias,id',
            'municipio_id' => 'nullable|string|exists:geografia_municipios,id',
            'ativo' => 'boolean',
        ]);

        $unidade->update($validated);

        return back()->with('flash', [
            'success' => "Unidade Orgânica '{$unidade->nome}' atualizada com sucesso.",
        ]);
    }

    /**
     * Registo de novo item em catálogo paramétrico (Tipologia Legal, Interveniente, etc.).
     */
    public function storeCatalogo(Request $request)
    {
        $validated = $request->validate([
            'categoria' => 'required|string|max:60',
            'codigo' => 'required|string|max:60',
            'nome' => 'required|string|max:180',
            'descricao' => 'nullable|string',
            'metadados' => 'nullable|array',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer',
        ]);

        $validated['ativo'] = $validated['ativo'] ?? true;
        $validated['ordem'] = $validated['ordem'] ?? 0;

        TabelaParametrica::create($validated);

        return back()->with('flash', [
            'success' => "Registo '{$validated['nome']}' adicionado ao catálogo '{$validated['categoria']}' com sucesso.",
        ]);
    }

    /**
     * Atualização de item em catálogo paramétrico.
     */
    public function updateCatalogo(Request $request, string $id)
    {
        $item = TabelaParametrica::findOrFail($id);

        $validated = $request->validate([
            'codigo' => 'required|string|max:60',
            'nome' => 'required|string|max:180',
            'descricao' => 'nullable|string',
            'metadados' => 'nullable|array',
            'ativo' => 'boolean',
            'ordem' => 'nullable|integer',
        ]);

        $item->update($validated);

        return back()->with('flash', [
            'success' => "Registo '{$item->nome}' atualizado no catálogo.",
        ]);
    }

    /**
     * Alterna o estado ativo/inativo de um item de catálogo paramétrico.
     */
    public function toggleStatusCatalogo(string $id)
    {
        $item = TabelaParametrica::findOrFail($id);
        $item->ativo = !$item->ativo;
        $item->save();

        $estadoStr = $item->ativo ? 'ativado' : 'desativado';
        return back()->with('flash', [
            'success' => "Item '{$item->nome}' {$estadoStr} no catálogo.",
        ]);
    }
}
