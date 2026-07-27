import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import ServiceRatingModal from './ServiceRatingModal'
import { fetchRatingStatus, submitRating, declineRating } from '../api/serviceRating'

// Gates the FIRST print/download of an approved letter behind the service
// rating survey.
//
// Usage inside a letter render view — two lines and a wrapper:
//
//   const { gate, ratingModal } = useServiceRatingGate({
//     rowData, requestType: 'Experience', letterLabel: 'Experience Letter',
//   })
//   <button onClick={gate(handlePrint, 'print')}>Print</button>
//   <button onClick={gate(handleDownload, 'download')}>Download as PDF</button>
//   {ratingModal}
//
// Call it BEFORE any early `if (!rowData) return` in the component — the hook
// tolerates a missing rowData, but React does not tolerate a hook that only
// runs on some renders.
//
// Deliberately fails OPEN. If the status check errors — old backend without
// the /service-rating route, network blip, expired session — the letter still
// prints. Blocking a bank letter because a survey endpoint is unreachable
// would be a worse outcome than missing one rating.
const useServiceRatingGate = ({ rowData, requestType, letterLabel }) => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const userRole = useSelector((state) => state.user.role)

  const requestId = rowData ? rowData.id || rowData._id : null
  const referenceNumber = (rowData && rowData.reference_number) || ''
  const status = (rowData && rowData.status) || ''

  // Admins printing someone else's letter are not the service recipient, and
  // only an issued ("Viewed") letter represents a completed service.
  const enabled = Boolean(
    userRole === 'user' && requestId && requestType && accessToken && status === 'Viewed',
  )

  const [open, setOpen] = useState(false)
  const [actionLabel, setActionLabel] = useState('print')
  // Resolved from the admin's policy for this letter type. Drives whether the
  // user is asked at all ("optional"), forced ("mandatory"), or left alone
  // ("disabled"). Held in state as well as a ref because the modal renders it.
  const [mode, setMode] = useState('mandatory')

  // Refs, not state: `gate` must read the freshest value inside a click
  // handler without re-creating every consumer's onClick.
  const checkedRef = useRef(false)
  const ratedRef = useRef(false)
  const modeRef = useRef('mandatory')
  const pendingActionRef = useRef(null)

  const readStatus = useCallback(async () => {
    if (checkedRef.current) return { rated: ratedRef.current, mode: modeRef.current }
    try {
      const result = await fetchRatingStatus({ accessToken, requestId, requestType })
      ratedRef.current = !!result.rated
      // An unrecognised mode from a newer backend must not hard-block a
      // print, so anything unexpected degrades to "no survey".
      const resolved = ['mandatory', 'optional', 'disabled'].includes(result.mode)
        ? result.mode
        : 'disabled'
      modeRef.current = resolved
      setMode(resolved)
    } catch (e) {
      // Fail open — see the note above.
      console.warn('[service-rating] status check failed, allowing action:', e.message)
      ratedRef.current = true
    }
    checkedRef.current = true
    return { rated: ratedRef.current, mode: modeRef.current }
  }, [accessToken, requestId, requestType])

  // Warm the answer up front so the common case (already rated, or first
  // rating) does not pay a round-trip on the click itself.
  useEffect(() => {
    if (!enabled) return
    checkedRef.current = false
    ratedRef.current = false
    readStatus()
  }, [enabled, readStatus])

  const gate = useCallback(
    (action, label = 'print') =>
      async (...args) => {
        if (!enabled) return action(...args)

        const { rated, mode: resolved } = await readStatus()
        // Already answered (rated OR declined), or the admin switched the
        // survey off for this letter type — either way, do not interrupt.
        if (rated || resolved === 'disabled') return action(...args)

        pendingActionRef.current = () => action(...args)
        setActionLabel(label)
        setOpen(true)
        return undefined
      },
    [enabled, readStatus],
  )

  const handleSubmit = useCallback(
    async (answers) => {
      await submitRating({ accessToken, requestId, requestType, answers })
      ratedRef.current = true
      checkedRef.current = true
    },
    [accessToken, requestId, requestType],
  )

  // Recording the decline is what stops the user being re-asked on a reprint.
  // If it fails we still let them through — the print is what they came for.
  const handleDecline = useCallback(async () => {
    try {
      await declineRating({ accessToken, requestId, requestType })
    } catch (e) {
      console.warn('[service-rating] decline could not be recorded:', e.message)
    }
    ratedRef.current = true
    checkedRef.current = true
  }, [accessToken, requestId, requestType])

  // Survey done -> close and release the print/download that was held back.
  const handleComplete = useCallback(() => {
    setOpen(false)
    const pending = pendingActionRef.current
    pendingActionRef.current = null
    if (pending) {
      // Next tick, so the modal is fully unmounted before html2canvas walks
      // the DOM — a backdrop still in the tree ends up in the snapshot.
      window.setTimeout(pending, 120)
    }
  }, [])

  // Dismissed without submitting: no rating, and no print either.
  const handleClose = useCallback(() => {
    pendingActionRef.current = null
    setOpen(false)
  }, [])

  const ratingModal = enabled ? (
    <ServiceRatingModal
      visible={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onComplete={handleComplete}
      onDecline={handleDecline}
      letterLabel={letterLabel}
      referenceNumber={referenceNumber}
      actionLabel={actionLabel}
      mode={mode}
    />
  ) : null

  return { gate, ratingModal, enabled }
}

export default useServiceRatingGate
