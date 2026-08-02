import * as z from 'zod';
import { REISection, REIConfig } from '@/types/rei';

/**
 * smartReiConfig.ts
 *
 * Configuração Otimizada do Diagnóstico & Onboarding REI (Revenue Excellence Initiative).
 * Elimina 100% das redundâncias entre formulários e reduz de 45+ para 18 Perguntas de Alto Impacto
 * divididas em 3 Pilares Executivos.
 */

export const smartReiSections: REISection[] = [
  {
    id: 1,
    title: "Pilar 1: Arquitetura de Negócio, Oferta & ICP",
    questions: [
      {
        id: "icp_definition",
        label: "Perfil de Cliente Ideal (ICP) e Anti-ICP",
        type: "textarea",
        validation: z.string().min(10, "Descreva seu ICP e perfil de cliente recusado"),
        placeholder: "Ideal: Empresas B2B de 20-100 funcionários com CRM instalado. Anti-ICP: B2C ou startups sem produto validado."
      },
      {
        id: "ticket_and_cycle",
        label: "Ticket Médio & Ciclo de Vendas Habitual",
        type: "input",
        validation: z.string().min(2, "Informe seu ticket médio e tempo de fechamento"),
        placeholder: "Ex: Ticket R$ 8.000/mês | Ciclo de 30 a 45 dias"
      },
      {
        id: "uvp_competitive_edge",
        label: "Proposta Única de Valor (UVP) & Diferencial Defensável",
        type: "textarea",
        validation: z.string().min(10, "Informe seu diferencial contra concorrentes"),
        placeholder: "O que você entrega que nenhum concorrente direto consegue copiar nos primeiros 90 dias?"
      },
      {
        id: "media_channels_budget",
        label: "Canais de Aquisição & Orçamento Mensal de Mídia",
        type: "textarea",
        validation: z.string().min(5, "Canais e orçamento de mídia"),
        placeholder: "Ex: R$ 15.000/mês divididos em Google Ads (60%) e LinkedIn Ads (40%). Outbound via Cold Email."
      },
      {
        id: "revenue_goals_90d_12m",
        label: "Metas de Receita & Novos Contratos (90 Dias vs 12 Meses)",
        type: "input",
        validation: z.string().min(5, "Metas de receita"),
        placeholder: "90 dias: +R$ 50k MRR | 12 meses: R$ 3M ARR"
      },
      {
        id: "primary_leak_bottleneck",
        label: "Onde está o Maior Vazamento de Receita Hoje?",
        type: "select",
        validation: z.string().min(1, "Selecione o gargalo principal"),
        options: [
          "Atração: Falta de volume de leads qualificados no topo de funil",
          "Qualificação: Volume alto de leads curiosos sem orçamento/fit",
          "Conversão Comercial: Leads qualificados esfriam entre a demonstração e o fechamento",
          "Retenção/LTV: Cancelamento precoce e falta de expansão na base"
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Pilar 2: Engenharia de CRM, RevOps & Automações de IA",
    questions: [
      {
        id: "tech_stack_crm",
        label: "CRM Atual & Ecossistema de Ferramentas",
        type: "input",
        validation: z.string().min(2, "CRM e ferramentas"),
        placeholder: "Ex: HubSpot Pro + Make + GoHighLevel + Typeform"
      },
      {
        id: "sales_team_structure",
        label: "Estrutura do Time Comercial (SDRs, BDRs, Closers)",
        type: "input",
        validation: z.string().min(2, "Composição do time"),
        placeholder: "Ex: 2 SDRs outbound, 1 SDR inbound, 2 Account Executives (Closers)"
      },
      {
        id: "speed_to_lead_sla",
        label: "Tempo Médio de Primeiro Atendimento (SLA)",
        type: "select",
        validation: z.string().min(1, "Selecione o SLA atual"),
        options: [
          "Imediato (menos de 5 minutos via automação/WhatsApp)",
          "Entre 5 e 30 minutos",
          "Entre 1 e 4 horas",
          "Mais de 24 horas ou sem SLA definido"
        ]
      },
      {
        id: "pipeline_conversion_friction",
        label: "Taxas de Passagem & Ponto de Maior Atrito Comercial",
        type: "textarea",
        validation: z.string().min(5, "Descreva onde o lead trava"),
        placeholder: "O lead agenda mas não comparece à call (No-show de 35%), ou no-show pós-proposta."
      },
      {
        id: "ai_agent_scope",
        label: "Escopo Desejado para Agentes de IA no CRM",
        type: "select",
        validation: z.string().min(1, "Escopo de IA"),
        options: [
          "Qualificação em tempo real + Agendamento autônomo de chamadas",
          "Enriquecimento de dados de empresas antes da reunião do vendedor",
          "Follow-up e reativação automática de propostas paradas",
          "Arquitetura completa de IA (Qualificação + Enriquecimento + Follow-up)"
        ]
      },
      {
        id: "top_lost_reasons",
        label: "Principais Motivos de Perda Registrados no CRM",
        type: "textarea",
        validation: z.string().min(5, "Motivos de perda"),
        placeholder: "1. Preço/Orçamento | 2. Timing/Sem prioridade | 3. Optou por concorrente interno"
      }
    ]
  },
  {
    id: 3,
    title: "Pilar 3: Founder-Led Growth & Ativos de Autoridade",
    questions: [
      {
        id: "market_dogmas_to_break",
        label: "Dogmas do Mercado que o Founder Quer Combater",
        type: "textarea",
        validation: z.string().min(5, "Quais verdades você quer derrubar?"),
        placeholder: "Ex: 'Agências tradicionais vendem relatório de vaidade em vez de receita instalada no CRM'."
      },
      {
        id: "founder_origin_superpower",
        label: "Superpoder & Diferencial de Bagagem do Founder",
        type: "textarea",
        validation: z.string().min(5, "Diferencial do fundador"),
        placeholder: "O que o founder viveu/construiu que gera credibilidade imediata no primeiro minuto de conversa?"
      },
      {
        id: "brand_voice_redlines",
        label: "Tom de Voz & Linhas Vermelhas (Palavras/Assuntos Proibidos)",
        type: "textarea",
        validation: z.string().min(5, "Estilo de comunicação"),
        placeholder: "Tom: Direto, provocativo, técnico e sem jargões corporativos vazios. Proibido: Promessas milagrosas."
      },
      {
        id: "founder_distribution_channels",
        label: "Canais Principais de Atuação do Founder",
        type: "select",
        validation: z.string().min(1, "Canal principal"),
        options: [
          "LinkedIn (Artigos, Posts de Autoridade e Conexões C-Level)",
          "YouTube & Vídeos de Demonstração Técnica",
          "Podcasts & Eventos Presenciais do Setor",
          "Omnichannel (LinkedIn + YouTube + Eventos)"
        ]
      },
      {
        id: "unspoken_buyer_fear",
        label: "Dor Oculta / Medo Não Verbalizado do Comprador",
        type: "textarea",
        validation: z.string().min(5, "Dor oculta do comprador"),
        placeholder: "O comprador não tem medo apenas de perder dinheiro, ele tem medo de parecer incompetente para o conselho/sócios."
      },
      {
        id: "legacy_positioning_12m",
        label: "Posicionamento Desejado em 12 Meses",
        type: "textarea",
        validation: z.string().min(5, "Como quer ser visto no mercado"),
        placeholder: "Ser reconhecido como a referência número 1 em Engenharia de GTM no Brasil."
      }
    ]
  }
];

export const smartReiConfig: REIConfig = {
  type: 'consulting',
  title: 'REI – Revenue Excellence Initiative (Smart Protocol)',
  subtitle: 'Protocolo Executivo de Onboarding & Arquitetura de GTM em 3 Pilares',
  sections: smartReiSections,
  totalQuestions: 18
};
