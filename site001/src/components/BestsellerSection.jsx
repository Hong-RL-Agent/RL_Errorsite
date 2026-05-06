import React from 'react'
import { BookCover, StarRating } from './BookCover.jsx'

export default function BestsellerSection({ books, onAddToCart }) {
  if (!books || books.length === 0) {
    return (
      <section className="section bestseller-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">📚 베스트셀러</h2>
          </div>
          <p className="no-results">검색 결과가 없습니다.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section bestseller-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">📚 베스트셀러</h2>
          <span className="section-more">전체 보기 →</span>
        </div>
        <div className="bestseller-grid">
          {books.map(book => (
            <div key={book.id} className="bs-card">
              <div className="bs-card-cover">
                <span className="bs-badge">{book.badge}</span>
                <BookCover title={book.title} author={book.author} colorIdx={book.colorIdx} />
              </div>
              <div className="bs-card-info">
                <div className="bs-title">{book.title}</div>
                <div className="bs-author">{book.author}</div>
                <StarRating rating={book.rating} reviews={book.reviews} />
                <p className="bs-desc">{book.description}</p>
                <div className="bs-bottom">
                  <span className="bs-price">₩{book.price.toLocaleString()}</span>
                  {/*
                    INTENTIONAL GUI BUG: site001-bug01
                    Type: button-no-response
                    Description: 베스트셀러 카드의 "구매하기" 버튼 클릭 시 장바구니에 추가되지 않음.
                    onClick 핸들러를 의도적으로 연결하지 않아 아무 반응이 없음.
                  */}
                  <button
                    className="bs-buy-btn"
                    data-bug-id="site001-bug01"
                    id={`bs-buy-btn-${book.id}`}
                    aria-label={`${book.title} 구매하기`}
                  >
                    구매하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
