import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'
import { CSpinner } from '@coreui/react'
import AnnouncementBlocks from './AnnouncementBlocks'
import './announcement.css'

// The employee-facing announcement deck.
//
// Deck: a horizontally snap-scrolling rail of cards. Off-centre cards are
// scaled, tilted and dimmed by distance from the rail's centre — the phone
// app-switcher feel. Those transforms are written straight to the DOM inside a
// requestAnimationFrame callback rather than through React state, because
// re-rendering every card on every scroll frame is what makes this kind of
// effect stutter.
//
// Detail: a spring-in panel with the full block content, lazily fetched. Prev
// and next move between announcements without returning to the deck.
//
// Mandatory announcements gate dismissal: while any remain unacknowledged there
// is no close button and Escape does nothing.

const SPRING = { type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }

const fmtDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const initialOf = (title) =>
  String(title || '?')
    .trim()
    .charAt(0)
    .toUpperCase()

const AnnouncementCard = ({ item, cardRef, onOpen }) => {
  const accent = (item.category && item.category.color) || item.accent_color || '#7aa2ff'
  const isRequired = item.mode === 'mandatory'

  let flag = null
  if (isRequired && !item.acknowledged) {
    flag = <span className="ann-card-flag ann-flag-required">Required</span>
  } else if (item.acknowledged) {
    flag = <span className="ann-card-flag ann-flag-done">✓ Read</span>
  } else if (item.pinned) {
    flag = <span className="ann-card-flag ann-flag-pinned">Pinned</span>
  }

  return (
    <article
      className="ann-card"
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <div className="ann-card-media">
        {item.cover_image ? (
          <img src={item.cover_image} alt="" draggable={false} />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(150deg, ${accent}44, #10192c 70%)`,
            }}
          >
            <div className="ann-card-fallback">{initialOf(item.title)}</div>
          </div>
        )}
      </div>
      <div className="ann-card-scrim" />
      {flag}

      <div className="ann-card-body">
        {item.category ? (
          <span className="ann-chip" style={{ color: accent }}>
            <span className="ann-chip-dot" />
            <span style={{ color: '#fff' }}>{item.category.name}</span>
          </span>
        ) : null}

        <h3 className="ann-card-title">{item.title}</h3>
        {item.summary ? <p className="ann-card-summary">{item.summary}</p> : null}

        <div className="ann-card-foot">
          <span>{fmtDate(item.publish_from || item.created_at)}</span>
          <span className="ann-readmore">
            <span>Read more</span>
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </article>
  )
}

AnnouncementCard.propTypes = {
  item: PropTypes.object.isRequired,
  cardRef: PropTypes.func,
  onOpen: PropTypes.func.isRequired,
}

const AnnouncementShowcase = ({
  items,
  variant,
  loadDetail,
  onSeen,
  onAcknowledge,
  onClose,
  heading,
  subheading,
}) => {
  const railRef = useRef(null)
  const cardEls = useRef([])
  const rafRef = useRef(0)
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 })
  const seenRef = useRef(new Set())
  const detailScrollRef = useRef(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [openIndex, setOpenIndex] = useState(null)
  const [direction, setDirection] = useState(1)

  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const [acking, setAcking] = useState(false)
  const [ackError, setAckError] = useState('')
  const [canAck, setCanAck] = useState(false)

  const mandatoryPending = useMemo(
    () => items.filter((i) => i.mode === 'mandatory' && !i.acknowledged).length,
    [items],
  )
  const dismissible = !!onClose && mandatoryPending === 0

  // --- depth falloff -------------------------------------------------------

  const paint = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const railRect = rail.getBoundingClientRect()
    const centre = railRect.left + railRect.width / 2
    const reach = Math.max(1, railRect.width * 0.62)

    let nearest = 0
    let nearestDistance = Infinity

    cardEls.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const offset = rect.left + rect.width / 2 - centre
      const distance = Math.abs(offset)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = i
      }

      const t = Math.min(1, distance / reach)
      const scale = 1 - t * 0.16
      const tilt = Math.max(-14, Math.min(14, (-offset / railRect.width) * 26))
      const lift = t * 18
      el.style.transform = `translateY(${lift}px) rotateY(${tilt}deg) scale(${scale})`
      el.style.opacity = String(Math.max(0.34, 1 - t * 0.52))
      el.style.zIndex = String(Math.max(1, 60 - Math.round(distance / 10)))
    })

    // Only re-render when the centred card actually changes, so the dots and
    // nav state stay in sync without a render per scroll frame.
    setActiveIndex((prev) => (prev === nearest ? prev : nearest))
  }, [])

  const scheduleP = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0
      paint()
    })
  }, [paint])

  useEffect(() => {
    paint()
    const onResize = () => scheduleP()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [paint, scheduleP, items.length])

  // Vertical wheel drives the rail horizontally, but only in the full-screen
  // variant — hijacking the wheel on an embedded deck would trap page scroll.
  // Registered natively because React's onWheel is passive, so preventDefault
  // there would be ignored with a console warning.
  useEffect(() => {
    if (variant !== 'overlay') return undefined
    const rail = railRef.current
    if (!rail) return undefined
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      rail.scrollLeft += e.deltaY
      e.preventDefault()
    }
    rail.addEventListener('wheel', onWheel, { passive: false })
    return () => rail.removeEventListener('wheel', onWheel)
  }, [variant])

  // Lock the page behind a full-screen deck.
  useEffect(() => {
    if (variant !== 'overlay') return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [variant])

  const scrollToIndex = useCallback((index) => {
    const rail = railRef.current
    const el = cardEls.current[index]
    if (!rail || !el) return
    rail.scrollTo({
      left: el.offsetLeft - (rail.clientWidth - el.clientWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  // --- drag to scroll ------------------------------------------------------

  const onPointerDown = (e) => {
    const rail = railRef.current
    if (!rail || e.button !== 0) return
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: rail.scrollLeft,
      moved: 0,
    }
    rail.classList.add('ann-dragging')
  }

  const onPointerMove = (e) => {
    const drag = dragRef.current
    const rail = railRef.current
    if (!drag.active || !rail) return
    const delta = e.clientX - drag.startX
    drag.moved = Math.max(drag.moved, Math.abs(delta))
    rail.scrollLeft = drag.startScroll - delta
  }

  const endDrag = () => {
    const rail = railRef.current
    if (rail) rail.classList.remove('ann-dragging')
    // Leave `moved` intact for one tick so the click handler can tell a drag
    // from a tap, then reset.
    dragRef.current.active = false
    window.setTimeout(() => {
      dragRef.current.moved = 0
    }, 0)
  }

  // --- detail --------------------------------------------------------------

  const openDetail = useCallback(
    async (index) => {
      // A drag that ends over a card must not count as opening it.
      if (dragRef.current.moved > 6) return

      const item = items[index]
      if (!item) return

      setOpenIndex(index)
      setDetail(null)
      setDetailError('')
      setAckError('')
      setCanAck(false)
      setDetailLoading(true)

      if (!seenRef.current.has(item._id)) {
        seenRef.current.add(item._id)
        if (onSeen) onSeen(item)
      }

      try {
        const full = await loadDetail(item)
        setDetail(full)
      } catch (e) {
        setDetailError(e.message || 'Could not load this announcement.')
      } finally {
        setDetailLoading(false)
      }
    },
    [items, loadDetail, onSeen],
  )

  const closeDetail = useCallback(() => {
    setOpenIndex(null)
    setDetail(null)
  }, [])

  const step = useCallback(
    (delta) => {
      if (openIndex === null) return
      const next = openIndex + delta
      if (next < 0 || next >= items.length) return
      setDirection(delta)
      scrollToIndex(next)
      openDetail(next)
    },
    [openIndex, items.length, openDetail, scrollToIndex],
  )

  // Acknowledge unlocks once the reader reaches the bottom — or immediately if
  // the content is short enough not to scroll. Images can change scrollHeight
  // after first paint, so this is re-checked shortly after render too.
  useEffect(() => {
    if (openIndex === null) return undefined
    const el = detailScrollRef.current
    if (!el) return undefined

    const check = () => {
      const fits = el.scrollHeight <= el.clientHeight + 8
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48
      setCanAck(fits || atBottom)
    }

    check()
    el.addEventListener('scroll', check, { passive: true })
    const timer = window.setTimeout(check, 500)
    return () => {
      el.removeEventListener('scroll', check)
      window.clearTimeout(timer)
    }
  }, [openIndex, detail, detailLoading])

  const acknowledge = async () => {
    const item = items[openIndex]
    if (!item) return
    setAcking(true)
    setAckError('')
    try {
      await onAcknowledge(item)
      // Move on if there is more to read, otherwise fall back to the deck.
      if (openIndex + 1 < items.length) step(1)
      else closeDetail()
    } catch (e) {
      setAckError(e.message || 'Could not record your confirmation. Please try again.')
    } finally {
      setAcking(false)
    }
  }

  // --- keyboard ------------------------------------------------------------

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (openIndex !== null) closeDetail()
        else if (dismissible) onClose()
        return
      }
      if (e.key === 'ArrowRight') {
        if (openIndex !== null) step(1)
        else scrollToIndex(Math.min(items.length - 1, activeIndex + 1))
      }
      if (e.key === 'ArrowLeft') {
        if (openIndex !== null) step(-1)
        else scrollToIndex(Math.max(0, activeIndex - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, dismissible, onClose, closeDetail, step, scrollToIndex, activeIndex, items.length])

  // --- render --------------------------------------------------------------

  const open = openIndex === null ? null : items[openIndex]
  const openAccent = open
    ? (open.category && open.category.color) || open.accent_color || '#7aa2ff'
    : '#7aa2ff'
  const needsAck = open && open.mode === 'mandatory' && !open.acknowledged

  const body = (
    <>
      <div className="ann-head">
        <div>
          <div className="ann-head-eyebrow">Zemen Bank</div>
          <h2>{heading}</h2>
          <div className="ann-head-sub">{subheading}</div>
          {mandatoryPending > 0 ? (
            <div className="mt-2">
              <span className="ann-required-pill">
                ⚠ {mandatoryPending} required{' '}
                {mandatoryPending === 1 ? 'announcement' : 'announcements'} to review
              </span>
            </div>
          ) : null}
        </div>

        {dismissible ? (
          <button type="button" className="ann-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        ) : null}
      </div>

      <div className="ann-stage">
        <button
          type="button"
          className="ann-nav ann-nav-prev"
          disabled={activeIndex <= 0}
          onClick={() => scrollToIndex(activeIndex - 1)}
          aria-label="Previous announcement"
        >
          ‹
        </button>

        <div
          className="ann-rail"
          ref={railRef}
          onScroll={scheduleP}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          {items.map((item, index) => (
            <AnnouncementCard
              key={item._id}
              item={item}
              cardRef={(el) => {
                cardEls.current[index] = el
              }}
              onOpen={() => openDetail(index)}
            />
          ))}
        </div>

        <button
          type="button"
          className="ann-nav ann-nav-next"
          disabled={activeIndex >= items.length - 1}
          onClick={() => scrollToIndex(activeIndex + 1)}
          aria-label="Next announcement"
        >
          ›
        </button>
      </div>

      {items.length > 1 ? (
        <div className="ann-dots">
          {items.map((item, index) => (
            <button
              type="button"
              key={item._id}
              className={`ann-dot${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="ann-dots" />
      )}
    </>
  )

  return (
    <>
      {variant === 'overlay' ? (
        <div className="ann-overlay">{body}</div>
      ) : (
        <div className="ann-embedded">{body}</div>
      )}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="ann-detail-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDetail()
            }}
          >
            <motion.div
              className="ann-detail"
              initial={{ opacity: 0, y: 42, scale: 0.965 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.975 }}
              transition={SPRING}
            >
              <button
                type="button"
                className="ann-detail-close"
                onClick={closeDetail}
                aria-label="Back to announcements"
              >
                ✕
              </button>

              <div className="ann-detail-hero">
                {open.cover_image ? (
                  <img src={open.cover_image} alt="" />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(150deg, ${openAccent}55, #0f172a 75%)`,
                    }}
                  />
                )}
                <div className="ann-detail-hero-scrim" />
                <div className="ann-detail-hero-body">
                  {open.category ? (
                    <span className="ann-chip" style={{ color: openAccent }}>
                      <span className="ann-chip-dot" />
                      <span style={{ color: '#fff' }}>{open.category.name}</span>
                    </span>
                  ) : null}
                  <h3>{open.title}</h3>
                </div>
              </div>

              <div className="ann-detail-scroll" ref={detailScrollRef}>
                <div className="ann-detail-meta">
                  <span>{fmtDate(open.publish_from || open.created_at)}</span>
                  {open.mode === 'mandatory' ? (
                    <span style={{ color: '#b45309', fontWeight: 600 }}>Required reading</span>
                  ) : null}
                  {open.acknowledged ? (
                    <span style={{ color: '#0f5132', fontWeight: 600 }}>
                      ✓ You confirmed this on {fmtDate(open.acknowledged_at)}
                    </span>
                  ) : null}
                  <span>
                    {openIndex + 1} of {items.length}
                  </span>
                </div>

                {open.summary ? (
                  <p style={{ fontSize: '1.03rem', color: '#374151', marginBottom: '1.1rem' }}>
                    {open.summary}
                  </p>
                ) : null}

                {detailLoading ? (
                  <div className="text-center py-4">
                    <CSpinner color="primary" />
                  </div>
                ) : detailError ? (
                  <div className="alert alert-warning mb-0">{detailError}</div>
                ) : (
                  <motion.div
                    key={open._id}
                    initial={{ opacity: 0, x: direction * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    <AnnouncementBlocks blocks={(detail && detail.blocks) || []} />
                    {detail && (!detail.blocks || detail.blocks.length === 0) ? (
                      <div className="text-medium-emphasis">
                        There is no further detail for this announcement.
                      </div>
                    ) : null}
                  </motion.div>
                )}

                {ackError ? (
                  <div className="alert alert-danger mt-3 mb-0 py-2">{ackError}</div>
                ) : null}
              </div>

              <div className="ann-detail-foot">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="ann-detail-step"
                    disabled={openIndex <= 0}
                    onClick={() => step(-1)}
                  >
                    ‹ Previous
                  </button>
                  <button
                    type="button"
                    className="ann-detail-step"
                    disabled={openIndex >= items.length - 1}
                    onClick={() => step(1)}
                  >
                    Next ›
                  </button>
                </div>

                {needsAck ? (
                  <div className="d-flex align-items-center gap-2">
                    {!canAck ? (
                      <span className="small text-medium-emphasis">
                        Scroll to the end to confirm
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!canAck || acking}
                      onClick={acknowledge}
                    >
                      {acking ? 'Saving…' : 'I have read and understood'}
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-secondary" onClick={closeDetail}>
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

AnnouncementShowcase.propTypes = {
  items: PropTypes.array.isRequired,
  variant: PropTypes.oneOf(['overlay', 'embedded']),
  // Resolves an item to its full document (including blocks).
  loadDetail: PropTypes.func.isRequired,
  onSeen: PropTypes.func,
  onAcknowledge: PropTypes.func.isRequired,
  // Omit to make the deck permanently non-dismissible.
  onClose: PropTypes.func,
  heading: PropTypes.string,
  subheading: PropTypes.string,
}

export default AnnouncementShowcase
