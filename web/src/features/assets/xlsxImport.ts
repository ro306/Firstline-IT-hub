import * as XLSX from 'xlsx'
import type {
  Asset,
  AssetCategory,
  AssetLifecycleState,
  Ownership,
} from './types'
import type { NewAssetInput } from './assetStoreContext'

// Column headers in the order they appear in the template. Keep in sync with
// rowToInput() and templateRow() so the user's filled file maps cleanly.
const COLUMNS = [
  'Name',
  'Asset tag',
  'Serial number',
  'Category',
  'Lifecycle state',
  'Ownership',
  'Location',
  'Vendor',
  'Purchase order',
  'Purchase date',
  'Price',
  'Currency',
] as const

const VALID_CATEGORIES: AssetCategory[] = [
  'laptop',
  'desktop',
  'monitor',
  'phone',
  'tablet',
  'peripheral',
  'server',
  'network',
  'other',
]

const VALID_STATES: AssetLifecycleState[] = [
  'requested',
  'ordered',
  'in_stock',
  'assigned',
  'in_use',
  'in_maintenance',
  'leased_in',
  'leased_out',
  'retired',
  'disposed',
  'returned_to_vendor',
  'lost',
  'stolen',
]

const VALID_OWNERSHIPS: Ownership[] = ['owned', 'leased_in', 'leased_out']

const VALID_CURRENCIES = ['DKK', 'EUR', 'USD'] as const

// Two example rows so the user can see the expected shape and easily overwrite
// them with their own data.
const EXAMPLE_ROWS: Record<(typeof COLUMNS)[number], string | number>[] = [
  {
    Name: 'MacBook Pro 14"',
    'Asset tag': 'FL-LT-0101',
    'Serial number': 'C02XK1ABCDEF',
    Category: 'laptop',
    'Lifecycle state': 'in_stock',
    Ownership: 'owned',
    Location: 'Copenhagen HQ',
    Vendor: 'Humac Business',
    'Purchase order': 'PO-2026-0042',
    'Purchase date': '2026-05-01',
    Price: 18999,
    Currency: 'DKK',
  },
  {
    Name: 'Dell UltraSharp U2723QE',
    'Asset tag': 'FL-MN-0102',
    'Serial number': 'CN-0XYZ123',
    Category: 'monitor',
    'Lifecycle state': 'in_stock',
    Ownership: 'owned',
    Location: 'Aarhus Office',
    Vendor: 'Dell Technologies',
    'Purchase order': '',
    'Purchase date': '2026-04-20',
    Price: 4200,
    Currency: 'DKK',
  },
]

// Generates an .xlsx Blob with three sheets:
// 1) "Assets" — the data sheet the user fills out
// 2) "Instructions" — explanation + valid enum values
// 3) "Valid values" — raw lists so the user can copy-paste into cells
export function buildImportTemplate(): Blob {
  const wb = XLSX.utils.book_new()

  // Sheet 1 — data with example rows.
  const assetsSheet = XLSX.utils.json_to_sheet(EXAMPLE_ROWS, {
    header: [...COLUMNS],
  })
  // Set sensible column widths so the file is readable on open.
  assetsSheet['!cols'] = [
    { wch: 28 }, // Name
    { wch: 14 }, // Asset tag
    { wch: 22 }, // Serial number
    { wch: 12 }, // Category
    { wch: 16 }, // Lifecycle state
    { wch: 12 }, // Ownership
    { wch: 22 }, // Location
    { wch: 22 }, // Vendor
    { wch: 18 }, // PO
    { wch: 14 }, // Date
    { wch: 12 }, // Price
    { wch: 10 }, // Currency
  ]
  XLSX.utils.book_append_sheet(wb, assetsSheet, 'Assets')

  // Sheet 2 — instructions.
  const instructions = [
    ['Juvaro Asset Management — import template'],
    [],
    [
      'Fill out the "Assets" sheet with one row per asset. The two example',
      'rows can be overwritten or deleted.',
    ],
    [],
    ['Required columns:', 'Name, Asset tag, Serial number, Category,'],
    ['', 'Lifecycle state, Ownership, Location, Vendor,'],
    ['', 'Purchase date, Price, Currency'],
    [],
    ['Optional columns:', 'Purchase order'],
    [],
    ['Date format:', 'YYYY-MM-DD (e.g. 2026-05-01) or any Excel date cell'],
    ['Price:', 'Plain number, no currency symbol'],
    ['Asset tag:', 'Must be unique within the system'],
    [],
    ['Valid values are listed on the "Valid values" sheet.'],
    [],
    ['On import:'],
    [
      '• Rows with a matching Asset tag will update the existing asset.',
    ],
    ['• Rows with a new Asset tag will be created.'],
    ['• Rows with errors are skipped and shown in the preview.'],
  ]
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions)
  instructionsSheet['!cols'] = [{ wch: 22 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Instructions')

  // Sheet 3 — enum values.
  const valid = [
    ['Category', ...VALID_CATEGORIES],
    [],
    ['Lifecycle state', ...VALID_STATES],
    [],
    ['Ownership', ...VALID_OWNERSHIPS],
    [],
    ['Currency', ...VALID_CURRENCIES],
  ]
  const validSheet = XLSX.utils.aoa_to_sheet(valid)
  validSheet['!cols'] = [{ wch: 18 }, ...Array(15).fill({ wch: 18 })]
  XLSX.utils.book_append_sheet(wb, validSheet, 'Valid values')

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function downloadImportTemplate(filename = 'juvaro-assets-template.xlsx') {
  if (typeof window === 'undefined') return
  const blob = buildImportTemplate()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Result of parsing one uploaded row. Either a clean NewAssetInput (with an
// optional existing asset id when matching by tag) or a list of errors.
export type ParsedImportRow = {
  rowNumber: number
  raw: Record<string, unknown>
  input?: NewAssetInput
  existingAssetId?: string
  errors: string[]
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '') {
    const cleaned = v.replace(/[\s.,]/g, (m) => (m === ',' ? '.' : ''))
    const n = Number(cleaned)
    if (!isNaN(n)) return n
  }
  return null
}

// Excel dates come in as Date objects (when cellDates is true), strings, or
// raw numbers. Normalize to YYYY-MM-DD.
function asDateIso(v: unknown): string | null {
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null
    return v.toISOString().slice(0, 10)
  }
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return null
    // Already ISO?
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
    const d = new Date(s)
    if (isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  }
  if (typeof v === 'number') {
    // Excel serial date number.
    const epoch = new Date(Date.UTC(1899, 11, 30))
    const d = new Date(epoch.getTime() + v * 86400000)
    if (isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  }
  return null
}

function rowToInput(
  raw: Record<string, unknown>,
  rowNumber: number,
  existingAssets: Asset[],
): ParsedImportRow {
  const errors: string[] = []
  const name = asString(raw['Name'])
  const assetTag = asString(raw['Asset tag'])
  const serialNumber = asString(raw['Serial number'])
  const category = asString(raw['Category']).toLowerCase()
  const lifecycleState = asString(raw['Lifecycle state']).toLowerCase()
  const ownership = asString(raw['Ownership']).toLowerCase()
  const location = asString(raw['Location'])
  const vendor = asString(raw['Vendor'])
  const purchaseOrder = asString(raw['Purchase order'])
  const purchaseDate = asDateIso(raw['Purchase date'])
  const priceAmount = asNumber(raw['Price'])
  const currency = asString(raw['Currency']).toUpperCase()

  if (!name) errors.push('Name is required')
  if (!assetTag) errors.push('Asset tag is required')
  if (!serialNumber) errors.push('Serial number is required')
  if (!VALID_CATEGORIES.includes(category as AssetCategory))
    errors.push(`Invalid category "${category || '(empty)'}"`)
  if (!VALID_STATES.includes(lifecycleState as AssetLifecycleState))
    errors.push(`Invalid lifecycle state "${lifecycleState || '(empty)'}"`)
  if (!VALID_OWNERSHIPS.includes(ownership as Ownership))
    errors.push(`Invalid ownership "${ownership || '(empty)'}"`)
  if (!location) errors.push('Location is required')
  if (!vendor) errors.push('Vendor is required')
  if (!purchaseDate) errors.push('Purchase date is missing or unreadable')
  if (priceAmount === null || priceAmount < 0)
    errors.push('Price must be a non-negative number')
  if (!VALID_CURRENCIES.includes(currency as 'DKK' | 'EUR' | 'USD'))
    errors.push(`Invalid currency "${currency || '(empty)'}"`)

  const existing = assetTag
    ? existingAssets.find((a) => a.assetTag === assetTag)
    : undefined

  if (errors.length > 0) {
    return { rowNumber, raw, errors }
  }
  return {
    rowNumber,
    raw,
    existingAssetId: existing?.id,
    errors: [],
    input: {
      name,
      assetTag,
      serialNumber,
      category: category as AssetCategory,
      lifecycleState: lifecycleState as AssetLifecycleState,
      ownership: ownership as Ownership,
      location,
      vendor,
      purchaseOrder: purchaseOrder || undefined,
      purchaseDate: purchaseDate as string,
      priceAmount: priceAmount as number,
      priceCurrency: currency as 'DKK' | 'EUR' | 'USD',
    },
  }
}

export async function parseImportFile(
  file: File,
  existingAssets: Asset[],
): Promise<ParsedImportRow[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { cellDates: true })
  // Look for a sheet named "Assets" (case-insensitive), else fall back to the
  // first sheet so users who renamed it still work.
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase() === 'assets') ?? wb.SheetNames[0]
  const sheet = wb.Sheets[sheetName]
  if (!sheet) return []
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd',
  })
  return rows.map((raw, idx) => rowToInput(raw, idx + 2, existingAssets))
}
