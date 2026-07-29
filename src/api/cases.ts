
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type CaseStudy = Database['public']['Tables']['cases']['Row'];

const CASE_OVERRIDES: Record<string, { logo?: string; scale?: number }> = {
    'Heineken': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Heineken_logo.svg',
        scale: 1.5 // Standardized size to match ENICS and others
    },
    'ENICS': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695996b8748303e24fe82be8.png',
        scale: 1.5
    },
    'TOEFL Junior Brasil': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6959970205b5117729df4a50.png',
        scale: 1.5
    },
    'TOEFL': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6959970205b5117729df4a50.png',
        scale: 1.5
    },
    'Tikpag': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695997877483037113e88497.png',
        scale: 2.8 // Maximized visibility
    },
    'Agence MR': {
        logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695997bd3ccdd6417ab25199.png',
        scale: 1.5
    },
    'Funnels': {
        scale: 1.5 // Standardizing size
    }
};

const applyOverrides = (c: CaseStudy): CaseStudy & { logoScale?: number } => {
    const title = c.client_name || c.title || '';
    // Check exact title or partial match for flexibility
    const overrideKey = Object.keys(CASE_OVERRIDES).find(key => title.includes(key)) || title;
    const override = CASE_OVERRIDES[overrideKey];

    if (override) {
        return {
            ...c,
            client_logo: override.logo || c.client_logo,
            // @ts-ignore - Injecting runtime property for frontend use
            logoScale: override.scale || 1.0
        };
    }
    return c;
};

const FALLBACK_CASES: any[] = [
    {
        id: 'case-enics',
        title: 'ENICS Energy Systems',
        client_name: 'ENICS',
        slug: 'enics-abm',
        case_category: 'ABM & IA',
        preview_description: 'Estruturação de máquina de prospecção ABM com IA de qualificação. Geração de R$ 14.2M em pipeline de grandes contas em 90 dias com redução de 45% no CAC.',
        client_logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695996b8748303e24fe82be8.png',
        published: true,
        featured: true,
        created_at: new Date().toISOString(),
        metrics: [
            { label: "Pipeline Gerado", value: "R$ 14,2M" },
            { label: "Redução de CAC", value: "-45%" },
            { label: "Reuniões C-Level", value: "+180" }
        ]
    },
    {
        id: 'case-tikpag',
        title: 'Tikpag PayTech',
        client_name: 'Tikpag',
        slug: 'tikpag-revops',
        case_category: 'RevOps & CRM',
        preview_description: 'Reestruturação completa de CRM e réguas automáticas de acompanhamento no HubSpot. Aumento de 3.2x na velocidade de conversão do funil de vendas.',
        client_logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/695997877483037113e88497.png',
        published: true,
        featured: true,
        created_at: new Date().toISOString(),
        metrics: [
            { label: "Aceleração de Funil", value: "3.2x" },
            { label: "Follow-up Automático", value: "85%" },
            { label: "Margem Recuperada", value: "R$ 3,8M" }
        ]
    },
    {
        id: 'case-toefl',
        title: 'TOEFL Junior Brasil',
        client_name: 'TOEFL',
        slug: 'toefl-growth',
        case_category: 'Engenharia de Vendas',
        preview_description: 'Instalação de arquitetura de qualificação por IA e integração multicanal via WhatsApp. Multiplicação do volume de instituições parceiras auditadas.',
        client_logo: 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6959970205b5117729df4a50.png',
        published: true,
        featured: true,
        created_at: new Date().toISOString(),
        metrics: [
            { label: "Contratos Fechados", value: "+120%" },
            { label: "Tempo de Resposta", value: "< 2 min" },
            { label: "Custo por Lead Qualificado", value: "-60%" }
        ]
    },
    {
        id: 'case-heineken',
        title: 'Heineken B2B Distribution',
        client_name: 'Heineken',
        slug: 'heineken-gtm',
        case_category: 'Go-To-Market',
        preview_description: 'Arquitetura Go-To-Market para grandes contas e alinhamento preditivo de vendas com inteligência de dados operacionais.',
        client_logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Heineken_logo.svg',
        published: true,
        featured: true,
        created_at: new Date().toISOString(),
        metrics: [
            { label: "Penetração B2B", value: "+40%" },
            { label: "Retenção de Contas", value: "94%" },
            { label: "Eficiência de Vendas", value: "+2.5x" }
        ]
    }
];

export const getAllCases = async (): Promise<CaseStudy[]> => {
    try {
        const { data, error } = await supabase
            .from('cases')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            return data.map(applyOverrides);
        }
    } catch (err) {
        console.warn('Usando cases estáticos de alta performance:', err);
    }

    return FALLBACK_CASES.map(applyOverrides);
};

export const getCaseBySlug = async (slug: string): Promise<CaseStudy | null> => {
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

    if (error) {
        console.error('Error fetching case by slug:', error);
        return null;
    }

    return data ? applyOverrides(data) : null;
};

export const getFeaturedCases = async (): Promise<CaseStudy[]> => {
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .limit(3)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching featured cases:', error);
        return []; // Fail gracefully
    }

    return (data || []).map(applyOverrides);
};
