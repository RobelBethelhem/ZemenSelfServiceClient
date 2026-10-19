import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
  CAlert,
  CButton,
  CFormInput,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilReload } from '@coreui/icons'
import { fetchProfileAnalytics, PROFILE_SECTIONS } from '../../../api/profile'
import './analytics.css'

// Admin view of how employees use My Profile: who opened it, which sections
// they looked at, whether they revealed their private details, and how the
// "new feature" pop-up performed. The range filter scopes every number on the
// page. Only the fact that a section was viewed is recorded — never its values.

const RANGES = [
  { key: '7', label: 'Last 7 days' },
  { key: '30', label: 'Last 30 days' },
  { key: '90', label: 'Last 90 days' },
  { key: 'all', label: 'All time' },
]

const PAGE_SIZE = 20
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SECTION_LABEL = Object.fromEntries(PROFILE_SECTIONS.map((s) => [s.key, s.label]))

const fmtInt = (n) => Number(n || 0).toLocaleString('en-US')
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0)
const compact = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}K` : String(n))

const dayParts = (day) => /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day || ''))
const fmtDay = (day) => {
  const m = dayParts(day)
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}` : day
}
const fmtDayLong = (day) => {
  const m = dayParts(day)
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : day
}

const whenFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Addis_Ababa',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const fmtWhen = (iso) => (iso ? whenFormat.format(new Date(iso)) : null)

// Clean y-axis steps (1, 2, 5 x 10^n), about four of them.
const niceScale = (max) => {
  if (max <= 4) return { top: 4, step: 1 }
  const raw = max / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
  return { top: Math.ceil(max / step) * step, step }
}

// Spreadsheet apps execute a cell that starts with = + - @, so those are
// prefixed with a quote.
const csvCell = (value) => {
  let s = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
)

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

const Kpi = ({ label, value, note, meter }) => (
  <div className="zb-pa-kpi">
    <div className="zb-pa-kpi-label">{label}</div>
    <div className="zb-pa-kpi-value">{value}</div>
    {note ? <div className="zb-pa-kpi-note">{note}</div> : null}
    {meter != null ? (
      <div className="zb-pa-meter" role="img" aria-label={`${meter}%`}>
        <span style={{ width: `${Math.min(100, meter)}%` }} />
      </div>
    ) : null}
  </div>
)

// Shared hover/focus readout. Values lead, labels follow; keyed with a short
// stroke of the mark colour.
const Tip = ({ tip }) =>
  tip ? (
    <div className="zb-pa-tip" style={{ left: tip.x, top: tip.y }} role="status">
      <div className="zb-pa-tip-title">{tip.title}</div>
      {tip.rows.map((r) => (
        <div className="zb-pa-tip-row" key={r.label}>
          <span className={`zb-pa-key${r.muted ? ' is-muted' : ''}`} />
          <strong>{r.value}</strong>
          <span>{r.label}</span>
        </div>
      ))}
    </div>
  ) : null

const tipAt = (container, target, fraction, title, rows) => {
  const c = container.getBoundingClientRect()
  const r = target.getBoundingClientRect()
  const x = Math.min(Math.max(r.left + r.width / 2 - c.left, 90), c.width - 90)
  const y = r.top + r.height * (1 - fraction) - c.top
  return { x, y, title, rows }
}

const SectionBars = ({ sections, visitors }) => {
  const boxRef = useRef(null)
  const [tip, setTip] = useState(null)
  const max = Math.max(1, visitors, ...sections.map((s) => s.users))

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <ul className="zb-pa-bars">
        {sections.map((s) => {
          const label = SECTION_LABEL[s.key] || s.key
          const share = pct(s.users, visitors)
          const show = (e) =>
            setTip(
              tipAt(boxRef.current, e.currentTarget.querySelector('.zb-pa-track'), 1, label, [
                { label: `employees (${share}% of visitors)`, value: fmtInt(s.users) },
                { label: s.views === 1 ? 'view' : 'views', value: fmtInt(s.views), muted: true },
              ]),
            )
          return (
            <li
              key={s.key}
              className="zb-pa-bar-row"
              tabIndex={0}
              aria-label={`${label}: ${s.users} employees, ${s.views} views`}
              onMouseEnter={show}
              onFocus={show}
              onMouseLeave={() => setTip(null)}
              onBlur={() => setTip(null)}
            >
              <span className="zb-pa-bar-label">{label}</span>
              <span className="zb-pa-track">
                <span className="zb-pa-bar" style={{ width: `${(s.users / max) * 100}%` }} />
              </span>
              <span className="zb-pa-bar-value">
                {fmtInt(s.users)}
                {visitors ? ` · ${share}%` : ''}
                <small>
                  {fmtInt(s.views)} view{s.views === 1 ? '' : 's'}
                </small>
              </span>
            </li>
          )
        })}
      </ul>
      <Tip tip={tip} />
    </div>
  )
}

const DailyChart = ({ daily }) => {
  const chartRef = useRef(null)
  const [tip, setTip] = useState(null)
  const max = Math.max(0, ...daily.map((d) => d.users))
  const { top, step } = niceScale(Math.max(1, max))
  const ticks = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  // Counted back from today, so today is always labelled and the spacing
  // stays even (no two labels crowding at the right edge).
  const labelEvery = Math.max(1, Math.ceil(daily.length / 8))

  return (
    <div className="zb-pa-chart" ref={chartRef}>
      <div className="zb-pa-yaxis" aria-hidden="true">
        {ticks.map((v) => (
          <span key={v} style={{ bottom: `${(v / top) * 100}%` }}>
            {compact(v)}
          </span>
        ))}
      </div>
      <div className="zb-pa-plot">
        {ticks.slice(1).map((v) => (
          <span key={v} className="zb-pa-grid" style={{ bottom: `${(v / top) * 100}%` }} />
        ))}
        {daily.map((d) => {
          const show = (e) =>
            setTip(
              tipAt(chartRef.current, e.currentTarget, d.users / top, fmtDayLong(d.day), [
                { label: d.users === 1 ? 'employee' : 'employees', value: fmtInt(d.users) },
                {
                  label: d.visits === 1 ? 'visit' : 'visits',
                  value: fmtInt(d.visits),
                  muted: true,
                },
              ]),
            )
          return (
            <div
              key={d.day}
              className="zb-pa-slot"
              tabIndex={0}
              aria-label={`${fmtDayLong(d.day)}: ${d.users} employees, ${d.visits} visits`}
              onMouseEnter={show}
              onFocus={show}
              onMouseLeave={() => setTip(null)}
              onBlur={() => setTip(null)}
            >
              <span className="zb-pa-col" style={{ height: `${(d.users / top) * 100}%` }} />
            </div>
          )
        })}
      </div>
      <div className="zb-pa-xaxis" aria-hidden="true">
        {daily.map((d, i) =>
          (daily.length - 1 - i) % labelEvery === 0 ? (
            <span key={d.day} style={{ left: `${((i + 0.5) / daily.length) * 100}%` }}>
              {fmtDay(d.day)}
            </span>
          ) : null,
        )}
      </div>
      <Tip tip={tip} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const ProfileAnalytics = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [range, setRange] = useState('all')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showDailyTable, setShowDailyTable] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('last')
  const [page, setPage] = useState(0)

  const load = useCallback(
    async (r) => {
      setLoading(true)
      setError('')
      try {
        setData(await fetchProfileAnalytics({ accessToken, range: r }))
      } catch (e) {
        setError(e.message || 'Could not load the analytics.')
      } finally {
        setLoading(false)
      }
    },
    [accessToken],
  )

  useEffect(() => {
    load(range)
  }, [load, range])

  useEffect(() => {
    setPage(0)
  }, [query, status, sort, range])

  const rows = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    const list = data.employees.filter(
      (e) =>
        (status === 'all' || (status === 'opened' ? e.opens > 0 : e.opens === 0)) &&
        (!q || (e.name || '').toLowerCase().includes(q) || e.domain_user.toLowerCase().includes(q)),
    )
    const byName = (a, b) => (a.name || a.domain_user).localeCompare(b.name || b.domain_user)
    if (sort === 'visits') list.sort((a, b) => b.opens - a.opens || byName(a, b))
    else if (sort === 'name') list.sort(byName)
    else
      list.sort((a, b) => {
        if (a.last_open && b.last_open) return b.last_open.localeCompare(a.last_open)
        if (a.last_open || b.last_open) return a.last_open ? -1 : 1
        return byName(a, b)
      })
    return list
  }, [data, query, status, sort])

  const exportCsv = () => {
    const header = [
      'Name',
      'Domain user',
      'Role',
      'Visits',
      'First visit',
      'Last visit',
      'Sections viewed',
      'Revealed private details',
    ]
    const lines = rows.map((e) =>
      [
        e.name || '',
        e.domain_user,
        e.roles.includes('admin') ? 'Admin' : 'Employee',
        e.opens,
        fmtWhen(e.first_open) || '',
        fmtWhen(e.last_open) || '',
        e.sections.map((s) => SECTION_LABEL[s]).join('; '),
        e.reveals > 0 ? 'Yes' : 'No',
      ]
        .map(csvCell)
        .join(','),
    )
    const blob = new Blob([`﻿${[header.join(','), ...lines].join('\r\n')}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-profile-usage-${range === 'all' ? 'all-time' : `last-${range}-days`}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (!data && loading) {
    return (
      <div className="zb-pa text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="zb-pa">
        <CAlert color="danger" className="d-flex align-items-center justify-content-between gap-3">
          <span>{error}</span>
          <CButton color="danger" variant="outline" size="sm" onClick={() => load(range)}>
            Try again
          </CButton>
        </CAlert>
      </div>
    )
  }

  const t = data.totals
  const p = data.promo
  const allTime = range === 'all'
  const neverLabel = allTime ? 'Not opened yet' : 'No visit in this period'
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))

  return (
    <div className="zb-pa">
      <div className="zb-pa-head">
        <div>
          <h1 className="zb-pa-title">My Profile analytics</h1>
          <p className="zb-pa-sub">
            Who has opened the new My Profile page and which parts they looked at. Only the fact
            that a section was viewed is recorded — never the values on it.
          </p>
        </div>
        <div className="zb-pa-filters">
          <div className="zb-pa-seg" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={range === r.key}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => load(range)}
            disabled={loading}
            title="Refresh"
          >
            <CIcon icon={cilReload} />
          </CButton>
          <span className="zb-pa-updated">Updated {fmtWhen(data.generated_at)}</span>
        </div>
      </div>

      {error ? (
        <CAlert color="danger" dismissible onClose={() => setError('')}>
          {error}
        </CAlert>
      ) : null}

      <div className={`zb-pa-body${loading ? ' is-refreshing' : ''}`}>
        <div className="zb-pa-kpis">
          <Kpi
            label="Employees who opened it"
            value={fmtInt(t.opened_users)}
            note={`of ${fmtInt(t.portal_users)} portal users · ${pct(t.opened_users, t.portal_users)}%`}
            meter={pct(t.opened_users, t.portal_users)}
          />
          <Kpi
            label="Visits"
            value={fmtInt(t.visits)}
            note={
              t.opened_users
                ? `${(t.visits / t.opened_users).toFixed(1)} per employee`
                : 'No visits yet'
            }
          />
          <Kpi
            label="Looked at their salary"
            value={fmtInt(t.salary_users)}
            note={`${pct(t.salary_users, t.opened_users)}% of visitors`}
          />
          <Kpi
            label="Revealed private details"
            value={fmtInt(t.reveal_users)}
            note={`${pct(t.reveal_users, t.opened_users)}% of visitors`}
          />
          <Kpi
            label="Pop-up click-through"
            value={p.shown_users ? `${pct(p.click_users, p.shown_users)}%` : '—'}
            note={`${fmtInt(p.click_users)} of ${fmtInt(p.shown_users)} who saw it`}
          />
        </div>

        <div className="zb-pa-row">
          <section className="zb-pa-card">
            <div className="zb-pa-card-head">
              <h2 className="zb-pa-card-title">What employees look at</h2>
              <span className="zb-pa-card-sub">Employees who opened each section</span>
            </div>
            {t.opened_users ? (
              <SectionBars sections={data.sections} visitors={t.opened_users} />
            ) : (
              <div className="zb-pa-empty">No visits in this period.</div>
            )}
          </section>

          <section className="zb-pa-card">
            <div className="zb-pa-card-head">
              <h2 className="zb-pa-card-title">New-feature pop-up</h2>
              <span className="zb-pa-card-sub">Shown until an employee opens My Profile</span>
            </div>
            <ul className="zb-pa-funnel">
              <li>
                Saw the pop-up
                <span>
                  <strong>{fmtInt(p.shown_users)}</strong> employees
                </span>
              </li>
              <li>
                Clicked “View my profile”
                <span>
                  <strong>{fmtInt(p.click_users)}</strong> · {pct(p.click_users, p.shown_users)}%
                </span>
              </li>
              <li>
                Chose “Maybe later”
                <span>
                  <strong>{fmtInt(p.dismiss_users)}</strong> · {pct(p.dismiss_users, p.shown_users)}
                  %
                </span>
              </li>
            </ul>
            <div
              className="zb-pa-meter"
              role="img"
              aria-label={`Click-through ${pct(p.click_users, p.shown_users)}%`}
            >
              <span style={{ width: `${pct(p.click_users, p.shown_users)}%` }} />
            </div>
          </section>
        </div>

        <section className="zb-pa-card">
          <div className="zb-pa-card-head">
            <div>
              <h2 className="zb-pa-card-title">Employees opening My Profile per day</h2>
              <span className="zb-pa-card-sub">
                Addis Ababa days{allTime ? ', from the first visit' : ''}
              </span>
            </div>
            <button
              type="button"
              className="zb-pa-link"
              onClick={() => setShowDailyTable((v) => !v)}
            >
              {showDailyTable ? 'Show chart' : 'Show as table'}
            </button>
          </div>
          {showDailyTable ? (
            <div className="table-responsive" style={{ maxHeight: 320 }}>
              <CTable small hover className="zb-pa-table mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Day</CTableHeaderCell>
                    <CTableHeaderCell className="is-num">Employees</CTableHeaderCell>
                    <CTableHeaderCell className="is-num">Visits</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {[...data.daily].reverse().map((d) => (
                    <CTableRow key={d.day}>
                      <CTableDataCell>{fmtDayLong(d.day)}</CTableDataCell>
                      <CTableDataCell className="is-num">{fmtInt(d.users)}</CTableDataCell>
                      <CTableDataCell className="is-num">{fmtInt(d.visits)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          ) : (
            <DailyChart daily={data.daily} />
          )}
        </section>

        <section className="zb-pa-card">
          <div className="zb-pa-card-head">
            <div>
              <h2 className="zb-pa-card-title">Employees</h2>
              <span className="zb-pa-card-sub">
                {fmtInt(rows.length)} of {fmtInt(data.employees.length)} shown
              </span>
            </div>
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={!rows.length}
            >
              <CIcon icon={cilCloudDownload} className="me-1" />
              Download CSV
            </CButton>
          </div>

          <div className="zb-pa-toolbar">
            <CFormInput
              type="search"
              placeholder="Search by name or domain user"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <CFormSelect
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Status"
            >
              <option value="all">All employees</option>
              <option value="opened">Opened My Profile</option>
              <option value="never">{neverLabel}</option>
            </CFormSelect>
            <CFormSelect value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="last">Latest visit first</option>
              <option value="visits">Most visits first</option>
              <option value="name">Name A–Z</option>
            </CFormSelect>
          </div>

          <div className="table-responsive">
            <CTable hover align="middle" className="zb-pa-table mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell className="is-num">Visits</CTableHeaderCell>
                  <CTableHeaderCell>First visit</CTableHeaderCell>
                  <CTableHeaderCell>Latest visit</CTableHeaderCell>
                  <CTableHeaderCell>Sections viewed</CTableHeaderCell>
                  <CTableHeaderCell>Private details</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {pageRows.map((e) => (
                  <CTableRow key={e.domain_user}>
                    <CTableDataCell>
                      <div className="zb-pa-who">
                        {e.name || e.domain_user}
                        <small>
                          {e.domain_user}
                          {e.roles.includes('admin') ? ' · Admin' : ''}
                        </small>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="is-num">{fmtInt(e.opens)}</CTableDataCell>
                    {e.opens ? (
                      <>
                        <CTableDataCell className="text-nowrap">
                          {fmtWhen(e.first_open)}
                        </CTableDataCell>
                        <CTableDataCell className="text-nowrap">
                          {fmtWhen(e.last_open)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="zb-pa-chips">
                            {PROFILE_SECTIONS.map((s) => (
                              <span
                                key={s.key}
                                className={`zb-pa-chip${e.sections.includes(s.key) ? ' is-on' : ''}`}
                                title={e.sections.includes(s.key) ? 'Viewed' : 'Not viewed'}
                              >
                                {s.label}
                              </span>
                            ))}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {e.reveals > 0 ? (
                            <span className="zb-pa-yes">
                              <CheckIcon />
                              Revealed
                            </span>
                          ) : (
                            <span className="zb-pa-never">Kept hidden</span>
                          )}
                        </CTableDataCell>
                      </>
                    ) : (
                      <CTableDataCell colSpan={4}>
                        <span className="zb-pa-never">{neverLabel}</span>
                      </CTableDataCell>
                    )}
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
          {!rows.length ? <div className="zb-pa-empty">No employee matches.</div> : null}

          {rows.length > PAGE_SIZE ? (
            <div className="zb-pa-pager">
              <span>
                {fmtInt(page * PAGE_SIZE + 1)}–
                {fmtInt(Math.min(rows.length, (page + 1) * PAGE_SIZE))} of {fmtInt(rows.length)}
              </span>
              <div className="d-flex gap-2">
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((n) => n - 1)}
                >
                  Previous
                </CButton>
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  disabled={page >= pages - 1}
                  onClick={() => setPage((n) => n + 1)}
                >
                  Next
                </CButton>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

Kpi.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  note: PropTypes.node,
  meter: PropTypes.number,
}

Tip.propTypes = {
  tip: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    title: PropTypes.node,
    rows: PropTypes.arrayOf(PropTypes.object),
  }),
}

SectionBars.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  visitors: PropTypes.number.isRequired,
}

DailyChart.propTypes = {
  daily: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default ProfileAnalytics
