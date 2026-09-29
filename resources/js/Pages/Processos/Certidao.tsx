import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import QRCode from 'qrcode';
import {
    QrCode,
    Printer,
    Download,
    CheckCircle2,
    Shield,
    FileText,
    Copy,
    Check,
    Calendar,
    UserCheck,
    Scale
} from 'lucide-react';
import { ProcessoCrime } from '@/types';

interface CertidaoProps {
    processo: ProcessoCrime;
    qr_verification_code: string;
    qr_validation_url?: string;
    data_emissao: string;
}

export default function ProcessosCertidao({ processo, qr_verification_code, qr_validation_url, data_emissao }: CertidaoProps) {
    const page = usePage<any>();
    const authUser = page.props?.auth?.user;
    const [copied, setCopied] = useState(false);
    const [qrImageUrl, setQrImageUrl] = useState<string>('');

    // Gera QR Code 100% real e escaneável por qualquer smartphone
    useEffect(() => {
        const textToEncode = qr_validation_url || `https://sic.gov.ao/validar?code=${qr_verification_code}`;
        QRCode.toDataURL(textToEncode, {
            width: 256,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        }).then(url => {
            setQrImageUrl(url);
        }).catch(err => {
            console.error('Falha ao renderizar QR code real:', err);
        });
    }, [qr_validation_url, qr_verification_code]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(qr_verification_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Assinante dinâmico a partir do utilizador autenticado
    const nomeAssinante = authUser?.nome_completo || 'Comissário-Geral Manuel Pascoal';
    const cargoAssinante = authUser?.perfil === 'ADMIN_SISTEMA'
        ? 'Administrador do Sistema SIGD-SIC (Tutela Técnica Geral)'
        : authUser?.perfil === 'MAGISTRADO_PGR'
        ? 'Magistrado do Ministério Público Titular'
        : authUser?.perfil === 'DIRETOR_NACIONAL'
        ? 'Director Nacional do SIC'
        : (authUser?.perfil || 'Oficial Responsável');
    const nipAssinante = authUser?.nip || 'SIC-ADM-001';
    const unidadeAssinante = authUser?.unidade?.nome || 'Direcção Nacional do SIC';

    return (
        <TacticalLayout title={`Certidão Oficial • ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-5xl mx-auto font-sans">
                {/* Abas Superiores do Processo */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="certidao"
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.print()}
                                className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>Imprimir Certidão Oficial</span>
                            </button>
                        </div>
                    }
                />

                {/* PAINEL DE CONTROLO DE VALIDAÇÃO CRIPTOGRÁFICA */}
                <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100">Certidão de Autenticidade & Andamento Processual</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Válida & Autenticada
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Código de Verificação Pública Criptográfica: <strong className="font-mono text-blue-300">{qr_verification_code}</strong>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleCopyCode}
                        className="px-3 py-1.5 bg-[#152538] hover:bg-[#1e344e] border border-[#20344d] text-slate-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                        <span>{copied ? 'Código Copiado!' : 'Copiar Hash'}</span>
                    </button>
                </div>

                {/* DOCUMENTO OFICIAL FORMATO FOLHA TIMBRADA A4 */}
                <div className="bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 border border-slate-300 max-w-4xl mx-auto font-serif print:shadow-none print:border-none print:p-0">
                    {/* CABEÇALHO REPÚBLICA DE ANGOLA */}
                    <div className="text-center space-y-1 border-b-2 border-slate-800 pb-6 mb-6">
                        <div className="flex justify-center mb-2">
                            {/* Brasão em SVG estilizado */}
                            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-[#c5a059]">
                                <Scale className="w-9 h-9" />
                            </div>
                        </div>
                        <h2 className="text-base font-bold uppercase tracking-widest text-slate-900">REPÚBLICA DE ANGOLA</h2>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">MINISTÉRIO DO INTERIOR &bull; SERVIÇO DE INVESTIGAÇÃO CRIMINAL</h3>
                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                            PROCURADORIA-GERAL DA REPÚBLICA JUNTO DO SIC &bull; PROVÍNCIA DE {processo.provincia?.nome?.toUpperCase() || 'BENGUELA'}
                        </h4>
                        <div className="pt-2 font-mono text-[10px] text-slate-500">
                            SISTEMA INTEGRADO DE GESTÃO DE DADOS (SIGD-SIC) &bull; DIRECÇÃO NACIONAL
                        </div>
                    </div>

                    {/* TÍTULO DO DOCUMENTO */}
                    <div className="text-center my-6">
                        <h1 className="text-lg font-bold uppercase tracking-wide underline underline-offset-4 text-slate-900">
                            CERTIDÃO DE SITUAÇÃO PROCESSUAL E INTEGRIDADE PROBATÓRIA
                        </h1>
                        <p className="font-mono text-xs text-slate-600 mt-1">
                            PROCESSO-CRIME N.º: <strong>{processo.numero_processo}</strong>
                        </p>
                    </div>

                    {/* CORPO DA CERTIDÃO */}
                    <div className="space-y-4 text-xs leading-relaxed text-justify text-slate-800 font-sans">
                        <p>
                            <strong>CERTIFICA-SE</strong>, para os devidos efeitos legais e a requerimento de quem de direito, que compulsados os registos informáticos centrais do <strong>SIGD-SIC</strong> e da <strong>Procuradoria-Geral da República de Angola</strong>, se encontra devidamente autuado e em instrução preparatória o inquérito supra referenciado, com os seguintes dados constantes do registo oficial:
                        </p>

                        <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2 font-mono text-[11px]">
                            <div className="grid grid-cols-2 gap-2">
                                <div><strong>Nº DO PROCESSO:</strong> {processo.numero_processo}</div>
                                <div><strong>INCIDÊNCIA PENAL:</strong> {processo.tipologia_legal}</div>
                                <div><strong>ESTADO PROCESSUAL:</strong> {processo.estado}</div>
                                <div><strong>DATA DE INSTAURAÇÃO:</strong> {processo.data_abertura || 'Em instrução'}</div>
                                <div><strong>MAGISTRADO TITULAR (PGR):</strong> {processo.magistrado_pgr_responsavel || 'Procuradoria da República'}</div>
                                <div><strong>INSTRUTOR RESPONSÁVEL:</strong> {processo.investigador?.nome_completo || 'Inspector de Turno'}</div>
                                <div><strong>SEGREDO DE JUSTIÇA:</strong> {processo.segredo_justica ? 'SIM (Activo)' : 'PÚBLICO'}</div>
                                <div><strong>JURISDIÇÃO:</strong> {processo.provincia?.nome || 'Nacional'}</div>
                            </div>
                        </div>

                        <p>
                            <strong>I. DA SITUAÇÃO DOS ARGUIDOS E PRAZOS CONSTITUCIONAIS:</strong><br />
                            {processo.detencoes && processo.detencoes.length > 0 ? (
                                <>
                                    Consta dos autos a detenção do cidadão <strong>{processo.detencoes[0].individuo?.nome_completo || 'Arguido Identificado'}</strong>, tendo sido a privação da liberdade auditada nos termos do <strong>Artigo 63.º da Constituição da República de Angola (CRA)</strong> e Código de Processo Penal Angolano (Lei n.º 39/20).
                                </>
                            ) : (
                                <>
                                    O processo prossegue sem arguidos em situação de detenção celular na presente fase instrutória.
                                </>
                            )}
                        </p>

                        <p>
                            <strong>II. DA CADEIA DE CUSTÓDIA E ELEMENTOS DE PROVA:</strong><br />
                            Encontram-se devidamente depositados no cofre de provas materiais do SIC {processo.bens?.length || 0} bem(ns) apreendido(s) sob selos de lacre inviolável rastreáveis, garantindo-se a imutabilidade das fontes probatórias coligidas na instrução.
                        </p>

                        <p>
                            Por ser verdade e constar dos livros de assento e da base criptográfica federada do SIC/PGR, lavrou-se a presente certidão que vai autenticada com a aposição do Código de Verificação Pública e chancela digital institucional.
                        </p>
                    </div>

                    {/* QR CODE E CHANCELA DE VALIDAÇÃO (100% REAL E ESCANEÁVEL) */}
                    <div className="mt-10 pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
                        {/* QR Code Autêntico gerado com QRCode.toDataURL */}
                        <div className="flex items-center gap-4">
                            <div className="p-1 border-2 border-slate-900 rounded bg-white shrink-0 shadow-sm">
                                {qrImageUrl ? (
                                    <img
                                        src={qrImageUrl}
                                        alt={`QR Code de Verificação - ${qr_verification_code}`}
                                        className="w-24 h-24 block"
                                    />
                                ) : (
                                    <div className="w-24 h-24 flex items-center justify-center text-[10px] font-mono text-slate-400">
                                        Gerando QR...
                                    </div>
                                )}
                            </div>
                            <div className="font-mono text-[10px] text-slate-600 space-y-1">
                                <div className="font-bold text-slate-900 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>QR CODE OFICIAL ESCANEÁVEL</span>
                                </div>
                                <div className="text-slate-500">Aponte a câmara do telemóvel para validar</div>
                                <div>Código: <strong className="text-slate-900">{qr_verification_code}</strong></div>
                                <div>Emitido em: {data_emissao}</div>
                            </div>
                        </div>

                        {/* Assinatura Oficial Totalmente Dinâmica */}
                        <div className="text-center font-sans">
                            <div className="w-64 border-b border-slate-900 pb-1 mb-1 mx-auto">
                                <span className="font-serif italic text-xs text-slate-500 font-bold">Assinado Digitalmente pelo Sistema</span>
                            </div>
                            <div className="font-bold text-xs text-slate-900">{nomeAssinante}</div>
                            <div className="text-[10px] text-slate-600">{cargoAssinante}</div>
                            <div className="font-mono text-[9px] text-slate-500">NIP: {nipAssinante} &bull; {unidadeAssinante}</div>
                        </div>
                    </div>
                </div>
            </div>
        </TacticalLayout>
    );
}
