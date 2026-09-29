<?php

namespace App\Http\Controllers;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use App\Models\Utilizador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Exibe o ecrã de autenticação tática do SIGD-SIC.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectAfterAuth(Auth::user());
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Autenticação regular por NIP/E-mail e Senha.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'identificador' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $field = filter_var($credentials['identificador'], FILTER_VALIDATE_EMAIL) ? 'email' : 'nip';

        if (Auth::attempt([$field => $credentials['identificador'], 'password' => $credentials['password'], 'ativo' => true])) {
            $request->session()->regenerate();
            $user = Auth::user();

            CryptographicAuditService::log('utilizadores', $user->id, 'AUTENTICACAO_SUCESSO', [
                'nip' => $user->nip,
                'perfil' => $user->perfil,
            ], null, $user->id);

            return $this->redirectAfterAuth($user);
        }

        return back()->withErrors([
            'identificador' => 'As credenciais operacionais fornecidas são inválidas ou o utilizador está inativo.',
        ]);
    }

    /**
     * Troca rápida de utilizador (para homologação e teste imediato dos 9 perfis).
     */
    public function switchProfile(Request $request)
    {
        $request->validate([
            'user_id' => ['required', 'exists:utilizadores,id'],
        ]);

        $user = Utilizador::findOrFail($request->input('user_id'));
        Auth::login($user);
        $request->session()->regenerate();

        CryptographicAuditService::log('utilizadores', $user->id, 'TROCA_PERFIL_HOMOLOGACAO', [
            'novo_nip' => $user->nip,
            'novo_perfil' => $user->perfil,
        ], null, $user->id);

        return $this->redirectAfterAuth($user);
    }

    /**
     * Encerramento da sessão operacional.
     */
    public function logout(Request $request)
    {
        if (Auth::check()) {
            CryptographicAuditService::log('utilizadores', Auth::id(), 'ENCERRAMENTO_SESSAO', [
                'nip' => Auth::user()->nip,
            ], null, Auth::id());
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Sessão tática encerrada com sucesso.');
    }

    /**
     * Redireciona o utilizador de acordo com a sua Janela de Acesso Federada.
     */
    protected function redirectAfterAuth(Utilizador $user)
    {
        if ($user->isSme()) {
            return redirect()->route('sme.terminal');
        }

        if ($user->isPgr()) {
            return redirect()->route('magistratura.index');
        }

        return redirect()->route('ocorrencias.index');
    }
}
