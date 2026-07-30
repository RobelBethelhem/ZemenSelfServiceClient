import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  fetchAnnouncementFeed,
  fetchAnnouncementItem,
  markAnnouncementSeen,
  acknowledgeAnnouncement,
} from '../api/announcement'

// Mounted once by DefaultLayout. Renders nothing at all unless there is
// something the signed-in employee has not yet seen, so it is invisible on
// every page load after the first.
//
// Fails silent by design: if the feed cannot be reached the portal behaves
// exactly as it did before announcements existed. An announcement screen is
// never worth blocking someone out of the letter flow for.

// Loaded on demand. This gate is mounted by DefaultLayout on every
// authenticated page, and the deck pulls in framer-motion and the announcement
// stylesheet — around 140 KB that most page loads never need, because the
// overlay only appears once per session.
const AnnouncementShowcase = lazy(() => import('./announcement/AnnouncementShowcase'))

const DISMISS_KEY = 'zbss.announcements.dismissed'

// Dismissals live in sessionStorage, so the deck returns on the next sign-in —
// that is the "first screen after login" behaviour HR asked for. Ids are
// tracked individually rather than with a single flag, so an announcement
// published mid-session still surfaces instead of being swallowed by an
// earlier dismissal.
const readDismissed = () => {
  try {
    const raw = window.sessionStorage.getItem(DISMISS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch (e) {
    return new Set()
  }
}

const writeDismissed = (ids) => {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, JSON.stringify(Array.from(ids)))
  } catch (e) {
    /* private mode or storage full — the deck simply reappears */
  }
}

const AnnouncementGate = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [items, setItems] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false

    fetchAnnouncementFeed({ accessToken, loginOnly: true })
      .then((result) => {
        if (cancelled) return
        const rows = result.data || []
        if (!rows.length) return

        const dismissed = readDismissed()
        const hasPendingMandatory = rows.some((r) => r.mode === 'mandatory' && !r.acknowledged)
        const hasUnseen = rows.some((r) => !dismissed.has(r._id))

        // A required announcement reopens even if the deck was dismissed
        // earlier in this session — it is not done until it is acknowledged.
        if (hasPendingMandatory || hasUnseen) {
          setItems(rows)
          setVisible(true)
        }
      })
      .catch((e) => {
        console.warn('[announcements] feed unavailable:', e.message)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken])

  const loadDetail = useCallback(
    async (item) => {
      const result = await fetchAnnouncementItem({ accessToken, id: item._id })
      return result.data
    },
    [accessToken],
  )

  const handleSeen = useCallback(
    (item) => {
      // Telemetry only — never allowed to interrupt reading.
      markAnnouncementSeen({ accessToken, id: item._id }).catch(() => {})
    },
    [accessToken],
  )

  const handleAcknowledge = useCallback(
    async (item) => {
      const result = await acknowledgeAnnouncement({ accessToken, id: item._id })
      setItems((prev) =>
        prev.map((row) =>
          row._id === item._id
            ? {
                ...row,
                acknowledged: true,
                acknowledged_at: result.acknowledged_at || new Date().toISOString(),
              }
            : row,
        ),
      )
    },
    [accessToken],
  )

  const handleClose = useCallback(() => {
    const dismissed = readDismissed()
    items.forEach((i) => dismissed.add(i._id))
    writeDismissed(dismissed)
    setVisible(false)
  }, [items])

  if (!visible || items.length === 0) return null

  const pending = items.filter((i) => i.mode === 'mandatory' && !i.acknowledged).length

  return (
    // No fallback: a blank frame while the chunk arrives is better than a
    // spinner flashing over the page the employee just landed on.
    <Suspense fallback={null}>
      <AnnouncementShowcase
        items={items}
        variant="overlay"
        loadDetail={loadDetail}
        onSeen={handleSeen}
        onAcknowledge={handleAcknowledge}
        onClose={handleClose}
        heading={pending > 0 ? 'Before you continue' : 'What’s new'}
        subheading={
          items.length === 1
            ? 'One announcement for you'
            : `${items.length} announcements · swipe, scroll or use ← → to browse`
        }
      />
    </Suspense>
  )
}

export default AnnouncementGate
