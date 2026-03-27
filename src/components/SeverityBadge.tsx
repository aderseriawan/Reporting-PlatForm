import { getSeverityColor, getSeverityDot } from '../lib/severity'
import type { SeverityLevel } from '../types'

interface SeverityBadgeProps {
  severity: SeverityLevel
  showDot?: boolean
  size?: 'sm' | 'md'
}

export function SeverityBadge({ severity, showDot = true, size = 'md' }: SeverityBadgeProps) {
  const colorClass = getSeverityColor(severity)
  const dotClass = getSeverityDot(severity)
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1 rounded border font-medium capitalize ${colorClass} ${sizeClass}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />}
      {severity}
    </span>
  )
}
