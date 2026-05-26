import { cn } from '@/lib/cn'
import { SEVERITY_BADGE, SEVERITY_LABEL } from './expirations'
import type { Severity } from './types'

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        SEVERITY_BADGE[severity],
      )}
    >
      {SEVERITY_LABEL[severity]}
    </span>
  )
}
