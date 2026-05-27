import { cn } from '@/lib/cn'
import { LIFECYCLE_STATE_CONFIG, lifecycleStateKey } from './lifecycle'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { AssetLifecycleState } from './types'

export function StatusBadge({ state }: { state: AssetLifecycleState }) {
  const { t } = useTranslation()
  const cfg = LIFECYCLE_STATE_CONFIG[state]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        cfg.badge,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {t(lifecycleStateKey(state))}
    </span>
  )
}
