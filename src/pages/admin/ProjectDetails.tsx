import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { ProjectDetailsSkeleton } from '@/components/ui/skeleton';
import {
    Map,
    BookOpen,
    ChevronLeft,
    AlertTriangle,
    Upload,
    Unlock,
    Video,
    Target,
    Columns,
    BrainCircuit,
    ClipboardCheck,
    Presentation,
    Cpu,
    FileSignature,
    ArrowLeft,
    Zap,
    ExternalLink
} from 'lucide-react';
import { updateReiProject, getReiProjectById, type ReiProject } from '@/api/reiProjects';
import { reiProjectsGcpAdapter } from '@/api/adapters/rei-projects-gcp';
import { toast as sonnerToast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import OrchestratedOnboarding from '@/pages/admin/OrchestratedOnboarding';
import { ProjectOsContainer } from '@/components/project-os/ProjectOsContainer';

import { useToast } from '@/hooks/use-toast';
import ProjectWiki from './ProjectWiki';
import { AIPlaybookGenerator } from '@/components/admin/playbook/AIPlaybookGenerator';
import DiagnosticResponsesPanel from '@/components/admin/DiagnosticResponsesPanel';
import { MarketIntelligenceTab } from '@/components/project-os/views/MarketIntelligenceTab';
import { SalesRoomTab } from '@/components/project-os/views/SalesRoomTab';
import { MeetingVaultTab } from '@/components/project-os/views/MeetingVaultTab';
import { KickoffSignaturePanel } from '@/components/rei/KickoffSignaturePanel';
import { SuccessPlanTab } from '@/components/admin/SuccessPlanTab';
import { ClientAccountPanel } from '@/components/admin/ClientAccountPanel';
import { ClientAccessModal } from '@/components/project-os/layout/ClientAccessModal';
import { ProjectHeaderActions } from '@/components/project-os/layout/ProjectHeaderActions';

import { PipelineJourneyBar } from '@/components/project-os/layout/PipelineJourneyBar';
import { FocalPointsPanel } from '@/components/project-os/panels/FocalPointsPanel';
import { IntelligencePanel } from '@/components/project-os/panels/IntelligencePanel';

import {
    PipelineStage,
    PIPELINE_STAGES,
    STAGE_CONFIGS,
    StageCategory,
    getStageCategory,
} from '@/types/pipeline';
import { advanceStage, getStageHistory } from '@/services/PipelineService';
import type { StageChangeEvent } from '@/types/pipeline';
import { getDisplayName as utilGetDisplayName } from '@/lib/projectUtils';

function getDisplayName(project: ReiProject | null): string {
    if (!project) return 'Projeto';
    return utilGetDisplayName({
        trade_name: project.trade_name,
        client_company: project.client_company,
        client_name: project.client_name
    });
}

function getDaysInStage(history: StageChangeEvent[], currentStage: PipelineStage | null): number {
    if (!currentStage || history.length === 0) return 0;
    const lastTransition = [...history].reverse().find(h => h.to_stage === currentStage);
    if (!lastTransition) return 0;
    const enteredAt = new Date(lastTransition.changed_at);
    const now = new Date();
    return Math.max(0, Math.ceil((now.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24)));
}

function getVisibleTabs(category: StageCategory | null): string[] {
    switch (category) {
        case 'diagnostico':
            return ['jornada', 'inteligencia', 'diagnostico', 'reunioes', 'kickoff'];
        case 'vendas':
            return ['jornada', 'inteligencia', 'diagnostico', 'proposta', 'playbook', 'reunioes', 'kickoff'];
        case 'fechamento':
            return ['jornada', 'inteligencia', 'diagnostico', 'proposta', 'playbook', 'reunioes', 'kickoff'];
        case 'execucao':
            return ['jornada', 'execucao', 'diagnostico', 'playbook', 'success', 'reunioes', 'biblioteca', 'kickoff'];
        case 'encerrado':
            return ['jornada', 'inteligencia', 'diagnostico', 'playbook', 'success', 'reunioes', 'biblioteca'];
        default:
            return ['jornada', 'inteligencia', 'diagnostico', 'playbook', 'reunioes', 'kickoff'];
    }
}

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [project, setProject] = useState<ReiProject | null>(null);
    const [strategicPlanInfo, setStrategicPlanInfo] = useState<{ id: string, access_token: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [advancing, setAdvancing] = useState(false);
    const [stageHistory, setStageHistory] = useState<StageChangeEvent[]>([]);
    const [editingName, setEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const currentStage = (project?.pipeline_stage as PipelineStage) || null;
    const stageCategory = currentStage ? getStageCategory(currentStage) : null;

    const visibleTabs = useMemo(() => {
        if (!currentStage) {
            const status = project?.status;
            if (status === 'lead') return ['inteligencia', 'diagnostico', 'reunioes'];
            return ['execucao', 'jornada', 'diagnostico', 'reunioes', 'biblioteca', 'kickoff'];
        }
        return getVisibleTabs(stageCategory);
    }, [currentStage, stageCategory, project?.status]);

    const defaultTab = visibleTabs[0] || 'inteligencia';

    const daysInStage = useMemo(
        () => getDaysInStage(stageHistory, currentStage),
        [stageHistory, currentStage]
    );

    useEffect(() => {
        if (id) {
            loadProject();
            loadHistory();
        }
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            if (import.meta.env.VITE_GCP_ENABLED === 'true' || import.meta.env.VITE_CLIENTS_GCP_ENABLED === 'true') {
                try {
                    const gcpProject = await reiProjectsGcpAdapter.getById(id!);
                    if (gcpProject) {
                        const mapped = {
                            id: gcpProject.id,
                            client_name: gcpProject.clientName,
                            client_email: gcpProject.clientEmail,
                            client_company: gcpProject.clientCompany || gcpProject.clientName,
                            trade_name: gcpProject.clientName,
                            analyst_email: gcpProject.analystEmail,
                            next_rei_date: gcpProject.nextReiDate,
                            quarter: gcpProject.quarter,
                            year: gcpProject.year,
                            status: gcpProject.status,
                            type: gcpProject.type,
                            created_at: gcpProject.lastReiDate || new Date().toISOString(),
                            updated_at: gcpProject.nextReiDate || new Date().toISOString(),
                        } as unknown as ReiProject;
                        setProject(mapped);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.warn('Projeto via GCP não localizado, tentando Supabase...', e);
                }
            }

            const data = await getReiProjectById(id!);
            if (!data) {
                toast({ title: 'Projeto não encontrado', variant: 'destructive' });
                navigate('/admin/rei');
                return;
            }
            setProject(data);

            try {
                const { data: planData } = await supabase
                    .from('strategic_plans')
                    .select('id, access_token')
                    .eq('rei_project_id', id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (planData) {
                    setStrategicPlanInfo(planData);
                }
            } catch (planErr) {
                console.error("Error fetching strategic plan:", planErr);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        if (!id) return;
        const history = await getStageHistory(id);
        setStageHistory(history);
    };

    const handleAdvanceStage = async (targetStage: PipelineStage) => {
        if (!project) return;
        setAdvancing(true);
        try {
            const result = await advanceStage(project.id, targetStage);
            if (!result.success) {
                sonnerToast.error('Erro ao avançar', { description: result.error });
                return;
            }

            const targetLabel = STAGE_CONFIGS[targetStage].label;
            sonnerToast.success(`Movido para ${targetLabel}`, {
                description: `${getDisplayName(project)} agora está em "${targetLabel}".`,
            });
            await loadProject();
            await loadHistory();
        } catch (e: any) {
            sonnerToast.error('Erro ao avançar estágio', { description: e.message });
        } finally {
            setAdvancing(false);
        }
    };

    const handleUnlockMaterials = async () => {
        if (!project) return;
        try {
            await updateReiProject(project.id, { materials_status: 'delivered' });
            sonnerToast.success('Cronograma Liberado!', {
                description: 'Os materiais foram confirmados. Planejamento Estratégico liberado.',
            });
            await loadProject();
        } catch (e: any) {
            sonnerToast.error('Erro ao destravar', { description: e.message });
        }
    };

    if (loading) {
        return <ProjectDetailsSkeleton />;
    }

    if (!project) return null;

    const TAB_DEFS: Record<string, { label: string; icon: React.ElementType }> = {
        execucao: { label: 'Execution OS', icon: Columns },
        inteligencia: { label: 'Inteligência B2B', icon: BrainCircuit },
        diagnostico: { label: 'Diagnóstico REI', icon: ClipboardCheck },
        jornada: { label: 'Planejamento', icon: Map },
        proposta: { label: 'Proposta', icon: Presentation },
        reunioes: { label: 'Reuniões', icon: Video },
        biblioteca: { label: 'Documentos', icon: BookOpen },
        playbook: { label: 'Playbook AI', icon: Cpu },
        kickoff: { label: 'Kick-off Validação', icon: FileSignature },
        success: { label: 'Success Plan', icon: Target },
    };

    return (
        <AdminLayout>
            <div className="h-full flex flex-col bg-white">
                {/* Project Header Nobibecode */}
                <div className="bg-white border-b border-zinc-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 w-full">
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/admin/projects')}
                            className="text-zinc-500 hover:text-zinc-900 rounded-lg h-8 w-8"
                        >
                            <ArrowLeft size={16} />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                                    {editingName ? (
                                        <input
                                            autoFocus
                                            className="bg-zinc-100 border border-zinc-300 rounded-md px-2 py-0.5 text-xl font-bold text-zinc-900 tracking-tight outline-none focus:border-zinc-950 transition-all"
                                            value={editNameValue}
                                            onChange={(e) => setEditNameValue(e.target.value)}
                                            onBlur={async () => {
                                                const trimmed = editNameValue.trim();
                                                if (trimmed && trimmed !== project.client_name) {
                                                    try {
                                                        await updateReiProject(project.id, { client_name: trimmed });
                                                        sonnerToast.success('Nome atualizado');
                                                        await loadProject();
                                                    } catch (e: any) {
                                                        sonnerToast.error('Erro ao salvar nome', { description: e.message });
                                                    }
                                                }
                                                setEditingName(false);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                                if (e.key === 'Escape') { setEditingName(false); }
                                            }}
                                        />
                                    ) : (
                                        <span
                                            className="cursor-pointer hover:bg-zinc-100 rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setEditNameValue(project.client_name || '');
                                                setEditingName(true);
                                            }}
                                            title="Clique para editar o nome"
                                        >
                                            {getDisplayName(project)}
                                        </span>
                                    )}
                                </h1>
                                {currentStage ? (
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#00CC6A] text-black">
                                        {STAGE_CONFIGS[currentStage].labelShort}
                                    </span>
                                ) : (
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-950 text-white">
                                        {project.status === 'active' ? 'ATIVO' : 'ONBOARDING'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">
                                Operação ID: {project.id.slice(0, 8)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <ProjectHeaderActions
                            project={project}
                            currentStage={currentStage}
                            stageCategory={stageCategory}
                            advancing={advancing}
                            strategicPlanInfo={strategicPlanInfo}
                            onAdvanceStage={handleAdvanceStage}
                        />

                        <ClientAccessModal project={project} stageCategory={stageCategory} />
                    </div>
                </div>

                {/* Pipeline Journey Bar */}
                {currentStage && (
                    <PipelineJourneyBar
                        currentStage={currentStage}
                        history={stageHistory}
                        daysInStage={daysInStage}
                        onAdvance={(stage) => handleAdvanceStage(stage)}
                        category={stageCategory || null}
                    />
                )}

                {/* Metadata Strip */}
                <div className="bg-white shadow-sm/50 border-b border-zinc-200/80 px-6 py-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs font-medium text-zinc-600">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Cliente</span>
                            <span className="font-semibold text-zinc-900 truncate block">{project.client_name || '-'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Empresa</span>
                            <span className="font-semibold text-zinc-900 truncate block">{project.client_company || project.trade_name || '-'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Tipo</span>
                            <span className="font-semibold text-zinc-900 block">{project.type === 'crm_ops' ? 'CRM & RevOps' : project.type === 'founder' ? 'Founder' : '360°'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Trimestre</span>
                            <span className="font-semibold text-zinc-900 block">{project.quarter || 'Q1'} {project.year || 2026}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Permanência</span>
                            <span className="font-semibold text-zinc-900 block">{daysInStage} dias</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Materiais</span>
                            <span className="font-semibold text-[#00CC6A] block">{project.materials_status === 'delivered' ? 'Liberado' : 'Em Análise'}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Inner Sidebar */}
                    <div className="w-56 bg-white shadow-sm border-r border-zinc-200 hidden md:flex flex-col shrink-0 overflow-y-auto p-4 space-y-6">
                        <div>
                            <h2 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2 px-2">Navegação Operacional</h2>
                            <div className="space-y-0.5">
                                {visibleTabs.map(k => TAB_DEFS[k] && (
                                    <NavLink
                                        key={k}
                                        to={k}
                                        replace
                                        className={({ isActive }) =>
                                            `flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                                                isActive
                                                    ? 'bg-zinc-950 text-white shadow-xs font-bold'
                                                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                                            }`
                                        }
                                    >
                                        {React.createElement(TAB_DEFS[k].icon, { size: 14 })}
                                        <span>{TAB_DEFS[k].label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-200/80">
                            <ClientAccountPanel
                                clientEmail={project.client_email}
                                projectName={getDisplayName(project)}
                            />
                        </div>
                    </div>

                    {/* Sub-Routes Content */}
                    <div className="flex-1 bg-white flex flex-col overflow-y-auto">
                        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 py-6 space-y-6">
                            <FocalPointsPanel project={project} />
                            
                            {(stageCategory === 'diagnostico' || stageCategory === 'vendas') && (
                                <IntelligencePanel project={project} />
                            )}

                            <Routes>
                                <Route path="/" element={<Navigate to={defaultTab} replace />} />
                                <Route path="execucao" element={<ProjectOsContainer projectId={project.id} />} />
                                <Route path="inteligencia" element={<MarketIntelligenceTab project={project} onUpdateProject={loadProject} />} />
                                <Route path="diagnostico" element={<DiagnosticResponsesPanel projectId={project.id} projectType={project.type || undefined} />} />
                                <Route path="jornada" element={<OrchestratedOnboarding projectId={project.id} embedded={true} />} />
                                <Route path="proposta" element={<SalesRoomTab project={project} />} />
                                <Route path="reunioes" element={<MeetingVaultTab projectId={project.id} />} />
                                <Route path="biblioteca" element={<ProjectWiki projectId={project.id} projectName={project.client_name} />} />
                                <Route path="kickoff" element={<KickoffSignaturePanel project={project} onUpdate={loadProject} />} />
                                <Route path="playbook" element={<AIPlaybookGenerator projectId={project.id} projectName={project.client_name} />} />
                                <Route path="success" element={<SuccessPlanTab projectId={project.id} />} />
                                <Route path="*" element={<Navigate to={`/admin/projects/${project.id}/${defaultTab}`} replace />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProjectDetails;
