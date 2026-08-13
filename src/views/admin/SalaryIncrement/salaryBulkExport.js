// Bulk "download every letter as PDF" for the admin's audit archive.
//
// Shape of the work, and why it is shaped this way:
//
//   1. ONE request fetches every letter the current filter selects. Not one
//      request per letter, and not the 13 paged requests /list would have
//      needed for a 2,500-row fiscal year — the server has a dedicated
//      unpaginated endpoint for this. Network cost is O(1) in the row count.
//
//   2. The letterhead is decoded, scaled and encoded ONCE (salaryLetterAssets),
//      then handed to every letter by reference. The naive version of this
//      feature re-runs the whole image pipeline per letter.
//
//   3. Each letter is drawn as PDF vector content — a few hundred drawing
//      operations, no DOM, no layout, no rasterising. Per-letter cost is a
//      constant that does not grow with the size of the batch.
//
//   4. Entries are pushed into a streaming zip as they are produced, so peak
//      memory is one PDF plus the archive built so far, rather than 2,500 live
//      PDFs waiting for a final assembly step.
//
// Producing N documents is Ω(N) — that floor cannot be beaten. What the above
// removes is everything that was *avoidably* per-letter: the round trips, the
// image work, and the rasterisation.

import { Zip, ZipPassThrough, ZipDeflate } from 'fflate'

import { API_BASE } from '../../../api/base'
import { loadLetterAssets, chromeBytes } from './salaryLetterAssets'
import { renderLetterPdf } from './salaryLetterPdf'

/* global __VERIFY_URL_BASE__ */
const VERIFY_URL_BASE =
  typeof __VERIFY_URL_BASE__ !== 'undefined'
    ? __VERIFY_URL_BASE__
    : 'https://zhr.zemenbank.com/zbss/#/verify'

// How many letters to render before handing control back to the browser. The
// work is synchronous CPU, so without a yield the tab would freeze solid for
// the whole run and the progress bar would never paint.
const YIELD_EVERY = 5

const yieldToBrowser = () => new Promise((r) => setTimeout(r, 0))

// ------------------------------------------------------------------
// Naming
// ------------------------------------------------------------------

const pad = (n) => String(n).padStart(2, '0')

// "Salary-Increment-Letters_2026-08-13_1432" — the date and time of the export,
// which is what makes two archives pulled a month apart distinguishable at a
// glance in an auditor's folder listing.
export const archiveFolderName = (now = new Date()) =>
  `Salary-Increment-Letters_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}_${pad(now.getHours())}${pad(now.getMinutes())}`

// Windows forbids \ / : * ? " < > | in filenames, silently drops trailing dots
// and spaces, and reserves a handful of device names. An employee's name is
// user data that has to survive becoming a filename, so all of that is handled
// rather than hoped about.
const RESERVED = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i

export const safeFileName = (s, fallback = 'letter') => {
  let out = String(s || '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f<>:"/\\|?*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')
  if (!out) out = fallback
  if (RESERVED.test(out)) out = `_${out}`
  // Leave room for the folder prefix and ".pdf" inside the 255-char path limit.
  return out.length > 120 ? out.slice(0, 120).trim() : out
}

// "Abebe Kebede Tadesse (akebede).pdf" — the human name first because that is
// what someone scanning a folder looks for, with the domain user in brackets so
// two people sharing a name still get two distinct files.
export const letterFileName = (letter) => {
  const name = safeFileName(letter.employee_name || letter.domain_user, 'unnamed')
  const dom = safeFileName(letter.domain_user, 'unknown')
  return `${name} (${dom}).pdf`
}

// ------------------------------------------------------------------
// Manifest
// ------------------------------------------------------------------

const csvCell = (v) => {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const MANIFEST_COLUMNS = [
  ['File', (r) => r.file],
  ['Fiscal Year', (r) => r.letter.fiscal_year],
  ['Domain User', (r) => r.letter.domain_user],
  ['Employee Name', (r) => r.letter.employee_name],
  ['Employee ID', (r) => r.letter.employee_id],
  ['Category', (r) => r.letter.category],
  ['Status', (r) => r.letter.status],
  ['Commitment Decision', (r) => r.letter.commitment_decision],
  ['Commitment Date', (r) => r.letter.commitment_date],
  ['Reference Number', (r) => (r.letter.import_batch_id || {}).reference_number],
  ['Old Salary', (r) => r.letter.old_salary],
  ['New Salary', (r) => r.letter.new_salary],
  ['Bonus Months', (r) => r.letter.bonus_months],
  ['Printed Count', (r) => r.letter.printed_count],
  ['Revoked Date', (r) => r.letter.revoked_date],
  ['Revoke Reason', (r) => r.letter.revoke_reason],
  ['Note', (r) => r.note],
]

// A CSV index of everything in the archive, including the rows that failed to
// render. Without it, "2,486 files in a folder" is unverifiable — an auditor
// cannot tell a batch of 2,486 from a batch of 2,500 that quietly lost 14.
const buildManifest = (rows) => {
  const head = MANIFEST_COLUMNS.map(([h]) => csvCell(h)).join(',')
  const body = rows.map((r) => MANIFEST_COLUMNS.map(([, get]) => csvCell(get(r))).join(','))
  // BOM so Excel opens it as UTF-8 rather than mangling non-ASCII names.
  return `﻿${[head, ...body].join('\r\n')}\r\n`
}

const buildReadme = (meta) =>
  [
    'Zemen Bank — Salary Increment & Bonus letters',
    '==============================================',
    '',
    `Exported:        ${meta.exportedAt}`,
    `Exported by:     ${meta.exportedBy || 'admin'}`,
    `Scope:           ${meta.scope}`,
    `Letters written: ${meta.written}`,
    `Letters failed:  ${meta.failed}`,
    `Letterhead:      ${meta.withLetterhead ? 'yes' : 'no (plain paper)'}`,
    '',
    'One PDF per employee, named "<Employee Name> (<domain user>).pdf".',
    'MANIFEST.csv indexes every row, including any that failed to render.',
    '',
    'Each letter carries a QR code that resolves to the public verification',
    'page for that specific letter, so any individual PDF can be checked',
    'against the system independently of this archive.',
    '',
    'Letters that were not in the Committed state are stamped across the page',
    '("REVOKED - NOT VALID" or "NOT YET ACCEPTED BY EMPLOYEE"). They are',
    'included because an audit should see the full record, and stamped so a',
    'single PDF lifted out of this folder cannot be mistaken for a live letter.',
  ].join('\r\n')

// ------------------------------------------------------------------
// Fetch
// ------------------------------------------------------------------

/**
 * Pulls every letter matching the filter in a single request.
 * @returns {{ data: Array, truncated: boolean, cap: number, exportedBy: string }}
 */
export const fetchAllLetters = async (filters, accessToken) => {
  const params = new URLSearchParams()
  if (filters.fiscal_year) params.set('fiscal_year', String(filters.fiscal_year))
  if (filters.category) params.set('category', filters.category)
  if (filters.status) params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)

  const resp = await fetch(`${API_BASE}/salary-increment/export-data?${params.toString()}`, {
    headers: { 'x-access-token': accessToken || '' },
  })
  const body = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    throw new Error(body.message || `Server returned ${resp.status}`)
  }
  return {
    data: Array.isArray(body.data) ? body.data : [],
    truncated: !!(body.meta && body.meta.truncated),
    cap: (body.meta && body.meta.cap) || 0,
    // Who pulled the archive. The JWT only carries an id and roles, so the
    // server resolves the username and returns it for the README.
    exportedBy: (body.meta && body.meta.exported_by) || '',
  }
}

// ------------------------------------------------------------------
// The export
// ------------------------------------------------------------------

/**
 * Renders every letter and returns the finished archive.
 *
 * @param {object}   o
 * @param {Array}    o.letters          populated letters from fetchAllLetters
 * @param {boolean}  o.withLetterhead   embed the letterhead artwork
 * @param {string}   o.scope            human description of the filter, for the README
 * @param {string}   o.exportedBy       admin's username, for the README
 * @param {function} o.onProgress       ({done, total, phase}) => void
 * @param {function} o.isCancelled      () => boolean, polled between letters
 * @returns {Promise<{blob: Blob, folder: string, written: number, failed: Array, shrunk: number}>}
 */
export const runBulkExport = async ({
  letters,
  withLetterhead = true,
  scope = 'all letters',
  exportedBy = '',
  onProgress = () => {},
  isCancelled = () => false,
}) => {
  onProgress({ done: 0, total: letters.length, phase: 'Preparing letterhead…' })
  const assets = await loadLetterAssets()

  const folder = archiveFolderName()

  // Only nest by fiscal year when the export actually spans more than one.
  // A single-year export — the normal case — stays a flat folder of PDFs,
  // which is what somebody asked for and what is easiest to hand over.
  const years = Array.from(new Set(letters.map((l) => l.fiscal_year))).filter(
    (y) => y !== undefined && y !== null,
  )
  const nestByYear = years.length > 1

  const chunks = []
  let zipError = null
  let zipDone
  const zipFinished = new Promise((resolve) => {
    zipDone = resolve
  })

  const zip = new Zip((err, data, final) => {
    if (err) {
      zipError = err
      zipDone()
      return
    }
    if (data && data.length) chunks.push(data)
    if (final) zipDone()
  })

  // Store rather than deflate for the PDFs: jsPDF already deflates its own
  // content streams and the embedded artwork is JPEG, so a second compression
  // pass would burn CPU over every byte of a 100 MB archive to save almost
  // nothing. The text entries below are small and do compress, so those deflate.
  const addStored = (name, bytes) => {
    const entry = new ZipPassThrough(name)
    zip.add(entry)
    entry.push(bytes, true)
  }
  const addText = (name, text) => {
    const entry = new ZipDeflate(name, { level: 6 })
    zip.add(entry)
    entry.push(new TextEncoder().encode(text), true)
  }

  const manifestRows = []
  const failed = []
  const used = new Set()
  let written = 0
  let shrunk = 0
  let cancelled = false

  for (let i = 0; i < letters.length; i += 1) {
    if (isCancelled()) {
      cancelled = true
      break
    }
    const letter = letters[i]
    const dir = nestByYear ? `${folder}/FY${letter.fiscal_year}` : folder

    try {
      if (!letter.import_batch_id || typeof letter.import_batch_id !== 'object') {
        throw new Error('import batch missing — letter cannot state its reference or dates')
      }

      let name = letterFileName(letter)
      // The (domain_user, fiscal_year) index makes collisions impossible in
      // practice; this is here so that if one ever happens the second letter is
      // still written instead of silently replacing the first.
      let key = `${dir}/${name}`.toLowerCase()
      if (used.has(key)) {
        let n = 2
        while (used.has(`${dir}/${name.replace(/\.pdf$/, ` [${n}].pdf`)}`.toLowerCase())) n += 1
        name = name.replace(/\.pdf$/, ` [${n}].pdf`)
        key = `${dir}/${name}`.toLowerCase()
      }
      used.add(key)

      const { bytes, shrunk: didShrink } = renderLetterPdf(letter, assets, {
        withLetterhead,
        verifyUrlBase: VERIFY_URL_BASE,
      })
      if (didShrink) shrunk += 1

      addStored(`${dir}/${name}`, bytes)
      written += 1
      manifestRows.push({
        file: nestByYear ? `FY${letter.fiscal_year}/${name}` : name,
        letter,
        note: didShrink ? 'typeset one notch tighter to stay on one page' : '',
      })
    } catch (e) {
      const reason = (e && e.message) || 'render failed'
      failed.push({
        domain_user: letter.domain_user,
        employee_name: letter.employee_name,
        reason,
      })
      manifestRows.push({ file: '(not written)', letter, note: `FAILED: ${reason}` })
    }

    if (i % YIELD_EVERY === YIELD_EVERY - 1) {
      onProgress({ done: i + 1, total: letters.length, phase: 'Rendering letters…' })
      await yieldToBrowser()
    }
  }

  onProgress({ done: letters.length, total: letters.length, phase: 'Building archive…' })

  addText(`${folder}/MANIFEST.csv`, buildManifest(manifestRows))
  addText(
    `${folder}/README.txt`,
    buildReadme({
      exportedAt: new Date().toString(),
      exportedBy,
      scope: cancelled ? `${scope} (CANCELLED PART-WAY)` : scope,
      written,
      failed: failed.length,
      withLetterhead,
    }),
  )

  zip.end()
  await zipFinished
  if (zipError) throw zipError

  return {
    blob: new Blob(chunks, { type: 'application/zip' }),
    folder,
    written,
    failed,
    shrunk,
    cancelled,
  }
}

// Size estimate shown before the admin commits to a long run.
//
// 7.5 KB is the measured cost of one letter's text, fonts, QR vectors and PDF
// structure with the artwork excluded — taken from rendering the real thing,
// not guessed. The artwork on top of that is known exactly once the assets have
// been prepared, which is why the dialog waits for them before quoting a size.
export const estimateArchiveBytes = (assets, count, withLetterhead) =>
  count * (chromeBytes(assets, withLetterhead) + 7.5 * 1024)

export const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
