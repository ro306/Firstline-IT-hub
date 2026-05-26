import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_WORKFLOW_RULES } from './mockRules'
import {
  RulesStoreContext,
  type RulesStoreValue,
} from './rulesStoreContext'
import type { WorkflowRule } from './types'

const STORAGE_KEY = 'fl-workflow-rules-v1'

function loadRules(): WorkflowRule[] {
  if (typeof window === 'undefined') return DEFAULT_WORKFLOW_RULES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_WORKFLOW_RULES
    const parsed = JSON.parse(raw) as WorkflowRule[]
    if (!Array.isArray(parsed)) return DEFAULT_WORKFLOW_RULES
    return parsed
  } catch {
    return DEFAULT_WORKFLOW_RULES
  }
}

function saveRules(rules: WorkflowRule[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
  } catch {
    // ignore quota errors
  }
}

function newRuleId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function RulesStoreProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<WorkflowRule[]>(() => loadRules())

  useEffect(() => {
    saveRules(rules)
  }, [rules])

  const getRule = useCallback(
    (id: string) => rules.find((r) => r.id === id),
    [rules],
  )

  const createRule = useCallback<RulesStoreValue['createRule']>((input) => {
    const created: WorkflowRule = { ...input, id: newRuleId() }
    setRules((prev) => [...prev, created])
    return created
  }, [])

  const updateRule = useCallback<RulesStoreValue['updateRule']>(
    (id, patch) => {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      )
    },
    [],
  )

  const deleteRule = useCallback<RulesStoreValue['deleteRule']>((id) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const toggleRule = useCallback<RulesStoreValue['toggleRule']>((id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    )
  }, [])

  const resetToDefaults = useCallback(() => {
    setRules(DEFAULT_WORKFLOW_RULES)
  }, [])

  const value = useMemo<RulesStoreValue>(
    () => ({
      rules,
      getRule,
      createRule,
      updateRule,
      deleteRule,
      toggleRule,
      resetToDefaults,
    }),
    [
      rules,
      getRule,
      createRule,
      updateRule,
      deleteRule,
      toggleRule,
      resetToDefaults,
    ],
  )

  return (
    <RulesStoreContext.Provider value={value}>
      {children}
    </RulesStoreContext.Provider>
  )
}
