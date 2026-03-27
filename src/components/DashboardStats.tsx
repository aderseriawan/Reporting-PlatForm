import { Skeleton } from '@blinkdotnew/ui'
import { Target, Bug, AlertTriangle, CheckCircle } from 'lucide-react'

interface StatsData {
  totalEngagements: number
  openFindings: number
  criticalHighFindings: number
  resolvedFindings: number
}

interface DashboardStatsProps {
  data?: StatsData
  loading?: boolean
}

const STAT_CONFIG = [
  {
    key: 'totalEngagements' as keyof StatsData,
    label: 'Total Engagements',
    icon: Target,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
  },
  {
    key: 'openFindings' as keyof StatsData,
    label: 'Open Findings',
    icon: Bug,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    key: 'criticalHighFindings' as keyof StatsData,
    label: 'Critical / High',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    key: 'resolvedFindings' as keyof StatsData,
    label: 'Resolved',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
  },
]

export function DashboardStats({ data, loading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.key}
            className="bg-card border border-border rounded-lg p-4 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${stat.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold text-foreground font-mono">
                {data?.[stat.key] ?? 0}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
