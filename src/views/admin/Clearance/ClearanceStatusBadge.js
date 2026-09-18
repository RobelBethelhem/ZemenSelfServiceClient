import React from 'react'
import PropTypes from 'prop-types'
import { CBadge } from '@coreui/react'
import { STATUS_META, TASK_STATUS_META } from './clearanceContent'

// Colour-coded status pill for a clearance or for one row on it.
const ClearanceStatusBadge = ({ status, task = false, title }) => {
  const meta = (task ? TASK_STATUS_META : STATUS_META)[status] || { color: 'secondary', text: '' }
  return (
    <CBadge
      color={meta.color}
      title={title || meta.text}
      style={meta.color === 'light' ? { color: '#444' } : undefined}
    >
      {status}
    </CBadge>
  )
}

ClearanceStatusBadge.propTypes = {
  status: PropTypes.string,
  task: PropTypes.bool,
  title: PropTypes.string,
}

export default ClearanceStatusBadge
