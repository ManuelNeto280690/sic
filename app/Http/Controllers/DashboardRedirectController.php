<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardRedirectController extends Controller
{
    /**
     * Ponto de entrada root (/) com redirecionamento de acordo com o perfil federado.
     */
    public function __invoke(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        if ($user->isSme()) {
            return redirect()->route('sme.terminal');
        }

        if ($user->isPgr()) {
            return redirect()->route('magistratura.index');
        }

        return redirect()->route('ocorrencias.index');
    }
}
