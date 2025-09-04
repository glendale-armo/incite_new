import { useLibrary } from '../context/LibraryContext'
import { useNavigate } from 'react-router-dom'
import ePub from 'epubjs'

export default function Library() {
  const { books, addBook } = useLibrary()
  const navigate = useNavigate()

  const handleUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Read as ArrayBuffer for parsing
    const arrayBuffer = await file.arrayBuffer()
    // Also read as Data URL for storage
    const dataUrl = await new Promise((res) => {
      const fr = new FileReader()
      fr.onload = (e) => res(e.target.result)
      fr.readAsDataURL(file)
    })

    const book = ePub(arrayBuffer)
    await book.ready
    const metadata = await book.loaded.metadata
    const nav = await book.loaded.navigation
    const coverUrl = await book.coverUrl()
    let cover = null
    if (coverUrl) {
      const resp = await fetch(coverUrl)
      const blob = await resp.blob()
      cover = await new Promise((res) => {
        const r = new FileReader()
        r.onload = (e) => res(e.target.result)
        r.readAsDataURL(blob)
      })
    }
    const toc = nav.toc.map((c) => ({ label: c.label, href: c.href }))

    addBook({
      id: Date.now().toString(),
      title: metadata.title || file.name,
      cover,
      file: dataUrl,
      toc,
      lastLocation: null,
      highlights: [],
    })
    event.target.value = null
  }

  return (
    <div className="library">
      <h1>Your Library</h1>
      <input type="file" accept=".epub" onChange={handleUpload} />
      <div className="book-grid">
        {books.map((b) => (
          <div
            key={b.id}
            className="book-card"
            onClick={() => navigate(`/reader/${b.id}`)}
          >
            {b.cover && <img src={b.cover} alt="cover" />}
            <p>{b.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
