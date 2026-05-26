// Workflow definitions for periods that approach expiration. A rule says
// "this kind of period, this many days before its end date, becomes severity X
// and triggers these actions". Rules are kept simple: a single threshold per
// rule, severity scales as you cross more rules (most severe wins).

export type ExpirationKind =
  | 'warranty'
  | 'lease'
  | 'depreciation_eol'
  | 'recurring_check'

export type Severity = 'info' | 'warning' | 'urgent' | 'expired'

export type WorkflowActionType =
  | 'notify_in_app'
  | 'notify_email'
  | 'create_task'
  | 'mark_urgent'

export type WorkflowAction = {
  type: WorkflowActionType
  // For notify_email / create_task — who receives it. Resolved later against
  // the user/role directory once IAM is wired up.
  target?: string
  // For create_task — title template; supports {assetName}, {kind}, {endsAt}.
  taskTitle?: string
}

export type WorkflowRule = {
  id: string
  name: string
  enabled: boolean
  // Which kind of period this rule applies to.
  appliesTo: ExpirationKind
  // Optional narrowing (e.g. only manufacturer warranties).
  warrantyKindFilter?: string[]
  // Days before the end date at which this rule fires. Use 0 for "on the day"
  // and a negative number for "N days after expiry" (overdue rules).
  thresholdDays: number
  severity: Severity
  actions: WorkflowAction[]
}

export type AlertStatus = 'open' | 'snoozed' | 'acknowledged' | 'resolved'

// Per-period alert state. Keyed by `assetId:kind:periodId` so we can persist
// user decisions (snooze / ack) across renders.
export type AlertState = {
  status: AlertStatus
  snoozedUntil?: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  notes?: string
}

export type FollowUpTask = {
  id: string
  assetId: string
  periodKey: string
  title: string
  description?: string
  assigneeName: string
  dueAt: string
  status: 'open' | 'in_progress' | 'done'
  createdAt: string
  createdBy: string
}
