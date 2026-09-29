<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Auto de Detenção - {{ $detencao->individuo?->nome_completo ?? 'Detido' }}</title>
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
            border-bottom: 2px solid #0f172a;
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
            color: #855d14;
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
            font-size: 12.5pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
            color: #0f172a;
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
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
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
            color: #475569;
            text-transform: uppercase;
            font-size: 7.5pt;
            width: 25%;
        }

        .meta-val {
            color: #0f172a;
            font-weight: 500;
        }

        .meta-val-highlight {
            color: #b91c1c;
            font-weight: bold;
            font-family: 'DejaVu Sans Mono', monospace;
        }

        /* Seções */
        .section-title {
            font-size: 9.5pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 1px solid #94a3b8;
            padding-bottom: 2px;
            margin: 12px 0 6px 0;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        .content-block {
            margin-bottom: 10px;
            text-align: justify;
        }

        .item-list {
            width: 100%;
            border-collapse: collapse;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 8pt;
            margin-top: 5px;
        }

        .item-list th {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            text-align: left;
            font-weight: bold;
            color: #334155;
        }

        .item-list td {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            color: #1e293b;
        }

        /* Caixa de Garantias Constitucionais */
        .garantias-box {
            background-color: #fefce8;
            border: 1px solid #fef08a;
            border-left: 4px solid #ca8a04;
            padding: 6px 10px;
            margin: 12px 0;
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 8pt;
            color: #713f12;
            line-height: 1.4;
        }

        /* Assinaturas */
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            font-family: 'DejaVu Sans', Arial, sans-serif;
        }

        .sig-cell {
            width: 48%;
            text-align: center;
            vertical-align: top;
            padding: 0 10px;
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
            color: #6b7280;
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
                    Direcção Central de Operações // Controlo Nacional de Celas Transitórias e Piquetes<br>
                    Jurisdição Territorial: {{ $detencao->processo?->provincia?->nome ?? 'Comando Provincial' }}
                </div>
            </td>
        </tr>
    </table>

    <!-- Título do Documento -->
    <div class="doc-title-box">
        <div class="doc-title">Auto de Detenção e Guia de Entrada em Cela</div>
        <div class="doc-subtitle">Controlo de Prazos Constitucionais de Custódia — Artigo 63.º da Constituição da República de Angola</div>
    </div>

    <!-- Metadados de Custódia -->
    <table class="meta-table">
        <tr>
            <td class="meta-label">ID de Custódia:</td>
            <td class="meta-val" style="font-family: 'DejaVu Sans Mono', monospace;">{{ $detencao->id }}</td>
            <td class="meta-label">Estado de Custódia:</td>
            <td class="meta-val"><strong>{{ str_replace('_', ' ', $detencao->estado_custodia) }}</strong></td>
        </tr>
        <tr>
            <td class="meta-label">Processo Vinculado:</td>
            <td class="meta-val">
                {{ $detencao->processo ? $detencao->processo->numero_processo . ' (' . $detencao->processo->tipologia_legal . ')' : 'Detenção Direta em Flagrante Delito' }}
            </td>
            <td class="meta-label">Local / Cela:</td>
            <td class="meta-val">{{ $detencao->local_detencao }}</td>
        </tr>
        <tr>
            <td class="meta-label">Data/Hora da Captura:</td>
            <td class="meta-val">{{ $detencao->data_hora_detencao->format('d/m/Y \à\s H:i') }}</td>
            <td class="meta-label">Limite Inviolável (48h):</td>
            <td class="meta-val-highlight">{{ $detencao->limite_legal_48h->format('d/m/Y \à\s H:i') }}</td>
        </tr>
        <tr>
            <td class="meta-label">Efetivo Captor (NIP):</td>
            <td class="meta-val">NIP: {{ $detencao->efetivo_captor_nip }}</td>
            <td class="meta-label">Emissão do Auto:</td>
            <td class="meta-val">{{ $dataEmissao }} às {{ $horaEmissao }}</td>
        </tr>
    </table>

    <!-- 1. Identificação do Detido -->
    <div class="section-title">1. Identificação do Cidadão Privado de Liberdade</div>
    <div class="content-block">
        <table class="meta-table" style="background:#ffffff;">
            <tr>
                <td class="meta-label">Nome Completo:</td>
                <td class="meta-val" colspan="3" style="font-size: 9.5pt; font-weight: bold; color: #000;">
                    {{ $detencao->individuo?->nome_completo ?? 'Não informado' }}
                </td>
            </tr>
            <tr>
                <td class="meta-label">N.º do B.I. / Passaporte:</td>
                <td class="meta-val">{{ $detencao->individuo?->numero_bi ?? 'Pendente de verificação' }}</td>
                <td class="meta-label">Género / Idade:</td>
                <td class="meta-val">
                    {{ $detencao->individuo?->genero ?? 'N/D' }} 
                    @if($detencao->individuo?->data_nascimento)
                        ({{ \Carbon\Carbon::parse($detencao->individuo->data_nascimento)->age }} anos)
                    @endif
                </td>
            </tr>
            <tr>
                <td class="meta-label">Filiação:</td>
                <td class="meta-val" colspan="3">
                    {{ $detencao->individuo?->filiacao_pai ?? 'Pai não declarado' }} e de {{ $detencao->individuo?->filiacao_mae ?? 'Mãe não declarada' }}
                </td>
            </tr>
            <tr>
                <td class="meta-label">Naturalidade / Nacionalidade:</td>
                <td class="meta-val">{{ $detencao->individuo?->naturalidade ?? 'Angolana' }} (Angolana)</td>
                <td class="meta-label">Residência Habitual:</td>
                <td class="meta-val">{{ $detencao->individuo?->morada_detalhada ?? 'Não declarada' }}</td>
            </tr>
        </table>
    </div>

    <!-- 2. Motivo Legal e Circunstâncias da Captura -->
    <div class="section-title">2. Fundamentação Legal e Fáctica da Restrição de Liberdade</div>
    <div class="content-block" style="border: 1px solid #cbd5e1; padding: 8px; background: #ffffff; font-size: 9.5pt;">
        {{ $detencao->motivo_legal }}
    </div>

    @if($detencao->observacoes_tramitacao)
    <div class="section-title">3. Notas de Tramitação e Despacho de Custódia</div>
    <div class="content-block" style="border: 1px solid #cbd5e1; padding: 8px; background: #ffffff; font-size: 9pt;">
        {{ $detencao->observacoes_tramitacao }}
    </div>
    @endif

    <!-- 4. Inventário de Bens e Objetos Retidos à Entrada -->
    <div class="section-title">4. Pertences e Bens Registados à Entrada da Cela</div>
    <div class="content-block">
        @if($detencao->bens && $detencao->bens->count() > 0)
            <table class="item-list">
                <thead>
                    <tr>
                        <th style="width: 25%;">N.º Lacre Inviolável</th>
                        <th style="width: 25%;">Categoria</th>
                        <th style="width: 35%;">Descrição do Objeto</th>
                        <th style="width: 15%;">Depósito / Cofre</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($detencao->bens as $bem)
                        <tr>
                            <td style="font-family: 'DejaVu Sans Mono', monospace; font-weight: bold;">{{ $bem->numero_lacre_seguranca }}</td>
                            <td>{{ str_replace('_', ' ', $bem->tipo_objeto) }}</td>
                            <td>{{ $bem->descricao_bem }}</td>
                            <td>{{ $bem->local_cofre_deposito }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div style="font-size: 8.5pt; color: #64748b; font-style: italic; padding: 4px;">
                Sem registo de bens apreendidos ou entregues sob custódia formal à entrada da cela.
            </div>
        @endif
    </div>

    <!-- Advertência Constitucional -->
    <div class="garantias-box">
        <strong>ADVERTÊNCIA CONSTITUCIONAL (ARTIGO 63.º DA CRA):</strong><br>
        1. A detenção sem culpa formada é comunicada no prazo de 48 horas ao magistrado do Ministério Público competente para a validação ou manutenção da medida privativa de liberdade.<br>
        2. É garantido ao detido o direito a comunicar imediatamente a sua situação à família ou a pessoa de sua confiança, bem como a assistência jurídica por advogado ou defensor oficioso.
    </div>

    <!-- Assinaturas -->
    <table class="signatures-table">
        <tr>
            <td class="sig-cell">
                <div class="sig-line">
                    O Oficial de Permanência / Efetivo Captor<br>
                    <span class="sig-role">NIP: {{ $detencao->efetivo_captor_nip }} — SIC/MINT</span>
                </div>
            </td>
            <td class="sig-cell">
                <div class="sig-line">
                    O Cidadão Detido / Testemunha Presencial<br>
                    <span class="sig-role">Tomou conhecimento formal às {{ $horaEmissao }}</span>
                </div>
            </td>
        </tr>
    </table>

    <!-- Rodapé Criptográfico -->
    <div class="footer-audit">
        REGISTO AUTOMATIZADO PELO SISTEMA INTEGRADO DE GESTÃO DE DADOS DO SIC (SIGD-SIC)<br>
        AUDITORIA CRIPTOGRÁFICA SHA-256: {{ hash('sha256', $detencao->id . '|' . $detencao->limite_legal_48h . '|' . $detencao->efetivo_captor_nip) }}<br>
        DOCUMENTO AUTÊNTICO CONFORME O ART. 63.º DA CONSTITUIÇÃO DA REPÚBLICA DE ANGOLA
    </div>

</body>
</html>
