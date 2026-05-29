import { useMemo, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { usePeopleStore } from '@/features/people/usePeopleStore'
import { useAssetStore } from '@/features/assets/useAssetStore'
import {
  PersonDialog,
  DeletePersonDialog,
} from '@/features/people/PersonDialog'
import { OnboardingWizard } from '@/features/people/OnboardingWizard'
import { OffboardingWizard } from '@/features/people/OffboardingWizard'
import { assetsAssignedTo } from '@/features/people/onboarding'
import { formatDate } from '@/features/assets/finance'
import { cn } from '@/lib/cn'
import type { Person, PersonStatus } from '@/features/people/types'

type Filter = 'all' | PersonStatus

const FILTERS: Filter[] = ['all', 'active', 'onboarding', 'offboarding', 'inactive']

const STATUS_BADGE: Record<PersonStatus, string> = {
  active: 'bg-emerald-950/40 text-emerald-300 ring-emerald-600/20',
  onboarding: 'bg-sky-950/40 text-sky-300 ring-sky-600/20',
  offboarding: 'bg-amber-950/40 text-amber-300 ring-amber-600/20',
  inactive: 'bg-slate-800 text-slate-500 ring-slate-500/20',
}

export function PeoplePage() {
  const { t } = useTranslation()
  const store = usePeopleStore()
  const assetStore = useAssetStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Person | undefined>(undefined)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Person | null>(null)
  const [onboarding, setOnboarding] = useState(false)
  const [offboarding, setOffboarding] = useState<Person | null>(null)

  const visible = useMemo(() => {
    if (filter === 'all') return store.people
    return store.people.filter((p) => p.status === filter)
  }, [store.people, filter])

  return (
    <div>
      <PageHeader
        title={t('people_page.title')}
        description={t('people_page.description')}
        actions={
          <>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
            >
              <Plus className="h-4 w-4" />
              {t('people_page.new_person')}
            </button>
            <button
              type="button"
              onClick={() => setOnboarding(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-[0_4px_12px_-2px_rgb(34_211_238_/_0.35)] hover:bg-brand-700"
            >
              <UserPlus className="h-4 w-4" />
              {t('people_page.onboard')}
            </button>
          </>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900 shadow-elevated">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? 'rounded-md bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-300'
                  : 'rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-800'
              }
            >
              {f === 'all' ? t('common.all') : t(`people_page.status.${f}`)}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('people_page.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/40 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">{t('people_page.table.name')}</th>
                  <th className="px-4 py-3">{t('people_page.table.department')}</th>
                  <th className="px-4 py-3">{t('people_page.table.status')}</th>
                  <th className="px-4 py-3">{t('people_page.table.assets')}</th>
                  <th className="px-4 py-3">{t('people_page.table.licenses')}</th>
                  <th className="px-4 py-3">{t('people_page.table.start_date')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {visible.map((p) => {
                  const assetCount = assetsAssignedTo(p, assetStore.assets).length
                  return (
                    <tr key={p.id} className="group transition-colors hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/25 to-brand-400/15 text-xs font-semibold text-brand-300 ring-1 ring-inset ring-brand-400/20">
                            {p.name
                              .split(' ')
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-100">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {p.department ?? '—'}
                        {p.role && (
                          <span className="block text-xs text-slate-500">{p.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                            STATUS_BADGE[p.status],
                          )}
                        >
                          {t(`people_page.status.${p.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-slate-300">
                        {assetCount}
                      </td>
                      <td className="px-4 py-3 text-sm tabular-nums text-slate-300">
                        {p.assignedLicenseIds.length}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {formatDate(p.startDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {p.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => setOffboarding(p)}
                              aria-label={t('people_page.offboard')}
                              title={t('people_page.offboard')}
                              className="rounded-md p-1.5 text-amber-400 hover:bg-amber-950/40"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditing(p)}
                            aria-label={t('asset_actions.edit')}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(p)}
                            aria-label={t('asset_actions.delete')}
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <PersonDialog onClose={() => setCreating(false)} />}
      {editing && (
        <PersonDialog person={editing} onClose={() => setEditing(undefined)} />
      )}
      {deleting && (
        <DeletePersonDialog person={deleting} onClose={() => setDeleting(null)} />
      )}
      {onboarding && <OnboardingWizard onClose={() => setOnboarding(false)} />}
      {offboarding && (
        <OffboardingWizard
          person={offboarding}
          onClose={() => setOffboarding(null)}
        />
      )}
    </div>
  )
}
