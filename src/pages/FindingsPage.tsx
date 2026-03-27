import { useState, useMemo } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Sheet, SheetContent, SheetHeader, SheetTitle, Skeleton, EmptyState, Button, toast } from '@blinkdotnew/ui'
import { Bug, Filter, X } from 'lucide-react'
import { blink } from '../lib/blink'
import { FindingCard } from '../components/FindingCard'
import { SeverityBadge } from '../components/ui/SeverityBadge'
import { FindingForm, type FindingFormValues } from '../components/FindingForm'
import { getCvssColor } from '../lib/severity'
import type { Engagement, Finding, SeverityLevel, FindingStatus } from '../types'

const USER_ID = 'shared'
const SEVERITIES: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'info']
const STATUSES: { value: FindingStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'accepted', label: 'Accepted' },
]

export function FindingsPage() {
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<FindingStatus | 'all'>('all')
  const [selected, setSelected] = useState<Finding | null>(null)
  const [editMode, setEditMode] = useState(false)
  const queryClient = useQueryClient()

  const { data: findings = [], isLoading: findLoading } = useQuery({
    queryKey: ['findings'],
    queryFn: () => blink.db.findings.list({ where: { userId: USER_ID }, orderBy: { createdAt: 'desc' } }) as Promise<Finding[]>,
  })

  const { data: engagements = [] } = useQuery({
    queryKey: ['engagements'],
    queryFn: () => blink.db.engagements.list({ where: { userId: USER_ID } }) as Promise<Engagement[]>,
  })

  const engagementMap = useMemo(
    () => Object.fromEntries(engagements.map((e) => [e.id, e.title])),
    [engagements]
  )

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (severityFilter !== 'all' && f.severity !== severityFilter) return false
      if (statusFilter !== 'all' && f.status !== statusFilter) return false
      return true
    })
  }, [findings, severityFilter, statusFilter])

  const updateMutation = useMutation({
    mutationFn: async (values: FindingFormValues) => {
      if (!selected) return
      await blink.db.findings.update(selected.id, {
        ...values,
        updatedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] })
      toast.success('Finding updated')
      setEditMode(false)
    },
    onError: () => toast.error('Failed to update'),
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Findings</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{filtered.length} of {findings.length} findings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" active={severityFilter === 'all'} onClick={() => setSeverityFilter('all')} />
          {SEVERITIES.map((s) => (
            <FilterChip key={s} label={s} active={severityFilter === s} onClick={() => setSeverityFilter(s)} />
          ))}
        </div>
        <div className="w-px h-4 bg-border mx-1" />
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All Status" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
          {STATUSES.map((s) => (
            <FilterChip key={s.value} label={s.label} active={statusFilter === s.value} onClick={() => setStatusFilter(s.value)} />
          ))}
        </div>
        {(severityFilter !== 'all' || statusFilter !== 'all') && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-2"
            onClick={() => { setSeverityFilter('all'); setStatusFilter('all') }}
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {findLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Bug />} title="No findings match" description="Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              engagementTitle={engagementMap[finding.engagementId]}
              onClick={() => { setSelected(finding); setEditMode(false) }}
            />
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setEditMode(false) } }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left line-clamp-2">{selected?.title}</SheetTitle>
          </SheetHeader>
          {selected && !editMode && (
            <FindingDetail
              finding={selected}
              engagementTitle={engagementMap[selected.engagementId]}
              onEdit={() => setEditMode(true)}
            />
          )}
          {selected && editMode && (
            <div className="mt-4">
              <FindingForm
                defaultValues={selected}
                onSubmit={updateMutation.mutateAsync}
                loading={updateMutation.isPending}
                submitLabel="Update Finding"
              />
              <button className="mt-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FindingDetail({ finding, engagementTitle, onEdit }: { finding: Finding; engagementTitle?: string; onEdit: () => void }) {
  const cvssColor = getCvssColor(finding.cvssScore)
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <SeverityBadge severity={finding.severity} />
        <span className={`font-mono text-sm font-semibold ${cvssColor}`}>
          {finding.cvssScore > 0 ? `CVSS ${finding.cvssScore.toFixed(1)}` : 'N/A'}
        </span>
        <Button size="sm" variant="outline" onClick={onEdit} className="ml-auto">Edit</Button>
      </div>

      {engagementTitle && (
        <p className="text-xs text-muted-foreground">Engagement: <span className="text-foreground">{engagementTitle}</span></p>
      )}

      {finding.affectedComponent && <DetailSection label="Affected Component" value={finding.affectedComponent} mono />}
      {finding.description && <DetailSection label="Description" value={finding.description} />}
      {finding.proofOfConcept && <DetailSection label="Proof of Concept" value={finding.proofOfConcept} mono />}
      {finding.recommendation && <DetailSection label="Recommendation" value={finding.recommendation} />}
      {finding.cvssVector && <DetailSection label="CVSS Vector" value={finding.cvssVector} mono />}
      {finding.vulnReferences && <DetailSection label="References" value={finding.vulnReferences} />}
    </div>
  )
}

function DetailSection({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{label}</h4>
      <p className={`text-sm text-foreground whitespace-pre-wrap ${mono ? 'font-mono text-xs bg-muted p-3 rounded-md' : ''}`}>{value}</p>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all capitalize font-medium ${
        active
          ? 'border-transparent text-white'
          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
      }`}
      style={active ? { background: 'var(--verdigris)' } : {}}
    >
      {label}
    </button>
  )
}
