// One place for every call the exit-clearance screens make.
//
// The module talks to /zbss/api/clearance only. Nothing here is shared with
// the other letter types — removing the Clearance directory and its routes
// restores the app to its pre-feature state, the same contract the Salary
// Increment module keeps.

import { API_BASE as API_ROOT } from '../../../api/base'

export const API_BASE = `${API_ROOT}/clearance`

// fetch with the portal's token header and JSON both ways. Throws an Error
// carrying the server's message so callers can toast it verbatim.
export const api = async (token, path, { method = 'GET', body } = {}) => {
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token || '',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    const err = new Error(data.message || `Server returned ${resp.status}`)
    err.status = resp.status
    err.data = data
    throw err
  }
  return data
}

export const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const fmtLongDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export const fmtDateTime = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return '—'
  return dt.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// yyyy-mm-dd for <input type="date">
export const toInputDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`
}

export const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 864e5)
