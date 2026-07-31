import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import * as XLSX from 'xlsx'
import {
  CButton,
  CFormSelect,
  CFormInput,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

// One table for every report shape. Columns come from the data, because the
// stored procedures decide their own result columns — usp_EmployeeReport_Pivot
// literally builds them at runtime — so a hard-coded column list would break
// the moment the SQL changed.

// Columns that are plumbing rather than information.
const HIDDEN = new Set(['TotalRows', 'SnapshotTakenAt'])

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/

const isDateish = (v) => v instanceof Date || (typeof v === 'string' && ISO_DATE.test(v))

const fmt = (v) => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (isDateish(v)) {
    const d = v instanceof Date ? v : new Date(v)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  }
  if (typeof v === 'number') {
    return Number.isInteger(v)
      ? v.toLocaleString('en-GB')
      : v.toLocaleString('en-GB', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
  }
  return String(v)
}

// Excel gets the raw values, not the display strings — a date formatted as
// "31 Jul 2026" is text in a spreadsheet and cannot be sorted or subtotalled.
const toSheetValue = (v) => {
  if (v === null || v === undefined) return ''
  if (isDateish(v)) {
    const d = v instanceof Date ? v : new Date(v)
    return Number.isNaN(d.getTime()) ? String(v) : d
  }
  return v
}

const PAGE_SIZES = [25, 50, 100, 250]

const ReportTable = ({ rows, title, emptyMessage, serverPaged, totalRowCount, dense }) => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [search, setSearch] = useState('')

  const columns = useMemo(() => {
    if (!rows || !rows.length) return []
    // Union of keys across the first few rows: a procedure can legitimately
    // return a null-only column that the first row does not reveal.
    const keys = new Set()
    rows.slice(0, 25).forEach((r) => Object.keys(r).forEach((k) => keys.add(k)))
    return Array.from(keys).filter((k) => !HIDDEN.has(k))
  }, [rows])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows || []
    const needle = search.trim().toLowerCase()
    return (rows || []).filter((r) =>
      columns.some((c) =>
        String(r[c] == null ? '' : r[c])
          .toLowerCase()
          .includes(needle),
      ),
    )
  }, [rows, columns, search])

  // Server-paged results arrive already sliced; paging them again would hide
  // most of the page the server just returned.
  const visible = serverPaged ? filtered : filtered.slice(page * pageSize, (page + 1) * pageSize)
  const pageCount = serverPaged ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize))

  const exportXlsx = () => {
    const source = filtered.length ? filtered : rows || []
    const sheet = XLSX.utils.json_to_sheet(
      source.map((r) => {
        const out = {}
        columns.forEach((c) => {
          out[c] = toSheetValue(r[c])
        })
        return out
      }),
      { cellDates: true },
    )
    const book = XLSX.utils.book_new()
    // Excel refuses sheet names over 31 chars or containing : \ / ? * [ ]
    const safe = String(title || 'Report')
      .replace(/[:\\/?*[\]]/g, ' ')
      .slice(0, 31)
    XLSX.utils.book_append_sheet(book, sheet, safe || 'Report')
    XLSX.writeFile(book, `${safe || 'report'}.xlsx`)
  }

  if (!rows || rows.length === 0) {
    return <CAlert color="info">{emptyMessage || 'No rows match these filters.'}</CAlert>
  }

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <CFormInput
          size="sm"
          style={{ maxWidth: 260 }}
          placeholder="Search these results…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
        />
        <span className="small text-medium-emphasis">
          {serverPaged
            ? `${rows.length.toLocaleString('en-GB')} shown of ${Number(
                totalRowCount || 0,
              ).toLocaleString('en-GB')}`
            : `${filtered.length.toLocaleString('en-GB')} row${filtered.length === 1 ? '' : 's'}`}
        </span>
        <div className="ms-auto d-flex align-items-center gap-2">
          {!serverPaged && filtered.length > PAGE_SIZES[0] ? (
            <CFormSelect
              size="sm"
              style={{ width: 110 }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(0)
              }}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </CFormSelect>
          ) : null}
          <CButton size="sm" color="success" variant="outline" onClick={exportXlsx}>
            Export to Excel
          </CButton>
        </div>
      </div>

      <div className="table-responsive" style={{ maxHeight: '62vh', overflowY: 'auto' }}>
        <CTable small={dense} hover align="middle" className="mb-0">
          <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
            <CTableRow>
              {columns.map((c) => (
                <CTableHeaderCell key={c} style={{ whiteSpace: 'nowrap' }}>
                  {c.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </CTableHeaderCell>
              ))}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {visible.map((row, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <CTableRow key={`r${page}-${i}`}>
                {columns.map((c) => (
                  <CTableDataCell
                    key={c}
                    style={{
                      whiteSpace: 'nowrap',
                      textAlign: typeof row[c] === 'number' ? 'right' : 'left',
                    }}
                  >
                    {fmt(row[c])}
                  </CTableDataCell>
                ))}
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {!serverPaged && pageCount > 1 ? (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </CButton>
          <span className="small text-medium-emphasis">
            Page {page + 1} of {pageCount}
          </span>
          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </CButton>
        </div>
      ) : null}
    </div>
  )
}

ReportTable.propTypes = {
  rows: PropTypes.array,
  title: PropTypes.string,
  emptyMessage: PropTypes.string,
  serverPaged: PropTypes.bool,
  totalRowCount: PropTypes.number,
  dense: PropTypes.bool,
}

export default ReportTable
