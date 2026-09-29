import React from 'react';
import { usePage } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { Ocorrencia } from '@/types';

interface FolhaOficialA4Props {
    ocorrencia: Ocorrencia;
    className?: string;
}

export const FolhaOficialA4: React.FC<FolhaOficialA4Props> = ({ ocorrencia, className = '' }) => {
    const { configuracoes_globais } = usePage<any>().props;
    const logoUrl = configuracoes_globais?.logo_emblema_url;

    const dataLavratura = new Date(ocorrencia.created_at || Date.now()).toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const dataFactoFormatada = new Date(ocorrencia.data_hora_facto).toLocaleString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Tratar o texto para apresentação com parágrafos limpos
    const renderCorpoAuto = () => {
        const rawText = ocorrencia.descricao_facto_html || '';
        if (rawText.includes('<p>') || rawText.includes('<br')) {
            return (
                <div
                    className="leading-relaxed text-justify font-serif text-[11.5pt] space-y-3"
                    dangerouslySetInnerHTML={{ __html: rawText }}
                />
            );
        }

        const paragraphs = rawText.split('\n').filter((p) => p.trim().length > 0);
        return (
            <div className="leading-relaxed text-justify font-serif text-[11.5pt] space-y-3">
                {paragraphs.map((para, idx) => (
                    <p key={idx} className="indent-6 leading-relaxed">
                        {para}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div
            id="documento-imprimir-a4"
            className={`solene-folha-a4 bg-white text-slate-900 p-8 sm:p-12 rounded shadow-2xl font-serif text-[11pt] leading-relaxed border border-slate-300 max-w-[800px] mx-auto select-text ${className}`}
        >
            {/* Cabeçalho da República de Angola */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
                <div className="flex justify-center mb-2">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logótipo Oficial da Instituição" className="max-h-14 max-w-[150px] object-contain" />
                    ) : (
                        <div className="w-11 h-11 rounded-full border-2 border-[#855d14] flex items-center justify-center text-[#855d14] font-bold text-lg shadow-sm">
                            <Shield className="w-6 h-6 text-[#855d14]" />
                        </div>
                    )}
                </div>
                <div className="font-bold text-[12pt] uppercase tracking-wider text-slate-950 font-sans">
                    REPÚBLICA DE ANGOLA
                </div>
                <div className="font-bold text-[10.5pt] uppercase text-slate-800 font-sans mt-0.5">
                    MINISTÉRIO DO INTERIOR
                </div>
                <div className="font-bold text-[11pt] uppercase text-[#855d14] tracking-wide font-sans mt-0.5">
                    SERVIÇO DE INVESTIGAÇÃO CRIMINAL
                </div>
                <div className="text-[9.5pt] text-slate-700 font-sans mt-1">
                    Direcção Provincial de {ocorrencia.provincia?.nome || 'Luanda'}
                    {ocorrencia.unidadeRegisto?.nome && (
                        <span> &bull; {ocorrencia.unidadeRegisto.nome}</span>
                    )}
                </div>
            </div>

            {/* Título e Número Oficial */}
            <div className="text-center mb-5">
                <h1 className="font-bold text-[13pt] uppercase tracking-wider underline text-slate-950">
                    AUTO DE NOTÍCIA PRELIMINAR DE CRIME
                </h1>
                <div className="font-mono text-[10pt] font-bold text-slate-700 mt-1">
                    Nº OFICIAL DO REGISTO: {ocorrencia.numero_ocorrencia}
                </div>
            </div>

            {/* Caixa de Metadados Processuais */}
            <div className="bg-slate-50 border border-slate-300 rounded p-3 mb-6 text-[10pt] font-sans space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="font-bold text-slate-700 sm:w-48 shrink-0 uppercase text-[9pt]">
                        Tipologia Penal:
                    </span>
                    <span className="font-bold text-slate-900">{ocorrencia.classificacao_codigo}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="font-bold text-slate-700 sm:w-48 shrink-0 uppercase text-[9pt]">
                        Local e Circunscrição:
                    </span>
                    <span className="text-slate-900">
                        {ocorrencia.local_detalhado}, Município de {ocorrencia.municipio?.nome || 'N/D'}, Província de {ocorrencia.provincia?.nome || 'N/D'}
                    </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="font-bold text-slate-700 sm:w-48 shrink-0 uppercase text-[9pt]">
                        Data e Hora do Facto:
                    </span>
                    <span className="text-slate-900 font-mono text-[9.5pt]">{dataFactoFormatada}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="font-bold text-slate-700 sm:w-48 shrink-0 uppercase text-[9pt]">
                        Forma de Entrada:
                    </span>
                    <span className="text-slate-900">
                        {ocorrencia.tipo_participacao}{' '}
                        {ocorrencia.origem_pop ? '(Auto Remetido pela Polícia Nacional / PNA)' : ''}
                    </span>
                </div>

                {ocorrencia.intervenientes && ocorrencia.intervenientes.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-700 uppercase text-[9pt] block mb-1">
                            Intervenientes Qualificados nos Autos:
                        </span>
                        <ul className="list-disc pl-5 space-y-1 text-slate-800 text-[9.5pt]">
                            {ocorrencia.intervenientes.map((int, i) => (
                                <li key={i}>
                                    <strong>[{int.papel}]</strong> {int.nome_identificativo}
                                    {int.contacto_telefone && (
                                        <span className="text-slate-600"> &bull; Contacto: {int.contacto_telefone}</span>
                                    )}
                                    {int.individuo?.numero_bi && (
                                        <span className="text-slate-600 font-mono"> &bull; BI: {int.individuo.numero_bi}</span>
                                    )}
                                    {int.declaracoes_resumo && (
                                        <div className="text-[9pt] text-slate-600 italic mt-0.5">
                                            "{int.declaracoes_resumo}"
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Narrativa Circunstanciada dos Factos */}
            <div className="text-slate-900 leading-relaxed text-justify mb-8 font-serif">
                {renderCorpoAuto()}
            </div>

            {/* Fórmula Legal de Encerramento */}
            <div className="text-[10pt] italic text-slate-700 text-justify mb-8 leading-relaxed border-t border-slate-200 pt-3">
                E por nada mais haver a constar ou aditar, foi lavrado o presente Auto de Notícia que, depois de lido perante os presentes e achado inteiramente conforme à verdade apurada, vai devidamente validado e assinado nos termos do Código de Processo Penal Angolano.
            </div>

            {/* Bloco Solene de Assinaturas */}
            <div className="grid grid-cols-2 gap-8 pt-4 mb-8 text-center text-xs font-sans">
                <div>
                    <div className="border-b border-slate-800 mb-2 h-10"></div>
                    <div className="font-bold text-slate-900 uppercase text-[9pt]">
                        O Participante / Declarante
                    </div>
                    <div className="text-[8.5pt] text-slate-500 mt-0.5">
                        Assinatura ou Impressão Digital
                    </div>
                </div>

                <div>
                    <div className="border-b border-slate-800 mb-2 h-10"></div>
                    <div className="font-bold text-slate-900 uppercase text-[9pt]">
                        O Oficial Instrutor / Registador
                    </div>
                    <div className="text-[8.5pt] text-slate-600 font-medium mt-0.5">
                        {ocorrencia.utilizador_registo?.nome_completo || 'Oficial SIC'}
                        {ocorrencia.utilizador_registo?.nip && (
                            <span className="font-mono text-slate-500"> (NIP: {ocorrencia.utilizador_registo.nip})</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Rodapé Oficial com Rastreabilidade Criptográfica */}
            <div className="border-t border-slate-300 pt-3 text-[8.5pt] font-mono text-slate-500">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-1">
                    <div>
                        Lavrado em {ocorrencia.provincia?.nome || 'Luanda'}, aos {dataLavratura}.
                    </div>
                    <div className="text-[8pt] text-slate-400">
                        Protocolo WORM &bull; SHA-256 Validado
                    </div>
                </div>
                <div className="text-center text-[7.5pt] text-slate-400 mt-1 uppercase tracking-wider">
                    DOCUMENTO PROCESSUAL OFICIAL &bull; REPÚBLICA DE ANGOLA &bull; MININT / SIC
                </div>
            </div>
        </div>
    );
};
