import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormTextarea,
  CProgress,
  CProgressBar,
  CAlert,
  CSpinner,
} from '@coreui/react'
import { QUESTIONS, LIKERT_KEYS, SCALE_LABELS, RATING_MODES } from '../api/serviceRating'

const STAR_ACTIVE = '#f5a623'
const STAR_IDLE = '#ced2db'

const StarIcon = ({ active, size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={active ? STAR_ACTIVE : 'none'}
    stroke={active ? STAR_ACTIVE : STAR_IDLE}
    strokeWidth="1.4"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <path d="M12 2.6l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.42l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.95L12 2.6z" />
  </svg>
)

StarIcon.propTypes = {
  active: PropTypes.bool,
  size: PropTypes.number,
}

// 5-point Likert rendered as stars: 1 star = Strongly Disagree, 5 = Strongly
// Agree. The label under the row always reflects what the user is about to
// pick (hover) or has picked, so the star count is never ambiguous.
const StarScale = ({ value, onChange }) => {
  const [hover, setHover] = useState(0)
  const shown = hover || value || 0

  return (
    <div className="text-center">
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ gap: '0.65rem' }}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            aria-label={SCALE_LABELS[score]}
            aria-pressed={value === score}
            onMouseEnter={() => setHover(score)}
            onFocus={() => setHover(score)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(score)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.15rem',
              cursor: 'pointer',
              lineHeight: 0,
              transform: shown >= score ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 120ms ease',
            }}
          >
            <StarIcon active={shown >= score} size={42} />
          </button>
        ))}
      </div>

      {/* Fixed height so the body does not jump as the label changes. */}
      <div style={{ minHeight: '1.75rem', marginTop: '0.6rem' }}>
        {shown ? (
          <span
            style={{
              fontWeight: 600,
              fontSize: '1rem',
              color: value ? '#1f2937' : '#6b7280',
            }}
          >
            {SCALE_LABELS[shown]}
          </span>
        ) : (
          <span className="text-medium-emphasis" style={{ fontSize: '0.875rem' }}>
            Select a rating
          </span>
        )}
      </div>

      <div
        className="d-flex justify-content-between text-medium-emphasis mx-auto"
        style={{ maxWidth: '320px', fontSize: '0.75rem' }}
      >
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  )
}

StarScale.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
}

const emptyAnswers = () => ({
  q1_ease: null,
  q2_timeliness: null,
  q3_met_needs: null,
  q4_overall: null,
  q5_suggestion: '',
})

// One question at a time. Q1-Q4 are mandatory; Q5 is a free-text box the user
// may skip. Nothing is sent until the final step, so a half-finished survey
// leaves no partial row behind.
const ServiceRatingModal = ({
  visible,
  onClose,
  onSubmit,
  onComplete,
  onDecline,
  letterLabel,
  referenceNumber,
  actionLabel = 'print',
  mode = 'mandatory',
}) => {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(emptyAnswers)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  // Under an "optional" policy the user is asked whether they want to rate at
  // all before seeing any question. Under "mandatory" that choice is not
  // offered and the survey opens straight on question 1.
  const [showIntro, setShowIntro] = useState(false)

  // Fresh survey every time the modal opens.
  useEffect(() => {
    if (visible) {
      setStep(0)
      setAnswers(emptyAnswers())
      setSubmitting(false)
      setError('')
      setDone(false)
      setShowIntro(mode === 'optional')
    }
  }, [visible, mode])

  const total = QUESTIONS.length
  const question = QUESTIONS[step]
  const isLast = step === total - 1
  const currentValue = answers[question.key]
  const canAdvance = question.type === 'text' || !!currentValue

  const answeredCount = useMemo(() => LIKERT_KEYS.filter((key) => !!answers[key]).length, [answers])

  const pick = (score) => {
    setAnswers((prev) => ({ ...prev, [question.key]: score }))
    setError('')
    // Nudge forward so the survey reads as a quick one-by-one flow. Back is
    // always available if the click was wrong.
    window.setTimeout(() => {
      setStep((prev) => (prev < total - 1 ? prev + 1 : prev))
    }, 420)
  }

  // `suggestionOverride` exists for "Skip & Submit": clearing the textarea via
  // setAnswers and calling send() in the same handler would still read the old
  // state out of this closure, so the skipped text would get sent anyway.
  const send = async (suggestionOverride) => {
    if (LIKERT_KEYS.some((key) => !answers[key])) {
      setError('Please answer the first four questions before submitting.')
      return
    }
    const suggestion =
      suggestionOverride !== undefined ? suggestionOverride : answers.q5_suggestion || ''

    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        q1_ease: answers.q1_ease,
        q2_timeliness: answers.q2_timeliness,
        q3_met_needs: answers.q3_met_needs,
        q4_overall: answers.q4_overall,
        q5_suggestion: suggestion.trim(),
      })
      setDone(true)
    } catch (e) {
      setError(e.message || 'Could not submit your feedback. Please try again.')
      setSubmitting(false)
    }
  }

  // "No thanks" on the intro. The decline is recorded so the user is not
  // asked again on a reprint, then the print is released immediately.
  const decline = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onDecline()
      onComplete()
    } catch (e) {
      setError(e.message || 'Could not continue. Please try again.')
      setSubmitting(false)
    }
  }

  // Let the thank-you land before handing control back, then release the
  // print/download the user originally asked for.
  useEffect(() => {
    if (!done) return undefined
    const timer = window.setTimeout(() => onComplete(), 1100)
    return () => window.clearTimeout(timer)
  }, [done, onComplete])

  const progress = done ? 100 : Math.round(((step + (canAdvance ? 1 : 0)) / total) * 100)

  return (
    <CModal
      visible={visible}
      onClose={() => {
        if (!submitting && !done) onClose()
      }}
      backdrop="static"
      alignment="center"
      size="lg"
    >
      <CModalHeader closeButton={!submitting}>
        <CModalTitle>Service Feedback</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {done ? (
          <div className="text-center py-4">
            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🎉</div>
            <h5 className="mt-3 mb-1">Thank you for your feedback</h5>
            <p className="text-medium-emphasis mb-0">Preparing your {actionLabel}…</p>
          </div>
        ) : showIntro ? (
          <div className="text-center py-3">
            <div style={{ fontSize: '2.25rem', lineHeight: 1 }}>⭐</div>
            <h5 className="mt-3 mb-2">Would you like to rate the service you received?</h5>
            <p className="text-medium-emphasis mb-3" style={{ fontSize: '0.9rem' }}>
              Your <strong>{letterLabel || 'letter'}</strong>
              {referenceNumber ? (
                <>
                  {' '}
                  (<code>{referenceNumber}</code>)
                </>
              ) : null}{' '}
              is ready to {actionLabel}. Rating is voluntary and takes less than a minute — your
              feedback helps HR improve the service.
            </p>
            <CAlert color="light" className="text-start mb-0 py-2" style={{ fontSize: '0.82rem' }}>
              If you choose to rate, all <strong>four</strong> questions must be answered. The
              suggestion box at the end is optional. You will not be asked again for this request.
            </CAlert>
            {error ? (
              <CAlert color="danger" className="mt-3 mb-0 py-2">
                {error}
              </CAlert>
            ) : null}
          </div>
        ) : (
          <>
            <p className="text-medium-emphasis" style={{ fontSize: '0.9rem' }}>
              Before you {actionLabel} your <strong>{letterLabel || 'letter'}</strong>
              {referenceNumber ? (
                <>
                  {' '}
                  (<code>{referenceNumber}</code>)
                </>
              ) : null}
              , please rate the service you received. It takes less than a minute and is asked only
              once per request.
            </p>

            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                Question {step + 1} of {total}
              </span>
              <span className="text-medium-emphasis" style={{ fontSize: '0.8rem' }}>
                {answeredCount}/{LIKERT_KEYS.length} required answered
              </span>
            </div>
            <CProgress height={6} className="mb-4">
              <CProgressBar value={progress} color="success" />
            </CProgress>

            <div className="text-center mb-3">
              <h5 className="mb-2" style={{ fontWeight: 600, lineHeight: 1.45 }}>
                {question.label}
              </h5>
              <div className="text-medium-emphasis" style={{ fontSize: '0.8rem' }}>
                {question.required ? question.purpose : 'Optional — you may skip this.'}
              </div>
            </div>

            {question.type === 'likert' ? (
              <div className="py-2">
                <StarScale value={currentValue} onChange={pick} />
              </div>
            ) : (
              <CFormTextarea
                rows={5}
                value={answers.q5_suggestion}
                maxLength={2000}
                placeholder="Tell us what we could do better… (optional)"
                onChange={(e) => setAnswers((prev) => ({ ...prev, q5_suggestion: e.target.value }))}
              />
            )}

            {error ? (
              <CAlert color="danger" className="mt-3 mb-0 py-2">
                {error}
              </CAlert>
            ) : null}
          </>
        )}
      </CModalBody>

      {!done && showIntro && (
        <CModalFooter className="d-flex justify-content-between">
          <CButton color="secondary" variant="outline" disabled={submitting} onClick={decline}>
            {submitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Continuing…
              </>
            ) : (
              `No thanks — ${actionLabel} now`
            )}
          </CButton>
          <CButton color="primary" disabled={submitting} onClick={() => setShowIntro(false)}>
            Yes, rate the service
          </CButton>
        </CModalFooter>
      )}

      {!done && !showIntro && (
        <CModalFooter className="d-flex justify-content-between">
          <CButton
            color="secondary"
            variant="ghost"
            disabled={(step === 0 && mode !== 'optional') || submitting}
            onClick={() => {
              // From question 1 under an optional policy, Back returns to the
              // yes/no choice rather than dead-ending.
              if (step === 0) setShowIntro(true)
              else setStep((prev) => Math.max(0, prev - 1))
            }}
          >
            Back
          </CButton>

          <div className="d-flex gap-2">
            {isLast ? (
              <>
                <CButton
                  color="secondary"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => send('')}
                >
                  Skip &amp; Submit
                </CButton>
                <CButton color="primary" disabled={submitting} onClick={() => send()}>
                  {submitting ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Submitting…
                    </>
                  ) : (
                    'Submit'
                  )}
                </CButton>
              </>
            ) : (
              <CButton
                color="primary"
                disabled={!canAdvance || submitting}
                onClick={() => setStep((prev) => Math.min(total - 1, prev + 1))}
              >
                Next
              </CButton>
            )}
          </div>
        </CModalFooter>
      )}
    </CModal>
  )
}

ServiceRatingModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  letterLabel: PropTypes.string,
  referenceNumber: PropTypes.string,
  actionLabel: PropTypes.string,
  mode: PropTypes.oneOf(RATING_MODES),
}

export default ServiceRatingModal
