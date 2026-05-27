import { Check, AlertOctagon } from 'lucide-react'
import * as motion from 'motion/react-client'
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
      <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-950/40/70 px-4 py-3 text-sm text-rose-800">
        <AlertOctagon className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">
            {t('lifecycle.exception_state')}: {t(lifecycleStateKey(state))}
          </p>
          <p className="text-xs text-rose-300/80">
            {t('lifecycle.exception_description')}
          </p>
        </div>
      </div>
    )
  }

  // Progress percentage for the gradient bar — fills to the midpoint of the
  // active step rather than the start, so the current step visually "owns"
  // its segment.
  const totalSteps = PIPELINE_STAGES.length
  const progressPct =
    currentIdx >= 0
      ? Math.min(100, ((currentIdx + 0.5) / totalSteps) * 100)
      : 0

  return (
    <div className="relative">
      {/* Background track */}
      <div className="absolute top-4 right-4 left-4 h-0.5 rounded-full bg-slate-700" />
      {/* Animated gradient progress */}
      <motion.div
        className="absolute top-4 left-4 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
        initial={{ width: 0 }}
        animate={{ width: `calc(${progressPct}% - 32px)` }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      />
      <ol className="relative flex w-full items-start justify-between">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isComplete = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isInCurrentStageGroup = stage.states.includes(state)
          const currentLabel = isInCurrentStageGroup
            ? t(lifecycleStateKey(state))
            : t(pipelineStageKey(stage.key))

          return (
            <li key={stage.key} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: idx * 0.04,
                  type: 'spring',
                  stiffness: 380,
                  damping: 26,
                }}
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors',
                  isComplete && 'bg-brand-600 text-white ring-2 ring-brand-600',
                  isCurrent &&
                    'bg-slate-900 text-brand-300 ring-2 ring-brand-500 shadow-[0_0_0_4px_rgb(99_102_241_/_0.12)]',
                  !isComplete &&
                    !isCurrent &&
                    'bg-slate-900 text-slate-500 ring-2 ring-slate-700',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
              </motion.div>
              <span
                className={cn(
                  'mt-2 text-center text-xs whitespace-nowrap',
                  isCurrent
                    ? 'font-medium text-brand-300'
                    : isComplete
                      ? 'text-slate-300'
                      : 'text-slate-500',
                )}
              >
                {currentLabel}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
