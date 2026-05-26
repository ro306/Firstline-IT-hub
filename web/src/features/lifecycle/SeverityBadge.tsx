import { cn } from '@/lib/cn'
import { SEVERITY_BADGE, severityKey } from './expirations'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Severity } from './types'

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        SEVERITY_BADGE[severity],
      )}
    >
      {t(severityKey(severity))}
    </span>
  )
}
