import React, { useState, useEffect } from 'react';

export default function App() {
  // DB States
  const [books, setStocks] = useState([]); // using 'books' list
  const [myLibrary, setMyLibrary] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [memos, setMemos] = useState([]);
  const [subscription, setSubscription] = useState({ planName: 'Free Trial', active: true });

  // Navigation / Selected states
  const [currentTab, setCurrentTab] = useState('featured'); // 'featured' | 'library' | 'reader' | 'subscription' | 'stats'
  const [selectedBookId, setSelectedBookId] = useState('book-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Highlights state (Error 1 Target)
  const [highlightTargetBookId, setHighlightTargetBookId] = useState('book-01');
  const [newHighlightText, setNewHighlightText] = useState('');

  // Reader state (Error 3 Target)
  const [currentPage, setCurrentPage] = useState(12);
  const [readerFontSize, setReaderFontSize] = useState(16);
  const [panelFontSize, setPanelFontSize] = useState(16); // setting panel display

  // Memo edit states (Error 2 Target)
  const [newMemoText, setNewMemoText] = useState('');
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [editingMemoText, setEditingMemoText] = useState('');

  // Subscription inputs (Error 4 Target)
  const [subPlanName, setSubPlanName] = useState('premium');
  const [subDuration, setSubDuration] = useState(12); // months

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadBooks();
    loadLibrary();
    loadHighlights();
    loadMemos();
    loadSubscription();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      showToast('도서 데이터베이스 조회 실패', 'danger');
    }
  };

  const loadLibrary = async () => {
    try {
      const res = await fetch('/api/library');
      const data = await res.json();
      setMyLibrary(data);
    } catch (err) {
      showToast('내 서재 책장 조회 실패', 'danger');
    }
  };

  const loadHighlights = async () => {
    try {
      const res = await fetch('/api/highlights');
      const data = await res.json();
      setHighlights(data);
    } catch (err) {
      showToast('하이라이트 로그 조회 실패', 'danger');
    }
  };

  const loadMemos = async () => {
    try {
      const res = await fetch('/api/memos');
      const data = await res.json();
      setMemos(data);
    } catch (err) {
      showToast('독서 메모장 조회 실패', 'danger');
    }
  };

  const loadSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      showToast('구독 플랜 갱신 정보 누락', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Switch book in reader (Error 1 Logic)
  const handleSelectBook = (bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage(1);
    setCurrentTab('reader');
    
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 활성 도서(selectedBookId)는 B로 바꾸지만, 하이라이트 제출 대상 
    // 북 ID(highlightTargetBookId)는 갱신 조치하지 않고 이전 도서인 A 상태 그대로 고착시킵니다. 
    // 이로 인해 도서 변경 후 바로 하이라이트를 작성하면 엉뚱한 이전 책에 구절이 귀속되는 버그가 발생합니다.
    // 원래 삽입되어야 하는 동기화 로직 누락:
    // setHighlightTargetBookId(bookId);
  };

  // Add highlight (Error 1 Trigger)
  const handleAddHighlight = async (e) => {
    e.preventDefault();
    if (!newHighlightText.trim()) return;

    try {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: highlightTargetBookId, // Stale ID used (Error 1)
          page: currentPage,
          text: newHighlightText
        })
      });

      if (res.ok) {
        showToast('새 하이라이트 문구가 책에 새겨졌습니다.', 'success');
        setNewHighlightText('');
        
        // Late synchronization to simulate "fixed on second actions"
        setHighlightTargetBookId(selectedBookId);
        loadHighlights();
      }
    } catch (err) {
      showToast('하이라이트 저장 중 오류가 발생했습니다.', 'danger');
    }
  };

  // Add to library
  const handleAddToLibrary = async (bookId) => {
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      });
      if (res.ok) {
        showToast('내 서재 책장에 추가되었습니다.', 'success');
        loadLibrary();
      }
    } catch (err) {
      showToast('서재 보관 처리 오류', 'danger');
    }
  };

  // Page switcher (Error 3 Logic)
  const handlePageChange = (direction) => {
    const book = books.find(b => b.id === selectedBookId) || { pagesCount: 100 };
    const next = currentPage + direction;
    if (next < 1 || next > book.pagesCount) return;

    setCurrentPage(next);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 웹 리더에서 페이지를 한 페이지 옆으로 넘기면, 본문 폰트 크기(readerFontSize)는 
    // 조용히 디폴트 크기인 16px로 롤백 초기화되지만, 우측 설정 패널에 표출된 값(panelFontSize)은 
    // 사용자가 임의 조정한 크기로 남아 있어 둘 사이의 괴리가 발생하게 유도합니다.
    setReaderFontSize(16);
  };

  const handleFontSizeChange = (size) => {
    setReaderFontSize(size);
    setPanelFontSize(size);
  };

  // Submit/Update Memo (Error 2 Trigger)
  const handleSaveMemo = async (e) => {
    e.preventDefault();
    if (!newMemoText.trim()) return;

    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: selectedBookId,
          page: currentPage,
          text: newMemoText
        })
      });
      if (res.ok) {
        showToast('메모장에 새 단상이 저장되었습니다.', 'success');
        setNewMemoText('');
        loadMemos();
      }
    } catch (err) {
      showToast('메모 저장 에러', 'danger');
    }
  };

  const handleUpdateMemoSubmit = async (e) => {
    e.preventDefault();
    if (!editingMemoText.trim() || !editingMemoId) return;

    try {
      const res = await fetch(`/api/memos/${editingMemoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editingMemoText,
          bookId: selectedBookId,
          page: currentPage
        })
      });

      if (res.ok) {
        showToast('메모가 수정 기록되었습니다.', 'success');
        setEditingMemoId(null);
        setEditingMemoText('');
        loadMemos(); // Reloading will show duplication due to Error 2!
      }
    } catch (err) {
      showToast('메모 갱신 통신 오류', 'danger');
    }
  };

  // Subscription Plan (Error 4 Trigger)
  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: subPlanName,
          durationMonths: Number(subDuration)
        })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '구독 처리에 실패했습니다.');
      }

      showToast(`성공적으로 ReadCloud [${subPlanName}] 요금제 정기 구독이 수락되었습니다!`, 'success');
      loadSubscription();
      setCurrentTab('featured');
    } catch (err) {
      showToast(`[결제 거절] ${err.message}`, 'danger');
    }
  };

  // Filter books
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || b.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const activeBook = books.find(b => b.id === selectedBookId) || { title: '', author: '', cover: '', pagesCount: 1, summary: '' };
  
  // Book specific annotations
  const bookHighlights = highlights.filter(h => h.bookId === selectedBookId);
  const bookMemos = memos.filter(m => m.bookId === selectedBookId);

  // Generate mock text for the current page
  const generatePageContent = (bookTitle, page) => {
    return `[제 ${page} 페이지] '${bookTitle}'의 이야기가 계속 펼쳐집니다. 독서는 인간의 생각과 정신을 살찌우는 위대한 영양분입니다. 이 책의 중심 내용은 세상을 이해하고 나아가 자아의 내면을 깨우치는데 훌륭한 길라잡이가 되어줍니다. 한 장 한 장 넘기다 보면 어느새 지혜와 통찰의 정원에 도달해 있는 우리 자신을 보게 될 것입니다. 문장 하나하나에 숨겨진 깊은 맥락을 하이라이트 펜으로 그어보고, 소중한 생각은 독서 메모장에 나만의 언어로 기록해보세요.`;
  };

  return (
    <div className="readcloud-app">
      
      {/* Top Header Bar */}
      <header className="app-header">
        <div className="logo-group">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
          </svg>
          <span className="logo-title">ReadCloud</span>
          <span className="logo-subtitle">무제한 스마트 전자책 리더</span>
        </div>

        {/* Plan display badge */}
        <div className="sub-badge-display">
          <span className="b">구독 플랜: {subscription.planName} ({subscription.durationMonths || 1}개월 약정)</span>
        </div>
      </header>

      {/* Sidebar and Content Grid */}
      <div className="workspace-grid">
        
        {/* Left Library Navigation Sidebar */}
        <aside className="panel-section library-sidebar">
          <div className="panel-header">
            <h3>📚 서재 내비게이션</h3>
          </div>

          <div className="nav-stack">
            <button 
              type="button" 
              onClick={() => setCurrentTab('featured')}
              className={`nav-item-btn ${currentTab === 'featured' ? 'active' : ''}`}
            >
              🏠 홈 / 추천 책장
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentTab('library')}
              className={`nav-item-btn ${currentTab === 'library' ? 'active' : ''}`}
            >
              📖 내 서재 책장
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentTab('reader')}
              className={`nav-item-btn ${currentTab === 'reader' ? 'active' : ''}`}
            >
              📖 e-Book 웹 리더
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentTab('subscription')}
              className={`nav-item-btn ${currentTab === 'subscription' ? 'active' : ''}`}
            >
              💳 멤버십 구독 관리
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentTab('stats')}
              className={`nav-item-btn ${currentTab === 'stats' ? 'active' : ''}`}
            >
              📊 나의 독서 통계
            </button>
          </div>

          <div className="genre-filter-box">
            <h4>📁 장르 필터</h4>
            {['All', '소설', '판타지', '자기계발', '경제/경영', '역사/인문', '심리/철학', '과학', '사회/교양'].map(genre => (
              <button 
                key={genre}
                type="button"
                onClick={() => { setSelectedGenre(genre); setCurrentTab('featured'); }}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </aside>

        {/* Center stage workspace */}
        <main className="center-stage-workspace">
          
          {/* TAB 1: FEATURED BOOKS (Shelf view) */}
          {currentTab === 'featured' && (
            <div className="panel-section books-shelf-panel">
              <div className="panel-header-row">
                <h2>📢 오늘의 추천 및 신간 도서 ({filteredBooks.length}개)</h2>
                <input 
                  type="text" 
                  placeholder="도서명, 저자 키워드 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="bookshelf-grid">
                {filteredBooks.map(book => (
                  <div key={book.id} className="book-card" onClick={() => handleSelectBook(book.id)}>
                    <div className="cover-box">
                      {/* Error 5: book-11 cover file path has corrupted extension and will break */}
                      <img src={book.cover} alt={book.title} className="book-cover" />
                    </div>
                    <div className="info">
                      <h4>{book.title}</h4>
                      <span className="author">{book.author}</span>
                      <span className="genre">{book.genre}</span>
                      <p className="summary">{book.summary.substring(0, 45)}...</p>
                    </div>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        onClick={() => handleAddToLibrary(book.id)} 
                        className="add-lib-btn"
                      >
                        ＋ 내 서재 담기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MY LIBRARY */}
          {currentTab === 'library' && (
            <div className="panel-section library-shelf-panel">
              <div className="panel-header">
                <h2>📖 나의 서재 보관함</h2>
              </div>
              <div className="bookshelf-grid">
                {myLibrary.map(book => (
                  <div key={book.id} className="book-card" onClick={() => handleSelectBook(book.id)}>
                    <div className="cover-box">
                      <img src={book.cover} alt={book.title} className="book-cover" />
                    </div>
                    <div className="info">
                      <h4>{book.title}</h4>
                      <span className="author">{book.author}</span>
                      <span className="genre">{book.genre}</span>
                    </div>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        onClick={() => handleSelectBook(book.id)} 
                        className="read-now-btn"
                      >
                        📖 독서 시작
                      </button>
                    </div>
                  </div>
                ))}

                {myLibrary.length === 0 && (
                  <div className="empty-placeholder">서재가 비어 있습니다. 추천 도서에서 책을 담아보세요.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WEB READER (Core display) */}
          {currentTab === 'reader' && (
            <div className="panel-section ebook-reader-panel">
              <div className="reader-header-meta">
                <div className="book-title-info">
                  <h2>{activeBook.title}</h2>
                  <span>{activeBook.author} ({activeBook.genre})</span>
                </div>
                <div className="page-indicator">
                  <span>페이지: {currentPage} / {activeBook.pagesCount}</span>
                </div>
              </div>

              {/* Viewport content styled dynamically (Error 3 Target) */}
              <div className="reader-viewport">
                <p 
                  className="reader-text-paragraphs"
                  style={{ fontSize: `${readerFontSize}px` }}
                >
                  {generatePageContent(activeBook.title, currentPage)}
                </p>
              </div>

              {/* Navigation toolbar */}
              <div className="reader-footer-toolbar">
                <button 
                  type="button" 
                  onClick={() => handlePageChange(-1)} 
                  className="page-nav-btn"
                  disabled={currentPage <= 1}
                >
                  ◀ 이전 페이지
                </button>
                <div className="quick-setting-hint">
                  * 폰트 단추: <strong>{readerFontSize}px</strong> 렌더링 중
                </div>
                <button 
                  type="button" 
                  onClick={() => handlePageChange(1)} 
                  className="page-nav-btn"
                  disabled={currentPage >= activeBook.pagesCount}
                >
                  다음 페이지 ▶
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTION PLAN */}
          {currentTab === 'subscription' && (
            <div className="panel-section subscription-plan-panel">
              <div className="panel-header">
                <h2>💳 ReadCloud 프리미엄 멤버십 정기 구독</h2>
              </div>
              <div className="plans-grid-row">
                <div className="plan-card active">
                  <h3>Premium 패스</h3>
                  <p className="price">월 9,900원</p>
                  <ul>
                    <li>15만 권 전체 도서 무제한 무독</li>
                    <li>웹/모바일 리더 무제한 오프라인 다운로드</li>
                    <li>독서 하이라이트 및 단상 영구 클라우드 보관</li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleSubscribeSubmit} className="sub-checkout-form">
                <h3>결제 방식 설정</h3>
                
                <div className="form-group">
                  <label>약정 요금 플랜</label>
                  <select value={subPlanName} onChange={(e) => setSubPlanName(e.target.value)} className="form-select">
                    <option value="premium">Premium 패스 (Error 4 과부하 대상)</option>
                    <option value="standard">Standard 패스</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>결제 약정 기간</label>
                  <select value={subDuration} onChange={(e) => setSubDuration(Number(e.target.value))} className="form-select">
                    <option value="12">12개월 (연간 할인 결제 - 12개월 지정 시 Error 4)</option>
                    <option value="3">3개월 (단기 결제)</option>
                    <option value="1">1개월 (일반 결제)</option>
                  </select>
                  <p className="helper-txt">* Premium 플랜 + 12개월 약정 결제 시 결제 모듈 차단 락(HTTP 500)이 발생합니다.</p>
                </div>

                <button type="submit" className="submit-sub-btn">💳 신용카드 결제 및 정기 구독 신청</button>
              </form>
            </div>
          )}

          {/* TAB 5: STATS */}
          {currentTab === 'stats' && (
            <div className="panel-section stats-chart-panel">
              <div className="panel-header">
                <h2>📊 최근 7일간 독서 활동 시간 통계</h2>
              </div>

              <div className="chart-wrapper">
                {/* SVG reading time stats bar chart */}
                <svg viewBox="0 0 400 200" className="stats-svg">
                  <line x1="40" y1="20" x2="40" y2="160" stroke="#4b5563" strokeWidth="2" />
                  <line x1="40" y1="160" x2="380" y2="160" stroke="#4b5563" strokeWidth="2" />
                  
                  {/* Grid lines */}
                  <line x1="40" y1="60" x2="380" y2="60" stroke="#374151" strokeDasharray="3" />
                  <line x1="40" y1="110" x2="380" y2="110" stroke="#374151" strokeDasharray="3" />

                  {/* Bars (Mon-Sun) */}
                  {/* Mon: 45m */}
                  <rect x="60" y="115" width="25" height="45" fill="#6366f1" rx="2" />
                  {/* Tue: 60m */}
                  <rect x="105" y="100" width="25" height="60" fill="#6366f1" rx="2" />
                  {/* Wed: 30m */}
                  <rect x="150" y="130" width="25" height="30" fill="#6366f1" rx="2" />
                  {/* Thu: 90m */}
                  <rect x="195" y="70" width="25" height="90" fill="#6366f1" rx="2" />
                  {/* Fri: 120m */}
                  <rect x="240" y="40" width="25" height="120" fill="#10b981" rx="2" />
                  {/* Sat: 40m */}
                  <rect x="285" y="120" width="25" height="40" fill="#6366f1" rx="2" />
                  {/* Sun: 75m */}
                  <rect x="330" y="85" width="25" height="75" fill="#6366f1" rx="2" />

                  {/* Labels */}
                  <text x="72" y="175" fill="#9ca3af" fontSize="8" textAnchor="middle">월</text>
                  <text x="117" y="175" fill="#9ca3af" fontSize="8" textAnchor="middle">화</text>
                  <text x="162" y="175" fill="#9ca3af" fontSize="8" textAnchor="middle">수</text>
                  <text x="207" y="175" fill="#9ca3af" fontSize="8" textAnchor="middle">목</text>
                  <text x="252" y="175" fill="#9ca3af" fontSize="8" textAnchor="middle">금</text>
                  <text x="297" y="175" fill="#9ca3af" fontSize="8" textAnchor="middle">토</text>
                  <text x="342" y="175" fill="#9ca3af" fontSize="8" textAnchor="middle">일</text>
                </svg>
              </div>
            </div>
          )}

        </main>

        {/* Right Settings, Memo & Highlight panel */}
        {currentTab === 'reader' && (
          <aside className="right-memos-column">
            
            {/* Setting options (Error 3 Source) */}
            <div className="panel-section reader-config-panel">
              <div className="panel-header">
                <h3>⚙️ 리더 뷰어 설정</h3>
              </div>
              <div className="form-group">
                <label>글자 크기 (현재: {panelFontSize}px)</label>
                {/* FontSize control: Updates panelFontSize. readerFontSize updates as well */}
                <input 
                  type="range" 
                  min="12" 
                  max="28" 
                  step="2"
                  value={panelFontSize}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                  className="font-size-slider"
                />
              </div>
              <p className="helper-txt">* 글자 크기 변경 후 좌우 페이지를 이동하면 오류 3이 검증됩니다.</p>
            </div>

            {/* Highlights list & forms */}
            <div className="panel-section highlights-mgr-panel">
              <div className="panel-header">
                <h3>🖋️ 본문 하이라이트</h3>
              </div>

              <form onSubmit={handleAddHighlight} className="hl-add-form">
                <input 
                  type="text" 
                  placeholder="본문 중요 문구를 복사 기입..." 
                  value={newHighlightText}
                  onChange={(e) => setNewHighlightText(e.target.value)}
                  className="form-input"
                  required
                />
                <button type="submit" className="add-hl-btn">새기기</button>
              </form>

              <div className="highlights-list-stack">
                {bookHighlights.map(hl => (
                  <div key={hl.id} className="hl-item-card">
                    <span className="pg-badge">p.{hl.page}</span>
                    <p className="txt">"{hl.text}"</p>
                  </div>
                ))}

                {bookHighlights.length === 0 && (
                  <div className="empty-placeholder">남겨진 하이라이트 문구가 없습니다.</div>
                )}
              </div>
            </div>

            {/* Memos list & forms */}
            <div className="panel-section memos-mgr-panel">
              <div className="panel-header">
                <h3>📝 나의 독서 단상 메모</h3>
              </div>

              {/* Memo add form */}
              <form onSubmit={handleSaveMemo} className="memo-add-form">
                <textarea 
                  rows="2" 
                  placeholder="책을 읽으며 느낀 생각을 기록해보세요..."
                  value={newMemoText}
                  onChange={(e) => setNewMemoText(e.target.value)}
                  className="form-textarea"
                  required
                ></textarea>
                <button type="submit" className="add-memo-btn">메모 저장</button>
              </form>

              {/* Editing Memo block (Error 2 Trigger) */}
              {editingMemoId && (
                <div className="memo-edit-drawer">
                  <h4>✏️ 메모 내용 수정</h4>
                  <form onSubmit={handleUpdateMemoSubmit} className="memo-edit-form">
                    <textarea 
                      rows="2" 
                      value={editingMemoText}
                      onChange={(e) => setEditingMemoText(e.target.value)}
                      className="form-textarea"
                      required
                    ></textarea>
                    <div className="btn-row">
                      <button type="submit" className="save-btn">갱신</button>
                      <button type="button" onClick={() => setEditingMemoId(null)} className="cancel-btn">취소</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Memos stack */}
              <div className="memos-list-stack">
                {bookMemos.map(memo => (
                  <div 
                    key={memo.id} 
                    className="memo-item-card"
                    onClick={() => { setEditingMemoId(memo.id); setEditingMemoText(memo.text); }}
                    title="클릭하여 수정 (Error 2 검증)"
                  >
                    <div className="meta">
                      <span className="pg">p.{memo.page}</span>
                      <span className="dt">{memo.date}</span>
                    </div>
                    <p className="txt">{memo.text}</p>
                    <span className="edit-hint-label">✎ 수정하기</span>
                  </div>
                ))}

                {bookMemos.length === 0 && (
                  <div className="empty-placeholder">등록된 독서 메모가 없습니다.</div>
                )}
              </div>
            </div>

          </aside>
        )}

      </div>

      {/* Toast Alert warning logs */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button 
              className="toast-close" 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
