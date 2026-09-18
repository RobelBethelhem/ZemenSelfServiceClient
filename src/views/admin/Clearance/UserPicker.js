import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { CFormInput, CListGroup, CListGroupItem, CSpinner } from '@coreui/react'
import { api } from './clearanceApi'

// Type-ahead over portal users, returning an AD username. Used wherever a
// screen needs "who": appointing a unit head, registering staff, reassigning
// a row, naming the CEO. Searches name and username after two characters.
const UserPicker = ({
  token,
  value,
  displayName,
  onChange,
  placeholder = 'Type a name or username…',
  disabled = false,
  size,
}) => {
  const [text, setText] = useState(displayName || value || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef(null)
  const box = useRef(null)

  useEffect(() => {
    setText(displayName || value || '')
  }, [value, displayName])

  useEffect(() => {
    const onDoc = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const search = (q) => {
    clearTimeout(timer.current)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    timer.current = setTimeout(async () => {
      setBusy(true)
      try {
        const r = await api(token, `/users/search?q=${encodeURIComponent(q.trim())}`)
        setResults(r.data || [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setBusy(false)
      }
    }, 250)
  }

  return (
    <div ref={box} style={{ position: 'relative' }}>
      <CFormInput
        size={size}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setText(e.target.value)
          if (!e.target.value) onChange({ user: '', name: '' })
          search(e.target.value)
        }}
        onFocus={() => results.length && setOpen(true)}
      />
      {busy && <CSpinner size="sm" style={{ position: 'absolute', right: 10, top: 10 }} />}
      {open && results.length > 0 && (
        <CListGroup
          style={{
            position: 'absolute',
            zIndex: 1050,
            width: '100%',
            maxHeight: 240,
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          }}
        >
          {results.map((r) => (
            <CListGroupItem
              key={r.user}
              component="button"
              type="button"
              onClick={() => {
                onChange({ user: r.user, name: r.name })
                setText(r.name ? `${r.name} (${r.user})` : r.user)
                setOpen(false)
              }}
            >
              <strong>{r.name || r.user}</strong>{' '}
              <span className="text-medium-emphasis">{r.user}</span>
            </CListGroupItem>
          ))}
        </CListGroup>
      )}
      {value && (
        <small className="text-medium-emphasis">
          Selected: <code>{value}</code>
        </small>
      )}
    </div>
  )
}

UserPicker.propTypes = {
  token: PropTypes.string,
  value: PropTypes.string,
  displayName: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.string,
}

export default UserPicker
