import { ShieldCheck, ShieldAlert, ShieldOff, Pencil, Trash2 } from 'lucide-react'
import { daysUntil, formatDate } from './finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { TranslateFn } from '@/lib/i18n/i18nContext'
import type { AssetWarranty } from './types'

function statusFor(w: AssetWarranty, t: TranslateFn) {
  const days = daysUntil(w.endsAt)
  if (days < 0)
    return {
      label: t('asset.warranties.status.expired'),
      tone: 'text-rose-700 bg-rose-50 ring-rose-600/20',
      Icon: ShieldOff,
    }
  if (days <= 60)
    return {
      label: t('asset.warranties.status.ends_in', { n: days }),
      tone: 'text-amber-700 bg-amber-50 ring-amber-600/20',
      Icon: ShieldAlert,
    }
  return {
    label: t('asset.warranties.status.active'),
    tone: 'text-emerald-700 bg-emerald-50 ring-emerald-600/20',
    Icon: ShieldCheck,
  }
}

export function WarrantyList({
  warranties,
  onEdit,
  onDelete,
}: {
  warranties: AssetWarranty[]
  onEdit?: (w: AssetWarranty) => void
  onDelete?: (w: AssetWarranty) => void
}) {
  const { t } = useTranslation()

  if (warranties.length === 0) {
    return <p className="text-sm text-slate-500">{t('asset.warranties.none')}</p>
  }

  return (
    <ul className="space-y-3">
      {warranties.map((w) => {
        const status = statusFor(w, t)
        const { Icon } = status
        return (
          <li
            key={w.id}
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {t(`asset.warranties.kind.${w.kind}`)}
                </p>
                <p className="text-xs text-slate-500">
                  {w.provider}
                  {w.reference && (
                    <span className="ml-2 font-mono">{w.reference}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.tone}`}
                >
                  <Icon className="h-3 w-3" />
                  {status.label}
                </span>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(w)}
                    aria-label={t('asset_actions.edit')}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(w)}
                    aria-label={t('asset_actions.delete')}
                    className="rounded-md p-1 text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">{t('asset.warranties.starts')}</p>
                <p className="text-slate-900">{formatDate(w.startsAt)}</p>
              </div>
              <div>
                <p className="text-slate-500">{t('asset.warranties.ends')}</p>
                <p className="text-slate-900">{formatDate(w.endsAt)}</p>
              </div>
            </div>
            {w.coverageNotes && (
              <p className="mt-3 text-xs text-slate-600 italic">
                {w.coverageNotes}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
