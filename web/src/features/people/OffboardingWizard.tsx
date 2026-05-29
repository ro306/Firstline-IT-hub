import { UserMinus, AlertTriangle, KeyRound, Boxes, Check } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { useLicensesStore } from '@/features/licenses/useLicensesStore'
import { usePeopleStore } from './usePeopleStore'
import { assetsAssignedTo } from './onboarding'
import { useState } from 'react'
import type { Person } from './types'

export function OffboardingWizard({
  person,
  onClose,
}: {
  person: Person
  onClose: () => void
}) {
  const { t } = useTranslation()
  const peopleStore = usePeopleStore()
  const assetStore = useAssetStore()
  const licenseStore = useLicensesStore()
  const [done, setDone] = useState<{ returned: number; released: number } | null>(null)

  const assets = assetsAssignedTo(person, assetStore.assets)
  const licenses = licenseStore.licenses.filter((l) =>
    person.assignedLicenseIds.includes(l.id),
  )

  function execute() {
    const today = new Date().toISOString().slice(0, 10)
    let returned = 0
    let released = 0
    for (const a of assets) {
      assetStore.returnAssignment(a.id, `Offboarding af ${person.name}`)
      returned++
    }
    for (const l of licenses) {
      licenseStore.updateLicense(l.id, {
        seatsUsed: Math.max(0, l.seatsUsed - 1),
      })
      released++
    }
    peopleStore.updatePerson(person.id, {
      status: 'inactive',
      endDate: today,
      assignedLicenseIds: [],
    })
    setDone({ returned, released })
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('offboarding.title')}
      description={person.name}
      footer={
        done ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('common.close')}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={execute}
              className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              <UserMinus className="h-4 w-4" />
              {t('offboarding.execute')}
            </button>
          </>
        )
      }
    >
      {done ? (
        <div className="flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <Check className="h-5 w-5 flex-shrink-0" />
          <p>{t('offboarding.summary_success', done)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-950/40 p-3 text-sm text-amber-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{t('offboarding.warning', { name: person.name })}</p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              {t('offboarding.assets_heading')} ({assets.length})
            </p>
            {assets.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                {t('offboarding.no_assets')}
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-800/70 rounded-md border border-slate-800">
                {assets.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <Boxes className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-300">{a.name}</span>
                    <span className="font-mono text-xs text-slate-500">{a.assetTag}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              {t('offboarding.licenses_heading')} ({licenses.length})
            </p>
            {licenses.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                {t('offboarding.no_licenses')}
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-800/70 rounded-md border border-slate-800">
                {licenses.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-300">{l.name}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-500">{l.vendor}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
