import { useParams, useNavigate } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext'
import { ReactReader } from 'react-reader'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import HighlightMenu from '../components/HighlightMenu'

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { books, updateBook } = useLibrary()
  const book = books.find((b) => b.id === id)

  const [location, setLocation] = useState(book?.lastLocation)
  const [rendition, setRendition] = useState(null)
  const [selection, setSelection] = useState(null)
  const [activeHighlight, setActiveHighlight] = useState(null)
  const [fontSize, setFontSize] = useState(100)
  const [bookUrl, setBookUrl] = useState(null)

  useEffect(() => {
    if (!book) navigate('/')
  }, [book, navigate])

  const onLocationChanged = (loc) => {
    setLocation(loc)
    updateBook(id, { lastLocation: loc })
  }

  const handleChapterClick = (href) => {
    setLocation(href)
  }

  const handleHighlightNav = (cfi) => {
    setLocation(cfi)
  }

  const applyHighlight = () => {
    if (!selection || !rendition) return
    rendition.annotations.highlight(selection.cfi, {}, null, 'hl', {
      fill: 'yellow',
      'fill-opacity': 0.5,
    })
    const newHighlights = [...book.highlights, { cfi: selection.cfi, text: selection.text }]
    updateBook(id, { highlights: newHighlights })
    setSelection(null)
  }

  const removeHighlight = () => {
    if (!activeHighlight || !rendition) return
    rendition.annotations.remove(activeHighlight.cfi, 'hl')
    const newHighlights = book.highlights.filter((h) => h.cfi !== activeHighlight.cfi)
    updateBook(id, { highlights: newHighlights })
    setActiveHighlight(null)
  }

  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}%`)
      rendition.on('selected', (cfiRange, contents) => {
        const sel = contents.window.getSelection()
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const text = range.toString()
        setSelection({ cfi: cfiRange, text, top: rect.top + window.scrollY, left: rect.left + window.scrollX })
        sel.removeAllRanges()
      })
      rendition.on('click', (e) => {
        const cfi = e.target.getAttribute('data-epubcfi')
        if (cfi) {
          const rect = e.target.getBoundingClientRect()
          setActiveHighlight({ cfi, top: rect.top + window.scrollY, left: rect.left + window.scrollX })
        } else {
          setActiveHighlight(null)
        }
      })
      // Render existing highlights
      book.highlights.forEach((h) =>
        rendition.annotations.highlight(h.cfi, {}, null, 'hl', {
          fill: 'yellow',
          'fill-opacity': 0.5,
        })
      )
    }
  }, [rendition, book.highlights, fontSize])

  const changeFont = (delta) => {
    const newSize = Math.min(200, Math.max(60, fontSize + delta))
    setFontSize(newSize)
    if (rendition) rendition.themes.fontSize(`${newSize}%`)
  }

  useEffect(() => {
    let objectUrl
    async function prepareBook() {
      try {
        const res = await fetch(book.file)
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        setBookUrl(objectUrl)
      } catch (e) {
        console.error('Failed to load book', e)
      }
    }
    if (book?.file) {
      prepareBook()
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [book?.file])

  if (!book || !bookUrl) return null

  return (
    <div className="reader-view">
      <Sidebar
        toc={book.toc}
        highlights={book.highlights}
        onChapterClick={handleChapterClick}
        onHighlightClick={handleHighlightNav}
      />
      <div className="reader-container">
        <div className="controls">
          <button onClick={() => rendition && rendition.prev()}>Prev</button>
          <button onClick={() => rendition && rendition.next()}>Next</button>
          <button onClick={() => changeFont(-10)}>A-</button>
          <button onClick={() => changeFont(10)}>A+</button>
        </div>
        <div className="reader">
          <ReactReader
            url={bookUrl}
            location={location}
            locationChanged={onLocationChanged}
            getRendition={(r) => setRendition(r)}
          />
        </div>
      </div>
      <HighlightMenu
        position={selection && { top: selection.top, left: selection.left }}
        label="Highlight"
        onAction={applyHighlight}
      />
      <HighlightMenu
        position={activeHighlight && { top: activeHighlight.top, left: activeHighlight.left }}
        label="Unhighlight"
        onAction={removeHighlight}
      />
    </div>
  )
}
