import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import BookCard from '../components/BookCard'
import { books, genres } from '../data/books'
import './DashboardPage.css'

export default function DashboardPage() {
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')

  const filtered = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    const matchGenre = activeGenre === 'All' || b.genre === activeGenre
    return matchSearch && matchGenre
  })

  const available = books.filter(b => b.status === 'available').length
  const borrowed = books.filter(b => b.status === 'borrowed').length

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Library Catalog</h1>
            <p className="dashboard-subtitle">Browse and manage your books</p>
          </div>
          <div className="dashboard-stats">
            <div className="stat-chip available">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
              <span>{available} Available</span>
            </div>
            <div className="stat-chip borrowed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{borrowed} Borrowed</span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="dashboard-controls">
          <div className="search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <div className="genre-filters">
            {genres.map(g => (
              <button
                key={g}
                className={`genre-btn ${activeGenre === g ? 'active' : ''}`}
                onClick={() => setActiveGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {filtered.length > 0 ? (
          <div className="books-grid">
            {filtered.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        ) : (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d5d7da" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
            <p>No books found for "{search}"</p>
          </div>
        )}
      </main>
    </div>
  )
}
