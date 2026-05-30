import { useState } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useRulesStore } from '@/features/lifecycle/useRulesStore'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { useAlertStore } from '@/features/lifecycle/useAlertStore'
import { useLicensesStore } from '@/features/licenses/useLicensesStore'
import { useTicketsStore } from '@/features/maintenance/useTicketsStore'
import { useBudgetsStore } from '@/features/budgets/useBudgetsStore'
import { RuleEditorDialog } from '@/features/lifecycle/RuleEditorDialog'
import { SeverityBadge } from '@/features/lifecycle/SeverityBadge'
import { kindKey } from '@/features/lifecycle/expirations'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { usePreferences } from '@/lib/usePreferences'
import { cn } from '@/lib/cn'
import type {
  ExpirationKind,
  WorkflowAction,
  WorkflowActionType,
  WorkflowRule,
} from '@/features/lifecycle/types'
import { Bell, Mail, ClipboardList } from 'lucide-react'

type Tab = 'general' | 'workflows' | 'budgets' | 'data'

export function SettingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('general')

  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <div className="mb-4 flex gap-1 border-b border-slate-800">
        <TabButton active={tab === 'general'} onClick={() => setTab('general')}>
          {t('settings.tab.general')}
        </TabButton>
        <TabButton
          active={tab === 'workflows'}
          onClick={() => setTab('workflows')}
        >
          {t('settings.tab.workflows')}
        </TabButton>
        <TabButton active={tab === 'budgets'} onClick={() => setTab('budgets')}>
          {t('settings.tab.budgets')}
        </TabButton>
        <TabButton active={tab === 'data'} onClick={() => setTab('data')}>
          {t('settings.tab.data')}
        </TabButton>
      </div>

      {tab === 'general' && <GeneralTab />}
      {tab === 'workflows' && <WorkflowsTab />}
      {tab === 'budgets' && <BudgetsTab />}
      {tab === 'data' && <DataTab />}
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
          ? 'border-brand-600 text-brand-300'
          : 'border-transparent text-slate-500 hover:text-slate-300',
      )}
    >
      {children}
    </button>
  )
}

// ───────────────────────── General tab ─────────────────────────

function GeneralTab() {
  const { t } = useTranslation()
  const { prefs, setPref } = usePreferences()
  return (
    <div className="space-y-4">
      <Card
        title={t('settings.general.language_title')}
        description={t('settings.general.language_description')}
      >
        <LanguageSwitcher />
      </Card>
      <Card
        title={t('settings.general.branding_title')}
        description={t('settings.general.branding_description')}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('settings.general.brand_name_label')}
            </label>
            <input
              type="text"
              value={prefs.brandTitle ?? t('nav.brand_title')}
              onChange={(e) => setPref('brandTitle', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('settings.general.brand_subtitle_label')}
            </label>
            <input
              type="text"
              value={prefs.brandSubtitle ?? t('nav.brand_subtitle')}
              onChange={(e) => setPref('brandSubtitle', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

// ───────────────────────── Workflows tab ─────────────────────────

const ACTION_ICONS: Record<WorkflowActionType, typeof Bell> = {
  notify_in_app: Bell,
  notify_email: Mail,
  create_task: ClipboardList,
  mark_urgent: AlertTriangle,
}

function ActionPill({ action }: { action: WorkflowAction }) {
  const { t } = useTranslation()
  const Icon = ACTION_ICONS[action.type]
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
      <Icon className="h-3 w-3" />
      {t(`rule_editor.action_kind.${action.type}`)}
      {action.target && (
        <span className="text-slate-500">· {action.target}</span>
      )}
    </span>
  )
}

function WorkflowsTab() {
  const { t } = useTranslation()
  const store = useRulesStore()
  const [editing, setEditing] = useState<WorkflowRule | undefined>(undefined)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<WorkflowRule | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const byKind: Record<ExpirationKind, WorkflowRule[]> = {
    warranty: [],
    lease: [],
    depreciation_eol: [],
    recurring_check: [],
  }
  for (const rule of store.rules) {
    byKind[rule.appliesTo].push(rule)
  }
  for (const k of Object.keys(byKind) as ExpirationKind[]) {
    byKind[k].sort((a, b) => b.thresholdDays - a.thresholdDays)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{t('settings.workflows.description')}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            <RotateCcw className="h-4 w-4" />
            {t('settings.workflows.reset_to_defaults')}
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            {t('settings.workflows.add_rule')}
          </button>
        </div>
      </div>

      {(Object.entries(byKind) as [ExpirationKind, WorkflowRule[]][]).map(
        ([kind, rules]) => (
          <section
            key={kind}
            className="rounded-lg border border-slate-800 bg-slate-900"
          >
            <header className="border-b border-slate-800 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-100">
                {t(kindKey(kind))}
              </h2>
            </header>
            {rules.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                {t('settings.workflows.no_rules_in_group')}
              </p>
            ) : (
              <ul className="divide-y divide-slate-800/70">
                {rules.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            rule.enabled ? 'text-slate-100' : 'text-slate-500',
                          )}
                        >
                          {rule.name}
                        </span>
                        <SeverityBadge severity={rule.severity} />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {rule.thresholdDays > 0
                          ? t('workflows.rule.fires_before', {
                              days: rule.thresholdDays,
                            })
                          : rule.thresholdDays === 0
                            ? t('workflows.rule.fires_on_day')
                            : t('workflows.rule.fires_after', {
                                days: Math.abs(rule.thresholdDays),
                              })}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {rule.actions.map((action, idx) => (
                          <ActionPill key={idx} action={action} />
                        ))}
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={rule.enabled}
                      onChange={() => store.toggleRule(rule.id)}
                      ariaLabel={
                        rule.enabled
                          ? t('settings.workflows.rule_enabled')
                          : t('settings.workflows.rule_disabled')
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setEditing(rule)}
                      aria-label={t('asset_actions.edit')}
                      className="rounded-md border border-slate-800 bg-slate-900 p-2 text-slate-500 hover:bg-slate-900/50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(rule)}
                      aria-label={t('asset_actions.delete')}
                      className="rounded-md border border-slate-800 bg-slate-900 p-2 text-rose-600 hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ),
      )}

      {creating && <RuleEditorDialog onClose={() => setCreating(false)} />}
      {editing && (
        <RuleEditorDialog rule={editing} onClose={() => setEditing(undefined)} />
      )}
      {deleting && (
        <DeleteRuleDialog
          rule={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            store.deleteRule(deleting.id)
            setDeleting(null)
          }}
        />
      )}
      {resetOpen && (
        <ConfirmDialog
          title={t('settings.workflows.reset_to_defaults')}
          description={t('settings.workflows.reset_warning')}
          confirmLabel={t('settings.workflows.reset_to_defaults')}
          onConfirm={() => {
            store.resetToDefaults()
            setResetOpen(false)
          }}
          onClose={() => setResetOpen(false)}
        />
      )}
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-brand-600' : 'bg-slate-700',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-slate-900 shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function DeleteRuleDialog({
  rule,
  onConfirm,
  onClose,
}: {
  rule: WorkflowRule
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('rule_delete.title')}
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
            onClick={onConfirm}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {t('rule_delete.confirm')}
          </button>
        </>
      }
    >
      <div className="flex gap-3 rounded-md border border-rose-500/30 bg-rose-950/40 p-3 text-sm text-rose-300">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>{t('rule_delete.warning', { name: rule.name })}</p>
      </div>
    </Modal>
  )
}

// ───────────────────────── Budgets tab ─────────────────────────

function BudgetsTab() {
  const { t } = useTranslation()
  const store = useBudgetsStore()
  const [draft, setDraft] = useState<Record<string, number>>(() =>
    Object.fromEntries(store.budgets.map((b) => [b.id, b.annualBudget])),
  )
  const [newDept, setNewDept] = useState('')
  const [newAmount, setNewAmount] = useState(0)

  function saveRow(id: string, department: string) {
    const value = draft[id]
    if (typeof value === 'number' && value >= 0) {
      store.setBudget(department, value, 'DKK')
    }
  }

  function addBudget() {
    if (!newDept.trim() || newAmount <= 0) return
    store.setBudget(newDept.trim(), newAmount, 'DKK')
    setNewDept('')
    setNewAmount(0)
  }

  return (
    <div className="space-y-4">
      <Card
        title={t('settings.budgets.title')}
        description={t('settings.budgets.description')}
      >
        <div className="space-y-2">
          {store.budgets.length === 0 ? (
            <p className="text-xs text-slate-500">
              {t('settings.budgets.empty')}
            </p>
          ) : (
            <ul className="divide-y divide-slate-800/70">
              {store.budgets.map((b) => (
                <li key={b.id} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1 text-sm text-slate-100">
                    {b.department}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={draft[b.id] ?? b.annualBudget}
                    onChange={(e) =>
                      setDraft({ ...draft, [b.id]: Number(e.target.value) })
                    }
                    onBlur={() => saveRow(b.id, b.department)}
                    className="w-32 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-right text-sm tabular-nums focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                  <span className="w-10 text-xs text-slate-500">
                    {b.currency}
                  </span>
                  <button
                    type="button"
                    onClick={() => store.deleteBudget(b.id)}
                    className="rounded-md p-1.5 text-rose-500 hover:bg-rose-950/40"
                    aria-label={t('asset_actions.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card
        title={t('settings.budgets.add_title')}
        description={t('settings.budgets.add_description')}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder={t('settings.budgets.add_placeholder')}
            className="flex-1 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <input
            type="number"
            min={0}
            value={newAmount}
            onChange={(e) => setNewAmount(Number(e.target.value))}
            className="w-32 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-right text-sm tabular-nums focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={addBudget}
            disabled={!newDept.trim() || newAmount <= 0}
            className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-700 disabled:text-slate-500"
          >
            <Plus className="h-4 w-4" />
            {t('settings.budgets.add_button')}
          </button>
        </div>
      </Card>
    </div>
  )
}

// ───────────────────────── Data tab ─────────────────────────

function DataTab() {
  const { t } = useTranslation()
  const assets = useAssetStore()
  const alerts = useAlertStore()
  const rules = useRulesStore()
  const licenses = useLicensesStore()
  const tickets = useTicketsStore()
  const budgets = useBudgetsStore()
  const [pending, setPending] = useState<null | (() => void)>(null)
  const [pendingMessage, setPendingMessage] = useState('')
  const [pendingLabel, setPendingLabel] = useState('')

  function confirm(message: string, label: string, action: () => void) {
    setPendingMessage(message)
    setPendingLabel(label)
    setPending(() => action)
  }

  return (
    <div className="space-y-4">
      <Card
        title={t('settings.data.assets_title')}
        description={t('settings.data.assets_description')}
      >
        <button
          type="button"
          onClick={() =>
            confirm(
              t('settings.data.assets_description'),
              t('settings.data.assets_reset'),
              () => assets.resetToDemo(),
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-950/60"
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.data.assets_reset')}
        </button>
      </Card>

      <Card
        title={t('settings.data.alerts_title')}
        description={t('settings.data.alerts_description')}
      >
        <button
          type="button"
          onClick={() =>
            confirm(
              t('settings.data.alerts_description'),
              t('settings.data.alerts_reset'),
              () => {
                Object.keys(alerts.alerts).forEach((key) =>
                  alerts.reopen(key),
                )
              },
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.data.alerts_reset')}
        </button>
      </Card>

      <Card
        title={t('settings.data.tasks_title')}
        description={t('settings.data.tasks_description')}
      >
        <button
          type="button"
          onClick={() =>
            confirm(
              t('settings.data.tasks_description'),
              t('settings.data.tasks_reset'),
              () => {
                alerts.tasks.forEach((task) => alerts.completeTask(task.id))
                // Mark them done; the store has no delete-all, but completing
                // removes them from the active queue.
              },
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.data.tasks_reset')}
        </button>
      </Card>

      <Card
        title={t('settings.data.rules_title')}
        description={t('settings.data.rules_description')}
      >
        <button
          type="button"
          onClick={() =>
            confirm(
              t('settings.data.rules_description'),
              t('settings.data.rules_reset'),
              () => rules.resetToDefaults(),
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.data.rules_reset')}
        </button>
      </Card>

      <Card
        title={t('settings.data.licenses_title')}
        description={t('settings.data.licenses_description')}
      >
        <button
          type="button"
          onClick={() =>
            confirm(
              t('settings.data.licenses_description'),
              t('settings.data.licenses_reset'),
              () => licenses.resetToDemo(),
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.data.licenses_reset')}
        </button>
      </Card>

      <Card
        title={t('settings.data.tickets_title')}
        description={t('settings.data.tickets_description')}
      >
        <button
          type="button"
          onClick={() =>
            confirm(
              t('settings.data.tickets_description'),
              t('settings.data.tickets_reset'),
              () => tickets.resetToDemo(),
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.data.tickets_reset')}
        </button>
      </Card>

      <Card
        title={t('settings.data.budgets_title')}
        description={t('settings.data.budgets_description')}
      >
        <button
          type="button"
          onClick={() =>
            confirm(
              t('settings.data.budgets_description'),
              t('settings.data.budgets_reset'),
              () => budgets.resetToDemo(),
            )
          }
          className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.data.budgets_reset')}
        </button>
      </Card>

      {pending && (
        <ConfirmDialog
          title={pendingLabel}
          description={pendingMessage}
          confirmLabel={pendingLabel}
          onConfirm={() => {
            pending()
            setPending(null)
          }}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  )
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={title}
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
            onClick={onConfirm}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-300">{description}</p>
    </Modal>
  )
}

function Card({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-5 shadow-elevated">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
