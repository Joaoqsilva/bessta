export interface ModernContent {
    header: {
        logo: string;
        menuItems: { label: string; anchor: string }[];
        ctaText: string;
    };
    hero: {
        title: string;
        subtitle: string;
        description: string;
        buttons: { text: string; variant: 'primary' | 'outline'; link: string }[];
        image: string;
        stats: { value: string; label: string }[];
    };
    about: {
        title: string;
        subtitle: string;
        description: string;
        image: string;
        features: string[];
    };
    services: {
        title: string;
        subtitle: string;
        items: { icon: string; title: string; description: string }[];
    };
    faq: {
        title: string;
        items: { question: string; answer: string }[];
    };
    footer: {
        logo: string;
        description: string;
        contact: { phone: string; email: string; address: string };
        social: { platform: string; url: string }[];
        hours: string;
        copyright: string;
    };
}

export const modernData: ModernContent = {
    header: {
        logo: "MenteClara",
        menuItems: [
            { label: "Início", anchor: "#hero" },
            { label: "Metodologia", anchor: "#about" },
            { label: "Serviços", anchor: "#services" },
            { label: "FAQ", anchor: "#faq" },
        ],
        ctaText: "Agendar Sessão",
    },
    hero: {
        title: "Reorganize seus pensamentos, transforme sua vida.",
        subtitle: "Psicologia Baseada em Evidências",
        description: "Utilizamos a Terapia Cognitivo-Comportamental (TCC) para ajudar você a identificar padrões, desenvolver resiliência e alcançar uma vida com mais propósito e equilíbrio emocional.",
        buttons: [
            { text: "Começar Terapia", variant: "primary", link: "/booking" },
            { text: "Conhecer Abordagem", variant: "outline", link: "#about" },
        ],
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop", // Professional minimalist portrait via Unsplash
        stats: [
            { value: "+500", label: "Pacientes Atendidos" },
            { value: "10 anos", label: "de Experiência" },
            { value: "100%", label: "Sigilo Profissional" },
        ]
    },
    about: {
        subtitle: "Sobre a Especialista",
        title: "Dra. Ana Silva",
        description: "Especialista em Terapia Cognitivo-Comportamental e Mindfulness. Meu foco é fornecer ferramentas práticas para que você possa lidar melhor com a ansiedade, estresse e desafios do dia a dia. Acredito em uma terapia transparente, colaborativa e orientada a objetivos.",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop", // Clean workspace/person
        features: [
            "Foco no momento presente",
            "Técnicas cientificamente comprovadas",
            "Planos de tratamento personalizados",
            "Ambiente seguro e acolhedor"
        ]
    },
    services: {
        title: "Áreas de Atuação",
        subtitle: "Como podemos trabalhar juntos",
        items: [
            {
                icon: "BrainCircuit",
                title: "Ansiedade e Estresse",
                description: "Aprenda a gerenciar pensamentos intrusivos e sintomas físicos da ansiedade."
            },
            {
                icon: "Sun",
                title: "Depressão e Humor",
                description: "Estratégias para regulação emocional e retomada de atividades prazerosas."
            },
            {
                icon: "Target",
                title: "Foco e Produtividade",
                description: "Técnicas para melhorar a concentração e organização mental."
            },
            {
                icon: "HeartHandshake",
                title: "Relacionamentos",
                description: "Desenvolvimento de habilidades sociais e comunicação assertiva."
            },
        ],
    },
    faq: {
        title: "Perguntas Frequentes",
        items: [
            {
                question: "Como funciona a TCC?",
                answer: "A TCC é uma abordagem estruturada e focada no presente. Trabalhamos juntos para identificar como seus pensamentos influenciam seus sentimentos e comportamentos, buscando padrões mais saudáveis."
            },
            {
                question: "Aceita convênios?",
                answer: "Atendemos na modalidade de reembolso. Emitimos toda a documentação necessária para que você solicite o ressarcimento junto ao seu plano de saúde."
            },
            {
                question: "Vocês atendem online?",
                answer: "Sim! Oferecemos atendimento online seguro através de plataformas criptografadas, com a mesma qualidade e ética do presencial."
            },
            {
                question: "Quanto tempo dura o tratamento?",
                answer: "A TCC é conhecida por ser uma terapia de tempo limitado. A duração varia conforme cada caso, mas o objetivo é que você se torne seu próprio terapeuta o quanto antes."
            },
        ],
    },
    footer: {
        logo: "MenteClara",
        description: "Psicologia moderna para tempos modernos.",
        contact: {
            phone: "(11) 98888-8888",
            email: "contato@menteclara.com",
            address: "Edifício Office Tower, Sala 402 - SP",
        },
        social: [
            { platform: "Instagram", url: "#" },
            { platform: "LinkedIn", url: "#" },
        ],
        hours: "Seg-Sex: 08:00 - 19:00",
        copyright: "© 2026 MenteClara Psicologia.",
    },
};
