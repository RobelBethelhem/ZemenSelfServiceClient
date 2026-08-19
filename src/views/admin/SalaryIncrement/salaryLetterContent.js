// Every sentence that appears on a Salary Increment & Bonus letter.
//
// This module exists because the letter is now produced by two different
// renderers: the on-screen A4 preview that the employee prints
// (SalaryIncrementLetterPrint.js), and the vector PDF written by the admin's
// bulk audit export (salaryLetterPdf.js). Those two must never disagree —
// they are the same legal document, and an auditor comparing a printed copy
// against the archived PDF has to find identical wording.
//
// So the wording lives here once and both renderers read from it. If Legal
// revises a paragraph, there is exactly one place to change and no way to
// update one path and forget the other.
//
// Paragraphs are RUNS, not plain strings: an array of { t, b } where `b` marks
// a stretch that renders bold. HR asked for the values a reader checks at a
// glance — dates, amounts, grade and step, the bonus — to stand out from the
// surrounding prose. Runs are the only representation that both an HTML
// <strong> and a jsPDF font switch can be driven from.
//
// The plain-string exports below are DERIVED from the runs by concatenation,
// so the text is provably identical either way and older callers keep working.
//
// Nothing in this file touches React, the DOM, or jsPDF — it is pure text.

// ----------------------- formatting helpers -----------------------

export const fmtMoney = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '______'
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export const fmtLongDate = (d) => {
  if (!d) return '______________'
  try {
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return '______________'
    return dt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '______________'
  }
}

// Concatenates runs back into the plain sentence.
export const flattenRuns = (runs) => runs.map((r) => r.t).join('')

// ----------------------- the bonus condition -----------------------

// A letter carries the bonus subject, paragraph and closing sentence unless
// either the category is Salary Only, or the employee declined the six-month
// commitment (in which case bonus_months was forced to 0 at import time).
// Both cases make the document structurally a salary-increment-only letter.
export const hasBonus = (letter) =>
  letter.commitment_decision !== 'Rejected' && letter.category !== 'Salary Only'

// ----------------------- fixed blocks -----------------------

export const subjectLine = (bonus) =>
  bonus ? 'Salary Increment and One-time Performance Based Bonus' : 'Salary Increment'

// The board meeting date is bold: it is the decision the whole letter rests on,
// and the one value in the opening sentence that varies per batch.
export const openingParaRuns = (bonus, boardMeetingDate) => [
  {
    t:
      'It gives me a great pleasure to inform you that, the Board of Directors of the Bank, ' +
      'in its meeting held on ',
  },
  { t: fmtLongDate(boardMeetingDate), b: true },
  {
    t: bonus
      ? ', has approved salary increment and one-time performance based bonus payment ' +
        "considering the Bank's overall performance for the fiscal year and individual performance."
      : ", has approved salary increment considering the Bank's overall performance " +
        'for the fiscal year.',
  },
]

// Congratulatory prose with no dynamic values in it — nothing to emphasise.
export const closingParaRuns = (bonus) => [
  {
    t: bonus
      ? 'Congratulations on your salary increase and performance based bonus payment. I hope to ' +
        'count on your continued effort and dedication as we work towards the realization of the ' +
        "Bank's objectives and strategies in the periods ahead."
      : 'Congratulations on the salary increment and I hope to count on your continued effort ' +
        "and dedication as we work towards the realization of the Bank's objectives and " +
        'strategies in the periods ahead.',
  },
]

export const openingPara = (bonus, boardMeetingDate) =>
  flattenRuns(openingParaRuns(bonus, boardMeetingDate))

export const closingPara = (bonus) => flattenRuns(closingParaRuns(bonus))

export const recipientName = (letter) => letter.employee_name || '________________'

export const greetingLine = (letter) =>
  `Dear: ${letter.first_name || '____________'}${letter.category === 'Promotion' ? ',' : ''}`

// ----------------------- per-category body -----------------------

// Returns the category's body as an array of paragraphs, each an array of runs
// — one paragraph for every category except Promotion, which is two (the
// increment, then the promotion adjustment). The bonus sentence, when it
// applies, is appended to the final paragraph exactly as it reads on the
// printed letter.
export const bodyParagraphRuns = (letter) => {
  const batch = letter.import_batch_id || {}
  const effectiveDate = fmtLongDate(batch.effective_date)
  const oldSalary = fmtMoney(letter.old_salary)
  const newSalary = fmtMoney(letter.new_salary)
  const grade = letter.job_grade || '____'
  const step = letter.step || '____'
  const bonusMonths =
    letter.bonus_months !== null && letter.bonus_months !== undefined
      ? letter.bonus_months
      : '_____'
  const bonus = hasBonus(letter)

  // The sentence shared by Full, Salary Only, Discipline and Proportionate.
  const increase = [
    { t: 'Accordingly, I am pleased to inform you that effective ' },
    { t: effectiveDate, b: true },
    { t: ', your salary is increased from ' },
    { t: `Birr ${oldSalary}.00`, b: true },
    { t: ' to ' },
    { t: `Birr ${newSalary}.00`, b: true },
    { t: ' which puts you under ' },
    { t: `Job grade ${grade} step ${step}`, b: true },
    { t: " of the Bank's salary scale." },
  ]

  const bonusAmount = { t: `${bonusMonths} month's salary`, b: true }
  const bonusTail = { t: ' as a one-time performance based bonus.' }

  switch (letter.category) {
    case 'Full':
      return [
        bonus
          ? [...increase, { t: ' In addition, you will be awarded your ' }, bonusAmount, bonusTail]
          : increase,
      ]

    case 'Proportionate':
      return [
        bonus
          ? [
              ...increase,
              { t: ' In addition, you will be awarded proportionate amount of your ' },
              bonusAmount,
              bonusTail,
            ]
          : increase,
      ]

    case 'Discipline': {
      const pct =
        letter.discipline_pct !== null && letter.discipline_pct !== undefined
          ? `${Math.round(Number(letter.discipline_pct) * 100)}%`
          : '_____'
      return [
        bonus
          ? [
              ...increase,
              { t: ' In addition, you will be awarded ' },
              { t: pct, b: true },
              { t: ' of your ' },
              bonusAmount,
              bonusTail,
            ]
          : increase,
      ]
    }

    case 'Salary Only':
      // Never carries a bonus sentence, by definition of the category.
      return [increase]

    case 'Promotion': {
      const newGrade = letter.new_job_grade || '____'
      const newStep = letter.new_step || '____'
      const finalSalary = fmtMoney(letter.salary_after_promotion_adjustment)
      const second = [
        { t: 'Furthermore, due to your promotion, effective ' },
        { t: 'your date of release', b: true },
        { t: ', your salary will be further increased to ' },
        { t: `Birr ${finalSalary}.00`, b: true },
        { t: ', which puts you under ' },
        { t: `job grade ${newGrade} step ${newStep}`, b: true },
        { t: " of the Bank's salary scale." },
      ]
      return [
        [
          { t: 'Accordingly, I am pleased to inform you that effective ' },
          { t: effectiveDate, b: true },
          { t: ', your salary is increased from ' },
          { t: `Birr ${oldSalary}.00`, b: true },
          { t: ' to ' },
          { t: `Birr ${newSalary}.00`, b: true },
          { t: '.' },
        ],
        bonus
          ? [...second, { t: ' In addition, you will be awarded your ' }, bonusAmount, bonusTail]
          : second,
      ]
    }

    default:
      return []
  }
}

// Plain-text form, derived from the runs so the two can never disagree.
export const bodyParagraphs = (letter) => bodyParagraphRuns(letter).map(flattenRuns)

// ----------------------- shared constants -----------------------

export const SIGNATORY_NAME = 'Dereje Zebene'
export const SIGNATORY_TITLE = 'President/CEO'
export const CC_LIST = ['Finance & Investors Relation Department', 'PMES Department']
export const RECIPIENT_CITY = 'Addis Ababa'
export const SALUTATION_PREFIX = 'Ato/Woy.'
export const SUBJECT_LABEL = 'Subject:'

export const FOOTER_LINES = [
  'ዘመን ባንክ አ.ማ. / Zemen Bank S.C.',
  'Ras Abebe Aregay St.',
  'P.O.Box 1212 Addis Ababa, Ethiopia',
  'SWIFT Code: ZEMEETAA',
  'Call Center 6500',
  'info@zemenbank.com',
  'www.zemenbank.com',
]
export const FOOTER_TAGLINE = 'DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE'
