export type ReiProjectType = 'consulting' | 'crm_ops' | 'site' | 'linkedin' | 'founder';
export type ReiProjectStatus = 'active' | 'pending' | 'overdue';
export type ReiProjectTier = 'free' | 'paid';
export type ReiQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface ReiProjectTaskSummary {
  total: number;
  done: number;
  overdue: number;
}

export interface ReiProjectRecord {
  id: string;
  tenantId: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string;
  clientCompany: string | null;
  analystEmail: string;
  lastReiDate: string;
  nextReiDate: string;
  quarter: ReiQuarter;
  year: number;
  status: ReiProjectStatus;
  type: ReiProjectType;
  tier: ReiProjectTier;
  durationDays: number;
  schedulingCompleted: boolean;
  technicalEvidences: unknown[];
  clickupSpaceId: string | null;
  clickupFolderId: string | null;
  clickupDocId: string | null;
  clickupSprintFolderId: string | null;
  clickupProvisionedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Optional aggregate populated by list-with-tasks; undefined when not requested. */
  tasks?: ReiProjectTaskSummary;
}

export interface CreateReiProjectInput {
  clientId?: string | null;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  analystEmail: string;
  lastReiDate?: string;
  nextReiDate: string;
  quarter: ReiQuarter;
  year: number;
  status?: ReiProjectStatus;
  type?: ReiProjectType;
  tier?: ReiProjectTier;
  durationDays?: number;
  schedulingCompleted?: boolean;
  technicalEvidences?: unknown[];
}

export interface UpdateReiProjectInput {
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string | null;
  analystEmail?: string;
  lastReiDate?: string;
  nextReiDate?: string;
  quarter?: ReiQuarter;
  year?: number;
  status?: ReiProjectStatus;
  type?: ReiProjectType;
  tier?: ReiProjectTier;
  durationDays?: number;
  schedulingCompleted?: boolean;
  technicalEvidences?: unknown[];
}
