// "Download All Letters (PDF)" — the admin's audit archive.
//
// Everything expensive happens in ./salaryBulkExport; this file is the dialog
// around it. Its job is to tell the admin exactly what they are about to get
// before a run that can take a minute, then show honest progress while it
// happens and an honest summary afterwards.

import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CButton,
  CSpinner,
  CAlert,
  CFormSwitch,
  CProgress,
  CBadge,
} from '@coreui/react'

import { loadLetterAssets } from './salaryLetterAssets'
import {
  fetchAllLetters,
  runBulkExport,
  estimateArchiveBytes,
  triggerDownload,
} from './salaryBulkExport'

const fmtBytes = (n) => {
  if (!n) return '—'
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

// A plain-English rendering of the filter bar, so the admin can see whether the
// archive they are about to build is the one they meant.
export const describeScope = (f) => {
  const bits = []
  bits.push(f.fiscal_year ? `FY ${f.fiscal_year}` : 'all fiscal years')
  if (f.category) bits.push(f.category)
  if (f.status) bits.push(`${f.status} only`)
  if (f.q) bits.push(`matching "${f.q}"`)
  return bits.join(' · ')
}

const SalaryIncrementBulkExportModal = ({ visible, onClose, filters, accessToken }) => {
  const [phase, setPhase] = useState('idle') // idle | counting | ready | running | done | error
  const [letters, setLetters] = useState([])
  const [truncated, setTruncated] = useState(false)
  const [cap, setCap] = useState(0)
  const [exportedBy, setExportedBy] = useState('')
  const [withLetterhead, setWithLetterhead] = useState(true)
  const [assets, setAssets] = useState(null)
  const [progress, setProgress] = useState({ done: 0, total: 0, phase: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const cancelRef = useRef(false)
  const scope = describeScope(filters)

  // Count the rows and warm the letterhead as soon as the dialog opens, so the
  // size estimate below is a measured number rather than a guess.
  useEffect(() => {
    if (!visible) return undefined
    let dead = false
    cancelRef.current = false
    setPhase('counting')
    setError(null)
    setResult(null)
    setProgress({ done: 0, total: 0, phase: '' })
    ;(async () => {
      try {
        const [fetched, prepared] = await Promise.all([
          fetchAllLetters(filters, accessToken),
          loadLetterAssets().catch(() => null),
        ])
        if (dead) return
        setLetters(fetched.data)
        setTruncated(fetched.truncated)
        setCap(fetched.cap)
        setExportedBy(fetched.exportedBy)
        setAssets(prepared)
        setPhase('ready')
      } catch (e) {
        if (dead) return
        setError((e && e.message) || 'Could not load the letters')
        setPhase('error')
      }
    })()
    return () => {
      dead = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, accessToken, filters.fiscal_year, filters.category, filters.status, filters.q])

  const start = useCallback(async () => {
    cancelRef.current = false
    setPhase('running')
    setError(null)
    try {
      const out = await runBulkExport({
        letters,
        withLetterhead,
        scope,
        exportedBy,
        onProgress: setProgress,
        isCancelled: () => cancelRef.current,
      })
      triggerDownload(out.blob, `${out.folder}.zip`)
      // Keep the summary, not the archive. Holding the Blob in state would pin
      // the whole thing — a hundred megabytes for a full year — in memory for as
      // long as the dialog stays open, for no reason: it is already downloaded.
      setResult({
        folder: out.folder,
        written: out.written,
        failed: out.failed,
        shrunk: out.shrunk,
        cancelled: out.cancelled,
        size: out.blob.size,
      })
      setPhase('done')
    } catch (e) {
      setError((e && e.message) || 'Export failed')
      setPhase('error')
    }
  }, [letters, withLetterhead, scope, exportedBy])

  const busy = phase === 'running'
  const estimate = assets ? estimateArchiveBytes(assets, letters.length, withLetterhead) : 0
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0

  const nonCommitted = letters.filter((l) => l.status !== 'Committed').length

  return (
    <CModal
      visible={visible}
      onClose={() => !busy && onClose()}
      backdrop="static"
      alignment="center"
    >
      <CModalHeader closeButton={!busy}>
        <CModalTitle>Download All Letters (PDF)</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {phase === 'counting' && (
          <div className="d-flex align-items-center" style={{ gap: 10 }}>
            <CSpinner size="sm" /> <span>Counting letters and preparing the letterhead…</span>
          </div>
        )}

        {phase === 'error' && <CAlert color="danger">{error}</CAlert>}

        {(phase === 'ready' || phase === 'running') && (
          <>
            <p className="mb-2">
              <strong>{letters.length.toLocaleString()}</strong> letter
              {letters.length === 1 ? '' : 's'} —{' '}
              <span className="text-medium-emphasis">{scope}</span>
            </p>

            {letters.length === 0 && (
              <CAlert color="warning" className="py-2">
                Nothing matches the current filters. Adjust them on the page behind this dialog and
                reopen.
              </CAlert>
            )}

            {truncated && (
              <CAlert color="warning" className="py-2">
                The server capped this at <strong>{cap.toLocaleString()}</strong> letters. Narrow
                the filters (one fiscal year at a time) to be sure you get everything.
              </CAlert>
            )}

            {letters.length > 0 && (
              <>
                <p className="mb-2">
                  You will get a ZIP containing a folder named for today&apos;s date and time, with
                  one PDF per employee named <code>Employee Name (domain user).pdf</code>, plus a{' '}
                  <code>MANIFEST.csv</code> indexing every row.
                </p>

                {nonCommitted > 0 && (
                  <CAlert color="info" className="py-2">
                    <strong>{nonCommitted}</strong> of these are not in the{' '}
                    <CBadge color="success">Committed</CBadge> state. They are included so the
                    archive is a complete record, and each is stamped across the page so a single
                    PDF taken out of the folder cannot be mistaken for a live letter.
                  </CAlert>
                )}

                <CFormSwitch
                  id="bulkExportLetterhead"
                  label="Include letterhead artwork (logo, watermark, stamp, footer)"
                  checked={withLetterhead}
                  onChange={(e) => setWithLetterhead(e.target.checked)}
                  disabled={busy}
                  className="mb-2"
                />
                <p className="text-medium-emphasis mb-3" style={{ fontSize: 13 }}>
                  Estimated archive size <strong>{fmtBytes(estimate)}</strong>. Turning the
                  letterhead off produces much smaller files for printing on pre-printed paper.
                </p>
              </>
            )}

            {busy && (
              <>
                <CProgress value={pct} className="mb-2" style={{ height: 20 }}>
                  {pct}%
                </CProgress>
                <p className="text-medium-emphasis mb-0" style={{ fontSize: 13 }}>
                  {progress.phase} {progress.done.toLocaleString()} of{' '}
                  {progress.total.toLocaleString()}
                </p>
              </>
            )}
          </>
        )}

        {phase === 'done' && result && (
          <>
            <CAlert color={result.cancelled ? 'warning' : 'success'} className="py-2">
              {result.cancelled
                ? 'Stopped early — partial archive downloaded.'
                : 'Archive downloaded.'}
            </CAlert>
            <p className="mb-1">
              <strong>{result.written.toLocaleString()}</strong> letter
              {result.written === 1 ? '' : 's'} written · {fmtBytes(result.size)}
            </p>
            <p className="mb-1 text-medium-emphasis" style={{ fontSize: 13 }}>
              Folder: <code>{result.folder}</code>
            </p>
            {result.shrunk > 0 && (
              <p className="mb-1 text-medium-emphasis" style={{ fontSize: 13 }}>
                {result.shrunk} letter{result.shrunk === 1 ? ' was' : 's were'} typeset slightly
                tighter to stay on one page.
              </p>
            )}
            {result.failed.length > 0 && (
              <CAlert color="warning" className="py-2 mt-2 mb-0">
                <strong>{result.failed.length}</strong> could not be rendered and{' '}
                <strong>are not in the archive</strong>. They are listed in MANIFEST.csv with the
                reason. First few:
                <ul className="mb-0 mt-1">
                  {result.failed.slice(0, 5).map((f) => (
                    <li key={f.domain_user}>
                      {f.employee_name} ({f.domain_user}) — {f.reason}
                    </li>
                  ))}
                </ul>
              </CAlert>
            )}
          </>
        )}
      </CModalBody>

      <CModalFooter>
        {busy ? (
          <CButton
            color="warning"
            variant="outline"
            onClick={() => {
              cancelRef.current = true
            }}
          >
            Stop
          </CButton>
        ) : (
          <CButton color="secondary" variant="outline" onClick={onClose}>
            {phase === 'done' ? 'Close' : 'Cancel'}
          </CButton>
        )}
        {phase !== 'done' && (
          <CButton color="primary" disabled={phase !== 'ready' || !letters.length} onClick={start}>
            {busy ? (
              <>
                <CSpinner size="sm" className="me-2" /> Building…
              </>
            ) : (
              `Download ${letters.length ? letters.length.toLocaleString() : ''} PDF${
                letters.length === 1 ? '' : 's'
              }`
            )}
          </CButton>
        )}
      </CModalFooter>
    </CModal>
  )
}

SalaryIncrementBulkExportModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  accessToken: PropTypes.string,
}

export default SalaryIncrementBulkExportModal
