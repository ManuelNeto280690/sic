<?php

namespace App\Http\Middleware;

use App\Models\Provincia;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TerritorialScopeMiddleware
{
    /**
     * Handle an incoming request.
     * Segregação territorial: define a província ativa no request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $unidade = $user->unidade;
            $userProvinciaId = $unidade ? $unidade->provincia_id : null;

            if ($user->isCentral()) {
                // Usuários de nível central podem filtrar qualquer província ou visualizar todas
                $selectedProvinciaId = $request->session()->get('active_provincia_id', $userProvinciaId);
                if ($request->has('switch_provincia_id')) {
                    $selectedProvinciaId = $request->input('switch_provincia_id') ?: null;
                    $request->session()->put('active_provincia_id', $selectedProvinciaId);
                }
                $request->attributes->set('scoped_provincia_id', $selectedProvinciaId);
                $request->attributes->set('is_transversal', true);
            } else {
                // Usuários provinciais e municipais ficam estritamente atrelados à província de lotação
                $request->attributes->set('scoped_provincia_id', $userProvinciaId);
                $request->attributes->set('is_transversal', false);
            }
        }

        return $next($request);
    }
}
