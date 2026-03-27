import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Textarea } from '@blinkdotnew/ui'
import { severityFromCvss } from '../lib/severity'
import type { SeverityLevel, FindingStatus } from '../types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  status: z.enum(['open', 'in_progress', 'resolved', 'accepted']),
  cvssScore: z.coerce.number().min(0).max(10),
  cvssVector: z.string().optional(),
  affectedComponent: z.string().optional(),
  description: z.string().optional(),
  proofOfConcept: z.string().optional(),
  recommendation: z.string().optional(),
  vulnReferences: z.string().optional(),
})

export type FindingFormValues = z.infer<typeof schema>

interface FindingFormProps {
  defaultValues?: Partial<FindingFormValues>
  onSubmit: (values: FindingFormValues) => Promise<void>
  loading?: boolean
  submitLabel?: string
}

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'info', label: 'Info' },
]

const STATUS_OPTIONS: { value: FindingStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'accepted', label: 'Accepted Risk' },
]

export function FindingForm({ defaultValues, onSubmit, loading, submitLabel = 'Save' }: FindingFormProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FindingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'medium', status: 'open', cvssScore: 5.0, ...defaultValues },
  })

  const cvssScore = watch('cvssScore')

  const handleCvssBlur = () => {
    const score = parseFloat(String(cvssScore))
    if (!isNaN(score)) setValue('severity', severityFromCvss(score))
  }

  const selectClass = 'w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Title *</label>
        <Input {...register('title')} placeholder="e.g. SQL Injection in Login Form" />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Severity</label>
          <select {...register('severity')} className={selectClass}>
            {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">CVSS Score</label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="10"
            {...register('cvssScore')}
            onBlur={handleCvssBlur}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
          <select {...register('status')} className={selectClass}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Affected Component</label>
        <Input {...register('affectedComponent')} placeholder="e.g. /api/login, Windows Server 2019" />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
        <Textarea {...register('description')} placeholder="Describe the vulnerability..." rows={3} />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Proof of Concept</label>
        <Textarea {...register('proofOfConcept')} placeholder="Steps to reproduce..." rows={3} />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">Recommendation</label>
        <Textarea {...register('recommendation')} placeholder="Remediation steps..." rows={3} />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1 block">References (comma-separated URLs)</label>
        <Input {...register('vulnReferences')} placeholder="https://cve.mitre.org/..." />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
