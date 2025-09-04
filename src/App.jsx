import { Routes, Route } from 'react-router-dom'
import Library from './pages/Library'
import Reader from './pages/Reader'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Library />} />
      <Route path="/reader/:id" element={<Reader />} />
    </Routes>
  )
}
