import * as z from 'zod';
import { REISection, REIConfig } from '@/types/rei';

/**
 * smartReiConfig.ts
 *
 * Protocolo Executivo Master REI (Revenue Excellence Initiative).
 * Onboarding Completo, Profundo e Estratégico (28 Perguntas em 4 Módulos Técnicos),
 * combinado com Enriquecimento Prévio por CNPJ e Transcrição por IA.
 */

export const smartReiSections: REISection[] = [
  {
    id: 1,
    title: "Módulo 1: Arquitetura de Receita, ICP & Matriz de Unidades Econômicas",
    questions: [
      {
        id: "icp_and_anticp_definition",
        label: "Perfil de Cliente Ideal (ICP), Decisor Econômico e Perfil Recusado (Anti-ICP)",
        type: "textarea",
        validation: z.string().min(10, "Descreva seu ICP e perfil de cliente recusado"),
        placeholder: "ICP Ideal: Empresas B2B de 20-100 funcionários com CRM instalado. Decisor: CEO/CMO. Anti-ICP: B2C ou startups sem produto validado."
      },
      {
        id: "unit_economics_margins",
        label: "Ticket Médio, MRR/ARR Atual e Margem Bruta de Contribuição",
        type: "input",
        validation: z.string().min(2, "Informe seu ticket médio e margens"),
        placeholder: "Ex: Ticket R$ 10.000/mês | MRR R$ 150k | Margem Bruta 80%"
      },
      {
        id: "sales_cycle_and_friction",
        label: "Ciclo de Vendas Habitual & Principais Pontos de Atrito",
        type: "textarea",
        validation: z.string().min(5, "Tempo do ciclo e onde o lead trava"),
        placeholder: "Ex: Ciclo de 35 dias. Atrito: Envio de proposta comercial e agendamento da call de fechamento."
      },
      {
        id: "uvp_defensible_edge",
        label: "Proposta Única de Valor (UVP) & 3 Vantagens Competitivas Defensáveis",
        type: "textarea",
        validation: z.string().min(10, "Diferencial defensável contra concorrentes"),
        placeholder: "Por que clientes fecham com você e não com a concorrência? (Cite 3 vantagens reais)."
      },
      {
        id: "acquisition_channels_budget",
        label: "Canais de Aquisição Atuais & Orçamento Mensal de Mídia Paga",
        type: "textarea",
        validation: z.string().min(5, "Canais e orçamento de mídia"),
        placeholder: "Ex: R$ 20.000/mês (50% Google Ads, 30% LinkedIn Ads, 20% Meta Ads) + Cold Mail Outbound."
      },
      {
        id: "onboarding_capacity_ltv",
        label: "Capacidade Máxima de Onboarding Sem Perda de Qualidade",
        type: "input",
        validation: z.string().min(2, "Capacidade de novos clientes por mês"),
        placeholder: "Ex: Máximo de 8 novas contas por mês com a equipe atual."
      },
      {
        id: "numeric_goals_90d_12m",
        label: "Metas Numéricas de Receita & Marcos de Sucesso (90d vs 12m)",
        type: "input",
        validation: z.string().min(5, "Metas de receita e marcos"),
        placeholder: "90 dias: +R$ 60k MRR e CAC < R$ 3.000 | 12 meses: R$ 4M ARR"
      }
    ]
  },
  {
    id: 2,
    title: "Módulo 2: Engenharia de CRM, RevOps, SLAs & Automação de IA",
    questions: [
      {
        id: "tech_stack_and_crm",
        label: "Stack Tecnológico Atual, CRM Central & Nível de Higienização de Dados",
        type: "input",
        validation: z.string().min(2, "CRM e ferramentas ativas"),
        placeholder: "Ex: HubSpot Pro + GoHighLevel + Make + Typeform + WhatsApp Z-API"
      },
      {
        id: "sales_team_roles",
        label: "Composição Exata da Equipe Comercial (SDRs, BDRs, Closers, Gestores)",
        type: "input",
        validation: z.string().min(2, "Composição do time de vendas"),
        placeholder: "Ex: 2 SDRs Inbound, 1 BDR Outbound, 2 Account Executives (Closers), 1 Head de Vendas"
      },
      {
        id: "speed_to_lead_sla_rule",
        label: "Tempo Médio de Resposta ao Lead Qualificado (SLA Speed-to-Lead)",
        type: "select",
        validation: z.string().min(1, "Selecione o SLA atual"),
        options: [
          "Imediato (menos de 3 minutos via IA/WhatsApp autônomo)",
          "Entre 3 e 15 minutos (atendimento manual rápido)",
          "Entre 15 minutos e 2 horas",
          "Mais de 2 horas ou sem regra de SLA definida"
        ]
      },
      {
        id: "crm_pipeline_friction",
        label: "Etapas do CRM & Taxa de Passagem com Maior Desperdício de Leads",
        type: "textarea",
        validation: z.string().min(5, "Onde os leads esfriam"),
        placeholder: "Ex: No-show de 30% entre a qualificação do SDR e a reunião com o AE."
      },
      {
        id: "conversational_ai_scope",
        label: "Escopo Desejado para Implementação de Agentes de IA no CRM",
        type: "select",
        validation: z.string().min(1, "Escopo de IA desejado"),
        options: [
          "Qualificação em tempo real + Agendamento autônomo de chamadas",
          "Enriquecimento automático de dados de empresas pré-call",
          "Follow-up inteligente de propostas paradas e reativação",
          "Arquitetura Completa de IA (Qualificação + Enriquecimento + Follow-up)"
        ]
      },
      {
        id: "top_lost_reasons_crm",
        label: "Principais Motivos de Perda Cadastrados no CRM",
        type: "textarea",
        validation: z.string().min(5, "Motivos de perda de negócios"),
        placeholder: "1. Objeção de Preço | 2. Timing/Falta de orçamento | 3. Preferiu solução caseira/concorrente"
      },
      {
        id: "cpq_proposal_friction",
        label: "Processo de Geração e Envio de Propostas Comercial (CPQ)",
        type: "textarea",
        validation: z.string().min(5, "Como propostas são geradas e enviadas"),
        placeholder: "Tempo médio de envio pós-call: 24h. Taxa de conversão de propostas: 25%."
      }
    ]
  },
  {
    id: 3,
    title: "Módulo 3: Founder-Led Growth, Personal Branding & Ativos de Autoridade",
    questions: [
      {
        id: "founder_origin_superpower",
        label: "História de Origem & 'Superpoder' do Fundador",
        type: "textarea",
        validation: z.string().min(5, "Diferencial de bagagem do founder"),
        placeholder: "Qual bagagem/experiência única do fundador gera autoridade instantânea no primeiro minuto de reunião?"
      },
      {
        id: "market_dogmas_to_break",
        label: "Mitos e Dogmas do Mercado que o Founder Quer Combater Publicamente",
        type: "textarea",
        validation: z.string().min(5, "Verdades do setor que você combate"),
        placeholder: "Ex: 'Agências tradicionais vendem relatórios de vaidade em vez de receita real no CRM'."
      },
      {
        id: "unspoken_buyer_fear",
        label: "Dor Oculta & Medo Não Verbalizado do Comprador C-Level",
        type: "textarea",
        validation: z.string().min(5, "Dor oculta do decisor"),
        placeholder: "O comprador tem medo de contratar a solução errada e parecer incompetente perante sócios/conselho."
      },
      {
        id: "brand_voice_redlines",
        label: "Tom de Voz, Vocabulário Oficial & Linhas Vermelhas (Palavras Proibidas)",
        type: "textarea",
        validation: z.string().min(5, "Estilo de comunicação e restrições"),
        placeholder: "Tom: Direto, incisivo, técnico e consultivo. Proibido: Clichês de agência ('sinergia', 'descomplicar')."
      },
      {
        id: "founder_distribution_channels",
        label: "Canais Principais de Distribuição do Founder",
        type: "select",
        validation: z.string().min(1, "Canal principal"),
        options: [
          "LinkedIn (Posts de Autoridade, Artigos e Conexões C-Level)",
          "YouTube & Demonstrações Técnicas de Código/Processo",
          "Podcasts, Palestras e Eventos Presenciais",
          "Omnichannel (LinkedIn + YouTube + Eventos)"
        ]
      },
      {
        id: "founder_time_budget",
        label: "Disponibilidade de Tempo Semanal do Founder para Gravação/Aprovação",
        type: "select",
        validation: z.string().min(1, "Disponibilidade de tempo"),
        options: [
          "1 a 2 horas por semana (Gravações em bloco)",
          "3 a 5 horas por semana",
          "Mais de 5 horas por semana (Foco em Founder-Led Growth)"
        ]
      },
      {
        id: "legacy_positioning_12m",
        label: "Visão de Legado & Posicionamento Desejado em 12 Meses",
        type: "textarea",
        validation: z.string().min(5, "Como quer ser visto no mercado"),
        placeholder: "Ser reconhecido como a maior autoridade em Engenharia de GTM no Brasil."
      }
    ]
  },
  {
    id: 4,
    title: "Módulo 4: Dev Web, Conversão de LPs, Tracking & Compliance",
    questions: [
      {
        id: "lp_conversion_speed",
        label: "Taxa de Conversão Atual das Landing Pages & Velocidade Mobile",
        type: "input",
        validation: z.string().min(2, "Taxa de conversão e velocidade"),
        placeholder: "Ex: Conversão atual 4.5% | Carregamento mobile 2.1s"
      },
      {
        id: "tracking_pixels_setup",
        label: "Pixels e Tags Instaladas (GTM, Meta, LinkedIn, GA4, Hotjar)",
        type: "textarea",
        validation: z.string().min(5, "Pixels ativos"),
        placeholder: "GTM instalado com Meta Pixel e LinkedIn Insight Tag. GA4 configurado com eventos de conversão."
      },
      {
        id: "utm_dictionary_standard",
        label: "Padronização do Dicionário de UTMs da Empresa",
        type: "input",
        validation: z.string().min(2, "Padrão de UTMs"),
        placeholder: "Ex: Padrão utm_source (meta, google, linkedin) | utm_medium (cpc, organico, email)"
      },
      {
        id: "lead_magnets_assets",
        label: "Ofertas de Captura Existentes (Planilhas, Calculadoras, Playbooks)",
        type: "textarea",
        validation: z.string().min(5, "Materiais ricos ativos"),
        placeholder: "Planilha de CAC/LTV, Calculadora de ROI e E-book de Estratégia GTM."
      },
      {
        id: "visual_identity_guidelines",
        label: "Identidade Visual, Paleta de Cores e Referências Visuais do Setor",
        type: "textarea",
        validation: z.string().min(5, "Referências visuais"),
        placeholder: "Design minimalista estilo Linear/Funnels. Cores: Preto, Branco e Verde Ação."
      },
      {
        id: "legal_compliance_lgpd",
        label: "Compliance, LGPD & Restrições Regulatórias do Mercado",
        type: "textarea",
        validation: z.string().optional(),
        optional: true,
        placeholder: "Políticas de privacidade em conformidade com LGPD. Sem restrições regulatórias específicas."
      },
      {
        id: "approval_workflow_campaigns",
        label: "Processo e Alçada Interna de Aprovação de Campanhas e Mídia",
        type: "textarea",
        validation: z.string().min(2, "Processo de aprovação"),
        placeholder: "Aprovação direta pelo CMO/Founder via ClickUp em até 24 horas."
      }
    ]
  }
];

export const smartReiConfig: REIConfig = {
  type: 'consulting',
  title: 'REI – Revenue Excellence Initiative (Master Protocol)',
  subtitle: 'Protocolo Executivo de Onboarding & Arquitetura de GTM (28 Perguntas em 4 Módulos)',
  sections: smartReiSections,
  totalQuestions: 28
};
