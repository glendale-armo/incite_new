import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ReactReader } from 'react-reader'
import { useLibrary } from '../context/LibraryContext'

// A minimal reader that focuses solely on rendering the book.
export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { books, updateBook } = useLibrary()

  const book = books.find((b) => b.id === id)
  const [location, setLocation] = useState(book?.lastLocation || null)

  // Redirect back to the library if the book is missing
  useEffect(() => {
    if (!book) navigate('/')
  }, [book, navigate])

  if (!book) return null

  const onLocationChanged = (loc) => {
    setLocation(loc)
    updateBook(id, { lastLocation: loc })
  }

  return (
    <div className="reader-view">
      <ReactReader
        url={book.file}
        location={location}
        locationChanged={onLocationChanged}
      />
    </div>
  )
}

