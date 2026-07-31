import { REIConfig } from '@/types/rei';
import { z } from 'zod';

export const siteConfig: REIConfig = {
    type: 'site',
    title: 'Diagnóstico REI Site & Landing Page',
    subtitle: 'Roteiro técnico de levantamento para conversão, velocidade, SEO e experiência do usuário.',
    totalQuestions: 25,
    sections: [
        {
            id: 1,
            title: '1. Arquitetura & Domínio Atual',
            questions: [
                { id: 'site_url', label: 'URL / Domínio do Site Atual', type: 'input', validation: z.string().min(3, 'URL é obrigatória'), placeholder: 'https://suaempresa.com.br' },
                { id: 'site_plataforma', label: 'Plataforma / CMS Atual', type: 'select', options: ['WordPress', 'Webflow', 'React/Next.js', 'Wix', 'Outra', 'Nenhum (Criar do zero)'], validation: z.string() },
                { id: 'site_hospedagem', label: 'Provedor de Hospedagem', type: 'input', validation: z.string().optional(), placeholder: 'Ex: Vercel, Hostinger, AWS...' },
            ]
        },
        {
            id: 2,
            title: '2. Objetivos de Conversão & UX',
            questions: [
                { id: 'site_objetivo_principal', label: 'Objetivo Principal da Landing Page', type: 'select', options: ['Capturar Leads B2B', 'Agendamento de Call', 'Venda Direta / E-commerce', 'Autoridade de Marca'], validation: z.string() },
                { id: 'site_headline_atual', label: 'Proposta de Valor / Headline Atual', type: 'textarea', validation: z.string().optional(), placeholder: 'Qual a promessa central do seu produto ou serviço?' },
                { id: 'site_publico_alvo', label: 'Perfil do Visitante (ICP)', type: 'textarea', validation: z.string().optional(), placeholder: 'Quem é a pessoa que vai acessar este site?' },
            ]
        },
        {
            id: 3,
            title: '3. Ativos Visuais & Marca',
            questions: [
                { id: 'site_manual_marca', label: 'Possui Manual de Marca / Guia de Estilo?', type: 'select', options: ['Sim, completo (Figma/PDF)', 'Apenas Logo em PNG/SVG', 'Não, precisamos criar'], validation: z.string() },
                { id: 'site_referencias', label: 'Sites de Referência que Você Gosta', type: 'textarea', validation: z.string().optional(), placeholder: 'Insira 2 ou 3 links de sites inspiradores.' },
            ]
        },
        {
            id: 4,
            title: '4. Integrações & Rastreamento',
            questions: [
                { id: 'site_pixel_analytics', label: 'Ferramentas de Rastreamento Instaladas', type: 'textarea', validation: z.string().optional(), placeholder: 'Ex: Google Analytics 4, Meta Pixel, Hotjar, PostHog...' },
                { id: 'site_crm_destino', label: 'Para onde os formulários devem enviar os leads?', type: 'input', validation: z.string().optional(), placeholder: 'Ex: HubSpot, RD Station, Webhook...' },
            ]
        }
    ]
};
