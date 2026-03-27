import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Finding } from '../types'

interface SeverityChartProps {
  findings: Finding[]
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
  Info: '#94a3b8',
}

export function SeverityChart({ findings }: SeverityChartProps) {
  const counts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Info: 0,
  }

  findings.forEach((f) => {
    const key = f.severity.charAt(0).toUpperCase() + f.severity.slice(1)
    if (key in counts) counts[key]++
  })

  const data = Object.entries(counts).map(([name, count]) => ({ name, count }))

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <h3 className="font-semibold text-sm text-foreground mb-4">Findings by Severity</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '12px',
            }}
            cursor={{ fill: 'hsl(var(--muted))' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
