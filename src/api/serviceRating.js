// Service-level rating API.
//
// The survey gates the FIRST print/download of an approved letter for users.
// Once a request is rated, the gate is lifted for that request forever, so
// repeat prints go straight through.
import { API_BASE } from './base'

const SR_BASE = `${API_BASE}/service-rating`

// 1 = Strongly Disagree ... 5 = Strongly Agree
export const SCALE_LABELS = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
}

// Mirrors routes/rms/ServiceRating.js. Kept client-side too so the modal can
// render instantly without waiting on a round-trip for its own wording.
export const QUESTIONS = [
  {
    key: 'q1_ease',
    label: 'The service was easy to access and complete through the Employee Self-Service system.',
    purpose: 'Measures system usability.',
    required: true,
    type: 'likert',
  },
  {
    key: 'q2_timeliness',
    label: 'My request was processed within a reasonable time.',
    purpose: 'Measures service timeliness.',
    required: true,
    type: 'likert',
  },
  {
    key: 'q3_met_needs',
    label: 'The information or service I received met my needs.',
    purpose: 'Measures service quality and effectiveness.',
    required: true,
    type: 'likert',
  },
  {
    key: 'q4_overall',
    label: 'Overall, I am satisfied with the service I received.',
    purpose: 'Measures overall satisfaction (key KPI).',
    required: true,
    type: 'likert',
  },
  {
    key: 'q5_suggestion',
    label: 'Do you have any suggestions to improve our service?',
    purpose: 'Collects actionable feedback.',
    required: false,
    type: 'text',
  },
]

export const LIKERT_KEYS = QUESTIONS.filter((q) => q.type === 'likert').map((q) => q.key)

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

const qs = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value)
    }
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}

// Has the CALLER already rated this request? The backend scopes the lookup to
// the caller, so another user's rating can never unlock someone else's letter.
export const fetchRatingStatus = async ({ accessToken, requestId, requestType }) => {
  const response = await fetch(
    `${SR_BASE}/status${qs({ request_id: requestId, request_type: requestType })}`,
    { method: 'GET', headers: jsonHeaders(accessToken) },
  )
  return readJson(response)
}

// Owner-only and idempotent — a retry after a dropped response still unlocks.
export const submitRating = async ({ accessToken, requestId, requestType, answers }) => {
  const response = await fetch(`${SR_BASE}/submit`, {
    method: 'POST',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify({
      request_id: requestId,
      request_type: requestType,
      ...answers,
    }),
  })
  return readJson(response)
}

export const fetchRatingSummary = async ({ accessToken, filters = {} }) => {
  const response = await fetch(`${SR_BASE}/admin/summary${qs(filters)}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const fetchRatingComments = async ({ accessToken, filters = {}, page = 0, size = 25 }) => {
  const response = await fetch(`${SR_BASE}/admin/comments${qs({ ...filters, page, size })}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const fetchRatingRows = async ({ accessToken, filters = {}, page = 0, size = 25 }) => {
  const response = await fetch(`${SR_BASE}/admin/list${qs({ ...filters, page, size })}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const fetchRatingFilters = async ({ accessToken }) => {
  const response = await fetch(`${SR_BASE}/admin/filters`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}
