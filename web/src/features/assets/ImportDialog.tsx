import { useRef, useState } from 'react'
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import {
  downloadImportTemplate,
  parseImportFile,
  type ParsedImportRow,
} from './xlsxImport'

type Stage = 'choose' | 'preview' | 'done'

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>('choose')
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ParsedImportRow[]>([])
  const [summary, setSummary] = useState({ created: 0, updated: 0, skipped: 0 })
  const [parseError, setParseError] = useState('')

  async function handleFilePicked(file: File) {
    setParseError('')
    setFileName(file.name)
    try {
      const parsed = await parseImportFile(file, store.assets)
      setRows(parsed)
      setStage('preview')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err))
    }
  }

  function runImport() {
    let created = 0
    let updated = 0
    let skipped = 0
    for (const row of rows) {
      if (row.errors.length > 0 || !row.input) {
        skipped++
        continue
      }
      if (row.existingAssetId) {
        store.updateAsset(row.existingAssetId, row.input)
        updated++
      } else {
        store.createAsset(row.input)
        created++
      }
    }
    setSummary({ created, updated, skipped })
    setStage('done')
  }

  const validRows = rows.filter((r) => r.errors.length === 0).length

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('import.title')}
      footer={
        stage === 'preview' ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={runImport}
              disabled={validRows === 0}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500"
            >
              <Upload className="h-4 w-4" />
              {t('import.import_count', { n: validRows })}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          >
            {t('common.close')}
          </button>
        )
      }
    >
      {stage === 'choose' && (
        <div className="space-y-5">
          <Step
            number={1}
            title={t('import.step1_title')}
            description={t('import.step1_description')}
          >
            <button
              type="button"
              onClick={() => downloadImportTemplate()}
              className="inline-flex items-center gap-2 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
            >
              <Download className="h-4 w-4" />
              {t('import.download_template')}
            </button>
          </Step>

          <Step
            number={2}
            title={t('import.step2_title')}
            description={t('import.step2_description')}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFilePicked(file)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t('import.select_file')}
            </button>
            {parseError && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="font-mono">{parseError}</span>
              </div>
            )}
          </Step>
        </div>
      )}

      {stage === 'preview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-100">
                {t('import.preview_title', { count: rows.length })}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {t('import.preview_legend')}
              </p>
              {fileName && (
                <p className="mt-1 text-xs text-slate-500">
                  {t('import.selected_file', { name: fileName })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800/50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t('import.change_file')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFilePicked(file)
                e.target.value = ''
              }}
            />
          </div>

          {rows.length === 0 ? (
            <p className="rounded-md border border-slate-800 bg-slate-900/40 p-4 text-center text-sm text-slate-500">
              {t('import.no_rows')}
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-md border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900/80 text-[10px] font-semibold tracking-wider text-slate-500 uppercase backdrop-blur-sm">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Tag</th>
                    <th className="px-3 py-2">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {rows.map((row) => {
                    const isError = row.errors.length > 0
                    const isUpdate = !isError && row.existingAssetId
                    return (
                      <tr
                        key={row.rowNumber}
                        className={isError ? 'bg-rose-500/5' : undefined}
                      >
                        <td className="px-3 py-2 font-mono text-slate-500 tabular-nums">
                          {row.rowNumber}
                        </td>
                        <td className="px-3 py-2">
                          {isError ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300 ring-1 ring-rose-500/30">
                              <AlertTriangle className="h-3 w-3" />
                              {t('import.row_error')}
                            </span>
                          ) : isUpdate ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-500/30">
                              <RefreshCw className="h-3 w-3" />
                              {t('import.row_update')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3" />
                              {t('import.row_new')}
                            </span>
                          )}
                        </td>
                        <td className="max-w-[180px] truncate px-3 py-2 text-slate-300">
                          {String(row.raw['Name'] ?? '—')}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-400">
                          {String(row.raw['Asset tag'] ?? '—')}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {isError ? (
                            <ul className="space-y-0.5 text-[11px] text-rose-300">
                              {row.errors.map((e, i) => (
                                <li key={i}>• {e}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              {String(row.raw['Category'] ?? '')} ·{' '}
                              {String(row.raw['Location'] ?? '')}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {stage === 'done' && (
        <div className="flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p>
            {t('import.summary_success', summary)}
          </p>
        </div>
      )}
    </Modal>
  )
}

function Step({
  number,
  title,
  description,
  children,
}: {
  number: number
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-500/30 tabular-nums">
        {number}
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <h3 className="text-sm font-medium text-slate-100">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
