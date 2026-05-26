import { formatDate } from './finance'
import type { AssetAssignment } from './types'

export function AssignmentHistory({
  assignments,
}: {
  assignments: AssetAssignment[]
}) {
  if (assignments.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Never assigned to anyone.
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
            <th className="pb-2">Assignee</th>
            <th className="pb-2">Location</th>
            <th className="pb-2">From</th>
            <th className="pb-2">Until</th>
            <th className="pb-2">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((a) => (
            <tr key={a.id}>
              <td className="py-2">
                <p className="font-medium text-slate-900">{a.assigneeName}</p>
                {a.assigneeEmail && (
                  <p className="text-xs text-slate-500">{a.assigneeEmail}</p>
                )}
              </td>
              <td className="py-2 text-slate-700">{a.location}</td>
              <td className="py-2 text-slate-700">{formatDate(a.assignedAt)}</td>
              <td className="py-2 text-slate-700">
                {a.returnedAt ? (
                  formatDate(a.returnedAt)
                ) : (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Current
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
