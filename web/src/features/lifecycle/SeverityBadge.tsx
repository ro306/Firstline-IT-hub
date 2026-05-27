import { cn } from '@/lib/cn'
import { SEVERITY_BADGE, severityKey } from './expirations'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Severity } from './types'

// Glow shadow on warning/urgent/expired so they catch the eye even in a
// dense list. Info stays flat — it's the "everything's fine" state.
const SEVERITY_GLOW: Record<Severity, string> = {
  info: '',
  warning: 'shadow-[0_0_0_3px_rgb(245_158_11_/_0.08)]',
  urgent: 'shadow-[0_0_0_3px_rgb(249_115_22_/_0.12)]',
  expired: 'shadow-[0_0_0_3px_rgb(244_63_94_/_0.12)]',
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        SEVERITY_BADGE[severity],
        SEVERITY_GLOW[severity],
      )}
    >
      {t(severityKey(severity))}
    </span>
  )
}
