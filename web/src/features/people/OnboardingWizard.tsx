import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Boxes,
  Check,
  KeyRound,
  Package,
  UserPlus,
  AlertTriangle,
} from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { useLicensesStore } from '@/features/licenses/useLicensesStore'
import { usePeopleStore } from './usePeopleStore'
import { MOCK_PACKAGES } from './mockPeople'
import { resolveOnboarding, summarizeResolution } from './onboarding'
import { cn } from '@/lib/cn'
import type { OnboardingPackage, PersonStatus } from './types'

type Step = 'person' | 'package' | 'preview' | 'done'

const inputCls =
  'mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'

export function OnboardingWizard({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const peopleStore = usePeopleStore()
  const assetStore = useAssetStore()
  const licenseStore = useLicensesStore()
  const [step, setStep] = useState<Step>('person')
  const [personForm, setPersonForm] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    startDate: new Date().toISOString().slice(0, 10),
  })
  const [pkg, setPkg] = useState<OnboardingPackage | null>(null)
  const [result, setResult] = useState<{ created: number; seats: number; skipped: number } | null>(null)
  const [error, setError] = useState('')

  const resolved = useMemo(
    () =>
      pkg
        ? resolveOnboarding(pkg, assetStore.assets, licenseStore.licenses)
        : [],
    [pkg, assetStore.assets, licenseStore.licenses],
  )
  const summary = summarizeResolution(resolved)

  function next() {
    setError('')
    if (step === 'person') {
      if (!personForm.name.trim() || !personForm.email.trim()) {
        setError(t('asset_form.validation.required'))
        return
      }
      setStep('package')
    } else if (step === 'package') {
      if (!pkg) {
        setError(t('onboarding.no_package'))
        return
      }
      setStep('preview')
    } else if (step === 'preview') {
      execute()
    }
  }

  function back() {
    if (step === 'package') setStep('person')
    else if (step === 'preview') setStep('package')
  }

  function execute() {
    if (!pkg) return
    const person = peopleStore.createPerson({
      name: personForm.name.trim(),
      email: personForm.email.trim(),
      department: personForm.department.trim() || undefined,
      role: personForm.role.trim() || undefined,
      startDate: personForm.startDate || undefined,
      status: 'active' as PersonStatus,
    })

    let assetsCreated = 0
    let seatsAdded = 0
    const newLicenseIds: string[] = []
    const today = new Date().toISOString().slice(0, 10)

    for (const r of resolved) {
      if (r.kind === 'asset') {
        assetStore.assign(r.asset.id, {
          assigneeName: person.name,
          assigneeEmail: person.email,
          location: r.asset.location,
          assignedAt: today,
          notes: `Tildelt via onboarding (${pkg.name})`,
        })
        assetsCreated++
      } else if (r.kind === 'license') {
        licenseStore.updateLicense(r.license.id, {
          seatsUsed: r.license.seatsUsed + 1,
        })
        newLicenseIds.push(r.license.id)
        seatsAdded++
      }
    }
    if (newLicenseIds.length > 0) {
      peopleStore.setLicenseAssignments(person.id, newLicenseIds)
    }

    setResult({
      created: assetsCreated,
      seats: seatsAdded,
      skipped: summary.missing,
    })
    setStep('done')
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('onboarding.title')}
      description={
        step === 'done'
          ? t('onboarding.done_subtitle')
          : t(`onboarding.step.${step}`)
      }
      footer={
        step === 'done' ? (
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
              onClick={step === 'person' ? onClose : back}
              className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50"
            >
              {step === 'person' ? t('common.cancel') : t('common.back')}
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {step === 'preview' ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  {t('onboarding.execute')}
                </>
              ) : (
                <>
                  {t('common.next')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </>
        )
      }
    >
      <Stepper step={step} />

      {step === 'person' && (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('people_page.field.name')}</Label>
              <input
                type="text"
                value={personForm.name}
                onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <Label>{t('people_page.field.email')}</Label>
              <input
                type="email"
                value={personForm.email}
                onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('people_page.field.department')}</Label>
              <input
                type="text"
                value={personForm.department}
                onChange={(e) => setPersonForm({ ...personForm, department: e.target.value })}
                placeholder={t('people_page.field.department_placeholder')}
                className={inputCls}
              />
            </div>
            <div>
              <Label>{t('people_page.field.role')}</Label>
              <input
                type="text"
                value={personForm.role}
                onChange={(e) => setPersonForm({ ...personForm, role: e.target.value })}
                placeholder={t('people_page.field.role_placeholder')}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <Label>{t('people_page.field.start_date')}</Label>
            <input
              type="date"
              value={personForm.startDate}
              onChange={(e) => setPersonForm({ ...personForm, startDate: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {step === 'package' && (
        <div className="mt-5 space-y-2">
          {MOCK_PACKAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPkg(p)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                pkg?.id === p.id
                  ? 'border-brand-500 bg-brand-400/10'
                  : 'border-slate-800 bg-slate-900 hover:bg-slate-800/50',
              )}
            >
              <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-100">{p.name}</p>
                {p.description && (
                  <p className="text-xs text-slate-500">{p.description}</p>
                )}
                <p className="mt-1.5 text-[11px] text-slate-500 tabular-nums">
                  {p.items.length} {t('onboarding.items_count')}
                </p>
              </div>
              {pkg?.id === p.id && (
                <Check className="h-4 w-4 text-brand-400" />
              )}
            </button>
          ))}
        </div>
      )}

      {step === 'preview' && pkg && (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard icon={Boxes} label={t('onboarding.summary_assets')} value={summary.assets} tone="emerald" />
            <SummaryCard icon={KeyRound} label={t('onboarding.summary_licenses')} value={summary.licenses} tone="emerald" />
            <SummaryCard icon={AlertTriangle} label={t('onboarding.summary_missing')} value={summary.missing} tone={summary.missing > 0 ? 'amber' : 'neutral'} />
          </div>
          <ul className="max-h-72 overflow-y-auto rounded-md border border-slate-800 divide-y divide-slate-800/70">
            {resolved.map((r, idx) => (
              <li key={idx} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                {r.kind === 'asset' && (
                  <>
                    <span className="flex items-center gap-2 text-slate-300">
                      <Boxes className="h-4 w-4 text-emerald-400" />
                      {r.asset.name}
                      <span className="font-mono text-xs text-slate-500">{r.asset.assetTag}</span>
                    </span>
                    <span className="text-[11px] text-emerald-300">{t('onboarding.row.will_assign')}</span>
                  </>
                )}
                {r.kind === 'asset_missing' && (
                  <>
                    <span className="flex items-center gap-2 text-slate-400">
                      <Boxes className="h-4 w-4 text-amber-400" />
                      {t(`asset.category.${r.category}`)}
                    </span>
                    <span className="text-[11px] text-amber-300">{t('onboarding.row.no_stock')}</span>
                  </>
                )}
                {r.kind === 'license' && (
                  <>
                    <span className="flex items-center gap-2 text-slate-300">
                      <KeyRound className="h-4 w-4 text-emerald-400" />
                      {r.license.name}
                    </span>
                    <span className="text-[11px] text-emerald-300">
                      {t('onboarding.row.seat_taken', {
                        used: r.license.seatsUsed + 1,
                        total: r.license.seatsTotal,
                      })}
                    </span>
                  </>
                )}
                {r.kind === 'license_full' && (
                  <>
                    <span className="flex items-center gap-2 text-slate-400">
                      <KeyRound className="h-4 w-4 text-rose-400" />
                      {r.license.name}
                    </span>
                    <span className="text-[11px] text-rose-300">{t('onboarding.row.license_full')}</span>
                  </>
                )}
                {r.kind === 'license_missing' && (
                  <>
                    <span className="flex items-center gap-2 text-slate-400">
                      <KeyRound className="h-4 w-4 text-slate-500" />
                      {r.licenseId}
                    </span>
                    <span className="text-[11px] text-slate-500">{t('onboarding.row.license_missing')}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 'done' && result && (
        <div className="mt-5 flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <Check className="h-5 w-5 flex-shrink-0" />
          <p>
            {t('onboarding.summary_success', result)}
          </p>
        </div>
      )}

      {error && step !== 'done' && (
        <p className="mt-3 text-xs text-rose-400">{error}</p>
      )}
    </Modal>
  )
}

const STEPS: Step[] = ['person', 'package', 'preview']

function Stepper({ step }: { step: Step }) {
  const { t } = useTranslation()
  if (step === 'done') return null
  const currentIdx = STEPS.indexOf(step)
  return (
    <ol className="flex items-center gap-2 text-[11px]">
      {STEPS.map((s, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums',
                done && 'bg-brand-600 text-white',
                active && 'bg-brand-400/20 text-brand-300 ring-1 ring-brand-400',
                !done && !active && 'bg-slate-800 text-slate-500',
              )}
            >
              {done ? <Check className="h-3 w-3" /> : idx + 1}
            </span>
            <span className={cn('whitespace-nowrap', active ? 'text-brand-300' : 'text-slate-500')}>
              {t(`onboarding.step.${s}`)}
            </span>
            {idx < STEPS.length - 1 && (
              <span className="ml-1 h-px flex-1 bg-slate-800" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-slate-300">{children}</label>
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Check
  label: string
  value: number
  tone: 'emerald' | 'amber' | 'neutral'
}) {
  const cls = {
    emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
    neutral: 'bg-slate-800 text-slate-400 ring-slate-700',
  }[tone]
  return (
    <div className={cn('rounded-lg p-3 ring-1 ring-inset', cls)}>
      <Icon className="h-4 w-4" />
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
    </div>
  )
}
