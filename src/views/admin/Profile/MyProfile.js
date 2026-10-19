import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import {
  cilBadge,
  cilBirthdayCake,
  cilBook,
  cilBriefcase,
  cilBuilding,
  cilCalendar,
  cilCalendarCheck,
  cilClock,
  cilEducation,
  cilFingerprint,
  cilHistory,
  cilInfo,
  cilLayers,
  cilLibrary,
  cilLocationPin,
  cilLockLocked,
  cilLockUnlocked,
  cilPencil,
  cilPlus,
  cilReload,
  cilSchool,
  cilShieldAlt,
  cilUser,
  cilWallet,
  cilWarning,
} from '@coreui/icons'
import { fetchMyProfile, fetchMyPhotoUrl } from '../../../api/profile'
import './profile.css'

// My Profile — the signed-in employee's own HR record, read live from HRIS by
// GET /profile/me (backend: routes/rms/Profile.js). Admins see their own record
// here exactly like everyone else; nothing on this page can open another
// person's profile.
//
// Private details (salary, TIN, pension number) start hidden on every visit
// and are revealed with one toggle, so the page is safe to open with someone
// looking over your shoulder.

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// HRIS dates arrive as 'YYYY-MM-DD' strings. Formatting them by hand keeps the
// browser's timezone from moving a date by a day.
const fmtDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''))
  if (!m) return value || null
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`
}

const fmtDateTime = (value) => {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(String(value || ''))
  return m ? `${fmtDate(m[1])} · ${m[2]}` : fmtDate(value)
}

const fmtSpan = (months) => {
  const n = Number(months)
  if (months == null || !Number.isFinite(n) || n < 0) return null
  const years = Math.floor(n / 12)
  const rest = n % 12
  if (!years && !rest) return 'Under a month'
  return [years ? `${years} yr` : '', rest ? `${rest} mo` : ''].filter(Boolean).join(' ')
}

const fmtMoney = (value) => {
  const n = Number(value)
  if (value == null || !Number.isFinite(n)) return null
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// "2021-08-02 to 2022-12-31" (certifications) -> "Aug 2, 2021 – Dec 31, 2022"
const fmtPeriod = (value) => {
  const s = String(value || '').trim()
  if (!s || /^0+$/.test(s)) return null
  const m = /^(\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2}|\?)$/.exec(s)
  if (!m) return s
  return `${fmtDate(m[1])} – ${m[2] === '?' ? '…' : fmtDate(m[2])}`
}

const fmtRange = (from, to, openLabel) => {
  const start = fmtDate(from) || 'Start not recorded'
  const end = to ? fmtDate(to) : openLabel
  return `${start} – ${end}`
}

const plainDays = (value) => (value ? String(value).replace(/day\(s\)/i, 'days') : null)

// Masks all but the last two characters, keeping spaces so the shape reads.
const maskId = (value) => {
  const chars = String(value || '').split('')
  let keep = 2
  for (let i = chars.length - 1; i >= 0; i -= 1) {
    if (/\s/.test(chars[i])) continue
    if (keep > 0) keep -= 1
    else chars[i] = '•'
  }
  return chars.join('')
}

const yesNo = (value) => (value === 1 ? 'Yes' : value === 0 ? 'No' : null)

const joinName = (...parts) => parts.filter(Boolean).join(' ')

const initialsOf = (person) => {
  const a = (person.FirstName || person.DomainUser || '?').trim().charAt(0)
  const b = (person.FatherName || '').trim().charAt(0)
  return `${a}${b}`.toUpperCase()
}

const SALARY_STAGE_LABELS = {
  'Before salary adjustment': 'Before the salary adjustment',
  'Salary adjustment': 'After the salary adjustment',
  'Current salary': 'Current salary',
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const InfoCard = ({ icon, title, sub, fields, reveal, index = 0, note }) => {
  const rows = fields.filter((f) => f && f.value != null && f.value !== '')
  return (
    <section className="zb-prof-card zb-prof-rise" style={{ '--i': index }}>
      <header className="zb-prof-card-head">
        <span className="zb-prof-card-icon">
          <CIcon icon={icon} />
        </span>
        <div>
          <h3 className="zb-prof-card-title">{title}</h3>
          {sub ? <div className="zb-prof-card-sub">{sub}</div> : null}
        </div>
      </header>
      {rows.length ? (
        <dl className="zb-prof-fields">
          {rows.map((f) => {
            const hidden = f.sensitive && !reveal
            return (
              <div className="zb-prof-field" key={f.label}>
                <dt>{f.label}</dt>
                <dd className={f.mono || f.sensitive ? 'is-mono' : ''}>
                  {hidden ? <span className="zb-prof-masked">{maskId(f.value)}</span> : f.value}
                </dd>
              </div>
            )
          })}
        </dl>
      ) : (
        <p className="zb-prof-empty">Nothing on file.</p>
      )}
      {note ? (
        <p className="zb-prof-note">
          <CIcon icon={cilInfo} />
          <span>{note}</span>
        </p>
      ) : null}
    </section>
  )
}

const StatTile = ({ icon, label, value, sub, tone, index }) => (
  <div className="zb-prof-stat zb-prof-rise" style={{ '--tone-rgb': tone, '--i': index }}>
    <span className="zb-prof-stat-icon">
      <CIcon icon={icon} />
    </span>
    <div style={{ minWidth: 0 }}>
      <div className="zb-prof-stat-label">{label}</div>
      <div className="zb-prof-stat-value">{value || '—'}</div>
      {sub ? <div className="zb-prof-stat-sub">{sub}</div> : null}
    </div>
  </div>
)

const CardHead = ({ icon, title, sub }) => (
  <header className="zb-prof-card-head">
    <span className="zb-prof-card-icon">
      <CIcon icon={icon} />
    </span>
    <div>
      <h3 className="zb-prof-card-title">{title}</h3>
      {sub ? <div className="zb-prof-card-sub">{sub}</div> : null}
    </div>
  </header>
)

const Skeleton = () => (
  <div className="zb-prof" aria-busy="true" aria-label="Loading your profile">
    <div className="zb-prof-hero">
      <div className="zb-prof-cover" />
      <div className="zb-prof-head">
        <div className="zb-prof-avatar">
          <div className="zb-prof-avatar-inner zb-prof-skel" />
        </div>
        <div className="zb-prof-ident">
          <div className="zb-prof-skel" style={{ height: 26, width: '45%' }} />
          <div className="zb-prof-skel" style={{ height: 16, width: '30%', marginTop: 10 }} />
          <div className="zb-prof-skel" style={{ height: 16, width: '60%', marginTop: 16 }} />
        </div>
      </div>
    </div>
    <div className="zb-prof-stats">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="zb-prof-stat">
          <div className="zb-prof-skel" style={{ height: 52, width: '100%' }} />
        </div>
      ))}
    </div>
    <div className="zb-prof-skel" style={{ height: 46, marginTop: 22, borderRadius: 14 }} />
    <div className="zb-prof-grid" style={{ marginTop: 16 }}>
      <div className="zb-prof-skel" style={{ height: 220, borderRadius: 16 }} />
      <div className="zb-prof-skel" style={{ height: 220, borderRadius: 16 }} />
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

const OverviewTab = ({ person, reveal, terminated, postingLabel }) => {
  const married = String(person.MaritalStatus || '').toLowerCase() === 'married'
  const probation =
    person.ProbationDays != null
      ? `${person.ProbationDays} days${person.ProbationEnd ? `, ended ${fmtDate(person.ProbationEnd)}` : ''}`
      : null

  return (
    <div className="zb-prof-grid">
      <InfoCard
        index={0}
        icon={cilUser}
        title="Personal"
        reveal={reveal}
        fields={[
          { label: 'Gender', value: person.Gender },
          { label: 'Date of birth', value: fmtDate(person.DateOfBirth) },
          {
            label: 'Age',
            value: person.AgeMonths != null ? fmtSpan(person.AgeMonths) : null,
          },
          { label: 'Marital status', value: person.MaritalStatus },
          { label: 'Spouse', value: married || person.SpouseName ? person.SpouseName : null },
          { label: 'Spouse medical cover', value: person.SpouseMedCoverage },
          { label: 'Spouse medical expiry', value: fmtDate(person.SpouseMedExpiry) },
          { label: 'Previous name', value: person.PreviousName },
        ]}
      />
      <InfoCard
        index={1}
        icon={cilBriefcase}
        title="Employment"
        reveal={reveal}
        fields={[
          { label: 'Employment type', value: person.EmploymentType },
          { label: 'Employment date', value: fmtDate(person.EmploymentDate) },
          { label: 'Probation', value: probation },
          {
            label: 'Status',
            value: !person.HasDetail ? 'No HR record' : terminated ? 'Left the bank' : 'Active',
          },
          { label: 'Left on', value: fmtDate(person.TerminationDate) },
          { label: 'Reason for leaving', value: person.TerminationReason },
          { label: 'Length of service', value: fmtSpan(person.ServiceMonths) },
          { label: 'Cost sharing', value: yesNo(person.CostSharing) },
          {
            label: 'Appraisal result',
            value: person.AppraisalResult != null ? String(person.AppraisalResult) : null,
          },
        ]}
      />
      <InfoCard
        index={2}
        icon={cilBuilding}
        title={postingLabel}
        reveal={reveal}
        fields={[
          { label: 'Position', value: person.Position },
          { label: 'Job grade', value: person.JobGrade },
          { label: 'Job category', value: person.JobCategory },
          { label: 'Department', value: person.Department },
          { label: 'Division', value: person.Division },
          { label: 'Section', value: person.Section },
          { label: 'Banking center', value: person.BankingCenter },
          { label: 'In position since', value: fmtDate(person.InPositionSince) },
          { label: 'Time in position', value: fmtSpan(person.InPositionMonths) },
        ]}
      />
      <InfoCard
        index={3}
        icon={cilLocationPin}
        title="Address"
        reveal={reveal}
        fields={[
          { label: 'Region', value: person.Region },
          { label: 'City', value: person.City },
          { label: 'Zone', value: person.Zone },
          { label: 'Sub city', value: person.SubCity },
          { label: 'Woreda', value: person.Woreda },
          { label: 'Kebele', value: person.Kebele },
          { label: 'House number', value: person.HouseNumber },
          { label: 'P.O. Box', value: person.POBox },
          { label: 'Telephone', value: person.Telephone, mono: true },
        ]}
      />
      <InfoCard
        index={4}
        icon={cilFingerprint}
        title="Identifiers"
        sub={reveal ? null : 'TIN and pension number are hidden. Use “Show private details”.'}
        reveal={reveal}
        fields={[
          { label: 'Employee ID', value: person.EmployeeId, mono: true },
          { label: 'Domain user', value: person.DomainUser },
          { label: 'TIN number', value: person.TINNumber, sensitive: true },
          { label: 'Pension number', value: person.PensionNumber, sensitive: true },
          {
            label: 'HRIS user ID',
            value: person.HrisUserId != null ? String(person.HrisUserId) : null,
            mono: true,
          },
          { label: 'HRIS role', value: person.SystemRole },
        ]}
      />
    </div>
  )
}

const LearningTab = ({ education, training }) => {
  const degrees = education.filter((e) => e.RecordType === 'Education')
  const certs = education.filter((e) => e.RecordType !== 'Education')

  return (
    <div className="zb-prof-grid">
      <section className="zb-prof-card zb-prof-rise" style={{ '--i': 0 }}>
        <CardHead
          icon={cilEducation}
          title="Education"
          sub={
            degrees.length
              ? `${degrees.length} qualification${degrees.length === 1 ? '' : 's'}`
              : null
          }
        />
        {degrees.length ? (
          <div className="zb-prof-list">
            {degrees.map((e, i) => (
              <div className="zb-prof-item" key={`d${i}`}>
                <span className="zb-prof-item-icon">
                  <CIcon icon={cilSchool} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="zb-prof-item-title">
                    {joinName(e.Qualification, e.FieldOfStudy ? `in ${e.FieldOfStudy}` : null) ||
                      'Qualification'}
                  </div>
                  {e.Institution ? <div className="zb-prof-item-sub">{e.Institution}</div> : null}
                  <div className="zb-prof-tags">
                    {fmtPeriod(e.YearOrPeriod) ? (
                      <span className="zb-prof-tag">Graduated {fmtPeriod(e.YearOrPeriod)}</span>
                    ) : null}
                    {e.Result ? <span className="zb-prof-tag is-accent">{e.Result}</span> : null}
                    {e.Commitment ? (
                      <span className="zb-prof-tag">Cost-sharing commitment: {e.Commitment}</span>
                    ) : null}
                    {e.Sponsorship ? (
                      <span className="zb-prof-tag">Sponsorship: {e.Sponsorship}</span>
                    ) : null}
                    {e.DocumentOnFile === 'Yes' ? (
                      <span className="zb-prof-tag is-live">Document on file</span>
                    ) : null}
                  </div>
                  {e.Remark ? <p className="zb-prof-remark">{e.Remark}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="zb-prof-empty">No education on file.</p>
        )}
      </section>

      <section className="zb-prof-card zb-prof-rise" style={{ '--i': 1 }}>
        <CardHead
          icon={cilShieldAlt}
          title="Certifications"
          sub={certs.length ? `${certs.length} on file` : null}
        />
        {certs.length ? (
          <div className="zb-prof-list">
            {certs.map((c, i) => (
              <div className="zb-prof-item" key={`c${i}`} style={{ '--tone-rgb': '13, 148, 136' }}>
                <span className="zb-prof-item-icon">
                  <CIcon icon={cilBadge} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="zb-prof-item-title">{c.FieldOfStudy || 'Certification'}</div>
                  {c.Institution ? <div className="zb-prof-item-sub">{c.Institution}</div> : null}
                  <div className="zb-prof-tags">
                    {fmtPeriod(c.YearOrPeriod) ? (
                      <span className="zb-prof-tag">{fmtPeriod(c.YearOrPeriod)}</span>
                    ) : null}
                    {c.Result ? <span className="zb-prof-tag is-accent">{c.Result}</span> : null}
                    {c.Commitment ? (
                      <span className="zb-prof-tag">Commitment: {c.Commitment}</span>
                    ) : null}
                    {c.DocumentOnFile === 'Yes' ? (
                      <span className="zb-prof-tag is-live">Document on file</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="zb-prof-empty">No certifications on file.</p>
        )}
      </section>

      <section className="zb-prof-card zb-prof-span zb-prof-rise" style={{ '--i': 2 }}>
        <CardHead
          icon={cilLibrary}
          title="Training"
          sub={
            training.length ? `${training.length} course${training.length === 1 ? '' : 's'}` : null
          }
        />
        {training.length ? (
          <div className="zb-prof-list">
            {training.map((t, i) => (
              <div className="zb-prof-item" key={`t${i}`} style={{ '--tone-rgb': '3, 105, 161' }}>
                <span className="zb-prof-item-icon">
                  <CIcon icon={cilBook} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="zb-prof-item-title">{t.Training || 'Training'}</div>
                  {t.Organizer ? (
                    <div className="zb-prof-item-sub">Organised by {t.Organizer}</div>
                  ) : null}
                  <div className="zb-prof-tags">
                    {t.TrainingType ? (
                      <span className="zb-prof-tag is-accent">{t.TrainingType}</span>
                    ) : null}
                    {t.From ? (
                      <span className="zb-prof-tag">{fmtRange(t.From, t.To, '…')}</span>
                    ) : null}
                    {plainDays(t.Duration) ? (
                      <span className="zb-prof-tag">{plainDays(t.Duration)}</span>
                    ) : null}
                    {t.DocumentOnFile === 'Yes' ? (
                      <span className="zb-prof-tag is-live">Certificate on file</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="zb-prof-empty">No training on file.</p>
        )}
      </section>
    </div>
  )
}

const JobCard = ({ job, openLabel, currentLabel, external }) => {
  const org = external
    ? joinName(job.Employer, job.WorkPlace ? `· ${job.WorkPlace}` : null)
    : [job.Department, job.Division, job.Section].filter(Boolean).join(' › ')
  return (
    <li className={`zb-prof-tl${job.IsCurrent ? ' is-current' : ''}`}>
      <span className="zb-prof-tl-dot" />
      <div className="zb-prof-tl-card">
        <div className="zb-prof-tl-top">
          <strong>{job.Position || 'Position not recorded'}</strong>
          {job.JobGrade ? (
            <span className="zb-prof-tag is-accent">Grade {job.JobGrade}</span>
          ) : null}
          {job.IsCurrent ? <span className="zb-prof-tag is-live">{currentLabel}</span> : null}
        </div>
        {org || job.BankingCenter ? (
          <div className="zb-prof-tl-org">
            {org}
            {!external && job.BankingCenter ? ` · ${job.BankingCenter}` : ''}
          </div>
        ) : null}
        <div className="zb-prof-tl-when">
          <CIcon icon={cilCalendar} />
          <span>{fmtRange(job.From, job.To, openLabel)}</span>
          {fmtSpan(job.DurationMonths) ? <span>· {fmtSpan(job.DurationMonths)}</span> : null}
          {job.EndReason && job.To ? <span className="zb-prof-tag">{job.EndReason}</span> : null}
        </div>
      </div>
    </li>
  )
}

const CareerTab = ({ jobs, person, terminated, postingLabel }) => {
  const internal = jobs.filter((j) => j.TypeId === 1)
  const external = jobs.filter((j) => j.TypeId !== 1)
  const tenure = fmtSpan(person.ServiceMonths)

  return (
    <div className="zb-prof-grid">
      <section className="zb-prof-card zb-prof-span zb-prof-rise" style={{ '--i': 0 }}>
        <CardHead
          icon={cilBuilding}
          title="At Zemen Bank"
          sub={
            internal.length
              ? `${internal.length} posting${internal.length === 1 ? '' : 's'}${tenure ? ` over ${tenure}` : ''}`
              : null
          }
        />
        {internal.length ? (
          <ol className="zb-prof-timeline">
            {internal.map((job, i) => (
              <JobCard
                key={`i${i}`}
                job={job}
                openLabel={terminated ? '…' : 'Present'}
                currentLabel={postingLabel}
              />
            ))}
          </ol>
        ) : (
          <p className="zb-prof-empty">No postings on file.</p>
        )}
      </section>

      {external.length ? (
        <section className="zb-prof-card zb-prof-span zb-prof-rise" style={{ '--i': 1 }}>
          <CardHead
            icon={cilHistory}
            title="Before Zemen Bank"
            sub={`${external.length} previous role${external.length === 1 ? '' : 's'}`}
          />
          <ol className="zb-prof-timeline">
            {external.map((job, i) => (
              <JobCard key={`e${i}`} job={job} openLabel="…" currentLabel="" external />
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  )
}

const SalaryTab = ({ stages, reveal, onToggle, terminated }) => {
  const current = stages.find((s) => s.IsCurrent === 1)
  const currentAmount = current ? Number(current.Amount) : null
  const max = Math.max(1, ...stages.map((s) => Number(s.Amount) || 0))
  const onPayroll = currentAmount != null && currentAmount > 0

  return (
    <section className="zb-prof-card zb-prof-rise">
      <div className="zb-prof-salary-hero">
        <div>
          <div className="zb-prof-kicker">Current monthly salary</div>
          <div className="zb-prof-salary-amount">
            {!onPayroll ? (
              <small>{terminated ? 'Not on payroll' : 'Not on file'}</small>
            ) : reveal ? (
              <>
                <small>ETB</small> {fmtMoney(currentAmount)}
              </>
            ) : (
              <>
                <small>ETB</small> ••••••
              </>
            )}
          </div>
        </div>
        <button type="button" className="zb-prof-btn" onClick={onToggle} aria-pressed={reveal}>
          <CIcon icon={reveal ? cilLockUnlocked : cilLockLocked} />
          {reveal ? 'Hide amounts' : 'Show amounts'}
        </button>
      </div>

      {stages.length > 1 ? (
        <ol className="zb-prof-steps">
          {stages.map((s, i) => {
            const amount = Number(s.Amount) || 0
            const change = s.ChangeFromPrevious != null ? Number(s.ChangeFromPrevious) : null
            const up = change != null && change >= 0
            return (
              <li key={i} className={`zb-prof-step${s.IsCurrent === 1 ? ' is-current' : ''}`}>
                <div className="zb-prof-step-label">{SALARY_STAGE_LABELS[s.Stage] || s.Stage}</div>
                <div className="zb-prof-bar">
                  <span
                    className={reveal ? '' : 'is-masked'}
                    style={{ width: reveal ? `${Math.max(4, (amount / max) * 100)}%` : '100%' }}
                  />
                </div>
                <div className="zb-prof-step-amount">
                  {reveal ? fmtMoney(amount) : '••••••'}
                  {reveal && change != null && amount > 0 ? (
                    <span className={`zb-prof-delta ${up ? 'is-up' : 'is-down'}`}>
                      {up ? '+' : '−'}
                      {fmtMoney(Math.abs(change))}
                      {s.ChangePct != null
                        ? ` (${up ? '+' : '−'}${Math.abs(Number(s.ChangePct))}%)`
                        : ''}
                    </span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}

      <p className="zb-prof-note">
        <CIcon icon={cilInfo} />
        <span>
          HRIS keeps one live salary. Earlier figures come from salary-adjustment records, which are
          not dated — the order is reliable, the timing is not.
        </span>
      </p>
    </section>
  )
}

const HistoryTab = ({ history }) => {
  const rows = [...history].reverse()
  return (
    <section className="zb-prof-card zb-prof-rise">
      <CardHead
        icon={cilHistory}
        title="Record history"
        sub="When HR created or updated your employee record"
      />
      {rows.length ? (
        <ol className="zb-prof-history">
          {rows.map((h, i) => {
            const created = h.Action === 'created'
            return (
              <li className="zb-prof-hist" key={i}>
                <span className={`zb-prof-hist-icon${created ? ' is-created' : ''}`}>
                  <CIcon icon={created ? cilPlus : cilPencil} />
                </span>
                <div>
                  <div className="zb-prof-hist-title">
                    {created ? 'Employee record created' : 'Employee record updated'}
                  </div>
                  <div className="zb-prof-hist-sub">
                    {fmtDateTime(h.ChangedOn)}
                    {h.ChangedBy ? ` · by ${h.ChangedBy}` : ''}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="zb-prof-empty">No changes recorded.</p>
      )}
      <p className="zb-prof-note">
        <CIcon icon={cilInfo} />
        <span>
          The HRIS log records when your record (salary included) was changed and by whom, not which
          field changed.
        </span>
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const MyProfile = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [tab, setTab] = useState('overview')
  const [reveal, setReveal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProfile(await fetchMyProfile({ accessToken }))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  const hasPhoto = !!(profile && profile.person && profile.person.HasPhoto)

  useEffect(() => {
    if (!hasPhoto) return undefined
    let url = null
    let cancelled = false
    fetchMyPhotoUrl({ accessToken })
      .then((u) => {
        url = u
        if (!cancelled) setPhotoUrl(u)
        else if (u) URL.revokeObjectURL(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [hasPhoto, accessToken])

  const counts = useMemo(() => {
    if (!profile) return {}
    return {
      learning: profile.education.length + profile.training.length,
      career: profile.jobs.length,
      history: profile.history.length,
    }
  }, [profile])

  if (loading && !profile) return <Skeleton />

  if (error && !profile) {
    const missing = error.status === 404
    return (
      <div className="zb-prof">
        <div className="zb-prof-state">
          <div className="zb-prof-state-icon">
            <CIcon icon={missing ? cilUser : cilWarning} />
          </div>
          <h2>{missing ? 'Your HRIS record was not found' : 'Your profile could not be loaded'}</h2>
          <p>{error.message}</p>
          {missing ? null : (
            <button type="button" className="zb-prof-btn" onClick={load}>
              <CIcon icon={cilReload} />
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  const { person, education, training, jobs, salary, history } = profile
  const terminated = !!person.TerminationDate
  const postingLabel = terminated ? 'Last posting' : 'Current posting'
  const fullName =
    joinName(person.FirstName, person.FatherName, person.GrandfatherName) || person.DomainUser
  const amharicName = joinName(person.FirstNameAm, person.FatherNameAm, person.GrandfatherNameAm)
  const org = [person.Department, person.Division].filter(Boolean).join(' › ')
  const ageYears = person.AgeMonths != null ? Math.floor(person.AgeMonths / 12) : null

  const tabs = [
    { key: 'overview', label: 'Overview', icon: cilUser },
    { key: 'learning', label: 'Education & Training', icon: cilEducation, count: counts.learning },
    { key: 'career', label: 'Career', icon: cilBriefcase, count: counts.career },
    { key: 'salary', label: 'Salary', icon: cilWallet },
    { key: 'history', label: 'Record history', icon: cilHistory, count: counts.history },
  ]

  return (
    <div className="zb-prof">
      <section className="zb-prof-hero zb-prof-rise">
        <div className="zb-prof-cover" aria-hidden="true" />
        <div className="zb-prof-head">
          <div className="zb-prof-avatar">
            <div className="zb-prof-avatar-inner">
              {photoUrl ? <img src={photoUrl} alt={fullName} /> : <span>{initialsOf(person)}</span>}
            </div>
          </div>

          <div className="zb-prof-ident">
            <h1 className="zb-prof-name">{fullName}</h1>
            {amharicName ? (
              <div className="zb-prof-name-am" lang="am">
                {amharicName}
              </div>
            ) : null}
            {person.Position ? (
              <div className="zb-prof-title">
                {person.Position}
                {person.JobGrade ? ` · Grade ${person.JobGrade}` : ''}
              </div>
            ) : null}
            {org ? <div className="zb-prof-org">{org}</div> : null}

            <div className="zb-prof-chips">
              {person.EmployeeId ? (
                <span className="zb-prof-chip">
                  <CIcon icon={cilBadge} />
                  {person.EmployeeId}
                </span>
              ) : null}
              <span className="zb-prof-chip">
                <CIcon icon={cilUser} />
                {person.DomainUser}
              </span>
              {!person.HasDetail ? (
                <span className="zb-prof-chip is-muted">No HR record yet</span>
              ) : terminated ? (
                <span className="zb-prof-chip is-left">
                  <span className="zb-prof-dot" />
                  Left {fmtDate(person.TerminationDate)}
                </span>
              ) : (
                <span className="zb-prof-chip is-active">
                  <span className="zb-prof-dot" />
                  Active
                </span>
              )}
              {person.EmploymentType ? (
                <span className="zb-prof-chip">{person.EmploymentType}</span>
              ) : null}
            </div>
          </div>

          <div className="zb-prof-actions">
            <button
              type="button"
              className={`zb-prof-btn${reveal ? ' is-on' : ''}`}
              onClick={() => setReveal((r) => !r)}
              aria-pressed={reveal}
            >
              <CIcon icon={reveal ? cilLockUnlocked : cilLockLocked} />
              {reveal ? 'Hide private details' : 'Show private details'}
            </button>
            <button
              type="button"
              className="zb-prof-btn is-icon"
              onClick={load}
              disabled={loading}
              title="Reload from HRIS"
              aria-label="Reload from HRIS"
            >
              <CIcon icon={cilReload} />
            </button>
          </div>
        </div>
      </section>

      <div className="zb-prof-stats">
        <StatTile
          index={1}
          icon={cilCalendarCheck}
          tone="25, 135, 84"
          label="Length of service"
          value={fmtSpan(person.ServiceMonths)}
          sub={person.EmploymentDate ? `Since ${fmtDate(person.EmploymentDate)}` : null}
        />
        <StatTile
          index={2}
          icon={cilClock}
          tone="88, 86, 214"
          label={terminated ? 'In last position' : 'In current position'}
          value={fmtSpan(person.InPositionMonths)}
          sub={person.InPositionSince ? `Since ${fmtDate(person.InPositionSince)}` : null}
        />
        <StatTile
          index={3}
          icon={cilLayers}
          tone="230, 140, 0"
          label="Job grade"
          value={person.JobGrade}
          sub={person.JobCategory}
        />
        <StatTile
          index={4}
          icon={cilBirthdayCake}
          tone="214, 51, 132"
          label="Age"
          value={ageYears != null ? `${ageYears} years` : null}
          sub={person.DateOfBirth ? `Born ${fmtDate(person.DateOfBirth)}` : null}
        />
      </div>

      <div className="zb-prof-tabs" role="tablist" aria-label="Profile sections">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`zb-prof-tab${tab === t.key ? ' is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <CIcon icon={t.icon} />
            {t.label}
            {t.count ? <span className="zb-prof-count">{t.count}</span> : null}
          </button>
        ))}
      </div>

      <div role="tabpanel" key={tab}>
        {tab === 'overview' ? (
          <OverviewTab
            person={person}
            reveal={reveal}
            terminated={terminated}
            postingLabel={postingLabel}
          />
        ) : null}
        {tab === 'learning' ? <LearningTab education={education} training={training} /> : null}
        {tab === 'career' ? (
          <CareerTab
            jobs={jobs}
            person={person}
            terminated={terminated}
            postingLabel={postingLabel}
          />
        ) : null}
        {tab === 'salary' ? (
          <SalaryTab
            stages={salary}
            reveal={reveal}
            onToggle={() => setReveal((r) => !r)}
            terminated={terminated}
          />
        ) : null}
        {tab === 'history' ? <HistoryTab history={history} /> : null}
      </div>

      <div className="zb-prof-foot">
        <CIcon icon={cilInfo} />
        <span>
          Read live from HRIS{person.AsOf ? ` · as of ${fmtDate(person.AsOf)}` : ''}. If anything
          here is wrong, please contact the HR team to have it corrected.
        </span>
      </div>
    </div>
  )
}

// The HRIS rows are passed through as the API returns them; their columns are
// listed in utils/rms/employeeProfile.js on the backend.
const row = PropTypes.object
const rows = PropTypes.arrayOf(PropTypes.object)

InfoCard.propTypes = {
  icon: PropTypes.array.isRequired,
  title: PropTypes.node.isRequired,
  sub: PropTypes.node,
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  reveal: PropTypes.bool,
  index: PropTypes.number,
  note: PropTypes.node,
}

StatTile.propTypes = {
  icon: PropTypes.array.isRequired,
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
  sub: PropTypes.node,
  tone: PropTypes.string,
  index: PropTypes.number,
}

CardHead.propTypes = {
  icon: PropTypes.array.isRequired,
  title: PropTypes.node.isRequired,
  sub: PropTypes.node,
}

OverviewTab.propTypes = {
  person: row.isRequired,
  reveal: PropTypes.bool,
  terminated: PropTypes.bool,
  postingLabel: PropTypes.string,
}

LearningTab.propTypes = { education: rows.isRequired, training: rows.isRequired }

JobCard.propTypes = {
  job: row.isRequired,
  openLabel: PropTypes.string,
  currentLabel: PropTypes.string,
  external: PropTypes.bool,
}

CareerTab.propTypes = {
  jobs: rows.isRequired,
  person: row.isRequired,
  terminated: PropTypes.bool,
  postingLabel: PropTypes.string,
}

SalaryTab.propTypes = {
  stages: rows.isRequired,
  reveal: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  terminated: PropTypes.bool,
}

HistoryTab.propTypes = { history: rows.isRequired }

export default MyProfile
