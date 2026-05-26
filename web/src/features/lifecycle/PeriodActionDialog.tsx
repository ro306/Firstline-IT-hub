import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { useAuth } from '@/lib/auth'
import { useAlertStore } from './useAlertStore'
import { kindKey } from './expirations'
import { formatDate } from '@/features/assets/finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { ExpirationPeriod } from './expirations'

export type ActionKind = 'renew' | 'snooze' | 'acknowledge' | 'task'

type Props = {
  period: ExpirationPeriod | null
  action: ActionKind | null
  onClose: () => void
  onRenew?: (period: ExpirationPeriod, newEndsAt: string, notes?: string) => void
}

const SNOOZE_PRESETS = [7, 30, 90]

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
  const { t } = useTranslation()
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
      ? t('dialog.title.renew', { kind: t(kindKey(period.kind)).toLowerCase() })
      : action === 'snooze'
        ? t('dialog.title.snooze')
        : action === 'acknowledge'
          ? t('dialog.title.acknowledge')
          : t('dialog.title.task')

  const description = t('dialog.ends_at_summary', {
    asset: period.assetName,
    label: period.label,
    date: formatDate(period.endsAt),
  })

  function handleConfirm() {
    if (!period) return
    switch (action) {
      case 'renew': {
        const newEndsAt = addMonths(renewExtensionMonths, period.endsAt)
        onRenew?.(period, newEndsAt, notes)
        store.resolve(
          period.key,
          notes ||
            t('dialog.renew_completion_note', { n: renewExtensionMonths }),
        )
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
        const fallbackTitle = t('dialog.task.default_title', {
          label: period.label,
          asset: period.assetName,
        })
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
          `Task: ${taskTitle || fallbackTitle}`,
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
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('common.confirm')}
          </button>
        </>
      }
    >
      {action === 'renew' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700">
              {t('dialog.renew.extend_by')}
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
                  {t('dialog.renew.months', { n: m })}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {t('dialog.renew.new_end_date')}{' '}
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
              {t('dialog.snooze.hide_for')}
            </label>
            <div className="mt-1 flex gap-2">
              {SNOOZE_PRESETS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setSnoozeDays(days)}
                  className={
                    snoozeDays === days
                      ? 'rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-600/30'
                      : 'rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50'
                  }
                >
                  {t(`dialog.snooze.preset_${days}`)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {t('dialog.snooze.reappears_on')}{' '}
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
            <label className="text-xs font-medium text-slate-700">
              {t('dialog.task.title_label')}
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder={t('dialog.task.placeholder', { label: period.label })}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                {t('dialog.task.assign_to')}
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
                {t('dialog.task.due_in')}
              </label>
              <select
                value={taskDueDays}
                onChange={(e) => setTaskDueDays(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              >
                <option value={3}>{t('dialog.task.due_3')}</option>
                <option value={7}>{t('dialog.task.due_7')}</option>
                <option value={14}>{t('dialog.task.due_14')}</option>
                <option value={30}>{t('dialog.task.due_30')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="text-xs font-medium text-slate-700">
          {t('dialog.notes_label')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          placeholder={t('dialog.notes_placeholder')}
        />
      </div>
    </Modal>
  )
}
