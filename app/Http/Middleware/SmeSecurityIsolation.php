<?php

namespace App\Http\Middleware;

use App\Domain\Auditoria\Services\CryptographicAuditService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SmeSecurityIsolation
{
    /**
     * Handle an incoming request.
     * Restringe estritamente operadores do SME às rotas da sua janela de fronteira.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->perfil === 'OPERADOR_SME') {
            $allowedRoutes = ['sme.terminal', 'sme.consultar', 'sme.intercetar', 'logout', 'dashboard.redirect'];
            $currentRoute = $request->route() ? $request->route()->getName() : null;

            $isAllowed = false;
            if ($currentRoute && in_array($currentRoute, $allowedRoutes)) {
                $isAllowed = true;
            } elseif (str_starts_with($request->path(), 'sme/')) {
                $isAllowed = true;
            }

            if (!$isAllowed) {
                // Registro de quebra de segurança e tentativa de acesso não autorizado
                CryptographicAuditService::log(
                    'seguranca_isolamento_sme',
                    $user->id,
                    'TENTATIVA_ACESSO_NAO_AUTORIZADO',
                    [
                        'rota_tentada' => $request->fullUrl(),
                        'metodo' => $request->method(),
                        'nip' => $user->nip,
                    ]
                );

                abort(403, 'Acesso Negado: O perfil OPERADOR_SME possui isolamento estrito de segurança e não tem permissão para consultar autos ou relatórios confidenciais do SIC.');
            }
        }

        return $next($request);
    }
}
