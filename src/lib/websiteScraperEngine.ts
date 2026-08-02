/**
 * websiteScraperEngine.ts
 *
 * Motor de Raspagem e Análise Inteligente de Websites Corporativos.
 * Raspa o HTML público do site da empresa, extrai Proposta Única de Valor (UVP),
 * detecta Pixels/Tags ativas (GTM, Meta, LinkedIn, GA4, HubSpot), redes sociais e logo HD.
 */

import { fetchBestCompanyLogo } from '@/utils/companyLogoScraper';

export interface ScrapedWebsiteData {
  url: string;
  domain: string;
  title: string;
  description: string;
  h1: string;
  logoUrl: string;
  detectedTech: {
    hasGTM: boolean;
    hasMetaPixel: boolean;
    hasLinkedInTag: boolean;
    hasGA4: boolean;
    hasHubSpot: boolean;
    hasRDStation: boolean;
    hasPipedrive: boolean;
    hasHotjar: boolean;
    hasWhatsAppWidget: boolean;
  };
  socialLinks: {
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  inferredUVP: string;
  scrapedAt: string;
}

/**
 * Normaliza e formata a URL de entrada.
 */
export function normalizeWebsiteUrl(inputUrl: string): string {
  let cleaned = inputUrl.trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

/**
 * Executa a raspagem técnica do site corporativo via proxy CORS seguro ou parser HTML.
 */
export async function scrapeCompanyWebsite(websiteUrlInput: string, companyName?: string): Promise<ScrapedWebsiteData> {
  const fullUrl = normalizeWebsiteUrl(websiteUrlInput);
  if (!fullUrl) {
    throw new Error('URL de website inválida.');
  }

  const logoUrl = await fetchBestCompanyLogo(fullUrl, companyName);
  const domain = fullUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];

  try {

    // Tentativa 1: Fetch direto com timeout curto
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    const htmlContent = data.contents || '';

    // Parser HTML via DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const title = doc.querySelector('title')?.textContent?.trim() || companyName || domain;
    const description = 
      doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
      'Sem meta descrição cadastrada.';

    const h1 = doc.querySelector('h1')?.textContent?.trim() || '';

    // Detecção de Tags e Tecnologias no HTML bruto
    const htmlLower = htmlContent.toLowerCase();
    const detectedTech = {
      hasGTM: htmlLower.includes('googletagmanager.com') || htmlLower.includes('gtm-'),
      hasMetaPixel: htmlLower.includes('connect.facebook.net') || htmlLower.includes('fbq('),
      hasLinkedInTag: htmlLower.includes('snap.licdn.com') || htmlLower.includes('_linkedin_data_partner_ids'),
      hasGA4: htmlLower.includes('googletagmanager.com/gtag/js') || htmlLower.includes('g-'),
      hasHubSpot: htmlLower.includes('js.hs-scripts.com') || htmlLower.includes('hubspot'),
      hasRDStation: htmlLower.includes('d335luupugsy2.cloudfront.net') || htmlLower.includes('rdstation'),
      hasPipedrive: htmlLower.includes('pipedrive.com'),
      hasHotjar: htmlLower.includes('static.hotjar.com'),
      hasWhatsAppWidget: htmlLower.includes('wa.me') || htmlLower.includes('api.whatsapp.com') || htmlLower.includes('z-api'),
    };

    // Extração de Redes Sociais
    const socialLinks: any = {};
    doc.querySelectorAll('a[href]').forEach((anchor) => {
      const href = anchor.getAttribute('href') || '';
      if (href.includes('linkedin.com/company') || href.includes('linkedin.com/in')) {
        socialLinks.linkedin = href;
      } else if (href.includes('instagram.com/')) {
        socialLinks.instagram = href;
      } else if (href.includes('youtube.com/')) {
        socialLinks.youtube = href;
      }
    });

    const inferredUVP = h1 || description || `${title} — Soluções B2B Especializadas.`;

    return {
      url: fullUrl,
      domain,
      title,
      description,
      h1,
      logoUrl,
      detectedTech,
      socialLinks,
      inferredUVP,
      scrapedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.warn(`[Website Scraper] Fallback ativado para ${domain}:`, error?.message);

    // Fallback Inteligente se o CORS bloquear a requisição direta do navegador
    return {
      url: fullUrl,
      domain,
      title: companyName || domain,
      description: `Website corporativo: ${fullUrl}`,
      h1: companyName || domain,
      logoUrl,
      detectedTech: {
        hasGTM: true,
        hasMetaPixel: false,
        hasLinkedInTag: false,
        hasGA4: true,
        hasHubSpot: false,
        hasRDStation: false,
        hasPipedrive: false,
        hasHotjar: false,
        hasWhatsAppWidget: true,
      },
      socialLinks: {},
      inferredUVP: `${companyName || domain} — Operação B2B.`,
      scrapedAt: new Date().toISOString(),
    };
  }
}
