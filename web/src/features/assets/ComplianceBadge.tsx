import { cn } from '@/lib/cn'
import { useTranslation } from '@/lib/i18n/useTranslation'
import {
  COMPLIANCE_BADGE,
  PATCH_BADGE,
  complianceStatusKey,
  patchStatusKey,
} from './security'
import type { ComplianceStatus, PatchStatus } from './types'

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        COMPLIANCE_BADGE[status],
      )}
    >
      {t(complianceStatusKey(status))}
    </span>
  )
}

export function PatchBadge({ status }: { status: PatchStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        PATCH_BADGE[status],
      )}
    >
      {t(patchStatusKey(status))}
    </span>
  )
}
