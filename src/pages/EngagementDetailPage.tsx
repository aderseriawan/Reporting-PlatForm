import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Skeleton, EmptyState, toast } from '@blinkdotnew/ui'
import { Plus, Bug, ArrowLeft, Trash2, FileText, Calendar, Globe } from 'lucide-react'
import { blink } from '../lib/blink'
import { FindingForm, type FindingFormValues } from '../components/FindingForm'
import { FindingCard } from '../components/FindingCard'
import { EngagementStatusBadge } from '../components/EngagementStatusBadge'
import type { Engagement, Finding } from '../types'

const USER_ID = 'shared'

export function EngagementDetailPage() {
  const { id } = useParams({ from: '/engagements/$id' })
  const [addOpen, setAddOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: engagement, isLoading: engLoading } = useQuery({
    queryKey: ['engagement', id],
    queryFn: () => blink.db.engagements.get(id) as Promise<Engagement>,
    enabled: !!id,
  })

  const { data: findings = [], isLoading: findLoading } = useQuery({
    queryKey: ['findings', id],
    queryFn: () => blink.db.findings.list({ where: { engagementId: id, userId: USER_ID }, orderBy: { createdAt: 'desc' } }) as Promise<Finding[]>,
    enabled: !!id,
  })

  const createFinding = useMutation({
    mutationFn: async (values: FindingFormValues) => {
      const now = new Date().toISOString()
      await blink.db.findings.create({
        id: crypto.randomUUID(),
        userId: USER_ID,
        engagementId: id,
        title: values.title,
        severity: values.severity,
        status: values.status,
        cvssScore: values.cvssScore,
        cvssVector: values.cvssVector ?? '',
        affectedComponent: values.affectedComponent ?? '',
        description: values.description ?? '',
        proofOfConcept: values.proofOfConcept ?? '',
        recommendation: values.recommendation ?? '',
        vulnReferences: values.vulnReferences ?? '',
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', id] })
      queryClient.invalidateQueries({ queryKey: ['findings'] })
      toast.success('Finding added')
      setAddOpen(false)
    },
    onError: () => toast.error('Failed to add finding'),
  })

  const deleteFinding = useMutation({
    mutationFn: (fid: string) => blink.db.findings.delete(fid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', id] })
      queryClient.invalidateQueries({ queryKey: ['findings'] })
      toast.success('Finding deleted')
    },
  })

  if (engLoading) return <DetailSkeleton />

  if (!engagement) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState icon={<Bug />} title="Engagement not found" description="This engagement does not exist." />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/engagements" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground truncate">{engagement.title}</h1>
            <EngagementStatusBadge status={engagement.status} />
          </div>
          <p className="text-sm text-muted-foreground">{engagement.client}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 shadow-card grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoItem icon={Globe} label="Type" value={engagement.type.replace('_', ' ')} />
            <InfoItem icon={Calendar} label="Start" value={engagement.startDate || '—'} />
            <InfoItem icon={Calendar} label="End" value={engagement.endDate || '—'} />
            <InfoItem icon={Bug} label="Findings" value={String(findings.length)} />
          </div>

          {engagement.scope && (
            <div className="bg-card border border-border rounded-lg p-4 shadow-card">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Scope</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap font-mono">{engagement.scope}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/reports" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-muted text-sm font-medium text-foreground transition-colors">
            <FileText className="w-4 h-4 text-accent" />
            View Reports
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Findings <span className="text-muted-foreground font-normal text-sm">({findings.length})</span>
          </h2>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Add Finding</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Finding</DialogTitle>
              </DialogHeader>
              <FindingForm
                onSubmit={createFinding.mutateAsync}
                loading={createFinding.isPending}
                submitLabel="Add Finding"
              />
            </DialogContent>
          </Dialog>
        </div>

        {findLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        ) : findings.length === 0 ? (
          <EmptyState
            icon={<Bug />}
            title="No findings yet"
            description="Add your first finding to this engagement."
            action={{ label: 'Add Finding', onClick: () => setAddOpen(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {findings.map((finding) => (
              <div key={finding.id} className="relative group/card">
                <FindingCard finding={finding} />
                <button
                  onClick={() => deleteFinding.mutate(finding.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
    </div>
  )
}
