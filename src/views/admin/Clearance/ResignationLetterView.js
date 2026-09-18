import React from 'react'
import PropTypes from 'prop-types'

// The resignation letter, laid out like a letter: date at the top right, the
// addressee block, a bold underlined subject, the body, and the signature.
// Renders the structured parts the server produced; falls back to the plain
// text for records written before the parts existed.
const ResignationLetterView = ({ parts, text, compact = false }) => {
  const font = { fontFamily: 'Calibri, "Times New Roman", Times, serif', color: '#000' }
  if (!parts) {
    return (
      <pre
        style={{
          ...font,
          whiteSpace: 'pre-wrap',
          fontSize: compact ? 13 : 14,
          background: '#fafafa',
          border: '1px solid #eee',
          padding: 16,
        }}
      >
        {text}
      </pre>
    )
  }
  const size = compact ? 13 : 14.5
  return (
    <div
      style={{
        ...font,
        fontSize: size,
        lineHeight: 1.55,
        background: '#fff',
        border: '1px solid #e5e5e5',
        padding: compact ? '18px 22px' : '28px 36px',
        maxWidth: 760,
      }}
    >
      <div style={{ textAlign: 'right', marginBottom: 18 }}>
        <strong>Date:</strong> {parts.date}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div>
          <strong>To:</strong> {parts.to[0]}
        </div>
        {parts.to.slice(1).map((l) => (
          <div key={l} style={{ paddingLeft: 26 }}>
            {l}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <strong>Subject: </strong>
        <strong style={{ textDecoration: 'underline' }}>{parts.subject}</strong>
      </div>

      <div style={{ marginBottom: 12 }}>{parts.salutation}</div>

      {parts.paragraphs.map((p, i) => (
        <p key={i} style={{ textAlign: 'justify', marginBottom: 12 }}>
          {p}
        </p>
      ))}

      <div style={{ marginTop: 22, marginBottom: 26 }}>{parts.closing}</div>
      {parts.signature.map((l, i) => (
        <div key={i} style={i === 0 ? { fontWeight: 'bold' } : undefined}>
          {l}
        </div>
      ))}
    </div>
  )
}

ResignationLetterView.propTypes = {
  parts: PropTypes.shape({
    date: PropTypes.string,
    to: PropTypes.arrayOf(PropTypes.string),
    subject: PropTypes.string,
    salutation: PropTypes.string,
    paragraphs: PropTypes.arrayOf(PropTypes.string),
    closing: PropTypes.string,
    signature: PropTypes.arrayOf(PropTypes.string),
  }),
  text: PropTypes.string,
  compact: PropTypes.bool,
}

export default ResignationLetterView
