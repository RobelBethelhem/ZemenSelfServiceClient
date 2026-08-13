// Every sentence that appears on a Salary Increment & Bonus letter.
//
// This module exists because the letter is now produced by two different
// renderers: the on-screen A4 preview that the employee prints
// (SalaryIncrementLetterPrint.js), and the vector PDF written by the admin's
// bulk audit export (salaryLetterPdf.js). Those two must never disagree —
// they are the same legal document, and an auditor comparing a printed copy
// against the archived PDF has to find identical wording.
//
// So the wording lives here once, as plain strings, and both renderers read
// from it. If Legal revises a paragraph, there is exactly one place to change
// and no way to update one path and forget the other.
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

export const openingPara = (bonus, boardMeetingDate) => {
  const d = fmtLongDate(boardMeetingDate)
  if (!bonus) {
    return `It gives me a great pleasure to inform you that, the Board of Directors of the Bank, in its meeting held on ${d}, has approved salary increment considering the Bank's overall performance for the fiscal year.`
  }
  return `It gives me a great pleasure to inform you that, the Board of Directors of the Bank, in its meeting held on ${d}, has approved salary increment and one-time performance based bonus payment considering the Bank's overall performance for the fiscal year and individual performance.`
}

export const closingPara = (bonus) =>
  bonus
    ? "Congratulations on your salary increase and performance based bonus payment. I hope to count on your continued effort and dedication as we work towards the realization of the Bank's objectives and strategies in the periods ahead."
    : "Congratulations on the salary increment and I hope to count on your continued effort and dedication as we work towards the realization of the Bank's objectives and strategies in the periods ahead."

export const recipientName = (letter) => letter.employee_name || '________________'

export const greetingLine = (letter) =>
  `Dear: ${letter.first_name || '____________'}${letter.category === 'Promotion' ? ',' : ''}`

// ----------------------- per-category body -----------------------

// Returns the category's body as an array of paragraph strings — one entry for
// every category except Promotion, which is two (the increment, then the
// promotion adjustment). The bonus sentence, when it applies, is appended to
// the final paragraph exactly as it reads on the printed letter.
export const bodyParagraphs = (letter) => {
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
  const increase =
    `Accordingly, I am pleased to inform you that effective ${effectiveDate}, ` +
    `your salary is increased from Birr ${oldSalary}.00 to Birr ${newSalary}.00 ` +
    `which puts you under Job grade ${grade} step ${step} of the Bank's salary scale.`

  switch (letter.category) {
    case 'Full':
      return [
        increase +
          (bonus
            ? ` In addition, you will be awarded your ${bonusMonths} month's salary as a one-time performance based bonus.`
            : ''),
      ]

    case 'Proportionate':
      return [
        increase +
          (bonus
            ? ` In addition, you will be awarded proportionate amount of your ${bonusMonths} month's salary as a one-time performance based bonus.`
            : ''),
      ]

    case 'Discipline': {
      const pct =
        letter.discipline_pct !== null && letter.discipline_pct !== undefined
          ? `${Math.round(Number(letter.discipline_pct) * 100)}%`
          : '_____'
      return [
        increase +
          (bonus
            ? ` In addition, you will be awarded ${pct} of your ${bonusMonths} month's salary as a one-time performance based bonus.`
            : ''),
      ]
    }

    case 'Salary Only':
      // Never carries a bonus sentence, by definition of the category.
      return [increase]

    case 'Promotion': {
      const newGrade = letter.new_job_grade || '____'
      const newStep = letter.new_step || '____'
      const finalSalary = fmtMoney(letter.salary_after_promotion_adjustment)
      return [
        `Accordingly, I am pleased to inform you that effective ${effectiveDate}, ` +
          `your salary is increased from Birr ${oldSalary}.00 to Birr ${newSalary}.00.`,
        `Furthermore, due to your promotion, effective your date of release, your ` +
          `salary will be further increased to Birr ${finalSalary}.00, which puts you ` +
          `under job grade ${newGrade} step ${newStep} of the Bank's salary scale.` +
          (bonus
            ? ` In addition, you will be awarded your ${bonusMonths} month's salary as a one-time performance based bonus.`
            : ''),
      ]
    }

    default:
      return []
  }
}

// ----------------------- shared constants -----------------------

export const SIGNATORY_NAME = 'Dereje Zebene'
export const SIGNATORY_TITLE = 'President/CEO'
export const CC_LIST = ['Finance & Investors Relation Department', 'PMES Department']
export const RECIPIENT_CITY = 'Addis Ababa'
export const SALUTATION_PREFIX = 'Ato/Woy.'

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
