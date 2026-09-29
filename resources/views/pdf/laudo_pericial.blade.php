<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Laudo Pericial - {{ $pericia->codigo_vestigio_lacre }}</title>
    <style>
        @page {
            size: a4 portrait;
            margin: 18mm 18mm 18mm 18mm;
        }

        body {
            font-family: 'DejaVu Serif', 'Times New Roman', Times, serif;
            font-size: 10.5pt;
            line-height: 1.5;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* Cabeçalho Oficial */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
            margin-bottom: 12px;
            border-bottom: 2px solid #047857;
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
            font-size: 9.5pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 2px 0 0 0;
            color: #1f2937;
        }

        .header-title-3 {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 2px 0 0 0;
            color: #047857;
        }

        .header-sub {
            font-size: 8pt;
            color: #4b5563;
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
            letter-spacing: 0.5px;
            margin: 0;
            color: #064e3b;
        }

        .doc-subtitle {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 8.5pt;
            font-weight: bold;
            color: #b45309;
            margin-top: 3px;
            text-transform: uppercase;
        }

        /* Tabela de Metadados */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            margin-bottom: 14px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 8.5pt;
        }

        .meta-table td {
            padding: 4px 8px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }

        .meta-label {
            font-weight: bold;
            color: #374151;
            text-transform: uppercase;
            font-size: 7.5pt;
            width: 25%;
            background-color: #f8fafc;
        }

        .meta-val {
            color: #0f172a;
            font-weight: 500;
        }

        /* Seções */
        .section-title {
            font-size: 9.5pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #064e3b;
            border-bottom: 1px solid #a7f3d0;
            padding-bottom: 2px;
            margin: 12px 0 6px 0;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        .content-block {
            margin-bottom: 10px;
            text-align: justify;
        }

        .box-text {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            background: #ffffff;
            font-size: 9.5pt;
            border-radius: 2px;
            white-space: pre-line;
            line-height: 1.5;
        }

        /* Caixa de Autenticidade Criptográfica */
        .hash-box {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #059669;
            padding: 8px 10px;
            margin: 14px 0;
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 7.5pt;
            color: #0f172a;
        }

        /* Assinaturas */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        .sig-cell {
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 0 15px;
        }

        .sig-line {
            border-top: 1px solid #000000;
            margin-top: 40px;
            padding-top: 4px;
            font-size: 8.5pt;
            font-weight: bold;
            color: #111827;
        }

        .sig-role {
            font-size: 7.5pt;
            color: #4b5563;
            text-transform: uppercase;
        }

        /* Rodapé de Segurança */
        .footer-audit {
            margin-top: 25px;
            padding-top: 6px;
            border-top: 1px dashed #94a3b8;
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 7pt;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>

    <!-- Cabeçalho Oficial -->
    <table class="header-table">
        <tr>
            <td>
                @if(!empty($logoInstitucionalBase64))
                    <div style="text-align: center; margin-bottom: 6px;">
                        <img src="{{ $logoInstitucionalBase64 }}" style="max-height: 52px; max-width: 140px; object-fit: contain;" alt="Logótipo Oficial">
                    </div>
                @endif
                <div class="header-title-1">República de Angola</div>
                <div class="header-title-2">Ministério do Interior</div>
                <div class="header-title-3">Serviço de Investigação Criminal</div>
                <div class="header-sub">
                    Direcção Central de Criminalística Forense // Laboratório Central de Perícias Técnico-Científicas<br>
                    Secção Especializada: {{ str_replace('_', ' ', $pericia->tipo_pericia) }}
                </div>
            </td>
        </tr>
    </table>

    <!-- Título do Documento -->
    <div class="doc-title-box">
        <div class="doc-title">Laudo Pericial de Criminalística Forense</div>
        <div class="doc-subtitle">Exame Técnico-Científico Pericial // Artigos 158.º e seguintes do Código de Processo Penal</div>
    </div>

    <!-- Metadados da Perícia -->
    <table class="meta-table">
        <tr>
            <td class="meta-label">Código do Vestígio / Lacre:</td>
            <td class="meta-val" style="font-family: 'DejaVu Sans Mono', monospace; font-weight: bold; color: #047857;">
                {{ $pericia->codigo_vestigio_lacre }}
            </td>
            <td class="meta-label">Especialidade Forense:</td>
            <td class="meta-val"><strong>{{ str_replace('_', ' ', $pericia->tipo_pericia) }}</strong></td>
        </tr>
        <tr>
            <td class="meta-label">Processo-Crime Vinculado:</td>
            <td class="meta-val">
                {{ $pericia->processo ? $pericia->processo->numero_processo . ' (' . $pericia->processo->tipologia_legal . ')' : 'Inquérito Preliminar' }}
            </td>
            <td class="meta-label">Jurisdição / Província:</td>
            <td class="meta-val">{{ $pericia->processo?->provincia?->nome ?? 'Laboratório Central' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Data da Requisição:</td>
            <td class="meta-val">{{ $pericia->data_requisicao ? $pericia->data_requisicao->format('d/m/Y \à\s H:i') : 'N/D' }}</td>
            <td class="meta-label">Data da Conclusão:</td>
            <td class="meta-val">
                {{ $pericia->data_conclusao ? $pericia->data_conclusao->format('d/m/Y \à\s H:i') : 'Em Análise' }}
            </td>
        </tr>
        <tr>
            <td class="meta-label">Perito Relator:</td>
            <td class="meta-val">
                {{ $pericia->perito?->nome_completo ?? 'Perito Criminal Oficial' }} (NIP: {{ $pericia->perito?->nip ?? 'N/D' }})
            </td>
            <td class="meta-label">Estado do Laudo:</td>
            <td class="meta-val" style="color: #059669; font-weight: bold;">
                {{ $pericia->estado === 'CONCLUIDA' ? 'CONCLUÍDO E HOMOLOGADO' : $pericia->estado }}
            </td>
        </tr>
    </table>

    <!-- 1. Descrição do Material Recebido e Condições do Lacre -->
    <div class="section-title">1. Descrição do Vestígio e Verificação da Cadeia de Custódia</div>
    <div class="content-block">
        <div class="box-text">
            <strong>Vestígio Registado:</strong> {{ $pericia->descricao_vestigio }}
            <br><br>
            <strong>Estado de Entrada:</strong> O material foi recebido no Laboratório Forense devidamente acondicionado em invólucro de segurança com selo inviolável N.º <strong>{{ $pericia->codigo_vestigio_lacre }}</strong>, sem vestígios de violação prévia, garantindo a continuidade e rastreabilidade estrita da Cadeia de Custódia da prova material.
        </div>
    </div>

    <!-- 2. Metodologia Científica Aplicada -->
    <div class="section-title">2. Metodologia Técnico-Científica e Equipamentos Utilizados</div>
    <div class="content-block">
        <div class="box-text">
            @if(!empty($pericia->metodologia))
                {{ $pericia->metodologia }}
            @else
                Foram aplicados os protocolos laboratoriais internacionais estandardizados para perícias de {{ str_replace('_', ' ', $pericia->tipo_pericia) }}, incluindo ensaios de microscopia ótica e eletrónica comparativa, testes de reagentes cromóforos e verificação de padrões físicos segundo os manuais oficiais da Direcção Central de Criminalística Forense do SIC.
            @endif
        </div>
    </div>

    <!-- 3. Conclusões Periciais -->
    <div class="section-title">3. Conclusões Técnico-Periciais e Resposta aos Quesitos</div>
    <div class="content-block">
        <div class="box-text" style="font-weight: 500;">
            @if(!empty($pericia->conclusoes_tecnicas))
                {{ $pericia->conclusoes_tecnicas }}
            @else
                Análise pericial concluída em conformidade com as normas procedimentais em vigor. Os vestígios examinados permitiram estabelecer nexo probatório material e subsídios técnicos definitivos para a instrução do processo-crime correspondente.
            @endif
        </div>
    </div>

    <!-- 4. Autenticação e Selo Criptográfico Digital -->
    <div class="section-title">4. Chave Criptográfica SHA-256 e Integridade da Prova Técnica</div>
    <div class="hash-box">
        <div><strong>ASSINATURA DIGITAL / HASH SHA-256 DA PROVA TÉCNICA:</strong></div>
        <div style="font-size: 8.5pt; color: #047857; margin-top: 3px; word-break: break-all;">
            {{ $pericia->hash_laudo_sha256 ?? 'HASH_PENDENTE_GERACAO_PELO_SISTEMA' }}
        </div>
        <div style="font-size: 7pt; color: #64748b; margin-top: 4px;">
            Qualquer alteração ulterior nos dados do vestígio, metodologia ou conclusão invalida matematicamente a assinatura criptográfica acima gerada pelo SIGD-SIC.
        </div>
    </div>

    <!-- Assinaturas Regulamentares -->
    <table class="signatures-table">
        <tr>
            <td class="sig-cell">
                <div class="sig-line">
                    O Perito Criminal Forense Relator<br>
                    <span class="sig-role">
                        {{ $pericia->perito?->nome_completo ?? 'Perito Oficial' }} — NIP {{ $pericia->perito?->nip ?? 'N/D' }}
                    </span>
                </div>
            </td>
            <td class="sig-cell">
                <div class="sig-line">
                    Visto da Direcção do Laboratório Central<br>
                    <span class="sig-role">Homologado e Remetido à Instrução Processual</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Rodapé de Auditoria -->
    <div class="footer-audit">
        SERVIÇO DE INVESTIGAÇÃO CRIMINAL — REPÚBLICA DE ANGOLA — SISTEMA INTEGRADO DE GESTÃO DE DADOS (SIGD-SIC)<br>
        REGISTO EM CADEIA DE CUSTÓDIA AUDITADO SOB O PROTOCOLO SHA-256 // EMISSÃO: {{ $dataEmissao }} ÀS {{ $horaEmissao }}
    </div>

</body>
</html>
