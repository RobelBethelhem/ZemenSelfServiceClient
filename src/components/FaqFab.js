import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchFaqs, FAQ_CHANGED_EVENT, FAQ_TOPICS, topicForPath, topicLabel } from '../api/faq'
import renderRichText from './announcement/richText'
import './faq/faq.css'

// Mounted once by DefaultLayout, next to AnnouncementGate. A round help button
// that opens the Frequently Asked Questions HR maintains at /admin/faq.
//
// - Draggable with a mouse or a finger. Where the employee leaves it is
//   remembered in this browser as a fraction of the screen, so it keeps its
//   corner when the window is resized.
// - Opens on the questions for the page the employee is on (Guaranty form ->
//   Guaranty questions) when there are any.
// - Renders nothing when there are no published questions or the API cannot be
//   reached: the same fail-silent rule as the announcement gate.

const SIZE = 56
const EDGE = 16 // closest the button may get to a screen edge
const GAP = 12 // space between the button and the panel
const DRAG_THRESHOLD = 6 // px of movement before a press counts as a drag
const MOBILE_MAX = 576
const POS_KEY = 'zbss.faq.position'
const OPENED_KEY = 'zbss.faq.opened'

const readStorage = (key) => {
  try {
    return window.localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value)
  } catch (e) {
    /* private mode or storage blocked — the button just returns to its corner */
  }
}

const clamp01 = (n) => Math.min(1, Math.max(0, n))

const readFraction = () => {
  try {
    const saved = JSON.parse(readStorage(POS_KEY) || 'null')
    if (saved && Number.isFinite(saved.fx) && Number.isFinite(saved.fy)) {
      return { fx: clamp01(saved.fx), fy: clamp01(saved.fy) }
    }
  } catch (e) {
    /* corrupt value — fall through to the default */
  }
  return { fx: 1, fy: 1 } // bottom-right
}

const readViewport = () => ({ w: window.innerWidth, h: window.innerHeight })

// How far the button's top-left corner can travel inside the screen.
const travel = (vp) => ({
  x: Math.max(0, vp.w - SIZE - 2 * EDGE),
  y: Math.max(0, vp.h - SIZE - 2 * EDGE),
})

const toPixels = (frac, vp) => {
  const t = travel(vp)
  return { x: EDGE + frac.fx * t.x, y: EDGE + frac.fy * t.y }
}

const clampPixels = (p, vp) => {
  const t = travel(vp)
  return {
    x: Math.min(EDGE + t.x, Math.max(EDGE, p.x)),
    y: Math.min(EDGE + t.y, Math.max(EDGE, p.y)),
  }
}

const toFraction = (p, vp) => {
  const t = travel(vp)
  return {
    fx: t.x ? clamp01((p.x - EDGE) / t.x) : 1,
    fy: t.y ? clamp01((p.y - EDGE) / t.y) : 1,
  }
}

// The panel opens toward whichever side of the screen has more room; on a
// phone it is a bottom sheet instead.
const panelStyleFor = (fab, vp) => {
  if (vp.w < MOBILE_MAX) {
    return { left: 8, right: 8, bottom: 8, maxHeight: Math.round(vp.h * 0.8) }
  }
  const width = Math.min(400, vp.w - 2 * EDGE)
  const onRight = fab.x + SIZE / 2 > vp.w / 2
  const left = Math.min(vp.w - width - EDGE, Math.max(EDGE, onRight ? fab.x + SIZE - width : fab.x))
  if (fab.y + SIZE / 2 > vp.h / 2) {
    return { left, width, bottom: vp.h - fab.y + GAP, maxHeight: Math.min(560, fab.y - GAP - EDGE) }
  }
  const top = fab.y + SIZE + GAP
  return { left, width, top, maxHeight: Math.min(560, vp.h - top - EDGE) }
}

const QuestionIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8.6 8.6a3.5 3.5 0 0 1 6.8 1.2c0 2.3-3.4 3.2-3.4 4.9" />
    <path d="M12 18.4h.01" />
  </svg>
)

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const FaqFab = () => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const location = useLocation()

  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [viewport, setViewport] = useState(readViewport)
  const [fraction, setFraction] = useState(readFraction)
  const [dragPos, setDragPos] = useState(null) // live px while a drag is in progress
  const [isNew, setIsNew] = useState(() => !readStorage(OPENED_KEY))

  const [topic, setTopic] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  const fabRef = useRef(null)
  const panelRef = useRef(null)
  const dragRef = useRef(null)
  // A drag ends with a click on the same button; this swallows that one click
  // without risking the next real tap (touch drags often fire no click at all).
  const suppressClickUntil = useRef(0)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const result = await fetchFaqs({ accessToken })
      setItems(result.data || [])
    } catch (e) {
      console.warn('[faq] list unavailable:', e.message)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    window.addEventListener(FAQ_CHANGED_EVENT, load)
    return () => window.removeEventListener(FAQ_CHANGED_EVENT, load)
  }, [load])

  useEffect(() => {
    const onResize = () => setViewport(readViewport())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!items.length) setOpen(false)
  }, [items.length])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      if (fabRef.current) fabRef.current.focus()
    }
    const onPointerDown = (e) => {
      if (panelRef.current && panelRef.current.contains(e.target)) return
      if (fabRef.current && fabRef.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const counts = useMemo(() => {
    const byTopic = {}
    items.forEach((item) => {
      byTopic[item.topic] = (byTopic[item.topic] || 0) + 1
    })
    return byTopic
  }, [items])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(
      (item) =>
        (topic === 'all' || item.topic === topic) &&
        (!q ||
          String(item.question).toLowerCase().includes(q) ||
          String(item.answer).toLowerCase().includes(q)),
    )
  }, [items, topic, query])

  const openPanel = () => {
    const pageTopic = topicForPath(location.pathname)
    setTopic(pageTopic && counts[pageTopic] ? pageTopic : 'all')
    setQuery('')
    setOpenId(null)
    setOpen(true)
    if (isNew) {
      setIsNew(false)
      writeStorage(OPENED_KEY, '1')
    }
    // Picks up anything HR published since this employee signed in.
    load()
  }

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') {
      if (e.button !== 0) return
      e.preventDefault() // no text selection while dragging
    }
    const origin = toPixels(fraction, viewport)
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin,
      last: origin,
      moved: false,
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (err) {
      /* capture is a nicety; the drag still works while over the button */
    }
  }

  const onPointerMove = (e) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    drag.moved = true
    drag.last = clampPixels({ x: drag.origin.x + dx, y: drag.origin.y + dy }, viewport)
    setDragPos(drag.last)
  }

  const endDrag = (e) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    dragRef.current = null
    if (!drag.moved) return
    suppressClickUntil.current = Date.now() + 400
    const next = toFraction(drag.last, viewport)
    setFraction(next)
    setDragPos(null)
    writeStorage(POS_KEY, JSON.stringify(next))
  }

  const onClick = () => {
    if (Date.now() < suppressClickUntil.current) return
    if (open) setOpen(false)
    else openPanel()
  }

  if (!accessToken || !items.length) return null

  const fabPos = dragPos || toPixels(fraction, viewport)
  const isMobile = viewport.w < MOBILE_MAX
  const topicsPresent = FAQ_TOPICS.filter((t) => counts[t.key])
  const trimmedQuery = query.trim()

  return (
    <>
      {open ? (
        <div
          ref={panelRef}
          className="zb-faq-panel"
          style={panelStyleFor(fabPos, viewport)}
          role="dialog"
          aria-labelledby="zb-faq-title"
          data-html2canvas-ignore="true"
        >
          <div className="zb-faq-head">
            <div>
              <div className="zb-faq-title" id="zb-faq-title">
                Frequently Asked Questions
              </div>
              <div className="zb-faq-subtitle">ተደጋግመው የሚጠየቁ ጥያቄዎች</div>
            </div>
            <button
              type="button"
              className="zb-faq-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="zb-faq-tools">
            <input
              type="search"
              className="zb-faq-search"
              placeholder="Search questions · ጥያቄ ይፈልጉ"
              aria-label="Search questions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {topicsPresent.length > 1 ? (
              <div className="zb-faq-chips">
                <button
                  type="button"
                  className={`zb-faq-chip${topic === 'all' ? ' is-active' : ''}`}
                  onClick={() => setTopic('all')}
                >
                  All ({items.length})
                </button>
                {topicsPresent.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`zb-faq-chip${topic === t.key ? ' is-active' : ''}`}
                    onClick={() => setTopic(t.key)}
                  >
                    {t.label} ({counts[t.key]})
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="zb-faq-list">
            {visible.length === 0 ? (
              <div className="zb-faq-empty">
                {trimmedQuery
                  ? `No question matches “${trimmedQuery}”.`
                  : 'No questions in this topic yet.'}
                {topic !== 'all' ? (
                  <div>
                    <button type="button" onClick={() => setTopic('all')}>
                      Search all topics
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              visible.map((item) => {
                const expanded = openId === item._id
                return (
                  <div key={item._id} className={`zb-faq-item${expanded ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="zb-faq-q"
                      aria-expanded={expanded}
                      onClick={() => setOpenId(expanded ? null : item._id)}
                    >
                      <span>{item.question}</span>
                      <span className="zb-faq-chevron" aria-hidden="true">
                        ▾
                      </span>
                    </button>
                    {expanded ? (
                      <div className="zb-faq-a">
                        {topic === 'all' && item.topic !== 'general' ? (
                          <span className="zb-faq-topic">{topicLabel(item.topic)}</span>
                        ) : null}
                        {renderRichText(item.answer, `faq-${item._id}`)}
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>

          <div className="zb-faq-hint">
            Tip: drag the ? button to move it anywhere on the screen.
          </div>
        </div>
      ) : null}

      {/* On a phone the open panel is a bottom sheet with its own close button,
          so the floating button steps aside instead of covering it. */}
      {open && isMobile ? null : (
        <button
          ref={fabRef}
          type="button"
          className={`zb-faq-fab${dragPos ? ' is-dragging' : ''}${isNew && !open ? ' is-new' : ''}`}
          style={{ left: fabPos.x, top: fabPos.y }}
          title="Frequently asked questions — drag to move"
          aria-label={open ? 'Close frequently asked questions' : 'Frequently asked questions'}
          aria-expanded={open}
          data-html2canvas-ignore="true"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={onClick}
        >
          {open ? <CloseIcon /> : <QuestionIcon />}
        </button>
      )}
    </>
  )
}

export default FaqFab
