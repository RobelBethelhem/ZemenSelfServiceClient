// My Profile API — the signed-in employee's own HRIS record, its usage log,
// and the admin analytics built on that log.
import { API_BASE } from './base'

const PROFILE_BASE = `${API_BASE}/profile`

// Mirrors PROFILE_SECTIONS in models/rms/ProfileEvent.js; the keys are what the
// page's tabs and the usage log share.
export const PROFILE_SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'learning', label: 'Education & Training' },
  { key: 'career', label: 'Career' },
  { key: 'salary', label: 'Salary' },
  { key: 'history', label: 'Record history' },
]

const readJson = async (response) => {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.error) {
    const error = new Error(payload.message || `Request failed (${response.status})`)
    // 404 means "no HRIS record", 503 means "HRIS is down" — the page words
    // them differently.
    error.status = response.status
    throw error
  }
  return payload
}

export const fetchMyProfile = async ({ accessToken }) => {
  const response = await fetch(`${PROFILE_BASE}/me`, {
    method: 'GET',
    headers: { 'x-access-token': accessToken },
  })
  return (await readJson(response)).data
}

// The photo needs the access token, so it cannot be a plain <img src>. Returns
// an object URL the caller must revoke, or null when there is no photo.
export const fetchMyPhotoUrl = async ({ accessToken }) => {
  const response = await fetch(`${PROFILE_BASE}/me/photo`, {
    method: 'GET',
    headers: { 'x-access-token': accessToken },
  })
  if (!response.ok) return null
  const blob = await response.blob()
  return blob.size ? URL.createObjectURL(blob) : null
}

// Fire and forget: usage logging never interrupts the employee. keepalive lets
// a click that navigates away still be delivered.
export const trackProfileEvent = ({ accessToken, event, section = null }) => {
  if (!accessToken) return
  fetch(`${PROFILE_BASE}/track`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
    body: JSON.stringify({ event, section }),
  }).catch(() => {})
}

// { opened } — whether this employee has ever opened My Profile.
export const fetchProfilePromo = async ({ accessToken }) => {
  const response = await fetch(`${PROFILE_BASE}/promo`, {
    method: 'GET',
    headers: { 'x-access-token': accessToken },
  })
  return readJson(response)
}

export const fetchProfileAnalytics = async ({ accessToken, range = 'all' }) => {
  const response = await fetch(
    `${PROFILE_BASE}/admin/analytics?range=${encodeURIComponent(range)}`,
    {
      method: 'GET',
      headers: { 'x-access-token': accessToken },
    },
  )
  return (await readJson(response)).data
}
