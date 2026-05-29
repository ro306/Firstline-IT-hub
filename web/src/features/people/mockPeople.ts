import type { OnboardingPackage, Person } from './types'

export const MOCK_PEOPLE: Person[] = [
  {
    id: 'p-1',
    name: 'Anna Sørensen',
    email: 'anna@firstlineit.dk',
    department: 'Marketing',
    role: 'Marketing Manager',
    startDate: '2024-01-15',
    status: 'active',
    assignedLicenseIds: ['lic-1', 'lic-2'],
  },
  {
    id: 'p-2',
    name: 'Mikkel Holm',
    email: 'mikkel@firstlineit.dk',
    department: 'Engineering',
    role: 'Senior Developer',
    startDate: '2023-09-01',
    status: 'active',
    assignedLicenseIds: ['lic-1', 'lic-3', 'lic-4'],
  },
  {
    id: 'p-3',
    name: 'Sofia Lind',
    email: 'sofia@firstlineit.dk',
    department: 'Sales',
    role: 'Account Executive',
    startDate: '2024-11-20',
    status: 'active',
    assignedLicenseIds: ['lic-1', 'lic-4'],
  },
  {
    id: 'p-4',
    name: 'Jonas Berg',
    email: 'jonas@firstlineit.dk',
    department: 'Engineering',
    role: 'DevOps Engineer',
    startDate: '2022-05-10',
    endDate: '2026-01-15',
    status: 'inactive',
    assignedLicenseIds: [],
  },
]

// Predefined onboarding bundles. Could later live in a store so users can
// edit, but for the MVP these are good defaults that show the concept.
export const MOCK_PACKAGES: OnboardingPackage[] = [
  {
    id: 'pkg-engineer',
    name: 'Engineering',
    description: 'Bærbar, ekstra skærm, dev-stack licenser',
    items: [
      { type: 'asset_category', category: 'laptop' },
      { type: 'asset_category', category: 'monitor' },
      { type: 'license', licenseId: 'lic-1' }, // Microsoft 365
      { type: 'license', licenseId: 'lic-3' }, // Jira
      { type: 'license', licenseId: 'lic-4' }, // Slack
    ],
  },
  {
    id: 'pkg-sales',
    name: 'Sales',
    description: 'Bærbar, telefon, CRM-licenser',
    items: [
      { type: 'asset_category', category: 'laptop' },
      { type: 'asset_category', category: 'phone' },
      { type: 'license', licenseId: 'lic-1' },
      { type: 'license', licenseId: 'lic-4' },
    ],
  },
  {
    id: 'pkg-marketing',
    name: 'Marketing',
    description: 'Bærbar, Adobe + Figma',
    items: [
      { type: 'asset_category', category: 'laptop' },
      { type: 'license', licenseId: 'lic-1' },
      { type: 'license', licenseId: 'lic-2' }, // Adobe
      { type: 'license', licenseId: 'lic-5' }, // Figma
    ],
  },
  {
    id: 'pkg-basic',
    name: 'Basic',
    description: 'Bare det essentielle',
    items: [
      { type: 'asset_category', category: 'laptop' },
      { type: 'license', licenseId: 'lic-1' },
    ],
  },
]
