export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
  | 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'

const severityConfig: Record<string, { bg: string; label: string }> = {
  critical: { bg: '#EF4444', label: 'Critical' },
  high:     { bg: '#F97316', label: 'High' },
  medium:   { bg: '#EAB308', label: 'Medium' },
  low:      { bg: '#22C55E', label: 'Low' },
  info:     { bg: '#0EA5E9', label: 'Info' },
}

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const key = severity.toLowerCase()
  const config = severityConfig[key] ?? { bg: '#6B7280', label: severity }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white ${className}`}
      style={{ backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}
