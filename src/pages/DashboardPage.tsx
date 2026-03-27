import { motion } from 'framer-motion'
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
  PageBody,
  StatGroup,
  Stat,
  DataTable,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { CvssScore } from '../components/ui/CvssScore'
import type { Severity } from '../components/ui/SeverityBadge'
import type { ColumnDef } from '@tanstack/react-table'

/* ── Mock Data ────────────────────────────────────────────────────────────── */
const findingsOverTime = [
  { month: 'Aug', critical: 8,  high: 22, medium: 31 },
  { month: 'Sep', critical: 14, high: 28, medium: 40 },
  { month: 'Oct', critical: 11, high: 19, medium: 35 },
  { month: 'Nov', critical: 17, high: 31, medium: 42 },
  { month: 'Dec', critical: 13, high: 25, medium: 38 },
  { month: 'Jan', critical: 12, high: 34, medium: 41 },
]

const severityDist = [
  { name: 'Critical', count: 12, fill: '#DC2626' },
  { name: 'High',     count: 34, fill: '#EA580C' },
  { name: 'Medium',   count: 67, fill: '#CA8A04' },
  { name: 'Low',      count: 43, fill: '#16A34A' },
  { name: 'Info',     count: 28, fill: '#2563EB' },
]

type FindingRow = {
  id: string
  title: string
  severity: Severity
  cvss: number
  engagement: string
  status: string
  date: string
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
      <span className="font-medium text-foreground max-w-xs block truncate">
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
      <span className="text-sm text-muted-foreground whitespace-nowrap">{row.original.engagement}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">{row.original.date}</span>
    ),
  },
]

/* ── Active Engagements ───────────────────────────────────────────────────── */
const activeEngagements = [
  {
    id: '1',
    name: 'Acme Corp Web Application',
    client: 'Acme Corporation',
    type: 'Web App',
    findingsCount: 18,
    maxFindings: 30,
    daysLeft: 12,
  },
  {
    id: '2',
    name: 'Globex Internal API Audit',
    client: 'Globex Industries',
    type: 'API',
    findingsCount: 11,
    maxFindings: 25,
    daysLeft: 5,
  },
  {
    id: '3',
    name: 'Initech Mobile Application',
    client: 'Initech Ltd',
    type: 'Mobile',
    findingsCount: 7,
    maxFindings: 20,
    daysLeft: 21,
  },
]

const typeColors: Record<string, string> = {
  'Web App': 'bg-accent/10 text-accent',
  'API':     'bg-purple-100 text-purple-700',
  'Mobile':  'bg-green-100 text-green-700',
  'Network': 'bg-orange-100 text-orange-700',
  'Cloud':   'bg-sky-100 text-sky-700',
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
}

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
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          className="space-y-6"
        >
          {/* KPI Stats */}
          <motion.div custom={0} variants={fadeUp}>
            <StatGroup>
              <Stat
                label="Critical Findings"
                value="12"
                trend={-8.3}
                trendLabel="vs last month"
                description="Requires immediate action"
              />
              <Stat
                label="High Findings"
                value="34"
                trend={-12.1}
                trendLabel="vs last month"
                description="Remediation in progress"
              />
              <Stat
                label="Open Engagements"
                value="7"
                trend={14.2}
                trendLabel="vs last month"
                description="Currently active"
              />
              <Stat
                label="Reports Generated"
                value="23"
                trend={5.0}
                trendLabel="vs last month"
                description="This quarter"
              />
            </StatGroup>
          </motion.div>

          {/* Charts Row */}
          <motion.div
            custom={1}
            variants={fadeUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* Findings Over Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Findings Over Time</CardTitle>
                <p className="text-xs text-muted-foreground">Last 6 months — by severity</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={findingsOverTime}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#EA580C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="gradMedium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#179ECF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#179ECF" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(0 0% 100%)',
                        border: '1px solid hsl(220 13% 90%)',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="critical" name="Critical" stroke="#DC2626" strokeWidth={2} fill="url(#gradCritical)" />
                    <Area type="monotone" dataKey="high"     name="High"     stroke="#EA580C" strokeWidth={2} fill="url(#gradHigh)"     />
                    <Area type="monotone" dataKey="medium"   name="Medium"   stroke="#179ECF" strokeWidth={2} fill="url(#gradMedium)"   />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />Critical
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />High
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />Medium
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Severity Distribution</CardTitle>
                <p className="text-xs text-muted-foreground">All active findings breakdown</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={severityDist}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(0 0% 100%)',
                        border: '1px solid hsl(220 13% 90%)',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Findings" radius={[4, 4, 0, 0]}>
                      {severityDist.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Row */}
          <motion.div
            custom={2}
            variants={fadeUp}
            className="grid grid-cols-1 xl:grid-cols-3 gap-4"
          >
            {/* Recent Findings Table */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Recent Findings</CardTitle>
                  <p className="text-xs text-muted-foreground">Latest vulnerabilities identified</p>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable columns={findingColumns} data={recentFindings} />
                </CardContent>
              </Card>
            </div>

            {/* Active Engagements */}
            <div>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Active Engagements</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {activeEngagements.length} in progress
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {activeEngagements.map((eng) => (
                    <div key={eng.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground leading-tight truncate">
                            {eng.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{eng.client}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                            typeColors[eng.type] ?? 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {eng.type}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{eng.findingsCount} findings</span>
                          <span>{eng.daysLeft}d left</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all"
                            style={{
                              width: `${(eng.findingsCount / eng.maxFindings) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </PageBody>
    </Page>
  )
}
