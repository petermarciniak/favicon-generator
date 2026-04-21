import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Upload,
  Download,
  FileImage,
  X,
  Moon,
  Sun,
  Package,
  Smartphone,
  Globe,
  Layers,
  Archive,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import {
  generateFavicons,
  downloadBlob,
  downloadAllAsZip,
  revokeGenerationResult,
  FAVICON_SIZES,
  CATEGORY_META,
  type GenerationResult,
  type FaviconCategory,
  type GeneratedIcon,
} from '@/lib/favicon-generator'

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadZoneProps {
  label: string
  hint: string
  file: File | null
  previewUrl: string | null
  onFile: (file: File) => void
  onClear: () => void
  theme?: 'light' | 'dark'
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────

function UploadZone({ label, hint, file, previewUrl, onFile, onClear, theme }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped && dropped.type.startsWith('image/')) onFile(dropped)
    },
    [onFile]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
    e.target.value = ''
  }

  const bgClass =
    theme === 'dark'
      ? 'bg-slate-800 dark:bg-slate-950'
      : 'bg-white dark:bg-slate-800'

  if (file && previewUrl) {
    return (
      <div
        className={cn(
          'relative flex flex-col items-center gap-3 rounded-xl border-2 p-5',
          theme === 'dark'
            ? 'border-slate-600 bg-slate-800/50 dark:border-slate-500 dark:bg-slate-900/50'
            : 'border-primary-200 bg-primary-50/40 dark:border-primary-800/50 dark:bg-primary-900/20'
        )}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div
          className={cn(
            'flex h-24 w-24 items-center justify-center rounded-xl',
            theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100 dark:bg-slate-700',
            'checkerboard'
          )}
        >
          <img src={previewUrl} alt="icon preview" className="h-20 w-20 object-contain" />
        </div>
        <p className="max-w-[160px] truncate text-center text-xs text-slate-500 dark:text-slate-400">
          {file.name}
        </p>
        <button
          onClick={onClear}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all',
        dragging
          ? 'border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
          : theme === 'dark'
            ? 'border-slate-600 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-400'
            : 'border-slate-300 hover:border-primary-400 dark:border-slate-600 dark:hover:border-primary-500',
        bgClass
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          theme === 'dark'
            ? 'bg-slate-700 dark:bg-slate-800'
            : 'bg-primary-50 dark:bg-primary-900/30'
        )}
      >
        {theme === 'dark' ? (
          <Moon className="h-6 w-6 text-slate-400" />
        ) : (
          <Upload className="h-6 w-6 text-primary-500" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </button>
  )
}

// ─── Icon Preview Card ────────────────────────────────────────────────────────

interface IconCardProps {
  icon: GeneratedIcon
  activeDark: boolean
}

function IconCard({ icon, activeDark }: IconCardProps) {
  const displayUrl = activeDark && icon.darkUrl ? icon.darkUrl : icon.url
  const displayBlob = activeDark && icon.darkBlob ? icon.darkBlob : icon.blob

  const displaySize = Math.max(icon.size.width, 32)
  const containerSize = Math.max(displaySize, 48)

  return (
    <div className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div
        className="checkerboard flex items-center justify-center rounded-lg"
        style={{ width: containerSize + 16, height: containerSize + 16 }}
      >
        <img
          src={displayUrl}
          alt={icon.size.label}
          style={{ width: displaySize, height: displaySize, imageRendering: icon.size.width <= 32 ? 'pixelated' : 'auto' }}
          className="object-contain"
        />
      </div>
      <div className="w-full text-center">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{icon.size.label}</p>
        <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{icon.size.description}</p>
      </div>
      <button
        onClick={() => downloadBlob(displayBlob, icon.size.filename.split('/').pop()!)}
        className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-slate-500 opacity-0 transition-all hover:bg-primary-50 hover:text-primary-600 group-hover:opacity-100 dark:text-slate-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
      >
        <Download className="h-3 w-3" />
        Download
      </button>
    </div>
  )
}

// ─── Category Panel ───────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<FaviconCategory, React.ElementType> = {
  web: Globe,
  pwa: Layers,
  ios: Smartphone,
  android: Package,
}

interface CategoryPanelProps {
  category: FaviconCategory
  icons: GeneratedIcon[]
  showDark: boolean
  activeDark: boolean
  onToggleDark: () => void
  defaultOpen?: boolean
}

function CategoryPanel({
  category,
  icons,
  showDark,
  activeDark,
  onToggleDark,
  defaultOpen = true,
}: CategoryPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = CATEGORY_META[category]
  const Icon = CATEGORY_ICONS[category]

  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
    purple: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30',
    gray: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700',
    green: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50"
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('flex h-7 w-7 items-center justify-center rounded-md', colorMap[meta.color])}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{meta.label}</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            {icons.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {showDark && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDark() }}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                activeDark
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              )}
            >
              {activeDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              {activeDark ? 'Dark' : 'Light'}
            </button>
          )}
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {icons.map((icon) => (
            <IconCard
              key={icon.size.filename}
              icon={icon}
              activeDark={activeDark}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const CATEGORIES: FaviconCategory[] = ['web', 'pwa', 'ios', 'android']

export default function FaviconGenerator() {
  const [lightFile, setLightFile] = useState<File | null>(null)
  const [lightPreview, setLightPreview] = useState<string | null>(null)
  const [darkFile, setDarkFile] = useState<File | null>(null)
  const [darkPreview, setDarkPreview] = useState<string | null>(null)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [activeDarkCategories, setActiveDarkCategories] = useState<Set<FaviconCategory>>(new Set())
  const [appName, setAppName] = useState('my-app')
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [generated, setGenerated] = useState(false)

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (result) revokeGenerationResult(result)
      if (lightPreview) URL.revokeObjectURL(lightPreview)
      if (darkPreview) URL.revokeObjectURL(darkPreview)
    }
  }, []) // eslint-disable-line

  const handleLightFile = (file: File) => {
    if (lightPreview) URL.revokeObjectURL(lightPreview)
    setLightFile(file)
    setLightPreview(URL.createObjectURL(file))
    setResult(null)
    setGenerated(false)
  }

  const handleDarkFile = (file: File) => {
    if (darkPreview) URL.revokeObjectURL(darkPreview)
    setDarkFile(file)
    setDarkPreview(URL.createObjectURL(file))
    setResult(null)
    setGenerated(false)
  }

  const clearLight = () => {
    if (lightPreview) URL.revokeObjectURL(lightPreview)
    setLightFile(null)
    setLightPreview(null)
    setResult(null)
    setGenerated(false)
  }

  const clearDark = () => {
    if (darkPreview) URL.revokeObjectURL(darkPreview)
    setDarkFile(null)
    setDarkPreview(null)
  }

  const handleGenerate = async () => {
    if (!lightFile) return
    setGenerating(true)
    try {
      if (result) revokeGenerationResult(result)
      const newResult = await generateFavicons(lightFile, darkModeEnabled ? darkFile ?? undefined : undefined)
      setResult(newResult)
      setGenerated(true)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadAll = async () => {
    if (!result) return
    setDownloadingZip(true)
    try {
      await downloadAllAsZip(result, darkModeEnabled && !!darkFile, appName || 'favicon')
    } finally {
      setDownloadingZip(false)
    }
  }

  const handleDownloadIco = () => {
    if (!result) return
    downloadBlob(result.faviconIco, 'favicon.ico')
  }

  const toggleDarkCategory = (cat: FaviconCategory) => {
    setActiveDarkCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const iconsByCategory = result
    ? CATEGORIES.reduce(
        (acc, cat) => {
          acc[cat] = result.icons.filter((i) => i.size.category === cat)
          return acc
        },
        {} as Record<FaviconCategory, GeneratedIcon[]>
      )
    : null

  const hasDark = darkModeEnabled && !!darkFile && !!result?.darkFaviconIco
  const totalCount = FAVICON_SIZES.length

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-md">
            <FileImage className="h-5 w-5 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Favicon Generator
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Generate {totalCount} favicon sizes for Web, PWA/React, iOS & Android from a single image.
        </p>
      </div>

      {/* Step 1 — Upload */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              1
            </span>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Upload your icon</h2>
          </div>
          <span className="text-xs text-slate-400">PNG, JPG, SVG, WebP supported</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <UploadZone
              label="Light mode icon"
              hint="Click to browse or drag & drop"
              file={lightFile}
              previewUrl={lightPreview}
              onFile={handleLightFile}
              onClear={clearLight}
              theme="light"
            />
          </div>

          {/* Dark mode toggle */}
          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => setDarkModeEnabled((v) => !v)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                darkModeEnabled
                  ? 'bg-slate-800 text-white shadow-sm dark:bg-slate-200 dark:text-slate-900'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              )}
            >
              <Moon className="h-4 w-4" />
              {darkModeEnabled ? 'Dark mode on' : 'Add dark mode icon'}
            </button>
            {darkModeEnabled && (
              <p className="max-w-[120px] text-center text-[10px] text-slate-400">Optional separate icon for dark UI</p>
            )}
          </div>

          {darkModeEnabled && (
            <div className="flex-1">
              <UploadZone
                label="Dark mode icon"
                hint="Optional — uses light icon if skipped"
                file={darkFile}
                previewUrl={darkPreview}
                onFile={handleDarkFile}
                onClear={clearDark}
                theme="dark"
              />
            </div>
          )}
        </div>

        {/* App name + generate */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
              App / project name <span className="text-slate-400">(used in manifest & ZIP filename)</span>
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="my-app"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!lightFile || generating}
            loading={generating}
            size="md"
            className="shrink-0 sm:h-9"
          >
            {generating ? 'Generating…' : generated ? 'Re-generate' : 'Generate favicons'}
          </Button>
        </div>
      </section>

      {/* Results */}
      {result && iconsByCategory && (
        <>
          {/* Step 2 — Download */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                2
              </span>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Download</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownloadAll}
                loading={downloadingZip}
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Download all as ZIP
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                  {totalCount + (hasDark ? totalCount : 0) + 1} files
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadIco}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                favicon.ico
                <span className="text-xs text-slate-400">(16, 32, 48px)</span>
              </Button>

              {hasDark && result.darkFaviconIco && (
                <Button
                  variant="outline"
                  onClick={() => downloadBlob(result.darkFaviconIco!, 'favicon-dark.ico')}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  favicon-dark.ico
                </Button>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
              <p className="text-xs text-primary-700 dark:text-primary-300">
                The ZIP includes a <code className="rounded bg-primary-100 px-1 dark:bg-primary-800">README_html_snippet.html</code> with ready-to-paste{' '}
                <code className="rounded bg-primary-100 px-1 dark:bg-primary-800">&lt;link&gt;</code> tags, and a{' '}
                <code className="rounded bg-primary-100 px-1 dark:bg-primary-800">manifest_snippet.json</code> for your PWA.
              </p>
            </div>
          </section>

          {/* Step 3 — Preview */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  3
                </span>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Preview</h2>
              </div>
              {hasDark && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Dark mode icons generated
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {CATEGORIES.map((cat) => (
                <CategoryPanel
                  key={cat}
                  category={cat}
                  icons={iconsByCategory[cat]}
                  showDark={hasDark}
                  activeDark={activeDarkCategories.has(cat)}
                  onToggleDark={() => toggleDarkCategory(cat)}
                  defaultOpen={cat === 'web' || cat === 'pwa'}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Empty state hint */}
      {!result && !generating && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-14 dark:border-slate-700">
          <div className="flex gap-3 opacity-40">
            {(['web', 'pwa', 'ios', 'android'] as const).map((cat) => {
              const Icon = CATEGORY_ICONS[cat]
              return (
                <div key={cat} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700">
                  <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
              )
            })}
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Upload an image above and click <strong className="text-slate-500 dark:text-slate-400">Generate favicons</strong>
          </p>
        </div>
      )}
    </div>
  )
}
