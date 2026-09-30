import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { api } from '../api/client';

export default function Wishlist({ onSelectBook, setActivePage, wishlists = [], onToggleWishlist }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.getWishlist();
      if (res && res.wishlist) {
        setBooks(res.wishlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [wishlists]);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
          찜한 관심 도서 ({books.length}권)
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          관심 있는 도서를 보관해두고 언제든 대여 가능 여부를 확인하세요.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          찜 목록을 불러오는 중입니다...
        </div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧡</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>찜한 관심 도서가 없습니다.</div>
          <div>
            <button className="btn-primary-lib" onClick={() => setActivePage('books')}>
              📚 도서관 자료 둘러보기
            </button>
          </div>
        </div>
      ) : (
        <div className="books-grid-layout">
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
