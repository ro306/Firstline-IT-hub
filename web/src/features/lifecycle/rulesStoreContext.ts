import { createContext } from 'react'
import type { WorkflowRule } from './types'

export type RulesStoreValue = {
  rules: WorkflowRule[]
  getRule: (id: string) => WorkflowRule | undefined
  createRule: (input: Omit<WorkflowRule, 'id'>) => WorkflowRule
  updateRule: (id: string, patch: Partial<Omit<WorkflowRule, 'id'>>) => void
  deleteRule: (id: string) => void
  toggleRule: (id: string) => void
  resetToDefaults: () => void
}

export const RulesStoreContext = createContext<RulesStoreValue | null>(null)
