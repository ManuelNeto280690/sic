<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Auto de Notícia - {{ $ocorrencia->numero_ocorrencia }}</title>
    <style>
        @page {
            size: a4 portrait;
            margin: 18mm 18mm 18mm 18mm;
        }

        body {
            font-family: 'DejaVu Serif', 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Cabeçalho Oficial da República */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
            margin-bottom: 12px;
            border-bottom: 2px solid #000000;
            padding-bottom: 8px;
        }

        .header-title-1 {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0;
            color: #000000;
        }

        .header-title-2 {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 2px 0 0 0;
            color: #222222;
        }

        .header-title-3 {
            font-size: 10.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 2px 0 0 0;
            color: #855d14;
        }

        .header-sub {
            font-size: 8.5pt;
            color: #444444;
            margin-top: 3px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        /* Título do Documento */
        .doc-title-box {
            text-align: center;
            margin: 14px 0 10px 0;
        }

        .doc-title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            letter-spacing: 0.5px;
            margin: 0;
        }

        .doc-number {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 9.5pt;
            font-weight: bold;
            color: #333333;
            margin-top: 3px;
        }

        /* Caixa de Metadados Processuais */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f7f9fa;
            border: 1px solid #c8d3dc;
            margin-bottom: 14px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 8.5pt;
        }

        .meta-table td {
            padding: 4px 8px;
            vertical-align: top;
            border-bottom: 1px solid #e2e8f0;
        }

        .meta-label {
            font-weight: bold;
            color: #475569;
            width: 28%;
            text-transform: uppercase;
            font-size: 8pt;
        }

        .meta-value {
            color: #0f172a;
        }

        /* Intervenientes */
        .intervenientes-list {
            margin: 2px 0 0 0;
            padding-left: 14px;
        }

        .intervenientes-list li {
            margin-bottom: 2px;
        }

        /* Narrativa e Corpo do Auto */
        .corpo-auto {
            text-align: justify;
            text-justify: inter-word;
            font-size: 10.5pt;
            line-height: 1.6;
            margin-bottom: 18px;
        }

        .corpo-auto p {
            margin: 0 0 10px 0;
            text-indent: 1.8em;
        }

        /* Fórmula de Encerramento */
        .encerramento {
            font-size: 9.5pt;
            font-style: italic;
            text-align: justify;
            margin-bottom: 25px;
            line-height: 1.4;
        }

        /* Assinaturas */
        .assinaturas-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 20px;
        }

        .assinaturas-table td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 0 20px;
        }

        .linha-assinatura {
            border-bottom: 1px solid #000000;
            height: 38px;
            margin-bottom: 5px;
        }

        .assinatura-cargo {
            font-size: 8.5pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #111111;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        .assinatura-nome {
            font-size: 8pt;
            color: #555555;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            margin-top: 2px;
        }

        /* Rodapé de Segurança e Auditoria Criptográfica */
        .footer-security {
            border-top: 1px dashed #94a3b8;
            padding-top: 5px;
            font-family: 'DejaVu Sans Mono', monospace, Arial;
            font-size: 7pt;
            color: #64748b;
            width: 100%;
        }

        .footer-table {
            width: 100%;
            border-collapse: collapse;
        }

        .footer-table td {
            padding: 0;
            vertical-align: middle;
        }
    </style>
</head>
<body>

    <!-- Cabeçalho Oficial Institucional -->
    <table class="header-table">
        <tr>
            <td>
                <!-- Brasão / Insígnia da República de Angola -->
                <div style="text-align: center; margin-bottom: 6px;">
                    @if(!empty($logoInstitucionalBase64))
                        <img src="{{ $logoInstitucionalBase64 }}" style="max-height: 52px; max-width: 140px; object-fit: contain;" alt="Logótipo Institucional">
                    @else
                        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="22" stroke="#855d14" stroke-width="2" fill="#faf6ee"/>
                            <path d="M24 8L27.5 18.5H38.5L29.5 25L33 35.5L24 29L15 35.5L18.5 25L9.5 18.5H20.5L24 8Z" fill="#855d14"/>
                        </svg>
                    @endif
                </div>
                <div class="header-title-1">REPÚBLICA DE ANGOLA</div>
                <div class="header-title-2">MINISTÉRIO DO INTERIOR</div>
                <div class="header-title-3">SERVIÇO DE INVESTIGAÇÃO CRIMINAL</div>
                <div class="header-sub">
                    Direcção Provincial de {{ $ocorrencia->provincia?->nome ?? 'Luanda' }}
                    @if($ocorrencia->unidadeRegisto)
                        &mdash; {{ $ocorrencia->unidadeRegisto->nome }}
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Título do Auto -->
    <div class="doc-title-box">
        <div class="doc-title">AUTO DE NOTÍCIA PRELIMINAR DE CRIME</div>
        <div class="doc-number">Nº OFICIAL DO REGISTO: {{ $ocorrencia->numero_ocorrencia }}</div>
    </div>

    <!-- Metadados da Ocorrência -->
    <table class="meta-table">
        <tr>
            <td class="meta-label">Tipologia Penal:</td>
            <td class="meta-value"><strong>{{ $ocorrencia->classificacao_codigo }}</strong></td>
        </tr>
        <tr>
            <td class="meta-label">Local e Circunscrição:</td>
            <td class="meta-value">
                {{ $ocorrencia->local_detalhado }},
                Município de {{ $ocorrencia->municipio?->nome ?? 'N/D' }},
                Província de {{ $ocorrencia->provincia?->nome ?? 'N/D' }}
            </td>
        </tr>
        <tr>
            <td class="meta-label">Data e Hora do Facto:</td>
            <td class="meta-value">
                {{ \Carbon\Carbon::parse($ocorrencia->data_hora_facto)->format('d/m/Y \à\s H:i') }}
            </td>
        </tr>
        <tr>
            <td class="meta-label">Forma de Participação:</td>
            <td class="meta-value">
                {{ $ocorrencia->tipo_participacao }}
                @if($ocorrencia->origem_pop)
                    (Expediente Remetido pela Polícia Nacional / PNA)
                @endif
            </td>
        </tr>
        <tr>
            <td class="meta-label">Intervenientes Qualificados:</td>
            <td class="meta-value">
                @if($ocorrencia->intervenientes && $ocorrencia->intervenientes->count() > 0)
                    <ul class="intervenientes-list">
                        @foreach($ocorrencia->intervenientes as $int)
                            <li>
                                <strong>[{{ $int->papel }}]</strong> {{ $int->nome_identificativo }}
                                @if($int->contacto_telefone)
                                    &mdash; Contacto: {{ $int->contacto_telefone }}
                                @endif
                                @if($int->individuo && $int->individuo->numero_bi)
                                    &mdash; BI: {{ $int->individuo->numero_bi }}
                                @endif
                            </li>
                        @endforeach
                    </ul>
                @else
                    <em>Não especificados na triagem preliminar.</em>
                @endif
            </td>
        </tr>
    </table>

    <!-- Corpo do Auto: Descrição Circunstanciada dos Factos -->
    <div class="corpo-auto">
        @php
            // Normalizar parágrafos para impressão solene
            $textoLimpo = $ocorrencia->descricao_facto_html;
            if (!str_contains($textoLimpo, '<p>') && !str_contains($textoLimpo, '<br>')) {
                $linhas = explode("\n", str_replace("\r", "", $textoLimpo));
                $htmlFormatado = '';
                foreach ($linhas as $linha) {
                    $l = trim($linha);
                    if (!empty($l)) {
                        $htmlFormatado .= '<p>' . htmlspecialchars($l) . '</p>';
                    }
                }
                echo $htmlFormatado;
            } else {
                echo $textoLimpo;
            }
        @endphp
    </div>

    <!-- Encerramento -->
    <div class="encerramento">
        E por nada mais haver a constar ou aditar, foi lavrado o presente Auto de Notícia que, depois de lido perante os presentes e achado inteiramente conforme à verdade apurada, vai devidamente validado e assinado nos termos do Código de Processo Penal Angolano.
    </div>

    <!-- Bloco de Assinaturas -->
    <table class="assinaturas-table">
        <tr>
            <td>
                <div class="linha-assinatura"></div>
                <div class="assinatura-cargo">O Participante / Declarante</div>
                <div class="assinatura-nome">Assinatura ou Impressão Digital</div>
            </td>
            <td>
                <div class="linha-assinatura"></div>
                <div class="assinatura-cargo">O Oficial Instrutor / Registador</div>
                <div class="assinatura-nome">
                    {{ $ocorrencia->utilizadorRegisto?->nome_completo ?? 'Oficial SIC' }}
                    @if($ocorrencia->utilizadorRegisto?->nip)
                        (NIP: {{ $ocorrencia->utilizadorRegisto->nip }})
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Rodapé Criptográfico Oficial -->
    <div class="footer-security">
        <table class="footer-table">
            <tr>
                <td style="text-align: left;">
                    LAVRADO AOS: {{ $dataEmissao }} às {{ $horaEmissao }} &bull; SIGD-SIC ANGOLA
                </td>
                <td style="text-align: right;">
                    PROTOCOLO WORM &bull; SHA-256: {{ substr(hash('sha256', $ocorrencia->id . $ocorrencia->numero_ocorrencia . $ocorrencia->created_at), 0, 24) }}...
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: center; padding-top: 3px; font-size: 6.5pt; color: #94a3b8;">
                    DOCUMENTO OFICIAL DA REPÚBLICA DE ANGOLA &bull; MINISTÉRIO DO INTERIOR &bull; SERVIÇO DE INVESTIGAÇÃO CRIMINAL
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
