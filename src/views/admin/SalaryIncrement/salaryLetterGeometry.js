// The A4 letter's measurements, in millimetres.
//
// SalaryIncrementLetterPrint.js lays the letter out in CSS pixels inside a
// 210mm-wide box. The PDF renderer needs the same layout in PDF user units, so
// every number here is that component's CSS value converted once, with the
// original px value shown alongside it. Change one and change the other.
//
// 1 CSS px = 25.4/96 mm exactly, which is what makes the conversion lossless
// rather than a fudge factor.

export const MM_PER_PX = 25.4 / 96 // 0.2645833…
export const px = (v) => v * MM_PER_PX

export const PAGE_W_MM = 210
export const PAGE_H_MM = 297

// Body wrapper padding — paddingLeft/Right: '22mm', paddingBottom: '40mm',
// paddingTop: '50mm' with letterhead / '20mm' without.
export const CONTENT_LEFT_MM = 22
export const CONTENT_RIGHT_MM = PAGE_W_MM - 22
export const CONTENT_W_MM = CONTENT_RIGHT_MM - CONTENT_LEFT_MM // 166
export const CONTENT_TOP_LETTERHEAD_MM = 50
export const CONTENT_TOP_PLAIN_MM = 20
export const CONTENT_BOTTOM_MM = PAGE_H_MM - 40 // 257

// Type. fontSize: 12.5 (CSS px), lineHeight: 1.55.
// CSS px → PostScript points is ×0.75, independent of the mm conversion.
export const BODY_PT = 12.5 * 0.75 // 9.375
export const BODY_LINE_MM = px(12.5 * 1.55) // 5.126
export const FOOTER_PT = 10 * 0.75 // 7.5
export const FOOTER_LINE_MM = px(10 * 1.35) // 3.572
export const QR_CAPTION_PT = 9 * 0.75 // 6.75

// Red vertical bar — top/left/bottom: 30, width: 4.
export const BAR = {
  x: px(30),
  y: px(30),
  w: px(4),
  h: PAGE_H_MM - 2 * px(30),
}

// Logo — top: 60, left: 50, width: 180.
export const LOGO = { x: px(50), y: px(60), w: px(180) }

// Watermark — backgroundSize: '150%', backgroundPosition: '33% 40%'.
// For a background larger than its box, a percentage position resolves to
// (box - image) × percent, which lands negative on x. Reproduced exactly.
export const watermarkOrigin = (imgWmm, imgHmm) => ({
  x: (PAGE_W_MM - imgWmm) * 0.33,
  y: (PAGE_H_MM - imgHmm) * 0.4,
})

// QR block — right: 50, bottom: 130 (or 30 without letterhead), QR size 90,
// then a 4px gap and a ~9px caption line.
export const QR_SIZE_MM = px(90)
export const QR_RIGHT_MM = PAGE_W_MM - px(50)
export const qrTop = (withLetterhead) => {
  const bottomOffset = px(withLetterhead ? 130 : 30)
  const captionBlock = px(4 + 9 * 1.2)
  return PAGE_H_MM - bottomOffset - captionBlock - QR_SIZE_MM
}

// Footer — bottom: 20, left: 50, right: 50.
export const FOOTER_LEFT_MM = px(50)
export const FOOTER_BOTTOM_MM = PAGE_H_MM - px(20)

// Signature image — width: 160, marginTop: 4.
export const SIGNATURE_W_MM = px(160)
// Stamp — position absolute at left '22mm' + marginLeft 180, marginTop -110,
// width 130. It keeps its static position in the flow, then shifts.
export const STAMP_W_MM = px(130)
export const STAMP_X_MM = CONTENT_LEFT_MM + px(180)
export const STAMP_RISE_MM = px(110)

// Vertical gaps between blocks, from each element's marginBottom.
export const GAP = {
  afterDateBlock: px(18),
  afterRecipient: px(4),
  afterCity: px(18),
  afterSubject: px(14),
  afterGreeting: px(12),
  afterParagraph: px(14),
  afterClosing: px(24),
  afterRegards: px(4),
  // (no gap after the signature image — the signatory name butts straight up
  // against it, as in the HTML)
  afterSignatory: px(20),
  beforeCc: px(8),
  afterCcLabel: px(2),
}
