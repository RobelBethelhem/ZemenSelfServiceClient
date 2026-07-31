// HRIS reporting API.
//
// The backend is a thin pass-through to the reporting pack installed in the
// HRIS database, so the vocabulary here matches the stored procedures exactly:
// send a parameter and it is forwarded, omit it and the procedure's own default
// applies. That is why every filter defaults to empty rather than to a value —
// an empty filter means "the procedure decides", not "no employees".
import { API_BASE } from './base'

const HR_BASE = `${API_BASE}/hris-report`

const jsonHeaders = (accessToken) => ({
  'Content-Type': 'application/json',
  'x-access-token': accessToken,
})

const readJson = async (response) => {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.error) {
    throw new Error(payload.message || `Request failed (${response.status})`)
  }
  return payload
}

const post = (accessToken, path, body) =>
  fetch(`${HR_BASE}${path}`, {
    method: 'POST',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify(body || {}),
  }).then(readJson)

const get = (accessToken, path) =>
  fetch(`${HR_BASE}${path}`, { method: 'GET', headers: jsonHeaders(accessToken) }).then(readJson)

export const fetchReportStatus = ({ accessToken }) => get(accessToken, '/status')
export const fetchReportMeta = ({ accessToken, includeEmployees = false }) =>
  get(accessToken, `/meta${includeEmployees ? '?includeEmployees=1' : ''}`)
export const fetchDimensionValues = ({ accessToken, dimension }) =>
  get(accessToken, `/dimensions?dimension=${encodeURIComponent(dimension)}`)

export const runDetail = ({ accessToken, body }) => post(accessToken, '/detail', body)
export const runSummary = ({ accessToken, body }) => post(accessToken, '/summary', body)
export const runPivot = ({ accessToken, body }) => post(accessToken, '/pivot', body)
export const runMovement = ({ accessToken, body }) => post(accessToken, '/movement', body)

export const listStandardReports = ({ accessToken }) => get(accessToken, '/standard')
export const runStandardReport = ({ accessToken, report, body }) =>
  post(accessToken, `/standard/${report}`, body)

export const refreshSnapshots = ({ accessToken }) => post(accessToken, '/refresh', {})

// ---------------------------------------------------------------------------
// Filter catalogue
// ---------------------------------------------------------------------------
// Data-driven so the panel is a loop, not 55 hand-written inputs.
//
//   multi     - searchable multi-select, `source` names a list from /meta
//   dim       - select whose values come from /dimensions at runtime, so a
//               dimension added on the SQL side appears with no code change
//   text/num/date - plain inputs
//   tri       - Any / Yes / No, because these map to a nullable bit where
//               "false" is a real filter and not the same as "unset"
export const FILTER_GROUPS = [
  {
    key: 'who',
    label: 'Specific people',
    fields: [
      { name: 'UserIds', label: 'Employees', type: 'multi', source: 'employees', lazy: true },
      { name: 'EmployeeId', label: 'Employee ID contains', type: 'text' },
      { name: 'NameLike', label: 'Name contains', type: 'text' },
      { name: 'TIN', label: 'TIN contains', type: 'text' },
    ],
  },
  {
    key: 'org',
    label: 'Organisation',
    fields: [
      { name: 'Presidents', label: 'President / Chief', type: 'multi', source: 'presidents' },
      { name: 'Departments', label: 'Department', type: 'multi', source: 'departments' },
      {
        name: 'Divisions',
        label: 'Division',
        type: 'multi',
        source: 'divisions',
        cascadeOn: 'Departments',
        cascadeKey: 'DepartmentId',
      },
      {
        name: 'Sections',
        label: 'Section',
        type: 'multi',
        source: 'sections',
        cascadeOn: 'Departments',
        cascadeKey: 'DepartmentId',
      },
      { name: 'Positions', label: 'Position', type: 'multi', source: 'positions' },
      { name: 'JobGrades', label: 'Job grade', type: 'multi', source: 'jobGrades' },
      { name: 'JobCategories', label: 'Job category', type: 'multi', source: 'jobCategories' },
      { name: 'BankingCenters', label: 'Branch', type: 'multi', source: 'bankingCenters' },
      { name: 'BranchGrade', label: 'Branch grade', type: 'dim', dimension: 'BranchGrade' },
    ],
  },
  {
    key: 'personal',
    label: 'Personal',
    fields: [
      { name: 'Gender', label: 'Gender', type: 'dim', dimension: 'Gender' },
      { name: 'MaritalStatus', label: 'Marital status', type: 'dim', dimension: 'MaritalStatus' },
      {
        name: 'EmploymentType',
        label: 'Employment type',
        type: 'dim',
        dimension: 'EmploymentType',
      },
      {
        name: 'EmploymentStatus',
        label: 'Employment status',
        type: 'dim',
        dimension: 'EmploymentStatus',
        hint: 'Defaults to Active. Choose All to include leavers.',
      },
      { name: 'AgeFrom', label: 'Age from', type: 'num' },
      { name: 'AgeTo', label: 'Age to', type: 'num' },
      { name: 'AgeBands', label: 'Age band', type: 'dimMulti', dimension: 'AgeBand' },
      { name: 'DobFrom', label: 'Born on or after', type: 'date' },
      { name: 'DobTo', label: 'Born on or before', type: 'date' },
    ],
  },
  {
    key: 'location',
    label: 'Location',
    fields: [
      { name: 'Regions', label: 'Region', type: 'multi', source: 'regions' },
      {
        name: 'Cities',
        label: 'City',
        type: 'multi',
        source: 'cities',
        cascadeOn: 'Regions',
        cascadeKey: 'RegionId',
      },
      { name: 'SubCityLike', label: 'Sub-city contains', type: 'text' },
    ],
  },
  {
    key: 'education',
    label: 'Education & training',
    fields: [
      {
        name: 'EducationLevels',
        label: 'Highest qualification',
        type: 'multi',
        source: 'educationLevels',
        hint: 'The single highest level on record.',
      },
      {
        name: 'HasEducationLevels',
        label: 'Holds qualification (any level)',
        type: 'multi',
        source: 'educationLevels',
        hint: 'Matches any education row, not just the highest.',
      },
      { name: 'StudyFields', label: 'Field of study', type: 'multi', source: 'studyFields' },
      { name: 'Institutions', label: 'Institution', type: 'multi', source: 'institutions' },
      { name: 'HasTrainingIn', label: 'Attended training', type: 'multi', source: 'trainings' },
      { name: 'MinTrainingCount', label: 'Minimum trainings', type: 'num' },
    ],
  },
  {
    key: 'experience',
    label: 'Service & experience',
    fields: [
      { name: 'ServiceFrom', label: 'Service years from', type: 'num' },
      { name: 'ServiceTo', label: 'Service years to', type: 'num' },
      { name: 'IntExpFrom', label: 'Internal experience from', type: 'num' },
      { name: 'IntExpTo', label: 'Internal experience to', type: 'num' },
      { name: 'ExtExpFrom', label: 'External experience from', type: 'num' },
      { name: 'ExtExpTo', label: 'External experience to', type: 'num' },
      { name: 'TotExpFrom', label: 'Total experience from', type: 'num' },
      { name: 'TotExpTo', label: 'Total experience to', type: 'num' },
      { name: 'PositionTenureFrom', label: 'Years in position from', type: 'num' },
      { name: 'PositionTenureTo', label: 'Years in position to', type: 'num' },
      { name: 'InternalMovesFrom', label: 'Internal moves from', type: 'num' },
      { name: 'InternalMovesTo', label: 'Internal moves to', type: 'num' },
    ],
  },
  {
    key: 'employment',
    label: 'Employment dates & pay',
    fields: [
      { name: 'HiredFrom', label: 'Hired on or after', type: 'date' },
      { name: 'HiredTo', label: 'Hired on or before', type: 'date' },
      { name: 'TerminatedFrom', label: 'Left on or after', type: 'date' },
      { name: 'TerminatedTo', label: 'Left on or before', type: 'date' },
      {
        name: 'TerminationReasons',
        label: 'Termination reason',
        type: 'multi',
        source: 'terminationReasons',
      },
      { name: 'SalaryFrom', label: 'Salary from', type: 'num' },
      { name: 'SalaryTo', label: 'Salary to', type: 'num' },
    ],
  },
  {
    key: 'flags',
    label: 'Flags',
    fields: [
      { name: 'HasGuaranteeLetter', label: 'Has guarantee letter', type: 'tri' },
      { name: 'HasDiscipline', label: 'Has discipline record', type: 'tri' },
      { name: 'HasPhoto', label: 'Has photo', type: 'tri' },
      { name: 'IsOnProbation', label: 'On probation', type: 'tri' },
      {
        name: 'AgeDataValidOnly',
        label: 'Exclude implausible ages',
        type: 'tri',
        hint: 'Nine records carry unusable dates and distort averages.',
      },
    ],
  },
]

export const ALL_FILTER_FIELDS = FILTER_GROUPS.flatMap((g) => g.fields)

// Strips empties so the backend never receives a parameter the user did not
// set — that is what lets the stored-procedure defaults apply.
export const cleanFilters = (filters) => {
  const out = {}
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value) && value.length === 0) return
    out[key] = Array.isArray(value) ? value.join(',') : value
  })
  return out
}

export const countActiveFilters = (filters) => Object.keys(cleanFilters(filters)).length

// The metrics usp_EmployeeReport_Pivot understands.
export const PIVOT_METRICS = [
  { value: 'Headcount', label: 'Headcount' },
  { value: 'AvgAge', label: 'Average age' },
  { value: 'AvgSalary', label: 'Average salary' },
  { value: 'AvgService', label: 'Average service years' },
  { value: 'FemalePct', label: 'Female %' },
]

// Reproduced from section 13 of HRIS_StandardReports.sql. Shown in the UI
// because a number without its caveat is worse than no number.
export const REPORT_CAVEATS = [
  'Promotion counts are indicative. Grade is the only signal available and the position records are loosely maintained — publish the movement-type breakdown alongside any promotion figure.',
  'Transfer counts are reliable: a recorded change of department or branch, not an inference.',
  'Salary in the movement reports is today’s salary. There is no salary history, so a 2019 promotion shows the current figure.',
  'Turnover before 2023 is a recording gap. No terminations at all are recorded for 2020–2022, so those periods read as 0% — that is missing data, not retention.',
  'Date of release is captured on 6 of 5,850 posting rows, so it is effectively empty.',
  'Nine records with unusable birth or hire dates are excluded from averages. Every report that averages age or service also returns the count it excluded.',
]
