/* eslint react-refresh/only-export-components: "warn" */
import { createContext, useContext, useState, useEffect } from 'react'

const LibraryContext = createContext()

const LIBRARY_KEY = 'epub-library'

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(books))
  }, [books])

  const addBook = (book) => setBooks((prev) => [...prev, book])
  const updateBook = (id, data) =>
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)))

  return (
    <LibraryContext.Provider value={{ books, addBook, updateBook }}>
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibrary = () => useContext(LibraryContext)
