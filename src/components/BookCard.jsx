import { Link } from "react-router-dom";
import "./BookCard.css";

function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#f59e0b" : "none"}
          stroke={i <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="star-value">{rating}</span>
    </div>
  );
}

export default function BookCard({ book }) {
  return (
    <Link to={`/book/${book.id}`} className="book-card">
      <div className="book-cover-wrap">
        <img
          src={book.cover}
          alt={book.title}
          className="book-cover"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/140x200/1c65da/fff?text=${encodeURIComponent(book.title.slice(0, 2))}`;
          }}
        />
        <span className={`book-badge ${book.status}`}>
          {book.status === "available" ? "Available" : "Borrowed"}
        </span>
      </div>
      <div className="book-info">
        <p className="book-title">{book.title}</p>
        <p className="book-author">{book.author}</p>
        <div className="book-meta">
          <StarRating rating={book.rating} />
          <span className="book-genre">{book.genre}</span>
        </div>
      </div>
    </Link>
  );
}
