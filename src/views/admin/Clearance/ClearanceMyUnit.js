import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { CCard, CCardBody, CCardHeader, CAlert, CSpinner, CBadge, CButton } from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api } from './clearanceApi'
import OrgTreePanel from './OrgTreePanel'
import UserPicker from './UserPicker'

// My Team: where I sit in the reporting tree, who my immediate supervisor is
// (all the way up), and — if my role manages — the people beneath me, which I
// can build out level by level. HR can look anyone up and edit anywhere.
const Chain = ({ chain }) =>
  chain.length ? (
    <div className="d-flex align-items-center flex-wrap" style={{ gap: 6 }}>
      {chain.map((c, i) => (
        <React.Fragment key={c.user}>
          {i > 0 && <span className="text-medium-emphasis">→</span>}
          <span>
            <strong>{c.name}</strong>
            {c.role ? <small className="text-medium-emphasis"> {c.role}</small> : null}
            {c.unit_name ? <small className="text-medium-emphasis"> · {c.unit_name}</small> : null}
          </span>
        </React.Fragment>
      ))}
    </div>
  ) : (
    <span className="text-danger">no supervisor mapped — HR acts at the supervisor stage</span>
  )
Chain.propTypes = {
  chain: (p, n) => (Array.isArray(p[n]) ? null : new Error(`${n} must be an array`)),
}

const ClearanceMyUnit = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [lookupUser, setLookupUser] = useState('')
  const [lookup, setLookup] = useState(null)

  const load = useCallback(async () => {
    try {
      setData(await api(token, '/org/me'))
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const doLookup = useCallback(
    async (user) => {
      if (!user) return
      try {
        setLookup(await api(token, `/org/tree/${encodeURIComponent(user)}`))
      } catch (e) {
        toast.error(e.message)
      }
    },
    [token],
  )

  return (
    <>
      <ToastContainer position="top-right" />
      <h4 className="mb-1">My Team</h4>
      <p className="text-medium-emphasis mb-3">
        Your place in the reporting line, and the people you register beneath you. The immediate
        supervisor on every exit clearance comes from here.
      </p>
      {error && <CAlert color="danger">{error}</CAlert>}
      {!data && !error && <CSpinner />}

      {data && (
        <>
          <CCard className="mb-3">
            <CCardBody>
              <div className="mb-2">
                <strong>{data.me.name}</strong>{' '}
                <small className="text-medium-emphasis">{data.me.user}</small>{' '}
                {data.me.node ? (
                  <>
                    <CBadge color="primary" className="ms-1">
                      {data.me.node.role}
                    </CBadge>{' '}
                    <CBadge
                      color={data.me.node.unit_kind === 'branch' ? 'info' : 'light'}
                      style={data.me.node.unit_kind === 'branch' ? undefined : { color: '#444' }}
                    >
                      {data.me.node.unit_kind === 'branch' ? `${data.me.node.unit_code} · ` : ''}
                      {data.me.node.unit_name}
                    </CBadge>
                  </>
                ) : data.heads_units.length ? (
                  <CBadge color="primary" className="ms-1">
                    head of {data.heads_units.map((u) => u.name).join(', ')}
                  </CBadge>
                ) : (
                  <CBadge color="warning" className="ms-1">
                    not registered in the tree
                  </CBadge>
                )}
              </div>
              <div>
                <span className="text-medium-emphasis me-2">Your immediate supervisor:</span>
                <Chain chain={data.chain} />
              </div>
            </CCardBody>
          </CCard>

          {data.manages ? (
            <CCard className="mb-3">
              <CCardHeader>
                <strong>People beneath you</strong>
                <small className="text-medium-emphasis ms-2">
                  Use <em>Add under</em> on yourself or on any manager beneath you. Managers you
                  register can build their own level in turn.
                </small>
              </CCardHeader>
              <CCardBody>
                <OrgTreePanel
                  token={token}
                  tree={data.tree}
                  roles={data.roles}
                  units={data.units}
                  isAdmin={data.me.is_admin}
                  onChanged={load}
                />
              </CCardBody>
            </CCard>
          ) : (
            <CAlert color="light">
              Your role does not register people. If it should, ask your manager or HR to change
              your role.
            </CAlert>
          )}

          {data.me.is_admin && (
            <CCard>
              <CCardHeader>
                <strong>Look anyone up</strong>
                <small className="text-medium-emphasis ms-2">
                  reporting line and the tree beneath them
                </small>
              </CCardHeader>
              <CCardBody>
                <div className="d-flex align-items-start" style={{ gap: 8, maxWidth: 560 }}>
                  <div style={{ flex: 1 }}>
                    <UserPicker
                      token={token}
                      value={lookupUser}
                      onChange={({ user }) => {
                        setLookupUser(user)
                        if (user) doLookup(user)
                      }}
                    />
                  </div>
                  <CButton
                    color="secondary"
                    variant="outline"
                    disabled={!lookupUser}
                    onClick={() => doLookup(lookupUser)}
                  >
                    Refresh
                  </CButton>
                </div>
                {lookup && (
                  <div className="mt-3">
                    <div className="mb-2">
                      <span className="text-medium-emphasis me-2">
                        Reporting line of {lookup.tree.name}:
                      </span>
                      <Chain chain={lookup.chain} />
                    </div>
                    <OrgTreePanel
                      token={token}
                      tree={lookup.tree}
                      roles={lookup.roles}
                      units={lookup.units}
                      isAdmin
                      onChanged={() => doLookup(lookupUser)}
                    />
                  </div>
                )}
              </CCardBody>
            </CCard>
          )}
        </>
      )}
    </>
  )
}

export default ClearanceMyUnit
