import { Boxes, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { MOCK_ASSETS } from '@/features/assets/mockData'

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number | string
  icon: typeof Boxes
  tone: 'brand' | 'emerald' | 'amber' | 'slate'
}) {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  }[tone]

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-md p-2 ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const total = MOCK_ASSETS.length
  const inUse = MOCK_ASSETS.filter((a) => a.status === 'in_use').length
  const maintenance = MOCK_ASSETS.filter(
    (a) => a.status === 'maintenance',
  ).length
  const inStock = MOCK_ASSETS.filter((a) => a.status === 'in_stock').length

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your IT asset inventory at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total assets"
          value={total}
          icon={Boxes}
          tone="brand"
        />
        <StatCard
          label="In use"
          value={inUse}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="In maintenance"
          value={maintenance}
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard label="In stock" value={inStock} icon={Clock} tone="slate" />
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Welcome to the Asset Management module
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          This is a starting shell. Navigate to{' '}
          <span className="font-medium">Assets</span> to see the inventory
          table. The API integration, Logto auth, and tenant context will be
          wired in as those modules come online.
        </p>
      </div>
    </div>
  )
}
