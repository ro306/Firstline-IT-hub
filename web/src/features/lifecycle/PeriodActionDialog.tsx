import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { useAuth } from '@/lib/auth'
import { useAlertStore } from './useAlertStore'
import { KIND_LABEL } from './expirations'
import { formatDate } from '@/features/assets/finance'
import type { ExpirationPeriod } from './expirations'

export type ActionKind = 'renew' | 'snooze' | 'acknowledge' | 'task'

type Props = {
  period: ExpirationPeriod | null
  action: ActionKind | null
  onClose: () => void
  onRenew?: (period: ExpirationPeriod, newEndsAt: string, notes?: string) => void
}

const SNOOZE_PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function addMonths(months: number, fromIso?: string): string {
  const d = fromIso ? new Date(fromIso) : new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export function PeriodActionDialog({
  period,
  action,
  onClose,
  onRenew,
}: Props) {
  const { user } = useAuth()
  const store = useAlertStore()
  const [notes, setNotes] = useState('')
  const [snoozeDays, setSnoozeDays] = useState<number>(30)
  const [renewExtensionMonths, setRenewExtensionMonths] = useState<number>(12)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskAssignee, setTaskAssignee] = useState(user?.name ?? '')
  const [taskDueDays, setTaskDueDays] = useState<number>(14)

  if (!period || !action) return null

  const title =
    action === 'renew'
      ? `Renew ${KIND_LABEL[period.kind].toLowerCase()}`
      : action === 'snooze'
        ? 'Snooze alert'
        : action === 'acknowledge'
          ? 'Acknowledge alert'
          : 'Create follow-up task'

  const description = `${period.assetName} · ${period.label} · ends ${formatDate(period.endsAt)}`

  function handleConfirm() {
    if (!period) return
    switch (action) {
      case 'renew': {
        const newEndsAt = addMonths(renewExtensionMonths, period.endsAt)
        onRenew?.(period, newEndsAt, notes)
        store.resolve(period.key, notes || `Renewed for ${renewExtensionMonths} months`)
        break
      }
      case 'snooze': {
        store.snooze(period.key, addDays(snoozeDays), notes)
        break
      }
      case 'acknowledge': {
        store.acknowledge(period.key, user?.name ?? 'Unknown', notes)
        break
      }
      case 'task': {
        const fallbackTitle = `Follow up on ${period.label} for ${period.assetName}`
        store.createTask({
          assetId: period.assetId,
          periodKey: period.key,
          title: taskTitle || fallbackTitle,
          assigneeName: taskAssignee || user?.name || 'Unassigned',
          dueAt: addDays(taskDueDays),
          status: 'open',
          createdBy: user?.name ?? 'Unknown',
          description: notes || undefined,
        })
        store.acknowledge(
          period.key,
          user?.name ?? 'Unknown',
          `Task created: ${taskTitle || fallbackTitle}`,
        )
        break
      }
    }
    setNotes('')
    setTaskTitle('')
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Confirm
          </button>
        </>
      }
    >
      {action === 'renew' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700">
              Extend by
            </label>
            <div className="mt-1 flex gap-2">
              {[6, 12, 24, 36].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRenewExtensionMonths(m)}
                  className={
                    renewExtensionMonths === m
                      ? 'rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-600/30'
                      : 'rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50'
                  }
                >
                  {m} months
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              New end date:{' '}
              <span className="font-medium text-slate-700">
                {formatDate(addMonths(renewExtensionMonths, period.endsAt))}
              </span>
            </p>
          </div>
        </div>
      )}

      {action === 'snooze' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700">
              Hide from list for
            </label>
            <div className="mt-1 flex gap-2">
              {SNOOZE_PRESETS.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setSnoozeDays(p.days)}
                  className={
                    snoozeDays === p.days
                      ? 'rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-600/30'
                      : 'rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50'
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Re-appears on{' '}
              <span className="font-medium text-slate-700">
                {formatDate(addDays(snoozeDays))}
              </span>
            </p>
          </div>
        </div>
      )}

      {action === 'task' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder={`Follow up on ${period.label}`}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Assign to
              </label>
              <input
                type="text"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">
                Due in
              </label>
              <select
                value={taskDueDays}
                onChange={(e) => setTaskDueDays(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              >
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs font-medium text-slate-700">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          placeholder="Why did you take this action?"
        />
      </div>
    </Modal>
  )
}
