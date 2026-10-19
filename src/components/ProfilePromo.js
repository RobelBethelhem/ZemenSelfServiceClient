import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchProfilePromo, trackProfileEvent } from '../api/profile'
import './profilePromo/profilePromo.css'

// "New feature" campaign for My Profile, mounted once by DefaultLayout.
//
// Until an employee has opened My Profile once, the sidebar entry blinks with a
// NEW badge (AppSidebar reads useProfileIsNew) and this card pops up beside it
// after sign-in. "Maybe later" hides the card for the rest of the session; it
// comes back at the next sign-in. Opening the profile ends both for good — the
// server records the visit, so it holds on every device.

const PROFILE_PATH = '/user/profile'
const SHOWN_KEY = 'zbss.profilePromo.shown'
const DISMISSED_KEY = 'zbss.profilePromo.dismissed'

// ---------------------------------------------------------------------------
// Shared state: one request per sign-in feeds the sidebar and the pop-up.
// ---------------------------------------------------------------------------

let promoState = { ready: false, opened: true } // nothing blinks until we know
let loadedFor = null
let openedHere = false
const listeners = new Set()

const setPromoState = (next) => {
  promoState = next
  listeners.forEach((fn) => fn(next))
}

const loadPromo = (accessToken) => {
  if (!accessToken || loadedFor === accessToken) return
  loadedFor = accessToken
  openedHere = false
  fetchProfilePromo({ accessToken })
    // A profile opened while this was in flight wins over a stale "not yet".
    .then((r) => setPromoState({ ready: true, opened: openedHere || !!r.opened }))
    // Fail quiet: no blink and no pop-up is the safe default.
    .catch(() => setPromoState({ ready: true, opened: true }))
}

// Called by My Profile once the record has loaded.
export const markProfileOpened = () => {
  openedHere = true
  if (!promoState.opened) setPromoState({ ready: true, opened: true })
}

export const useProfileIsNew = () => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const [state, setState] = useState(promoState)

  useEffect(() => {
    listeners.add(setState)
    setState(promoState)
    return () => listeners.delete(setState)
  }, [])

  useEffect(() => {
    loadPromo(accessToken)
  }, [accessToken])

  return state.ready && !state.opened
}

// ---------------------------------------------------------------------------
// The pop-up
// ---------------------------------------------------------------------------

const readSession = (key) => {
  try {
    return window.sessionStorage.getItem(key)
  } catch (e) {
    return null
  }
}

const writeSession = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value)
  } catch (e) {
    /* storage blocked — the card may simply appear again on the next page */
  }
}

const GAP = 14
const EDGE = 12

// Beside the sidebar entry when it is on screen; otherwise (phone, hidden
// sidebar) a card floating at the bottom of the screen.
const placementFor = (card) => {
  const link = document.querySelector(`.sidebar-nav a[href$="#${PROFILE_PATH}"]`)
  const rect = link && link.getBoundingClientRect()
  const onScreen =
    rect &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.right > 0 &&
    rect.left < window.innerWidth &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    window.innerWidth >= 768
  if (!onScreen) return null

  const height = (card && card.offsetHeight) || 300
  const centre = rect.top + rect.height / 2
  const top = Math.min(Math.max(EDGE, centre - 46), window.innerHeight - height - EDGE)
  return {
    left: rect.right + GAP,
    top,
    arrowTop: Math.min(Math.max(18, centre - top), height - 18),
  }
}

const sameSpot = (a, b) =>
  a === b ||
  (a &&
    b &&
    Math.round(a.left) === Math.round(b.left) &&
    Math.round(a.top) === Math.round(b.top) &&
    Math.round(a.arrowTop) === Math.round(b.arrowTop))

const IdIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <circle cx="9" cy="11" r="2.4" />
    <path d="M5.8 16.4c.6-1.7 1.8-2.6 3.2-2.6s2.6.9 3.2 2.6" />
    <path d="M14.5 10h4M14.5 13.5h3" />
  </svg>
)

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
)

const FEATURES = [
  'Personal and employment details',
  'Education, certifications and training',
  'Your career at Zemen Bank',
  'Your current salary — hidden until you choose to show it',
]

const ProfilePromo = () => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const isNew = useProfileIsNew()
  const location = useLocation()
  const navigate = useNavigate()

  const [dismissed, setDismissed] = useState(() => readSession(DISMISSED_KEY) === '1')
  const [visible, setVisible] = useState(false)
  const [spot, setSpot] = useState(null)
  const cardRef = useRef(null)

  const eligible = isNew && !dismissed && location.pathname !== PROFILE_PATH

  // Waits for the announcement deck to be out of the way, then pops up after a
  // beat so it reads as a separate, deliberate prompt.
  useEffect(() => {
    if (!eligible) {
      setVisible(false)
      return undefined
    }
    let timer = null
    const tryShow = () => {
      if (document.querySelector('.ann-overlay')) {
        timer = setTimeout(tryShow, 1000)
        return
      }
      setVisible(true)
    }
    timer = setTimeout(tryShow, 1200)
    return () => clearTimeout(timer)
  }, [eligible])

  useEffect(() => {
    if (!visible || readSession(SHOWN_KEY) === '1') return
    writeSession(SHOWN_KEY, '1')
    trackProfileEvent({ accessToken, event: 'promo_shown' })
  }, [visible, accessToken])

  // The sidebar can scroll, fold or slide away, so the card re-checks where its
  // anchor is a few times a second while it is open.
  useEffect(() => {
    if (!visible) return undefined
    const place = () => {
      const next = placementFor(cardRef.current)
      setSpot((prev) => (sameSpot(prev, next) ? prev : next))
    }
    place()
    const id = setInterval(place, 400)
    window.addEventListener('resize', place)
    return () => {
      clearInterval(id)
      window.removeEventListener('resize', place)
    }
  }, [visible])

  const dismiss = () => {
    setDismissed(true)
    writeSession(DISMISSED_KEY, '1')
    setVisible(false)
    trackProfileEvent({ accessToken, event: 'promo_dismiss' })
  }

  const openProfile = () => {
    trackProfileEvent({ accessToken, event: 'promo_click' })
    // Engaged: no need to ask again this session, even if HRIS is slow to load.
    setDismissed(true)
    writeSession(DISMISSED_KEY, '1')
    setVisible(false)
    navigate(PROFILE_PATH)
  }

  useEffect(() => {
    if (!visible) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  if (!visible) return null

  return (
    <div
      ref={cardRef}
      className={`zb-promo${spot ? ' is-anchored' : ' is-floating'}`}
      style={spot ? { left: spot.left, top: spot.top } : undefined}
      role="dialog"
      aria-labelledby="zb-promo-title"
      aria-describedby="zb-promo-body"
      data-html2canvas-ignore="true"
    >
      {spot ? <span className="zb-promo-arrow" style={{ top: spot.arrowTop }} /> : null}
      <button type="button" className="zb-promo-close" aria-label="Close" onClick={dismiss}>
        ×
      </button>

      <div className="zb-promo-head">
        <span className="zb-promo-icon">
          <IdIcon />
        </span>
        <div>
          <span className="zb-promo-new">New</span>
          <h2 id="zb-promo-title" className="zb-promo-title">
            Meet My Profile
          </h2>
        </div>
      </div>

      <p id="zb-promo-body" className="zb-promo-body">
        Your complete HR record in one place, read live from HRIS.
      </p>

      <ul className="zb-promo-features">
        {FEATURES.map((text) => (
          <li key={text}>
            <span className="zb-promo-check">
              <CheckIcon />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div className="zb-promo-actions">
        <button type="button" className="zb-promo-primary" onClick={openProfile}>
          View my profile <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="zb-promo-later" onClick={dismiss}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

export default ProfilePromo
