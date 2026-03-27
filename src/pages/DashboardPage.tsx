import { motion } from 'framer-motion'
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
  PageBody,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  DataTable,
} from '@blinkdotnew/ui'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { AlertTriangle, Briefcase, FileBarChart, TrendingDown } from 'lucide-react'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { CvssScore } from '../components/ui/CvssScore'
import type { Severity } from '../components/ui/SeverityBadge'
import type { ColumnDef } from '@tanstack/react-table'

/* ── Palette refs ──────────────────────────────────────────────────────────── */
const C = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#EAB308',
  low:      '#339989',   /* verdigris */
  info:     '#7DE2D1',   /* pearl-aqua */
}

/* ── Mock Data ─────────────────────────────────────────────────────────────── */
const findingsOverTime = [
  { month: 'Aug', critical: 8,  high: 22, medium: 31 },
  { month: 'Sep', critical: 14, high: 28, medium: 40 },
  { month: 'Oct', critical: 11, high: 19, medium: 35 },
  { month: 'Nov', critical: 17, high: 31, medium: 42 },
  { month: 'Dec', critical: 13, high: 25, medium: 38 },
  { month: 'Jan', critical: 12, high: 34, medium: 41 },
]

const severityDist = [
  { name: 'Critical', count: 12, fill: C.critical },
  { name: 'High',     count: 34, fill: C.high },
  { name: 'Medium',   count: 67, fill: C.medium },
  { name: 'Low',      count: 43, fill: C.low },
  { name: 'Info',     count: 28, fill: C.info },
]

type FindingRow = {
  id: string; title: string; severity: Severity
  cvss: number; engagement: string; status: string; date: string
}

const recentFindings: FindingRow[] = [
  { id: '1', title: 'SQL Injection in Login Endpoint',          severity: 'Critical', cvss: 9.8, engagement: 'Acme Corp Web App',     status: 'Open',        date: '2025-01-15' },
  { id: '2', title: 'Stored XSS in Comment Module',            severity: 'High',     cvss: 7.6, engagement: 'Globex API Audit',      status: 'In Progress', date: '2025-01-14' },
  { id: '3', title: 'Open Redirect on OAuth Callback',         severity: 'Medium',   cvss: 5.3, engagement: 'Initech Mobile App',    status: 'Open',        date: '2025-01-13' },
  { id: '4', title: 'Misconfigured CORS Policy',               severity: 'Medium',   cvss: 4.8, engagement: 'Umbrella Cloud Infra',  status: 'Remediated',  date: '2025-01-12' },
  { id: '5', title: 'Insecure Direct Object Reference (IDOR)', severity: 'High',     cvss: 7.1, engagement: 'Veridian Network Scan', status: 'Open',        date: '2025-01-11' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Open':        'destructive',
  'In Progress': 'secondary',
  'Remediated':  'default',
  'Accepted':    'outline',
}

const findingColumns: ColumnDef<FindingRow>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className="font-medium text-foreground max-w-[260px] block truncate text-[13px]">
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: 'severity',
    header: 'Severity',
    cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
  },
  {
    accessorKey: 'cvss',
    header: 'CVSS',
    cell: ({ row }) => <CvssScore score={row.original.cvss} />,
  },
  {
    accessorKey: 'engagement',
    header: 'Engagement',
    cell: ({ row }) => (
      <span className="text-[12px] text-muted-foreground whitespace-nowrap">{row.original.engagement}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? 'secondary'} className="text-[11px]">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-[12px] text-muted-foreground tabular-nums">{row.original.date}</span>
    ),
  },
]

const activeEngagements = [
  { id: '1', name: 'Acme Corp Web Application', client: 'Acme Corporation', type: 'Web App', findingsCount: 18, maxFindings: 30, daysLeft: 12 },
  { id: '2', name: 'Globex Internal API Audit', client: 'Globex Industries', type: 'API',     findingsCount: 11, maxFindings: 25, daysLeft: 5  },
  { id: '3', name: 'Initech Mobile Application', client: 'Initech Ltd',      type: 'Mobile',  findingsCount: 7,  maxFindings: 20, daysLeft: 21 },
]

const typeColors: Record<string, string> = {
  'Web App': 'bg-[#339989]/10 text-[#339989]',
  'API':     'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  'Mobile':  'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  'Network': 'bg-amber-100 text-amber-700',
  'Cloud':   'bg-sky-100 text-sky-700',
}

/* ── KPI Card ──────────────────────────────────────────────────────────────── */
function KpiCard({
  label, value, delta, deltaLabel, icon, accent,
}: {
  label: string; value: string; delta: number; deltaLabel: string
  icon: React.ReactNode; accent?: string
}) {
  const positive = delta > 0
  const color = accent ?? 'hsl(var(--verdigris, 168 51% 39%))'
  return (
    <Card className="shadow-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
            <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-[12px] text-muted-foreground mt-2 flex items-center gap-1">
              <span className={positive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                {positive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
              </span>
              {deltaLabel}
            </p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${color}18`, color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Tooltip styling ───────────────────────────────────────────────────────── */
const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 12px hsl(0 0% 0% / 0.10)',
}

const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export function DashboardPage() {
  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>Security posture overview — January 2025</PageDescription>
        </div>
      </PageHeader>

      <PageBody>
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-5"
        >
          {/* ── KPI Cards ───────────────────────────────────────────────── */}
          <motion.div custom={0} variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Critical Findings" value="12" delta={-8.3} deltaLabel="vs last month"
              icon={<AlertTriangle size={18} />} accent="#EF4444" />
            <KpiCard label="High Findings"     value="34" delta={-12.1} deltaLabel="vs last month"
              icon={<TrendingDown size={18} />} accent="#F97316" />
            <KpiCard label="Open Engagements" value="7"  delta={14.2} deltaLabel="vs last month"
              icon={<Briefcase size={18} />} accent="#339989" />
            <KpiCard label="Reports Generated" value="23" delta={5.0} deltaLabel="this quarter"
              icon={<FileBarChart size={18} />} accent="#7DE2D1" />
          </motion.div>

          {/* ── Charts Row ──────────────────────────────────────────────── */}
          <motion.div custom={1} variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Findings Over Time */}
            <Card>
              <CardHeader className="pb-1 pt-5 px-5">
                <CardTitle className="text-[14px] font-semibold">Findings Over Time</CardTitle>
                <p className="text-[12px] text-muted-foreground">Last 6 months — by severity</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={findingsOverTime} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      {[
                        { id: 'gCrit', color: C.critical },
                        { id: 'gHigh', color: C.high },
                        { id: 'gMed',  color: C.medium },
                      ].map(({ id, color }) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={color} stopOpacity={0}   />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis                 tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="critical" name="Critical" stroke={C.critical} strokeWidth={1.5} fill="url(#gCrit)" />
                    <Area type="monotone" dataKey="high"     name="High"     stroke={C.high}     strokeWidth={1.5} fill="url(#gHigh)" />
                    <Area type="monotone" dataKey="medium"   name="Medium"   stroke={C.medium}   strokeWidth={1.5} fill="url(#gMed)"  />
                  </AreaChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                  {[['Critical', C.critical], ['High', C.high], ['Medium', C.medium]].map(([name, color]) => (
                    <span key={name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
                      {name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader className="pb-1 pt-5 px-5">
                <CardTitle className="text-[14px] font-semibold">Severity Distribution</CardTitle>
                <p className="text-[12px] text-muted-foreground">All active findings breakdown</p>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={severityDist} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Findings" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {severityDist.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Bottom Row ──────────────────────────────────────────────── */}
          <motion.div custom={2} variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {/* Recent Findings Table */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader className="pb-1 pt-5 px-5">
                  <CardTitle className="text-[14px] font-semibold">Recent Findings</CardTitle>
                  <p className="text-[12px] text-muted-foreground">Latest vulnerabilities identified</p>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable columns={findingColumns} data={recentFindings} />
                </CardContent>
              </Card>
            </div>

            {/* Active Engagements */}
            <Card>
              <CardHeader className="pb-1 pt-5 px-5">
                <CardTitle className="text-[14px] font-semibold">Active Engagements</CardTitle>
                <p className="text-[12px] text-muted-foreground">{activeEngagements.length} in progress</p>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {activeEngagements.map((eng) => (
                  <div key={eng.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-foreground leading-snug truncate">
                          {eng.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{eng.client}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${typeColors[eng.type] ?? 'bg-muted text-muted-foreground'}`}>
                        {eng.type}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{eng.findingsCount} findings</span>
                        <span>{eng.daysLeft}d left</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(eng.findingsCount / eng.maxFindings) * 100}%`,
                            background: 'var(--verdigris)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </motion.div>
        </motion.div>
      </PageBody>
    </Page>
  )
}
