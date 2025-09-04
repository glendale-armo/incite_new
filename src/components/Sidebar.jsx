import { useState } from 'react'

export default function Sidebar({ toc, highlights, onChapterClick, onHighlightClick }) {
  const [tab, setTab] = useState('chapters')
  return (
    <div className="sidebar">
      <div className="tabs">
        <button className={tab === 'chapters' ? 'active' : ''} onClick={() => setTab('chapters')}>
          Chapters
        </button>
        <button className={tab === 'notes' ? 'active' : ''} onClick={() => setTab('notes')}>
          Notes
        </button>
      </div>
      {tab === 'chapters' ? (
        <ul className="toc">
          {toc.map((c) => (
            <li key={c.href}>
              <button onClick={() => onChapterClick(c.href)}>{c.label}</button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="notes">
          {highlights.map((h) => (
            <li key={h.cfi}>
              <button onClick={() => onHighlightClick(h.cfi)}>{h.text}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
