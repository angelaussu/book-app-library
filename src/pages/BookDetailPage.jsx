import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { books } from '../data/books'
import './BookDetailPage.css'

export default function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const book = books.find(b => b.id === parseInt(id))
  const [borrowed, setBorrowed] = useState(book?.status === 'borrowed')

  if (!book) return (
    <div className="dashboard-layout">
      <Sidebar />
      <main style={{ marginLeft: 240, padding: 40 }}>
        <p>Book not found.</p>
      </main>
    </div>
  )

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="detail-main">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Catalog
        </button>

        <div className="detail-card">
          <div className="detail-cover-col">
            <img
              src={book.cover}
              alt={book.title}
              className="detail-cover"
              onError={e => {
                e.target.src = `https://via.placeholder.com/220x330/1c65da/fff?text=${encodeURIComponent(book.title.slice(0,2))}`
              }}
            />
            <span className={`detail-badge ${borrowed ? 'borrowed' : 'available'}`}>
              {borrowed ? 'Currently Borrowed' : 'Available'}
            </span>
          </div>

          <div className="detail-info-col">
            <div className="detail-genre-chip">{book.genre}</div>
            <h1 className="detail-title">{book.title}</h1>
            <p className="detail-author">by {book.author}</p>

            <div className="detail-meta-row">
              <div className="detail-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>{book.rating} / 5.0</span>
              </div>
              <div className="detail-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
                <span>{book.pages} pages</span>
              </div>
              <div className="detail-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#717680" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{book.year}</span>
              </div>
            </div>

            <div className="detail-divider" />

            <div className="detail-section">
              <h3 className="detail-section-title">About this book</h3>
              <p className="detail-description">{book.description}</p>
            </div>

            <div className="detail-actions">
              {!borrowed ? (
                <button className="btn-primary detail-btn" onClick={() => setBorrowed(true)}>
                  Borrow Book
                </button>
              ) : (
                <button className="btn-return detail-btn" onClick={() => setBorrowed(false)}>
                  Return Book
                </button>
              )}
              <button className="btn-outline detail-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                Add to Favorites
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
