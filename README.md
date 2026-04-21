```ascii
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║  FAVICON GENERATOR                                                    ║
║                                                                       ║
║  BROWSER-NATIVE · ZERO UPLOADS · REACT 18 · VITE · TAILWIND         ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

Upload one image. Get production-ready favicons for every platform — Web, PWA/React, iOS/Apple, and Android — all processed locally in your browser. Nothing is ever uploaded to a server.

**Live app → [favicon-generator-petermarc.vercel.app](https://favicon-generator-petermarc.vercel.app)**&nbsp;&nbsp;·&nbsp;&nbsp;**[Report a bug](https://github.com/petermarciniak/favicon-generator/issues/new?template=bug_report.yml)**

<br>

## ▓▓▓ FEATURES

```
PLATFORMS        Web/Browser · PWA/React · iOS/Apple · Android
SIZES            27 icon sizes across all platforms
OUTPUT           PNG files + favicon.ico (16, 32, 48 px embedded)
DARK MODE        Optional separate icon for dark UIs
DYNAMIC FAVICON  Browser tab updates live as you upload
SYSTEM SYNC      Favicon switches with OS dark/light mode
TOGGLE-BASED     Enable only the platforms you need
ZIP DOWNLOAD     All icons + demo index.html + manifest.webmanifest
PRIVACY          100% local — Canvas API, no server, no tracking
```

<br>

## ▓▓▓ HOW IT WORKS

```
1. Upload  →  Drop your PNG, SVG, JPG or WebP (any size or aspect ratio)
2. Select  →  Toggle on the platforms you want to generate for
3. Preview →  See all icons in a live grid with light/dark toggle
4. Download→  Grab the full ZIP with everything ready to deploy
```

Icons are generated with the browser's **Canvas API** using high-quality bilinear downscaling. The source image is scaled in **contain mode** — preserving aspect ratio and centering — so no distortion or cropping occurs regardless of the source dimensions.

The `favicon.ico` is built as a **PNG-inside-ICO** container (no legacy BMP/XOR mask), which renders transparently in all modern browsers including Edge Chromium.

<br>

## ▓▓▓ ICON SIZES

<table>
<tr>
<td width="25%" valign="top">

**Web / Browser**
```
16×16   Browser tab
32×32   Browser tab HiDPI
48×48   Windows site icon
64×64   Windows shortcut
96×96   GoogleTV
```

</td>
<td width="25%" valign="top">

**PWA / React**
```
72×72   Small
128×128 Chrome Web Store
144×144 Splash screen
192×192 Android Chrome
256×256 Large
512×512 Maskable
```

</td>
<td width="25%" valign="top">

**iOS / Apple**
```
57×57   iPhone non-retina
60×60   iPhone iOS 7+
72×72   iPad non-retina
76×76   iPad iOS 7+
114×114 iPhone retina
120×120 iPhone retina 7+
152×152 iPad retina 7+
180×180 iPhone 6 Plus ★
```

</td>
<td width="25%" valign="top">

**Android**
```
36×36   ldpi  (0.75×)
48×48   mdpi  (1×)
72×72   hdpi  (1.5×)
96×96   xhdpi (2×)
144×144 xxhdpi (3×)
192×192 xxxhdpi (4×)
```

</td>
</tr>
</table>

<br>

## ▓▓▓ ZIP CONTENTS

```
favicon.ico                        ← Multi-size ICO (16, 32, 48 px)
favicon-16x16.png
favicon-32x32.png
... (all web PNGs)
icon-192x192.png
icon-512x512.png
... (all PWA PNGs)
apple-touch-icon.png
apple-touch-icon-*.png
... (all iOS PNGs)
android/mipmap-*/ic_launcher.png   ← Organised by density folder
... (all Android PNGs)
index.html                         ← Demo page — open in browser to test favicon
manifest.webmanifest               ← PWA manifest snippet

# With dark mode enabled:
favicon-dark.ico
*-dark.png                         ← Dark variants alongside each light file
```

<br>

## ▓▓▓ DARK MODE FAVICONS

Enable the **Dark icon** toggle to upload a separate variant. The app will:

- Include all dark-variant PNGs in the ZIP alongside light ones
- Generate a separate `favicon-dark.ico`
- Switch the browser tab favicon live as you toggle OS dark/light mode
- Include `<link media="(prefers-color-scheme: …)">` tags in the demo HTML

To use dark favicons in production, add both `<link>` tags to your `<head>`:

```html
<link rel="icon" sizes="32x32" href="/favicon-32x32.png"      media="(prefers-color-scheme: light)">
<link rel="icon" sizes="32x32" href="/favicon-32x32-dark.png" media="(prefers-color-scheme: dark)">
```

<br>

## ▓▓▓ STACK

<table>
<tr>
<td width="50%" valign="top">

**CORE**
```
React 18 + TypeScript
Vite 5
Tailwind CSS 3
Geist font (Vercel)
```

</td>
<td width="50%" valign="top">

**GENERATION**
```
Canvas API (browser-native)
JSZip (ZIP creation)
PNG-in-ICO (manual builder)
No server, no backend
```

</td>
</tr>
</table>

<br>

## ▓▓▓ RUN LOCALLY

```bash
git clone https://github.com/petermarciniak/favicon-generator
cd favicon-generator
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build     # Production build → dist/
npm run preview   # Preview the production build
```

<br>

## ▓▓▓ EDGE / TRANSPARENCY QA

A commonly reported issue: _"transparent favicons show a 1px line on the right in Edge."_

This is a **legacy EdgeHTML bug** (pre-2020 Edge) caused by incorrect XOR mask rendering in the old BMP-based ICO format. This app generates **PNG-inside-ICO** files — a modern format that embeds raw PNG data with native alpha channels, skipping the XOR mask entirely. Edge Chromium (2020+), Chrome, Firefox, and Safari all render these correctly. The risk of the artifact is effectively zero for any browser released after 2020.

<br>

---

## ▓▓▓ CHANGELOG

### v1.1.0 — 2026-04-21

**New**
- Platform toggles — Web, PWA/React, iOS/Apple, Android each generate independently; nothing pre-generated on load
- Live browser tab favicon — tab icon updates the moment a source image is uploaded
- System dark mode sync — favicon switches to the dark variant when OS changes to dark mode
- Demo `index.html` in ZIP — open in a browser to confirm the favicon is live; shows all sizes as a visual grid

**Improved**
- Aspect ratio fix — contain-mode scaling (centered, no stretch) prevents distorted or cropped icons for non-square source images
- fluid-ui design system — neutral palette, Geist variable font, rebuilt Button / Badge / Card / Switch components
- Per-category light ↔ dark preview toggle in each platform section
- Privacy note in footer — all processing runs locally, zero uploads

**Fixed**
- PNG-inside-ICO format (no BMP/XOR mask) — eliminates legacy EdgeHTML "1px right-edge line" artifact on transparent icons

---

### v1.0.0 — 2026-04-21

**Initial release**
- Upload PNG · SVG · JPG · WebP source image
- Generate 27 favicon sizes across Web, PWA/React, iOS/Apple, Android
- Optional dark-mode icon with separate upload zone
- favicon.ico builder (16 × 32 × 48 px, PNG-in-ICO)
- Download all as ZIP with PWA manifest snippet and HTML `<link>` tags
- Light / dark mode UI with system preference detection

---

<div align="center">

```
Built by Peter Marciniak — product designer building with AI
```

**[← Back to profile](https://github.com/petermarciniak)**&nbsp;&nbsp;·&nbsp;&nbsp;**[Report a bug](https://github.com/petermarciniak/favicon-generator/issues/new?template=bug_report.yml)**

</div>
