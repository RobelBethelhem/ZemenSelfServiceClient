// Announcements API + the block vocabulary the builder and renderer share.
import { API_BASE } from './base'

const AN_BASE = `${API_BASE}/announcement`

export const ANNOUNCEMENT_MODES = ['mandatory', 'optional']
export const ANNOUNCEMENT_STATUSES = ['draft', 'published', 'archived']

export const MODE_LABELS = {
  mandatory: 'Mandatory',
  optional: 'Optional',
}

export const MODE_HINTS = {
  mandatory:
    'Employees cannot dismiss the login screen until they open this and confirm they have read it.',
  optional: 'Employees can skip this and carry on. It stays available on the Announcements page.',
}

export const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

// ---------------------------------------------------------------------------
// Block vocabulary
// ---------------------------------------------------------------------------
// Mirrors the server-side whitelist in routes/rms/Announcement.js. A block
// type missing from that whitelist is silently dropped on save, so the two
// lists must stay in step.
export const BLOCK_LIBRARY = [
  { type: 'heading', label: 'Heading', hint: 'Section title', icon: 'H' },
  { type: 'text', label: 'Text', hint: 'Paragraph with **bold** and links', icon: '¶' },
  { type: 'image', label: 'Image', hint: 'Upload or link a picture', icon: '🖼' },
  { type: 'gallery', label: 'Gallery', hint: 'Several images in a grid', icon: '▦' },
  { type: 'video', label: 'Video', hint: 'YouTube, Vimeo or MP4', icon: '▶' },
  { type: 'callout', label: 'Callout', hint: 'Highlighted note', icon: '!' },
  { type: 'quote', label: 'Quote', hint: 'Pull quote with author', icon: '❝' },
  { type: 'list', label: 'List', hint: 'Bullets or numbers', icon: '≡' },
  { type: 'button', label: 'Button', hint: 'Link to apply or read more', icon: '⬢' },
  { type: 'divider', label: 'Divider', hint: 'Horizontal rule', icon: '—' },
  { type: 'spacer', label: 'Spacer', hint: 'Vertical breathing room', icon: '↕' },
]

// Client-side ids only — they keep React keys and dnd-kit identities stable
// across a save. The server stores whatever it is given here, capped at 60
// chars, and never derives meaning from it.
let blockSeq = 0
export const newBlockId = () => {
  blockSeq += 1
  return `b${Date.now().toString(36)}${blockSeq}`
}

export const newBlock = (type) => {
  const id = newBlockId()
  switch (type) {
    case 'heading':
      return { id, type, text: 'Section heading', level: 2, align: 'left', color: '' }
    case 'text':
      return {
        id,
        type,
        content:
          'Write your announcement here. You can use **bold**, *italic* and [links](https://www.zemenbank.com).',
        align: 'left',
        size: 'md',
      }
    case 'image':
      return { id, type, src: '', alt: '', caption: '', align: 'center', width: 100, rounded: 12 }
    case 'gallery':
      return { id, type, images: [], caption: '', columns: 3 }
    case 'video':
      return { id, type, url: '', provider: 'youtube', caption: '', poster: '' }
    case 'button':
      return { id, type, label: 'Read more', href: '', style: 'primary', align: 'left' }
    case 'divider':
      return { id, type, style: 'solid' }
    case 'spacer':
      return { id, type, size: 32 }
    case 'quote':
      return { id, type, text: '', author: '' }
    case 'list':
      return { id, type, items: ['First point', 'Second point'], ordered: false }
    case 'callout':
      return { id, type, title: 'Please note', text: '', tone: 'info' }
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Image handling
// ---------------------------------------------------------------------------
// Images are embedded as data URIs rather than uploaded to disk: no writable
// folder, no static-file route, and no orphaned files when an announcement is
// deleted. The trade-off is document size, so everything is downscaled and
// re-encoded here before it ever reaches the network.
// Plain digits, not 2_200_000 — the repo's ESLint parser is pinned to
// ecmaVersion 2020 and numeric separators are ES2021, so the separator form
// fails linting even though Vite compiles it happily.
export const MAX_IMAGE_BYTES = 2200000

const readFileAsDataUri = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('That file is not a readable image.'))
    img.src = src
  })

export const compressImageFile = async (file, { maxEdge = 1600, quality = 0.82 } = {}) => {
  if (!file) throw new Error('No file selected.')
  if (!/^image\//i.test(file.type)) {
    throw new Error('Please choose an image file (PNG, JPG, WebP or GIF).')
  }

  const original = await readFileAsDataUri(file)
  const img = await loadImage(original)

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const isPng = /png/i.test(file.type)
  if (!isPng) {
    // JPEG has no alpha channel; without this a transparent source would
    // composite onto black.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(img, 0, 0, width, height)

  // Keep PNG when it stays reasonable, so logos and screenshots with
  // transparency survive intact. Fall back to JPEG on white otherwise.
  let dataUri = null
  if (isPng) {
    const png = canvas.toDataURL('image/png')
    if (png.length <= 1100000) dataUri = png
  }
  if (!dataUri) {
    if (isPng) {
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'source-over'
    }
    dataUri = canvas.toDataURL('image/jpeg', quality)
  }

  // Rough decode: base64 carries 3 bytes per 4 characters.
  const bytes = Math.round((dataUri.length - (dataUri.indexOf(',') + 1)) * 0.75)
  if (dataUri.length > MAX_IMAGE_BYTES) {
    throw new Error(
      `That image is still ${Math.round(bytes / 1024)} KB after compression. ` +
        'Please use a smaller or simpler image.',
    )
  }

  return { dataUri, bytes, width, height }
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

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
    if (value !== undefined && value !== null && value !== '') search.append(key, value)
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}

// loginOnly restricts the feed to announcements flagged for the post-login
// screen, so the standalone page can show everything while the overlay does not.
export const fetchAnnouncementFeed = async ({ accessToken, loginOnly = false }) => {
  const response = await fetch(`${AN_BASE}/feed${qs({ login: loginOnly ? 1 : '' })}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

// The feed omits block bodies to keep the login screen light, so the detail
// view pulls the content for one announcement on demand.
export const fetchAnnouncementItem = async ({ accessToken, id }) => {
  const response = await fetch(`${AN_BASE}/item/${id}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const markAnnouncementSeen = async ({ accessToken, id }) => {
  const response = await fetch(`${AN_BASE}/seen`, {
    method: 'POST',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify({ id }),
  })
  return readJson(response)
}

export const acknowledgeAnnouncement = async ({ accessToken, id }) => {
  const response = await fetch(`${AN_BASE}/ack`, {
    method: 'POST',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify({ id }),
  })
  return readJson(response)
}

export const fetchAnnouncementCategories = async ({ accessToken }) => {
  const response = await fetch(`${AN_BASE}/categories`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

// --- admin -----------------------------------------------------------------

export const fetchAnnouncementList = async ({ accessToken, filters = {}, page = 0, size = 25 }) => {
  const response = await fetch(`${AN_BASE}/admin/list${qs({ ...filters, page, size })}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const fetchAnnouncement = async ({ accessToken, id }) => {
  const response = await fetch(`${AN_BASE}/admin/item/${id}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const saveAnnouncement = async ({ accessToken, announcement }) => {
  const response = await fetch(`${AN_BASE}/admin/save`, {
    method: 'POST',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify(announcement),
  })
  return readJson(response)
}

export const setAnnouncementStatus = async ({ accessToken, id, status, note = '' }) => {
  const response = await fetch(`${AN_BASE}/admin/status`, {
    method: 'PATCH',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify({ id, status, note }),
  })
  return readJson(response)
}

export const deleteAnnouncement = async ({ accessToken, id }) => {
  const response = await fetch(`${AN_BASE}/admin/item/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const fetchAnnouncementEngagement = async ({ accessToken, id }) => {
  const response = await fetch(`${AN_BASE}/admin/engagement/${id}`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const fetchAdminCategories = async ({ accessToken }) => {
  const response = await fetch(`${AN_BASE}/admin/categories`, {
    method: 'GET',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}

export const createCategory = async ({ accessToken, category }) => {
  const response = await fetch(`${AN_BASE}/admin/categories`, {
    method: 'POST',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify(category),
  })
  return readJson(response)
}

export const updateCategory = async ({ accessToken, category }) => {
  const response = await fetch(`${AN_BASE}/admin/categories`, {
    method: 'PUT',
    headers: jsonHeaders(accessToken),
    body: JSON.stringify(category),
  })
  return readJson(response)
}

export const deleteCategory = async ({ accessToken, id }) => {
  const response = await fetch(`${AN_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders(accessToken),
  })
  return readJson(response)
}
