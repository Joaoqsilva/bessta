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
    Play
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
        { id: 'configuracoes', title: 'Configurações', icon: <UserCheck size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Simples */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight">SimpliAgenda <span className="text-blue-600">Docs</span></span>
                    </Link>
                    <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">Ir para o Painel</Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-1 w-full gap-8">
                {/* Sidebar de Navegação */}
                <aside className="w-64 hidden md:block">
                    <nav className="sticky top-24 space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === section.id
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {section.icon}
                                {section.title}
                                {activeSection === section.id && <ChevronRight size={14} className="ml-auto" />}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Conteúdo Principal */}
                <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-12">

                    {activeSection === 'introducao' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6">Bem-vindo ao SimpliAgenda</h1>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Este guia foi criado para ajudar você a configurar sua presença online e otimizar sua gestão de horários.
                                O SimpliAgenda é uma plataforma completa que une um site profissional (Landing Page) com um sistema inteligente de agendamentos.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                    <h3 className="font-bold text-blue-900 mb-2">Primeiros Passos</h3>
                                    <p className="text-sm text-blue-700">Acesse o seu Dashboard para ver um resumo dos seus atendimentos e ganhos.</p>
                                </div>
                                <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                                    <h3 className="font-bold text-green-900 mb-2">Editor Visual</h3>
                                    <p className="text-sm text-green-700">Personalize seu site sem precisar de código. Altere tudo clicando diretamente na tela.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'editor' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Layout className="text-blue-600" /> Editor Visual
                            </h2>
                            <p className="text-gray-600 mb-8">
                                O nosso editor é do tipo "What You See Is What You Get" (O que você vê é o que você tem).
                                Isso significa que você edita o site vendo ele exatamente como o seu cliente verá.
                            </p>

                            <section className="space-y-8">
                                <div className="border-l-4 border-blue-500 pl-6 py-2">
                                    <h3 className="font-bold text-xl mb-2">Como Editar Componentes</h3>
                                    <p className="text-gray-600">
                                        Passe o mouse sobre qualquer elemento do site. Um ícone de <strong>lápis (Editar)</strong> aparecerá.
                                        Clique nele para abrir o painel lateral de edição.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-xl">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                            <MousePointer2 size={20} className="text-gray-600" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">Textos</h4>
                                        <p className="text-xs text-gray-500">Clique em qualquer título ou parágrafo para reescrever.</p>
                                    </div>
                                    <div className="p-4 border rounded-xl">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                            <ImageIcon size={20} className="text-gray-600" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">Imagens</h4>
                                        <p className="text-xs text-gray-500">Clique na foto para subir uma nova ou remover a atual.</p>
                                    </div>
                                    <div className="p-4 border rounded-xl">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                            <Palette size={20} className="text-gray-600" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">Cores e Fontes</h4>
                                        <p className="text-xs text-gray-500">Use a aba "Cores" na barra lateral esquerda para mudar toda a paleta.</p>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                                    <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                                        <Layout size={18} /> Dica de Layout
                                    </h4>
                                    <p className="text-sm text-yellow-700">
                                        Você pode trocar o template inteiro do seu site na aba "Layout".
                                        Isso mudará a estrutura visual, mas manterá todos os seus textos e fotos salvos!
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeSection === 'servicos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <PlusCircle className="text-blue-600" /> Gestão de Serviços
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Defina o que você oferece aos seus clientes. Cada serviço pode ter seu próprio preço e duração.
                            </p>

                            <ol className="space-y-6 list-decimal list-inside text-gray-600">
                                <li className="pl-2">
                                    <strong className="text-gray-900">Acesse "Serviços" no Menu Lateral:</strong> Clique em "Novo Serviço" para começar.
                                </li>
                                <li className="pl-2">
                                    <strong className="text-gray-900">Preço e Duração:</strong> Defina o valor e quanto tempo o atendimento leva. O sistema usará essa duração para calcular os horários livres na sua agenda.
                                </li>
                                <li className="pl-2">
                                    <strong className="text-gray-900">Categorias:</strong> Organize seus serviços para facilitar a escolha do cliente.
                                </li>
                            </ol>
                        </div>
                    )}

                    {activeSection === 'horarios' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Clock className="text-blue-600" /> Configuração de Horários
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Entender como o sistema distribui seus horários é fundamental para uma agenda eficiente.
                            </p>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-bold text-xl mb-4 text-gray-900">Grade Semanal</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Você define o seu horário de trabalho para cada dia da semana (ex: Segunda a Sexta, das 08h às 18h).
                                        O sistema então cria "slots" (vagas) automaticamente baseados na duração dos seus serviços.
                                    </p>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                    <h4 className="font-bold mb-3 text-gray-900">Intervalos e Almoço</h4>
                                    <p className="text-sm text-gray-600">
                                        Você pode configurar dois períodos de atendimento por dia. Por exemplo:
                                        <br /><br />
                                        <strong>Manhã:</strong> 08:00 - 12:00
                                        <br />
                                        <strong>Tarde:</strong> 13:30 - 18:00
                                        <br /><br />
                                        Isso cria automaticamente o seu intervalo de almoço, impedindo agendamentos nesse período.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl mb-2 text-gray-900">Bloqueio de Dias</h3>
                                    <p className="text-gray-600">
                                        Se você precisar tirar uma folga ou feriado, basta desmarcar o dia na configuração de horários.
                                        O site removerá imediatamente as opções de agendamento para aquele dia específico.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'agendamentos' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Calendar className="text-blue-600" /> Gestão de Agendamentos
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Você tem controle total sobre quem agenda e quando.
                            </p>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900">Agendamento Manual</h3>
                                    <p className="text-gray-600">
                                        Se um cliente te ligar, você não precisa pedir para ele entrar no site.
                                        Vá na aba "Agenda", selecione o horário e clique em <strong>"Adicionar Agendamento"</strong>.
                                        Preencha o nome do cliente e o serviço. O horário será bloqueado no site automaticamente.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900">Cancelamentos e Remarcações</h3>
                                    <p className="text-gray-600">
                                        Tanto você quanto o cliente podem gerenciar os compromissos.
                                        Você pode cancelar um horário a qualquer momento, e o sistema enviará uma notificação (se configurado) e liberará a vaga para outros clientes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'configuracoes' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <UserCheck className="text-blue-600" /> Configurações Gerais
                            </h2>

                            <div className="space-y-6">
                                <div className="p-6 border rounded-2xl">
                                    <h4 className="font-bold text-gray-900 mb-2 underline decoration-blue-500 decoration-2">Link do Site (Slug)</h4>
                                    <p className="text-sm text-gray-600">
                                        Você pode alterar o final do seu link (ex: simpliagenda.com.br/<strong>meu-nome</strong>).
                                        Certifique-se de escolher algo profissional e fácil de digitar.
                                    </p>
                                </div>

                                <div className="p-6 border rounded-2xl">
                                    <h4 className="font-bold text-gray-900 mb-2 underline decoration-green-500 decoration-2">Domínio Personalizado</h4>
                                    <p className="text-sm text-gray-600">
                                        Clientes PRO podem usar seu próprio domínio (ex: www.suaclinica.com.br).
                                        Isso é feito na aba "Configurações" através da seção de Domínios.
                                    </p>
                                </div>

                                <div className="p-6 border rounded-2xl">
                                    <h4 className="font-bold text-gray-900 mb-2 underline decoration-red-500 decoration-2">Segurança</h4>
                                    <p className="text-sm text-gray-600">
                                        Mantenha sua senha segura. Ações sensíveis, como cancelar sua assinatura ou excluir a conta, exigirão sua senha novamente por segurança.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Footer de Ajuda */}
            <footer className="bg-white border-t py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-600 mb-6 font-medium">Não encontrou o que procurava?</p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            Falar com Suporte
                        </button>
                        <button className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                            Comunidade
                        </button>
                    </div>
                </div>
            </footer>

            <style>{`
                .animate-in {
                    animation: animate-in 0.5s ease-out forwards;
                }
                @keyframes animate-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DocumentationPage;
