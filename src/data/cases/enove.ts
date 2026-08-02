import { CaseStudy } from './index';

export const enoveCase: CaseStudy = {
    title: "Enove Imobiliária",
    category: "Imobiliário • Tráfego Pago & Google Ads",
    logo: "/uploads/enove-logo.svg",
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop",
    challenge: "A Enove Imobiliária, referência no setor imobiliário no Rio Grande do Sul, buscava aumentar o volume de agendamentos de visitas presenciais e virtuais para imóveis e lançamentos de alto padrão. O desafio principal era capturar compradores de imóvel com alta intenção no Google Ads e enviá-los diretamente para a agenda dos corretores no CRM, reduzindo o CAC imobiliário.",
    solution: "Desenvolvemos uma estrutura completa de aquisição imobiliária via Google Ads e automação de agendamento: (1) Arquitetura de campanhas de alta intenção no Google Search focando em termos de compra de imóveis e lançamentos no RS; (2) Landing Pages de alta conversão com agendamento direto de visitas; (3) Qualificação rápida via CRM para direcionar cada lead ao corretor certo em menos de 5 minutos.",
    results: [
        "Mais de 1.000 visitas presenciais e virtuais agendadas diretamente na agenda da equipe comercial",
        "Redução de 38% no Custo por Agendamento de Visita (CAC Imobiliário)",
        "Google Ads estabelecido como o canal #1 de aquisição previsível da imobiliária no RS",
        "Taxa de conversão de leads em visitas presenciais aumentada em 185%"
    ],
    metrics: [
        { value: "+1.000", label: "Visitas Agendadas" },
        { value: "-38%", label: "CAC Imobiliário" },
        { value: "Google Ads", label: "Canal Principal" },
        { value: "185%", label: "Aumento em Agendamentos" }
    ],
    preview_description: "Estratégia de aquisição no Google Ads e funil automatizado de qualificação: Mais de 1.000 visitas presenciais e virtuais agendadas para a equipe de corretores no Rio Grande do Sul.",
    logoScale: 1.0,
    techStack: ["Google Ads", "HubSpot CRM", "Landing Pages", "n8n Automations"]
};
