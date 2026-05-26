import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Mail,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SeverityBadge } from '@/features/lifecycle/SeverityBadge'
import { kindKey } from '@/features/lifecycle/expirations'
import { DEFAULT_WORKFLOW_RULES } from '@/features/lifecycle/mockRules'
import { useAlertStore } from '@/features/lifecycle/useAlertStore'
import { formatDate } from '@/features/assets/finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { TranslateFn } from '@/lib/i18n/i18nContext'
import type {
  WorkflowAction,
  WorkflowActionType,
  ExpirationKind,
} from '@/features/lifecycle/types'
import { cn } from '@/lib/cn'

type Tab = 'rules' | 'tasks'

const ACTION_ICONS: Record<WorkflowActionType, typeof Bell> = {
  notify_in_app: Bell,
  notify_email: Mail,
  create_task: ClipboardList,
  mark_urgent: AlertTriangle,
}

function thresholdLabel(days: number, t: TranslateFn): string {
  if (days > 0) return t('workflows.rule.fires_before', { days })
  if (days === 0) return t('workflows.rule.fires_on_day')
  return t('workflows.rule.fires_after', { days: Math.abs(days) })
}

function ActionPill({ action }: { action: WorkflowAction }) {
  const { t } = useTranslation()
  const Icon = ACTION_ICONS[action.type]
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      <Icon className="h-3 w-3" />
      {t(`workflows.action.${action.type}`)}
      {action.target && (
        <span className="text-slate-500">· {action.target}</span>
      )}
    </span>
  )
}

export function WorkflowsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('rules')
  const store = useAlertStore()

  const byKind: Record<ExpirationKind, typeof DEFAULT_WORKFLOW_RULES> = {
    warranty: [],
    lease: [],
    depreciation_eol: [],
    recurring_check: [],
  }
  for (const rule of DEFAULT_WORKFLOW_RULES) {
    byKind[rule.appliesTo].push(rule)
  }
  for (const key of Object.keys(byKind) as ExpirationKind[]) {
    byKind[key].sort((a, b) => b.thresholdDays - a.thresholdDays)
  }

  const activeTasks = store.tasks.filter((t) => t.status !== 'done').length

  return (
    <div>
      <PageHeader
        title={t('workflows.title')}
        description={t('workflows.description')}
        actions={
          <Link
            to="/renewals"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('workflows.view_renewals')}
          </Link>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        <TabButton active={tab === 'rules'} onClick={() => setTab('rules')}>
          {t('workflows.tab.rules', { count: DEFAULT_WORKFLOW_RULES.length })}
        </TabButton>
        <TabButton active={tab === 'tasks'} onClick={() => setTab('tasks')}>
          {t('workflows.tab.tasks', { count: activeTasks })}
        </TabButton>
      </div>

      {tab === 'rules' && (
        <div className="space-y-6">
          {(Object.entries(byKind) as [ExpirationKind, typeof DEFAULT_WORKFLOW_RULES][])
            .map(([kind, rules]) => (
              <section key={kind} className="rounded-lg border border-slate-200 bg-white">
                <header className="border-b border-slate-200 px-5 py-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t(kindKey(kind))}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {rules.length === 1
                      ? t('workflows.rules_count_one')
                      : t('workflows.rules_count_other', { count: rules.length })}
                  </p>
                </header>
                <ul className="divide-y divide-slate-100">
                  {rules.map((rule) => (
                    <li
                      key={rule.id}
                      className="flex flex-wrap items-center gap-4 px-5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            {t(`workflows.rule_name.${rule.id}`)}
                          </span>
                          <SeverityBadge severity={rule.severity} />
                          {!rule.enabled && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                              {t('workflows.rule.disabled')}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {thresholdLabel(rule.thresholdDays, t)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rule.actions.map((action, idx) => (
                          <ActionPill key={idx} action={action} />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

          <p className="text-xs text-slate-500 italic">
            {t('workflows.rules_readonly_note')}
          </p>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="rounded-lg border border-slate-200 bg-white">
          {store.tasks.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              {t('workflows.tasks.empty_prefix')}{' '}
              <Link to="/renewals" className="text-brand-700 underline">
                {t('workflows.tasks.empty_link')}
              </Link>{' '}
              {t('workflows.tasks.empty_suffix')}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...store.tasks]
                .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
                .map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center gap-4 p-4"
                  >
                    <button
                      type="button"
                      onClick={() => store.completeTask(task.id)}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2',
                        task.status === 'done'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 hover:border-brand-500',
                      )}
                      aria-label={
                        task.status === 'done'
                          ? t('workflows.tasks.reopen_aria')
                          : t('workflows.tasks.complete_aria')
                      }
                    >
                      {task.status === 'done' && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          task.status === 'done'
                            ? 'text-slate-400 line-through'
                            : 'text-slate-900',
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t('workflows.tasks.assigned_to', {
                          name: task.assigneeName,
                        })}{' '}
                        ·{' '}
                        {t('workflows.tasks.due', {
                          date: formatDate(task.dueAt),
                        })}{' '}
                        <Link
                          to={`/assets/${task.assetId}`}
                          className="ml-1 text-brand-700 hover:underline"
                        >
                          {t('workflows.tasks.view_asset')}
                        </Link>
                      </p>
                      {task.description && (
                        <p className="mt-1 text-xs text-slate-600 italic">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-brand-600 text-brand-700'
          : 'border-transparent text-slate-500 hover:text-slate-700',
      )}
    >
      {children}
    </button>
  )
}
