import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import ServiceRatingModal from './ServiceRatingModal'
import { fetchRatingStatus, submitRating } from '../api/serviceRating'

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

  // Refs, not state: `gate` must read the freshest value inside a click
  // handler without re-creating every consumer's onClick.
  const checkedRef = useRef(false)
  const ratedRef = useRef(false)
  const pendingActionRef = useRef(null)

  const readStatus = useCallback(async () => {
    if (checkedRef.current) return ratedRef.current
    try {
      const result = await fetchRatingStatus({ accessToken, requestId, requestType })
      ratedRef.current = !!result.rated
    } catch (e) {
      // Fail open — see the note above.
      console.warn('[service-rating] status check failed, allowing action:', e.message)
      ratedRef.current = true
    }
    checkedRef.current = true
    return ratedRef.current
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

        const alreadyRated = await readStatus()
        if (alreadyRated) return action(...args)

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
      letterLabel={letterLabel}
      referenceNumber={referenceNumber}
      actionLabel={actionLabel}
    />
  ) : null

  return { gate, ratingModal, enabled }
}

export default useServiceRatingGate
