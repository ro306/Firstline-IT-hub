import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, AlertTriangle, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useTicketsStore } from '@/features/maintenance/useTicketsStore'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { formatDate } from '@/features/assets/finance'
import { cn } from '@/lib/cn'
import type {
  MaintenanceTicket,
  TicketPriority,
  TicketStatus,
} from '@/features/maintenance/types'

const STATUSES: TicketStatus[] = [
  'open',
  'in_progress',
  'awaiting_parts',
  'awaiting_user',
  'resolved',
  'cancelled',
]
const PRIORITIES: TicketPriority[] = ['low', 'normal', 'high', 'urgent']

const STATUS_BADGE: Record<TicketStatus, string> = {
  open: 'bg-sky-950/40 text-sky-300 ring-sky-600/20',
  in_progress: 'bg-amber-950/40 text-amber-300 ring-amber-600/20',
  awaiting_parts: 'bg-violet-950/40 text-violet-300 ring-violet-600/20',
  awaiting_user: 'bg-fuchsia-950/40 text-fuchsia-300 ring-fuchsia-600/20',
  resolved: 'bg-emerald-950/40 text-emerald-300 ring-emerald-600/20',
  cancelled: 'bg-slate-800 text-slate-500 ring-slate-500/20',
}

const PRIORITY_BADGE: Record<TicketPriority, string> = {
  low: 'bg-slate-900/50 text-slate-500 ring-slate-500/20',
  normal: 'bg-sky-950/40 text-sky-300 ring-sky-600/20',
  high: 'bg-orange-950/40 text-orange-300 ring-orange-600/20',
  urgent: 'bg-rose-950/40 text-rose-300 ring-rose-600/20',
}

type FilterKind = 'all' | 'active' | 'resolved'
const FILTERS: FilterKind[] = ['all', 'active', 'resolved']

const ACTIVE_STATUSES = new Set<TicketStatus>([
  'open',
  'in_progress',
  'awaiting_parts',
  'awaiting_user',
])

export function MaintenancePage() {
  const { t } = useTranslation()
  const store = useTicketsStore()
  const [filter, setFilter] = useState<FilterKind>('active')
  const [editing, setEditing] = useState<MaintenanceTicket | undefined>(
    undefined,
  )
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<MaintenanceTicket | null>(null)

  const filtered = useMemo(() => {
    return store.tickets.filter((t) => {
      if (filter === 'all') return true
      if (filter === 'active') return ACTIVE_STATUSES.has(t.status)
      return t.status === 'resolved' || t.status === 'cancelled'
    })
  }, [store.tickets, filter])

  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      open: 0,
      in_progress: 0,
      awaiting: 0,
      resolved: 0,
    }
    for (const t of store.tickets) {
      if (t.status === 'open') counts.open++
      else if (t.status === 'in_progress') counts.in_progress++
      else if (
        t.status === 'awaiting_parts' ||
        t.status === 'awaiting_user'
      )
        counts.awaiting++
      else if (t.status === 'resolved') counts.resolved++
    }
    return counts
  }, [store.tickets])

  return (
    <div>
      <PageHeader
        title={t('maintenance_page.title')}
        description={t('maintenance_page.description')}
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            {t('maintenance_page.new')}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t('maintenance_page.stat.open')} value={stats.open} tone="sky" />
        <Stat
          label={t('maintenance_page.stat.in_progress')}
          value={stats.in_progress}
          tone="amber"
        />
        <Stat
          label={t('maintenance_page.stat.awaiting')}
          value={stats.awaiting}
          tone="violet"
        />
        <Stat
          label={t('maintenance_page.stat.resolved')}
          value={stats.resolved}
          tone="emerald"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900 shadow-elevated">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? 'rounded-md bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-300'
                  : 'rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-800'
              }
            >
              {t(`maintenance_page.filter.${f}`)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('maintenance_page.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/40 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">
                    {t('maintenance_page.table.title')}
                  </th>
                  <th className="px-4 py-3">
                    {t('maintenance_page.table.asset')}
                  </th>
                  <th className="px-4 py-3">
                    {t('maintenance_page.table.status')}
                  </th>
                  <th className="px-4 py-3">
                    {t('maintenance_page.table.priority')}
                  </th>
                  <th className="px-4 py-3">
                    {t('maintenance_page.table.assignee')}
                  </th>
                  <th className="px-4 py-3">
                    {t('maintenance_page.table.created')}
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="group transition-colors hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-slate-500">
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">
                            {ticket.title}
                          </p>
                          {ticket.ticketRef && (
                            <p className="font-mono text-xs text-slate-500">
                              {ticket.ticketRef}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {ticket.assetId ? (
                        <Link
                          to={`/assets/${ticket.assetId}`}
                          className="text-brand-300 hover:underline"
                        >
                          {ticket.assetName ?? ticket.assetId}
                        </Link>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_BADGE[ticket.status]}>
                        {t(`maintenance_page.status.${ticket.status}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={PRIORITY_BADGE[ticket.priority]}>
                        {t(`maintenance_page.priority.${ticket.priority}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {ticket.assignedTo ?? <span className="text-slate-500">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(ticket)}
                          aria-label={t('asset_actions.edit')}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(ticket)}
                          aria-label={t('asset_actions.delete')}
                          className="rounded-md p-1.5 text-rose-500 hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <TicketDialog onClose={() => setCreating(false)} />}
      {editing && (
        <TicketDialog
          ticket={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
      {deleting && (
        <DeleteTicketDialog
          ticket={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'sky' | 'amber' | 'violet' | 'emerald'
}) {
  const toneClasses = {
    sky: 'bg-sky-950/40 text-sky-300',
    amber: 'bg-amber-950/40 text-amber-300',
    violet: 'bg-violet-950/40 text-violet-300',
    emerald: 'bg-emerald-950/40 text-emerald-300',
  }[tone]
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-800/70 bg-slate-900 p-5 shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
      </div>
      <div className={`rounded-md px-2 py-1 text-xs font-medium ${toneClasses}`}>
        ●
      </div>
    </div>
  )
}

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        tone,
      )}
    >
      {children}
    </span>
  )
}

function TicketDialog({
  ticket,
  onClose,
}: {
  ticket?: MaintenanceTicket
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useTicketsStore()
  const { assets } = useAssetStore()
  const editing = !!ticket
  const [form, setForm] = useState({
    title: ticket?.title ?? '',
    assetId: ticket?.assetId ?? '',
    status: ticket?.status ?? ('open' as TicketStatus),
    priority: ticket?.priority ?? ('normal' as TicketPriority),
    description: ticket?.description ?? '',
    reportedBy: ticket?.reportedBy ?? '',
    assignedTo: ticket?.assignedTo ?? '',
    vendor: ticket?.vendor ?? '',
    ticketRef: ticket?.ticketRef ?? '',
    scheduledFor: ticket?.scheduledFor ?? '',
    resolutionNotes: ticket?.resolutionNotes ?? '',
    costEstimate: ticket?.costEstimate ?? 0,
    costCurrency: ticket?.costCurrency ?? ('DKK' as 'DKK' | 'EUR' | 'USD'),
  })
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!form.title.trim() || !form.reportedBy.trim()) {
      setError(t('asset_form.validation.required'))
      return
    }
    const linkedAsset = assets.find((a) => a.id === form.assetId)
    const payload = {
      title: form.title.trim(),
      assetId: form.assetId || undefined,
      assetName: linkedAsset?.name,
      status: form.status,
      priority: form.priority,
      description: form.description.trim(),
      reportedBy: form.reportedBy.trim(),
      assignedTo: form.assignedTo.trim() || undefined,
      vendor: form.vendor.trim() || undefined,
      ticketRef: form.ticketRef.trim() || undefined,
      scheduledFor: form.scheduledFor || undefined,
      resolutionNotes: form.resolutionNotes.trim() || undefined,
      costEstimate: form.costEstimate > 0 ? form.costEstimate : undefined,
      costCurrency: form.costEstimate > 0 ? form.costCurrency : undefined,
    }
    if (editing && ticket) {
      store.updateTicket(ticket.id, payload)
    } else {
      store.createTicket(payload)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={
        editing
          ? t('maintenance_page.form.edit_title')
          : t('maintenance_page.form.create_title')
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {editing ? t('asset_form.save_submit') : t('common.confirm')}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <Label>{t('maintenance_page.form.field.title')}</Label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('maintenance_page.form.field.title_placeholder')}
            className={inputCls}
          />
        </div>
        <div>
          <Label>{t('maintenance_page.form.field.asset')}</Label>
          <select
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            className={inputCls}
          >
            <option value="">{t('maintenance_page.form.field.asset_none')}</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.assetTag}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('maintenance_page.form.field.status')}</Label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as TicketStatus })
              }
              className={inputCls}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`maintenance_page.status.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>{t('maintenance_page.form.field.priority')}</Label>
            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as TicketPriority })
              }
              className={inputCls}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {t(`maintenance_page.priority.${p}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>{t('maintenance_page.form.field.description')}</Label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={3}
            placeholder={t('maintenance_page.form.field.description_placeholder')}
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('maintenance_page.form.field.reported_by')}</Label>
            <input
              type="text"
              value={form.reportedBy}
              onChange={(e) =>
                setForm({ ...form, reportedBy: e.target.value })
              }
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('maintenance_page.form.field.assigned_to')}</Label>
            <input
              type="text"
              value={form.assignedTo}
              onChange={(e) =>
                setForm({ ...form, assignedTo: e.target.value })
              }
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('maintenance_page.form.field.vendor')}</Label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('maintenance_page.form.field.ticket_ref')}</Label>
            <input
              type="text"
              value={form.ticketRef}
              onChange={(e) =>
                setForm({ ...form, ticketRef: e.target.value })
              }
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>{t('maintenance_page.form.field.scheduled_for')}</Label>
            <input
              type="date"
              value={form.scheduledFor}
              onChange={(e) =>
                setForm({ ...form, scheduledFor: e.target.value })
              }
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('maintenance_page.form.field.cost_estimate')}</Label>
            <input
              type="number"
              min={0}
              value={form.costEstimate}
              onChange={(e) =>
                setForm({ ...form, costEstimate: Number(e.target.value) })
              }
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('maintenance_page.form.field.cost_currency')}</Label>
            <select
              value={form.costCurrency}
              onChange={(e) =>
                setForm({
                  ...form,
                  costCurrency: e.target.value as 'DKK' | 'EUR' | 'USD',
                })
              }
              className={inputCls}
            >
              <option value="DKK">DKK</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        {(form.status === 'resolved' || form.status === 'cancelled') && (
          <div>
            <Label>{t('maintenance_page.form.field.resolution_notes')}</Label>
            <textarea
              value={form.resolutionNotes}
              onChange={(e) =>
                setForm({ ...form, resolutionNotes: e.target.value })
              }
              rows={2}
              className={inputCls}
            />
          </div>
        )}
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </Modal>
  )
}

function DeleteTicketDialog({
  ticket,
  onClose,
}: {
  ticket: MaintenanceTicket
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useTicketsStore()
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('maintenance_page.form.delete_title')}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              store.deleteTicket(ticket.id)
              onClose()
            }}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {t('common.delete')}
          </button>
        </>
      }
    >
      <div className="flex gap-3 rounded-md border border-rose-500/30 bg-rose-950/40 p-3 text-sm text-rose-300">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>
          {t('maintenance_page.form.delete_warning', { title: ticket.title })}
        </p>
      </div>
    </Modal>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-slate-300">{children}</label>
}

const inputCls =
  'mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'
