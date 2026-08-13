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
  openingPara,
  closingPara,
  bodyParagraphs,
  recipientName,
  greetingLine,
  SIGNATORY_NAME,
  SIGNATORY_TITLE,
  SALUTATION_PREFIX,
  RECIPIENT_CITY,
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
  CONTENT_TOP_LETTERHEAD_MM,
  CONTENT_TOP_PLAIN_MM,
  CONTENT_BOTTOM_MM,
  BODY_PT,
  BODY_LINE_MM,
  FOOTER_PT,
  FOOTER_LINE_MM,
  QR_CAPTION_PT,
  BAR,
  LOGO,
  watermarkOrigin,
  QR_SIZE_MM,
  QR_RIGHT_MM,
  qrTop,
  FOOTER_LEFT_MM,
  FOOTER_BOTTOM_MM,
  SIGNATURE_W_MM,
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

// Half-leading. CSS centres a 12.5px glyph box inside a 19.375px line box, so
// text sits ~3.44px below the top of its line. Reproduced so the PDF's vertical
// rhythm matches the HTML rather than riding 1mm high.
const HALF_LEADING_MM = px((12.5 * 1.55 - 12.5) / 2)

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
// Text helpers
// ------------------------------------------------------------------

const setBody = (doc, sizePt, bold) => {
  doc.setFont(FONT, bold ? 'bold' : 'normal')
  doc.setFontSize(sizePt)
}

// Draws one paragraph with justified margins, matching the HTML's
// `text-align: justify`, and returns the y position after it.
//
// jsPDF can justify on its own, but it stretches whatever lines it is handed —
// including the last one, which is wrong and looks it. Distributing the slack
// across the gaps ourselves also means the output is exactly predictable, which
// matters when the thing being typeset is 2,500 official letters nobody will
// proofread individually.
const drawJustified = (doc, text, x, y, width, lineMm) => {
  const lines = doc.splitTextToSize(text, width)
  const spaceW = doc.getTextWidth(' ')

  lines.forEach((line, i) => {
    const top = y + i * lineMm + HALF_LEADING_MM
    const words = line.split(' ').filter((w) => w.length)
    const isLast = i === lines.length - 1

    if (isLast || words.length < 2) {
      doc.text(line, x, top, { baseline: 'top' })
      return
    }
    const natural = doc.getTextWidth(line)
    const extra = (width - natural) / (words.length - 1)
    let cx = x
    words.forEach((w) => {
      doc.text(w, cx, top, { baseline: 'top' })
      cx += doc.getTextWidth(w) + spaceW + extra
    })
  })

  return y + lines.length * lineMm
}

const drawLine = (doc, text, x, y, lineMm, { bold, underline } = {}) => {
  setBody(doc, doc.getFontSize(), bold)
  const top = y + HALF_LEADING_MM
  doc.text(text, x, top, { baseline: 'top' })
  if (underline) {
    const w = doc.getTextWidth(text)
    const uy = top + doc.getFontSize() * PT_TO_MM * 1.06
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
  const top = y + HALF_LEADING_MM
  doc.text(label, startX, top, { baseline: 'top' })
  doc.text(value, startX + lw + gap, top, { baseline: 'top' })
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
  Revoked: 'REVOKED — NOT VALID',
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

  const bodyPt = BODY_PT * scale
  const lineMm = BODY_LINE_MM * scale

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
  let y = withLetterhead ? CONTENT_TOP_LETTERHEAD_MM : CONTENT_TOP_PLAIN_MM
  const x = CONTENT_LEFT_MM

  setBody(doc, bodyPt, true)
  y = drawLabelValueRight(doc, 'Date:', fmtLongDate(batch.letter_date), CONTENT_RIGHT_MM, y, lineMm)
  y = drawLabelValueRight(
    doc,
    'Ref. No.:',
    (batch && batch.reference_number) || '—',
    CONTENT_RIGHT_MM,
    y,
    lineMm,
  )
  y += GAP.afterDateBlock

  setBody(doc, bodyPt, false)
  y = drawLine(doc, `${SALUTATION_PREFIX}  ${recipientName(letter)}`, x, y, lineMm)
  y += GAP.afterRecipient
  y = drawLine(doc, RECIPIENT_CITY, x, y, lineMm, { underline: true })
  y += GAP.afterCity

  y = drawLine(doc, `Subject: ${subjectLine(bonus)}`, x, y, lineMm, {
    bold: true,
    underline: true,
  })
  y += GAP.afterSubject

  setBody(doc, bodyPt, false)
  y = drawLine(doc, greetingLine(letter), x, y, lineMm)
  y += GAP.afterGreeting

  y = drawJustified(doc, openingPara(bonus, batch.board_meeting_date), x, y, CONTENT_W_MM, lineMm)
  y += GAP.afterParagraph

  bodyParagraphs(letter).forEach((para) => {
    y = drawJustified(doc, para, x, y, CONTENT_W_MM, lineMm)
    y += GAP.afterParagraph
  })

  y = drawJustified(doc, closingPara(bonus), x, y, CONTENT_W_MM, lineMm)
  y += GAP.afterClosing - GAP.afterParagraph

  y = drawLine(doc, 'Regards,', x, y, lineMm)
  y += GAP.afterRegards

  const sig = assets.signature
  const sigH = SIGNATURE_W_MM * (sig.heightMm / sig.widthMm)
  doc.addImage(sig.dataUrl, 'JPEG', x, y, SIGNATURE_W_MM, sigH)
  y += sigH

  y = drawLine(doc, SIGNATORY_NAME, x, y, lineMm, { bold: true })
  setBody(doc, bodyPt, false)
  y = drawLine(doc, SIGNATORY_TITLE, x, y, lineMm)
  y += GAP.afterSignatory

  // The stamp keeps its position in the flow and then shifts up over the
  // signature, exactly as the CSS `marginTop: -110` does.
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

  y += GAP.beforeCc
  y = drawLine(doc, 'CC:', x, y, lineMm)
  y += GAP.afterCcLabel
  CC_LIST.forEach((line) => {
    y = drawLine(doc, line, x, y, lineMm)
  })

  const contentEnd = y

  // ---------- QR, always present ----------
  const qy = qrTop(withLetterhead)
  const qx = QR_RIGHT_MM - QR_SIZE_MM
  drawQr(doc, verifyUrl, qx, qy, QR_SIZE_MM)
  setBody(doc, QR_CAPTION_PT, false)
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
