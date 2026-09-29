<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>{{ $titulo_peca }} - {{ $processo->numero_processo }}</title>
    <style>
        @page {
            size: a4 portrait;
            margin: 20mm 18mm 20mm 18mm;
        }

        body {
            font-family: 'DejaVu Serif', 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #111111;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Cabeçalho Institucional do SIC */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000000;
            padding-bottom: 10px;
        }

        .header-rep {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 0;
            color: #000000;
        }

        .header-min {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 3px 0 0 0;
            color: #222222;
        }

        .header-sic {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 3px 0 0 0;
            color: #855d14;
        }

        .header-sub {
            font-size: 9pt;
            color: #444444;
            margin-top: 4px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        /* Título Oficial da Peça */
        .doc-title-box {
            text-align: center;
            margin: 18px 0 14px 0;
        }

        .doc-title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            letter-spacing: 0.8px;
            margin: 0;
        }

        .doc-proc-no {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            font-weight: bold;
            color: #222222;
            margin-top: 5px;
        }

        /* Caixa de Identificação dos Autos */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            margin-bottom: 18px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 8.5pt;
        }

        .meta-table td {
            padding: 5px 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }

        .meta-label {
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            font-size: 7.5pt;
        }

        .meta-val {
            color: #0f172a;
            font-weight: 500;
        }

        /* Corpo do Documento */
        .content-box {
            text-align: justify;
            font-size: 10.5pt;
            line-height: 1.6;
            color: #111111;
        }

        .content-box p {
            margin-bottom: 10px;
            text-indent: 0;
            line-height: 1.55;
        }

        .content-box h3 {
            text-align: center;
            text-transform: uppercase;
            font-size: 12pt;
            margin: 12px 0 8px 0;
            text-decoration: underline;
            color: #000000;
        }

        .content-box h4 {
            text-align: center;
            text-transform: uppercase;
            font-size: 11pt;
            letter-spacing: 1px;
            margin: 0;
            color: #000000;
        }

        .content-box h5 {
            text-align: center;
            text-transform: uppercase;
            font-size: 9.5pt;
            letter-spacing: 0.5px;
            margin: 3px 0 0 0;
            color: #855d14;
        }

        .content-box ul, .content-box ol {
            margin: 8px 0 12px 25px;
            padding-left: 10px;
        }

        .content-box li {
            margin-bottom: 5px;
            line-height: 1.5;
        }

        .content-box table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
        }

        /* Linhas de Assinatura Formal de Recurso */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 35px;
            text-align: center;
            font-size: 9.5pt;
        }

        .signatures-table td {
            width: 50%;
            padding: 10px;
            vertical-align: bottom;
        }

        .signature-line {
            border-top: 1px solid #000000;
            width: 80%;
            margin: 0 auto;
            padding-top: 6px;
            font-weight: bold;
        }

        .signature-sub {
            font-size: 8.5pt;
            color: #444444;
            margin-top: 2px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        /* Rodapé de Chancela e Validação SHA-256 */
        .footer-seal {
            margin-top: 30px;
            padding-top: 8px;
            border-top: 1px dashed #94a3b8;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 7pt;
            color: #64748b;
            text-align: center;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    @php
        $upperHtml = strtoupper($conteudo_html);
        $temCabecalhoNoHtml = str_contains($upperHtml, 'REPÚBLICA DE ANGOLA') || str_contains($upperHtml, 'REPUBLICA DE ANGOLA');
        $temAssinaturasNoHtml = str_contains($conteudo_html, 'O Arguido') || 
                                str_contains($conteudo_html, 'A Testemunha') || 
                                str_contains($conteudo_html, 'O Notificado') || 
                                str_contains($conteudo_html, 'O Declarante') || 
                                str_contains($conteudo_html, 'O Agente Apreensor') ||
                                str_contains($conteudo_html, 'Instrutor do Processo') ||
                                str_contains($conteudo_html, 'NIP:');
    @endphp

    @if(!$temCabecalhoNoHtml)
    <!-- Cabeçalho Oficial de Recurso caso não exista no corpo da peça -->
    <table class="header-table">
        <tr>
            <td>
                @if(!empty($logoInstitucionalBase64))
                    <div style="text-align: center; margin-bottom: 6px;">
                        <img src="{{ $logoInstitucionalBase64 }}" style="max-height: 52px; max-width: 140px; object-fit: contain;" alt="Logótipo Oficial">
                    </div>
                @endif
                <div class="header-rep">REPÚBLICA DE ANGOLA</div>
                <div class="header-min">MINISTÉRIO DO INTERIOR</div>
                <div class="header-sic">SERVIÇO DE INVESTIGAÇÃO CRIMINAL</div>
                <div class="header-sub">
                    {{ $processo->unidade->nome ?? 'Direcção Provincial de Investigação Criminal' }} &mdash;
                    Província de {{ $processo->provincia->nome ?? 'Benguela' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="doc-title-box">
        <div class="doc-title">{{ $titulo_peca }}</div>
        <div class="doc-proc-no">PROCESSO-CRIME Nº {{ $processo->numero_processo }}</div>
    </div>
    @endif

    <!-- Conteúdo Integral e Fiel do Documento Redigido -->
    <div class="content-box">
        {!! $conteudo_html !!}
    </div>

    @if(!$temAssinaturasNoHtml)
    <!-- Termo e Assinaturas de Recurso caso não existam no corpo -->
    <table class="signatures-table">
        <tr>
            <td>
                <div class="signature-line">
                    {{ $nome_interveniente ?? 'O Declarante / Arguido / Testemunha' }}
                </div>
                <div class="signature-sub">Assinatura ou Impressão Digital</div>
            </td>
            <td>
                <div class="signature-line">
                    {{ $processo->investigador->nome_completo ?? 'O Instrutor do Processo' }}
                </div>
                <div class="signature-sub">
                    Serviço de Investigação Criminal &mdash; NIP: {{ $processo->investigador->nip ?? 'SIC-OFICIAL' }}
                </div>
            </td>
        </tr>
    </table>
    @endif

    <!-- Rodapé Forense de Segurança WORM / SHA-256 -->
    <div class="footer-seal">
        DOCUMENTO PROCESSUAL OFICIAL &bull; SISTEMA INTEGRADO DE GESTÃO PROCESSUAL (SIGD-SIC)<br/>
        CHANCELA DIGITAL SHA-256: <code>{{ hash('sha256', $processo->numero_processo . $titulo_peca . now()->toIso8601String()) }}</code> &bull; EMITIDO EM {{ now()->format('d/m/Y \à\s H:i:s') }}<br/>
        Este auto faz fé pública nos termos da legislação processual penal da República de Angola.
    </div>

</body>
</html>
