export interface Material {
    id: string;
    title: string;
    slug: string;
    type: string; // Display type (e.g. 'Playbook')
    material_type: string; // DB/Internal type
    category: string;
    description: string;
    cover_image: string;
    material_url: string; // URL logic (internal slug ref or direct link)
    link_material: string; // Download link (ClickUp/PDF)
    published: boolean;
    is_active: boolean;
    icon?: string; // Optional icon override
}

export const materialsData: Material[] = [
    {
        id: 'framework-ia-meta-ads',
        title: 'Framework Completo: Agente de IA para Meta Ads',
        slug: 'framework-ia-meta-ads',
        type: 'Framework',
        material_type: 'framework',
        category: 'Automação',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_marketing_automation.png',
        material_url: '/materiais/framework-ia-meta-ads',
        link_material: 'https://bustling-lemon-68c.notion.site/3b1bdc72e039818fb5ccc42c813e1fa1',
        published: true,
        is_active: true
    },
    {
        id: 'plano-acao-90-dias',
        title: 'Plano de Ação 90 Dias',
        slug: 'plano-acao-90-dias',
        type: 'Template',
        material_type: 'template',
        category: 'Gestão',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_strategy_playbooks.png',
        material_url: '/materiais/plano-acao-90-dias',
        link_material: 'https://lp.revhackers.com.br/post/plano-acao-90-dias',
        published: true,
        is_active: true
    },
    {
        id: 'guia-agent-builder',
        title: 'Guia Definitivo Agent Builder da OpenAI',
        slug: 'guia-agent-builder',
        type: 'Guia',
        material_type: 'guide',
        category: 'Automação',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_growth_chatgpt.png',
        material_url: '/materiais/guia-agent-builder',
        link_material: 'https://bustling-lemon-68c.notion.site/3b1bdc72e03981f286f3ee0390b60fd5',
        published: true,
        is_active: true
    },
    {
        id: 'crm-estrategico',
        title: 'Guia Completo: CRM Estratégico que Realmente Converte',
        slug: 'crm-estrategico',
        type: 'Guia',
        material_type: 'guide',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_sales_commission.png',
        material_url: '/materiais/crm-estrategico',
        link_material: 'https://bustling-lemon-68c.notion.site/3b1bdc72e0398116ad99c92f4aceb3c8',
        published: true,
        is_active: true
    },
    {
        id: 'transforme-linkedin',
        title: 'Transforme Seu LinkedIn em uma Máquina de Reuniões',
        slug: 'transforme-linkedin',
        type: 'Guia',
        material_type: 'guide',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_sales_nav.png',
        material_url: '/materiais/transforme-linkedin',
        link_material: 'https://bustling-lemon-68c.notion.site/3b1bdc72e0398139b03bf54002aa472f',
        published: true,
        is_active: true
    },
    {
        id: 'guia-gtm',
        title: 'Guia Prático de Estratégia Go-To-Market (GTM)',
        slug: 'guia-gtm',
        type: 'Guia',
        material_type: 'guide',
        category: 'Estratégia',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_gtm_strategy.png',
        material_url: '/materiais/guia-gtm',
        link_material: 'https://bustling-lemon-68c.notion.site/3b1bdc72e0398113a40ed099ea7f2f79',
        published: true,
        is_active: true
    },
    {
        id: 'linkedin-outreach',
        title: 'Guia de Outreach Personalizado no LinkedIn',
        slug: 'linkedin-outreach',
        type: 'Guia',
        material_type: 'guide',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_polemic_growth.png',
        material_url: '/materiais/linkedin-outreach',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e03981128dcbd9b1285f0c98',
        published: true,
        is_active: true
    },
    {
        id: 'timing-sales-playbook',
        title: 'Framework de Vendas por Timing',
        slug: 'timing-sales-playbook',
        type: 'Playbook',
        material_type: 'playbook',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_demo_anatomy.png',
        material_url: '/materiais/timing-sales-playbook',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e0398157aec3cd72ca2c1915',
        published: true,
        is_active: true
    },
    {
        id: 'contato-decisores',
        title: 'Como Conseguir Contato Direto de Decisores B2B',
        slug: 'contato-decisores',
        type: 'Guia',
        material_type: 'guide',
        category: 'Prospecção',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_cold_email_2025.png',
        material_url: '/materiais/contato-decisores',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e03981849f51cc033be06d9a',
        published: true,
        is_active: true
    },
    {
        id: 'framework-clickup',
        title: 'Como Estruturar Operação de Projetos no ClickUp para Times de Growth',
        slug: 'framework-clickup',
        type: 'Framework',
        material_type: 'framework',
        category: 'Operação',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_pmf_fit.png',
        material_url: '/materiais/framework-clickup',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e039815d81dde70d2273a6dd',
        published: true,
        is_active: true
    },
    {
        id: 'servidor-ia-local',
        title: 'Servidor de IA Local & Cluster de LLMs',
        slug: 'servidor-ia-local',
        type: 'Guia',
        material_type: 'guide',
        category: 'Infraestrutura',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_ai_marketing.png',
        material_url: '/materiais/servidor-ia-local',
        link_material: 'https://bustling-lemon-68c.notion.site/3b1bdc72e03981e3ad18d9916c0a67d4',
        published: true,
        is_active: true
    },
    {
        id: 'growth-score-guia-acao',
        title: 'Guia de Ação: Growth Score',
        slug: 'growth-score-guia-acao',
        type: 'Guia',
        material_type: 'guide',
        category: 'Growth',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_diagnostico_360.png',
        material_url: '/materiais/growth-score-guia-acao',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e039816f872fd9166bcefa92',
        published: true,
        is_active: true
    },
    {
        id: 'site-score-guia-acao',
        title: 'Guia de Ação: Site Score',
        slug: 'site-score-guia-acao',
        type: 'Guia',
        material_type: 'guide',
        category: 'Growth',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_cro_practical.png',
        material_url: '/materiais/site-score-guia-acao',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e03981539fcaec897782dbbb',
        published: true,
        is_active: true
    },
    {
        id: 'founder-score-guia-acao',
        title: 'Guia de Ação: Founder Score',
        slug: 'founder-score-guia-acao',
        type: 'Guia',
        material_type: 'guide',
        category: 'Growth',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_founder_data_v2.png',
        material_url: '/materiais/founder-score-guia-acao',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e0398183a6cffb86769c7189',
        published: true,
        is_active: true
    },
    {
        id: 'revenue-score-guia-acao',
        title: 'Guia de Ação: Revenue Score',
        slug: 'revenue-score-guia-acao',
        type: 'Guia',
        material_type: 'guide',
        category: 'Growth',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_revops_core.png',
        material_url: '/materiais/revenue-score-guia-acao',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e039819aa52de191f0a95b93',
        published: true,
        is_active: true
    },
    {
        id: 'playbook-handoff-vendas-cs',
        title: 'Playbook de Handoff Vendas → Customer Success',
        slug: 'playbook-handoff-vendas-cs',
        type: 'Playbook',
        material_type: 'playbook',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_dept_integration.png',
        material_url: '/materiais/playbook-handoff-vendas-cs',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e03981db966ef724a3663b9e',
        published: true,
        is_active: true
    },
    {
        id: 'matriz-compensacao-vendas-b2b',
        title: 'Matriz de Compensação e Metas de Vendas B2B',
        slug: 'matriz-compensacao-vendas-b2b',
        type: 'Guia',
        material_type: 'guide',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_sales_commission.png',
        material_url: '/materiais/matriz-compensacao-vendas-b2b',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e039814b93e0e90b0841bce4',
        published: true,
        is_active: true
    },
    {
        id: 'guia-precificacao-saas-b2b',
        title: 'Guia de Precificação para Serviços/SaaS B2B',
        slug: 'guia-precificacao-saas-b2b',
        type: 'Guia',
        material_type: 'guide',
        category: 'Estratégia',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_pricing_psychology.png',
        material_url: '/materiais/guia-precificacao-saas-b2b',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e039814fbfcfd742f6eac760',
        published: true,
        is_active: true
    },
    {
        id: 'framework-territorios-contas-b2b',
        title: 'Framework de Territórios e Segmentação de Contas B2B',
        slug: 'framework-territorios-contas-b2b',
        type: 'Framework',
        material_type: 'framework',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_abm_strategy_cover.png',
        material_url: '/materiais/framework-territorios-contas-b2b',
        link_material: 'https://bustling-lemon-68c.notion.site/3b2bdc72e039815095e7fe40a648b77e',
        published: true,
        is_active: true
    }
];
