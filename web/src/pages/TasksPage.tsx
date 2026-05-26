import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useAlertStore } from '@/features/lifecycle/useAlertStore'
import { formatDate } from '@/features/assets/finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { cn } from '@/lib/cn'

export function TasksPage() {
  const { t } = useTranslation()
  const store = useAlertStore()

  return (
    <div>
      <PageHeader
        title={t('tasks_page.title')}
        description={t('tasks_page.description')}
      />

      <div className="rounded-lg border border-slate-200 bg-white">
        {store.tasks.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('tasks_page.empty_prefix')}{' '}
            <Link to="/renewals" className="text-brand-700 underline">
              {t('tasks_page.empty_link')}
            </Link>{' '}
            {t('tasks_page.empty_suffix')}
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
                        ? t('tasks_page.reopen_aria')
                        : t('tasks_page.complete_aria')
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
                      {t('tasks_page.assigned_to', {
                        name: task.assigneeName,
                      })}{' '}
                      ·{' '}
                      {t('tasks_page.due', {
                        date: formatDate(task.dueAt),
                      })}{' '}
                      <Link
                        to={`/assets/${task.assetId}`}
                        className="ml-1 text-brand-700 hover:underline"
                      >
                        {t('tasks_page.view_asset')}
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
    </div>
  )
}
