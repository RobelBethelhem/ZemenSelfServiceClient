import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CFormTextarea,
  CFormSwitch,
  CFormRange,
  CFormCheck,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import AnnouncementBlocks from '../../../components/announcement/AnnouncementBlocks'
import '../../../components/announcement/announcement.css'
import {
  BLOCK_LIBRARY,
  newBlock,
  newBlockId,
  compressImageFile,
  fetchAdminCategories,
  fetchAnnouncement,
  saveAnnouncement,
  ANNOUNCEMENT_MODES,
  ANNOUNCEMENT_STATUSES,
  MODE_LABELS,
  MODE_HINTS,
  STATUS_LABELS,
} from '../../../api/announcement'

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Right' },
]

const toDateInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  // Local parts, not toISOString — the latter shifts the day for any timezone
  // east of UTC, which is every user of this system.
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const kb = (dataUri) => {
  if (!dataUri) return 0
  const comma = dataUri.indexOf(',')
  return Math.round(((dataUri.length - comma - 1) * 0.75) / 1024)
}

// ---------------------------------------------------------------------------
// Image picker — upload (compressed in the browser) or paste a URL
// ---------------------------------------------------------------------------

const ImagePicker = ({ value, onChange, hint }) => {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [urlDraft, setUrlDraft] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const { dataUri } = await compressImageFile(file)
      onChange(dataUri)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {value ? (
        <div className="mb-2">
          <img
            src={value}
            alt=""
            style={{
              width: '100%',
              maxHeight: 160,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #e3e7ee',
            }}
          />
          <div className="d-flex justify-content-between align-items-center mt-1">
            <span className="small text-medium-emphasis">
              {value.startsWith('data:') ? `Embedded · ~${kb(value)} KB` : 'Linked image'}
            </span>
            <CButton size="sm" color="danger" variant="ghost" onClick={() => onChange('')}>
              Remove
            </CButton>
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files && e.target.files[0])}
      />

      <div className="d-flex flex-wrap gap-2">
        <CButton
          size="sm"
          color="primary"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {busy ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Compressing…
            </>
          ) : (
            'Upload image'
          )}
        </CButton>
      </div>

      <div className="d-flex gap-2 mt-2">
        <CFormInput
          size="sm"
          placeholder="…or paste an image URL (https://)"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          disabled={!/^https?:\/\//i.test(urlDraft.trim())}
          onClick={() => {
            onChange(urlDraft.trim())
            setUrlDraft('')
          }}
        >
          Use
        </CButton>
      </div>

      {hint ? <div className="small text-medium-emphasis mt-1">{hint}</div> : null}
      {error ? (
        <CAlert color="danger" className="mt-2 mb-0 py-2 small">
          {error}
        </CAlert>
      ) : null}
    </div>
  )
}

ImagePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  hint: PropTypes.string,
}

// ---------------------------------------------------------------------------
// Per-type field editors
// ---------------------------------------------------------------------------

const BlockFields = ({ block, patch }) => {
  const set = (key) => (e) => patch({ [key]: e.target.value })
  const setNum = (key) => (e) => patch({ [key]: Number(e.target.value) })

  switch (block.type) {
    case 'heading':
      return (
        <CRow className="g-2">
          <CCol md={12}>
            <CFormLabel className="small mb-1">Heading text</CFormLabel>
            <CFormInput value={block.text} onChange={set('text')} />
          </CCol>
          <CCol md={4}>
            <CFormLabel className="small mb-1">Size</CFormLabel>
            <CFormSelect value={block.level} onChange={setNum('level')}>
              <option value={1}>Extra large</option>
              <option value={2}>Large</option>
              <option value={3}>Medium</option>
              <option value={4}>Small</option>
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <CFormLabel className="small mb-1">Alignment</CFormLabel>
            <CFormSelect value={block.align} onChange={set('align')}>
              {ALIGN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <CFormLabel className="small mb-1">Colour</CFormLabel>
            <CFormInput
              type="color"
              value={block.color || '#111827'}
              onChange={set('color')}
              title="Heading colour"
            />
          </CCol>
        </CRow>
      )

    case 'text':
      return (
        <CRow className="g-2">
          <CCol md={12}>
            <CFormLabel className="small mb-1">Text</CFormLabel>
            <CFormTextarea rows={6} value={block.content} onChange={set('content')} />
            <div className="small text-medium-emphasis mt-1">
              <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>,{' '}
              <code>[label](https://…)</code>. Leave a blank line for a new paragraph.
            </div>
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Alignment</CFormLabel>
            <CFormSelect value={block.align} onChange={set('align')}>
              {ALIGN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Size</CFormLabel>
            <CFormSelect value={block.size} onChange={set('size')}>
              <option value="sm">Small</option>
              <option value="md">Normal</option>
              <option value="lg">Large</option>
            </CFormSelect>
          </CCol>
        </CRow>
      )

    case 'image':
      return (
        <CRow className="g-2">
          <CCol md={12}>
            <ImagePicker
              value={block.src}
              onChange={(src) => patch({ src })}
              hint="Images are resized to 1600px and embedded in the announcement."
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Alt text</CFormLabel>
            <CFormInput value={block.alt} onChange={set('alt')} placeholder="For screen readers" />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Caption</CFormLabel>
            <CFormInput value={block.caption} onChange={set('caption')} />
          </CCol>
          <CCol md={4}>
            <CFormLabel className="small mb-1">Alignment</CFormLabel>
            <CFormSelect value={block.align} onChange={set('align')}>
              {ALIGN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <CFormLabel className="small mb-1">Width — {block.width}%</CFormLabel>
            <CFormRange min={20} max={100} value={block.width} onChange={setNum('width')} />
          </CCol>
          <CCol md={4}>
            <CFormLabel className="small mb-1">Corner radius — {block.rounded}px</CFormLabel>
            <CFormRange min={0} max={32} value={block.rounded} onChange={setNum('rounded')} />
          </CCol>
        </CRow>
      )

    case 'gallery':
      return (
        <div>
          <CRow className="g-2 mb-2">
            {(block.images || []).map((img, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <CCol xs={6} md={4} key={`${block.id}-img${i}`}>
                <img
                  src={img.src}
                  alt=""
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  className="w-100 mt-1"
                  onClick={() => patch({ images: block.images.filter((_, idx) => idx !== i) })}
                >
                  Remove
                </CButton>
              </CCol>
            ))}
          </CRow>

          <ImagePicker
            value=""
            onChange={(src) =>
              src ? patch({ images: [...(block.images || []), { src, alt: '' }] }) : null
            }
            hint={`${(block.images || []).length} of 12 images added.`}
          />

          <CRow className="g-2 mt-2">
            <CCol md={6}>
              <CFormLabel className="small mb-1">Columns</CFormLabel>
              <CFormSelect value={block.columns} onChange={setNum('columns')}>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel className="small mb-1">Caption</CFormLabel>
              <CFormInput value={block.caption} onChange={set('caption')} />
            </CCol>
          </CRow>
        </div>
      )

    case 'video':
      return (
        <CRow className="g-2">
          <CCol md={12}>
            <CFormLabel className="small mb-1">Video link</CFormLabel>
            <CFormInput
              value={block.url}
              onChange={set('url')}
              placeholder="https://www.youtube.com/watch?v=… or a direct .mp4 URL"
            />
            <div className="small text-medium-emphasis mt-1">
              YouTube and Vimeo links are detected automatically. If embeds are blocked on the
              internal network, use a direct video file URL instead.
            </div>
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Source</CFormLabel>
            <CFormSelect value={block.provider} onChange={set('provider')}>
              <option value="youtube">Detect automatically</option>
              <option value="file">Direct video file</option>
            </CFormSelect>
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Caption</CFormLabel>
            <CFormInput value={block.caption} onChange={set('caption')} />
          </CCol>
        </CRow>
      )

    case 'button':
      return (
        <CRow className="g-2">
          <CCol md={6}>
            <CFormLabel className="small mb-1">Label</CFormLabel>
            <CFormInput value={block.label} onChange={set('label')} />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Link</CFormLabel>
            <CFormInput value={block.href} onChange={set('href')} placeholder="https://…" />
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Style</CFormLabel>
            <CFormSelect value={block.style} onChange={set('style')}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </CFormSelect>
          </CCol>
          <CCol md={6}>
            <CFormLabel className="small mb-1">Alignment</CFormLabel>
            <CFormSelect value={block.align} onChange={set('align')}>
              {ALIGN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
      )

    case 'divider':
      return (
        <CRow className="g-2">
          <CCol md={6}>
            <CFormLabel className="small mb-1">Style</CFormLabel>
            <CFormSelect value={block.style} onChange={set('style')}>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="gradient">Fading</option>
            </CFormSelect>
          </CCol>
        </CRow>
      )

    case 'spacer':
      return (
        <div>
          <CFormLabel className="small mb-1">Height — {block.size}px</CFormLabel>
          <CFormRange min={8} max={160} step={4} value={block.size} onChange={setNum('size')} />
        </div>
      )

    case 'quote':
      return (
        <CRow className="g-2">
          <CCol md={12}>
            <CFormLabel className="small mb-1">Quote</CFormLabel>
            <CFormTextarea rows={3} value={block.text} onChange={set('text')} />
          </CCol>
          <CCol md={12}>
            <CFormLabel className="small mb-1">Attributed to</CFormLabel>
            <CFormInput value={block.author} onChange={set('author')} />
          </CCol>
        </CRow>
      )

    case 'list':
      return (
        <CRow className="g-2">
          <CCol md={12}>
            <CFormLabel className="small mb-1">Items — one per line</CFormLabel>
            <CFormTextarea
              rows={5}
              value={(block.items || []).join('\n')}
              onChange={(e) => patch({ items: e.target.value.split('\n') })}
            />
          </CCol>
          <CCol md={12}>
            <CFormSwitch
              label="Numbered list"
              checked={!!block.ordered}
              onChange={(e) => patch({ ordered: e.target.checked })}
            />
          </CCol>
        </CRow>
      )

    case 'callout':
      return (
        <CRow className="g-2">
          <CCol md={8}>
            <CFormLabel className="small mb-1">Title</CFormLabel>
            <CFormInput value={block.title} onChange={set('title')} />
          </CCol>
          <CCol md={4}>
            <CFormLabel className="small mb-1">Tone</CFormLabel>
            <CFormSelect value={block.tone} onChange={set('tone')}>
              <option value="info">Information</option>
              <option value="success">Positive</option>
              <option value="warning">Warning</option>
              <option value="danger">Important</option>
            </CFormSelect>
          </CCol>
          <CCol md={12}>
            <CFormLabel className="small mb-1">Text</CFormLabel>
            <CFormTextarea rows={3} value={block.text} onChange={set('text')} />
          </CCol>
        </CRow>
      )

    default:
      return null
  }
}

BlockFields.propTypes = {
  block: PropTypes.object.isRequired,
  patch: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// Sortable canvas row
// ---------------------------------------------------------------------------

const SortableBlock = ({
  block,
  index,
  total,
  selected,
  onSelect,
  patch,
  remove,
  duplicate,
  move,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const meta = BLOCK_LIBRARY.find((b) => b.type === block.type) || { label: block.type, icon: '•' }

  return (
    <div
      ref={setNodeRef}
      style={{
        // Built by hand rather than importing @dnd-kit/utilities, which is only
        // present as a transitive dependency.
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 5 : 'auto',
        position: 'relative',
      }}
      className="mb-2"
    >
      <CCard
        style={{
          borderColor: selected ? '#0d6efd' : undefined,
          boxShadow: selected ? '0 0 0 2px rgba(13,110,253,0.14)' : undefined,
        }}
      >
        <CCardHeader className="d-flex align-items-center gap-2 py-2">
          <span
            {...attributes}
            {...listeners}
            title="Drag to reorder"
            style={{
              cursor: 'grab',
              userSelect: 'none',
              padding: '0 0.35rem',
              color: '#8a94a6',
              fontSize: '1.05rem',
              lineHeight: 1,
            }}
          >
            ⠿
          </span>
          <span style={{ opacity: 0.7 }}>{meta.icon}</span>
          <strong className="small">{meta.label}</strong>
          <CBadge color="light" className="text-medium-emphasis">
            {index + 1}
          </CBadge>

          <div className="ms-auto d-flex align-items-center gap-1">
            <CButton
              size="sm"
              color="secondary"
              variant="ghost"
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
              title="Move up"
            >
              ↑
            </CButton>
            <CButton
              size="sm"
              color="secondary"
              variant="ghost"
              disabled={index === total - 1}
              onClick={() => move(index, index + 1)}
              title="Move down"
            >
              ↓
            </CButton>
            <CButton
              size="sm"
              color="secondary"
              variant="ghost"
              onClick={duplicate}
              title="Duplicate"
            >
              ⧉
            </CButton>
            <CButton size="sm" color="danger" variant="ghost" onClick={remove} title="Delete">
              ✕
            </CButton>
            <CButton
              size="sm"
              color="primary"
              variant={selected ? undefined : 'outline'}
              onClick={onSelect}
            >
              {selected ? 'Done' : 'Edit'}
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody className="py-3">
          {/* The rendered block, using the same component employees see. */}
          <div className="ann-blocks" style={{ pointerEvents: 'none' }}>
            <AnnouncementBlocks blocks={[block]} />
          </div>

          {selected ? (
            <div className="mt-3 pt-3 border-top">
              <BlockFields block={block} patch={patch} />
            </div>
          ) : null}
        </CCardBody>
      </CCard>
    </div>
  )
}

SortableBlock.propTypes = {
  block: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  patch: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  duplicate: PropTypes.func.isRequired,
  move: PropTypes.func.isRequired,
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

const emptyDraft = () => ({
  id: null,
  title: '',
  summary: '',
  category_id: '',
  cover_image: '',
  accent_color: '',
  blocks: [],
  mode: 'optional',
  status: 'draft',
  publish_from: '',
  publish_until: '',
  pinned: false,
  priority: 0,
  target_roles: ['user', 'admin'],
  show_on_login: true,
  note: '',
})

const AnnouncementBuilder = () => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const location = useLocation()
  const navigate = useNavigate()

  // Editing target arrives either through navigate state or ?id= in the hash,
  // so a copied link still opens the right announcement after a refresh.
  const editId = useMemo(() => {
    if (location.state && location.state.id) return location.state.id
    const params = new URLSearchParams(location.search || '')
    return params.get('id') || null
  }, [location])

  const [draft, setDraft] = useState(emptyDraft)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(!!editId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const sensors = useSensors(
    // A small activation distance keeps a click on the handle from being read
    // as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    fetchAdminCategories({ accessToken })
      .then((r) => setCategories(r.data || []))
      .catch(() => setCategories([]))
  }, [accessToken])

  useEffect(() => {
    if (!editId) return
    setLoading(true)
    fetchAnnouncement({ accessToken, id: editId })
      .then((r) => {
        const a = r.data || {}
        setDraft({
          ...emptyDraft(),
          ...a,
          id: a._id,
          category_id: a.category_id ? String(a.category_id) : '',
          publish_from: toDateInput(a.publish_from),
          publish_until: toDateInput(a.publish_until),
          // Backfill any block missing an id. dnd-kit identities and React
          // keys are both derived from it, so one undefined id would break
          // reordering for the whole list.
          blocks: (Array.isArray(a.blocks) ? a.blocks : []).map((b) =>
            b && b.id ? b : { ...b, id: newBlockId() },
          ),
          target_roles:
            a.target_roles && a.target_roles.length ? a.target_roles : ['user', 'admin'],
          note: '',
        })
      })
      .catch((e) => setError(e.message || 'Could not load this announcement.'))
      .finally(() => setLoading(false))
  }, [accessToken, editId])

  const setField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }))

  const addBlock = (type) => {
    const block = newBlock(type)
    if (!block) return
    setDraft((prev) => ({ ...prev, blocks: [...prev.blocks, block] }))
    setSelectedBlock(block.id)
    // Bring the new block into view once React has painted it.
    window.setTimeout(() => {
      const el = document.getElementById('ann-canvas-end')
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 60)
  }

  const patchBlock = useCallback(
    (id) => (changes) =>
      setDraft((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...changes } : b)),
      })),
    [],
  )

  const removeBlock = (id) =>
    setDraft((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }))

  const duplicateBlock = (id) =>
    setDraft((prev) => {
      const index = prev.blocks.findIndex((b) => b.id === id)
      if (index < 0) return prev
      const source = prev.blocks[index]
      const copy = { ...source, id: `${source.id}c${Date.now().toString(36)}` }
      const blocks = [...prev.blocks]
      blocks.splice(index + 1, 0, copy)
      return { ...prev, blocks }
    })

  const moveBlock = (from, to) =>
    setDraft((prev) => {
      if (to < 0 || to >= prev.blocks.length) return prev
      return { ...prev, blocks: arrayMove(prev.blocks, from, to) }
    })

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    setDraft((prev) => {
      const from = prev.blocks.findIndex((b) => b.id === active.id)
      const to = prev.blocks.findIndex((b) => b.id === over.id)
      if (from < 0 || to < 0) return prev
      return { ...prev, blocks: arrayMove(prev.blocks, from, to) }
    })
  }

  const save = async (statusOverride) => {
    if (!draft.title.trim()) {
      setError('Please give the announcement a title.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const payload = { ...draft, status: statusOverride || draft.status }
      const result = await saveAnnouncement({ accessToken, announcement: payload })
      const saved = result.data || {}
      setDraft((prev) => ({
        ...prev,
        id: saved._id || prev.id,
        status: saved.status || prev.status,
        note: '',
      }))
      setNotice(
        `${result.message}${
          (saved.status || payload.status) === 'published'
            ? ' — employees will see it on their next sign-in.'
            : ''
        }`,
      )
    } catch (e) {
      setError(e.message || 'Could not save the announcement.')
    } finally {
      setSaving(false)
    }
  }

  // The server drops blocks it considers empty — an image with no picture, a
  // button with no link. Flagging them here means the admin fixes it before
  // saving rather than wondering afterwards where the block went.
  const incomplete = useMemo(() => {
    const missing = (b) => {
      switch (b.type) {
        case 'image':
          return !b.src
        case 'gallery':
          return !(b.images && b.images.length)
        case 'video':
          return !b.url
        case 'button':
          return !b.href
        case 'list':
          return !(b.items || []).some((i) => String(i).trim())
        default:
          return false
      }
    }
    return draft.blocks
      .map((b, i) => ({ block: b, position: i + 1 }))
      .filter(({ block }) => missing(block))
      .map(({ block, position }) => ({
        position,
        label: (BLOCK_LIBRARY.find((x) => x.type === block.type) || {}).label || block.type,
      }))
  }, [draft.blocks])

  const accent =
    draft.accent_color ||
    (categories.find((c) => String(c._id) === String(draft.category_id)) || {}).color ||
    '#7aa2ff'

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-3">
          <CCardBody className="d-flex flex-wrap align-items-center gap-2">
            <CButton
              color="secondary"
              variant="ghost"
              onClick={() => navigate('/admin/announcements')}
            >
              ← All announcements
            </CButton>
            <div className="ms-auto d-flex flex-wrap align-items-center gap-2">
              <CBadge color={draft.status === 'published' ? 'success' : 'secondary'}>
                {STATUS_LABELS[draft.status]}
              </CBadge>
              <CButton color="secondary" variant="outline" onClick={() => setPreviewOpen(true)}>
                Preview
              </CButton>
              <CButton color="secondary" disabled={saving} onClick={() => save('draft')}>
                Save draft
              </CButton>
              <CButton color="primary" disabled={saving} onClick={() => save('published')}>
                {saving ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Saving…
                  </>
                ) : (
                  'Publish'
                )}
              </CButton>
            </div>
          </CCardBody>
        </CCard>

        {error ? <CAlert color="danger">{error}</CAlert> : null}
        {notice ? (
          <CAlert color="success" dismissible onClose={() => setNotice('')}>
            {notice}
          </CAlert>
        ) : null}
        {incomplete.length > 0 ? (
          <CAlert color="warning" className="py-2">
            <strong>Unfinished blocks are not saved.</strong>{' '}
            {incomplete.map((x) => `#${x.position} ${x.label}`).join(', ')} — add the missing image,
            link or list items first, or delete the block.
          </CAlert>
        ) : null}
      </CCol>

      {/* --------------- left: palette + settings --------------- */}
      <CCol lg={4} xl={3}>
        <CCard className="mb-3">
          <CCardHeader>
            <strong>Add content</strong>
            <div className="small text-medium-emphasis">
              Click to add, then drag the ⠿ handle to reorder.
            </div>
          </CCardHeader>
          <CCardBody className="d-grid gap-2">
            {BLOCK_LIBRARY.map((b) => (
              <CButton
                key={b.type}
                color="light"
                className="text-start d-flex align-items-center gap-2"
                onClick={() => addBlock(b.type)}
              >
                <span style={{ width: 20, textAlign: 'center' }}>{b.icon}</span>
                <span>
                  <div className="fw-semibold small">{b.label}</div>
                  <div className="small text-medium-emphasis">{b.hint}</div>
                </span>
              </CButton>
            ))}
          </CCardBody>
        </CCard>

        <CCard className="mb-3">
          <CCardHeader>
            <strong>Settings</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel className="small mb-1">Category</CFormLabel>
                <CFormSelect
                  value={draft.category_id}
                  onChange={(e) => setField('category_id', e.target.value)}
                >
                  <option value="">No category</option>
                  {categories
                    .filter((c) => c.active)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </CFormSelect>
                {categories.length === 0 ? (
                  <div className="small text-medium-emphasis mt-1">
                    No categories yet — create them under Announcements → Categories.
                  </div>
                ) : null}
              </CCol>

              <CCol xs={12}>
                <CFormLabel className="small mb-1">Cover image</CFormLabel>
                <ImagePicker
                  value={draft.cover_image}
                  onChange={(v) => setField('cover_image', v)}
                  hint="Shown on the card. Landscape works best."
                />
              </CCol>

              <CCol xs={12}>
                <CFormLabel className="small mb-1">Reading requirement</CFormLabel>
                <CFormSelect value={draft.mode} onChange={(e) => setField('mode', e.target.value)}>
                  {ANNOUNCEMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {MODE_LABELS[m]}
                    </option>
                  ))}
                </CFormSelect>
                <div className="small text-medium-emphasis mt-1">{MODE_HINTS[draft.mode]}</div>
              </CCol>

              <CCol xs={6}>
                <CFormLabel className="small mb-1">Show from</CFormLabel>
                <CFormInput
                  type="date"
                  value={draft.publish_from}
                  onChange={(e) => setField('publish_from', e.target.value)}
                />
              </CCol>
              <CCol xs={6}>
                <CFormLabel className="small mb-1">Show until</CFormLabel>
                <CFormInput
                  type="date"
                  value={draft.publish_until}
                  onChange={(e) => setField('publish_until', e.target.value)}
                />
              </CCol>
              <CCol xs={12}>
                <div className="small text-medium-emphasis">
                  Leave both empty to show it for as long as it stays published.
                </div>
              </CCol>

              <CCol xs={12}>
                <CFormLabel className="small mb-1">Who sees it</CFormLabel>
                <div className="d-flex gap-3">
                  {['user', 'admin'].map((role) => (
                    <CFormCheck
                      key={role}
                      id={`role-${role}`}
                      label={role === 'user' ? 'Employees' : 'Admins'}
                      checked={draft.target_roles.includes(role)}
                      onChange={(e) =>
                        setField(
                          'target_roles',
                          e.target.checked
                            ? [...draft.target_roles, role]
                            : draft.target_roles.filter((r) => r !== role),
                        )
                      }
                    />
                  ))}
                </div>
              </CCol>

              <CCol xs={12}>
                <CFormSwitch
                  label="Show on the screen after login"
                  checked={draft.show_on_login}
                  onChange={(e) => setField('show_on_login', e.target.checked)}
                />
                <CFormSwitch
                  label="Pin to the front of the deck"
                  className="mt-2"
                  checked={draft.pinned}
                  onChange={(e) => setField('pinned', e.target.checked)}
                />
              </CCol>

              <CCol xs={6}>
                <CFormLabel className="small mb-1">Priority</CFormLabel>
                <CFormInput
                  type="number"
                  value={draft.priority}
                  onChange={(e) => setField('priority', Number(e.target.value))}
                />
              </CCol>
              <CCol xs={6}>
                <CFormLabel className="small mb-1">Accent colour</CFormLabel>
                <CFormInput
                  type="color"
                  value={draft.accent_color || accent}
                  onChange={(e) => setField('accent_color', e.target.value)}
                />
              </CCol>

              <CCol xs={12}>
                <CFormLabel className="small mb-1">Change note (optional)</CFormLabel>
                <CFormInput
                  value={draft.note}
                  placeholder="Why this edit"
                  onChange={(e) => setField('note', e.target.value)}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      {/* --------------- right: canvas --------------- */}
      <CCol lg={8} xl={9}>
        <CCard className="mb-3">
          <CCardBody>
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel className="small mb-1">Title</CFormLabel>
                <CFormInput
                  value={draft.title}
                  placeholder="e.g. Senior Software Developer — internal vacancy"
                  onChange={(e) => setField('title', e.target.value)}
                  style={{ fontSize: '1.05rem', fontWeight: 600 }}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel className="small mb-1">Summary shown on the card</CFormLabel>
                <CFormTextarea
                  rows={2}
                  maxLength={400}
                  value={draft.summary}
                  placeholder="One or two lines that make someone want to open it."
                  onChange={(e) => setField('summary', e.target.value)}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Content</strong>
            <span className="small text-medium-emphasis">
              {draft.blocks.length} block{draft.blocks.length === 1 ? '' : 's'}
            </span>
          </CCardHeader>
          <CCardBody>
            {draft.blocks.length === 0 ? (
              <div className="text-center text-medium-emphasis py-5">
                Nothing here yet. Pick a block from <strong>Add content</strong> on the left to
                start building.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={draft.blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {draft.blocks.map((block, index) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      total={draft.blocks.length}
                      selected={selectedBlock === block.id}
                      onSelect={() =>
                        setSelectedBlock(selectedBlock === block.id ? null : block.id)
                      }
                      patch={patchBlock(block.id)}
                      remove={() => removeBlock(block.id)}
                      duplicate={() => duplicateBlock(block.id)}
                      move={moveBlock}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            <div id="ann-canvas-end" />
          </CCardBody>
        </CCard>
      </CCol>

      {/* --------------- preview --------------- */}
      <CModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        size="lg"
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Preview</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 0 }}>
          <div className="ann-detail" style={{ maxHeight: '76vh', borderRadius: 0 }}>
            <div className="ann-detail-hero">
              {draft.cover_image ? (
                <img src={draft.cover_image} alt="" />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(150deg, ${accent}55, #0f172a 75%)`,
                  }}
                />
              )}
              <div className="ann-detail-hero-scrim" />
              <div className="ann-detail-hero-body">
                {draft.category_id ? (
                  <span className="ann-chip" style={{ color: accent }}>
                    <span className="ann-chip-dot" />
                    <span style={{ color: '#fff' }}>
                      {
                        (categories.find((c) => String(c._id) === String(draft.category_id)) || {})
                          .name
                      }
                    </span>
                  </span>
                ) : null}
                <h3>{draft.title || 'Untitled announcement'}</h3>
              </div>
            </div>
            <div className="ann-detail-scroll">
              {draft.summary ? (
                <p style={{ fontSize: '1.03rem', color: '#374151', marginBottom: '1.1rem' }}>
                  {draft.summary}
                </p>
              ) : null}
              <AnnouncementBlocks blocks={draft.blocks} />
            </div>
          </div>
        </CModalBody>
      </CModal>
    </CRow>
  )
}

export default AnnouncementBuilder
