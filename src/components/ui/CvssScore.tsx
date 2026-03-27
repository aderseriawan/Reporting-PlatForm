interface CvssScoreProps {
  score: number
  className?: string
}

function getCvssColor(score: number): string {
  if (score === 0) return '#6B7280'
  if (score >= 9.0) return '#DC2626'
  if (score >= 7.0) return '#EA580C'
  if (score >= 4.0) return '#CA8A04'
  return '#16A34A'
}

export function CvssScore({ score, className = '' }: CvssScoreProps) {
  const color = getCvssColor(score)
  const display = score === 0 ? 'N/A' : score.toFixed(1)
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold text-white tabular-nums ${className}`}
      style={{ backgroundColor: color }}
    >
      {display}
    </span>
  )
}
