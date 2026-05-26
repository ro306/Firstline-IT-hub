import { Check, AlertOctagon } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  PIPELINE_STAGES,
  LIFECYCLE_STATE_CONFIG,
  getCurrentStageIndex,
  lifecycleStateKey,
  pipelineStageKey,
} from './lifecycle'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { AssetLifecycleState } from './types'

export function LifecycleStepper({ state }: { state: AssetLifecycleState }) {
  const { t } = useTranslation()
  const cfg = LIFECYCLE_STATE_CONFIG[state]
  const currentIdx = getCurrentStageIndex(state)
  const isOffFlow = cfg.stage === null

  if (isOffFlow) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        <AlertOctagon className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">
            {t('lifecycle.exception_state')}: {t(lifecycleStateKey(state))}
          </p>
          <p className="text-xs text-rose-700/80">
            {t('lifecycle.exception_description')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ol className="flex w-full items-center">
      {PIPELINE_STAGES.map((stage, idx) => {
        const isComplete = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isLast = idx === PIPELINE_STAGES.length - 1
        const isInCurrentStageGroup = stage.states.includes(state)
        const currentLabel = isInCurrentStageGroup
          ? t(lifecycleStateKey(state))
          : t(pipelineStageKey(stage.key))

        return (
          <li
            key={stage.key}
            className={cn(
              'flex items-center',
              !isLast && 'flex-1',
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1',
                  isComplete &&
                    'bg-brand-600 text-white ring-brand-600',
                  isCurrent &&
                    'bg-brand-50 text-brand-700 ring-brand-600',
                  !isComplete &&
                    !isCurrent &&
                    'bg-white text-slate-400 ring-slate-200',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={cn(
                  'mt-2 text-center text-xs whitespace-nowrap',
                  isCurrent
                    ? 'font-medium text-brand-700'
                    : isComplete
                      ? 'text-slate-600'
                      : 'text-slate-400',
                )}
              >
                {currentLabel}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  '-mt-6 h-0.5 flex-1',
                  isComplete ? 'bg-brand-600' : 'bg-slate-200',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
