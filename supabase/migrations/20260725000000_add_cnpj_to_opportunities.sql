-- Migration: Add CNPJ Column & Index to Opportunities
-- Purpose: Optimize CNPJ lookups and B2B lead enrichment via FonteData

ALTER TABLE public.opportunities 
    ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Index for fast CNPJ lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_cnpj 
    ON public.opportunities (cnpj) 
    WHERE cnpj IS NOT NULL;

-- Index for fast email deduplication lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_client_email 
    ON public.opportunities (LOWER(client_email));
