import React, { useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { TacticalLayout } from '@/Layouts/TacticalLayout';
import { TacticalCard } from '@/Components/UI/TacticalCard';
import { ProcessoHeaderTabs } from '@/Components/Processos/ProcessoHeaderTabs';
import { ProcessoCrime } from '@/types';
import {
    Radio,
    PhoneCall,
    MessageSquare,
    Globe,
    MapPin,
    Plus,
    Save,
    Shield,
    Activity,
    Search,
    Compass,
} from 'lucide-react';

interface CdrRegisto {
    id: string;
    operadora: 'UNITEL' | 'AFRICELL' | 'MOVICEL';
    numero_alvo_origem: string;
    numero_interlocutor_destino: string;
    imei_equipamento?: string;
    tipo_evento: string;
    data_hora_evento: string;
    duracao_segundos: number;
    antena_erb_nome: string;
    latitude: number;
    longitude: number;
    azimute_graus: number;
    mandado_judicial_referencia: string;
    alvo_investigado_principal: boolean;
    notas_analise_inteligencia?: string;
}

interface AntenaErb {
    nome: string;
    latitude: number;
    longitude: number;
    operadora: string;
    total_eventos: number;
}

interface TelecomProps {
    processo: ProcessoCrime;
    registos: CdrRegisto[];
    antenas: AntenaErb[];
}

export default function ProcessosTelecomCdr({ processo, registos, antenas }: TelecomProps) {
    const [showForm, setShowForm] = useState(false);
    const [filterOperadora, setFilterOperadora] = useState<string>('TODAS');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedAntena, setSelectedAntena] = useState<AntenaErb | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        operadora: 'UNITEL',
        numero_alvo_origem: '+244 923 881 204',
        numero_interlocutor_destino: '',
        imei_equipamento: '860492048291044',
        tipo_evento: 'CHAMADA_VOZ',
        data_hora_evento: new Date().toISOString().slice(0, 16),
        duracao_segundos: '120',
        antena_erb_nome: 'ERB-TALATONA-SUL-01',
        latitude: '-8.9142',
        longitude: '13.1852',
        mandado_judicial_referencia: 'MAND-PGR/TC-2026/089-A',
        notas_analise_inteligencia: 'Contacto interceptado em conformidade com o Art. 230.º CPP.',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('processos.telecom-cdr.store', processo.id), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const filteredRegistos = useMemo(() => {
        return registos.filter(r => {
            const matchOp = filterOperadora === 'TODAS' || r.operadora === filterOperadora;
            const matchSearch = searchTerm === '' ||
                r.numero_alvo_origem.includes(searchTerm) ||
                r.numero_interlocutor_destino.includes(searchTerm) ||
                r.antena_erb_nome.toLowerCase().includes(searchTerm.toLowerCase());
            return matchOp && matchSearch;
        });
    }, [registos, filterOperadora, searchTerm]);

    return (
        <TacticalLayout title={`Telecom & CDR • ${processo.numero_processo}`}>
            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* Abas Oficiais do Processo */}
                <ProcessoHeaderTabs
                    processo={processo}
                    activeTab="telecom"
                    actions={
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-3.5 py-1.5 bg-[#17283c] hover:bg-[#1f3752] border border-[#20344d] hover:border-[#c5a059]/60 text-slate-200 text-xs font-sans font-medium rounded-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                            <span>{showForm ? 'Fechar Formulário' : 'Registar Evento de Antena (ERB)'}</span>
                        </button>
                    }
                />

                {/* PAINEL HUD DE INTELIGÊNCIA DE TELECOMUNICAÇÕES */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Eventos Interceptados</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{registos.length}</div>
                        <span className="text-[11px] text-slate-400">Total de sessões nos autos</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Antenas Trianguladas (ERB)</span>
                        <div className="text-2xl font-bold font-mono text-slate-100">{antenas.length}</div>
                        <span className="text-[11px] text-slate-400">Torres celulares ativadas</span>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Operadoras Envolvidas</span>
                        <div className="text-sm font-bold font-mono text-slate-200 flex items-center gap-1.5 pt-1">
                            <span className="px-1.5 py-0.5 rounded bg-[#132233] text-slate-200 border border-[#223954] text-[10px] font-sans font-medium">UNITEL</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#132233] text-slate-200 border border-[#223954] text-[10px] font-sans font-medium">AFRICELL</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#132233] text-slate-200 border border-[#223954] text-[10px] font-sans font-medium">MOVICEL</span>
                        </div>
                    </div>

                    <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Suporte Jurídico</span>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1 pt-1 font-mono">
                            <Shield className="w-3.5 h-3.5 text-[#c5a059]" /> Mandado Judicial Válido
                        </div>
                        <span className="text-[10px] text-slate-400">Art. 230.º a 237.º do CPP Angolano</span>
                    </div>
                </div>

                {/* FORMULÁRIO DE REGISTO DE EVENTO DE TELECOMUNICAÇÕES */}
                {showForm && (
                    <TacticalCard
                        title="Averbar Evento de Metadados / CDR aos Autos"
                        icon={<Radio className="w-4 h-4 text-[#c5a059]" />}
                    >
                        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Operadora Móvel</label>
                                    <select
                                        value={data.operadora}
                                        onChange={e => setData('operadora', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="UNITEL">UNITEL (Angola)</option>
                                        <option value="AFRICELL">AFRICELL (Angola)</option>
                                        <option value="MOVICEL">MOVICEL (Angola)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Número do Alvo (Origem)</label>
                                    <input
                                        type="text"
                                        value={data.numero_alvo_origem}
                                        onChange={e => setData('numero_alvo_origem', e.target.value)}
                                        placeholder="+244 9XX XXX XXX"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Número do Interlocutor (Destino)</label>
                                    <input
                                        type="text"
                                        value={data.numero_interlocutor_destino}
                                        onChange={e => setData('numero_interlocutor_destino', e.target.value)}
                                        placeholder="+244 9XX XXX XXX"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Tipo de Evento</label>
                                    <select
                                        value={data.tipo_evento}
                                        onChange={e => setData('tipo_evento', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    >
                                        <option value="CHAMADA_VOZ">Chamada de Voz Bidirecional</option>
                                        <option value="SMS_TEXTO">Mensagem de Texto (SMS)</option>
                                        <option value="DADOS_IP">Sessão de Dados / Tráfego IP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Data e Hora do Evento</label>
                                    <input
                                        type="datetime-local"
                                        value={data.data_hora_evento}
                                        onChange={e => setData('data_hora_evento', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Duração (Segundos)</label>
                                    <input
                                        type="number"
                                        value={data.duracao_segundos}
                                        onChange={e => setData('duracao_segundos', e.target.value)}
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Identificador IMEI</label>
                                    <input
                                        type="text"
                                        value={data.imei_equipamento}
                                        onChange={e => setData('imei_equipamento', e.target.value)}
                                        placeholder="Ex: 8604920..."
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Nome da Antena (ERB / BTS)</label>
                                    <input
                                        type="text"
                                        value={data.antena_erb_nome}
                                        onChange={e => setData('antena_erb_nome', e.target.value)}
                                        placeholder="Ex: ERB-TALATONA-SUL-01"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        value={data.latitude}
                                        onChange={e => setData('latitude', e.target.value)}
                                        placeholder="-8.9142"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        value={data.longitude}
                                        onChange={e => setData('longitude', e.target.value)}
                                        placeholder="13.1852"
                                        className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Mandado Judicial de Autorização (CPP)</label>
                                <input
                                    type="text"
                                    value={data.mandado_judicial_referencia}
                                    onChange={e => setData('mandado_judicial_referencia', e.target.value)}
                                    className="w-full bg-[#0d1a26] border border-[#20344d] text-slate-200 p-2 rounded focus:border-[#c5a059]"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#20344d]">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-3 py-1.5 bg-[#17283c] hover:bg-[#1e334d] text-slate-300 rounded border border-[#20344d]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#d6b26c] text-[#0b131e] font-bold rounded flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{processing ? 'Gravando...' : 'Averbar nos Autos'}</span>
                                </button>
                            </div>
                        </form>
                    </TacticalCard>
                )}

                {/* GRADE TÁCTICA: MAPA TOPOLÓGICO DE ANTENAS ERB + LISTA DE INTERCEÇÕES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visualizador Esquemático de Antenas e Triangulação */}
                    <div className="lg:col-span-1 bg-[#09111c] border border-[#1e2f42] rounded-lg p-4 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#1e2f42] pb-2 text-xs">
                            <div className="flex items-center gap-2 font-mono text-slate-300 font-bold">
                                <Compass className="w-4 h-4 text-[#c5a059]" />
                                <span>Triangulação Táctica ERB</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{antenas.length} Torres</span>
                        </div>

                        {/* Mapa Tático Estilizado em SVG */}
                        <div className="bg-[#060b12] border border-[#182738] rounded-md p-4 relative h-64 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(#1e334d_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                            
                            {/* Círculos concêntricos de radar discretos */}
                            <div className="absolute w-48 h-48 rounded-full border border-[#1b2f44]/40"></div>
                            <div className="absolute w-32 h-32 rounded-full border border-[#1b2f44]/50"></div>
                            <div className="absolute w-16 h-16 rounded-full border border-[#1b2f44]/60"></div>

                            {/* Marcadores das Antenas */}
                            <div className="relative z-10 w-full h-full flex flex-col justify-around">
                                {antenas.map((ant, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedAntena(ant)}
                                        className="flex items-center gap-2 p-1.5 rounded hover:bg-[#112030] cursor-pointer transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-[#142334] border border-[#223954] flex items-center justify-center text-[#c5a059] shrink-0">
                                            <Radio className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="text-[11px] font-mono leading-tight">
                                            <div className="font-bold text-slate-200">{ant.nome}</div>
                                            <div className="text-slate-500 text-[10px]">
                                                {ant.operadora} &bull; {ant.total_eventos} eventos &bull; Lat: {ant.latitude}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedAntena && (
                            <div className="bg-[#0d1a26] border border-[#20344d] rounded p-3 text-xs font-mono space-y-1 text-slate-300">
                                <div className="text-slate-200 font-bold flex items-center gap-1.5">
                                    <Radio className="w-3.5 h-3.5 text-[#c5a059]" />
                                    <span>Ficha da Estação Base:</span>
                                </div>
                                <div>Nome: <strong>{selectedAntena.nome}</strong></div>
                                <div>Coordenadas: {selectedAntena.latitude}, {selectedAntena.longitude}</div>
                                <div>Operadora: {selectedAntena.operadora}</div>
                                <div>Total de Disparos de Conexão: <span className="text-slate-100 font-bold">{selectedAntena.total_eventos}</span></div>
                            </div>
                        )}
                    </div>

                    {/* Tabela de Registos de Chamadas e Metadados */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-[#0f1b29] border border-[#20344d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Filtrar:</span>
                                {['TODAS', 'UNITEL', 'AFRICELL', 'MOVICEL'].map(op => (
                                    <button
                                        key={op}
                                        onClick={() => setFilterOperadora(op)}
                                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                                            filterOperadora === op
                                                ? 'bg-[#1e344e] text-slate-100 border-[#c5a059]/70 font-bold'
                                                : 'bg-[#152538] text-slate-300 border-[#20344d] hover:bg-[#1e344e]'
                                        }`}
                                    >
                                        {op}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar número ou antena..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1 bg-[#0b1523] border border-[#20344d] rounded text-slate-200 text-xs w-52 focus:border-[#c5a059] outline-none"
                                />
                            </div>
                        </div>

                        <TacticalCard
                            title={`Linha do Tempo de Chamadas & Metadados (${filteredRegistos.length})`}
                            icon={<PhoneCall className="w-4 h-4 text-[#c5a059]" />}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-sans">
                                    <thead>
                                        <tr className="border-b border-[#20344d] text-slate-400 text-[10px] uppercase font-mono">
                                            <th className="py-2.5 px-3">Data/Hora</th>
                                            <th className="py-2.5 px-3">Origem</th>
                                            <th className="py-2.5 px-3">Destino</th>
                                            <th className="py-2.5 px-3">Tipo</th>
                                            <th className="py-2.5 px-3">Duração</th>
                                            <th className="py-2.5 px-3">Antena (ERB)</th>
                                            <th className="py-2.5 px-3">Operadora</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#1e2f42] text-slate-200 font-mono text-[11px]">
                                        {filteredRegistos.map(r => (
                                            <tr key={r.id} className="hover:bg-[#0f1b29] transition-colors">
                                                <td className="py-2.5 px-3 text-slate-400">
                                                    {r.data_hora_evento}
                                                </td>
                                                <td className="py-2.5 px-3 font-bold text-slate-100">
                                                    {r.numero_alvo_origem}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-300">
                                                    {r.numero_interlocutor_destino}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className="text-[10px] text-slate-300">
                                                        {r.tipo_evento === 'CHAMADA_VOZ' ? 'Voz' : r.tipo_evento === 'SMS_TEXTO' ? 'SMS' : 'Dados'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-400">
                                                    {r.duracao_segundos > 0 ? `${r.duracao_segundos}s` : '—'}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-400">
                                                    {r.antena_erb_nome}
                                                </td>
                                                <td className="py-2.5 px-3">
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-[#132233] text-slate-200 border border-[#223954]">
                                                        {r.operadora}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TacticalCard>
                    </div>
                </div>
            </div>
        </TacticalLayout>
    );
}
