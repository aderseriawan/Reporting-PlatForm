export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
  | 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'

/* Severity → { bg, text } using the new palette */
const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: '#EF444418', text: '#EF4444', label: 'Critical' },
  high:     { bg: '#F9731618', text: '#F97316', label: 'High'     },
  medium:   { bg: '#EAB30818', text: '#CA8A04', label: 'Medium'   },
  low:      { bg: '#33998918', text: '#339989', label: 'Low'      }, /* verdigris */
  info:     { bg: '#7DE2D118', text: '#0E9080', label: 'Info'     }, /* pearl-aqua muted */
}

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const key = severity.toLowerCase()
  const config = severityConfig[key] ?? { bg: '#6B728018', text: '#6B7280', label: severity }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
