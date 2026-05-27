import { formatDate } from './finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { AssetAssignment } from './types'

export function AssignmentHistory({
  assignments,
}: {
  assignments: AssetAssignment[]
}) {
  const { t } = useTranslation()

  if (assignments.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {t('asset.history.no_assignments')}
      </p>
    )
  }

  const sorted = [...assignments].sort((a, b) =>
    b.assignedAt.localeCompare(a.assignedAt),
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs font-medium text-slate-500 uppercase">
          <tr>
            <th className="pb-2">{t('asset.assignment.assignee')}</th>
            <th className="pb-2">{t('asset.assignment.location')}</th>
            <th className="pb-2">{t('asset.assignment.from')}</th>
            <th className="pb-2">{t('asset.assignment.until')}</th>
            <th className="pb-2">{t('asset.assignment.notes')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {sorted.map((a) => (
            <tr key={a.id}>
              <td className="py-2">
                <p className="font-medium text-slate-100">{a.assigneeName}</p>
                {a.assigneeEmail && (
                  <p className="text-xs text-slate-500">{a.assigneeEmail}</p>
                )}
              </td>
              <td className="py-2 text-slate-300">{a.location}</td>
              <td className="py-2 text-slate-300">{formatDate(a.assignedAt)}</td>
              <td className="py-2 text-slate-300">
                {a.returnedAt ? (
                  formatDate(a.returnedAt)
                ) : (
                  <span className="inline-flex items-center rounded-full bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-600/20">
                    {t('asset.assignment.current')}
                  </span>
                )}
              </td>
              <td className="py-2 text-xs text-slate-500">{a.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
