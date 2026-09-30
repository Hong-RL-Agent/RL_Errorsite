import React from 'react';

export default function ReaderPanel({
  bookTitle,
  currentPage,
  totalPages,
  chapter,
  content,
  isOutOfBounds,
  onPrevPage,
  onNextPage,
  onClose
}) {
  return (
    <div className="reader-canvas">
      {/* Top Reader Header */}
      <div className="reader-header">
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>전자책 뷰어</div>
          <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-main)' }}>
            {bookTitle}
          </div>
        </div>

        <button className="btn-secondary-lib" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={onClose}>
          ✕ 뷰어 닫기
        </button>
      </div>

      {/* Chapter Indicator */}
      <div style={{ padding: '12px 48px', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary-dark)', background: '#fafafa' }}>
        {chapter || `본문 (${currentPage}p)`}
      </div>

      {/* Reader Main Content */}
      <div className="reader-body-content">
        {isOutOfBounds ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#b91c1c' }}>
            <div style={{ fontSize: '3rem', marginBottom: '14px' }}>⚠️</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '8px' }}>
              페이지 범위를 벗어났습니다! (현재: {currentPage} / 총 {totalPages}p)
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              마지막 페이지 이후의 페이지는 존재하지 않습니다. 이전 페이지로 돌아가세요.
            </div>
          </div>
        ) : (
          content
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="reader-footer-nav">
        <button
          className="btn-secondary-lib reader-prev-btn"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          style={{ opacity: currentPage <= 1 ? 0.4 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
        >
          &lt; 이전 페이지
        </button>

        <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)' }}>
          페이지 <strong>{currentPage}</strong> / {totalPages}
        </div>

        {/* INTENTIONAL BACKEND BUG: site054-SEC-448 */}
        {/* Next button remains enabled on last page (or triggers out of bounds increment) */}
        <button
          className="btn-primary-lib reader-next-btn"
          onClick={onNextPage}
        >
          다음 페이지 &gt;
        </button>
      </div>
    </div>
  );
}
