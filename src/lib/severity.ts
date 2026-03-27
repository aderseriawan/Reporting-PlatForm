import type { SeverityLevel } from '../types'

export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    case 'info': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export function getSeverityDot(severity: SeverityLevel): string {
  switch (severity) {
    case 'critical': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-yellow-500'
    case 'low': return 'bg-blue-500'
    case 'info': return 'bg-slate-400'
    default: return 'bg-slate-400'
  }
}

export function getCvssColor(score: number): string {
  if (score >= 9.0) return 'text-red-600 dark:text-red-400'
  if (score >= 7.0) return 'text-orange-600 dark:text-orange-400'
  if (score >= 4.0) return 'text-yellow-600 dark:text-yellow-400'
  if (score > 0) return 'text-blue-600 dark:text-blue-400'
  return 'text-slate-500'
}

export function severityFromCvss(score: number): SeverityLevel {
  if (score >= 9.0) return 'critical'
  if (score >= 7.0) return 'high'
  if (score >= 4.0) return 'medium'
  if (score > 0) return 'low'
  return 'info'
}

export const SEVERITY_ORDER: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'info']

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
}
