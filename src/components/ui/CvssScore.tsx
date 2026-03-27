interface CvssScoreProps {
  score: number
  className?: string
}

function getCvssStyle(score: number): { bg: string; text: string } {
  if (score === 0)      return { bg: '#6B728018', text: '#6B7280' }
  if (score >= 9.0)     return { bg: '#EF444418', text: '#EF4444' }  /* critical */
  if (score >= 7.0)     return { bg: '#F9731618', text: '#F97316' }  /* high */
  if (score >= 4.0)     return { bg: '#EAB30818', text: '#CA8A04' }  /* medium */
  return                       { bg: '#33998918', text: '#339989' }  /* low — verdigris */
}

export function CvssScore({ score, className = '' }: CvssScoreProps) {
  const { bg, text } = getCvssStyle(score)
  const display = score === 0 ? 'N/A' : score.toFixed(1)
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold tabular-nums tracking-wide font-mono ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {display}
    </span>
  )
}
