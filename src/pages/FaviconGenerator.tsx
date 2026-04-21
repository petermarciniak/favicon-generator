import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Upload, Download, X, Moon, Sun, Package, Smartphone,
  Globe, Layers, Archive, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, Badge, Switch } from '@/components/ui'
import { useAppFavicon } from '@/hooks/useAppFavicon'
import {
  generateForCategory,
  downloadBlob,
  downloadAllAsZip,
  revokeIcons,
  CATEGORY_META,
  type FaviconCategory,
  type GeneratedIcon,
} from '@/lib/favicon-generator'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: FaviconCategory[] = ['web', 'pwa', 'ios', 'android']

const CATEGORY_ICONS: Record<FaviconCategory, React.ElementType> = {
  web:     Globe,
  pwa:     Layers,
  ios:     Smartphone,
  android: Package,
}

const CATEGORY_BADGE: Record<FaviconCategory, React.ComponentProps<typeof Badge>['variant']> = {
  web:     'blue',
  pwa:     'purple',
  ios:     'default',
  android: 'green',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryState {
  enabled: boolean
  loading: boolean
  icons: GeneratedIcon[]
  icoBlob?: Blob
  darkIcoBlob?: Blob
  error?: string
}

// ─── Upload zone ─────────────────────────────────────────────────────────────

interface UploadZoneProps {
  label: string
  hint: string
  file: File | null
  previewUrl: string | null
  onFile: (file: File) => void
  onClear: () => void
  accent?: 'light' | 'dark'
}

function UploadZone({ label, hint, file, previewUrl, onFile, onClear, accent = 'light' }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith('image/')) onFile(f)
  }, [onFile])

  if (file && previewUrl) {
    return (
      <div className={cn(
        'relative flex flex-col items-center gap-2.5 rounded-xl border p-4',
        accent === 'dark'
          ? 'border-border bg-muted'
          : 'border-border bg-card',
      )}>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="checkerboard flex h-20 w-20 items-center justify-center rounded-lg">
          <img src={previewUrl} alt="preview" className="h-16 w-16 object-contain" />
        </div>
        <p className="max-w-[140px] truncate text-center text-[11px] text-muted-foreground">
          {file.name}
        </p>
        <button
          onClick={onClear}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex w-full flex-col items-center gap-3 rounded-xl border border-dashed p-8 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        dragging
          ? 'border-focus bg-blue-50 dark:bg-blue-900/10'
          : 'border-border bg-card hover:border-foreground/20 hover:bg-muted',
      )}
    >
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl',
        accent === 'dark' ? 'bg-accent' : 'bg-accent',
      )}>
        {accent === 'dark'
          ? <Moon className="h-5 w-5 text-muted-foreground" />
          : <Upload className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }}
      />
    </button>
  )
}

// ─── Icon card ────────────────────────────────────────────────────────────────

interface IconCardProps {
  icon: GeneratedIcon
  viewDark: boolean
}

function IconCard({ icon, viewDark }: IconCardProps) {
  const url  = viewDark && icon.darkUrl  ? icon.darkUrl  : icon.url
  const blob = viewDark && icon.darkBlob ? icon.darkBlob : icon.blob
  const displayPx = Math.min(Math.max(icon.size.width, 32), 64)
  const filename = icon.size.filename.split('/').pop()!

  return (
    <div className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-sm">
      <div
        className="checkerboard flex items-center justify-center rounded-lg"
        style={{ width: displayPx + 16, height: displayPx + 16 }}
      >
        <img
          src={url}
          alt={icon.size.label}
          style={{
            width:  displayPx,
            height: displayPx,
            imageRendering: icon.size.width <= 32 ? 'pixelated' : 'auto',
          }}
          className="object-contain"
        />
      </div>
      <div className="w-full text-center">
        <p className="text-[12px] font-semibold text-foreground">{icon.size.label}</p>
        <p className="truncate text-[10px] text-muted-foreground">{icon.size.description}</p>
      </div>
      <button
        onClick={() => downloadBlob(blob, filename)}
        className={cn(
          'flex w-full items-center justify-center gap-1 rounded-md px-2 py-1',
          'text-[10px] font-medium text-muted-foreground',
          'opacity-0 transition-opacity group-hover:opacity-100',
          'hover:bg-accent hover:text-foreground',
        )}
      >
        <Download className="h-3 w-3" />
        Download
      </button>
    </div>
  )
}

// ─── Platform card ────────────────────────────────────────────────────────────

interface PlatformCardProps {
  category: FaviconCategory
  state: CategoryState
  hasDarkFile: boolean
  viewDark: boolean
  onToggle: (enabled: boolean) => void
  onToggleViewDark: () => void
  onDownloadIco?: () => void
  onDownloadDarkIco?: () => void
}

function PlatformCard({
  category, state, hasDarkFile, viewDark,
  onToggle, onToggleViewDark,
  onDownloadIco, onDownloadDarkIco,
}: PlatformCardProps) {
  const [open, setOpen] = useState(true)
  const meta = CATEGORY_META[category]
  const Icon = CATEGORY_ICONS[category]

  return (
    <div className={cn(
      'overflow-hidden rounded-xl border transition-all duration-200',
      state.enabled
        ? 'border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
        : 'border-dashed border-border bg-muted/40 opacity-60',
    )}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Switch
          checked={state.enabled}
          onCheckedChange={onToggle}
          className="shrink-0"
        />

        <button
          onClick={() => state.enabled && setOpen(o => !o)}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <div className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            state.enabled ? 'bg-accent' : 'bg-accent/50',
          )}>
            <Icon className="h-4 w-4 text-foreground" />
          </div>
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span className={cn(
              'text-sm font-semibold',
              state.enabled ? 'text-foreground' : 'text-muted-foreground',
            )}>
              {meta.label}
            </span>
            <Badge variant={CATEGORY_BADGE[category]}>
              {meta.count} sizes
            </Badge>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {state.loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

          {state.enabled && state.icons.length > 0 && hasDarkFile && (
            <button
              onClick={e => { e.stopPropagation(); onToggleViewDark() }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors',
                viewDark
                  ? 'bg-foreground text-background'
                  : 'bg-accent text-foreground hover:bg-neutral-300 dark:hover:bg-neutral-600',
              )}
            >
              {viewDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
              {viewDark ? 'Dark' : 'Light'}
            </button>
          )}

          {state.enabled && state.icons.length > 0 && (
            <button
              onClick={() => setOpen(o => !o)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ICO download row for web */}
      {category === 'web' && state.enabled && state.icoBlob && (
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={onDownloadIco}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Download className="h-3.5 w-3.5" />
            favicon.ico
          </button>
          {hasDarkFile && state.darkIcoBlob && (
            <button
              onClick={onDownloadDarkIco}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Moon className="h-3.5 w-3.5" />
              favicon-dark.ico
            </button>
          )}
        </div>
      )}

      {/* Icon grid */}
      {state.enabled && state.icons.length > 0 && open && (
        <div className="grid grid-cols-3 gap-2.5 px-4 pb-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 animate-slide-up">
          {state.icons.map(icon => (
            <IconCard
              key={icon.size.filename}
              icon={icon}
              viewDark={viewDark}
            />
          ))}
        </div>
      )}

      {state.error && (
        <p className="px-4 pb-3 text-[12px] text-destructive">{state.error}</p>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const defaultCategoryState = (): CategoryState => ({
  enabled: false,
  loading: false,
  icons: [],
})

export default function FaviconGenerator() {
  const [lightFile,    setLightFile]    = useState<File | null>(null)
  const [lightPreview, setLightPreview] = useState<string | null>(null)
  const [darkFile,     setDarkFile]     = useState<File | null>(null)
  const [darkPreview,  setDarkPreview]  = useState<string | null>(null)
  const [darkModeOn,   setDarkModeOn]   = useState(false)
  const [appName,      setAppName]      = useState('my-app')
  const [zipping,      setZipping]      = useState(false)

  // Per-category state
  const [catStates, setCatStates] = useState<Record<FaviconCategory, CategoryState>>({
    web:     defaultCategoryState(),
    pwa:     defaultCategoryState(),
    ios:     defaultCategoryState(),
    android: defaultCategoryState(),
  })

  // Per-category dark view toggle (light vs dark preview)
  const [viewDark, setViewDark] = useState<Record<FaviconCategory, boolean>>({
    web: false, pwa: false, ios: false, android: false,
  })

  // Dynamic app favicon (updates browser tab immediately on upload)
  useAppFavicon(lightPreview, darkPreview)

  // Track active light/dark 32px preview URLs for the favicon hook
  // We use the file preview URL so it updates before generation

  // ── File handlers ──────────────────────────────────────────────────────────

  const setLight = (file: File) => {
    if (lightPreview) URL.revokeObjectURL(lightPreview)
    setLightFile(file)
    setLightPreview(URL.createObjectURL(file))
    // Invalidate all generated icons when source changes
    setCatStates(prev => {
      const next = { ...prev }
      for (const cat of CATEGORIES) {
        if (next[cat].icons.length) {
          revokeIcons(next[cat].icons)
          next[cat] = { ...next[cat], icons: [], icoBlob: undefined, darkIcoBlob: undefined }
        }
      }
      return next
    })
  }

  const clearLight = () => {
    if (lightPreview) URL.revokeObjectURL(lightPreview)
    setLightFile(null)
    setLightPreview(null)
    setCatStates({
      web: defaultCategoryState(), pwa: defaultCategoryState(),
      ios: defaultCategoryState(), android: defaultCategoryState(),
    })
  }

  const setDark = (file: File) => {
    if (darkPreview) URL.revokeObjectURL(darkPreview)
    setDarkFile(file)
    setDarkPreview(URL.createObjectURL(file))
    setCatStates(prev => {
      const next = { ...prev }
      for (const cat of CATEGORIES) {
        if (next[cat].icons.length) {
          revokeIcons(next[cat].icons)
          next[cat] = { ...next[cat], icons: [], icoBlob: undefined, darkIcoBlob: undefined }
        }
      }
      return next
    })
  }

  const clearDark = () => {
    if (darkPreview) URL.revokeObjectURL(darkPreview)
    setDarkFile(null)
    setDarkPreview(null)
  }

  // ── Category toggle ────────────────────────────────────────────────────────

  const handleCategoryToggle = useCallback(async (cat: FaviconCategory, enabled: boolean) => {
    if (!lightFile) return

    setCatStates(prev => ({ ...prev, [cat]: { ...prev[cat], enabled } }))
    if (!enabled) return

    // Already have icons → just re-enable display, no re-generation needed
    setCatStates(prev => {
      if (prev[cat].icons.length > 0) return prev
      return { ...prev, [cat]: { ...prev[cat], loading: true, error: undefined } }
    })

    try {
      const result = await generateForCategory(
        lightFile,
        darkModeOn ? (darkFile ?? null) : null,
        cat
      )
      setCatStates(prev => ({
        ...prev,
        [cat]: {
          enabled: true,
          loading: false,
          icons:        result.icons,
          icoBlob:      result.icoBlob,
          darkIcoBlob:  result.darkIcoBlob,
        },
      }))
    } catch {
      setCatStates(prev => ({
        ...prev,
        [cat]: { ...prev[cat], loading: false, error: 'Generation failed — please try again.' },
      }))
    }
  }, [lightFile, darkFile, darkModeOn])

  // Re-generate all active categories when the dark file changes
  useEffect(() => {
    if (!lightFile) return
    CATEGORIES.forEach(cat => {
      const s = catStates[cat]
      if (s.enabled && s.icons.length > 0) {
        handleCategoryToggle(cat, true)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkFile])

  // ── Download ───────────────────────────────────────────────────────────────

  const handleDownloadAll = async () => {
    setZipping(true)
    try {
      const map = new Map<FaviconCategory, typeof catStates['web']>()
      for (const cat of CATEGORIES) {
        if (catStates[cat].enabled && catStates[cat].icons.length > 0) {
          map.set(cat, catStates[cat])
        }
      }
      await downloadAllAsZip(map, darkModeOn && !!darkFile, appName || 'favicon')
    } finally {
      setZipping(false)
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const hasAnyIcons = CATEGORIES.some(c => catStates[c].icons.length > 0)
  const totalIcons  = CATEGORIES.reduce((n, c) => n + catStates[c].icons.length, 0)
  const hasDark     = darkModeOn && !!darkFile

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lightPreview) URL.revokeObjectURL(lightPreview)
      if (darkPreview)  URL.revokeObjectURL(darkPreview)
      CATEGORIES.forEach(cat => revokeIcons(catStates[cat].icons))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">

      {/* ── Hero ── */}
      <div className="text-center">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">
          Favicon Generator
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Upload one image. Get production-ready icons for every platform.
        </p>
      </div>

      {/* ── Step 1: Upload ── */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StepBadge n={1} />
            <h2 className="text-sm font-semibold text-foreground">Upload icon</h2>
          </div>
          <span className="text-[12px] text-muted-foreground">PNG · JPG · SVG · WebP</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <UploadZone
              label="Light / default"
              hint="Click to browse or drag & drop"
              file={lightFile}
              previewUrl={lightPreview}
              onFile={setLight}
              onClear={clearLight}
              accent="light"
            />
          </div>

          {/* Dark mode toggle */}
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Switch
              checked={darkModeOn}
              onCheckedChange={v => {
                setDarkModeOn(v)
                if (!v) clearDark()
              }}
              label="Dark icon"
            />
            {darkModeOn && (
              <p className="max-w-[100px] text-center text-[11px] text-muted-foreground">
                Optional separate icon for dark UIs
              </p>
            )}
          </div>

          {darkModeOn && (
            <div className="flex-1">
              <UploadZone
                label="Dark mode"
                hint="Uses light icon if skipped"
                file={darkFile}
                previewUrl={darkPreview}
                onFile={setDark}
                onClear={clearDark}
                accent="dark"
              />
            </div>
          )}
        </div>

        {/* App name */}
        <div className="mt-4">
          <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
            App name <span className="text-muted-foreground/60">(used in ZIP filename and manifest)</span>
          </label>
          <input
            type="text"
            value={appName}
            onChange={e => setAppName(e.target.value)}
            placeholder="my-app"
            className={cn(
              'h-8 w-full rounded-lg border border-border bg-background px-3',
              'text-[13px] text-foreground placeholder-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-focus transition-shadow',
            )}
          />
        </div>
      </section>

      {/* ── Step 2: Platforms ── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <StepBadge n={2} />
          <h2 className="text-sm font-semibold text-foreground">Select platforms</h2>
          {!lightFile && (
            <span className="text-[12px] text-muted-foreground">— upload an icon first</span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map(cat => (
            <PlatformCard
              key={cat}
              category={cat}
              state={catStates[cat]}
              hasDarkFile={hasDark}
              viewDark={viewDark[cat]}
              onToggle={enabled => {
                if (!lightFile) return
                handleCategoryToggle(cat, enabled)
              }}
              onToggleViewDark={() => setViewDark(prev => ({ ...prev, [cat]: !prev[cat] }))}
              onDownloadIco={
                catStates[cat].icoBlob
                  ? () => downloadBlob(catStates[cat].icoBlob!, 'favicon.ico')
                  : undefined
              }
              onDownloadDarkIco={
                catStates[cat].darkIcoBlob
                  ? () => downloadBlob(catStates[cat].darkIcoBlob!, 'favicon-dark.ico')
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {/* ── Step 3: Download ── */}
      {hasAnyIcons && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)] animate-slide-up">
          <div className="mb-4 flex items-center gap-2">
            <StepBadge n={3} />
            <h2 className="text-sm font-semibold text-foreground">Download</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadAll} loading={zipping} size="md" className="gap-2">
              <Archive className="h-4 w-4" />
              Download ZIP
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                {totalIcons + (hasDark ? totalIcons : 0) + (catStates.web.icoBlob ? 1 : 0)} files
              </span>
            </Button>
          </div>

          <p className="mt-3 text-[12px] text-muted-foreground">
            ZIP includes{' '}
            <code className="rounded bg-accent px-1 py-0.5 text-[11px]">favicon.ico</code>,
            all PNGs, a demo{' '}
            <code className="rounded bg-accent px-1 py-0.5 text-[11px]">index.html</code>{' '}
            with previews, and a{' '}
            <code className="rounded bg-accent px-1 py-0.5 text-[11px]">manifest.webmanifest</code>.
          </p>
        </section>
      )}

      {/* ── Empty hint ── */}
      {!lightFile && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14">
          <div className="flex gap-3 opacity-30">
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat]
              return (
                <div key={cat} className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
              )
            })}
          </div>
          <p className="text-[13px] text-muted-foreground">
            Upload an icon to get started
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Step badge ───────────────────────────────────────────────────────────────

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
      {n}
    </span>
  )
}
