import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  detectExpansionOpportunities,
  listExpansionOpportunities,
  updateOpportunityStatus,
} from '@/services/expansionDetector';
import { useTenantId } from './useTenantId';

/**
 * Hook para detectar oportunidades de expansão em tempo real
 */
export function useExpansionDetection(projectId: string | null) {
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: async () => {
      if (!projectId || !tenantId) return [];
      return await detectExpansionOpportunities(projectId, tenantId);
    },
  });
}

/**
 * Hook para listar oportunidades ativas do tenant
 */
export function useExpansionOpportunities(status?: string[]) {
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ['expansion-opportunities', tenantId, status],
    queryFn: async () => {
      if (!tenantId) return [];
      return await listExpansionOpportunities(tenantId, status);
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para atualizar status de oportunidade
 */
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      opportunityId,
      status,
      notes,
      proposalAmount,
    }: {
      opportunityId: string;
      status: string;
      notes?: string;
      proposalAmount?: number;
    }) => {
      return await updateOpportunityStatus(
        opportunityId,
        status,
        notes,
        proposalAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expansion-opportunities'] });
    },
  });
}

/**
 * Hook para contar oportunidades novas (badge)
 */
export function useNewOpportunitiesCount() {
  const { data: opportunities } = useExpansionOpportunities(['new']);
  return opportunities?.length || 0;
}
