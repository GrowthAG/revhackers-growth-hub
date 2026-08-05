import { useState } from 'react';
import { TrendingUp, X, CheckCircle, Clock, DollarSign, UserPlus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  useExpansionOpportunities,
  useUpdateOpportunity,
  useNewOpportunitiesCount,
} from '@/hooks/useExpansionOpportunities';

interface ExpansionBadgeProps {
  projectId?: string;
  showDetails?: boolean;
}

export function ExpansionBadge({ projectId, showDetails = false }: ExpansionBadgeProps) {
  const [open, setOpen] = useState(false);
  const count = useNewOpportunitiesCount();
  const { data: opportunities, isLoading } = useExpansionOpportunities();
  const updateMutation = useUpdateOpportunity();

  if (count === 0 && !showDetails) return null;

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'upsell_framework':
        return <Zap className="h-4 w-4" />;
      case 'add_user':
        return <UserPlus className="h-4 w-4" />;
      case 'premium_tier':
        return <TrendingUp className="h-4 w-4" />;
      case 'renewal':
        return <Clock className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getOpportunityLabel = (type: string) => {
    const labels: Record<string, string> = {
      upsell_framework: 'Upsell de Frameworks',
      add_user: 'Adicionar Usuários',
      premium_tier: 'Upgrade para Premium',
      renewal: 'Renovação',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'proposed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'won':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusUpdate = async (opportunityId: string, status: string) => {
    await updateMutation.mutateAsync({ opportunityId, status });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2"
          disabled={isLoading}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Expansão</span>
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {count}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Oportunidades de Expansão
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando oportunidades...
          </div>
        ) : opportunities && opportunities.length > 0 ? (
          <div className="space-y-4 mt-4">
            {opportunities.map((opp: any) => (
              <div
                key={opp.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1 text-primary">
                      {getOpportunityIcon(opp.opportunity_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {getOpportunityLabel(opp.opportunity_type)}
                        </h4>
                        <Badge
                          variant="outline"
                          className={getStatusColor(opp.status)}
                        >
                          {opp.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {opp.rei_projects?.name || 'Projeto sem nome'} -{' '}
                        {opp.rei_projects?.client_name || 'Cliente desconhecido'}
                      </p>
                      <p className="text-sm">{opp.reason}</p>
                      {opp.metrics && Object.keys(opp.metrics).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(opp.metrics).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key.replace(/_/g, ' ')}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {opp.proposal_amount && (
                        <p className="text-sm font-medium mt-2">
                          Proposta: R${' '}
                          {opp.proposal_amount.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      )}
                      {opp.proposed_at && (
                        <p className="text-xs text-muted-foreground">
                          Proposta em:{' '}
                          {new Date(opp.proposed_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {opp.status === 'new' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(opp.id, 'reviewed')}
                      disabled={updateMutation.isPending}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar como Revisado
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(opp.id, 'dismissed')}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Descartar
                    </Button>
                  </div>
                )}

                {opp.status === 'reviewed' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(opp.id, 'proposed')}
                      disabled={updateMutation.isPending}
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Criar Proposta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(opp.id, 'dismissed')}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Descartar
                    </Button>
                  </div>
                )}

                {opp.status === 'proposed' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleStatusUpdate(opp.id, 'won')}
                      disabled={updateMutation.isPending}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar como Ganho
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusUpdate(opp.id, 'lost')}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Marcar como Perdido
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Nenhuma oportunidade de expansão no momento
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
