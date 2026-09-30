import React, { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import { api, notifyBugDetected } from '../api/client';

export default function BookDetail({
  book,
  reviews = [],
  onBack,
  onStartLoan,
  onOpenReader,
  isWishlisted = false,
  onToggleWishlist,
  showToast
}) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [authorNameList, setAuthorNameList] = useState([]);
  const [hasReviewShiftBug, setHasReviewShiftBug] = useState(false);

  useEffect(() => {
    setLocalReviews(reviews);
    setAuthorNameList(reviews.map(r => r.authorName || '독서가'));
  }, [reviews]);

  if (!book) return null;

  const handleReviewAdded = (newReview) => {
    // INTENTIONAL BACKEND BUG: site054-SEC-449
    // When prepending newReview, authorNameList is appended or shifted incorrectly,
    // so review contents at index `i` show the author name from index `i+1` (or shifted author),
    // causing an author-content mismatch in UI!
    setLocalReviews(prev => [newReview, ...prev]);

    // INTENTIONAL BACKEND BUG: site054-SEC-449 key-reuse & parallel index shift
    setAuthorNameList(prev => {
      const shifted = ['새로운독자', ...prev.slice(1), prev[0] || '익명'];
      return shifted;
    });
    setHasReviewShiftBug(true);

    notifyBugDetected({
      id: 'SEC-449',
      category: 'List Rendering',
      family: 'key-reuse',
      severity: 'medium',
      endpoint: `/api/books/${book.id}/reviews`,
      method: 'POST',
      description: '새 서평 작성 및 목록 갱신 후 리스트 렌더링 키 재사용으로 작성자 닉네임과 본문 내용이 어긋나게 연결되는 오류'
    });
  };

  return (
    <div>
      {/* Top Breadcrumbs */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-secondary-lib" onClick={onBack} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          ← 도서관 목록으로 돌아가기
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          도서관 &gt; {book.category} &gt; <strong>{book.title}</strong>
        </span>
      </div>

      <div className="book-detail-grid">
        {/* Left Column: Book Cover & Quick Action */}
        <div>
          <div className="book-cover-large-box">
            <img src={book.cover} alt={book.title} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {book.available ? (
              <button
                className="btn-primary-lib"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                onClick={() => onStartLoan && onStartLoan(book)}
              >
                📖 대여하기 (14일간 무료)
              </button>
            ) : (
              <button
                className="btn-secondary-lib"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                disabled
              >
                🔒 대여 중 (예약 가능)
              </button>
            )}

            {book.type === '전자책' && (
              <button
                className="btn-secondary-lib"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', border: '1.5px solid var(--primary)', color: 'var(--primary)', fontWeight: '800' }}
                onClick={() => onOpenReader && onOpenReader(book.id)}
              >
                📱 전자책 읽기 (뷰어 열기)
              </button>
            )}

            <button
              className="btn-secondary-lib"
              style={{ width: '100%', padding: '12px', fontSize: '0.92rem', color: isWishlisted ? '#ef4444' : 'var(--text-main)' }}
              onClick={() => onToggleWishlist && onToggleWishlist(book.id)}
            >
              {isWishlisted ? '♥ 찜한 도서에서 해제' : '♡ 찜 목록에 보관'}
            </button>
          </div>
        </div>

        {/* Right Column: Book Specifications, Description, Reviews */}
        <div>
          <div className="book-meta-sheet">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                background: 'var(--primary-light)',
                color: 'var(--primary-dark)',
                fontWeight: '800',
                fontSize: '0.8rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                {book.category}
              </span>
              <span style={{
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontWeight: '700',
                fontSize: '0.8rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                {book.type}
              </span>
              <span style={{
                background: book.available ? '#dcfce7' : '#f1f5f9',
                color: book.available ? '#166534' : '#64748b',
                fontWeight: '800',
                fontSize: '0.8rem',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                {book.available ? '대여 가능' : '대출 중'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '14px', lineHeight: '1.3' }}>
              {book.title}
            </h1>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span>저자: <strong style={{ color: 'var(--text-main)' }}>{book.author}</strong></span>
              <span>&middot;</span>
              <span>출판사: <strong style={{ color: 'var(--text-main)' }}>{book.publisher}</strong></span>
              <span>&middot;</span>
              <span>발행일: {book.publishedAt}</span>
              <span>&middot;</span>
              <span>총 {book.pages}페이지</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 18px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '28px'
            }}>
              <div style={{ fontSize: '1.6rem', color: 'var(--gold)' }}>
                ★ {book.rating.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                등록된 서평 <strong>{book.reviewCount}개</strong> &middot; 소장 도서 <strong>{book.totalCopies}권</strong>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '24px 0' }} />

            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>
              📖 책 소개
            </h3>
            <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '32px' }}>
              {book.description}
            </p>

            {/* Review Section */}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '32px 0 24px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)' }}>
                독자 서평 및 리뷰 ({localReviews.length})
              </h3>
            </div>

            {/* INTENTIONAL BACKEND BUG: site054-SEC-449 UI List Rendering */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {localReviews.map((rev, index) => {
                // INTENTIONAL BACKEND BUG: site054-SEC-449
                // Decoupled author name array causes index shift upon adding reviews
                const displayAuthor = authorNameList[index] || rev.authorName;

                return (
                  <div
                    key={index} // Key reuse on index
                    className="review-list-item"
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="review-author-name" style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        👤 {displayAuthor}
                      </span>
                      <span style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: '800' }}>
                        {'★'.repeat(rev.rating || 5)} ({rev.rating || 5}점)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {rev.content}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '6px' }}>
                      {rev.createdAt}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Review Form Component */}
            <ReviewForm
              bookId={book.id}
              onReviewAdded={handleReviewAdded}
              showToast={showToast}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
