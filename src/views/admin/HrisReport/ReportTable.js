import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import * as XLSX from 'xlsx'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { Box, Button } from '@mui/material'
import { CAlert } from '@coreui/react'

// One table for every report shape.
//
// Columns are derived from the data because the queries decide their own
// output — the matrix view literally builds its columns at runtime — so a
// hard-coded column list would break the moment a report changed.
//
// Built on material-react-table (already used by the Candidate and Salary
// Increment pages) so hiding, reordering, pinning and resizing come from the
// same component the rest of the portal uses, rather than a second
// hand-rolled implementation.

// Plumbing rather than information.
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
      : v.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }
  return String(v)
}

// Excel gets raw values, not display strings — a date rendered as "31 Jul 2026"
// is text in a spreadsheet and cannot be sorted or subtotalled.
const toSheetValue = (v) => {
  if (v === null || v === undefined) return ''
  if (isDateish(v)) {
    const d = v instanceof Date ? v : new Date(v)
    return Number.isNaN(d.getTime()) ? String(v) : d
  }
  return v
}

// Header keys arrive in two styles: SQL aliases the pack already spells out
// ("ID No.", "Full name") and camelCase from the Explorer's own queries.
const prettyHeader = (key) => (/[ .]/.test(key) ? key : key.replace(/([a-z0-9])([A-Z])/g, '$1 $2'))

const BORDER = '1px solid rgba(0, 0, 0, 0.14)'

const ReportTable = ({ rows, title, emptyMessage, serverPaged, totalRowCount, dense }) => {
  const columnKeys = useMemo(() => {
    if (!rows || !rows.length) return []
    // Union across a sample: a query can legitimately return a column that is
    // null on the first row.
    const keys = new Set()
    rows.slice(0, 25).forEach((r) => Object.keys(r).forEach((k) => keys.add(k)))
    return Array.from(keys).filter((k) => !HIDDEN.has(k))
  }, [rows])

  // Numeric columns are right-aligned. Decided from the data rather than the
  // name, because "Salary" and "Headcount" look nothing alike.
  const numericKeys = useMemo(() => {
    const set = new Set()
    columnKeys.forEach((key) => {
      let seen = 0
      let numeric = 0
      for (let i = 0; i < Math.min(rows.length, 50); i += 1) {
        const v = rows[i][key]
        if (v === null || v === undefined || v === '') continue
        seen += 1
        if (typeof v === 'number') numeric += 1
      }
      if (seen > 0 && numeric === seen) set.add(key)
    })
    return set
  }, [rows, columnKeys])

  const columns = useMemo(
    () =>
      columnKeys.map((key) => {
        const isNumeric = numericKeys.has(key)
        return {
          id: key,
          header: prettyHeader(key),
          // accessorFn, not accessorKey: report headers contain dots
          // ("ID No.") and TanStack reads a dotted accessorKey as a nested
          // path, which would resolve to undefined for every row.
          accessorFn: (row) => row[key],
          Cell: ({ cell }) => fmt(cell.getValue()),
          muiTableBodyCellProps: {
            align: isNumeric ? 'right' : 'left',
            sx: { borderRight: BORDER, whiteSpace: 'nowrap' },
          },
          muiTableHeadCellProps: {
            align: isNumeric ? 'right' : 'left',
            sx: { borderRight: BORDER, whiteSpace: 'nowrap', fontWeight: 700 },
          },
        }
      }),
    [columnKeys, numericKeys],
  )

  const data = useMemo(() => rows || [], [rows])

  // TotalRows rides on every row of a detail query. When it exceeds what came
  // back, the server capped the page — say so rather than let a partial answer
  // read as the whole workforce.
  const capped = useMemo(() => {
    if (serverPaged || !rows || !rows.length) return 0
    const total = Number(rows[0].TotalRows)
    return Number.isFinite(total) && total > rows.length ? total : 0
  }, [rows, serverPaged])

  // Exports what is on screen: the columns still visible, in the order they
  // have been dragged into, filtered by whatever is in the search box.
  // Declared before the table so it is not referenced ahead of its definition.
  const exportXlsx = (t) => {
    const visible = t
      .getVisibleLeafColumns()
      .map((c) => c.id)
      .filter((id) => columnKeys.includes(id))
    const source = t.getFilteredRowModel().rows.map((r) => r.original)

    const sheet = XLSX.utils.json_to_sheet(
      (source.length ? source : data).map((r) => {
        const out = {}
        visible.forEach((key) => {
          out[prettyHeader(key)] = toSheetValue(r[key])
        })
        return out
      }),
      { cellDates: true },
    )
    const book = XLSX.utils.book_new()
    // Excel rejects sheet names over 31 chars or containing : \ / ? * [ ]
    const safe = String(title || 'Report')
      .replace(/[:\\/?*[\]]/g, ' ')
      .slice(0, 31)
    XLSX.utils.book_append_sheet(book, sheet, safe || 'Report')
    XLSX.writeFile(book, `${safe || 'report'}.xlsx`)
  }

  const table = useMaterialReactTable({
    columns,
    data,
    // The four the report screen was missing.
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableHiding: true,
    enableColumnResizing: true,
    enableColumnActions: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableStickyHeader: true,
    enableGlobalFilter: true,
    enableColumnFilters: false,
    // Server-paged results arrive already sliced; paging them again would hide
    // most of the page the server just returned.
    enablePagination: !serverPaged,
    initialState: {
      density: dense ? 'compact' : 'comfortable',
      showGlobalFilter: true,
      pagination: { pageIndex: 0, pageSize: 50 },
    },
    muiTableContainerProps: { sx: { maxHeight: '62vh' } },
    muiTablePaperProps: { elevation: 0, sx: { border: BORDER, borderRadius: '8px' } },
    muiTableProps: { sx: { tableLayout: 'auto' } },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
        <Button size="small" variant="outlined" color="success" onClick={() => exportXlsx(table)}>
          Export to Excel
        </Button>
        <Box sx={{ fontSize: 12.5, color: 'text.secondary' }}>
          {serverPaged
            ? `${data.length.toLocaleString('en-GB')} shown of ${Number(
                totalRowCount || 0,
              ).toLocaleString('en-GB')}`
            : `${data.length.toLocaleString('en-GB')} row${data.length === 1 ? '' : 's'}`}
        </Box>
      </Box>
    ),
  })

  if (!rows || rows.length === 0) {
    return <CAlert color="info">{emptyMessage || 'No rows match these filters.'}</CAlert>
  }

  return (
    <>
      {capped > 0 && (
        <CAlert color="warning" className="py-2" style={{ fontSize: 13 }}>
          Showing the first <strong>{data.length.toLocaleString('en-GB')}</strong> of{' '}
          <strong>{capped.toLocaleString('en-GB')}</strong> matching rows. Narrow the filters to
          bring the rest into view — the export covers only what is shown here.
        </CAlert>
      )}
      <MaterialReactTable table={table} />
    </>
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
