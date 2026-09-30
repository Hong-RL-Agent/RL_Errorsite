import React, { useState, useEffect } from 'react';
import BookDetail from '../components/BookDetail';
import { api } from '../api/client';

export default function BookDetailPage({
  bookId,
  onBack,
  onStartLoan,
  onOpenReader,
  wishlists = [],
  onToggleWishlist,
  showToast
}) {
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      if (!bookId) return;
      setLoading(true);
      try {
        const res = await api.getBookById(bookId);
        if (res && res.book) {
          setBook(res.book);
          setReviews(res.reviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [bookId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
        도서 상세 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h2>도서를 찾을 수 없습니다.</h2>
        <button className="btn-secondary-lib" style={{ marginTop: '16px' }} onClick={onBack}>
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <BookDetail
      book={book}
      reviews={reviews}
      onBack={onBack}
      onStartLoan={onStartLoan}
      onOpenReader={onOpenReader}
      isWishlisted={wishlists.includes(book.id)}
      onToggleWishlist={onToggleWishlist}
      showToast={showToast}
    />
  );
}
