import { ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react'
import { daysUntil, formatDate } from './finance'
import type { AssetWarranty, WarrantyKind } from './types'

const KIND_LABEL: Record<WarrantyKind, string> = {
  manufacturer: 'Manufacturer warranty',
  extended: 'Extended warranty',
  service_contract: 'Service contract',
  accidental_damage: 'Accidental damage cover',
}

function statusFor(w: AssetWarranty) {
  const days = daysUntil(w.endsAt)
  if (days < 0)
    return {
      label: 'Expired',
      tone: 'text-rose-700 bg-rose-50 ring-rose-600/20',
      Icon: ShieldOff,
    }
  if (days <= 60)
    return {
      label: `Ends in ${days}d`,
      tone: 'text-amber-700 bg-amber-50 ring-amber-600/20',
      Icon: ShieldAlert,
    }
  return {
    label: 'Active',
    tone: 'text-emerald-700 bg-emerald-50 ring-emerald-600/20',
    Icon: ShieldCheck,
  }
}

export function WarrantyList({ warranties }: { warranties: AssetWarranty[] }) {
  if (warranties.length === 0) {
    return <p className="text-sm text-slate-500">No warranties on file.</p>
  }

  return (
    <ul className="space-y-3">
      {warranties.map((w) => {
        const status = statusFor(w)
        const { Icon } = status
        return (
          <li
            key={w.id}
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {KIND_LABEL[w.kind]}
                </p>
                <p className="text-xs text-slate-500">
                  {w.provider}
                  {w.reference && (
                    <span className="ml-2 font-mono">{w.reference}</span>
                  )}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.tone}`}
              >
                <Icon className="h-3 w-3" />
                {status.label}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Starts</p>
                <p className="text-slate-900">{formatDate(w.startsAt)}</p>
              </div>
              <div>
                <p className="text-slate-500">Ends</p>
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
