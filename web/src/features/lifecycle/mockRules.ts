import type { WorkflowRule } from './types'

// Default workflow rules shipped with the app. Once the settings/IAM module
// exists these will live in the database and be editable per tenant.
export const DEFAULT_WORKFLOW_RULES: WorkflowRule[] = [
  // ── Warranties ────────────────────────────────────────────────────────
  {
    id: 'wf-warranty-90',
    name: 'Warranty: 90-day notice',
    enabled: true,
    appliesTo: 'warranty',
    thresholdDays: 90,
    severity: 'info',
    actions: [{ type: 'notify_in_app' }],
  },
  {
    id: 'wf-warranty-30',
    name: 'Warranty: 30-day warning',
    enabled: true,
    appliesTo: 'warranty',
    thresholdDays: 30,
    severity: 'warning',
    actions: [
      { type: 'notify_in_app' },
      { type: 'notify_email', target: 'it-procurement@firstlineit.dk' },
    ],
  },
  {
    id: 'wf-warranty-7',
    name: 'Warranty: 7-day urgent',
    enabled: true,
    appliesTo: 'warranty',
    thresholdDays: 7,
    severity: 'urgent',
    actions: [
      { type: 'notify_in_app' },
      {
        type: 'create_task',
        target: 'IT Procurement',
        taskTitle: 'Decide on renewal for {assetName} warranty',
      },
    ],
  },

  // ── Leases ────────────────────────────────────────────────────────────
  // Leases often have an opt-out notice period — start warning earlier.
  {
    id: 'wf-lease-180',
    name: 'Lease: 6-month notice',
    enabled: true,
    appliesTo: 'lease',
    thresholdDays: 180,
    severity: 'info',
    actions: [{ type: 'notify_in_app' }],
  },
  {
    id: 'wf-lease-90',
    name: 'Lease: 90-day decision window',
    enabled: true,
    appliesTo: 'lease',
    thresholdDays: 90,
    severity: 'warning',
    actions: [
      { type: 'notify_in_app' },
      {
        type: 'create_task',
        target: 'IT Procurement',
        taskTitle: 'Review lease renewal for {assetName}',
      },
    ],
  },
  {
    id: 'wf-lease-30',
    name: 'Lease: 30-day urgent',
    enabled: true,
    appliesTo: 'lease',
    thresholdDays: 30,
    severity: 'urgent',
    actions: [
      { type: 'notify_in_app' },
      { type: 'notify_email', target: 'finance@firstlineit.dk' },
    ],
  },

  // ── End of useful life ────────────────────────────────────────────────
  {
    id: 'wf-eol-90',
    name: 'EOL: refresh planning',
    enabled: true,
    appliesTo: 'depreciation_eol',
    thresholdDays: 90,
    severity: 'info',
    actions: [
      {
        type: 'create_task',
        target: 'IT Asset Manager',
        taskTitle: 'Plan refresh for {assetName}',
      },
    ],
  },
  {
    id: 'wf-eol-0',
    name: 'EOL: fully depreciated',
    enabled: true,
    appliesTo: 'depreciation_eol',
    thresholdDays: 0,
    severity: 'warning',
    actions: [{ type: 'notify_in_app' }],
  },

  // ── Recurring checks ──────────────────────────────────────────────────
  {
    id: 'wf-check-30',
    name: 'Recurring check: 30-day reminder',
    enabled: true,
    appliesTo: 'recurring_check',
    thresholdDays: 30,
    severity: 'info',
    actions: [{ type: 'notify_in_app' }],
  },
  {
    id: 'wf-check-0',
    name: 'Recurring check: due',
    enabled: true,
    appliesTo: 'recurring_check',
    thresholdDays: 0,
    severity: 'warning',
    actions: [{ type: 'notify_in_app' }],
  },
  {
    id: 'wf-check-overdue',
    name: 'Recurring check: 14 days overdue',
    enabled: true,
    appliesTo: 'recurring_check',
    thresholdDays: -14,
    severity: 'urgent',
    actions: [
      { type: 'notify_in_app' },
      {
        type: 'create_task',
        target: 'IT Asset Manager',
        taskTitle: 'Complete overdue check: {label} on {assetName}',
      },
    ],
  },
]
