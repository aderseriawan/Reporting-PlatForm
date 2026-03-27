import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, EmptyState, Skeleton, toast } from '@blinkdotnew/ui'
import { Plus, Target, Trash2, ArrowRight, Calendar } from 'lucide-react'
import { blink } from '../lib/blink'
import { EngagementForm, type EngagementFormValues } from '../components/EngagementForm'
import { EngagementStatusBadge } from '../components/EngagementStatusBadge'
import type { Engagement } from '../types'

const USER_ID = 'shared'

const TYPE_LABELS: Record<string, string> = {
  pentest: 'Pentest', vapt: 'VAPT', red_team: 'Red Team',
  code_review: 'Code Review', social_engineering: 'Social Eng.',
}

export function EngagementsPage() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: engagements = [], isLoading } = useQuery({
    queryKey: ['engagements'],
    queryFn: () => blink.db.engagements.list({ where: { userId: USER_ID }, orderBy: { createdAt: 'desc' } }) as Promise<Engagement[]>,
  })

  const createMutation = useMutation({
    mutationFn: async (values: EngagementFormValues) => {
      const now = new Date().toISOString()
      await blink.db.engagements.create({
        id: crypto.randomUUID(),
        userId: USER_ID,
        title: values.title,
        client: values.client,
        type: values.type,
        status: values.status,
        scope: values.scope ?? '',
        startDate: values.startDate ?? '',
        endDate: values.endDate ?? '',
        createdAt: now,
        updatedAt: now,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
      toast.success('Engagement created')
      setOpen(false)
    },
    onError: () => toast.error('Failed to create engagement'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blink.db.engagements.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
      toast.success('Engagement deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Engagements</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{engagements.length} total engagements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />New Engagement</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Engagement</DialogTitle>
            </DialogHeader>
            <EngagementForm
              onSubmit={createMutation.mutateAsync}
              loading={createMutation.isPending}
              submitLabel="Create Engagement"
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      ) : engagements.length === 0 ? (
        <EmptyState
          icon={<Target />}
          title="No engagements yet"
          description="Create your first security engagement to get started."
          action={{ label: 'New Engagement', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {engagements.map((eng) => (
            <EngagementCard
              key={eng.id}
              engagement={eng}
              onDelete={() => deleteMutation.mutate(eng.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EngagementCard({ engagement, onDelete }: { engagement: Engagement; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card hover:shadow-md transition-all duration-200 group flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link
            to="/engagements/$id"
            params={{ id: engagement.id }}
            className="font-medium text-foreground hover:text-[--verdigris] transition-colors text-[13px] leading-snug line-clamp-2 block"
          >
            {engagement.title}
          </Link>
          <p className="text-[12px] text-muted-foreground mt-0.5">{engagement.client}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <EngagementStatusBadge status={engagement.status} />
        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
          {TYPE_LABELS[engagement.type] ?? engagement.type}
        </span>
      </div>

      {(engagement.startDate || engagement.endDate) && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Calendar className="w-3 h-3" />
          {engagement.startDate && <span>{engagement.startDate}</span>}
          {engagement.startDate && engagement.endDate && <span>→</span>}
          {engagement.endDate && <span>{engagement.endDate}</span>}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
        <Link
          to="/engagements/$id"
          params={{ id: engagement.id }}
          className="text-[12px] font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--verdigris)' }}
        >
          View details <ArrowRight className="w-3 h-3" />
        </Link>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={onDelete} className="text-xs text-destructive hover:underline font-medium">
              Confirm
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground hover:underline">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
