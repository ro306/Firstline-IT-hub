import { Link } from 'react-router-dom'
import {
  Boxes,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Workflow,
  BarChart3,
  ArrowRight,
  Check,
  Mail,
  Sparkles,
  Lock,
  Globe,
  Zap,
} from 'lucide-react'
import * as motion from 'motion/react-client'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { usePreferences } from '@/lib/usePreferences'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const CONTACT_EMAIL = 'kontakt@firstlineit.dk'

export function LandingPage() {
  const { t } = useTranslation()
  const { prefs } = usePreferences()
  const brand = prefs.brandTitle || t('nav.brand_title')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Subtle grid + radial glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.10),_transparent_50%)]" />
      </div>

      <TopNav brand={brand} />

      <main>
        <Hero brand={brand} />
        <TrustStrip />
        <FeaturesSection />
        <PreviewSection />
        <UseCasesSection />
        <PilotSection />
        <FinalCta />
        <Footer brand={brand} />
      </main>
    </div>
  )
}

function TopNav({ brand }: { brand: string }) {
  const { t } = useTranslation()
  const initial = brand.trim().charAt(0).toUpperCase() || 'J'
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/welcome" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-[0_4px_12px_-2px_rgb(99_102_241_/_0.35)]">
            {initial}
            <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              {brand}
            </span>
            <span className="text-[11px] text-slate-500">
              {t('landing.nav.subtitle')}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#features" className="hover:text-slate-100">
              {t('landing.nav.features')}
            </a>
            <a href="#preview" className="hover:text-slate-100">
              {t('landing.nav.preview')}
            </a>
            <a href="#pilot" className="hover:text-slate-100">
              {t('landing.nav.pilot')}
            </a>
          </nav>
          <LanguageSwitcher />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-[0_4px_12px_-2px_rgb(99_102_241_/_0.45)] transition-colors hover:bg-brand-700"
          >
            {t('landing.nav.go_to_app')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero({ brand }: { brand: string }) {
  const { t } = useTranslation()
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300">
          <Sparkles className="h-3 w-3" />
          {t('landing.hero.badge')}
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
          {t('landing.hero.title_pre')}{' '}
          <span className="bg-gradient-to-r from-cyan-300 via-brand-300 to-purple-300 bg-clip-text text-transparent">
            {t('landing.hero.title_highlight')}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          {t('landing.hero.subtitle', { brand })}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pilot"
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgb(99_102_241_/_0.55)] transition-colors hover:bg-brand-700"
          >
            {t('landing.hero.primary_cta')}
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:bg-slate-800/80"
          >
            {t('landing.hero.secondary_cta')}
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {t('landing.hero.disclaimer')}
        </p>
      </motion.div>
    </section>
  )
}

function TrustStrip() {
  const { t } = useTranslation()
  const items = [
    { icon: Lock, key: 'gdpr' },
    { icon: ShieldCheck, key: 'iso' },
    { icon: Globe, key: 'danish' },
    { icon: Zap, key: 'fast' },
  ]
  return (
    <section className="border-y border-slate-800/70 bg-slate-900/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
        {items.map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-center gap-3">
            <Icon className="h-5 w-5 flex-shrink-0 text-cyan-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">
                {t(`landing.trust.${key}.title`)}
              </p>
              <p className="text-xs text-slate-500">
                {t(`landing.trust.${key}.subtitle`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const FEATURES = [
  { icon: Boxes, key: 'assets', tone: 'cyan' },
  { icon: KeyRound, key: 'licenses', tone: 'brand' },
  { icon: ShieldCheck, key: 'security', tone: 'emerald' },
  { icon: UserPlus, key: 'people', tone: 'purple' },
  { icon: Workflow, key: 'workflows', tone: 'amber' },
  { icon: BarChart3, key: 'reports', tone: 'rose' },
] as const

const TONE: Record<string, string> = {
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30',
  brand: 'bg-brand-500/10 text-brand-300 ring-brand-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  purple: 'bg-purple-500/10 text-purple-300 ring-purple-500/30',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  rose: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
}

function FeaturesSection() {
  const { t } = useTranslation()
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {t('landing.features.title')}
        </h2>
        <p className="mt-4 text-base text-slate-400">
          {t('landing.features.subtitle')}
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, key, tone }, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="group rounded-xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur-sm transition-colors hover:border-slate-700"
          >
            <div
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset ${TONE[tone]}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-100">
              {t(`landing.feature.${key}.title`)}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {t(`landing.feature.${key}.description`)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function PreviewSection() {
  const { t } = useTranslation()
  return (
    <section
      id="preview"
      className="border-y border-slate-800/70 bg-gradient-to-b from-slate-900/40 to-slate-950 py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            {t('landing.preview.title')}
          </h2>
          <p className="mt-4 text-base text-slate-400">
            {t('landing.preview.subtitle')}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="mt-12 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-1 shadow-[0_30px_80px_-20px_rgb(15_23_42_/_0.8)]"
        >
          {/* Faux app preview */}
          <div className="rounded-xl bg-slate-950/80 p-6">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              {[
                { label: t('landing.preview.stat.total'), value: '11', tone: 'cyan' },
                { label: t('landing.preview.stat.active'), value: '6', tone: 'emerald' },
                { label: t('landing.preview.stat.maintenance'), value: '2', tone: 'amber' },
                { label: t('landing.preview.stat.leased'), value: '1', tone: 'slate' },
                { label: t('landing.preview.stat.eol'), value: '1', tone: 'rose' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-4"
                >
                  <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                    {s.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-100">
                    {s.value}
                  </p>
                  <div className="mt-2 h-1 w-full rounded-full bg-slate-800">
                    <div
                      className={`h-1 rounded-full ${
                        s.tone === 'cyan'
                          ? 'bg-cyan-400'
                          : s.tone === 'emerald'
                            ? 'bg-emerald-400'
                            : s.tone === 'amber'
                              ? 'bg-amber-400'
                              : s.tone === 'rose'
                                ? 'bg-rose-400'
                                : 'bg-slate-400'
                      }`}
                      style={{ width: `${30 + Number(s.value) * 7}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-4 md:col-span-2">
                <p className="text-xs font-medium text-slate-400">
                  {t('landing.preview.chart_title')}
                </p>
                <svg viewBox="0 0 400 100" className="mt-3 h-24 w-full">
                  <defs>
                    <linearGradient id="lp-grad-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 70 L40 60 L80 55 L120 65 L160 40 L200 50 L240 30 L280 38 L320 20 L360 28 L400 15 L400 100 L0 100 Z"
                    fill="url(#lp-grad-1)"
                  />
                  <path
                    d="M0 70 L40 60 L80 55 L120 65 L160 40 L200 50 L240 30 L280 38 L320 20 L360 28 L400 15"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-4">
                <p className="text-xs font-medium text-slate-400">
                  {t('landing.preview.compliance_title')}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold tabular-nums text-slate-100">
                    87%
                  </p>
                  <span className="text-xs text-emerald-300">
                    {t('landing.preview.compliance_delta')}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {['GDPR', 'ISO 27001', 'NIS2'].map((f) => (
                    <div key={f} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{f}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <Check className="h-3 w-3" />
                        {t('landing.preview.compliant')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  const { t } = useTranslation()
  const items = ['it_team', 'finance', 'security']
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {t('landing.use_cases.title')}
        </h2>
        <p className="mt-4 text-base text-slate-400">
          {t('landing.use_cases.subtitle')}
        </p>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((key) => (
          <div
            key={key}
            className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-100">
              {t(`landing.use_case.${key}.title`)}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                  <span>{t(`landing.use_case.${key}.point_${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function PilotSection() {
  const { t } = useTranslation()
  return (
    <section id="pilot" className="border-t border-slate-800/70 bg-slate-900/30 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-10 shadow-[0_30px_80px_-20px_rgb(34_211_238_/_0.25)]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-300">
            <Sparkles className="h-3 w-3" />
            {t('landing.pilot.badge')}
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            {t('landing.pilot.title')}
          </h2>
          <p className="mt-4 text-base text-slate-400">
            {t('landing.pilot.description')}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                <span>{t(`landing.pilot.point_${i}`)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('landing.pilot.email_subject'))}`}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgb(99_102_241_/_0.55)] transition-colors hover:bg-brand-700"
            >
              <Mail className="h-4 w-4" />
              {t('landing.pilot.cta')}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  const { t } = useTranslation()
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
        {t('landing.final.title')}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
        {t('landing.final.subtitle')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgb(99_102_241_/_0.55)] transition-colors hover:bg-brand-700"
        >
          {t('landing.final.cta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

function Footer({ brand }: { brand: string }) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-slate-800/70 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
        <p>
          © {year} {brand}. {t('landing.footer.rights')}
        </p>
        <div className="flex gap-4">
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-slate-300">
            {t('landing.footer.contact')}
          </a>
          <Link to="/" className="hover:text-slate-300">
            {t('landing.footer.app')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
