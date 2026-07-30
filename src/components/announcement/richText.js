import React from 'react'

// Inline formatting for announcement text blocks, parsed straight into React
// nodes.
//
// Deliberately NOT HTML. There is no dangerouslySetInnerHTML anywhere in the
// announcement renderer, so if an admin pastes `<script>alert(1)</script>` into
// a text block it is displayed as those literal characters. Link hrefs can only
// be http(s) because the pattern that recognises them requires that prefix —
// `javascript:` never matches, so it can never reach an anchor.
//
// Supported: **bold**, __bold__, *italic*, _italic_, `code`,
// [label](https://url). Single newlines become <br>, blank lines start a new
// paragraph.

const buildPattern = () =>
  new RegExp(
    [
      '\\*\\*[\\s\\S]+?\\*\\*',
      '__[\\s\\S]+?__',
      '\\*[^*\\n]+?\\*',
      '_[^_\\n]+?_',
      '`[^`\\n]+?`',
      '\\[[^\\]\\n]+?\\]\\(https?://[^\\s)]+\\)',
    ].join('|'),
    'g',
  )

const renderInline = (text, keyPrefix) => {
  const nodes = []
  // Created per call rather than shared at module scope, so a nested render
  // can never inherit a stale lastIndex.
  const pattern = buildPattern()
  let cursor = 0
  let seq = 0
  let match = pattern.exec(text)

  while (match !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index))

    const token = match[0]
    seq += 1
    const key = `${keyPrefix}-${seq}`

    if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="ann-inline-code">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('[')) {
      const close = token.indexOf('](')
      const label = token.slice(1, close)
      const href = token.slice(close + 2, -1)
      nodes.push(
        <a key={key} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>,
      )
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    }

    cursor = match.index + token.length
    match = pattern.exec(text)
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

const renderRichText = (content, keyPrefix = 'rt') => {
  const paragraphs = String(content || '').split(/\n{2,}/)
  return paragraphs.map((paragraph, pi) => (
    <p className="ann-paragraph" key={`${keyPrefix}-p${pi}`}>
      {paragraph.split('\n').map((line, li) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={`${keyPrefix}-p${pi}-l${li}`}>
          {li > 0 ? <br /> : null}
          {renderInline(line, `${keyPrefix}-${pi}-${li}`)}
        </React.Fragment>
      ))}
    </p>
  ))
}

export default renderRichText
