import { CheckCircle2, Pencil, Trash2, ClipboardCheck } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { formatDate, daysUntil } from './finance'
import type { RecurringCheck } from './types'

export function RecurringCheckList({
  checks,
  onEdit,
  onDelete,
  onComplete,
}: {
  checks: RecurringCheck[]
  onEdit?: (c: RecurringCheck) => void
  onDelete?: (c: RecurringCheck) => void
  onComplete?: (c: RecurringCheck) => void
}) {
  const { t } = useTranslation()

  if (checks.length === 0) {
    return (
      <p className="text-sm text-slate-500">{t('asset_detail.no_checks')}</p>
    )
  }

  return (
    <ul className="space-y-2">
      {checks.map((c) => {
        const due = daysUntil(c.nextDueAt)
        const overdue = due < 0
        const soon = due >= 0 && due <= 30
        return (
          <li
            key={c.id}
            className="group flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/70 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-elevated"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <ClipboardCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{c.label}</p>
                <p className="text-xs text-slate-500">
                  {t(`recurring_check_kind.${c.kind}`)} ·{' '}
                  {t('asset_detail.check_interval', { n: c.intervalMonths })}
                </p>
                <p className="mt-1 text-xs">
                  <span
                    className={
                      overdue
                        ? 'font-medium text-rose-700'
                        : soon
                          ? 'font-medium text-amber-700'
                          : 'text-slate-600'
                    }
                  >
                    {t('asset_detail.check_due', { date: formatDate(c.nextDueAt) })}
                  </span>
                  {c.lastCompletedAt && (
                    <span className="ml-2 text-slate-400">
                      ·{' '}
                      {t('asset_detail.check_completed', {
                        date: formatDate(c.lastCompletedAt),
                      })}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onComplete && (
                <button
                  type="button"
                  onClick={() => onComplete(c)}
                  aria-label={t('check_form.complete')}
                  title={t('check_form.complete')}
                  className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(c)}
                  aria-label={t('asset_actions.edit')}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  aria-label={t('asset_actions.delete')}
                  className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
