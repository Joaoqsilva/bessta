export interface ClinicaContent {
    header: {
        logo: string;
        menuItems: { label: string; anchor: string }[];
        ctaText: string;
    };
    hero: {
        title: string;
        subtitle: string;
        description: string;
        buttons: { text: string; variant: 'primary' | 'outline' | 'glass'; link: string }[];
    };
    about: {
        title: string;
        description: string;
        highlights: string[];
        // Images are placeholders for now, can be replaced with URLs
        images: string[];
    };
    gallery: {
        title: string;
        description: string;
        images: { src: string; alt: string }[];
    };
    services: {
        title: string;
        subtitle: string;
        items: { icon: string; title: string; description: string }[];
    };
    faq: {
        title: string;
        subtitle: string;
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

export const clinicaData: ClinicaContent = {
    header: {
        logo: "Instituto Lacan",
        menuItems: [
            { label: "Início", anchor: "#hero" },
            { label: "Sobre", anchor: "#about" },
            { label: "Serviços", anchor: "#services" },
            { label: "Galeria", anchor: "#gallery" },
            { label: "Dúvidas", anchor: "#faq" },
        ],
        ctaText: "Agendar Consulta",
    },
    hero: {
        title: "Descubra-se através da Psicanálise",
        subtitle: "Clínica de Psicanálise Lacaniana",
        description: "Um espaço de escuta qualificada onde o sujeito pode reencontrar sua verdade. A psicanálise é um convite a saber fazer com seu próprio desejo.",
        buttons: [
            { text: "Agendar Visita", variant: "primary", link: "/booking" },
            { text: "Saiba Mais", variant: "outline", link: "#about" },
        ],
    },
    about: {
        title: "Sobre a Clínica",
        description: "Nossa clínica foi idealizada para ser um refúgio de tranquilidade e introspecção. Fundamentada nos ensinamentos de Jacques Lacan, oferecemos um tratamento que respeita a singularidade de cada analisante. O ambiente foi planejado para acolher as angústias contemporâneas e permitir a emergência da palavra.",
        highlights: [
            "Atendimento presencial e online",
            "Profissionais com formação contínua",
            "Sigilo absoluto e ética rigorosa",
            "Ambiente acolhedor e reservado"
        ],
        images: [
            "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=600&auto=format&fit=crop", // Consultório 1
            "https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=600&auto=format&fit=crop", // Detalhe decor
            "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop", // Consultório 2
            "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=600&auto=format&fit=crop", // Ambiente externo/natureza
        ],
    },
    gallery: {
        title: "Nosso Espaço",
        description: "Conheça os ambientes preparados para o seu conforto e privacidade.",
        images: [
            { src: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20", alt: "Sala de Espera" },
            { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6", alt: "Divã" },
            { src: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe", alt: "Consultório Principal" },
            { src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221", alt: "Detalhes" },
            { src: "https://images.unsplash.com/photo-1617806118233-18e1de247200", alt: "Biblioteca" },
            { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6", alt: "Sala de Atendimento" },
        ],
    },
    services: {
        title: "Como Posso Te Ajudar",
        subtitle: "Diferentes modalidades para sua jornada de autoconhecimento",
        items: [
            {
                icon: "Brain",
                title: "Análise Individual",
                description: "Sessões voltadas para a escuta do inconsciente, permitindo a elaboração de traumas e questões existenciais."
            },
            {
                icon: "Users",
                title: "Terapia de Casal",
                description: "Espaço para trabalhar questões da relação, comunicação e impasses afetivos sob a ótica psicanalítica."
            },
            {
                icon: "BookOpen",
                title: "Supervisão Clínica",
                description: "Orientação para psicólogos e psicanalistas em formação, discutindo casos e teoria."
            },
            {
                icon: "MessageCircle",
                title: "Grupos de Estudo",
                description: "Encontros periódicos para leitura e discussão da obra de Freud e Lacan."
            },
        ],
    },
    faq: {
        title: "Perguntas Frequentes",
        subtitle: "Esclareça suas dúvidas sobre o processo analítico",
        items: [
            {
                question: "O que é a psicanálise lacaniana?",
                answer: "É uma orientação clínica baseada no retorno a Freud promovido por Jacques Lacan, que enfatiza a função da linguagem e da fala na estruturação do sujeito e no tratamento do sofrimento psíquico."
            },
            {
                question: "Qual a duração das sessões?",
                answer: "Na psicanálise lacaniana, trabalhamos com o tempo lógico e não apenas cronológico. As sessões têm tempo variável, encerrando-se no momento fecundo para a elaboração do paciente."
            },
            {
                question: "Aceitam convênios?",
                answer: "Atendemos na modalidade particular para preservar a ética e o sigilo do tratamento, mas fornecemos recibo para reembolso junto ao seu plano de saúde."
            },
            {
                question: "Como agendar uma primeira entrevista?",
                answer: "Você pode entrar em contato através do botão 'Agendar' nesta página ou pelo WhatsApp. A primeira entrevista serve para nos conhecermos e avaliarmos a demanda de análise."
            },
            {
                question: "O atendimento online funciona?",
                answer: "Sim, a psicanálise online mantém sua eficácia, pois o fundamento é a fala e a escuta. Garantimos uma plataforma segura e sigilosa para as sessões remotas."
            },
        ],
    },
    footer: {
        logo: "Instituto Lacan",
        description: "Clínica de referência em psicanálise e saúde mental.",
        contact: {
            phone: "(11) 99999-9999",
            email: "contato@institutolacan.com.br",
            address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
        },
        social: [
            { platform: "Instagram", url: "#" },
            { platform: "LinkedIn", url: "#" },
            { platform: "WhatsApp", url: "#" },
        ],
        hours: "Segunda a Sexta: 08h às 20h",
        copyright: "© 2026 Instituto Lacan. Todos os direitos reservados.",
    },
};
