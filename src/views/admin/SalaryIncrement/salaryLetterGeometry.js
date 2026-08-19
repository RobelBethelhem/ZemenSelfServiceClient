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

// Body wrapper padding — paddingLeft/Right: '22mm', paddingBottom: '40mm'.
export const CONTENT_LEFT_MM = 22
export const CONTENT_RIGHT_MM = PAGE_W_MM - 22
export const CONTENT_W_MM = CONTENT_RIGHT_MM - CONTENT_LEFT_MM // 166
export const CONTENT_BOTTOM_MM = PAGE_H_MM - 40 // 257

// Where the letter's prose used to start, and still does. The Date/Ref block
// moved above it (see DATE_TOP below) but nothing after that block shifted.
export const CONTENT_TOP_LETTERHEAD_MM = 50
export const CONTENT_TOP_PLAIN_MM = 20

// Type. fontSize: 13 (CSS px), lineHeight: 1.55.
// CSS px -> PostScript points is x0.75, independent of the mm conversion.
export const BODY_PX = 13
export const BODY_PT = BODY_PX * 0.75 // 9.75
export const BODY_LINE_MM = px(BODY_PX * 1.55) // 5.332
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

// The Date / Ref. No. block sits level with the logo rather than below it.
//
// 75px is not arbitrary: the logo spans y 60 to 130.8 (180px wide at the
// artwork's 1958x770 aspect), putting its centre at 95.4. A two-line date block
// is 40.3px tall at the current type size, so starting it at 75.25 centres the
// two against the logo — which is what "on the same horizontal line" means when
// one side is an image twice the height of the other.
export const DATE_TOP_PX = 75
export const DATE_TOP_MM = px(DATE_TOP_PX)

// The gap under the date block, sized so that everything below it lands exactly
// where it did before the block moved up. Only the date moved; the recipient,
// subject and body did not.
export const gapAfterDateBlock = (withLetterhead) =>
  (withLetterhead ? CONTENT_TOP_LETTERHEAD_MM : CONTENT_TOP_PLAIN_MM) - DATE_TOP_MM + px(18)

// Watermark — backgroundSize: '150%', backgroundPosition: '33% 40%'.
// For a background larger than its box, a percentage position resolves to
// (box - image) x percent, which lands negative on x. Reproduced exactly.
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

// Signature — width 160, nudged 10px left of the text margin.
//
// The artwork is full-bleed (its strokes reach x=0) but its left third is a
// sparse lead-in flourish, so at the text margin the signature *reads* as
// indented against "Regards," directly above it. Shifting the frame 10px left
// brings the dense body of the signature under the R without pushing any
// meaningful ink into the margin.
export const SIGNATURE_W_MM = px(160)
export const SIGNATURE_SHIFT_MM = px(10)

// Stamp — to the right of the signature and slightly overlapping it vertically,
// the way a stamp lands on a signed letter. Text drawn afterwards sits on top,
// so the signatory's name stays readable through it.
export const STAMP_W_MM = px(120)
export const STAMP_X_MM = CONTENT_LEFT_MM + px(160)
export const STAMP_RISE_MM = px(13)

// Vertical gaps between blocks, from each element's marginBottom.
export const GAP = {
  afterRecipient: px(4),
  afterCity: px(18),
  afterSubject: px(14),
  afterGreeting: px(12),
  afterParagraph: px(14),
  afterClosing: px(24),
  afterRegards: px(4),
  // (no gap after the signature image — the signatory name butts straight up
  // against it, as in the HTML)
  //
  // President/CEO to CC: widened from 20px on HR's request so the CC block
  // reads as a separate footer note rather than part of the signature block.
  afterSignatory: px(44),
}
