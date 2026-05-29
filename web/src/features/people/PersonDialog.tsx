import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { usePeopleStore } from './usePeopleStore'
import type { Person, PersonStatus } from './types'

const STATUSES: PersonStatus[] = [
  'onboarding',
  'active',
  'offboarding',
  'inactive',
]

const inputCls =
  'mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'

export function PersonDialog({
  person,
  onClose,
}: {
  person?: Person
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = usePeopleStore()
  const editing = !!person
  const [form, setForm] = useState({
    name: person?.name ?? '',
    email: person?.email ?? '',
    department: person?.department ?? '',
    role: person?.role ?? '',
    startDate: person?.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: person?.endDate ?? '',
    status: person?.status ?? ('active' as PersonStatus),
    notes: person?.notes ?? '',
  })
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) {
      setError(t('asset_form.validation.required'))
      return
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim() || undefined,
      role: form.role.trim() || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    }
    if (editing && person) {
      store.updatePerson(person.id, payload)
    } else {
      store.createPerson(payload)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={
        editing
          ? t('people_page.form.edit_title')
          : t('people_page.form.create_title')
      }
      footer={
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
            onClick={handleSubmit}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {editing ? t('asset_form.save_submit') : t('common.confirm')}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('people_page.field.name')}</Label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('people_page.field.email')}</Label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('people_page.field.department')}</Label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder={t('people_page.field.department_placeholder')}
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('people_page.field.role')}</Label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder={t('people_page.field.role_placeholder')}
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>{t('people_page.field.status')}</Label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as PersonStatus })
              }
              className={inputCls}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`people_page.status.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>{t('people_page.field.start_date')}</Label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('people_page.field.end_date')}</Label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <Label>{t('people_page.field.notes')}</Label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    </Modal>
  )
}

export function DeletePersonDialog({
  person,
  onClose,
}: {
  person: Person
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = usePeopleStore()
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('people_page.delete_title')}
      footer={
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
            onClick={() => {
              store.deletePerson(person.id)
              onClose()
            }}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {t('common.delete')}
          </button>
        </>
      }
    >
      <div className="flex gap-3 rounded-md border border-rose-500/30 bg-rose-950/40 p-3 text-sm text-rose-300">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>{t('people_page.delete_warning', { name: person.name })}</p>
      </div>
    </Modal>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-slate-300">{children}</label>
}
