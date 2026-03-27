export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'accepted'
export type EngagementStatus = 'planning' | 'active' | 'review' | 'completed' | 'archived'
export type EngagementType = 'pentest' | 'vapt' | 'red_team' | 'code_review' | 'social_engineering'
export type ReportStatus = 'draft' | 'review' | 'final'

export interface Engagement {
  id: string
  userId: string
  title: string
  client: string
  scope?: string
  type: EngagementType
  status: EngagementStatus
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface Finding {
  id: string
  userId: string
  engagementId: string
  title: string
  description?: string
  severity: SeverityLevel
  status: FindingStatus
  cvssScore: number
  cvssVector?: string
  affectedComponent?: string
  proofOfConcept?: string
  recommendation?: string
  vulnReferences?: string
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  userId: string
  engagementId: string
  title: string
  executiveSummary?: string
  methodology?: string
  conclusion?: string
  status: ReportStatus
  createdAt: string
  updatedAt: string
}
