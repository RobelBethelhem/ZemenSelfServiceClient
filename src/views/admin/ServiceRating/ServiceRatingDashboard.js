import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CSpinner,
  CAlert,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import {
  fetchRatingSummary,
  fetchRatingComments,
  fetchRatingFilters,
  SCALE_LABELS,
} from '../../../api/serviceRating'

const QUESTION_ORDER = ['q1_ease', 'q2_timeliness', 'q3_met_needs', 'q4_overall']

const SHORT_LABELS = {
  q1_ease: 'Ease of access',
  q2_timeliness: 'Timeliness',
  q3_met_needs: 'Met my needs',
  q4_overall: 'Overall satisfaction',
}

// Red through green, so a bar that leans left reads as a problem at a glance.
const SCALE_COLORS = {
  1: '#d9534f',
  2: '#ef8e51',
  3: '#adb5bd',
  4: '#4d9de0',
  5: '#3faa61',
}

const BREAKDOWNS = [
  { key: 'by_request_type', label: 'Letter type' },
  { key: 'by_department', label: 'Department' },
  { key: 'by_gender', label: 'Gender' },
  { key: 'by_job_grade', label: 'Job grade' },
  { key: 'by_age_band', label: 'Age' },
  { key: 'by_experience_band', label: 'Experience' },
]

const fmtAvg = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(2))

const fmtDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Percentage of answers at 4 or 5 — the "satisfied" share HR reports on.
const satisfiedPct = (question) => {
  if (!question || !question.answered) return null
  const good = (question.distribution[4] || 0) + (question.distribution[5] || 0)
  return Math.round((good / question.answered) * 100)
}

// Horizontal stacked bar, one segment per Likert level. Built with divs
// rather than a chart library so it always renders, prints predictably, and
// carries its own tooltips.
const StackedDistribution = ({ distribution, answered }) => {
  if (!answered) {
    return <div className="text-medium-emphasis small">No responses yet</div>
  }
  return (
    <div
      className="d-flex w-100 overflow-hidden"
      style={{ height: 22, borderRadius: 4, background: '#eef0f4' }}
    >
      {[1, 2, 3, 4, 5].map((level) => {
        const n = distribution[level] || 0
        if (!n) return null
        const pct = (n / answered) * 100
        return (
          <div
            key={level}
            title={`${SCALE_LABELS[level]}: ${n} (${Math.round(pct)}%)`}
            style={{
              width: `${pct}%`,
              background: SCALE_COLORS[level],
              color: '#fff',
              fontSize: '0.7rem',
              lineHeight: '22px',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {pct >= 9 ? n : ''}
          </div>
        )
      })}
    </div>
  )
}

StackedDistribution.propTypes = {
  distribution: PropTypes.object.isRequired,
  answered: PropTypes.number,
}

const ScaleLegend = () => (
  <div className="d-flex flex-wrap gap-3">
    {[1, 2, 3, 4, 5].map((level) => (
      <span key={level} className="d-inline-flex align-items-center small text-medium-emphasis">
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: 2,
            background: SCALE_COLORS[level],
            display: 'inline-block',
            marginRight: 6,
          }}
        />
        {SCALE_LABELS[level]}
      </span>
    ))}
  </div>
)

// The per-question view HR asked for: for every question, how many people
// answered Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree.
const QuestionBreakdown = ({ questions, dense }) => (
  <div>
    {QUESTION_ORDER.map((key) => {
      const q = questions[key]
      if (!q) return null
      return (
        <div key={key} className={dense ? 'mb-3' : 'mb-4'}>
          <div className="d-flex justify-content-between align-items-baseline mb-1 flex-wrap">
            <span className="fw-semibold" style={{ fontSize: dense ? '0.85rem' : '0.95rem' }}>
              {SHORT_LABELS[key]}
            </span>
            <span className="small text-medium-emphasis">
              avg <strong>{fmtAvg(q.average)}</strong> / 5 · {q.answered} response
              {q.answered === 1 ? '' : 's'}
              {satisfiedPct(q) !== null ? ` · ${satisfiedPct(q)}% satisfied` : ''}
            </span>
          </div>
          {!dense && (
            <div className="text-medium-emphasis mb-2" style={{ fontSize: '0.78rem' }}>
              {q.label}
            </div>
          )}
          <StackedDistribution distribution={q.distribution} answered={q.answered} />
          <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.72rem' }}>
            {[1, 2, 3, 4, 5].map((level) => (
              <span key={level} className="text-medium-emphasis">
                {SCALE_LABELS[level]}: <strong>{q.distribution[level] || 0}</strong>
              </span>
            ))}
          </div>
        </div>
      )
    })}
  </div>
)

QuestionBreakdown.propTypes = {
  questions: PropTypes.object.isRequired,
  dense: PropTypes.bool,
}

const KpiCard = ({ label, value, hint, color }) => (
  <CCard className="h-100">
    <CCardBody>
      <div
        className="text-medium-emphasis text-uppercase fw-semibold"
        style={{ fontSize: '0.7rem' }}
      >
        {label}
      </div>
      <div className={`fs-3 fw-semibold ${color || ''}`}>{value}</div>
      {hint ? <div className="small text-medium-emphasis">{hint}</div> : null}
    </CCardBody>
  </CCard>
)

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  hint: PropTypes.string,
  color: PropTypes.string,
}

const emptyFilters = {
  from: '',
  to: '',
  request_type: '',
  approved_by: '',
  department: '',
}

const ServiceRatingDashboard = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [filters, setFilters] = useState(emptyFilters)
  const [options, setOptions] = useState({
    approvers: [],
    departments: [],
    job_grades: [],
    request_types: [],
  })
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedApprover, setSelectedApprover] = useState(null)
  const [breakdownTab, setBreakdownTab] = useState('by_request_type')

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsTotal, setCommentsTotal] = useState(0)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsApprover, setCommentsApprover] = useState('')

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchRatingSummary({ accessToken, filters })
      setSummary(data)
    } catch (e) {
      setError(e.message || 'Could not load service rating data.')
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [accessToken, filters])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    fetchRatingFilters({ accessToken })
      .then((data) =>
        setOptions({
          approvers: data.approvers || [],
          departments: data.departments || [],
          job_grades: data.job_grades || [],
          request_types: data.request_types || [],
        }),
      )
      .catch(() => {
        /* dropdowns degrade to free-text; not worth an error banner */
      })
  }, [accessToken])

  const loadComments = useCallback(
    async (approver) => {
      setCommentsLoading(true)
      try {
        const data = await fetchRatingComments({
          accessToken,
          filters: { ...filters, approved_by: approver || filters.approved_by },
          page: 0,
          size: 100,
        })
        setComments(data.data || [])
        setCommentsTotal((data.meta && data.meta.totalRowCount) || 0)
      } catch (e) {
        setComments([])
        setCommentsTotal(0)
      } finally {
        setCommentsLoading(false)
      }
    },
    [accessToken, filters],
  )

  const openComments = (approver = '') => {
    setCommentsApprover(approver)
    setCommentsOpen(true)
    loadComments(approver)
  }

  const overall = summary && summary.overall
  const approvers = (summary && summary.by_approver) || []

  const selected = useMemo(
    () => approvers.find((a) => a.key === selectedApprover) || null,
    [approvers, selectedApprover],
  )

  const setFilter = (key, value) => {
    setSelectedApprover(null)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const totalComments = overall ? overall.comments : 0

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <strong>Service Rating</strong>
              <div className="small text-medium-emphasis">
                Feedback collected from requesters before the first print or download of an approved
                letter.
              </div>
            </div>
            <CButton color="primary" variant="outline" onClick={() => openComments('')}>
              Read feedback
              {totalComments ? (
                <CBadge color="primary" className="ms-2">
                  {totalComments}
                </CBadge>
              ) : null}
            </CButton>
          </CCardHeader>

          <CCardBody>
            {/* ---------------- filters ---------------- */}
            <CRow className="g-3 align-items-end mb-4">
              <CCol md={2}>
                <CFormLabel className="small mb-1">From</CFormLabel>
                <CFormInput
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilter('from', e.target.value)}
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small mb-1">To</CFormLabel>
                <CFormInput
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilter('to', e.target.value)}
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small mb-1">Letter type</CFormLabel>
                <CFormSelect
                  value={filters.request_type}
                  onChange={(e) => setFilter('request_type', e.target.value)}
                >
                  <option value="">All</option>
                  {options.request_types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel className="small mb-1">Approved by</CFormLabel>
                <CFormSelect
                  value={filters.approved_by}
                  onChange={(e) => setFilter('approved_by', e.target.value)}
                >
                  <option value="">All approvers</option>
                  {options.approvers.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small mb-1">Department</CFormLabel>
                <CFormSelect
                  value={filters.department}
                  onChange={(e) => setFilter('department', e.target.value)}
                >
                  <option value="">All</option>
                  {options.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={1}>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="w-100"
                  onClick={() => {
                    setSelectedApprover(null)
                    setFilters(emptyFilters)
                  }}
                >
                  Reset
                </CButton>
              </CCol>
            </CRow>

            {error ? <CAlert color="danger">{error}</CAlert> : null}

            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
              </div>
            ) : !overall || !overall.count ? (
              <CAlert color="info" className="mb-0">
                No service ratings match the current filters yet. Ratings appear here once a
                requester prints or downloads an approved letter for the first time.
              </CAlert>
            ) : (
              <>
                {/* ---------------- KPIs ---------------- */}
                <CRow className="g-3 mb-4">
                  <CCol sm={6} lg={3}>
                    <KpiCard label="Responses" value={overall.count} hint="Rated requests" />
                  </CCol>
                  <CCol sm={6} lg={3}>
                    <KpiCard
                      label="Average score"
                      value={`${fmtAvg(overall.avg_overall)} / 5`}
                      hint="Mean of questions 1-4"
                    />
                  </CCol>
                  <CCol sm={6} lg={3}>
                    <KpiCard
                      label="Overall satisfaction"
                      value={
                        satisfiedPct(overall.questions.q4_overall) === null
                          ? '—'
                          : `${satisfiedPct(overall.questions.q4_overall)}%`
                      }
                      hint="Agree or Strongly Agree on Q4"
                    />
                  </CCol>
                  <CCol sm={6} lg={3}>
                    <KpiCard
                      label="Written suggestions"
                      value={overall.comments}
                      hint="Question 5 responses"
                    />
                  </CCol>
                </CRow>

                {/* ---------------- overall per question ---------------- */}
                <CCard className="mb-4">
                  <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <strong>Ratings by question</strong>
                    <ScaleLegend />
                  </CCardHeader>
                  <CCardBody>
                    <QuestionBreakdown questions={overall.questions} />
                  </CCardBody>
                </CCard>

                {/* ---------------- per approver ---------------- */}
                <CCard className="mb-4">
                  <CCardHeader>
                    <strong>By approver</strong>
                    <div className="small text-medium-emphasis">
                      Select an approver to see their per-question rating breakdown.
                    </div>
                  </CCardHeader>
                  <CCardBody>
                    <div className="table-responsive">
                      <CTable hover align="middle" className="mb-0">
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Approver</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Responses</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Avg</CTableHeaderCell>
                            {QUESTION_ORDER.map((key) => (
                              <CTableHeaderCell key={key} className="text-center">
                                {SHORT_LABELS[key]}
                              </CTableHeaderCell>
                            ))}
                            <CTableHeaderCell className="text-center">Comments</CTableHeaderCell>
                            <CTableHeaderCell />
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {approvers.map((row) => (
                            <CTableRow
                              key={row.key}
                              active={row.key === selectedApprover}
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setSelectedApprover(row.key === selectedApprover ? null : row.key)
                              }
                            >
                              <CTableDataCell className="fw-semibold">{row.key}</CTableDataCell>
                              <CTableDataCell className="text-center">{row.count}</CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CBadge
                                  color={
                                    row.avg_overall >= 4
                                      ? 'success'
                                      : row.avg_overall >= 3
                                        ? 'warning'
                                        : 'danger'
                                  }
                                >
                                  {fmtAvg(row.avg_overall)}
                                </CBadge>
                              </CTableDataCell>
                              {QUESTION_ORDER.map((key) => (
                                <CTableDataCell key={key} className="text-center">
                                  {fmtAvg(row.questions[key].average)}
                                </CTableDataCell>
                              ))}
                              <CTableDataCell className="text-center">
                                {row.comments}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                <CButton
                                  size="sm"
                                  color="secondary"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openComments(row.key)
                                  }}
                                >
                                  Feedback
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>

                    {selected ? (
                      <div className="mt-4 pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                          <div>
                            <strong>{selected.key}</strong>
                            <span className="text-medium-emphasis ms-2 small">
                              {selected.count} response{selected.count === 1 ? '' : 's'} · average{' '}
                              {fmtAvg(selected.avg_overall)} / 5
                            </span>
                          </div>
                          <ScaleLegend />
                        </div>
                        <QuestionBreakdown questions={selected.questions} />
                      </div>
                    ) : null}
                  </CCardBody>
                </CCard>

                {/* ---------------- demographic breakdowns ---------------- */}
                <CCard>
                  <CCardHeader>
                    <strong>Breakdowns</strong>
                    <div className="small text-medium-emphasis">
                      Employee attributes are captured from HRIS at the moment the rating is
                      submitted.
                    </div>
                  </CCardHeader>
                  <CCardBody>
                    <CNav variant="tabs" className="mb-3">
                      {BREAKDOWNS.map((b) => (
                        <CNavItem key={b.key}>
                          <CNavLink
                            href="#"
                            active={breakdownTab === b.key}
                            onClick={(e) => {
                              e.preventDefault()
                              setBreakdownTab(b.key)
                            }}
                          >
                            {b.label}
                          </CNavLink>
                        </CNavItem>
                      ))}
                    </CNav>

                    <div className="table-responsive">
                      <CTable align="middle" className="mb-0">
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell style={{ minWidth: 180 }}>
                              {(BREAKDOWNS.find((b) => b.key === breakdownTab) || {}).label}
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Responses</CTableHeaderCell>
                            <CTableHeaderCell className="text-center">Avg</CTableHeaderCell>
                            <CTableHeaderCell style={{ minWidth: 240 }}>
                              Overall satisfaction (Q4)
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {((summary && summary[breakdownTab]) || []).map((row) => (
                            <CTableRow key={row.key}>
                              <CTableDataCell className="fw-semibold">{row.key}</CTableDataCell>
                              <CTableDataCell className="text-center">{row.count}</CTableDataCell>
                              <CTableDataCell className="text-center">
                                {fmtAvg(row.avg_overall)}
                              </CTableDataCell>
                              <CTableDataCell>
                                <StackedDistribution
                                  distribution={row.questions.q4_overall.distribution}
                                  answered={row.questions.q4_overall.answered}
                                />
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                    <div className="mt-3">
                      <ScaleLegend />
                    </div>
                  </CCardBody>
                </CCard>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* ---------------- open-ended feedback sidebar ---------------- */}
      <COffcanvas
        placement="end"
        visible={commentsOpen}
        onHide={() => setCommentsOpen(false)}
        style={{ width: 'min(520px, 100%)' }}
      >
        <COffcanvasHeader className="border-bottom">
          <div>
            <COffcanvasTitle>Written feedback</COffcanvasTitle>
            <div className="small text-medium-emphasis">
              {commentsApprover ? (
                <>
                  Approved by <strong>{commentsApprover}</strong>
                </>
              ) : (
                'All approvers'
              )}
              {commentsTotal
                ? ` · ${commentsTotal} suggestion${commentsTotal === 1 ? '' : 's'}`
                : ''}
            </div>
          </div>
          <CButton
            color="secondary"
            variant="ghost"
            size="sm"
            onClick={() => setCommentsOpen(false)}
          >
            Close
          </CButton>
        </COffcanvasHeader>
        <COffcanvasBody>
          {commentsLoading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : comments.length === 0 ? (
            <CAlert color="info">
              No written suggestions for this selection. Question 5 is optional, so most ratings
              carry scores only.
            </CAlert>
          ) : (
            comments.map((c) => (
              <CCard className="mb-3" key={c._id}>
                <CCardBody>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div>
                      <div className="fw-semibold">{c.employee_name || c.domain_user}</div>
                      <div className="small text-medium-emphasis">
                        {c.domain_user}
                        {c.department ? ` · ${c.department}` : ''}
                      </div>
                    </div>
                    <CBadge
                      color={
                        c.average_score >= 4
                          ? 'success'
                          : c.average_score >= 3
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {fmtAvg(c.average_score)} / 5
                    </CBadge>
                  </div>

                  <blockquote
                    className="mb-2"
                    style={{
                      borderLeft: '3px solid #d4d8e0',
                      paddingLeft: '0.75rem',
                      fontStyle: 'italic',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {c.q5_suggestion}
                  </blockquote>

                  <div className="small text-medium-emphasis">
                    {c.request_type}
                    {c.reference_number ? ` · ${c.reference_number}` : ''}
                    {c.approved_by ? ` · approved by ${c.approved_by}` : ''} ·{' '}
                    {fmtDate(c.submitted_at)}
                  </div>
                  <div className="small text-medium-emphasis mt-1">
                    {[c.gender, c.age ? `${c.age} yrs` : null, c.job_grade, c.experience_text]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </CCardBody>
              </CCard>
            ))
          )}
        </COffcanvasBody>
      </COffcanvas>
    </CRow>
  )
}

export default ServiceRatingDashboard
