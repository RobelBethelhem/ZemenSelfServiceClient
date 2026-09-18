import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CAlert, CSpinner, CNav, CNavItem, CNavLink } from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api } from './clearanceApi'
import UnitMembersPanel from './UnitMembersPanel'

// For unit heads: the branch or department they were appointed to, and the
// people they register under it. HR appoints heads; heads register everyone
// else — the delegation that keeps 2,500 employees mappable.
const ClearanceMyUnit = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [units, setUnits] = useState(null)
  const [active, setActive] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    api(token, '/units/mine')
      .then((r) => setUnits(r.data || []))
      .catch((e) => setError(e.message))
  }, [token])

  return (
    <>
      <ToastContainer position="top-right" />
      <h4 className="mb-1">My Unit</h4>
      <p className="text-medium-emphasis mb-3">
        Register the people who report to you. This is what tells the clearance system who each
        person&apos;s immediate supervisor is, and who may sign your unit&apos;s row.
      </p>
      {error && <CAlert color="danger">{error}</CAlert>}
      {!units && !error && <CSpinner />}
      {units && units.length === 0 && (
        <CAlert color="light">
          You are not currently appointed as the head of any unit. If you should be, ask HR to
          appoint you under <em>Clearance → Units &amp; Heads</em>.
        </CAlert>
      )}
      {units && units.length > 1 && (
        <CNav variant="tabs" className="mb-3">
          {units.map((u, i) => (
            <CNavItem key={u._id}>
              <CNavLink
                active={active === i}
                onClick={() => setActive(i)}
                style={{ cursor: 'pointer' }}
              >
                {u.name}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>
      )}
      {units && units[active] && <UnitMembersPanel token={token} unit={units[active]} canEdit />}
    </>
  )
}

export default ClearanceMyUnit
