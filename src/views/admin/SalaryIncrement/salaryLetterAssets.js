// Letterhead artwork, prepared once and reused by every letter in a bulk export.
//
// This is the single most important optimisation in the export. The five
// letterhead images ship as PNGs totalling ~282 KB of source art sized for
// screen (the logo alone is 1958 px wide, rendered at 180). Embedding those
// verbatim into 2,500 separate PDFs would mean 2,500 decodes, 2,500 re-encodes
// and roughly 700 MB of output.
//
// Instead we decode each image once, scale it to exactly the size it occupies
// on an A4 page at print resolution, and encode it once. The resulting bytes
// are then handed to every PDF by reference — per-letter image cost becomes a
// buffer copy instead of an image pipeline, i.e. O(1) work per letter for
// something that is naively O(source pixels) per letter.
//
// The prepared set is memoised at module level, so a second export in the same
// session reuses the first one's work entirely.

import logoImage from '../Letters/logo.png'
import watermarkImage from '../Letters/watermark.png'
import stampImage from '../Letters/stamp.png'
import socialImage from '../Letters/social.png'
import ceoSignature from '../Letters/ceo_signature.png'

import { MM_PER_PX, PAGE_W_MM } from './salaryLetterGeometry'
import { FOOTER_LINES } from './salaryLetterContent'

// Target raster resolution for letterhead chrome.
//
// This number is multiplied by 2,500, so it is worth being deliberate about.
// 175 DPI on artwork that occupies 30-48mm of the page is comfortably past what
// reads as sharp in print, while costing about a quarter less than 200 DPI. The
// text of the letter is vector and unaffected either way — this only governs
// the logo, stamp, signature and social strip.
const CHROME_DPI = 175
const CHROME_QUALITY = 0.78

// The watermark sits at 7% opacity behind the text. It is decorative and, at
// that contrast, almost a flat field — so it is rasterised far coarser and
// encoded at low quality, where the artefacts are mathematically present and
// visually undetectable.
const WATERMARK_DPI = 40

const mmToPx = (mm, dpi) => Math.round((mm / 25.4) * dpi)

// Rendered widths, taken straight from the CSS in SalaryIncrementLetterPrint.js
// so the two stay in step.
const SPECS = {
  logo: { src: logoImage, widthMm: 180 * MM_PER_PX, dpi: CHROME_DPI, quality: CHROME_QUALITY },
  stamp: { src: stampImage, widthMm: 130 * MM_PER_PX, dpi: CHROME_DPI, quality: CHROME_QUALITY },
  signature: {
    src: ceoSignature,
    widthMm: 160 * MM_PER_PX,
    dpi: CHROME_DPI,
    quality: CHROME_QUALITY,
  },
  social: {
    src: socialImage,
    widthMm: 110 * MM_PER_PX,
    dpi: CHROME_DPI,
    quality: CHROME_QUALITY,
  },
  watermark: {
    src: watermarkImage,
    // background-size: 150% of the page width.
    widthMm: PAGE_W_MM * 1.5,
    dpi: WATERMARK_DPI,
    quality: 0.45,
    // background-position/opacity from the same CSS.
    opacity: 0.07,
  },
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load letterhead image: ${src}`))
    img.src = src
  })

// Scales one image to its print size and returns JPEG bytes.
//
// JPEG rather than PNG because the page underneath is white and none of this
// artwork needs an alpha channel on paper — flattening onto white first gives
// the same result at a fraction of the size. That flattening is also what lets
// the watermark be baked at 7% here instead of needing a PDF transparency
// group at render time.
const prepare = async (spec) => {
  const img = await loadImage(spec.src)
  const targetW = Math.min(img.naturalWidth, mmToPx(spec.widthMm, spec.dpi))
  const scale = targetW / img.naturalWidth
  const targetH = Math.max(1, Math.round(img.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, targetW)
  canvas.height = targetH
  const ctx = canvas.getContext('2d')

  // White ground first: JPEG has no alpha, and the A4 page is white anyway.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (spec.opacity !== undefined) ctx.globalAlpha = spec.opacity
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1

  const dataUrl = canvas.toDataURL('image/jpeg', spec.quality)

  return {
    dataUrl,
    widthMm: spec.widthMm,
    heightMm: spec.widthMm * (img.naturalHeight / img.naturalWidth),
    // Rough encoded size, used to show the admin an honest size estimate
    // before they commit to a 2,500-letter export.
    bytes: Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75),
  }
}

// The footer's first line is Amharic: "ዘመን ባንክ አ.ማ. / Zemen Bank S.C.".
//
// jsPDF's built-in fonts are WinAnsi-encoded and physically cannot represent
// Ethiopic, and embedding a Unicode font would add hundreds of KB to every one
// of 2,500 files for a single line of boilerplate. But that line is *constant* —
// identical on every letter — so it is drawn once here with the machine's own
// Amharic font and reused as a small image, the same trick as the letterhead.
//
// Windows ships Ebrima and Nyala with Ethiopic coverage, and this portal already
// renders Amharic elsewhere, so the glyphs resolve on the machines HR use.
const AMHARIC_STACK = '"Nyala", "Ebrima", "Abyssinica SIL", sans-serif'

const prepareText = (text, cssPx, style, fontStack, dpi) => {
  // Draw at a large pixel size, then report the size the text *would* occupy at
  // its CSS size — that ratio is what converts back to millimetres correctly.
  const upscale = Math.max(1, dpi / 96)
  const drawPx = cssPx * upscale

  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `${style} ${drawPx}px ${fontStack}`
  const wPx = Math.ceil(measure.measureText(text).width)
  const hPx = Math.ceil(drawPx * 1.35)

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, wPx)
  canvas.height = Math.max(1, hPx)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = `${style} ${drawPx}px ${fontStack}`
  ctx.fillStyle = '#000000'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, canvas.height / 2)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  return {
    dataUrl,
    widthMm: (wPx / upscale) * MM_PER_PX,
    heightMm: (hPx / upscale) * MM_PER_PX,
    bytes: Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75),
  }
}

let cached = null

// Returns { logo, stamp, signature, social, watermark, footerTitle }, each
// { dataUrl, widthMm, heightMm, bytes }. Memoised for the session.
export const loadLetterAssets = () => {
  if (!cached) {
    cached = (async () => {
      const keys = Object.keys(SPECS)
      const prepared = await Promise.all(keys.map((k) => prepare(SPECS[k])))
      const out = {}
      keys.forEach((k, i) => {
        out[k] = prepared[i]
      })
      // footer fontSize is 10px, bold italic — see the footer block in
      // SalaryIncrementLetterPrint.js.
      out.footerTitle = prepareText(FOOTER_LINES[0], 10, 'italic bold', AMHARIC_STACK, 300)
      return out
    })().catch((e) => {
      // Do not cache a failure — a transient image load should be retryable.
      cached = null
      throw e
    })
  }
  return cached
}

// Total embedded-image weight of one letter, so the export dialog can estimate
// the archive size before doing any work.
export const chromeBytes = (assets, withLetterhead) => {
  if (!assets) return 0
  const always = assets.signature.bytes
  if (!withLetterhead) return always
  return (
    always +
    assets.logo.bytes +
    assets.stamp.bytes +
    assets.social.bytes +
    assets.watermark.bytes +
    assets.footerTitle.bytes
  )
}
