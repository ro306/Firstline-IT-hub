import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import type { Asset } from './types'

export function AssignmentDialog({
  asset,
  onClose,
}: {
  asset: Asset
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState(asset.location)
  const [assignedAt, setAssignedAt] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) {
      setError(t('asset_form.validation.required'))
      return
    }
    store.assign(asset.id, {
      assigneeName: name.trim(),
      assigneeEmail: email.trim() || undefined,
      location: location.trim() || asset.location,
      assignedAt,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('assignment_form.assign_title')}
      description={asset.name}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('assignment_form.assign_submit')}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-700">
            {t('assignment_form.field.assignee_name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700">
            {t('assignment_form.field.assignee_email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700">
              {t('assignment_form.field.location')}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">
              {t('assignment_form.field.assigned_at')}
            </label>
            <input
              type="date"
              value={assignedAt}
              onChange={(e) => setAssignedAt(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700">
            {t('assignment_form.field.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  )
}

export function ReturnAssignmentDialog({
  asset,
  onClose,
}: {
  asset: Asset
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const [notes, setNotes] = useState('')
  if (!asset.currentAssignment) return null

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('assignment_form.return_title')}
      description={asset.name}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              store.returnAssignment(asset.id, notes.trim() || undefined)
              onClose()
            }}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('assignment_form.return_submit')}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>
            {t('assignment_form.return_warning', {
              name: asset.currentAssignment.assigneeName,
            })}
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700">
            {t('assignment_form.field.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  )
}

export function NoteDialog({
  asset,
  onClose,
}: {
  asset: Asset
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const [note, setNote] = useState('')

  function handleSubmit() {
    if (!note.trim()) return
    store.addNote(asset.id, note.trim())
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('note_form.title')}
      description={asset.name}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!note.trim()}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
          >
            {t('note_form.submit')}
          </button>
        </>
      }
    >
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder={t('note_form.placeholder')}
        autoFocus
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
      />
    </Modal>
  )
}
