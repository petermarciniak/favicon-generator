import JSZip from 'jszip'

export type FaviconCategory = 'web' | 'pwa' | 'ios' | 'android'

export interface FaviconSize {
  width: number
  height: number
  label: string
  filename: string
  category: FaviconCategory
  description: string
}

export interface GeneratedIcon {
  size: FaviconSize
  blob: Blob
  url: string
  darkBlob?: Blob
  darkUrl?: string
}

export interface CategoryResult {
  category: FaviconCategory
  icons: GeneratedIcon[]
}

export const FAVICON_SIZES: FaviconSize[] = [
  // Web/Browser
  { width: 16,  height: 16,  label: '16×16',   filename: 'favicon-16x16.png',           category: 'web',     description: 'Browser tab' },
  { width: 32,  height: 32,  label: '32×32',   filename: 'favicon-32x32.png',           category: 'web',     description: 'Browser tab (HiDPI)' },
  { width: 48,  height: 48,  label: '48×48',   filename: 'favicon-48x48.png',           category: 'web',     description: 'Windows site icon' },
  { width: 64,  height: 64,  label: '64×64',   filename: 'favicon-64x64.png',           category: 'web',     description: 'Windows shortcut' },
  { width: 96,  height: 96,  label: '96×96',   filename: 'favicon-96x96.png',           category: 'web',     description: 'GoogleTV' },
  // PWA / React
  { width: 72,  height: 72,  label: '72×72',   filename: 'icon-72x72.png',              category: 'pwa',     description: 'PWA small' },
  { width: 128, height: 128, label: '128×128', filename: 'icon-128x128.png',            category: 'pwa',     description: 'Chrome Web Store' },
  { width: 144, height: 144, label: '144×144', filename: 'icon-144x144.png',            category: 'pwa',     description: 'PWA splash screen' },
  { width: 192, height: 192, label: '192×192', filename: 'icon-192x192.png',            category: 'pwa',     description: 'Android Chrome' },
  { width: 256, height: 256, label: '256×256', filename: 'icon-256x256.png',            category: 'pwa',     description: 'PWA large' },
  { width: 512, height: 512, label: '512×512', filename: 'icon-512x512.png',            category: 'pwa',     description: 'Android Chrome maskable' },
  // iOS / Apple
  { width: 57,  height: 57,  label: '57×57',   filename: 'apple-touch-icon-57x57.png',  category: 'ios',     description: 'iPhone non-retina' },
  { width: 60,  height: 60,  label: '60×60',   filename: 'apple-touch-icon-60x60.png',  category: 'ios',     description: 'iPhone iOS 7+' },
  { width: 72,  height: 72,  label: '72×72',   filename: 'apple-touch-icon-72x72.png',  category: 'ios',     description: 'iPad non-retina' },
  { width: 76,  height: 76,  label: '76×76',   filename: 'apple-touch-icon-76x76.png',  category: 'ios',     description: 'iPad iOS 7+' },
  { width: 114, height: 114, label: '114×114', filename: 'apple-touch-icon-114x114.png',category: 'ios',     description: 'iPhone retina' },
  { width: 120, height: 120, label: '120×120', filename: 'apple-touch-icon-120x120.png',category: 'ios',     description: 'iPhone retina iOS 7+' },
  { width: 152, height: 152, label: '152×152', filename: 'apple-touch-icon-152x152.png',category: 'ios',     description: 'iPad retina iOS 7+' },
  { width: 180, height: 180, label: '180×180', filename: 'apple-touch-icon.png',         category: 'ios',     description: 'iPhone 6 Plus (recommended)' },
  // Android
  { width: 36,  height: 36,  label: '36×36',   filename: 'android/mipmap-ldpi/ic_launcher.png',   category: 'android', description: 'ldpi (0.75×)' },
  { width: 48,  height: 48,  label: '48×48',   filename: 'android/mipmap-mdpi/ic_launcher.png',   category: 'android', description: 'mdpi (baseline)' },
  { width: 72,  height: 72,  label: '72×72',   filename: 'android/mipmap-hdpi/ic_launcher.png',   category: 'android', description: 'hdpi (1.5×)' },
  { width: 96,  height: 96,  label: '96×96',   filename: 'android/mipmap-xhdpi/ic_launcher.png',  category: 'android', description: 'xhdpi (2×)' },
  { width: 144, height: 144, label: '144×144', filename: 'android/mipmap-xxhdpi/ic_launcher.png', category: 'android', description: 'xxhdpi (3×)' },
  { width: 192, height: 192, label: '192×192', filename: 'android/mipmap-xxxhdpi/ic_launcher.png',category: 'android', description: 'xxxhdpi (4×)' },
]

export const CATEGORY_META: Record<FaviconCategory, { label: string; count: number }> = {
  web:     { label: 'Web / Browser', count: FAVICON_SIZES.filter(s => s.category === 'web').length },
  pwa:     { label: 'PWA / React',   count: FAVICON_SIZES.filter(s => s.category === 'pwa').length },
  ios:     { label: 'iOS / Apple',   count: FAVICON_SIZES.filter(s => s.category === 'ios').length },
  android: { label: 'Android',       count: FAVICON_SIZES.filter(s => s.category === 'android').length },
}

// ─── Image helpers ────────────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Resize image onto a canvas using "contain" logic: the image is scaled to fit
 * inside the target dimensions while preserving aspect ratio and centered.
 * This prevents distortion and cropping for non-square source images.
 */
function resizeImage(img: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const srcW = img.naturalWidth  || img.width
  const srcH = img.naturalHeight || img.height

  // Contain: scale uniformly so the image fits entirely within (w, h)
  const scale = Math.min(width / srcW, height / srcH)
  const scaledW = Math.round(srcW * scale)
  const scaledH = Math.round(srcH * scale)
  const x = Math.round((width  - scaledW) / 2)
  const y = Math.round((height - scaledH) / 2)

  ctx.drawImage(img, x, y, scaledW, scaledH)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))),
      'image/png'
    )
  )
}

// ─── ICO builder ─────────────────────────────────────────────────────────────

/**
 * Builds an ICO file by embedding PNG data for each size.
 * PNG-in-ICO avoids the legacy BMP XOR-mask that caused 1px edge artifacts in
 * old EdgeHTML; modern browsers (including Edge Chromium) handle it correctly.
 */
async function buildIcoFile(entries: Array<{ size: number; blob: Blob }>): Promise<Blob> {
  const buffers = await Promise.all(entries.map(e => e.blob.arrayBuffer()))
  const count   = entries.length
  const headerSz = 6
  const entrySz  = 16
  const dataStart = headerSz + entrySz * count
  const total = dataStart + buffers.reduce((s, b) => s + b.byteLength, 0)

  const buf  = new ArrayBuffer(total)
  const view = new DataView(buf)
  const u8   = new Uint8Array(buf)

  // ICONDIR
  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type = 1 (ICO)
  view.setUint16(4, count, true)

  let offset = dataStart
  entries.forEach(({ size }, i) => {
    const base = headerSz + i * entrySz
    const len  = buffers[i].byteLength
    view.setUint8 (base + 0, size >= 256 ? 0 : size) // width  (0 = 256)
    view.setUint8 (base + 1, size >= 256 ? 0 : size) // height
    view.setUint8 (base + 2, 0)                      // color count
    view.setUint8 (base + 3, 0)                      // reserved
    view.setUint16(base + 4, 0,   true)              // planes (0 for PNG-in-ICO per spec)
    view.setUint16(base + 6, 0,   true)              // bit count (0 for PNG-in-ICO per spec)
    view.setUint32(base + 8, len, true)              // bytes in resource
    view.setUint32(base + 12, offset, true)          // offset to resource
    u8.set(new Uint8Array(buffers[i]), offset)
    offset += len
  })

  return new Blob([buf], { type: 'image/x-icon' })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateForCategory(
  lightFile: File,
  darkFile: File | null,
  category: FaviconCategory
): Promise<{ icons: GeneratedIcon[]; icoBlob?: Blob; darkIcoBlob?: Blob }> {
  const lightUrl = URL.createObjectURL(lightFile)
  const lightImg = await loadImage(lightUrl)
  URL.revokeObjectURL(lightUrl)

  let darkImg: HTMLImageElement | undefined
  if (darkFile) {
    const dUrl = URL.createObjectURL(darkFile)
    darkImg = await loadImage(dUrl)
    URL.revokeObjectURL(dUrl)
  }

  const sizes = FAVICON_SIZES.filter(s => s.category === category)

  const icons: GeneratedIcon[] = await Promise.all(
    sizes.map(async size => {
      const blob = await canvasToBlob(resizeImage(lightImg, size.width, size.height))
      const url  = URL.createObjectURL(blob)

      let darkBlob: Blob | undefined
      let darkUrl: string | undefined
      if (darkImg) {
        darkBlob = await canvasToBlob(resizeImage(darkImg, size.width, size.height))
        darkUrl  = URL.createObjectURL(darkBlob)
      }
      return { size, blob, url, darkBlob, darkUrl }
    })
  )

  // Only web category gets an ICO
  let icoBlob: Blob | undefined
  let darkIcoBlob: Blob | undefined
  if (category === 'web') {
    const icoSizes = [16, 32, 48]
    const lightEntries = await Promise.all(
      icoSizes.map(async s => ({ size: s, blob: await canvasToBlob(resizeImage(lightImg, s, s)) }))
    )
    icoBlob = await buildIcoFile(lightEntries)

    if (darkImg) {
      const darkEntries = await Promise.all(
        icoSizes.map(async s => ({ size: s, blob: await canvasToBlob(resizeImage(darkImg!, s, s)) }))
      )
      darkIcoBlob = await buildIcoFile(darkEntries)
    }
  }

  return { icons, icoBlob, darkIcoBlob }
}

export function revokeIcons(icons: GeneratedIcon[]) {
  icons.forEach(i => {
    URL.revokeObjectURL(i.url)
    if (i.darkUrl) URL.revokeObjectURL(i.darkUrl)
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadAllAsZip(
  categoryResults: Map<FaviconCategory, { icons: GeneratedIcon[]; icoBlob?: Blob; darkIcoBlob?: Blob }>,
  hasDark: boolean,
  appName = 'favicon'
) {
  const zip = new JSZip()

  const icoEntry = categoryResults.get('web')
  if (icoEntry?.icoBlob)     zip.file('favicon.ico',      icoEntry.icoBlob)
  if (hasDark && icoEntry?.darkIcoBlob) zip.file('favicon-dark.ico', icoEntry.darkIcoBlob)

  for (const { icons } of categoryResults.values()) {
    for (const icon of icons) {
      zip.file(icon.size.filename, icon.blob)
      if (hasDark && icon.darkBlob) {
        const parts = icon.size.filename.split('.')
        const darkName = parts.slice(0, -1).join('.') + '-dark.' + parts[parts.length - 1]
        zip.file(darkName, icon.darkBlob)
      }
    }
  }

  zip.file('index.html',         buildDemoHtml(categoryResults, hasDark, appName))
  zip.file('manifest.webmanifest', buildManifest(appName))

  downloadBlob(await zip.generateAsync({ type: 'blob' }), `${appName}-favicons.zip`)
}

// ─── ZIP extras ───────────────────────────────────────────────────────────────

function buildDemoHtml(
  results: Map<FaviconCategory, { icons: GeneratedIcon[] }>,
  hasDark: boolean,
  appName: string
): string {
  const hasWeb = results.has('web')
  const hasPwa = results.has('pwa')
  const hasIos = results.has('ios')

  const linkTags = [
    hasWeb ? `  <link rel="icon" type="image/x-icon" href="favicon.ico">` : '',
    hasWeb ? `  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">` : '',
    hasWeb ? `  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">` : '',
    hasIos ? `  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">` : '',
    hasPwa ? `  <link rel="manifest" href="manifest.webmanifest">` : '',
    hasDark && hasWeb
      ? [
          `  <!-- Dark mode favicon (swap with JS or prefers-color-scheme) -->`,
          `  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png"      media="(prefers-color-scheme: light)">`,
          `  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32-dark.png" media="(prefers-color-scheme: dark)">`,
        ].join('\n')
      : '',
  ].filter(Boolean).join('\n')

  const allIcons = [...results.values()].flatMap(r => r.icons)

  const iconCards = allIcons
    .map(icon => {
      const filename = icon.size.filename.split('/').pop()!
      const displaySize = Math.min(icon.size.width, 64)
      return `      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;border:1px solid #e5e5e5;border-radius:10px;background:#fff;">
        <div style="background:repeating-conic-gradient(#e2e8f0 0% 25%,#fff 0% 50%) 0/12px 12px;border-radius:6px;padding:6px;">
          <img src="${icon.size.filename}" width="${displaySize}" height="${displaySize}" alt="${icon.size.label}" style="display:block;">
        </div>
        <span style="font-size:11px;font-weight:600;color:#171717;">${icon.size.label}</span>
        <span style="font-size:10px;color:#737373;">${icon.size.description}</span>
        <a href="${filename}" download style="font-size:10px;color:#6B97FF;">Download</a>
      </div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName} — Favicon Preview</title>
${linkTags}
  <style>
    body { font-family: system-ui, sans-serif; background: #fafafa; color: #171717; margin: 0; padding: 32px 24px; }
    h1   { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
    p    { color: #737373; font-size: 14px; margin: 0 0 32px; }
    .grid{ display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
    @media (prefers-color-scheme: dark) {
      body { background: #171717; color: #f5f5f5; }
      h1   { color: #f5f5f5; }
      div[style*="border:1px"] { border-color: #404040 !important; background: #262626 !important; }
      span[style*="color:#171717"] { color: #f5f5f5 !important; }
    }
  </style>
</head>
<body>
  <h1>${appName} — Favicon Preview</h1>
  <p>Check your browser tab — the favicon should be active. Open DevTools → Elements to inspect the &lt;link&gt; tags.</p>
  <div class="grid">
${iconCards}
  </div>
</body>
</html>
`
}

function buildManifest(appName: string): string {
  return JSON.stringify({
    name: appName,
    short_name: appName,
    icons: [
      { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  }, null, 2)
}
