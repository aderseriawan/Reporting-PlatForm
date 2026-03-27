import type { EngagementStatus } from '../types'

const STYLES: Record<EngagementStatus, string> = {
  planning: 'bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400',
}

const DOTS: Record<EngagementStatus, string> = {
  planning: 'bg-slate-400',
  active: 'bg-green-500',
  review: 'bg-blue-500',
  completed: 'bg-purple-500',
  archived: 'bg-gray-400',
}

export function EngagementStatusBadge({ status }: { status: EngagementStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md capitalize ${STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[status]}`} />
      {status}
    </span>
  )
}
