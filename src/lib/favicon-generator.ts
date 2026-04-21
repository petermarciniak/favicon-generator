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

export interface GenerationResult {
  icons: GeneratedIcon[]
  faviconIco: Blob
  darkFaviconIco?: Blob
}

export const FAVICON_SIZES: FaviconSize[] = [
  // Web/Browser
  { width: 16, height: 16, label: '16×16', filename: 'favicon-16x16.png', category: 'web', description: 'Browser tab' },
  { width: 32, height: 32, label: '32×32', filename: 'favicon-32x32.png', category: 'web', description: 'Browser tab (HiDPI)' },
  { width: 48, height: 48, label: '48×48', filename: 'favicon-48x48.png', category: 'web', description: 'Windows site icon' },
  { width: 64, height: 64, label: '64×64', filename: 'favicon-64x64.png', category: 'web', description: 'Windows shortcut' },
  { width: 96, height: 96, label: '96×96', filename: 'favicon-96x96.png', category: 'web', description: 'GoogleTV icon' },
  // PWA / React
  { width: 72, height: 72, label: '72×72', filename: 'icon-72x72.png', category: 'pwa', description: 'PWA small' },
  { width: 128, height: 128, label: '128×128', filename: 'icon-128x128.png', category: 'pwa', description: 'Chrome Web Store' },
  { width: 144, height: 144, label: '144×144', filename: 'icon-144x144.png', category: 'pwa', description: 'PWA splash screen' },
  { width: 192, height: 192, label: '192×192', filename: 'icon-192x192.png', category: 'pwa', description: 'Android Chrome' },
  { width: 256, height: 256, label: '256×256', filename: 'icon-256x256.png', category: 'pwa', description: 'PWA large' },
  { width: 512, height: 512, label: '512×512', filename: 'icon-512x512.png', category: 'pwa', description: 'Android Chrome (maskable)' },
  // iOS / Apple
  { width: 57, height: 57, label: '57×57', filename: 'apple-touch-icon-57x57.png', category: 'ios', description: 'iPhone non-retina' },
  { width: 60, height: 60, label: '60×60', filename: 'apple-touch-icon-60x60.png', category: 'ios', description: 'iPhone iOS 7+' },
  { width: 72, height: 72, label: '72×72', filename: 'apple-touch-icon-72x72.png', category: 'ios', description: 'iPad non-retina' },
  { width: 76, height: 76, label: '76×76', filename: 'apple-touch-icon-76x76.png', category: 'ios', description: 'iPad iOS 7+' },
  { width: 114, height: 114, label: '114×114', filename: 'apple-touch-icon-114x114.png', category: 'ios', description: 'iPhone retina' },
  { width: 120, height: 120, label: '120×120', filename: 'apple-touch-icon-120x120.png', category: 'ios', description: 'iPhone retina iOS 7+' },
  { width: 152, height: 152, label: '152×152', filename: 'apple-touch-icon-152x152.png', category: 'ios', description: 'iPad retina iOS 7+' },
  { width: 180, height: 180, label: '180×180', filename: 'apple-touch-icon.png', category: 'ios', description: 'iPhone 6 Plus (recommended)' },
  // Android
  { width: 36, height: 36, label: '36×36', filename: 'android/mipmap-ldpi/ic_launcher.png', category: 'android', description: 'ldpi (0.75×)' },
  { width: 48, height: 48, label: '48×48', filename: 'android/mipmap-mdpi/ic_launcher.png', category: 'android', description: 'mdpi (baseline)' },
  { width: 72, height: 72, label: '72×72', filename: 'android/mipmap-hdpi/ic_launcher.png', category: 'android', description: 'hdpi (1.5×)' },
  { width: 96, height: 96, label: '96×96', filename: 'android/mipmap-xhdpi/ic_launcher.png', category: 'android', description: 'xhdpi (2×)' },
  { width: 144, height: 144, label: '144×144', filename: 'android/mipmap-xxhdpi/ic_launcher.png', category: 'android', description: 'xxhdpi (3×)' },
  { width: 192, height: 192, label: '192×192', filename: 'android/mipmap-xxxhdpi/ic_launcher.png', category: 'android', description: 'xxxhdpi (4×)' },
]

export const CATEGORY_META: Record<FaviconCategory, { label: string; color: string }> = {
  web: { label: 'Web / Browser', color: 'blue' },
  pwa: { label: 'PWA / React', color: 'purple' },
  ios: { label: 'iOS / Apple', color: 'gray' },
  android: { label: 'Android', color: 'green' },
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function resizeImage(img: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    )
  })
}

async function buildIcoFile(blobs: Array<{ size: number; blob: Blob }>): Promise<Blob> {
  const buffers = await Promise.all(blobs.map(({ blob }) => blob.arrayBuffer()))
  const count = blobs.length
  const headerSize = 6
  const entrySize = 16
  const dataOffset = headerSize + entrySize * count
  const totalSize = dataOffset + buffers.reduce((sum, b) => sum + b.byteLength, 0)

  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  // ICONDIR
  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true) // type = icon
  view.setUint16(4, count, true)

  let offset = dataOffset
  blobs.forEach(({ size }, i) => {
    const base = headerSize + i * entrySize
    const buf = buffers[i]
    view.setUint8(base + 0, size >= 256 ? 0 : size)
    view.setUint8(base + 1, size >= 256 ? 0 : size)
    view.setUint8(base + 2, 0)
    view.setUint8(base + 3, 0)
    view.setUint16(base + 4, 1, true)
    view.setUint16(base + 6, 32, true)
    view.setUint32(base + 8, buf.byteLength, true)
    view.setUint32(base + 12, offset, true)
    bytes.set(new Uint8Array(buf), offset)
    offset += buf.byteLength
  })

  return new Blob([buffer], { type: 'image/x-icon' })
}

export async function fileToObjectURL(file: File): Promise<string> {
  return URL.createObjectURL(file)
}

export async function generateFavicons(
  lightFile: File,
  darkFile?: File
): Promise<GenerationResult> {
  const lightUrl = URL.createObjectURL(lightFile)
  const lightImg = await loadImage(lightUrl)
  URL.revokeObjectURL(lightUrl)

  let darkImg: HTMLImageElement | undefined
  if (darkFile) {
    const darkUrl = URL.createObjectURL(darkFile)
    darkImg = await loadImage(darkUrl)
    URL.revokeObjectURL(darkUrl)
  }

  const icons: GeneratedIcon[] = await Promise.all(
    FAVICON_SIZES.map(async (size) => {
      const canvas = resizeImage(lightImg, size.width, size.height)
      const blob = await canvasToBlob(canvas)
      const url = URL.createObjectURL(blob)

      let darkBlob: Blob | undefined
      let darkUrl: string | undefined
      if (darkImg) {
        const darkCanvas = resizeImage(darkImg, size.width, size.height)
        darkBlob = await canvasToBlob(darkCanvas)
        darkUrl = URL.createObjectURL(darkBlob)
      }

      return { size, blob, url, darkBlob, darkUrl }
    })
  )

  // Build favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48]
  const icoBlobs = await Promise.all(
    icoSizes.map(async (s) => {
      const canvas = resizeImage(lightImg, s, s)
      const blob = await canvasToBlob(canvas)
      return { size: s, blob }
    })
  )
  const faviconIco = await buildIcoFile(icoBlobs)

  let darkFaviconIco: Blob | undefined
  if (darkImg) {
    const darkIcoBlobs = await Promise.all(
      icoSizes.map(async (s) => {
        const canvas = resizeImage(darkImg!, s, s)
        const blob = await canvasToBlob(canvas)
        return { size: s, blob }
      })
    )
    darkFaviconIco = await buildIcoFile(darkIcoBlobs)
  }

  return { icons, faviconIco, darkFaviconIco }
}

export function revokeGenerationResult(result: GenerationResult) {
  result.icons.forEach((icon) => {
    URL.revokeObjectURL(icon.url)
    if (icon.darkUrl) URL.revokeObjectURL(icon.darkUrl)
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadAllAsZip(
  result: GenerationResult,
  includeDark: boolean,
  appName = 'favicon'
) {
  const zip = new JSZip()

  // favicon.ico
  zip.file('favicon.ico', result.faviconIco)

  // All PNG icons
  for (const icon of result.icons) {
    zip.file(icon.size.filename, icon.blob)
    if (includeDark && icon.darkBlob) {
      const parts = icon.size.filename.split('.')
      const darkFilename = parts.slice(0, -1).join('.') + '-dark.' + parts[parts.length - 1]
      zip.file(darkFilename, icon.darkBlob)
    }
  }

  if (includeDark && result.darkFaviconIco) {
    zip.file('favicon-dark.ico', result.darkFaviconIco)
  }

  // HTML snippet
  const htmlSnippet = generateHtmlSnippet(includeDark)
  zip.file('README_html_snippet.html', htmlSnippet)

  // Web manifest snippet
  const manifest = generateManifestSnippet(appName)
  zip.file('manifest_snippet.json', manifest)

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${appName}-favicons.zip`)
}

function generateHtmlSnippet(includeDark: boolean): string {
  const lightLinks = `<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`

  const darkLinks = includeDark
    ? `
<!-- Dark mode favicons (requires JS or prefers-color-scheme media) -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32-dark.png" media="(prefers-color-scheme: dark)">`
    : ''

  return `<!-- Paste this into your <head> -->
${lightLinks}${darkLinks}
`
}

function generateManifestSnippet(appName: string): string {
  return JSON.stringify(
    {
      name: appName,
      short_name: appName,
      icons: [
        { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    },
    null,
    2
  )
}
