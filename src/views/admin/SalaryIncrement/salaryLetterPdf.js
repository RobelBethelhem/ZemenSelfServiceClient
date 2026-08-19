// Renders one Salary Increment & Bonus letter as a single-page A4 PDF.
//
// The on-screen letter is printed by photographing the DOM with html2canvas and
// sending the resulting bitmap to the printer. That is fine for one letter and
// impossible for 2,500: each snapshot costs a full layout plus a ~15 MB canvas,
// so a whole fiscal year would take something like twenty minutes and produce
// an archive measured in gigabytes.
//
// This renderer draws the same letter directly as PDF vector content instead —
// no DOM, no layout, no rasterising. A letter costs a few hundred drawing
// operations, the text stays selectable and searchable (which an auditor
// running Ctrl+F will care about far more than pixel-identity), and the file
// lands in the tens of KB.
//
// Geometry comes from ./salaryLetterGeometry, which is the print component's
// CSS converted to millimetres. Wording comes from ./salaryLetterContent, the
// same module the print component reads. Neither is duplicated here.

import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

import {
  fmtLongDate,
  hasBonus,
  subjectLine,
  openingParaRuns,
  closingParaRuns,
  bodyParagraphRuns,
  recipientName,
  greetingLine,
  SIGNATORY_NAME,
  SIGNATORY_TITLE,
  SALUTATION_PREFIX,
  RECIPIENT_CITY,
  SUBJECT_LABEL,
  CC_LIST,
  FOOTER_LINES,
  FOOTER_TAGLINE,
} from './salaryLetterContent'

import {
  px,
  PAGE_W_MM,
  PAGE_H_MM,
  CONTENT_LEFT_MM,
  CONTENT_RIGHT_MM,
  CONTENT_W_MM,
  CONTENT_BOTTOM_MM,
  BODY_PT,
  BODY_LINE_MM,
  FOOTER_PT,
  FOOTER_LINE_MM,
  QR_CAPTION_PT,
  BAR,
  LOGO,
  DATE_TOP_MM,
  gapAfterDateBlock,
  watermarkOrigin,
  QR_SIZE_MM,
  QR_RIGHT_MM,
  qrTop,
  FOOTER_LEFT_MM,
  FOOTER_BOTTOM_MM,
  SIGNATURE_W_MM,
  SIGNATURE_SHIFT_MM,
  STAMP_W_MM,
  STAMP_X_MM,
  STAMP_RISE_MM,
  GAP,
} from './salaryLetterGeometry'

const PT_TO_MM = 25.4 / 72

// The letter's CSS font stack is `Calibri, "Times New Roman", Times, serif`.
// On the Windows machines this is printed from, Calibri wins — so the document
// people actually hold is set in a humanist sans, not a serif. Helvetica is
// jsPDF's built-in sans and the closest match that costs zero embedded bytes.
// (Calibri itself cannot be embedded: it is a licensed Microsoft font.)
const FONT = 'helvetica'

// CSS centres the glyph box inside its taller line box, so text sits slightly
// below the top of the line. Derived from the line height rather than hardcoded
// so it stays correct when the whole letter is typeset a notch tighter.
const halfLeadingFor = (lineMm) => (lineMm * (0.55 / 1.55)) / 2

// ------------------------------------------------------------------
// QR code, drawn as vector rectangles
// ------------------------------------------------------------------

// A QR is a grid of black squares, which is exactly what PDF rectangles are
// good at. Drawing it as vector rather than embedding a bitmap makes it both
// smaller (about 1 KB) and infinitely sharp, so it scans at any print size.
//
// Adjacent dark modules in a row are merged into a single wider rectangle,
// which typically cuts ~450 rectangles down to ~150 for no loss at all.
const drawQr = (doc, text, x, y, sizeMm) => {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' })
  const n = qr.modules.size
  const data = qr.modules.data
  const m = sizeMm / n

  doc.setFillColor(0, 0, 0)
  for (let row = 0; row < n; row += 1) {
    let runStart = -1
    for (let col = 0; col <= n; col += 1) {
      const dark = col < n && data[row * n + col]
      if (dark && runStart < 0) {
        runStart = col
      } else if (!dark && runStart >= 0) {
        doc.rect(x + runStart * m, y + row * m, (col - runStart) * m, m, 'F')
        runStart = -1
      }
    }
  }
}

// ------------------------------------------------------------------
// Rich text
// ------------------------------------------------------------------

// Splits an array of { t, b } runs into words, where a word is itself a list of
// segments. A word can straddle a run boundary — "July 1, 2025," is a bold date
// followed by a plain comma — so a word cannot simply carry one weight.
const runsToWords = (runs) => {
  const words = []
  let cur = []
  runs.forEach((run) => {
    const parts = String(run.t).split(' ')
    parts.forEach((part, i) => {
      if (i > 0) {
        if (cur.length) words.push(cur)
        cur = []
      }
      if (part) cur.push({ t: part, b: !!run.b })
    })
  })
  if (cur.length) words.push(cur)
  return words
}

const wordWidth = (doc, word) => {
  let w = 0
  word.forEach((seg) => {
    doc.setFont(FONT, seg.b ? 'bold' : 'normal')
    w += doc.getTextWidth(seg.t)
  })
  return w
}

// Draws a paragraph of runs with justified margins, matching the HTML's
// `text-align: justify`, and returns the y position after it.
//
// jsPDF can justify on its own, but only in a single uniform font, and it
// stretches whatever lines it is handed — including the last one, which is
// wrong and looks it. Since bold has to be switched mid-line anyway, the line
// breaking and slack distribution happen here: measure each word in its own
// weight, greedily fill lines, then spread the leftover across the gaps of
// every line but the last.
const drawRichParagraph = (doc, runs, x, y, width, lineMm, sizePt) => {
  doc.setFontSize(sizePt)
  doc.setFont(FONT, 'normal')
  const spaceW = doc.getTextWidth(' ')
  const half = halfLeadingFor(lineMm)

  const words = runsToWords(runs)
  const widths = words.map((w) => wordWidth(doc, w))

  const lines = []
  let cur = []
  let natural = 0
  words.forEach((w, i) => {
    const gap = cur.length ? spaceW : 0
    if (cur.length && natural + gap + widths[i] > width) {
      lines.push({ items: cur, natural })
      cur = []
      natural = 0
    }
    natural += (cur.length ? spaceW : 0) + widths[i]
    cur.push(w)
  })
  if (cur.length) lines.push({ items: cur, natural })

  lines.forEach((line, li) => {
    const top = y + li * lineMm + half
    const gaps = line.items.length - 1
    const isLast = li === lines.length - 1
    const extra = !isLast && gaps > 0 ? (width - line.natural) / gaps : 0

    let cx = x
    line.items.forEach((word, wi) => {
      word.forEach((seg) => {
        doc.setFont(FONT, seg.b ? 'bold' : 'normal')
        doc.text(seg.t, cx, top, { baseline: 'top' })
        cx += doc.getTextWidth(seg.t)
      })
      if (wi < gaps) cx += spaceW + extra
    })
  })

  return y + lines.length * lineMm
}

const drawLine = (doc, text, x, y, lineMm, sizePt, opts = {}) => {
  doc.setFontSize(sizePt)
  doc.setFont(FONT, opts.bold ? 'bold' : 'normal')
  const top = y + halfLeadingFor(lineMm)
  doc.text(text, x, top, { baseline: 'top' })
  if (opts.underline) {
    const w = doc.getTextWidth(text)
    const uy = top + sizePt * PT_TO_MM * 1.06
    doc.setLineWidth(0.18)
    doc.line(x, uy, x + w, uy)
  }
  return y + lineMm
}

// "Date:" and its value as two right-aligned spans, mirroring the HTML's
// `<span class="me-2">` (a 0.5rem = 8px gap).
const drawLabelValueRight = (doc, label, value, rightX, y, lineMm) => {
  const gap = px(8)
  const lw = doc.getTextWidth(label)
  const vw = doc.getTextWidth(value)
  const startX = rightX - (lw + gap + vw)
  const top = y + halfLeadingFor(lineMm)
  doc.text(label, startX, top, { baseline: 'top' })
  doc.text(value, startX + lw + gap, top, { baseline: 'top' })
  return y + lineMm
}

// Subject line, centred on the content column. The "Subject:" label is bold but
// NOT underlined; the subject itself is bold AND underlined. HR was specific
// about that split, so the two halves are measured and placed separately.
const drawSubject = (doc, subject, y, lineMm, sizePt) => {
  doc.setFontSize(sizePt)
  doc.setFont(FONT, 'bold')
  const label = `${SUBJECT_LABEL} `
  const lw = doc.getTextWidth(label)
  const sw = doc.getTextWidth(subject)
  const startX = CONTENT_LEFT_MM + Math.max(0, (CONTENT_W_MM - (lw + sw)) / 2)
  const top = y + halfLeadingFor(lineMm)

  doc.text(label, startX, top, { baseline: 'top' })
  doc.text(subject, startX + lw, top, { baseline: 'top' })

  const uy = top + sizePt * PT_TO_MM * 1.06
  doc.setLineWidth(0.18)
  doc.line(startX + lw, uy, startX + lw + sw, uy)

  return y + lineMm
}

// ------------------------------------------------------------------
// Status overlay
// ------------------------------------------------------------------

// A bulk export deliberately includes every letter the admin's filter selected,
// not just the valid ones — an audit that only sees the clean rows is not an
// audit. But a revoked or not-yet-accepted letter must never be mistakable for
// a live one once it has been lifted out of the archive as a loose PDF, so it
// gets stamped across the page.
const STATUS_OVERLAY = {
  Revoked: 'REVOKED - NOT VALID',
  Imported: 'NOT YET ACCEPTED BY EMPLOYEE',
}

const drawStatusOverlay = (doc, label) => {
  let restored = false
  try {
    doc.saveGraphicsState()
    // GState is how PDF does constant alpha. If this build of jsPDF lacks it we
    // still want the stamp — just at full strength, which is ugly but safe. The
    // one outcome we must avoid is silently not stamping at all.
    if (typeof doc.GState === 'function') {
      doc.setGState(new doc.GState({ opacity: 0.16 }))
    }
    restored = true
    doc.setFont(FONT, 'bold')
    doc.setFontSize(34)
    doc.setTextColor(190, 0, 0)
    doc.text(label, PAGE_W_MM / 2, PAGE_H_MM / 2, {
      align: 'center',
      angle: 30,
      baseline: 'middle',
    })
  } catch {
    /* never let decoration break a letter */
  } finally {
    if (restored) {
      try {
        doc.restoreGraphicsState()
      } catch {
        /* ignore */
      }
    }
    doc.setTextColor(0, 0, 0)
  }
}

// ------------------------------------------------------------------
// The letter
// ------------------------------------------------------------------

const layout = (doc, letter, assets, opts, scale) => {
  const { withLetterhead, verifyUrl } = opts
  const batch = letter.import_batch_id || {}
  const bonus = hasBonus(letter)

  const pt = BODY_PT * scale
  const lineMm = BODY_LINE_MM * scale
  const x = CONTENT_LEFT_MM

  // ---------- absolute chrome, painted first so text sits on top ----------
  if (withLetterhead) {
    const wm = assets.watermark
    const origin = watermarkOrigin(wm.widthMm, wm.heightMm)
    // The watermark's 7% opacity is already baked into the image (see
    // salaryLetterAssets.js), so this is an ordinary opaque draw onto a white
    // page — no transparency group needed, and it clips at the page edges
    // exactly like the CSS background does.
    doc.addImage(wm.dataUrl, 'JPEG', origin.x, origin.y, wm.widthMm, wm.heightMm)

    doc.setFillColor(255, 0, 0)
    doc.rect(BAR.x, BAR.y, BAR.w, BAR.h, 'F')

    const lg = assets.logo
    doc.addImage(lg.dataUrl, 'JPEG', LOGO.x, LOGO.y, LOGO.w, LOGO.w * (lg.heightMm / lg.widthMm))
  }

  // ---------- flowed body ----------
  // Starts level with the logo rather than below it; the gap under the date
  // block returns everything after it to where it has always been.
  let y = DATE_TOP_MM

  doc.setFontSize(pt)
  doc.setFont(FONT, 'bold')
  y = drawLabelValueRight(doc, 'Date:', fmtLongDate(batch.letter_date), CONTENT_RIGHT_MM, y, lineMm)
  y = drawLabelValueRight(
    doc,
    'Ref. No.:',
    (batch && batch.reference_number) || '—',
    CONTENT_RIGHT_MM,
    y,
    lineMm,
  )
  y += gapAfterDateBlock(withLetterhead)

  y = drawLine(doc, `${SALUTATION_PREFIX}  ${recipientName(letter)}`, x, y, lineMm, pt, {
    bold: true,
  })
  y += GAP.afterRecipient
  y = drawLine(doc, RECIPIENT_CITY, x, y, lineMm, pt, { bold: true, underline: true })
  y += GAP.afterCity

  y = drawSubject(doc, subjectLine(bonus), y, lineMm, pt)
  y += GAP.afterSubject

  y = drawLine(doc, greetingLine(letter), x, y, lineMm, pt, { bold: true })
  y += GAP.afterGreeting

  y = drawRichParagraph(
    doc,
    openingParaRuns(bonus, batch.board_meeting_date),
    x,
    y,
    CONTENT_W_MM,
    lineMm,
    pt,
  )
  y += GAP.afterParagraph

  bodyParagraphRuns(letter).forEach((runs) => {
    y = drawRichParagraph(doc, runs, x, y, CONTENT_W_MM, lineMm, pt)
    y += GAP.afterParagraph
  })

  y = drawRichParagraph(doc, closingParaRuns(bonus), x, y, CONTENT_W_MM, lineMm, pt)
  y += GAP.afterClosing - GAP.afterParagraph

  y = drawLine(doc, 'Regards,', x, y, lineMm, pt)
  y += GAP.afterRegards

  // Signature, nudged left of the text margin so its dense middle sits under
  // the "R" of Regards; the stamp goes to its right, overlapping slightly. Both
  // are drawn before the signatory's name so the name paints on top of the
  // stamp, the way it reads on a real stamped letter.
  const sig = assets.signature
  const sigH = SIGNATURE_W_MM * (sig.heightMm / sig.widthMm)
  doc.addImage(sig.dataUrl, 'JPEG', x - SIGNATURE_SHIFT_MM, y, SIGNATURE_W_MM, sigH)

  if (withLetterhead) {
    const st = assets.stamp
    doc.addImage(
      st.dataUrl,
      'JPEG',
      STAMP_X_MM,
      y - STAMP_RISE_MM,
      STAMP_W_MM,
      STAMP_W_MM * (st.heightMm / st.widthMm),
    )
  }
  y += sigH

  y = drawLine(doc, SIGNATORY_NAME, x, y, lineMm, pt, { bold: true })
  y = drawLine(doc, SIGNATORY_TITLE, x, y, lineMm, pt)
  y += GAP.afterSignatory

  y = drawLine(doc, 'CC:', x, y, lineMm, pt)
  y += px(2)
  CC_LIST.forEach((line) => {
    y = drawLine(doc, line, x, y, lineMm, pt)
  })

  const contentEnd = y

  // ---------- QR, always present ----------
  const qy = qrTop(withLetterhead)
  const qx = QR_RIGHT_MM - QR_SIZE_MM
  drawQr(doc, verifyUrl, qx, qy, QR_SIZE_MM)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(QR_CAPTION_PT)
  doc.setTextColor(68, 68, 68)
  doc.text('Scan to verify', qx + QR_SIZE_MM / 2, qy + QR_SIZE_MM + px(4), {
    align: 'center',
    baseline: 'top',
  })
  doc.setTextColor(0, 0, 0)

  // ---------- footer ----------
  if (withLetterhead) {
    const soc = assets.social
    const socW = px(110)
    const socH = socW * (soc.heightMm / soc.widthMm)
    const taglineH = Math.max(socH, FOOTER_LINE_MM)
    const blockH = FOOTER_LINES.length * FOOTER_LINE_MM + px(6) + taglineH
    let fy = FOOTER_BOTTOM_MM - blockH

    doc.setFontSize(FOOTER_PT)
    FOOTER_LINES.forEach((line, i) => {
      if (i === 0) {
        // Amharic — pre-rendered once into an image because jsPDF's built-in
        // fonts are WinAnsi and cannot encode Ethiopic. See salaryLetterAssets.
        const ft = assets.footerTitle
        doc.addImage(ft.dataUrl, 'JPEG', FOOTER_LEFT_MM, fy, ft.widthMm, ft.heightMm)
        fy += FOOTER_LINE_MM
        return
      }
      // www.zemenbank.com is red and bold in the letterhead.
      if (line.startsWith('www.')) {
        doc.setFont(FONT, 'bolditalic')
        doc.setTextColor(255, 0, 0)
      } else {
        doc.setFont(FONT, 'italic')
        doc.setTextColor(0, 0, 0)
      }
      doc.text(line, FOOTER_LEFT_MM, fy, { baseline: 'top' })
      fy += FOOTER_LINE_MM
    })
    doc.setTextColor(0, 0, 0)

    fy += px(6)
    doc.addImage(soc.dataUrl, 'JPEG', FOOTER_LEFT_MM, fy, socW, socH)
    doc.setFont(FONT, 'bolditalic')
    doc.setTextColor(255, 0, 0)
    doc.text(FOOTER_TAGLINE, FOOTER_LEFT_MM + socW + px(12), fy + socH / 2, {
      baseline: 'middle',
    })
    doc.setTextColor(0, 0, 0)
  }

  if (letter.status && STATUS_OVERLAY[letter.status]) {
    drawStatusOverlay(doc, STATUS_OVERLAY[letter.status])
  }

  return contentEnd
}

/**
 * Renders one letter and returns the PDF bytes.
 *
 * @param {object}  letter  a populated SalaryIncrementLetter (needs import_batch_id)
 * @param {object}  assets  the prepared letterhead set from loadLetterAssets()
 * @param {object}  opts    { withLetterhead, verifyUrlBase }
 * @returns {{ bytes: Uint8Array, shrunk: boolean, overflow: boolean }}
 */
export const renderLetterPdf = (letter, assets, opts) => {
  const withLetterhead = opts.withLetterhead !== false
  const verifyUrl = `${opts.verifyUrlBase}/${encodeURIComponent(letter._id)}`

  // An unusually long name or a Promotion letter with big numbers can push the
  // body past the bottom margin. An official letter running onto a second page
  // with three orphaned lines looks like a mistake, so on overflow we re-typeset
  // one notch tighter rather than let it spill. Two notches is the floor; past
  // that the letter is reported as overflowing and left alone.
  const scales = [1, 0.94, 0.88]
  let last = null

  for (let i = 0; i < scales.length; i += 1) {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    })
    doc.setProperties({
      title: `Salary Increment Letter — ${letter.employee_name || letter.domain_user}`,
      subject: `FY ${letter.fiscal_year} · ${letter.category}`,
      author: 'Zemen Bank S.C.',
      creator: 'Zemen Bank Self Service Portal',
    })

    const end = layout(doc, letter, assets, { withLetterhead, verifyUrl }, scales[i])
    last = { doc, end, shrunk: i > 0 }

    if (end <= CONTENT_BOTTOM_MM) break
  }

  return {
    bytes: new Uint8Array(last.doc.output('arraybuffer')),
    shrunk: last.shrunk,
    overflow: last.end > CONTENT_BOTTOM_MM,
  }
}
