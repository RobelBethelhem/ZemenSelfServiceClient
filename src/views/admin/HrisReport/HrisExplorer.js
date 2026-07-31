import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormSelect,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CSpinner,
  CAlert,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import FilterPanel from './FilterPanel'
import ReportTable from './ReportTable'
import {
  fetchReportStatus,
  fetchReportMeta,
  fetchDimensionValues,
  runDetail,
  runSummary,
  runPivot,
  runMovement,
  refreshSnapshots,
  cleanFilters,
  countActiveFilters,
  PIVOT_METRICS,
  REPORT_CAVEATS,
  FILTER_GROUPS,
} from '../../../api/hrisReport'

// Four shapes, one filter panel. That is the design of the SQL pack: the report
// page does not need an endpoint per question, it needs an endpoint per shape —
// a list, a grouped summary, a matrix, or a movement series — and the filters
// supply the rest.

const MODES = [
  { key: 'detail', label: 'Employee list' },
  { key: 'summary', label: 'Summary' },
  { key: 'pivot', label: 'Matrix' },
  { key: 'movement', label: 'Headcount movement' },
]

// Dimensions the filter panel wants live values for.
const DIM_FIELDS = FILTER_GROUPS.flatMap((g) => g.fields)
  .filter((f) => f.type === 'dim' || f.type === 'dimMulti')
  .map((f) => f.dimension)

const DETAIL_PAGE_SIZES = [50, 100, 250, 500]

const fmtDateTime = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const hoursSince = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return (Date.now() - d.getTime()) / 36e5
}

const HrisExplorer = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [status, setStatus] = useState(null)
  const [meta, setMeta] = useState(null)
  const [dimensionValues, setDimensionValues] = useState({})
  const [booting, setBooting] = useState(true)
  const [bootError, setBootError] = useState('')
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [notice, setNotice] = useState('')

  const [filters, setFilters] = useState({})
  const [mode, setMode] = useState('summary')

  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const [result, setResult] = useState(null)
  const [showCaveats, setShowCaveats] = useState(false)

  // Mode options
  const [detailPage, setDetailPage] = useState(1)
  const [detailPageSize, setDetailPageSize] = useState(100)
  const [detailSort, setDetailSort] = useState({ SortBy: 'FullName', SortDir: 'ASC' })
  const [summaryOpts, setSummaryOpts] = useState({
    GroupBy1: 'Department',
    GroupBy2: '',
    OrderBy: 'Headcount',
    IncludePercentiles: false,
  })
  const [pivotOpts, setPivotOpts] = useState({
    RowDimension: 'Department',
    ColDimension: 'AgeBand',
    Metric: 'Headcount',
  })
  const [movementOpts, setMovementOpts] = useState({
    From: '',
    To: '',
    Period: 'Year',
    GroupBy: '',
  })

  const dimensionNames = useMemo(
    () => (meta && meta.dimensions ? meta.dimensions.map((d) => d.dimension) : []),
    [meta],
  )

  // --- boot ---------------------------------------------------------------

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      setBooting(true)
      setBootError('')
      try {
        const st = await fetchReportStatus({ accessToken })
        if (cancelled) return
        setStatus(st.status)

        // No point loading dropdowns from a database that has no pack in it.
        if (!st.status.core_installed) {
          setBooting(false)
          return
        }

        const m = await fetchReportMeta({ accessToken })
        if (cancelled) return
        setMeta(m)

        // Dimension values feed the Gender / Marital status / Age band style
        // controls. Fetched one at a time rather than in parallel: they share
        // one small HRIS pool, and a burst here competes with whatever report
        // the admin runs next.
        const wanted = Array.from(new Set(DIM_FIELDS)).filter((d) =>
          (m.dimensions || []).some((x) => x.dimension === d),
        )
        const collected = {}
        for (let i = 0; i < wanted.length; i += 1) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const r = await fetchDimensionValues({ accessToken, dimension: wanted[i] })
            collected[wanted[i]] = r.data || []
            if (!cancelled) setDimensionValues({ ...collected })
          } catch (e) {
            // A missing dimension just leaves that control as free text.
            collected[wanted[i]] = null
          }
        }
      } catch (e) {
        if (!cancelled) setBootError(e.message || 'Could not reach the HRIS reporting database.')
      } finally {
        if (!cancelled) setBooting(false)
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [accessToken])

  const loadEmployees = async () => {
    setEmployeesLoading(true)
    try {
      const m = await fetchReportMeta({ accessToken, includeEmployees: true })
      setMeta(m)
    } catch (e) {
      setRunError(e.message)
    } finally {
      setEmployeesLoading(false)
    }
  }

  const doRefresh = async () => {
    setRefreshing(true)
    setNotice('')
    setRunError('')
    try {
      const r = await refreshSnapshots({ accessToken })
      setNotice(r.message)
      const st = await fetchReportStatus({ accessToken })
      setStatus(st.status)
    } catch (e) {
      setRunError(e.message || 'The snapshot rebuild failed.')
    } finally {
      setRefreshing(false)
    }
  }

  // --- run ----------------------------------------------------------------

  const setFilter = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }, [])

  const run = useCallback(
    async (overrides = {}) => {
      setRunning(true)
      setRunError('')
      try {
        const base = cleanFilters(filters)
        if (mode === 'detail') {
          const body = {
            ...base,
            ...detailSort,
            PageNumber: overrides.PageNumber || detailPage,
            PageSize: detailPageSize,
          }
          const r = await runDetail({ accessToken, body })
          setResult({ kind: 'detail', rows: r.data, meta: r.meta })
        } else if (mode === 'summary') {
          const body = { ...base, ...summaryOpts }
          if (!body.GroupBy2) delete body.GroupBy2
          const r = await runSummary({ accessToken, body })
          setResult({ kind: 'summary', rows: r.groups || [], total: (r.total || [])[0] || null })
        } else if (mode === 'pivot') {
          const r = await runPivot({ accessToken, body: { ...base, ...pivotOpts } })
          setResult({ kind: 'pivot', rows: r.data || [], message: r.message })
        } else {
          const body = { ...movementOpts }
          if (!body.GroupBy)
            delete body.GroupBy
            // Movement takes only the organisation-shaped filters, not all 55.
          ;[
            'Presidents',
            'Departments',
            'Divisions',
            'BankingCenters',
            'JobGrades',
            'JobCategories',
            'Gender',
            'EmploymentType',
            'Regions',
          ].forEach((k) => {
            if (base[k] !== undefined) body[k] = base[k]
          })
          const r = await runMovement({ accessToken, body })
          setResult({ kind: 'movement', rows: r.data || [] })
        }
      } catch (e) {
        setRunError(e.message || 'The report could not be run.')
        setResult(null)
      } finally {
        setRunning(false)
      }
    },
    [
      accessToken,
      filters,
      mode,
      detailSort,
      detailPage,
      detailPageSize,
      summaryOpts,
      pivotOpts,
      movementOpts,
    ],
  )

  // --- charts -------------------------------------------------------------

  const summaryChart = useMemo(() => {
    if (!result || result.kind !== 'summary') return []
    return result.rows
      .slice(0, 25)
      .map((r) => ({ name: r.GroupName, Headcount: r.Headcount, AvgAge: r.AvgAge }))
  }, [result])

  const movementChart = useMemo(() => {
    if (!result || result.kind !== 'movement') return []
    // With a GroupBy the series would overlay incomparable lines, so the chart
    // only draws the ungrouped case; the table below always shows everything.
    const grouped = result.rows.some((r) => r.GroupName && r.GroupName !== '(All)')
    if (grouped) return []
    return result.rows.map((r) => ({
      name: r.PeriodLabel,
      Joiners: r.Joiners,
      Leavers: r.Leavers,
      Closing: r.Closing,
    }))
  }, [result])

  // --- render -------------------------------------------------------------

  if (booting) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="mt-2 text-medium-emphasis small">Connecting to HRIS…</div>
      </div>
    )
  }

  if (bootError) {
    return (
      <CAlert color="danger">
        <strong>HRIS reporting is unavailable.</strong>
        <div className="mt-1">{bootError}</div>
      </CAlert>
    )
  }

  if (status && !status.core_installed) {
    return (
      <CAlert color="warning">
        <strong>The HRIS reporting pack is not installed yet.</strong>
        <p className="mt-2 mb-2">
          This module reads views and stored procedures that live in the HRIS database. Run these
          against HRIS, in this order:
        </p>
        <pre className="mb-2" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
          {`sqlcmd -S localhost -d HRIS -i "HRIS_Reporting.sql"
sqlcmd -S localhost -d HRIS -i "HRIS_StandardReports.sql"
sqlcmd -S localhost -d HRIS -Q "EXEC dbo.usp_RefreshEmployeeReportSnapshot; EXEC dbo.usp_RefreshMovementSnapshot;"`}
        </pre>
        <div className="small mb-0">
          Then schedule both refreshes nightly, in that order. The reports read snapshot tables, so
          without a refresh they return whatever was last built.
        </div>
      </CAlert>
    )
  }

  const staleHours = hoursSince(status && status.snapshot_taken_at)
  const isStale = staleHours !== null && staleHours > 36

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-3">
          <CCardBody className="d-flex flex-wrap align-items-center gap-3">
            <div>
              <strong>HRIS Reports</strong>
              <div className="small text-medium-emphasis">
                {status && status.employee_rows !== null
                  ? `${status.employee_rows.toLocaleString('en-GB')} employees in the snapshot`
                  : 'Snapshot not built yet'}
                {status && status.snapshot_taken_at
                  ? ` · built ${fmtDateTime(status.snapshot_taken_at)}`
                  : ''}
              </div>
            </div>

            {isStale ? (
              <CBadge color="warning">
                Snapshot is {Math.round(staleHours)}h old — schedule the nightly refresh
              </CBadge>
            ) : null}
            {status && !status.reports_installed ? (
              <CBadge color="secondary">Standard report pack not installed</CBadge>
            ) : null}

            <div className="ms-auto d-flex gap-2">
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                onClick={() => setShowCaveats((v) => !v)}
              >
                {showCaveats ? 'Hide' : 'Read'} the caveats
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                disabled={refreshing}
                onClick={doRefresh}
              >
                {refreshing ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Rebuilding…
                  </>
                ) : (
                  'Rebuild snapshot'
                )}
              </CButton>
            </div>
          </CCardBody>
        </CCard>

        {notice ? (
          <CAlert color="success" dismissible onClose={() => setNotice('')}>
            {notice}
          </CAlert>
        ) : null}

        {showCaveats ? (
          <CAlert color="info">
            <strong>Read these before quoting any figure</strong>
            <ul className="mt-2 mb-0 ps-3" style={{ fontSize: '0.86rem' }}>
              {REPORT_CAVEATS.map((c) => (
                <li key={c.slice(0, 30)} className="mb-1">
                  {c}
                </li>
              ))}
            </ul>
          </CAlert>
        ) : null}
      </CCol>

      {/* ---------------- filters ---------------- */}
      <CCol lg={4} xl={3}>
        <CCard className="mb-3">
          <CCardBody>
            <FilterPanel
              meta={meta}
              dimensionValues={dimensionValues}
              filters={filters}
              setFilter={setFilter}
              onClear={() => setFilters({})}
              onLoadEmployees={loadEmployees}
              employeesLoading={employeesLoading}
            />
          </CCardBody>
        </CCard>
      </CCol>

      {/* ---------------- results ---------------- */}
      <CCol lg={8} xl={9}>
        <CCard>
          <CCardHeader className="pb-0">
            <CNav variant="tabs">
              {MODES.map((m) => (
                <CNavItem key={m.key}>
                  <CNavLink
                    href="#"
                    active={mode === m.key}
                    onClick={(e) => {
                      e.preventDefault()
                      setMode(m.key)
                      setResult(null)
                      setRunError('')
                    }}
                  >
                    {m.label}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>
          </CCardHeader>

          <CCardBody>
            {/* --- mode-specific controls --- */}
            <CRow className="g-3 align-items-end mb-3">
              {mode === 'detail' ? (
                <>
                  <CCol md={3}>
                    <CFormLabel className="small mb-1">Sort by</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={detailSort.SortBy}
                      onChange={(e) => setDetailSort((p) => ({ ...p, SortBy: e.target.value }))}
                    >
                      {[
                        'FullName',
                        'EmployeeId',
                        'Department',
                        'Division',
                        'Section',
                        'Position',
                        'JobGrade',
                        'JobCategory',
                        'BankingCenter',
                        'EducationLevel',
                        'Gender',
                        'AgeBand',
                        'City',
                        'Age',
                        'ServiceYears',
                        'Salary',
                        'InternalExpYears',
                        'TotalExpYears',
                        'PositionTenureYears',
                        'InternalMoves',
                        'TrainingCount',
                        'EmploymentDate',
                        'DateOfBirth',
                        'TerminationDate',
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/([a-z])([A-Z])/g, '$1 $2')}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel className="small mb-1">Direction</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={detailSort.SortDir}
                      onChange={(e) => setDetailSort((p) => ({ ...p, SortDir: e.target.value }))}
                    >
                      <option value="ASC">Ascending</option>
                      <option value="DESC">Descending</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel className="small mb-1">Rows per page</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={detailPageSize}
                      onChange={(e) => {
                        setDetailPageSize(Number(e.target.value))
                        setDetailPage(1)
                      }}
                    >
                      {DETAIL_PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </>
              ) : null}

              {mode === 'summary' ? (
                <>
                  <CCol md={3}>
                    <CFormLabel className="small mb-1">Group by</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={summaryOpts.GroupBy1}
                      onChange={(e) => setSummaryOpts((p) => ({ ...p, GroupBy1: e.target.value }))}
                    >
                      {dimensionNames.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel className="small mb-1">Then by (optional)</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={summaryOpts.GroupBy2}
                      onChange={(e) => setSummaryOpts((p) => ({ ...p, GroupBy2: e.target.value }))}
                    >
                      <option value="">None</option>
                      {dimensionNames.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel className="small mb-1">Order</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={summaryOpts.OrderBy}
                      onChange={(e) => setSummaryOpts((p) => ({ ...p, OrderBy: e.target.value }))}
                    >
                      <option value="Headcount">Headcount</option>
                      <option value="Name">Name</option>
                      <option value="Natural">Natural</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormCheck
                      id="pct"
                      label="Include medians and salary quartiles"
                      checked={summaryOpts.IncludePercentiles}
                      onChange={(e) =>
                        setSummaryOpts((p) => ({ ...p, IncludePercentiles: e.target.checked }))
                      }
                    />
                    <div className="text-medium-emphasis" style={{ fontSize: '0.72rem' }}>
                      Roughly triples the query time. Worth it on salary — the mean sits well above
                      what a typical employee earns.
                    </div>
                  </CCol>
                </>
              ) : null}

              {mode === 'pivot' ? (
                <>
                  <CCol md={3}>
                    <CFormLabel className="small mb-1">Rows</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={pivotOpts.RowDimension}
                      onChange={(e) =>
                        setPivotOpts((p) => ({ ...p, RowDimension: e.target.value }))
                      }
                    >
                      {dimensionNames.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel className="small mb-1">Columns</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={pivotOpts.ColDimension}
                      onChange={(e) =>
                        setPivotOpts((p) => ({ ...p, ColDimension: e.target.value }))
                      }
                    >
                      {dimensionNames.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel className="small mb-1">Cell value</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={pivotOpts.Metric}
                      onChange={(e) => setPivotOpts((p) => ({ ...p, Metric: e.target.value }))}
                    >
                      {PIVOT_METRICS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </>
              ) : null}

              {mode === 'movement' ? (
                <>
                  <CCol md={2}>
                    <CFormLabel className="small mb-1">From</CFormLabel>
                    <CFormInput
                      size="sm"
                      type="date"
                      value={movementOpts.From}
                      onChange={(e) => setMovementOpts((p) => ({ ...p, From: e.target.value }))}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel className="small mb-1">To</CFormLabel>
                    <CFormInput
                      size="sm"
                      type="date"
                      value={movementOpts.To}
                      onChange={(e) => setMovementOpts((p) => ({ ...p, To: e.target.value }))}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel className="small mb-1">Period</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={movementOpts.Period}
                      onChange={(e) => setMovementOpts((p) => ({ ...p, Period: e.target.value }))}
                    >
                      <option value="Month">Month</option>
                      <option value="Quarter">Quarter</option>
                      <option value="Year">Year</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel className="small mb-1">Split by (optional)</CFormLabel>
                    <CFormSelect
                      size="sm"
                      value={movementOpts.GroupBy}
                      onChange={(e) => setMovementOpts((p) => ({ ...p, GroupBy: e.target.value }))}
                    >
                      <option value="">Whole bank</option>
                      {dimensionNames.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol xs={12}>
                    <div className="text-medium-emphasis" style={{ fontSize: '0.74rem' }}>
                      Defaults to the last five years. Only the organisation filters apply to this
                      view. Terminations are only recorded from 2023 onward — earlier periods read
                      as 0% turnover, which is missing data rather than retention.
                    </div>
                  </CCol>
                </>
              ) : null}

              <CCol md={2}>
                <CButton color="primary" className="w-100" disabled={running} onClick={() => run()}>
                  {running ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Running…
                    </>
                  ) : (
                    'Run report'
                  )}
                </CButton>
              </CCol>
            </CRow>

            {runError ? <CAlert color="danger">{runError}</CAlert> : null}

            {!result && !running ? (
              <CAlert color="light" className="mb-0">
                Set your filters on the left, choose a view above, then <strong>Run report</strong>.
                {countActiveFilters(filters) === 0 ? (
                  <div className="small text-medium-emphasis mt-1">
                    With no filters set you will get all active employees — employment status
                    defaults to Active.
                  </div>
                ) : null}
              </CAlert>
            ) : null}

            {/* --- results --- */}
            {result && result.kind === 'summary' ? (
              <>
                {result.total ? (
                  <CAlert color="light" className="py-2">
                    <strong>{Number(result.total.Headcount || 0).toLocaleString('en-GB')}</strong>{' '}
                    employees match these filters
                    {result.total.AvgAge ? ` · average age ${result.total.AvgAge}` : ''}
                    {result.total.AvgService
                      ? ` · average service ${result.total.AvgService} yrs`
                      : ''}
                  </CAlert>
                ) : null}
                {summaryChart.length > 1 ? (
                  <div style={{ width: '100%', height: 260 }} className="mb-3">
                    <ResponsiveContainer>
                      <BarChart
                        data={summaryChart}
                        margin={{ top: 8, right: 8, bottom: 60, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                          height={70}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="Headcount" fill="#4d9de0" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
                <ReportTable rows={result.rows} title="HRIS summary" dense />
              </>
            ) : null}

            {result && result.kind === 'pivot' ? (
              result.message ? (
                <CAlert color="info">{result.message}</CAlert>
              ) : (
                <ReportTable rows={result.rows} title="HRIS matrix" dense />
              )
            ) : null}

            {result && result.kind === 'movement' ? (
              <>
                {movementChart.length > 1 ? (
                  <div style={{ width: '100%', height: 280 }} className="mb-3">
                    <ResponsiveContainer>
                      <LineChart
                        data={movementChart}
                        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Closing" stroke="#4d9de0" strokeWidth={2} />
                        <Line type="monotone" dataKey="Joiners" stroke="#3faa61" strokeWidth={2} />
                        <Line type="monotone" dataKey="Leavers" stroke="#d9534f" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
                <ReportTable rows={result.rows} title="Headcount movement" dense />
              </>
            ) : null}

            {result && result.kind === 'detail' ? (
              <>
                <ReportTable
                  rows={result.rows}
                  title="HRIS employee list"
                  serverPaged
                  totalRowCount={result.meta && result.meta.totalRowCount}
                  dense
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="outline"
                    disabled={detailPage <= 1 || running}
                    onClick={() => {
                      const p = detailPage - 1
                      setDetailPage(p)
                      run({ PageNumber: p })
                    }}
                  >
                    Previous
                  </CButton>
                  <span className="small text-medium-emphasis">
                    Page {detailPage} of{' '}
                    {Math.max(
                      1,
                      Math.ceil(((result.meta && result.meta.totalRowCount) || 0) / detailPageSize),
                    )}
                  </span>
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="outline"
                    disabled={
                      running ||
                      detailPage * detailPageSize >=
                        ((result.meta && result.meta.totalRowCount) || 0)
                    }
                    onClick={() => {
                      const p = detailPage + 1
                      setDetailPage(p)
                      run({ PageNumber: p })
                    }}
                  >
                    Next
                  </CButton>
                </div>
              </>
            ) : null}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default HrisExplorer
