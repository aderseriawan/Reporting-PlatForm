import { Shield, Hash } from 'lucide-react'
import { SeverityBadge } from './SeverityBadge'
import { getCvssColor } from '../lib/severity'
import type { Finding } from '../types'

interface FindingCardProps {
  finding: Finding
  engagementTitle?: string
  onClick?: () => void
}

export function FindingCard({ finding, engagementTitle, onClick }: FindingCardProps) {
  const cvssColor = getCvssColor(finding.cvssScore)

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-accent/40 group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <SeverityBadge severity={finding.severity} />
            <span className={`font-mono text-sm font-semibold ${cvssColor}`}>
              {finding.cvssScore > 0 ? `CVSS ${finding.cvssScore.toFixed(1)}` : 'N/A'}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
            {finding.title}
          </h3>
          {finding.affectedComponent && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {finding.affectedComponent}
            </p>
          )}
        </div>
        <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        {engagementTitle && (
          <span className="text-xs text-muted-foreground truncate max-w-[60%]">
            {engagementTitle}
          </span>
        )}
        <StatusPill status={finding.status} />
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Finding['status'] }) {
  const styles: Record<Finding['status'], string> = {
    open: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    in_progress: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    resolved: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    accepted: 'bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400',
  }
  const labels: Record<Finding['status'], string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    accepted: 'Accepted',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
