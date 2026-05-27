import {
  ArrowRightLeft,
  UserPlus,
  UserMinus,
  Map,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Trash2,
  Package,
  RotateCcw,
} from 'lucide-react'
import {
  eventKindKey,
  lifecycleStateKey,
} from './lifecycle'
import { formatDateTime } from './finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { TranslateFn } from '@/lib/i18n/i18nContext'
import type {
  AssetLifecycleEvent,
  AssetLifecycleEventKind,
  AssetLifecycleState,
} from './types'

const ICONS: Record<AssetLifecycleEventKind, typeof ArrowRightLeft> = {
  state_changed: ArrowRightLeft,
  assigned: UserPlus,
  unassigned: UserMinus,
  moved: Map,
  maintenance_started: Wrench,
  maintenance_completed: Wrench,
  warranty_added: ShieldCheck,
  warranty_expired: ShieldAlert,
  lease_started: Package,
  lease_renewed: RotateCcw,
  lease_ended: Package,
  disposed: Trash2,
  note: FileText,
}

function renderEventDetail(
  event: AssetLifecycleEvent,
  t: TranslateFn,
): string | null {
  const p = event.payload
  if (!p) return null
  switch (event.kind) {
    case 'state_changed': {
      const from = p.from as AssetLifecycleState | undefined
      const to = p.to as AssetLifecycleState | undefined
      if (!from || !to) return null
      return `${t(lifecycleStateKey(from))} → ${t(lifecycleStateKey(to))}`
    }
    case 'assigned':
      return p.assignee ? `${t('asset.history.to_prefix')} ${p.assignee}` : null
    case 'unassigned':
      return p.from ? `${t('asset.history.from_prefix')} ${p.from}` : null
    case 'moved':
      return p.from && p.to ? `${p.from} → ${p.to}` : null
    case 'maintenance_started':
    case 'maintenance_completed':
      return [p.vendor, p.ticket].filter(Boolean).join(' · ')
    case 'lease_started':
    case 'lease_renewed':
    case 'lease_ended':
      return [p.vendor, p.contract].filter(Boolean).join(' · ')
    case 'disposed':
      return [p.method, p.recipient, p.certificate].filter(Boolean).join(' · ')
    default:
      return null
  }
}

export function LifecycleTimeline({
  events,
}: {
  events: AssetLifecycleEvent[]
}) {
  const { t } = useTranslation()

  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-500">{t('asset.history.no_events')}</p>
    )
  }

  const sorted = [...events].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  )

  return (
    <ol className="relative space-y-6 border-l border-slate-800 pl-6">
      {sorted.map((event) => {
        const Icon = ICONS[event.kind] ?? FileText
        const detail = renderEventDetail(event, t)
        return (
          <li key={event.id} className="relative">
            <span className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 ring-1 ring-slate-700">
              <Icon className="h-3.5 w-3.5 text-slate-500" />
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-slate-100">
                {t(eventKindKey(event.kind))}
                {detail && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    {detail}
                  </span>
                )}
              </p>
              <time className="text-xs text-slate-500">
                {formatDateTime(event.occurredAt)}
              </time>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {t('asset.history.by')} {event.actor}
            </p>
            {event.notes && (
              <p className="mt-1 rounded-md bg-slate-900/50 px-3 py-2 text-xs text-slate-500">
                {event.notes}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
