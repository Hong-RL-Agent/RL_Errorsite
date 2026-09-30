import React, { useState, useEffect } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import BookCard from '../components/BookCard';
import { api } from '../api/client';

export default function Home({
  setActivePage,
  onSelectBook,
  onSelectCategory,
  onOpenReader,
  wishlists = [],
  onToggleWishlist,
  onSearch
}) {
  const [popularBooks, setPopularBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const trendingTags = [
    '불편한 편의점',
    '클린 코드',
    '사피엔스',
    'React',
    '쇼펜하우어',
    '트렌드 코리아',
    '세이노의 가르침',
    '양자역학'
  ];

  useEffect(() => {
    async function loadHome() {
      try {
        const [bookRes, catRes] = await Promise.all([
          api.getBooks(),
          api.getCategories()
        ]);
        if (bookRes && bookRes.books) {
          setPopularBooks(bookRes.books.slice(0, 5));
          setNewBooks(bookRes.books.slice(5, 10));
          setEbooks(bookRes.books.filter(b => b.type === '전자책').slice(0, 5));
        }
        if (catRes && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadHome();
  }, []);

  const handleTagClick = (tag) => {
    if (onSearch) onSearch(tag);
    setActivePage('books');
  };

  return (
    <div>
      {/* Category Tabs Strip */}
      <CategoryTabs
        categories={categories}
        selectedCategory=""
        onSelectCategory={(catName) => {
          if (onSelectCategory) onSelectCategory(catName);
          setActivePage('books');
        }}
      />

      {/* Hero Showcase Banner */}
      <div className="hero-library-banner">
        <div>
          <div className="hero-tag-pill">
            <span>📖</span>
            <span>디지털 지식의 숲 &middot; BookNest 온라인 도서관</span>
          </div>
          <h1 className="hero-heading">
            언제 어디서나 읽는<br />
            당신만의 <strong>스마트 전자도서관</strong>
          </h1>
          <p className="hero-subhead">
            베스트셀러부터 최신 IT 전문서까지, 5만 여권의 종이책과 전자책을 24시간 자유롭게 대여하고 열람하세요.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn-primary-lib" style={{ background: '#ffffff', color: 'var(--primary-dark)' }} onClick={() => setActivePage('books')}>
              📚 도서관 자료 검색
            </button>
            <button className="btn-secondary-lib" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} onClick={() => setActivePage('loans')}>
              내 대여 서재 보기
            </button>
          </div>
        </div>

        <div style={{ fontSize: '5.5rem', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))' }}>
          📚✨
        </div>
      </div>

      {/* Trending Search Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)' }}>🔥 도서관 인기 검색어:</span>
        {trendingTags.map((tag, idx) => (
          <button
            key={idx}
            onClick={() => handleTagClick(tag)}
            style={{
              background: 'white',
              border: '1px solid var(--border-light)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: '600',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Section 1: Popular Books */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main)' }}>
              🔥 이달의 대여 인기 도서
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              BookNest 회원들이 가장 많이 읽고 높은 평점을 남긴 베스트 도서입니다.
            </div>
          </div>
          <button
            onClick={() => setActivePage('books')}
            style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', padding: '6px 12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}
          >
            전체보기 &rarr;
          </button>
        </div>

        <div className="books-grid-layout">
          {popularBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              isWishlisted={wishlists.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Popular E-Books (with Direct Reader) */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main)' }}>
              📱 즉시 열람 가능한 전자책(E-Book)
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              대기 없이 웹 리더 뷰어로 바로 읽을 수 있는 추천 전자책입니다.
            </div>
          </div>
          <button
            onClick={() => setActivePage('books')}
            style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', padding: '6px 12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}
          >
            전자책 전체보기 &rarr;
          </button>
        </div>

        <div className="books-grid-layout">
          {ebooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              isWishlisted={wishlists.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* Section 3: New Arrivals */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: 'var(--text-main)' }}>
              ✨ 이번 주 새로 들어온 신착 도서
            </h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              도서관에 갓 입고된 따끈따끈한 신간 자료를 확인해보세요.
            </div>
          </div>
          <button
            onClick={() => setActivePage('books')}
            style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', padding: '6px 12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}
          >
            신간 전체보기 &rarr;
          </button>
        </div>

        <div className="books-grid-layout">
          {newBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelectBook={onSelectBook}
              isWishlisted={wishlists.includes(book.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
