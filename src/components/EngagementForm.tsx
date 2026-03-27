import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Textarea } from '@blinkdotnew/ui'
import type { Engagement, EngagementStatus, EngagementType } from '../types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  client: z.string().min(1, 'Client is required'),
  type: z.enum(['pentest', 'vapt', 'red_team', 'code_review', 'social_engineering']),
  status: z.enum(['planning', 'active', 'review', 'completed', 'archived']),
  scope: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type EngagementFormValues = z.infer<typeof schema>

interface EngagementFormProps {
  defaultValues?: Partial<EngagementFormValues>
  onSubmit: (values: EngagementFormValues) => Promise<void>
  loading?: boolean
  submitLabel?: string
}

const TYPE_OPTIONS: { value: EngagementType; label: string }[] = [
  { value: 'pentest', label: 'Penetration Test' },
  { value: 'vapt', label: 'VAPT' },
  { value: 'red_team', label: 'Red Team' },
  { value: 'code_review', label: 'Code Review' },
  { value: 'social_engineering', label: 'Social Engineering' },
]

const STATUS_OPTIONS: { value: EngagementStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export function EngagementForm({ defaultValues, onSubmit, loading, submitLabel = 'Save' }: EngagementFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EngagementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'vapt', status: 'planning', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Title *</label>
        <Input {...register('title')} placeholder="e.g. Q4 Web App Pentest" />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Client *</label>
        <Input {...register('client')} placeholder="Client name" />
        {errors.client && <p className="text-xs text-destructive mt-1">{errors.client.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Type</label>
          <select {...register('type')} className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
          <select {...register('status')} className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Start Date</label>
          <Input type="date" {...register('startDate')} />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">End Date</label>
          <Input type="date" {...register('endDate')} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Scope</label>
        <Textarea {...register('scope')} placeholder="IP ranges, domains, assets in scope..." rows={3} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
