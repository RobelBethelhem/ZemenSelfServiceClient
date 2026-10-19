// My Profile API — the signed-in employee's own HRIS record.
import { API_BASE } from './base'

const PROFILE_BASE = `${API_BASE}/profile`

export const fetchMyProfile = async ({ accessToken }) => {
  const response = await fetch(`${PROFILE_BASE}/me`, {
    method: 'GET',
    headers: { 'x-access-token': accessToken },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.error) {
    const error = new Error(payload.message || `Request failed (${response.status})`)
    // 404 means "no HRIS record", 503 means "HRIS is down" — the page words
    // them differently.
    error.status = response.status
    throw error
  }
  return payload.data
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
