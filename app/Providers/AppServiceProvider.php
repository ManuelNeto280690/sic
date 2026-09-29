<?php

namespace App\Providers;

use App\Models\ConfiguracaoSistema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        } elseif (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Partilha global do logótipo e parâmetros institucionais para todos os templates PDF
        View::composer('pdf.*', function ($view) {
            $view->with([
                'logoInstitucionalBase64' => ConfiguracaoSistema::getLogoBase64(),
                'logoInstitucionalUrl' => ConfiguracaoSistema::getLogoUrl(),
                'configuracoesInstitucionais' => [
                    'pais_nome' => ConfiguracaoSistema::getValor('pais_nome', 'REPÚBLICA DE ANGOLA'),
                    'ministerio_nome' => ConfiguracaoSistema::getValor('ministerio_nome', 'MINISTÉRIO DO INTERIOR'),
                    'direcao_geral' => ConfiguracaoSistema::getValor('direcao_geral', 'SERVIÇO DE INVESTIGAÇÃO CRIMINAL'),
                    'direcao_nacional' => ConfiguracaoSistema::getValor('direcao_nacional', 'DIRECÇÃO NACIONAL DE OPERAÇÕES E ESTATÍSTICA POLICIAL (DNOEP)'),
                    'lema_institucional' => ConfiguracaoSistema::getValor('lema_institucional', 'HONRA, LEALDADE E LEGALIDADE'),
                    'marca_dagua_documento' => ConfiguracaoSistema::getValor('marca_dagua_documento', 'CONFIDENCIAL // USO EXCLUSIVO POLICIAL'),
                    'rodape_oficial_documentos' => ConfiguracaoSistema::getValor('rodape_oficial_documentos'),
                ],
            ]);
        });
    }
}
