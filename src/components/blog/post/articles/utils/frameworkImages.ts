// Utility function to get framework image based on category & article slug

export const articleImageMap: Record<string, string> = {
  "polemic-led-growth-metodo-linkedin-maquina-oportunidades": "/images/blog-v2/blog_polemic_growth.png",
  "chatgpt-para-growth-15-prompts-produtividade-marketing": "/images/blog-v2/blog_growth_chatgpt.png",
  "cold-email-2025-7-estrategias-que-funcionam": "/images/blog-v2/blog_cold_email_2025.png",
  "ltv-vs-cac-calcular-otimizar-crescimento-sustentavel": "/images/blog-v2/blog_ltv_cac_balance.png",
  "product-market-fit-5-sinais-encontrou-3-que-nao": "/images/blog-v2/blog_pmf_fit.png",
  "linkedin-sales-navigator-guia-completo-prospeccao-b2b": "/images/blog-v2/blog_sales_nav.png",
  "o-funil-que-realmente-funciona-para-empresas-b2b": "/images/blog-v2/blog_efficient_funnel.png",
  "o-que-e-plg-e-como-aplicar-em-startups-brasileiras": "/images/blog-v2/blog_plg_startups.png",
  "cro-na-pratica-como-dobrar-sua-taxa-de-conversao": "/images/blog-v2/blog_cro_practical.png",
  "7-automacoes-de-marketing-que-escalam-sua-operacao": "/images/blog-v2/blog_marketing_automation.png",
  "como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto": "/images/blog-v2/blog_product_led_funnel.png",
  "estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas": "/images/blog-v2/blog_ai_presales.png",
  "diagnostico-de-marketing-orientado-por-dados": "/images/blog-v2/blog_ai_marketing.png",
  "playbooks-de-vendas-e-marketing-que-escalam-resultados": "/images/blog-v2/blog_dept_integration.png",
  "como-combinar-inbound-outbound-e-plg": "/images/blog-v2/blog_gtm_strategy.png",
  "canais-de-aquisicao-com-roi-imediato-para-startups": "/images/blog-v2/blog_saas_trial_growth.png",
  "como-estruturar-um-time-de-growth-com-poucos-recursos": "/images/blog-v2/blog_dept_integration.png",
  "analise-de-dados-para-fundadores-quais-metricas-importam": "/images/blog-v2/blog_revops_core.png",
  "os-melhores-crms-e-automacoes-para-crescimento-b2b": "/images/blog-v2/blog_saas_pipeline.png",
  "saas-trial-pipeline-optimization": "/images/blog-v2/blog_saas_pipeline_cover.png",
  "como-desenhar-uma-jornada-do-usuario-que-ativa-e-converte": "/images/blog-v2/blog_user_journey_cover.png",
  "integracao-marketing-vendas-sucesso-cliente": "/images/blog-v2/blog_dept_integration.png",
  "estrategia-gtm-go-to-market-para-novos-produtos": "/images/blog-v2/blog_gtm_strategy_cover.png",
  "anatomia-da-demo-perfeita-vendas-b2b": "/images/blog-v2/blog_demo_perfeita_cover.png",
  "revops-framework-definitivo-revenue-operations": "/images/blog-v2/blog_revops_frame_cover.png",
  "psicologia-pricing-b2b-estrategia-precos": "/images/blog-v2/blog_pricing_psychology_cover.png",
  "comissionamento-vendas-sdr-closer-modelos": "/images/blog-v2/blog_sales_commission.png",
  "manual-anti-churn-retencao-clientes-cs": "/images/blog-v2/blog_antichurn_manual.png",
  "saas-plg-como-usar-seu-trial-gratuito-para-gerar-pipeline": "/images/blog-v2/blog_saas_trial_growth.png",
  "ia-generativa-marketing-alem-do-hype": "/images/blog-v2/blog_ai_marketing_cover.png",
  "diagnostico-360-descobrir-gargalos-funil": "/images/blog-v2/blog_diagnostico_360.png",
  "abm-na-pratica-escolher-contas-alvo": "/images/blog-v2/blog_abm_strategy_cover.png",
  "diagnostico-funil-comercial-identificar-gargalos": "/images/blog-v2/blog_funnel_comercial.png",
  "crm-2025-por-que-toda-empresa-b2b-precisa": "/images/blog-v2/blog_saas_pipeline.png"
};

export const getArticleImageBySlug = (slug: string): string => {
  return articleImageMap[slug] || "/images/blog-v2/blog_revops_core.png";
};

export const getFrameworkImage = (category: string, slug?: string): string => {
  if (slug && articleImageMap[slug]) {
    return articleImageMap[slug];
  }
  return "/images/blog-v2/blog_revops_core.png";
};
