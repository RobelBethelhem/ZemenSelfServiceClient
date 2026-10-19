// Frequently Asked Questions API + the topic vocabulary the help button and
// the admin page share.
import { API_BASE } from './base'

const FAQ_BASE = `${API_BASE}/faq`

// Fired by the admin page after a save or delete so the help button refreshes
// in the same tab without a reload.
export const FAQ_CHANGED_EVENT = 'zbss:faq-changed'

// Mirrors FAQ_TOPICS in models/rms/Faq.js. A key missing from the server list
// is saved as "general", so the two lists must stay in step.
//
// `paths` are the pages a topic belongs to: the help button opens on that
// topic's questions when the employee is on one of them.
export const FAQ_TOPICS = [
  { key: 'general', label: 'General', paths: [] },
  { key: 'guaranty', label: 'Guaranty Letter', paths: ['/user/guaranty', '/admin/guaranty'] },
  {
    key: 'experience',
    label: 'Experience Letter',
    paths: ['/user/experiance', '/admin/experiance'],
  },
  { key: 'embassy', label: 'Embassy Letter', paths: ['/user/embassy', '/admin/embassy'] },
  {
    key: 'supportive',
    label: 'Supportive Letter',
    paths: ['/user/supportive', '/user/supportive-am', '/admin/supportive', '/admin/supportive-am'],
  },
  { key: 'medical', label: 'Medical Letter', paths: ['/user/medical', '/admin/medical'] },
  { key: 'requests', label: 'My Requests', paths: ['/admin/candidate'] },
  { key: 'salary', label: 'Salary Increment & Bonus', paths: ['/user/salary-increment'] },
  { key: 'clearance', label: 'Exit Clearance', paths: ['/user/clearance', '/clearance'] },
]

export const topicLabel = (key) => {
  const topic = FAQ_TOPICS.find((t) => t.key === key)
  return topic ? topic.label : 'General'
}

// Exact match or a sub-path, so '/clearance' covers '/clearance/inbox' but
// '/user/supportive' does not swallow '/user/supportive-am'.
export const topicForPath = (pathname) => {
  const path = String(pathname || '')
  const hit = FAQ_TOPICS.find((t) => t.paths.some((p) => path === p || path.startsWith(`${p}/`)))
  return hit ? hit.key : null
}

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

export const fetchFaqs = async ({ accessToken }) => {
  const response = await fetch(FAQ_BASE, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const fetchAdminFaqs = async ({ accessToken }) => {
  const response = await fetch(`${FAQ_BASE}/admin`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const createFaq = async ({ accessToken, faq }) => {
  const response = await fetch(`${FAQ_BASE}/admin`, {
    method: 'POST',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify(faq),
  })
  return readJson(response)
}

export const updateFaq = async ({ accessToken, faq }) => {
  const response = await fetch(`${FAQ_BASE}/admin`, {
    method: 'PUT',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify(faq),
  })
  return readJson(response)
}

export const deleteFaq = async ({ accessToken, id }) => {
  const response = await fetch(`${FAQ_BASE}/admin/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}
