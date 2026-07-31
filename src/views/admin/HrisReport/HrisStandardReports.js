import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Autocomplete, TextField, Chip } from '@mui/material'
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
  CListGroup,
  CListGroupItem,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import ReportTable from './ReportTable'
import {
  fetchReportStatus,
  fetchReportMeta,
  runStandardReport,
  cleanFilters,
} from '../../../api/hrisReport'

// The eleven named reports HR already asks for by name, each with only the
// parameters its procedure actually takes. The Explorer covers everything else.

const GENDERS = ['', 'Male', 'Female']
const STATUSES = ['', 'Active', 'Terminated', 'All']

const REPORTS = [
  {
    key: 'general',
    label: 'General purpose list',
    desc: 'One row per employee, any combination of filters. The workhorse.',
    fields: [
      { name: 'Departments', label: 'Department', type: 'multi', source: 'departments' },
      { name: 'Divisions', label: 'Division', type: 'multi', source: 'divisions' },
      { name: 'JobGrades', label: 'Job grade', type: 'multi', source: 'jobGrades' },
      { name: 'JobCategories', label: 'Job category', type: 'multi', source: 'jobCategories' },
      { name: 'BankingCenters', label: 'Branch', type: 'multi', source: 'bankingCenters' },
      { name: 'EducationLevels', label: 'Education', type: 'multi', source: 'educationLevels' },
      { name: 'Cities', label: 'City', type: 'multi', source: 'cities' },
      { name: 'Gender', label: 'Gender', type: 'select', options: GENDERS },
      { name: 'EmploymentStatus', label: 'Status', type: 'select', options: STATUSES },
      { name: 'MaritalStatus', label: 'Marital status', type: 'text' },
      { name: 'AgeFrom', label: 'Age from', type: 'num' },
      { name: 'AgeTo', label: 'Age to', type: 'num' },
      { name: 'ServiceFrom', label: 'Service from', type: 'num' },
      { name: 'ServiceTo', label: 'Service to', type: 'num' },
      { name: 'SalaryFrom', label: 'Salary from', type: 'num' },
      { name: 'SalaryTo', label: 'Salary to', type: 'num' },
      { name: 'HiredFrom', label: 'Hired from', type: 'date' },
      { name: 'HiredTo', label: 'Hired to', type: 'date' },
      { name: 'EmployeeId', label: 'Employee ID contains', type: 'text' },
      { name: 'TIN', label: 'TIN contains', type: 'text' },
      { name: 'HasGuaranteeLetter', label: 'Has guarantee letter', type: 'tri' },
    ],
  },
  {
    key: 'monthly',
    label: 'Monthly return',
    desc: 'Joiners, leavers, movements and closing headcount for one month.',
    fields: [
      { name: 'Year', label: 'Year', type: 'num' },
      { name: 'Month', label: 'Month (1-12)', type: 'num' },
      { name: 'Departments', label: 'Department', type: 'multi', source: 'departments' },
    ],
  },
  {
    key: 'manpower',
    label: 'Manpower structure',
    desc: 'Establishment, rolled up to the level you choose.',
    fields: [
      {
        name: 'Level',
        label: 'Roll up to',
        type: 'select',
        options: ['Position', 'Section', 'Division', 'Department'],
        default: 'Position',
      },
      { name: 'Presidents', label: 'President / Chief', type: 'multi', source: 'presidents' },
      { name: 'Departments', label: 'Department', type: 'multi', source: 'departments' },
      { name: 'BankingCenters', label: 'Branch', type: 'multi', source: 'bankingCenters' },
      { name: 'EmploymentStatus', label: 'Status', type: 'select', options: STATUSES },
    ],
  },
  {
    key: 'terminated',
    label: 'Terminated staff',
    desc: 'Leavers in a period, with the exit-reason summary.',
    fields: [
      { name: 'From', label: 'From', type: 'date' },
      { name: 'To', label: 'To', type: 'date' },
      { name: 'Departments', label: 'Department', type: 'multi', source: 'departments' },
      {
        name: 'TerminationReasons',
        label: 'Reason',
        type: 'multi',
        source: 'terminationReasons',
      },
      { name: 'Gender', label: 'Gender', type: 'select', options: GENDERS },
      { name: 'IncludeSummary', label: 'Include summary', type: 'bit', default: true },
    ],
  },
  {
    key: 'turnover',
    label: 'Turnover',
    desc: 'Leaver rate over time, optionally split by a dimension.',
    caveat:
      'No terminations at all are recorded for 2020, 2021 or 2022, so those periods read as 0%. That is a recording gap, not retention.',
    fields: [
      { name: 'From', label: 'From', type: 'date' },
      { name: 'To', label: 'To', type: 'date' },
      {
        name: 'Period',
        label: 'Period',
        type: 'select',
        options: ['Year', 'Quarter', 'Month'],
        default: 'Year',
      },
      { name: 'Departments', label: 'Department', type: 'multi', source: 'departments' },
      { name: 'GroupBy', label: 'Split by dimension', type: 'text', hint: 'e.g. Department' },
    ],
  },
  {
    key: 'promotion',
    label: 'Promotion',
    desc: 'Grade increases derived from posting history.',
    caveat:
      'Promotion counts are indicative. Grade is the only signal in this schema and the position records are loosely maintained — publish the movement-type breakdown alongside any figure.',
    fields: [
      { name: 'From', label: 'From', type: 'date' },
      { name: 'To', label: 'To', type: 'date' },
      {
        name: 'Departments',
        label: 'Destination department',
        type: 'multi',
        source: 'departments',
      },
      {
        name: 'BankingCenters',
        label: 'Destination branch',
        type: 'multi',
        source: 'bankingCenters',
      },
      { name: 'Gender', label: 'Gender', type: 'select', options: GENDERS },
      {
        name: 'MoveTypes',
        label: 'Movement types',
        type: 'text',
        hint: 'Comma separated. Leave empty for promotions only.',
      },
      { name: 'IncludeSummary', label: 'Include summary', type: 'bit', default: true },
    ],
  },
  {
    key: 'transfer',
    label: 'Transfer',
    desc: 'Recorded changes of department or branch.',
    fields: [
      { name: 'From', label: 'From', type: 'date' },
      { name: 'To', label: 'To', type: 'date' },
      { name: 'FromDepartments', label: 'Origin department', type: 'multi', source: 'departments' },
      {
        name: 'ToDepartments',
        label: 'Destination department',
        type: 'multi',
        source: 'departments',
      },
      { name: 'Gender', label: 'Gender', type: 'select', options: GENDERS },
      { name: 'BranchOnly', label: 'Between branches only', type: 'bit' },
      { name: 'IncludeSummary', label: 'Include summary', type: 'bit', default: true },
    ],
  },
  {
    key: 'discipline',
    label: 'Discipline',
    desc: 'Disciplinary measures, optionally only those still in force.',
    fields: [
      { name: 'From', label: 'From', type: 'date' },
      { name: 'To', label: 'To', type: 'date' },
      { name: 'Departments', label: 'Department', type: 'multi', source: 'departments' },
      { name: 'ActiveOnly', label: 'Only measures still in force', type: 'bit' },
      { name: 'IncludeSummary', label: 'Include summary', type: 'bit', default: true },
    ],
  },
  {
    key: 'by-department',
    label: 'Employees by department',
    desc: 'Headcount and averages per department.',
    fields: [
      { name: 'EmploymentStatus', label: 'Status', type: 'select', options: STATUSES },
      { name: 'Gender', label: 'Gender', type: 'select', options: GENDERS },
      { name: 'SplitBy', label: 'Split by', type: 'text', hint: 'e.g. Gender' },
      { name: 'IncludePercentiles', label: 'Include medians', type: 'bit' },
    ],
  },
  {
    key: 'by-job-category',
    label: 'Employees by job category',
    desc: 'Headcount and averages per job category.',
    fields: [
      { name: 'EmploymentStatus', label: 'Status', type: 'select', options: STATUSES },
      { name: 'Gender', label: 'Gender', type: 'select', options: GENDERS },
      { name: 'SplitBy', label: 'Split by', type: 'text', hint: 'e.g. Gender' },
      { name: 'IncludePercentiles', label: 'Include medians', type: 'bit' },
    ],
  },
  {
    key: 'by-marital-status',
    label: 'Employees by marital status',
    desc: 'Headcount and averages per marital status.',
    fields: [
      { name: 'EmploymentStatus', label: 'Status', type: 'select', options: STATUSES },
      { name: 'Gender', label: 'Gender', type: 'select', options: GENDERS },
      { name: 'SplitBy', label: 'Split by', type: 'text', hint: 'e.g. Gender' },
      { name: 'IncludePercentiles', label: 'Include medians', type: 'bit' },
    ],
  },
]

const initialValues = (report) => {
  const out = {}
  report.fields.forEach((f) => {
    if (f.default !== undefined) out[f.name] = f.default
  })
  return out
}

const HrisStandardReports = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [meta, setMeta] = useState(null)
  const [status, setStatus] = useState(null)
  const [booting, setBooting] = useState(true)
  const [bootError, setBootError] = useState('')

  const [active, setActive] = useState(REPORTS[0])
  const [values, setValues] = useState(() => initialValues(REPORTS[0]))
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [sets, setSets] = useState(null)
  const [activeSet, setActiveSet] = useState('')

  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      try {
        const st = await fetchReportStatus({ accessToken })
        if (cancelled) return
        setStatus(st.status)
        if (!st.status.core_installed) return
        const m = await fetchReportMeta({ accessToken })
        if (!cancelled) setMeta(m)
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

  const pick = (report) => {
    setActive(report)
    setValues(initialValues(report))
    setSets(null)
    setActiveSet('')
    setError('')
  }

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const run = async () => {
    setRunning(true)
    setError('')
    try {
      const r = await runStandardReport({
        accessToken,
        report: active.key,
        body: cleanFilters(values),
      })
      setSets(r.sets || {})
      // Land on the first result set that actually has rows, so a report whose
      // detail is empty but whose summary is not does not look like a failure.
      const names = Object.keys(r.sets || {})
      const firstWithRows = names.find((n) => (r.sets[n] || []).length > 0)
      setActiveSet(firstWithRows || names[0] || '')
    } catch (e) {
      setError(e.message || 'The report could not be run.')
      setSets(null)
    } finally {
      setRunning(false)
    }
  }

  const optionsFor = (field) => (meta && meta.options && meta.options[field.source]) || []

  const renderField = (field) => {
    const value = values[field.name]

    if (field.type === 'multi') {
      const options = optionsFor(field)
      const ids = new Set((value || []).map((v) => String(v)))
      const selected = options.filter((o) => ids.has(String(o.Id)))
      return (
        <Autocomplete
          multiple
          size="small"
          disableCloseOnSelect
          limitTags={2}
          options={options}
          value={selected}
          isOptionEqualToValue={(a, b) => String(a.Id) === String(b.Id)}
          getOptionLabel={(o) => String(o.Name == null ? '' : o.Name)}
          onChange={(e, picked) =>
            setValue(
              field.name,
              picked.map((p) => p.Id),
            )
          }
          renderTags={(tags, getTagProps) =>
            tags.map((tag, index) => (
              <Chip
                size="small"
                label={String(tag.Name == null ? '' : tag.Name)}
                {...getTagProps({ index })}
                key={tag.Id}
              />
            ))
          }
          renderInput={(params) => <TextField {...params} label={field.label} placeholder="Any" />}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <CFormSelect
          size="sm"
          value={value === undefined ? '' : value}
          onChange={(e) => setValue(field.name, e.target.value)}
        >
          {field.options.map((o) => (
            <option key={o || 'any'} value={o}>
              {o === '' ? 'Any' : o}
            </option>
          ))}
        </CFormSelect>
      )
    }

    if (field.type === 'bit') {
      return (
        <CFormCheck
          id={`${active.key}-${field.name}`}
          label={field.label}
          checked={!!value}
          onChange={(e) => setValue(field.name, e.target.checked)}
        />
      )
    }

    if (field.type === 'tri') {
      return (
        <CFormSelect
          size="sm"
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => setValue(field.name, e.target.value)}
        >
          <option value="">Any</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </CFormSelect>
      )
    }

    return (
      <CFormInput
        size="sm"
        type={field.type === 'date' ? 'date' : field.type === 'num' ? 'number' : 'text'}
        value={value === undefined || value === null ? '' : value}
        placeholder="Any"
        onChange={(e) => setValue(field.name, e.target.value)}
      />
    )
  }

  const setNames = useMemo(() => (sets ? Object.keys(sets) : []), [sets])

  if (booting) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (bootError) {
    return <CAlert color="danger">{bootError}</CAlert>
  }

  if (status && !status.reports_installed) {
    return (
      <CAlert color="warning">
        <strong>The standard report pack is not installed.</strong>
        <p className="mt-2 mb-0">
          These eleven reports come from <code>HRIS_StandardReports.sql</code>. Install it against
          the HRIS database, then run <code>EXEC dbo.usp_RefreshMovementSnapshot;</code>. The
          Explorer works without it.
        </p>
      </CAlert>
    )
  }

  return (
    <CRow>
      <CCol lg={3}>
        <CCard className="mb-3">
          <CCardHeader>
            <strong>Reports</strong>
          </CCardHeader>
          <CListGroup flush>
            {REPORTS.map((r) => (
              <CListGroupItem
                key={r.key}
                component="button"
                active={active.key === r.key}
                onClick={() => pick(r)}
                className="text-start"
              >
                <div className="fw-semibold small">{r.label}</div>
                <div
                  className={active.key === r.key ? 'small' : 'small text-medium-emphasis'}
                  style={{ fontSize: '0.75rem' }}
                >
                  {r.desc}
                </div>
              </CListGroupItem>
            ))}
          </CListGroup>
        </CCard>
      </CCol>

      <CCol lg={9}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <strong>{active.label}</strong>
              <div className="small text-medium-emphasis">{active.desc}</div>
            </div>
            <CButton color="primary" disabled={running} onClick={run}>
              {running ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Running…
                </>
              ) : (
                'Run report'
              )}
            </CButton>
          </CCardHeader>

          <CCardBody>
            {active.caveat ? (
              <CAlert color="warning" className="py-2" style={{ fontSize: '0.85rem' }}>
                {active.caveat}
              </CAlert>
            ) : null}

            <CRow className="g-3 mb-3">
              {active.fields.map((field) => (
                <CCol md={field.type === 'multi' ? 6 : 3} key={field.name}>
                  {field.type === 'multi' || field.type === 'bit' ? null : (
                    <CFormLabel className="small mb-1">{field.label}</CFormLabel>
                  )}
                  {renderField(field)}
                  {field.hint ? (
                    <div className="text-medium-emphasis" style={{ fontSize: '0.72rem' }}>
                      {field.hint}
                    </div>
                  ) : null}
                </CCol>
              ))}
            </CRow>

            {error ? <CAlert color="danger">{error}</CAlert> : null}

            {sets && setNames.length > 0 ? (
              <>
                {setNames.length > 1 ? (
                  <CNav variant="tabs" className="mb-3">
                    {setNames.map((n) => (
                      <CNavItem key={n}>
                        <CNavLink
                          href="#"
                          active={activeSet === n}
                          onClick={(e) => {
                            e.preventDefault()
                            setActiveSet(n)
                          }}
                        >
                          {n.replace(/([a-z])([A-Z])/g, '$1 $2')}{' '}
                          <span className="text-medium-emphasis">({(sets[n] || []).length})</span>
                        </CNavLink>
                      </CNavItem>
                    ))}
                  </CNav>
                ) : null}
                <ReportTable
                  rows={sets[activeSet] || []}
                  title={`${active.label} ${activeSet}`}
                  dense
                  emptyMessage="This section returned no rows for the parameters you chose."
                />
              </>
            ) : null}

            {!sets && !running && !error ? (
              <CAlert color="light" className="mb-0">
                Set the parameters above and press <strong>Run report</strong>. Every parameter is
                optional — leave them empty to use the report&apos;s own defaults.
              </CAlert>
            ) : null}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default HrisStandardReports
