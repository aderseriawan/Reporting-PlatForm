import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Skeleton, EmptyState, toast, Textarea } from '@blinkdotnew/ui'
import { Plus, FileText, Printer, Trash2, CheckCircle, Edit3 } from 'lucide-react'
import { blink } from '../lib/blink'
import type { Engagement, Report } from '../types'

const USER_ID = 'shared'

export function ReportsPage() {
  const [generateOpen, setGenerateOpen] = useState(false)
  const [editReport, setEditReport] = useState<Report | null>(null)
  const queryClient = useQueryClient()

  const { data: reports = [], isLoading: repLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => blink.db.reports.list({ where: { userId: USER_ID }, orderBy: { createdAt: 'desc' } }) as Promise<Report[]>,
  })

  const { data: engagements = [], isLoading: engLoading } = useQuery({
    queryKey: ['engagements'],
    queryFn: () => blink.db.engagements.list({ where: { userId: USER_ID } }) as Promise<Engagement[]>,
  })

  const engagementMap = Object.fromEntries(engagements.map((e) => [e.id, e]))

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blink.db.reports.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Report deleted')
    },
  })

  const finalizeMutation = useMutation({
    mutationFn: (id: string) => blink.db.reports.update(id, { status: 'final', updatedAt: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Report finalized')
    },
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">{reports.length} reports generated</p>
        </div>
        <Button size="sm" onClick={() => setGenerateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />Generate Report
        </Button>
      </div>

      {(repLoading || engLoading) ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No reports yet"
          description="Generate a report for an engagement to document your findings."
          action={{ label: 'Generate Report', onClick: () => setGenerateOpen(true) }}
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              engagement={engagementMap[report.engagementId]}
              onDelete={() => deleteMutation.mutate(report.id)}
              onFinalize={() => finalizeMutation.mutate(report.id)}
              onEdit={() => setEditReport(report)}
            />
          ))}
        </div>
      )}

      <GenerateReportDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        engagements={engagements}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['reports'] })}
      />

      {editReport && (
        <EditReportDialog
          report={editReport}
          onClose={() => setEditReport(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['reports'] })
            setEditReport(null)
          }}
        />
      )}
    </div>
  )
}

function ReportCard({ report, engagement, onDelete, onFinalize, onEdit }: {
  report: Report; engagement?: Engagement;
  onDelete: () => void; onFinalize: () => void; onEdit: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handlePrint = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) return
    printWin.document.write(`
      <html><head><title>${report.title}</title>
      <style>body{font-family:sans-serif;max-width:800px;margin:40px auto;color:#1a2332;} h1{color:#1a2332;} h2{color:#444;border-bottom:1px solid #eee;padding-bottom:8px;} pre{background:#f5f5f5;padding:16px;border-radius:6px;white-space:pre-wrap;}</style>
      </head><body>
      <h1>${report.title}</h1>
      <p><strong>Client:</strong> ${engagement?.client ?? '—'} &nbsp;|&nbsp; <strong>Status:</strong> ${report.status}</p>
      <h2>Executive Summary</h2><p>${report.executiveSummary ?? 'Not provided.'}</p>
      <h2>Methodology</h2><p>${report.methodology ?? 'Not provided.'}</p>
      <h2>Conclusion</h2><p>${report.conclusion ?? 'Not provided.'}</p>
      </body></html>
    `)
    printWin.document.close()
    printWin.print()
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{report.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${report.status === 'final' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
              {report.status === 'final' ? 'Final' : 'Draft'}
            </span>
          </div>
          {engagement && (
            <p className="text-sm text-muted-foreground">{engagement.client} · {engagement.title}</p>
          )}
          {report.executiveSummary && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{report.executiveSummary}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Print">
            <Printer className="w-4 h-4" />
          </button>
          {report.status === 'draft' && (
            <button onClick={onFinalize} className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors" title="Finalize">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onDelete} className="text-xs text-destructive hover:underline font-medium">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GenerateReportDialog({ open, onOpenChange, engagements, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  engagements: Engagement[]; onCreated: () => void
}) {
  const [engagementId, setEngagementId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!engagementId) { toast.error('Select an engagement'); return }
    const eng = engagements.find((e) => e.id === engagementId)
    if (!eng) return
    setLoading(true)
    try {
      const now = new Date().toISOString()
      await blink.db.reports.create({
        id: crypto.randomUUID(),
        userId: USER_ID,
        engagementId,
        title: `${eng.title} — Security Report`,
        executiveSummary: '',
        methodology: '',
        conclusion: '',
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      })
      onCreated()
      toast.success('Report created')
      onOpenChange(false)
    } catch {
      toast.error('Failed to create report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Select Engagement</label>
            <select
              value={engagementId}
              onChange={(e) => setEngagementId(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choose an engagement...</option>
              {engagements.map((e) => <option key={e.id} value={e.id}>{e.title} — {e.client}</option>)}
            </select>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Generate Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditReportDialog({ report, onClose, onSaved }: { report: Report; onClose: () => void; onSaved: () => void }) {
  const [summary, setSummary] = useState(report.executiveSummary ?? '')
  const [methodology, setMethodology] = useState(report.methodology ?? '')
  const [conclusion, setConclusion] = useState(report.conclusion ?? '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await blink.db.reports.update(report.id, {
        executiveSummary: summary,
        methodology,
        conclusion,
        updatedAt: new Date().toISOString(),
      })
      onSaved()
      toast.success('Report saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Report: {report.title}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Executive Summary</label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="High-level summary of findings and risk..." />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Methodology</label>
            <Textarea value={methodology} onChange={(e) => setMethodology(e.target.value)} rows={4} placeholder="Testing methodology and approach..." />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Conclusion</label>
            <Textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={4} placeholder="Overall conclusions and recommendations..." />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Report'}
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
