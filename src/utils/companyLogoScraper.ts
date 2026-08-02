/**
 * companyLogoScraper.ts
 *
 * Motor de Raspagem Automática de Logo Corporativo por Domínio / Website.
 * Raspa e retorna o logo HD da empresa do cliente para enriquecer o cadastro,
 * co-branding do portal REI (/rei) e relatórios executivos.
 */

export interface CompanyBrandAsset {
  domain: string;
  logoUrl: string;
  highResLogoUrl: string;
  fallbackAvatarUrl: string;
  primaryColor?: string;
}

/**
 * Extrai o domínio limpo a partir de uma URL ou string.
 */
export function extractCleanDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return '';
  let cleaned = urlOrDomain.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^www\./, '');
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  return cleaned;
}

/**
 * Busca automaticamente o logo corporativo de alta definição a partir do domínio ou site.
 */
export function getCompanyBrandAssets(websiteOrDomain: string, companyName?: string): CompanyBrandAsset {
  const domain = extractCleanDomain(websiteOrDomain);
  const fallbackText = encodeURIComponent((companyName || domain || 'RH').substring(0, 2).toUpperCase());

  // Provider 1: Clearbit High-Res Logo API
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : '';
  
  // Provider 2: Unavatar High-Res Provider
  const highResLogoUrl = domain ? `https://unavatar.io/${domain}?fallback=false` : '';

  // Fallback: Custom Initials Avatar
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${fallbackText}&background=00CC6A&color=000000&font-size=0.45&bold=true`;

  return {
    domain,
    logoUrl: logoUrl || fallbackAvatarUrl,
    highResLogoUrl: highResLogoUrl || logoUrl || fallbackAvatarUrl,
    fallbackAvatarUrl,
  };
}

/**
 * Valida se a imagem do logo está acessível e retorna a melhor URL disponível.
 */
export async function fetchBestCompanyLogo(websiteOrDomain: string, companyName?: string): Promise<string> {
  const assets = getCompanyBrandAssets(websiteOrDomain, companyName);
  if (!assets.domain) return assets.fallbackAvatarUrl;

  try {
    // Testa a imagem do Clearbit
    const testImg = new Image();
    const isClearbitValid = await new Promise<boolean>((resolve) => {
      testImg.onload = () => resolve(true);
      testImg.onerror = () => resolve(false);
      testImg.src = assets.logoUrl;
    });

    if (isClearbitValid) {
      return assets.logoUrl;
    }
  } catch (e) {}

  return assets.fallbackAvatarUrl;
}
