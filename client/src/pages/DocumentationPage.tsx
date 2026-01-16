import React, { useState } from 'react';
import {
    Book,
    Layout,
    Calendar,
    Clock,
    PlusCircle,
    MousePointer2,
    Image as ImageIcon,
    Palette,
    UserCheck,
    ChevronRight,
    Search,
    Play,
    Eye,
    EyeOff,
    Instagram,
    MessageCircle,
    Smartphone,
    TrendingUp,
    ShieldCheck,
    HelpCircle,
    Settings as SettingsIcon,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DocumentationPage = () => {
    const [activeSection, setActiveSection] = useState('introducao');

    const sections = [
        { id: 'introducao', title: 'Introdução', icon: <Book size={18} /> },
        { id: 'editor', title: 'Editor Visual', icon: <Layout size={18} /> },
        { id: 'servicos', title: 'Serviços', icon: <PlusCircle size={18} /> },
        { id: 'horarios', title: 'Horários e Grade', icon: <Clock size={18} /> },
        { id: 'agendamentos', title: 'Agendamentos', icon: <Calendar size={18} /> },
        { id: 'clientes', title: 'Gestão de Clientes', icon: <Users size={18} /> },
        { id: 'configuracoes', title: 'Configurações', icon: <UserCheck size={18} /> },
        { id: 'faq', title: 'FAQ', icon: <HelpCircle size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Moderno */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">S</div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight">SimpliAgenda <span className="text-blue-600">Docs</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/app" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Voltar ao Site</Link>
                        <Link to="/app" className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">Ir para o Painel</Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-1 w-full gap-8">
                {/* Sidebar de Navegação */}
                <aside className="w-72 hidden lg:block">
                    <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="px-4 py-2 border-b border-gray-50 mb-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navegação</span>
                        </div>
                        <nav className="space-y-1">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === section.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className={activeSection === section.id ? 'text-white' : 'text-blue-500'}>
                                        {section.icon}
                                    </span>
                                    {section.title}
                                    {activeSection === section.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Conteúdo Principal */}
                <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-12 mb-12 overflow-hidden">

                    {activeSection === 'introducao' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-6">
                                <TrendingUp size={14} /> Comece Aqui
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Bem-vindo ao SimpliAgenda</h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Transforme a forma como você atende seus clientes. O SimpliAgenda é a ponte entre o seu talento e quem precisa dele, automatizando o processo de reserva e gestão de tempo.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Smartphone size={100} />
                                    </div>
                                    <h3 className="font-extrabold text-blue-900 text-xl mb-3">Checklist Inicial</h3>
                                    <ul className="space-y-3 text-sm text-blue-800 font-medium">
                                        <li className="flex items-center gap-2"><PlusCircle size={14} /> Cadastre seus 3 primeiros serviços</li>
                                        <li className="flex items-center gap-2"><Clock size={14} /> Configure sua grade de horários</li>
                                        <li className="flex items-center gap-2"><Layout size={14} /> Escolha um layout no Editor Visual</li>
                                        <li className="flex items-center gap-2"><Smartphone size={14} /> Compartilhe seu link no Instagram</li>
                                    </ul>
                                </div>
                                <div className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-100 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={100} />
                                    </div>
                                    <h3 className="font-extrabold text-emerald-900 text-xl mb-3">Segurança e Dados</h3>
                                    <p className="text-sm text-emerald-800 mb-4">Seus dados e de seus clientes estão protegidos com criptografia de última geração.</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white/50 px-3 py-1 rounded-full w-fit">
                                        <ShieldCheck size={12} /> Compliance LGPD 2026
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'editor' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-4 tracking-tight">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Layout size={28} />
                                </div>
                                Editor Visual
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                A primeira impressão é a que fica. Nosso editor visual permite que você crie um site de nível mundial em minutos, sem escrever uma única linha de código.
                            </p>

                            <section className="space-y-12">
                                <div>
                                    <h3 className="font-extrabold text-2xl text-gray-900 mb-6 flex items-center gap-2">
                                        🚀 Funcionalidades Principais
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><ImageIcon size={16} /></div>
                                                <h4 className="font-bold text-gray-900">Gestão de Imagens</h4>
                                            </div>
                                            <p className="text-sm text-gray-600">Altere Logos, Banners, fotos da Galeria e imagens do Time. Suportamos formatos moderns como WebP para seu site carregar instantaneamente.</p>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-pink-200 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white"><Instagram size={16} /></div>
                                                <h4 className="font-bold text-gray-900">Links Sociais</h4>
                                            </div>
                                            <p className="text-sm text-gray-600">Clique diretamente nos ícones do rodapé para configurar seu WhatsApp, Instagram e Facebook. O cliente é direcionado em um clique.</p>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white"><Eye size={16} /></div>
                                                <h4 className="font-bold text-gray-900">Visibilidade de Seções</h4>
                                            </div>
                                            <p className="text-sm text-gray-600">Não tem depoimentos ainda? Não tem problema. Use os botões de <span className="text-gray-400 italic">"Esconder"</span> para ocultar seções inteiras do seu site.</p>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white"><Palette size={16} /></div>
                                                <h4 className="font-bold text-gray-900">Identidade Visual</h4>
                                            </div>
                                            <p className="text-sm text-gray-600">Troque as cores globais e as fontes para combinar com a sua marca. Tudo é atualizado em tempo real na pré-visualização.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-8 bg-blue-900 rounded-3xl text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-20"><Play size={40} /></div>
                                    <h4 className="font-extrabold text-xl mb-3 flex items-center gap-2">
                                        <SettingsIcon size={20} /> Como Aplicar Mudanças
                                    </h4>
                                    <p className="text-blue-100 mb-6">
                                        Todas as edições feitas no editor são salvas automaticamente em rascunho. Para que o mundo veja suas atualizações, clique no botão <strong>"Salvar Alterações"</strong> no topo da página.
                                    </p>
                                    <div className="flex gap-3">
                                        <div className="px-4 py-2 bg-blue-800 rounded-full text-xs font-bold border border-blue-700">Auto-Save Habilitado</div>
                                        <div className="px-4 py-2 bg-emerald-500 rounded-full text-xs font-bold shadow-lg shadow-emerald-900/40">Visualização em Tempo Real</div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeSection === 'servicos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-4 tracking-tight">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <PlusCircle size={28} />
                                </div>
                                Gestão de Serviços
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Organize seu catálogo de atendimentos de forma que seja irresistível para o cliente e eficiente para a sua agenda.
                            </p>

                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border-l-4 border-emerald-500">
                                            <h4 className="font-extrabold text-gray-900 mb-1">Preço e Valor</h4>
                                            <p className="text-sm text-gray-600">Defina o preço de venda. Lembre-se que você pode oferecer promoções simplesmente editando este valor a qualquer momento.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border-l-4 border-blue-500">
                                            <h4 className="font-extrabold text-gray-900 mb-1">Duração Estratégica</h4>
                                            <p className="text-sm text-gray-600">A duração (ex: 60 min) é usada para gerar as vagas no calendário. Se o serviço leva 45 min, coloque 60 min para ter 15 min de intervalo entre clientes.</p>
                                        </div>
                                    </div>
                                    <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 italic font-serif">Img</div>
                                        <h4 className="font-bold text-gray-900 mb-1">Fotos dos Serviços</h4>
                                        <p className="text-xs text-gray-500 max-w-[200px]">Serviços com fotos profissionais convertem 3x mais agendamentos que serviços sem imagem.</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-900 rounded-3xl text-white">
                                    <h3 className="font-extrabold text-xl mb-4">Hierarquia de Categorias</h3>
                                    <p className="text-gray-400 mb-6 text-sm">Se você trabalha com Cabelo e Unhas, crie categorias separadas. Isso ajuda o cliente a encontrar o serviço desejado sem precisar rolar uma lista interminável.</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">Cabelo</span>
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">Estética Facial</span>
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">Terapias</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'horarios' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-4 tracking-tight">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                    <Clock size={28} />
                                </div>
                                Configuração de Horários
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Controle total sobre sua jornada de trabalho. Configure quando o sistema pode aceitar compromissos automaticamente.
                            </p>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-6"><Calendar size={20} /></div>
                                        <h3 className="font-extrabold text-xl text-gray-900 mb-3">Grade Recorrente</h3>
                                        <p className="text-sm text-gray-600">Defina seu padrão semanal. O SimpliAgenda replicará esses horários para todas as semanas futuras, garantindo que você nunca fique sem horários disponíveis.</p>
                                    </div>
                                    <div className="p-8 border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-6"><Play size={20} /></div>
                                        <h3 className="font-extrabold text-xl text-gray-900 mb-3">Pausas Programadas</h3>
                                        <p className="text-sm text-gray-600">Use dois blocos de horário para criar intervalos. Se você parar de 12:00 às 13:30, configure das 08:00 às 12:00 e das 13:30 às 18:00.</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-orange-50 rounded-3xl border border-orange-100">
                                    <h4 className="font-extrabold text-orange-900 mb-3 flex items-center gap-2 text-lg">
                                        🚫 Bloqueios de Folga
                                    </h4>
                                    <p className="text-sm text-orange-800 leading-relaxed mb-4">
                                        Vai tirar férias ou precisa bloquear um dia específico para um evento? Basta desmarcar o dia na configuração de horários. Clientes que tentarem agendar verão que não há disponibilidade para aquela data.
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-bold text-orange-600 uppercase tracking-widest border border-orange-200">
                                        Dica: Bloqueie feriados nacionais com antecedência
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'agendamentos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-4 tracking-tight">
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Calendar size={28} />
                                </div>
                                Gestão de Agendamentos
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Gerencie seus compromissos com precisão cirúrgica. Saiba quem vem, qual serviço fará e quanto você vai faturar.
                            </p>

                            <div className="space-y-12">
                                <div className="relative p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem]">
                                    <div className="bg-white rounded-[1.8rem] p-8">
                                        <h3 className="font-extrabold text-2xl text-gray-900 mb-4">Agendamento Manual</h3>
                                        <p className="text-gray-600 mb-6 font-medium">Muito mais praticidade quando o cliente te chama no WhatsApp ou liga.</p>
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-xs">1</div>
                                                <p className="text-sm text-gray-600">Vá até o <strong>Calendário</strong> e clique sobre o horário desejado pelo cliente.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-xs">2</div>
                                                <p className="text-sm text-gray-600">Selecione o serviço e comece a digitar o nome do cliente. Se ele já existe, seus dados serão preenchidos.</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-xs">3</div>
                                                <p className="text-sm text-gray-600">Confirme o agendamento. Ele aparecerá com uma cor diferente para indicar que foi feito por você.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-8 border border-gray-100 rounded-3xl">
                                        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                            <TrendingUp className="text-green-500" /> Histórico e Notas
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">Cada agendamento permite que você adicione notas privadas. Use para anotar preferências do cliente, como "gosta de café sem açúcar" ou "usar coloração X".</p>
                                    </div>
                                    <div className="p-8 border border-gray-100 rounded-3xl">
                                        <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2 text-red-600">
                                            <EyeOff className="text-red-500" /> Cancelamentos
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">Ao cancelar um agendamento, o sistema automaticamente libera a vaga no seu site para que outro cliente possa agendar. Sem perda de faturamento.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'clientes' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-4 tracking-tight">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                                    <Users size={28} />
                                </div>
                                Gestão de Clientes
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Conheça seus clientes como nunca antes. Uma base de dados organizada é o maior ativo do seu negócio.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-200"><Search size={22} /></div>
                                    <h4 className="font-extrabold text-purple-900 mb-1">Busca Inteligente</h4>
                                    <p className="text-xs text-purple-700">Encontre qualquer cliente pelo nome, telefone ou email em segundos.</p>
                                </div>
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200"><TrendingUp size={22} /></div>
                                    <h4 className="font-extrabold text-blue-900 mb-1">Perfil de Consumo</h4>
                                    <p className="text-xs text-blue-700">Veja quantos agendamentos o cliente já fez e quanto ele já investiu em você.</p>
                                </div>
                                <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-pink-200"><MessageCircle size={22} /></div>
                                    <h4 className="font-extrabold text-pink-900 mb-1">Contato Direto</h4>
                                    <p className="text-xs text-pink-700">Botões rápidos para chamar no WhatsApp direto do perfil do cliente.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'configuracoes' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-4 tracking-tight">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600">
                                    <SettingsIcon size={28} />
                                </div>
                                Configurações Gerais
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Ajuste os detalhes técnicos e as preferências da sua conta para garantir que tudo funcione como planejado.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 border border-gray-100 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 transition-all group-hover:w-4"></div>
                                    <h4 className="font-extrabold text-gray-900 text-xl mb-3">Link do Site (Slug)</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                        Personalize sua URL. <br />
                                        <strong>Exemplo:</strong> simpliagenda.com.br/meu-negocio. <br /><br />
                                        Mudar o slug desativará o link antigo imediatamente. Lembre-se de atualizar sua Bio do Instagram após a mudança.
                                    </p>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-500 border border-gray-100">
                                        /app/settings
                                    </div>
                                </div>
                                <div className="p-8 border border-gray-100 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-red-600 transition-all group-hover:w-4"></div>
                                    <h4 className="font-extrabold text-gray-900 text-xl mb-3">Segurança e Senha</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                        Recomendamos trocar sua senha a cada 90 dias. Para ações críticas (como deletar a conta ou gerenciar planos), solicitaremos sua senha atual para confirmar que é você.
                                    </p>
                                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs font-bold text-red-600 border border-red-100">
                                        <ShieldCheck size={14} /> Proteção Ativa
                                    </div>
                                </div>
                                <div className="p-8 border border-gray-100 rounded-[2.5rem] relative overflow-hidden group md:col-span-2">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600 transition-all group-hover:w-4"></div>
                                    <h4 className="font-extrabold text-gray-900 text-xl mb-3">Perfil da Loja</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                        Cadastre o nome público do seu negócio, telefone principal e endereço. Essas informações são automaticamente utilizadas nos rodapés e e-mails de confirmação para seus clientes.
                                    </p>
                                    <Link to="/app/settings" className="text-sm font-bold text-emerald-600 hover:underline">Ir para Perfil &rarr;</Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'faq' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-4 tracking-tight">
                                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                                    <HelpCircle size={28} />
                                </div>
                                Perguntas Frequentes
                            </h2>
                            <p className="text-xl text-gray-600 mb-12">
                                Respostas rápidas para as dúvidas mais comuns dos nossos usuários.
                            </p>

                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-extrabold text-gray-900 mb-2">Como meu cliente recebe o link para agendar?</h4>
                                    <p className="text-sm text-gray-600">Você só precisa copiar o seu link (slug) das configurações e colar na sua biografia do Instagram, perfil do WhatsApp ou enviar diretamente por mensagem.</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-extrabold text-gray-900 mb-2">O SimpliAgenda cobra comissão por atendimento?</h4>
                                    <p className="text-sm text-gray-600">Não. Cobramos apenas uma mensalidade fixa para o plano PRO. Todo o valor transacionado é 100% seu.</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-extrabold text-gray-900 mb-2">Posso usar o sistema no meu celular?</h4>
                                    <p className="text-sm text-gray-600">Sim! O painel administrativo é totalmente otimizado para navegadores de celular. Você pode gerenciar sua agenda de onde estiver.</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="font-extrabold text-gray-900 mb-2">O que acontece se eu mudar de layout?</h4>
                                    <p className="text-sm text-gray-600">Nada se perde. Todos os seus textos e fotos são migrados automaticamente para o novo layout. Você pode mudar quantas vezes quiser até achar o estilo perfeito.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* CTA Final */}
            <div className="max-w-7xl mx-auto px-4 mb-24 w-full">
                <div className="p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white text-center shadow-2xl shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="grid grid-cols-6 gap-4">
                            {[...Array(24)].map((_, i) => (
                                <HelpCircle key={i} size={80} />
                            ))}
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold mb-4 relative z-10">Ainda tem dúvidas?</h2>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto relative z-10">Nossa equipe de especialistas está pronta para ajudar você a decolar o seu negócio.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <button
                            onClick={() => window.open('https://wa.me/5547991394589', '_blank')}
                            className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-extrabold hover:bg-blue-50 transition-all shadow-xl"
                        >
                            Falar com Suporte No WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Minimalista */}
            <footer className="bg-white border-t py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">&copy; {new Date().getFullYear()} SimpliAgenda Hub. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <button onClick={() => setActiveSection('faq')} className="text-xs font-bold text-gray-400 hover:text-blue-600">Termos</button>
                        <button onClick={() => setActiveSection('faq')} className="text-xs font-bold text-gray-400 hover:text-blue-600">Privacidade</button>
                        <button onClick={() => setActiveSection('faq')} className="text-xs font-bold text-gray-400 hover:text-blue-600">Cookies</button>
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-in {
                    animation: animate-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes animate-in {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                body {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};

export default DocumentationPage;
