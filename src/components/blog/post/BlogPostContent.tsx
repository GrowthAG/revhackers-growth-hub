import React, { Suspense } from 'react';

import { useNavigate } from 'react-router-dom';
import ArticleCTA from './components/ArticleCTA';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import DynamicV2Renderer from './DynamicV2Renderer';
import { ArticleRenderer } from '../ArticleRenderer';

// Lazy-loaded article components - only loaded when slug matches
const lazyArticle = (loader: () => Promise<{ default: React.ComponentType<any> }>) =>
  React.lazy(loader);

interface BlogPostContentProps {
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  slug?: string;
  onCTAClick?: () => void;
}

interface ArticleComponentProps {
  onCTAClick?: () => void;
}

const BlogPostContent = ({ content, category, authorName, authorRole, authorAvatar, slug, onCTAClick }: BlogPostContentProps) => {
  const navigate = useNavigate();
  const articleSlug = slug || '';

  // Contextual Dynamic CTA Logic
  const lowerCategory = (category || '').toLowerCase();
  let ctaTitle = "Pronto para o próximo nível?";
  let ctaDesc = "A RevHackers ajuda empresas de tecnologia a estruturarem playbooks de crescimento previsível.";
  let ctaBtnText = "Agendar Diagnóstico";
  let ctaAction = onCTAClick;

  if (lowerCategory.includes('vendas') || lowerCategory.includes('comercial') || lowerCategory.includes('crm')) {
    ctaTitle = "Gargalos no seu Funil de Vendas?";
    ctaDesc = "Descubra exatamente onde você está perdendo negócios. Faça o diagnóstico comercial focado em Receita.";
    ctaBtnText = "Iniciar Revenue Score";
    ctaAction = () => navigate('/score-revenue');
  } else if (lowerCategory.includes('marketing') || lowerCategory.includes('seo') || lowerCategory.includes('conteúdo') || lowerCategory.includes('midia')) {
    ctaTitle = "Sua máquina de Marketing está tracionando?";
    ctaDesc = "Avalie a performance dos seus canais de aquisição e descubra como dobrar seus leads qualificados.";
    ctaBtnText = "Iniciar Marketing Score";
    ctaAction = () => navigate('/score-site');
  } else if (lowerCategory.includes('founder') || lowerCategory.includes('startups') || lowerCategory.includes('liderança') || lowerCategory.includes('plg')) {
    ctaTitle = "Qual o próximo gargalo da sua operação?";
    ctaDesc = "Faça o assessment exclusivo para Founders B2B e descubra onde focar sua energia para escalar.";
    ctaBtnText = "Iniciar Founder Score";
    ctaAction = () => navigate('/score-founder');
  } else {
    ctaTitle = "Sua operação B2B está pronta para escalar?";
    ctaDesc = "Faça o diagnóstico 360º de Growth e descubra os vazamentos que estão limitando seu crescimento.";
    ctaBtnText = "Iniciar Growth Score";
    ctaAction = () => navigate('/score');
  }

  // Try to parse content as Dynamic V2 JSON (Keep for legacy support or special grids)
  let dynamicV2Config = null;
  if (content && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.v2_template === true) {
        dynamicV2Config = parsed;
      }
    } catch { /* conteudo nao e JSON v2, segue como markdown */ }
  }

  // Lazy-loaded article components - each loaded only when its slug matches
  const articleComponents: Record<string, React.LazyExoticComponent<React.ComponentType<ArticleComponentProps>>> = {
    'polemic-led-growth-metodo-linkedin-maquina-oportunidades': lazyArticle(() => import('./articles/PolemicLedGrowthArticle')),
    'chatgpt-para-growth-15-prompts-produtividade-marketing': lazyArticle(() => import('./articles/ChatGPTGrowthArticle')),
    'cold-email-2025-7-estrategias-que-funcionam': lazyArticle(() => import('./articles/ColdEmailArticle')),
    'ltv-vs-cac-calcular-otimizar-crescimento-sustentavel': lazyArticle(() => import('./articles/LTVCACArticle')),
    'product-market-fit-5-sinais-encontrou-3-que-nao': lazyArticle(() => import('./articles/ProductMarketFitArticle')),
    'linkedin-sales-navigator-guia-completo-prospeccao-b2b': lazyArticle(() => import('./articles/LinkedInNavigatorArticle')),
    'o-funil-que-realmente-funciona-para-empresas-b2b': lazyArticle(() => import('./articles/DiagnosticoFunilArticle')),
    'o-que-e-plg-e-como-aplicar-em-startups-brasileiras': lazyArticle(() => import('./articles/PLGStartupsArticle')),
    'cro-na-pratica-como-dobrar-sua-taxa-de-conversao': lazyArticle(() => import('./articles/CROPraticaArticle')),
    '7-automacoes-de-marketing-que-escalam-sua-operacao': lazyArticle(() => import('./articles/AutomacaoMarketingArticle')),
    'como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto': lazyArticle(() => import('./articles/FunilAquisicaoProdutoArticle')),
    'estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas': lazyArticle(() => import('./articles/IAPreVendasArticle')),
    'diagnostico-de-marketing-orientado-por-dados': lazyArticle(() => import('./articles/DiagnosticoMarketingDataArticle')),
    'playbooks-de-vendas-e-marketing-que-escalam-resultados': lazyArticle(() => import('./articles/PlaybooksVendasMarketingArticle')),
    'como-combinar-inbound-outbound-e-plg': lazyArticle(() => import('./articles/TrinityGrowthArticle')),
    'canais-de-aquisicao-com-roi-imediato-para-startups': lazyArticle(() => import('./articles/CanaisAquisicaoStartupArticle')),
    'como-estruturar-um-time-de-growth-com-poucos-recursos': lazyArticle(() => import('./articles/GrowthTeamLeanArticle')),
    'analise-de-dados-para-fundadores-quais-metricas-importam': lazyArticle(() => import('./articles/FounderMetricsArticle')),
    'os-melhores-crms-e-automacoes-para-crescimento-b2b': lazyArticle(() => import('./articles/BestCRMsAutomationArticle')),
    'saas-trial-pipeline-optimization': lazyArticle(() => import('./articles/SaaSTrialPipelineArticle')),
    'como-desenhar-uma-jornada-do-usuario-que-ativa-e-converte': lazyArticle(() => import('./articles/UserJourneyMapArticle')),
    'integracao-marketing-vendas-sucesso-cliente': lazyArticle(() => import('./articles/IntegracaoMktVendasArticle')),
    'estrategia-gtm-go-to-market-para-novos-produtos': lazyArticle(() => import('./articles/EstrategiaGTMArticle')),
    'anatomia-da-demo-perfeita-vendas-b2b': lazyArticle(() => import('./articles/AnatomiaDaDemoArticle')),
    'revops-framework-definitivo-revenue-operations': lazyArticle(() => import('./articles/RevOpsFrameworkArticle')),
    'psicologia-pricing-b2b-estrategia-precos': lazyArticle(() => import('./articles/PricingStrategyArticle')),
    'comissionamento-vendas-sdr-closer-modelos': lazyArticle(() => import('./articles/SalesCommissionArticle')),
    'manual-anti-churn-retencao-clientes-cs': lazyArticle(() => import('./articles/AntiChurnPlaybookArticle')),
    'saas-plg-como-usar-seu-trial-gratuito-para-gerar-pipeline': lazyArticle(() => import('./articles/SaaSPLGArticle')),
    'ia-generativa-marketing-alem-do-hype': lazyArticle(() => import('./articles/IAGenerativaMarketingArticle')),
    'diagnostico-360-descobrir-gargalos-funil': lazyArticle(() => import('./articles/Diagnostico360Article')),
    'abm-na-pratica-escolher-contas-alvo': lazyArticle(() => import('./articles/ABMPracticeArticle')),
    'diagnostico-funil-comercial-identificar-gargalos': lazyArticle(() => import('./articles/DiagnosticoFunilComercialArticle')),
  };

  const CustomArticleComponent = articleSlug ? articleComponents[articleSlug] : null;

  const getFixedAuthorAvatar = (path: string) => {
    if (!path) return "/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png";
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/uploads/${path}`;
  };

  const fixedAvatar = getFixedAuthorAvatar(authorAvatar);

  return (
    <article className="bg-white text-zinc-900 overflow-hidden antialiased">
      <div className="max-w-4xl mx-auto">
        {dynamicV2Config ? (
          <DynamicV2Renderer config={dynamicV2Config} onCTAClick={onCTAClick} />
        ) : CustomArticleComponent ? (
          <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" /></div>}>
            <CustomArticleComponent onCTAClick={onCTAClick} />
          </Suspense>
        ) : (
          <div className="space-y-6">
            {/* Use ArticleRenderer for clean, standardized article formatting */}
            <ArticleRenderer content={content} />

            {/* Contextual CTA */}
            <ArticleCTA 
              title={ctaTitle}
              description={ctaDesc}
              primaryBtnText={ctaBtnText}
              onPrimaryClick={ctaAction}
            />
          </div>
        )}

        {/* Author Footer - Nobibecode SaaS Executive Style */}
        <div className="mt-20 pt-10 border-t border-zinc-200/80 flex flex-col md:flex-row items-center md:items-start gap-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
          <img
            src={fixedAvatar}
            alt={authorName}
            loading="lazy"
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png';
            }}
          />

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h4 className="text-base font-bold text-zinc-900 tracking-tight">{authorName}</h4>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00CC6A] text-black w-fit mx-auto md:mx-0">
                {authorRole}
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              Especialista em Growth e Estratégia de Receita B2B. Focado em transformar operações complexas em máquinas de crescimento previsíveis e escaláveis.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostContent;
