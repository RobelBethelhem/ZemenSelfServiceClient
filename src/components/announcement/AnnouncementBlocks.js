import React from 'react'
import PropTypes from 'prop-types'
import renderRichText from './richText'

// Renders the block list an announcement is built from. Shared by the employee
// detail view and the admin builder's live preview, so what the admin sees is
// literally the same component the employee gets.

const youtubeId = (url) => {
  const m = String(url || '').match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  )
  return m ? m[1] : null
}

const vimeoId = (url) => {
  const m = String(url || '').match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

const TEXT_SIZES = { sm: '0.9rem', md: '1rem', lg: '1.15rem' }
const HEADING_SIZES = { 1: '1.9rem', 2: '1.5rem', 3: '1.2rem', 4: '1.05rem' }

const CALLOUT_TONES = {
  info: { bg: 'rgba(13,110,253,0.08)', border: '#0d6efd', label: '#084298' },
  success: { bg: 'rgba(25,135,84,0.09)', border: '#198754', label: '#0f5132' },
  warning: { bg: 'rgba(255,193,7,0.13)', border: '#ffc107', label: '#664d03' },
  danger: { bg: 'rgba(220,53,69,0.09)', border: '#dc3545', label: '#842029' },
}

const VideoBlock = ({ block }) => {
  const yt = block.provider === 'file' ? null : youtubeId(block.url)
  const vm = block.provider === 'file' ? null : vimeoId(block.url)

  let player
  if (yt) {
    player = (
      <iframe
        src={`https://www.youtube.com/embed/${yt}?rel=0`}
        title={block.caption || 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    )
  } else if (vm) {
    player = (
      <iframe
        src={`https://player.vimeo.com/video/${vm}`}
        title={block.caption || 'Video'}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    )
  } else {
    // Direct media file. Also the graceful path when an embed host is blocked
    // on the internal network — the link below always works.
    player = (
      <video
        controls
        poster={block.poster || undefined}
        style={{ width: '100%', height: '100%', background: '#000' }}
      >
        <source src={block.url} />
        Your browser cannot play this video.
      </video>
    )
  }

  return (
    <figure className="ann-block ann-video">
      <div className="ann-video-frame">{player}</div>
      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      <div className="ann-video-fallback">
        <a href={block.url} target="_blank" rel="noopener noreferrer">
          Open video in a new tab
        </a>
      </div>
    </figure>
  )
}

VideoBlock.propTypes = { block: PropTypes.object.isRequired }

const renderBlock = (block, index) => {
  if (!block || !block.type) return null
  const key = block.id || `blk-${index}`

  switch (block.type) {
    case 'heading':
      return (
        <div
          className="ann-block ann-heading"
          key={key}
          style={{
            textAlign: block.align || 'left',
            fontSize: HEADING_SIZES[block.level] || HEADING_SIZES[2],
            color: block.color || undefined,
          }}
        >
          {block.text}
        </div>
      )

    case 'text':
      return (
        <div
          className="ann-block ann-text"
          key={key}
          style={{
            textAlign: block.align || 'left',
            fontSize: TEXT_SIZES[block.size] || TEXT_SIZES.md,
          }}
        >
          {renderRichText(block.content, key)}
        </div>
      )

    case 'image':
      return (
        <figure
          className="ann-block ann-image"
          key={key}
          style={{ textAlign: block.align || 'center' }}
        >
          <img
            src={block.src}
            alt={block.alt || ''}
            style={{
              width: `${block.width || 100}%`,
              borderRadius: `${block.rounded === undefined ? 12 : block.rounded}px`,
            }}
          />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      )

    case 'gallery':
      return (
        <figure className="ann-block ann-gallery" key={key}>
          <div
            className="ann-gallery-grid"
            style={{ gridTemplateColumns: `repeat(${block.columns || 3}, minmax(0, 1fr))` }}
          >
            {(block.images || []).map((img, i) => (
              <img key={`${key}-g${i}`} src={img.src} alt={img.alt || ''} />
            ))}
          </div>
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      )

    case 'video':
      return <VideoBlock block={block} key={key} />

    case 'button':
      return (
        <div
          className="ann-block ann-button-row"
          key={key}
          style={{ textAlign: block.align || 'left' }}
        >
          <a
            className={`ann-button ann-button-${block.style || 'primary'}`}
            href={block.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {block.label || 'Open'}
          </a>
        </div>
      )

    case 'divider':
      return (
        <hr className={`ann-block ann-divider ann-divider-${block.style || 'solid'}`} key={key} />
      )

    case 'spacer':
      return <div className="ann-block" key={key} style={{ height: `${block.size || 32}px` }} />

    case 'quote':
      return (
        <blockquote className="ann-block ann-quote" key={key}>
          <div>{block.text}</div>
          {block.author ? <cite>— {block.author}</cite> : null}
        </blockquote>
      )

    case 'list': {
      const items = (block.items || []).map((item, i) => <li key={`${key}-i${i}`}>{item}</li>)
      return block.ordered ? (
        <ol className="ann-block ann-list" key={key}>
          {items}
        </ol>
      ) : (
        <ul className="ann-block ann-list" key={key}>
          {items}
        </ul>
      )
    }

    case 'callout': {
      const tone = CALLOUT_TONES[block.tone] || CALLOUT_TONES.info
      return (
        <div
          className="ann-block ann-callout"
          key={key}
          style={{ background: tone.bg, borderLeftColor: tone.border }}
        >
          {block.title ? (
            <div className="ann-callout-title" style={{ color: tone.label }}>
              {block.title}
            </div>
          ) : null}
          <div>{renderRichText(block.text, key)}</div>
        </div>
      )
    }

    default:
      // A block type this build does not know about is skipped rather than
      // crashing the whole announcement.
      return null
  }
}

const AnnouncementBlocks = ({ blocks }) => (
  <div className="ann-blocks">{(blocks || []).map(renderBlock)}</div>
)

AnnouncementBlocks.propTypes = {
  blocks: PropTypes.array,
}

export default AnnouncementBlocks
