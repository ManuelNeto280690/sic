import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import { ProcessoCrime } from '@/types';
import {
    Landmark,
    DollarSign,
    Lock,
    Unlock,
    AlertTriangle,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    Plus,
    Save,
    CheckCircle2,
    FileSpreadsheet,
    Scale,
    ArrowUpRight,
    ArrowDownLeft,
    UploadCloud,
    HelpCircle,
    FileText,
    Check,
    ChevronDown,
    ChevronUp,
    Download,
} from 'lucide-react';

interface ContaFinanceira {
    id: string;
    banco_comercial: string;
    titular_nome: string;
    titular_nif: string;
    iban_completo: string;
    numero_conta: string;
    mandado_quebra_sigilo: string;
    saldo_contabilistico_kz: number;
    total_creditos_apurados_kz: number;
    total_debitos_apurados_kz: number;
    grau_suspeicao: 'CRITICO' | 'ALTO' | 'MEDIO' | 'NORMAL';
    congelamento_cautelar_ativo: boolean;
    numero_auto_bloqueio_senra?: string;
    data_hora_bloqueio?: string;
    fundamentacao_financeira?: string;
}

interface TransacaoSuspeita {
    id: string;
    conta_id: string;
    data_hora_movimento: string;
    valor_kz: number;
    moeda: string;
    natureza: 'CREDITO' | 'DEBITO';
    tipo_operacao: string;
    nome_contraparte?: string;
    iban_contraparte?: string;
    alerta_padrao_lavagem: string;
    descricao_extrato: string;
    conta?: {
        banco_comercial: string;
        iban_completo: string;
    };
}

interface FinanceiroProps {
    processo: ProcessoCrime;
    contas: ContaFinanceira[];
    transacoes: TransacaoSuspeita[];
    resumo_financeiro: {
        saldo_total_apurado_kz: number;
        total_bloqueado_kz: number;
        total_contas: number;
        contas_bloqueadas: number;
    };
}

export default function ProcessosFinanceiro({
    processo,
    contas,
    transacoes,
    resumo_financeiro,
}: FinanceiroProps) {
    const [showContaForm, setShowContaForm] = useState(false);
    const [showTransacaoForm, setShowTransacaoForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showGuiaOperacional, setShowGuiaOperacional] = useState(true);

    // Form para carregar ficheiro de extrato real
    const importForm = useForm<{
        conta_id: string;
        ficheiro_extrato: File | null;
        lote_demonstrativo: string;
    }>({
        conta_id: contas.length > 0 ? contas[0].id : '',
        ficheiro_extrato: null,
        lote_demonstrativo: '',
    });

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        importForm.post(route('processos.financeiro.importar-extrato', processo.id), {
            forceFormData: true,
            onSuccess: () => {
                importForm.reset();
                setShowImportModal(false);
            },
        });
    };

    const handleCarregarLotePadrao = () => {
        importForm.setData('lote_demonstrativo', 'SIM');
        importForm.post(route('processos.financeiro.importar-extrato', processo.id), {
            onSuccess: () => {
                setShowImportModal(false);
            },
        });
    };

    // Form para cadastrar nova conta
    const contaForm = useForm({
        banco_comercial: 'BANCO ANGOLANO DE INVESTIMENTOS (BAI)',
        titular_nome: '',
        titular_nif: '',
        iban_completo: '',
        numero_conta: '',
        mandado_quebra_sigilo: 'DESP-PGR-SIG-2026/041',
        saldo_contabilistico_kz: '0',
        grau_suspeicao: 'ALTO',
        fundamentacao_financeira: 'Conta identificada na instrução financeira como receptáculo de proventos ilícitos.',
    });

    // Form para lançar transação suspeita
    const transacaoForm = useForm({
        conta_id: contas.length > 0 ? contas[0].id : '',
        data_hora_movimento: new Date().toISOString().slice(0, 16),
        valor_kz: '4900000',
        natureza: 'CREDITO',
        tipo_operacao: 'DEPOSITO_NUMERARIO',
        nome_contraparte: 'Depósito em Numerário ao Balcão',
        iban_contraparte: '',
        alerta_padrao_lavagem: 'SMURFING_FRACIONAMENTO',
        descricao_extrato: 'Depósito fracionado abaixo do limiar de notificação obrigatória do BNA (Lei 5/20).',
    });

    const handleContaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        contaForm.post(route('processos.financeiro.contas.store', processo.id), {
            onSuccess: () => {
                contaForm.reset();
                setShowContaForm(false);
            },
        });
    };

    const handleTransacaoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transacaoForm.post(route('processos.financeiro.transacoes.store', processo.id), {
            onSuccess: () => {
                transacaoForm.reset();
                setShowTransacaoForm(false);
            },
        });
    };

    const handleCongelarConta = (contaId: string, iban: string) => {
        if (confirm(`Tem a certeza que deseja emitir o Auto de Bloqueio e Congelamento Cautelar Imediato (SENRA / BNA) para a conta ${iban}?`)) {
            router.post(route('processos.financeiro.contas.congelar', [processo.id, contaId]));
        }
    };

    const formatKz = (val: number) => {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA',
            maximumFractionDigits: 2,
        }).format(val);
    };

    return (
        <TacticalLayout title={`Investigação Financeira • ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Abas Oficiais do Processo */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="financeiro"
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#d6b26c] text-[#0b131e] text-xs font-sans font-bold rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Carregar Extrato Bancário (CSV)</span>
                            </button>

                            <button
                                onClick={() => setShowGuiaOperacional(!showGuiaOperacional)}
                                className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <HelpCircle className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>{showGuiaOperacional ? 'Ocultar Guia' : 'Como se Trabalha?'}</span>
                            </button>

                            <button
                                onClick={() => setShowContaForm(!showContaForm)}
                                className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>{showContaForm ? 'Fechar Conta' : 'Averbar Conta'}</span>
                            </button>

                            <button
                                onClick={() => setShowTransacaoForm(!showTransacaoForm)}
                                className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                                <span>{showTransacaoForm ? 'Fechar Movimento' : 'Lançar Manual'}</span>
                            </button>
                        </div>
                    }
                />

                {/* GUIA OPERACIONAL DIDÁTICO: FLUXO DE TRABALHO REAL DO INVESTIGADOR */}
                {showGuiaOperacional && (
                    <div className="bg-[#0b141f] border border-[#1e2f42] rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-[#1e2f42] pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#132233] border border-[#223954] flex items-center justify-center text-[#c5a059]">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-100">
                                        Manual Operacional de Investigação Económica & Financeira (DNCF / SIC)
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Procedimento padronizado para tratamento de sigilo bancário, análise forense e medidas cautelares:
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGuiaOperacional(false)}
                                className="text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
                            >
                                ✕ Recolher
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-sans">
                            <div className="p-3 bg-[#0f1b29] rounded-lg border border-[#1e2f42] space-y-1.5">
                                <div className="font-mono text-[10px] text-[#c5a059] font-bold uppercase tracking-wider">Passo 01 &bull; Sigilo</div>
                                <div className="font-bold text-slate-200">Mandado Judicial</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Com o despacho do Juiz de Garantias ou PGR, averba-se a conta do arguido no botão <strong>"Averbar Conta"</strong>.
                                </p>
                            </div>

                            <div className="p-3 bg-[#0f1b29] rounded-lg border border-[#1e2f42] space-y-1.5">
                                <div className="font-mono text-[10px] text-[#c5a059] font-bold uppercase tracking-wider">Passo 02 &bull; Ingestão</div>
                                <div className="font-bold text-slate-200">Carregar Extrato</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    O banco remete o ficheiro. Clica-se em <strong>"Carregar Extrato (CSV)"</strong> para carregar centenas de lançamentos de uma vez.
                                </p>
                            </div>

                            <div className="p-3 bg-[#0f1b29] rounded-lg border border-[#1e2f42] space-y-1.5">
                                <div className="font-mono text-[10px] text-[#c5a059] font-bold uppercase tracking-wider">Passo 03 &bull; Análise</div>
                                <div className="font-bold text-slate-200">Deteção de Padrões</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    O motor identifica fracionamento (depósitos &lt; 5M Kz), entidades de fachada e circuitos de transbordo rápido.
                                </p>
                            </div>

                            <div className="p-3 bg-[#0f1b29] rounded-lg border border-[#1e2f42] space-y-1.5">
                                <div className="font-mono text-[10px] text-[#c5a059] font-bold uppercase tracking-wider">Passo 04 &bull; Cautelar</div>
                                <div className="font-bold text-slate-200">Congelar no SENRA</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Aciona-se <strong>"Congelar Conta"</strong> para bloquear os fundos junto do BNA e SENRA, prevenindo a dissipação de ativos.
                                </p>
                            </div>

                            <div className="p-3 bg-[#0f1b29] rounded-lg border border-[#1e2f42] space-y-1.5">
                                <div className="font-mono text-[10px] text-[#c5a059] font-bold uppercase tracking-wider">Passo 05 &bull; Prova</div>
                                <div className="font-bold text-slate-200">Auto Pericial</div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Os saldos apurados e os extratos consolidados instruem o relatório de investigação para remessa ao tribunal.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAINEL DE CONTROLO DE PATRIMÓNIO & RECUPERAÇÃO DE ATIVOS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Fundos Auditados</span>
                        <div className="text-xl font-bold font-mono text-slate-100">
                            {formatKz(resumo_financeiro.saldo_total_apurado_kz)}
                        </div>
                        <span className="text-[11px] text-slate-400">Total em contas sob quebra de sigilo</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Bloqueado Cautelarmente (SENRA)</span>
                        <div className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
                            <span>{formatKz(resumo_financeiro.total_bloqueado_kz)}</span>
                            {resumo_financeiro.total_bloqueado_kz > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60 font-sans font-normal">Cautelar</span>
                            )}
                        </div>
                        <span className="text-[11px] text-slate-400">Fundos congelados pelo tribunal</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Contas Bancárias</span>
                        <div className="text-xl font-bold font-mono text-slate-100">
                            {resumo_financeiro.total_contas} <span className="text-xs font-normal text-slate-400">Contas</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            {resumo_financeiro.contas_bloqueadas} sob congelamento ativo
                        </span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Base Legal</span>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1 font-mono pt-1">
                            <Scale className="w-3.5 h-3.5 text-[#c5a059]" /> Lei n.º 5/20 &bull; DNCF
                        </div>
                        <span className="text-[10px] text-slate-400">Combate ao Branqueamento de Capitais</span>
                    </div>
                </div>

                {/* FORMULÁRIO DE NOVA CONTA BANCÁRIA SOB SIGILO */}
                {showContaForm && (
                    <TacticalCard
                        title="Cadastrar Conta Bancária sob Quebra de Sigilo Judicial"
                        icon={<Landmark className="w-4 h-4 text-[#c5a059]" />}
                    >
                        <form onSubmit={handleContaSubmit} className="space-y-4 font-sans text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Banco Comercial</label>
                                    <select
                                        value={contaForm.data.banco_comercial}
                                        onChange={e => contaForm.setData('banco_comercial', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="BANCO ANGOLANO DE INVESTIMENTOS (BAI)">Banco Angolano de Investimentos (BAI)</option>
                                        <option value="BANCO DE FOMENTO ANGOLA (BFA)">Banco de Fomento Angola (BFA)</option>
                                        <option value="BANCO BIC (BANCO DE INVESTIMENTO RURAL)">Banco BIC</option>
                                        <option value="BANCO MILLENNIUM ATLANTICO">Banco Millennium Atlântico</option>
                                        <option value="STANDARD BANK ANGOLA">Standard Bank Angola</option>
                                        <option value="BANCO DE NEGOCIOS INTERNACIONAL (BNI)">Banco BNI</option>
                                        <option value="BANCO SOL">Banco Sol</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Titular da Conta</label>
                                    <input
                                        type="text"
                                        value={contaForm.data.titular_nome}
                                        onChange={e => contaForm.setData('titular_nome', e.target.value)}
                                        placeholder="Nome da pessoa física ou coletiva"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">NIF do Titular</label>
                                    <input
                                        type="text"
                                        value={contaForm.data.titular_nif}
                                        onChange={e => contaForm.setData('titular_nif', e.target.value)}
                                        placeholder="Número de Identificação Fiscal"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">IBAN Completo (Padrão AO06...)</label>
                                    <input
                                        type="text"
                                        value={contaForm.data.iban_completo}
                                        onChange={e => contaForm.setData('iban_completo', e.target.value)}
                                        placeholder="AO06.XXXX.XXXX.XXXX.XXXX.XXXX.X"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Número de Conta</label>
                                    <input
                                        type="text"
                                        value={contaForm.data.numero_conta}
                                        onChange={e => contaForm.setData('numero_conta', e.target.value)}
                                        placeholder="Ex: 1829401810"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Saldo Contabilístico (AOA)</label>
                                    <input
                                        type="number"
                                        value={contaForm.data.saldo_contabilistico_kz}
                                        onChange={e => contaForm.setData('saldo_contabilistico_kz', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Despacho de Quebra de Sigilo (PGR)</label>
                                    <input
                                        type="text"
                                        value={contaForm.data.mandado_quebra_sigilo}
                                        onChange={e => contaForm.setData('mandado_quebra_sigilo', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Grau de Suspeição Financeira</label>
                                    <select
                                        value={contaForm.data.grau_suspeicao}
                                        onChange={e => contaForm.setData('grau_suspeicao', e.target.value as any)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="CRITICO">CRÍTICO (Fortes indícios de lavagem/peculato)</option>
                                        <option value="ALTO">ALTO (Transações incompatíveis com rendimentos)</option>
                                        <option value="MEDIO">MÉDIO (Em apuração e correlação)</option>
                                        <option value="NORMAL">NORMAL (Conta subsidiária)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#20344d]">
                                <button
                                    type="button"
                                    onClick={() => setShowContaForm(false)}
                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded border border-[#20344d]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={contaForm.processing}
                                    className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#d6b26c] text-[#0b131e] font-bold rounded flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{contaForm.processing ? 'Averbando...' : 'Averbar Conta nos Autos'}</span>
                                </button>
                            </div>
                        </form>
                    </TacticalCard>
                )}

                {/* FORMULÁRIO DE LANÇAMENTO DE TRANSAÇÃO SUSPEITA */}
                {showTransacaoForm && (
                    <TacticalCard
                        title="Lançar Transação Suspeita (Algoritmo de Deteção de Lavagem)"
                        icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
                    >
                        <form onSubmit={handleTransacaoSubmit} className="space-y-4 font-sans text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Conta de Origem/Auditada</label>
                                    <select
                                        value={transacaoForm.data.conta_id}
                                        onChange={e => transacaoForm.setData('conta_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        {contas.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.banco_comercial} — {c.titular_nome} ({c.iban_completo})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Valor da Transação (AOA)</label>
                                    <input
                                        type="number"
                                        value={transacaoForm.data.valor_kz}
                                        onChange={e => transacaoForm.setData('valor_kz', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Natureza do Movimento</label>
                                    <select
                                        value={transacaoForm.data.natureza}
                                        onChange={e => transacaoForm.setData('natureza', e.target.value as any)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="CREDITO">CRÉDITO (Entrada de Fundos)</option>
                                        <option value="DEBITO">DÉBITO (Saída / Transferência)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Tipo de Operação</label>
                                    <select
                                        value={transacaoForm.data.tipo_operacao}
                                        onChange={e => transacaoForm.setData('tipo_operacao', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="DEPOSITO_NUMERARIO">Depósito em Numerário</option>
                                        <option value="TRANSFERENCIA_IBAN">Transferência Bancária (IBAN)</option>
                                        <option value="LEVANTAMENTO_BALCAO">Levantamento em Caixa</option>
                                        <option value="PAGAMENTO_TPA">Pagamento TPA (Compra de Ativo)</option>
                                        <option value="OPERACAO_CAMBIAL_DIVISAS">Operação Cambial (USD/EUR)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Padrão Típico de Lavagem Detetado</label>
                                    <select
                                        value={transacaoForm.data.alerta_padrao_lavagem}
                                        onChange={e => transacaoForm.setData('alerta_padrao_lavagem', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="SMURFING_FRACIONAMENTO">Smurfing / Fracionamento em Numerário</option>
                                        <option value="CONTA_PASSAGEM_TRANSBORDO">Conta de Passagem / Transbordo</option>
                                        <option value="TESTA_DE_FERRO_LARANJA">Testa-de-Ferro (Laranja)</option>
                                        <option value="DESVIO_FUNDO_PUBLICO">Desvio de Fundos Públicos</option>
                                        <option value="REMESSA_EXTERIOR_ILICITA">Remessa Ilegal para o Exterior</option>
                                        <option value="TRANSACAO_COMPATIVEL">Transação Ordinária em Análise</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Nome da Contraparte</label>
                                    <input
                                        type="text"
                                        value={transacaoForm.data.nome_contraparte}
                                        onChange={e => transacaoForm.setData('nome_contraparte', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Descrição / Histórico do Extrato</label>
                                <textarea
                                    value={transacaoForm.data.descricao_extrato}
                                    onChange={e => transacaoForm.setData('descricao_extrato', e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#20344d]">
                                <button
                                    type="button"
                                    onClick={() => setShowTransacaoForm(false)}
                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded border border-[#20344d]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={transacaoForm.processing}
                                    className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#d6b26c] text-[#0b131e] font-bold rounded flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{transacaoForm.processing ? 'Gravando...' : 'Lançar Transação'}</span>
                                </button>
                            </div>
                        </form>
                    </TacticalCard>
                )}

                {/* CONTAS BANCÁRIAS AUDITADAS & BOTÃO DE CONGELAMENTO CAUTELAR */}
                <TacticalCard
                    title={`Contas Bancárias sob Quebra de Sigilo (${contas.length})`}
                    icon={<Landmark className="w-4 h-4 text-[#c5a059]" />}
                >
                    {contas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contas.map(conta => (
                                <div
                                    key={conta.id}
                                    className={`p-4 rounded-lg border transition-all ${
                                        conta.congelamento_cautelar_ativo
                                            ? 'bg-[#111822] border-rose-900/60 shadow-lg'
                                            : 'bg-[#0f1b29] border-[#20344d]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 border-b border-[#20344d] pb-2 mb-3">
                                        <div>
                                            <div className="font-bold text-slate-100 text-xs">{conta.banco_comercial}</div>
                                            <div className="font-mono text-[11px] text-slate-400">Titular: <strong>{conta.titular_nome}</strong> (NIF: {conta.titular_nif})</div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                            conta.grau_suspeicao === 'CRITICO' ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60' :
                                            'bg-[#132233] text-slate-300 border border-[#223954]'
                                        }`}>
                                            {conta.grau_suspeicao}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs font-mono">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-slate-500">IBAN:</span>
                                            <strong className="text-slate-200">{conta.iban_completo}</strong>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-slate-500">Mandado PGR:</span>
                                            <span className="text-slate-300">{conta.mandado_quebra_sigilo}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1e2f42]">
                                            <span className="text-slate-400 font-sans">Saldo Contabilístico:</span>
                                            <span className="font-bold text-sm text-slate-100">{formatKz(conta.saldo_contabilistico_kz)}</span>
                                        </div>
                                    </div>

                                    {/* Estado do Bloqueio SENRA & Ação */}
                                    <div className="mt-4 pt-3 border-t border-[#20344d] flex items-center justify-between">
                                        {conta.congelamento_cautelar_ativo ? (
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-1 rounded border border-rose-800/60">
                                                <Lock className="w-3.5 h-3.5" />
                                                <span>BLOQUEADA ({conta.numero_auto_bloqueio_senra})</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                                <Unlock className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Ativa (Disponível p/ Bloqueio)</span>
                                            </div>
                                        )}

                                        {!conta.congelamento_cautelar_ativo && (
                                            <button
                                                type="button"
                                                onClick={() => handleCongelarConta(conta.id, conta.iban_completo)}
                                                className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-200 rounded text-[11px] font-mono font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <Lock className="w-3 h-3" />
                                                <span>Congelar Conta (SENRA)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            Nenhuma conta bancária averbada ao inquérito até ao momento.
                        </div>
                    )}
                </TacticalCard>

                {/* HISTÓRICO DE TRANSAÇÕES FINANCEIRAS SUSPEITAS (FOLLOW THE MONEY) */}
                <TacticalCard
                    title={`Transações Suspeitas Detetadas nos Autos (${transacoes.length})`}
                    icon={<TrendingDown className="w-4 h-4 text-[#c5a059]" />}
                >
                    {transacoes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-sans">
                                <thead>
                                    <tr className="border-b border-[#20344d] text-slate-400 text-[10px] uppercase font-mono">
                                        <th className="py-2.5 px-3">Data</th>
                                        <th className="py-2.5 px-3">Movimento</th>
                                        <th className="py-2.5 px-3">Montante (AOA)</th>
                                        <th className="py-2.5 px-3">Tipo de Operação</th>
                                        <th className="py-2.5 px-3">Contraparte</th>
                                        <th className="py-2.5 px-3">Padrão de Lavagem</th>
                                        <th className="py-2.5 px-3">Histórico do Extrato</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1e2f42] text-slate-200 font-mono text-[11px]">
                                    {transacoes.map(t => (
                                        <tr key={t.id} className="hover:bg-[#0f1b29] transition-colors">
                                            <td className="py-2.5 px-3 text-slate-400">
                                                {t.data_hora_movimento}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                {t.natureza === 'CREDITO' ? (
                                                    <span className="text-slate-200 flex items-center gap-1 font-mono text-[10px] font-medium">
                                                        <ArrowDownLeft className="w-3.5 h-3.5 text-slate-400" /> CRÉDITO
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px] font-medium">
                                                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> DÉBITO
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-slate-100">
                                                {formatKz(t.valor_kz)}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-300">
                                                {t.tipo_operacao.replace(/_/g, ' ')}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-300 font-sans">
                                                {t.nome_contraparte || '—'}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-[#132233] text-slate-200 border border-[#223954]">
                                                    {t.alerta_padrao_lavagem.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-400 text-[10px] max-w-xs truncate font-sans">
                                                {t.descricao_extrato}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            Nenhuma transação financeira suspeita registada neste processo.
                        </div>
                    )}
                </TacticalCard>

                {/* MODAL DE IMPORTAÇÃO DE EXTRATO BANCÁRIO */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f1b29] border border-[#223750] rounded-xl max-w-xl w-full shadow-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#20344d] pb-3">
                                <div className="flex items-center gap-2 text-slate-100 font-bold text-xs uppercase font-mono">
                                    <UploadCloud className="w-4 h-4 text-[#c5a059]" />
                                    <span>Importador de Extrato Bancário Real (CSV / TXT)</span>
                                </div>
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="text-slate-400 hover:text-rose-400 font-bold p-1 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs font-sans">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                                        Selecionar Conta Bancária sob Investigação
                                    </label>
                                    <select
                                        value={importForm.data.conta_id}
                                        onChange={e => importForm.setData('conta_id', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2.5 rounded focus:border-[#c5a059]"
                                        required
                                    >
                                        {contas.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.banco_comercial} — {c.titular_nome} ({c.iban_completo})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-4 bg-[#0d1a26] border-2 border-dashed border-[#20344d] rounded-lg text-center space-y-2">
                                    <FileSpreadsheet className="w-8 h-8 text-[#c5a059] mx-auto" />
                                    <div className="font-bold text-slate-200">
                                        Ficheiro de Extrato Fornecido pelo Banco
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Formatos aceites: <strong>.CSV</strong>, <strong>.TXT</strong> (Delimitado por vírgula ou ponto-e-vírgula)
                                    </p>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={e => importForm.setData('ficheiro_extrato', e.target.files ? e.target.files[0] : null)}
                                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#17283c] file:text-slate-200 hover:file:bg-[#1f3752] cursor-pointer"
                                    />
                                </div>

                                <div className="p-3 bg-[#080d14] rounded border border-[#1e2f42] text-[10px] font-mono text-slate-400 space-y-1">
                                    <div className="text-slate-300 font-bold">Estrutura Padrão das Colunas no Ficheiro:</div>
                                    <div>Data; Descrição; Montante (Kz); Natureza (CREDITO/DEBITO); Contraparte; TipoOperação</div>
                                    <div className="text-slate-400">Exemplo: 2026-09-24; Depósito numerário balcão; 4900000; CREDITO; Depósito em Caixa; DEPOSITO_NUMERARIO</div>
                                </div>

                                <div className="pt-2 border-t border-[#20344d] flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCarregarLotePadrao}
                                        disabled={importForm.processing}
                                        className="px-3 py-2 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 rounded font-sans text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                                        title="Injeta 6 transações reais de teste (Smurfing, Compras de Luxo e Transbordo)"
                                    >
                                        <span>⚡ Ingerir Lote de Teste BAI/BFA (6 Movimentos)</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowImportModal(false)}
                                            className="px-3 py-2 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded text-xs cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={importForm.processing || !importForm.data.ficheiro_extrato}
                                            className="px-4 py-2 bg-[#c5a059] hover:bg-[#d6b26c] disabled:opacity-50 text-[#0b131e] font-bold rounded flex items-center gap-1.5 cursor-pointer text-xs"
                                        >
                                            <UploadCloud className="w-3.5 h-3.5" />
                                            <span>{importForm.processing ? 'Processando...' : 'Processar Extrato'}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </TacticalLayout>
    );
}
