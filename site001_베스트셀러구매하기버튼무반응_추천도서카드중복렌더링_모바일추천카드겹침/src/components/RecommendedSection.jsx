import React from 'react'
import { BookCover, StarRating } from './BookCover.jsx'

export default function RecommendedSection({ books, onAddToCart }) {
  if (!books || books.length === 0) {
    return (
      <section className="section recommended-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">✨ 이달의 추천 도서</h2>
          </div>
          <p className="no-results">검색 결과가 없습니다.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section recommended-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">✨ 이달의 추천 도서</h2>
          <span className="section-more">전체 보기 →</span>
        </div>

        {/*
          INTENTIONAL GUI BUG: site001-bug03
          Type: css-layout
          Description: 모바일 화면에서 추천 도서 카드들이 position:absolute 잘못된 설정으로 인해
          서로 겹쳐 보임. data-bug-id를 통해 CSS 셀렉터로 타겟팅됨.
        */}
        <div className="recommended-grid" data-bug-id="site001-bug03">
          {books.map(book => (
            <div key={book.id} className="rc-card" id={`rc-card-${book.id}`}>
              <div className="rc-cover">
                <BookCover title={book.title} author={book.author} colorIdx={book.colorIdx} />
              </div>
              <div className="rc-info">
                <div className="rc-genre">{book.genre}</div>
                <div className="rc-title">{book.title}</div>
                <div className="rc-author">{book.author}</div>
                <StarRating rating={book.rating} reviews={book.reviews} />
                <div className="rc-bottom">
                  <span className="rc-price">₩{book.price.toLocaleString()}</span>
                  <button
                    className="rc-add-btn"
                    onClick={() => onAddToCart(book)}
                    id={`rc-add-btn-${book.id}`}
                    aria-label={`${book.title} 장바구니 담기`}
                  >
                    담기
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/*
            INTENTIONAL GUI BUG: site001-bug02
            Type: component-rendering
            Description: 추천 도서 섹션에서 books[0]의 카드가 목록 마지막에 중복 렌더링됨.
            동일한 book 데이터를 의도적으로 한 번 더 렌더링하여 중복 카드가 표시됨.
          */}
          {books.length > 0 && (
            <div
              className="rc-card"
              data-bug-id="site001-bug02"
              id="rc-card-duplicate"
              style={{ outline: 'none' }}
            >
              <div className="rc-cover">
                <BookCover title={books[0].title} author={books[0].author} colorIdx={books[0].colorIdx} />
              </div>
              <div className="rc-info">
                <div className="rc-genre">{books[0].genre}</div>
                <div className="rc-title">{books[0].title}</div>
                <div className="rc-author">{books[0].author}</div>
                <StarRating rating={books[0].rating} reviews={books[0].reviews} />
                <div className="rc-bottom">
                  <span className="rc-price">₩{books[0].price.toLocaleString()}</span>
                  <button
                    className="rc-add-btn"
                    onClick={() => onAddToCart(books[0])}
                    id="rc-add-btn-duplicate"
                    aria-label={`${books[0].title} 장바구니 담기`}
                  >
                    담기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
