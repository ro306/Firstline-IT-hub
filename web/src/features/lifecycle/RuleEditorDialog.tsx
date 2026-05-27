import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useRulesStore } from './useRulesStore'
import { kindKey, severityKey, EXPIRATION_KINDS, SEVERITIES } from './expirations'
import type {
  ExpirationKind,
  Severity,
  WorkflowAction,
  WorkflowActionType,
  WorkflowRule,
} from './types'

const ACTION_TYPES: WorkflowActionType[] = [
  'notify_in_app',
  'notify_email',
  'create_task',
  'mark_urgent',
]

type FormState = {
  name: string
  appliesTo: ExpirationKind
  thresholdDays: number
  severity: Severity
  enabled: boolean
  actions: WorkflowAction[]
}

const EMPTY: FormState = {
  name: '',
  appliesTo: 'warranty',
  thresholdDays: 30,
  severity: 'warning',
  enabled: true,
  actions: [{ type: 'notify_in_app' }],
}

function ruleToForm(rule: WorkflowRule): FormState {
  return {
    name: rule.name,
    appliesTo: rule.appliesTo,
    thresholdDays: rule.thresholdDays,
    severity: rule.severity,
    enabled: rule.enabled,
    actions: rule.actions.length > 0 ? rule.actions : [{ type: 'notify_in_app' }],
  }
}

export function RuleEditorDialog({
  rule,
  onClose,
}: {
  rule?: WorkflowRule
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useRulesStore()
  const editing = !!rule

  const [form, setForm] = useState<FormState>(() =>
    rule ? ruleToForm(rule) : EMPTY,
  )
  const [errors, setErrors] = useState<{ name?: string; actions?: string }>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setAction(idx: number, patch: Partial<WorkflowAction>) {
    setForm((prev) => ({
      ...prev,
      actions: prev.actions.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }))
  }

  function addAction() {
    setForm((prev) => ({
      ...prev,
      actions: [...prev.actions, { type: 'notify_in_app' }],
    }))
  }

  function removeAction(idx: number) {
    setForm((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== idx),
    }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = t('rule_editor.validation.required')
    if (form.actions.length === 0)
      next.actions = t('rule_editor.validation.no_actions')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const payload = {
      name: form.name.trim(),
      enabled: form.enabled,
      appliesTo: form.appliesTo,
      thresholdDays: form.thresholdDays,
      severity: form.severity,
      actions: form.actions,
    }
    if (editing && rule) {
      store.updateRule(rule.id, payload)
    } else {
      store.createRule(payload)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={
        editing ? t('rule_editor.edit_title') : t('rule_editor.create_title')
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {editing ? t('rule_editor.save') : t('rule_editor.create_submit')}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title={t('rule_editor.section_basics')}>
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('rule_editor.field.name')}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={t('rule_editor.field.name_placeholder')}
              className={inputCls(!!errors.name)}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => set('enabled', e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 text-brand-400 focus:ring-brand-500/30"
            />
            <span className="text-sm text-slate-300">
              {t('rule_editor.field.enabled')}
            </span>
          </label>
        </Section>

        <Section title={t('rule_editor.section_trigger')}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300">
                {t('rule_editor.field.applies_to')}
              </label>
              <select
                value={form.appliesTo}
                onChange={(e) =>
                  set('appliesTo', e.target.value as ExpirationKind)
                }
                className={inputCls(false)}
              >
                {EXPIRATION_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(kindKey(k))}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">
                {t('rule_editor.field.threshold_days')}
              </label>
              <input
                type="number"
                value={form.thresholdDays}
                onChange={(e) => set('thresholdDays', Number(e.target.value))}
                className={inputCls(false)}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {t('rule_editor.field.threshold_help')}
          </p>
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('rule_editor.field.severity')}
            </label>
            <div className="mt-1 flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('severity', s)}
                  className={
                    form.severity === s
                      ? 'rounded-md bg-brand-400/10 px-3 py-1.5 text-sm font-medium text-brand-300 ring-1 ring-brand-600/30'
                      : 'rounded-md border border-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900/50'
                  }
                >
                  {t(severityKey(s))}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title={t('rule_editor.section_actions')}>
          <div className="space-y-2">
            {form.actions.map((action, idx) => (
              <div
                key={idx}
                className="space-y-2 rounded-md border border-slate-800 bg-slate-900/50/40 p-3"
              >
                <div className="flex items-center gap-2">
                  <select
                    value={action.type}
                    onChange={(e) =>
                      setAction(idx, {
                        type: e.target.value as WorkflowActionType,
                        target: undefined,
                        taskTitle: undefined,
                      })
                    }
                    className="flex-1 rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  >
                    {ACTION_TYPES.map((typeKey) => (
                      <option key={typeKey} value={typeKey}>
                        {t(`rule_editor.action_kind.${typeKey}`)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAction(idx)}
                    aria-label={t('rule_editor.remove_action')}
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {action.type === 'notify_email' && (
                  <div>
                    <label className="text-xs text-slate-500">
                      {t('rule_editor.action_target.email')}
                    </label>
                    <input
                      type="email"
                      value={action.target ?? ''}
                      onChange={(e) =>
                        setAction(idx, { target: e.target.value || undefined })
                      }
                      placeholder={t('rule_editor.action_target.email_placeholder')}
                      className={inputCls(false)}
                    />
                  </div>
                )}
                {action.type === 'create_task' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-slate-500">
                        {t('rule_editor.action_target.role')}
                      </label>
                      <input
                        type="text"
                        value={action.target ?? ''}
                        onChange={(e) =>
                          setAction(idx, {
                            target: e.target.value || undefined,
                          })
                        }
                        placeholder={t('rule_editor.action_target.role_placeholder')}
                        className={inputCls(false)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">
                        {t('rule_editor.action_target.task_title')}
                      </label>
                      <input
                        type="text"
                        value={action.taskTitle ?? ''}
                        onChange={(e) =>
                          setAction(idx, {
                            taskTitle: e.target.value || undefined,
                          })
                        }
                        placeholder={t(
                          'rule_editor.action_target.task_title_placeholder',
                        )}
                        className={inputCls(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAction}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-700 px-3 py-2 text-sm text-slate-500 hover:bg-slate-900/50"
            >
              <Plus className="h-4 w-4" />
              {t('rule_editor.add_action')}
            </button>
            {errors.actions && (
              <p className="text-xs text-rose-600">{errors.actions}</p>
            )}
          </div>
        </Section>
      </div>
    </Modal>
  )
}

function inputCls(hasError: boolean): string {
  return [
    'mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none',
    hasError
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
      : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20',
  ].join(' ')
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
