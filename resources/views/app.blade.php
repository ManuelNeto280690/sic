<!DOCTYPE html>
<html lang="pt" class="dark h-full bg-[#0d1a26]">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="#0d1a26">
        <meta name="description" content="SIGD-SIC — Sistema Integrado de Gestão de Dados do Serviço de Investigação Criminal de Angola (MININT)">

        <title inertia>{{ config('app.name', 'SIGD-SIC — Angola') }}</title>

        <!-- Google Fonts: Inter & JetBrains Mono -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Regras Mestras de Impressão (Elimina Cabeçalho de Data/Título e Rodapé de URL nativos do Navegador) -->
        <style>
            @page {
                size: A4 portrait;
                margin: 0mm;
            }
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 0mm;
                }
            }
        </style>

        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="h-full bg-[#0d1a26] text-slate-100 font-sans antialiased selection:bg-[#C5A059] selection:text-[#0d1a26] overflow-x-hidden">
        @inertia
    </body>
</html>
