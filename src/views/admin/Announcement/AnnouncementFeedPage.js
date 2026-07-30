import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { CCard, CCardBody, CSpinner, CAlert, CButton } from '@coreui/react'
import AnnouncementShowcase from '../../../components/announcement/AnnouncementShowcase'
import {
  fetchAnnouncementFeed,
  fetchAnnouncementItem,
  fetchAnnouncementCategories,
  markAnnouncementSeen,
  acknowledgeAnnouncement,
} from '../../../api/announcement'

// The employee's Announcements page. Same deck component as the post-login
// overlay, embedded and always dismissible, plus category filtering.
//
// Unlike the overlay this shows everything published — including announcements
// flagged "page only" — so nothing is reachable solely through a screen the
// employee may have already closed.

const AnnouncementFeedPage = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchAnnouncementFeed({ accessToken, loginOnly: false })
      setItems(result.data || [])
    } catch (e) {
      setError(e.message || 'Could not load announcements.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    fetchAnnouncementCategories({ accessToken })
      .then((r) => setCategories(r.data || []))
      .catch(() => setCategories([]))
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

  // Filtering client-side: the feed is already capped and the whole point of
  // the chips is instant response.
  const visible = useMemo(() => {
    if (!activeCategory) return items
    return items.filter((i) => i.category && String(i.category._id) === String(activeCategory))
  }, [items, activeCategory])

  // Only offer chips for categories that actually have something in them.
  const usedCategories = useMemo(() => {
    const present = new Set(items.filter((i) => i.category).map((i) => String(i.category._id)))
    return categories.filter((c) => present.has(String(c._id)))
  }, [categories, items])

  const pending = items.filter((i) => i.mode === 'mandatory' && !i.acknowledged).length

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      {error ? <CAlert color="danger">{error}</CAlert> : null}

      {usedCategories.length > 0 ? (
        <CCard className="mb-3">
          <CCardBody className="d-flex flex-wrap align-items-center gap-2">
            <span className="small text-medium-emphasis me-1">Filter</span>
            <CButton
              size="sm"
              color={activeCategory === '' ? 'primary' : 'secondary'}
              variant={activeCategory === '' ? undefined : 'outline'}
              onClick={() => setActiveCategory('')}
            >
              All ({items.length})
            </CButton>
            {usedCategories.map((c) => {
              const count = items.filter(
                (i) => i.category && String(i.category._id) === String(c._id),
              ).length
              const active = String(activeCategory) === String(c._id)
              return (
                <CButton
                  key={c._id}
                  size="sm"
                  variant={active ? undefined : 'outline'}
                  style={
                    active
                      ? { background: c.color || '#0d6efd', borderColor: c.color, color: '#fff' }
                      : { borderColor: c.color || '#0d6efd', color: c.color || '#0d6efd' }
                  }
                  onClick={() => setActiveCategory(c._id)}
                >
                  {c.name} ({count})
                </CButton>
              )
            })}
          </CCardBody>
        </CCard>
      ) : null}

      {items.length === 0 ? (
        <CCard>
          <CCardBody className="text-center py-5 text-medium-emphasis">
            <div style={{ fontSize: '2rem' }}>📭</div>
            <h5 className="mt-3 mb-1">No announcements right now</h5>
            <p className="mb-0">Anything HR publishes will appear here.</p>
          </CCardBody>
        </CCard>
      ) : visible.length === 0 ? (
        <CAlert color="info">Nothing in this category. Choose another filter.</CAlert>
      ) : (
        <AnnouncementShowcase
          items={visible}
          variant="embedded"
          loadDetail={loadDetail}
          onSeen={handleSeen}
          onAcknowledge={handleAcknowledge}
          heading="Announcements"
          subheading={
            pending > 0
              ? `${pending} still need${pending === 1 ? 's' : ''} your confirmation`
              : 'Drag, scroll or use ← → to browse. Click a card to read it.'
          }
        />
      )}
    </>
  )
}

export default AnnouncementFeedPage
