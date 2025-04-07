
export const casesData = {
  "enics": {
    title: "ENICS",
    category: "Eventos",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
    challenge: "O ENICS precisava vender 3 mil ingressos para seu evento em um prazo muito curto de 30 dias, necessitando uma estratégia eficiente de marketing digital.",
    solution: "Implementamos uma estratégia integrada de Google Ads, Meta Ads, campanhas de remarketing e automações via e-mail e WhatsApp altamente segmentadas para atingir o público correto.",
    results: [
      "3 mil ingressos vendidos no prazo estabelecido de 30 dias",
      "Campanhas de Google Ads e Meta Ads segmentadas atraíram o público ideal",
      "Remarketing aumentou a taxa de conversão em 50%",
      "Automação em e-mail e WhatsApp manteve o público engajado"
    ],
    metrics: [
      {
        value: "3 mil",
        label: "Ingressos vendidos em 30 dias"
      },
      {
        value: "30 dias",
        label: "Prazo necessário para atingir a meta de vendas"
      },
      {
        value: "50%",
        label: "Aumento na conversão com o uso de campanhas de remarketing"
      },
      {
        value: "4 canais",
        label: "Para impulsionar as vendas (Google Ads, Meta Ads, e-mail e WhatsApp)"
      }
    ],
    quote: "A estratégia integrada da RevHackers foi essencial para alcançarmos nossa meta de vendas em um prazo tão curto. A combinação de campanhas segmentadas e automações foi decisiva.",
    author: "Diretor de Marketing",
    role: "ENICS"
  },
  "waproject": {
    title: "Wa Project",
    category: "Software",
    logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1581094428992-6100bc3ac3e3",
    challenge: "A Wa Project buscava aumentar suas vendas e estabelecer parcerias estratégicas com grandes players do mercado de software, como Localiza e Porto Seguro.",
    solution: "Estruturamos um processo de Account-Based Marketing (ABM) personalizado para abordar grandes empresas do setor de software, com estratégias específicas para cada conta.",
    results: [
      "R$ 3 milhões em vendas gerados com contratos estratégicos",
      "Parcerias firmadas com empresas líderes como Localiza e Porto Seguro",
      "Ciclo de vendas otimizado em 50% com estratégias personalizadas",
      "Campanhas focadas resultaram em maior eficiência e conversão"
    ],
    metrics: [
      {
        value: "R$ 3 Mi",
        label: "Valor gerado em novos negócios com grandes empresas"
      },
      {
        value: "20%",
        label: "Aumento na taxa de conversão após a implementação do ABM"
      },
      {
        value: "50%",
        label: "Na estratégia, essa foi a taxa de redução no tempo do ciclo de vendas"
      },
      {
        value: "10",
        label: "Empresas-chave conquistadas como clientes no setor de software"
      }
    ],
    quote: "A estratégia de ABM implementada pela RevHackers nos permitiu abordar de forma efetiva grandes contas que antes pareciam inacessíveis, estabelecendo parcerias valiosas.",
    author: "CEO",
    role: "Wa Project"
  },
  "funnels": {
    title: "Funnels",
    category: "Tecnologia",
    logo: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    challenge: "A Funnels precisava escalar rapidamente sua base de clientes e buscava uma estratégia eficiente para atrair contas qualificadas em curto prazo.",
    solution: "Implementamos uma estratégia personalizada combinando automação, personalização e abordagens focadas em atrair contas qualificadas no curto prazo.",
    results: [
      "Estratégia personalizada atraiu contas qualificadas no curto prazo",
      "100 novas contas foram adicionadas em 3 meses",
      "Campanhas ABM e automação otimizadas aumentaram conversões",
      "Base sólida para crescimento contínuo foi estabelecida"
    ],
    metrics: [
      {
        value: "100",
        label: "Novas contas ativas em 3 meses"
      },
      {
        value: "90%",
        label: "Aumento na taxa de conversão das campanhas"
      },
      {
        value: "3",
        label: "Meses para alcançar os resultados"
      },
      {
        value: "25%",
        label: "Essa foi a redução no ciclo de vendas"
      }
    ],
    quote: "A implementação da estratégia da RevHackers superou nossas expectativas iniciais, nos permitindo crescer rapidamente e de forma sustentável.",
    author: "Diretor Comercial",
    role: "Funnels"
  }
};

export type CaseStudyKey = keyof typeof casesData;
export type CaseStudy = typeof casesData[CaseStudyKey];
