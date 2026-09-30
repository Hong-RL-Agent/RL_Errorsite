import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BugAlertPopup from './components/BugAlertPopup';
import Toast from './components/Toast';

import Home from './pages/Home';
import Books from './pages/Books';
import BookDetailPage from './pages/BookDetailPage';
import MyLoans from './pages/MyLoans';
import Wishlist from './pages/Wishlist';
import Reader from './pages/Reader';
import Profile from './pages/Profile';

import { api } from './api/client';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [readerBookId, setReaderBookId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlists, setWishlists] = useState(['b-101', 'b-102', 'b-105', 'b-108', 'b-113', 'b-117', 'b-121', 'b-126', 'b-135', 'b-142']);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleSelectBook = (bookId) => {
    setSelectedBookId(bookId);
    setActivePage('book-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReader = (bookId) => {
    setReaderBookId(bookId);
    setActivePage('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartLoan = async (book) => {
    try {
      const res = await api.createLoan(book.id);
      if (res && res.loan) {
        showToast(`'${book.title}' 도서가 대여되었습니다. (반납기한: 14일)`, 'success');
        setActivePage('loans');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      showToast(err.message || '대여 신청 실패', 'error');
    }
  };

  const handleToggleWishlist = async (bookId) => {
    const isWished = wishlists.includes(bookId);
    try {
      if (isWished) {
        await api.removeFromWishlist(bookId);
        setWishlists(prev => prev.filter(id => id !== bookId));
        showToast('관심 도서에서 제외되었습니다.', 'info');
      } else {
        await api.addToWishlist(bookId);
        setWishlists(prev => [...prev, bookId]);
        showToast('관심 도서(찜)에 추가되었습니다.', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      <BugAlertPopup />
      <Toast toasts={toasts} />

      <Header
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={(q) => {
          setSearchQuery(q);
          setActivePage('books');
        }}
      />

      <main className="main-content">
        {activePage === 'home' && (
          <Home
            setActivePage={setActivePage}
            onSelectBook={handleSelectBook}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onOpenReader={handleOpenReader}
            wishlists={wishlists}
            onToggleWishlist={handleToggleWishlist}
            onSearch={(q) => setSearchQuery(q)}
          />
        )}

        {activePage === 'books' && (
          <Books
            onSelectBook={handleSelectBook}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            wishlists={wishlists}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activePage === 'book-detail' && (
          <BookDetailPage
            bookId={selectedBookId}
            onBack={() => setActivePage('books')}
            onStartLoan={handleStartLoan}
            onOpenReader={handleOpenReader}
            wishlists={wishlists}
            onToggleWishlist={handleToggleWishlist}
            showToast={showToast}
          />
        )}

        {activePage === 'loans' && (
          <MyLoans
            onOpenReader={handleOpenReader}
            onSelectBook={handleSelectBook}
            setActivePage={setActivePage}
            showToast={showToast}
          />
        )}

        {activePage === 'wishlist' && (
          <Wishlist
            onSelectBook={handleSelectBook}
            setActivePage={setActivePage}
            wishlists={wishlists}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activePage === 'reader' && (
          <Reader
            bookId={readerBookId || 'b-101'}
            onClose={() => setActivePage('books')}
            showToast={showToast}
          />
        )}

        {activePage === 'profile' && (
          <Profile
            onSelectBook={handleSelectBook}
            onOpenReader={handleOpenReader}
            setActivePage={setActivePage}
          />
        )}
      </main>

      {/* Commercial Portal Footer */}
      <footer style={{
        background: '#1b4332',
        color: '#b7e4c7',
        padding: '50px 20px 36px',
        fontSize: '0.85rem',
        marginTop: 'auto',
        borderTop: '1px solid #2d6a4f'
      }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📚</span>
                <span>Book<span style={{ color: '#52b788' }}>Nest</span></span>
              </div>
              <p style={{ color: '#95d5b2', lineHeight: '1.6', fontSize: '0.82rem' }}>
                스마트 지식 문화 플랫폼 BookNest. 도서관 방문 없이 24시간 언제 어디서나 전자책 및 종이책 대여 서비스를 누구나 무료로 이용할 수 있습니다.
              </p>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: '800', marginBottom: '12px' }}>자료실 바로가기</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('books')}>소장 도서관 검색</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('loans')}>내 대여 서재</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('wishlist')}>찜한 도서 목록</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setActivePage('profile')}>나의 독서 통계</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: '800', marginBottom: '12px' }}>대여 및 이용 안내</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#95d5b2' }}>
                <span>기본 대여기간: 14일</span>
                <span>대여 연장: 1회 7일 (최대 2회)</span>
                <span>동시 대여 한도: 1인 최대 7권</span>
                <span>전자책 뷰어 지원 브라우저 안내</span>
              </div>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: '800', marginBottom: '12px' }}>도서관 고객 지원</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#52b788', marginBottom: '4px' }}>
                1588-0953
              </div>
              <div style={{ fontSize: '0.8rem', color: '#95d5b2', lineHeight: '1.5' }}>
                평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)<br />
                서버 포트: Port 9953 (BookNest Standalone)
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #2d6a4f', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: '#74c69d' }}>
            <div>
              (재)북네스트 도서관재단 | 서울특별시 마포구 월드컵북로 953 | 대표번호: 1588-0953
            </div>
            <div>
              &copy; 2026 BookNest Library System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
