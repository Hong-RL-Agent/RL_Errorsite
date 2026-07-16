import { createSignal, createEffect, onMount, For, Show } from 'solid-js';

export default function App() {
  // App Signals
  const [products, setProducts] = createSignal([]);
  const [wishlist, setWishlist] = createSignal([]); // Server-side wishes
  
  // Navigation & Filtering
  const [selectedCategory, setSelectedCategory] = createSignal('전체');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [sortBy, setSortBy] = createSignal('default'); // default, price-asc, price-desc
  
  // Selection States
  const [selectedProduct, setSelectedProduct] = createSignal(null);
  const [comparedProducts, setComparedProducts] = createSignal([]); // List of compared items
  
  // Form Signals
  const [newProductName, setNewProductName] = createSignal('');
  const [newProductCategory, setNewProductCategory] = createSignal('스마트폰');
  const [newProductPrice, setNewProductPrice] = createSignal(0);
  const [newProductCondition, setNewProductCondition] = createSignal(90);
  const [newProductGrade, setNewProductGrade] = createSignal('A');
  const [newProductDetails, setNewProductDetails] = createSignal('');
  const [uploadedFilename, setUploadedFilename] = createSignal('');
  const [uploadedFileUrl, setUploadedFileUrl] = createSignal('');

  // Inquiry Signal
  const [inquiryContent, setInquiryContent] = createSignal('');
  const [inquiryContact, setInquiryContact] = createSignal('');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = createSignal(false);
  const [inquiryProduct, setInquiryProduct] = createSignal(null);

  // Error 1: Index based likes
  const [likedIndices, setLikedIndices] = createSignal([]);

  // UI States
  const [toasts, setToasts] = createSignal([]);
  const [showAddForm, setShowAddForm] = createSignal(false);
  const [showWishlistOnly, setShowWishlistOnly] = createSignal(false);

  // Loaders
  onMount(() => {
    loadProducts();
    loadWishlist();
  });

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      showToast('상품 목록 로딩 실패', 'danger');
    }
  };

  const loadWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      setWishlist(data);
    } catch (err) {
      showToast('찜 목록 로딩 실패', 'danger');
    }
  };

  // Toast System
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Search & Filter & Sort Computations
  const filteredProducts = () => {
    let result = products();
    
    // Category filter
    if (selectedCategory() !== '전체') {
      result = result.filter(p => p.category === selectedCategory());
    }

    // Search query filter
    if (searchQuery().trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery().toLowerCase()));
    }

    return result;
  };

  const sortedProducts = () => {
    let result = [...filteredProducts()];
    if (sortBy() === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy() === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }
    return result;
  };

  // Toggle Like with Error 1 (Index tracking)
  const handleLikeToggle = async (idx) => {
    const list = sortedProducts();
    const product = list[idx];
    if (!product) return;

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 찜 상태 체크 및 렌더링 바인딩을 상품 ID가 아닌 현재 정렬된 배열의 인덱스 번호(idx)를 
    // 기준으로 수행함으로써, 가격 정렬 선택 시 찜 표시 아이콘이 다른 기기로 어긋나서 표시되게 만듭니다.
    const isLiked = likedIndices().includes(idx);
    let newLikes;
    if (isLiked) {
      newLikes = likedIndices().filter(i => i !== idx);
    } else {
      newLikes = [...likedIndices(), idx];
    }
    setLikedIndices(newLikes);

    // Call backend wish sync in background (requires ID)
    try {
      if (isLiked) {
        // Find wish item on server
        const wish = wishlist().find(w => w.productId === product.id);
        if (wish) {
          await fetch(`/api/wishlist/${wish.id}`, { method: 'DELETE' });
          loadWishlist();
        }
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
        loadWishlist();
      }
    } catch (err) {
      // background fail silent
    }
  };

  // Check if index is liked (Error 1 renderer)
  const isIndexLiked = (idx) => {
    return likedIndices().includes(idx);
  };

  // Mock File Upload (Error 4 helper)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFilename(file.name);

    // Write file metadata to server
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileData: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><rect width='100' height='120' rx='10' fill='%236366f1'/></svg>"
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadedFileUrl(data.url);
        showToast('이미지 업로드에 성공했습니다.', 'success');
      }
    } catch (err) {
      showToast('이미지 전송에 실패했습니다.', 'danger');
    }
  };

  // Submit Product Registration (Error 2 helper)
  const handleRegisterProduct = async (e) => {
    e.preventDefault();
    if (!newProductName().trim()) {
      showToast('상품명을 기입하세요', 'warning');
      return;
    }

    const payload = {
      name: newProductName(),
      category: newProductCategory(),
      price: newProductPrice(),
      condition: newProductCondition(),
      grade: newProductGrade(),
      details: newProductDetails(),
      image: uploadedFileUrl() || undefined
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '등록 에러');
      }

      showToast(`중고기기 '${newProductName()}'가 등록되었습니다.`, 'success');
      setShowAddForm(false);
      setNewProductName('');
      setNewProductPrice(0);
      setUploadedFilename('');
      setUploadedFileUrl('');
      loadProducts();
    } catch (err) {
      showToast(`등록 실패: ${err.message}`, 'danger');
    }
  };

  // Delete product (Error 3 helper)
  const handleDeleteProduct = async (productId) => {
    if (!confirm('정말 이 상품 등록을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('상품이 영구 삭제되었습니다.', 'success');
        setSelectedProduct(null);
        // Clear from compare list if present
        setComparedProducts(comparedProducts().filter(p => p.id !== productId));
        loadProducts();
      } else {
        const data = await res.json();
        showToast(data.error, 'danger');
      }
    } catch (err) {
      showToast('통신 중 예외가 발생했습니다.', 'danger');
    }
  };

  // Inquiry Submit (Error 5 helper)
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryContent().trim() || !inquiryContact().trim()) {
      showToast('문의 내용과 연락처를 입력해 주세요.', 'warning');
      return;
    }

    const payload = {
      productId: inquiryProduct().id,
      productName: inquiryProduct().name,
      content: inquiryContent(),
      contact: inquiryContact()
    };

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        // Catch Error 5 (503 Service Unavailable)
        throw new Error(data.error || '전송 실패');
      }

      showToast('판매자에게 문의 내역이 성공적으로 전달되었습니다.', 'success');
      setIsInquiryModalOpen(false);
      setInquiryContent('');
      setInquiryContact('');
    } catch (err) {
      showToast(`문의 발송 실패: ${err.message}`, 'danger');
    }
  };

  // Compare Toggle helper
  const toggleCompare = (product) => {
    const list = comparedProducts();
    const exist = list.find(p => p.id === product.id);
    if (exist) {
      setComparedProducts(list.filter(p => p.id !== product.id));
    } else {
      if (list.length >= 3) {
        showToast('최대 3개 제품까지만 동시에 비교가 가능합니다.', 'warning');
        return;
      }
      setComparedProducts([...list, product]);
    }
  };

  // Wishlist mapping loader helper (Error 3 demo)
  const getWishlistedProducts = () => {
    return wishlist().map(wish => {
      const prod = products().find(p => p.id === wish.productId);
      
      // INTENTIONAL_ERROR
      // CATEGORY: Database
      // DESCRIPTION: 이미 DB에서 삭제된 상품의 찜(wish) 고아 행이 존재할 경우,
      // products 목록에서 찾을 수 없어 prod가 undefined가 됩니다.
      // 이를 방지하는 fallback 처리 없이 빈 카드(또는 불완전한 상태)로 리스트업 렌더링되게 내버려 둡니다.
      if (!prod) {
        return {
          id: `deleted-${wish.id}`,
          isDeletedRecord: true,
          name: "삭제된 중고 기기",
          category: "-",
          price: "-",
          condition: 0,
          grade: "-",
          details: "이 상품은 원본이 이미 삭제되었습니다."
        };
      }
      return prod;
    });
  };

  return (
    <div class="reboot-app">
      {/* Top Navbar */}
      <header class="app-navbar">
        <div class="navbar-logo">
          <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span class="logo-title">Reboot Market</span>
          <span class="logo-subtitle">안심 중고 전자기기 마켓</span>
        </div>
        <div class="navbar-actions">
          <button class="nav-btn" onclick={() => setShowWishlistOnly(!showWishlistOnly())}>
            {showWishlistOnly() ? '🏡 전체 상품 보기' : `❤️ 찜 목록 (${wishlist().length})`}
          </button>
          <button class="nav-btn primary" onclick={() => setShowAddForm(true)}>
            ➕ 내 기기 판매하기
          </button>
        </div>
      </header>

      {/* Main Workspace grid */}
      <div class="dashboard-grid">
        {/* Left categories panel */}
        <aside class="panel-section column-categories">
          <div class="panel-header">
            <h2>🏷️ 카테고리 필터</h2>
          </div>
          <div class="category-menu-list">
            <For each={['전체', '스마트폰', '태블릿', '노트북']}>
              {(cat) => (
                <button 
                  class={selectedCategory() === cat ? 'active' : ''} 
                  onclick={() => { setSelectedCategory(cat); setShowWishlistOnly(false); }}
                >
                  {cat}
                </button>
              )}
            </For>
          </div>
          
          <div class="search-box-container">
            <input 
              type="text" 
              placeholder="기기 모델명 검색..." 
              value={searchQuery()} 
              oninput={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          
          <div class="sort-selector">
            <label>상품 정렬 기준</label>
            <select value={sortBy()} onchange={(e) => setSortBy(e.target.value)}>
              <option value="default">최신 등록순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
            </select>
          </div>
        </aside>

        {/* Center Products Display column */}
        <main class="panel-section column-products">
          <Show when={!showWishlistOnly()} fallback={
            <div>
              <div class="panel-header">
                <h2>❤️ 찜 목록 리스트 (DB 연동)</h2>
                <p class="subtext">삭제된 기기의 고아 데이터가 있으면 빈 카드로 노출됩니다 (DB 에러)</p>
              </div>
              <div class="products-grid">
                <For each={getWishlistedProducts()}>
                  {(prod) => (
                    <div class={`product-card ${prod.isDeletedRecord ? 'deleted-skeleton' : ''}`}>
                      <div class="card-image-box">
                        <Show when={!prod.isDeletedRecord} fallback={<div class="skeleton-image">NO IMAGE</div>}>
                          <img src={prod.image} alt={prod.name} />
                        </Show>
                      </div>
                      <div class="card-body">
                        <h3>{prod.name}</h3>
                        <p class="price-line">{prod.price === '-' ? '-' : `₩${prod.price.toLocaleString()}`}</p>
                        <p class="details-line">{prod.details}</p>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          }>
            <div class="panel-header products-header-row">
              <h2>📱 전자기기 중고 매물 목록 ({sortedProducts().length})</h2>
            </div>
            
            <div class="products-grid">
              <For each={sortedProducts()}>
                {(prod, index) => {
                  const isCompared = () => comparedProducts().some(p => p.id === prod.id);
                  return (
                    <div class="product-card">
                      <div class="card-image-box" onclick={() => setSelectedProduct(prod)}>
                        <img src={prod.image} alt={prod.name} class="product-img" />
                        <span class="grade-tag">{prod.grade}등급</span>
                      </div>
                      <div class="card-body">
                        <div class="card-title-row">
                          <h3 onclick={() => setSelectedProduct(prod)}>{prod.name}</h3>
                          
                          {/* Like Button using index based checking (Error 1) */}
                          <button 
                            class={`like-btn ${isIndexLiked(index()) ? 'active' : ''}`}
                            onclick={() => handleLikeToggle(index())}
                          >
                            ♥
                          </button>
                        </div>
                        
                        <p class="card-price">₩{prod.price.toLocaleString()}</p>
                        
                        {/* Gauge bar */}
                        <div class="gauge-container">
                          <span class="gauge-label">배터리/기기 성능: {prod.condition}%</span>
                          <div class="gauge-track">
                            <div class="gauge-fill" style={{ width: `${prod.condition}%` }}></div>
                          </div>
                        </div>

                        <div class="card-actions">
                          <button 
                            class={`compare-toggle-btn ${isCompared() ? 'active' : ''}`}
                            onclick={() => toggleCompare(prod)}
                          >
                            {isCompared() ? '비교 해제' : '⚖️ 비교 추가'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </main>

        {/* Right column: Comparison sheet board */}
        <aside class="panel-section column-compare">
          <div class="panel-header">
            <h2>⚖️ 스마트 가격 비교 판넬</h2>
            <p class="subtext">최대 3개 기기 스펙 및 등급 비교</p>
          </div>
          
          <div class="compare-container-box">
            <Show when={comparedProducts().length > 0} fallback={
              <div class="empty-compare-placeholder">
                <p>상품 목록 하단의 [비교 추가] 버튼을 누르면 기기들의 상태 점수와 가격이 이곳에서 한눈에 비교 분석됩니다.</p>
              </div>
            }>
              <div class="compare-table-board">
                <div class="compare-row header">
                  <div class="compare-cell">기기명</div>
                  <For each={comparedProducts()}>
                    {(p) => <div class="compare-cell bold">{p.name}</div>}
                  </For>
                </div>
                <div class="compare-row">
                  <div class="compare-cell">가격</div>
                  <For each={comparedProducts()}>
                    {(p) => <div class="compare-cell text-accent">₩{p.price.toLocaleString()}</div>}
                  </For>
                </div>
                <div class="compare-row">
                  <div class="compare-cell">성능 점수</div>
                  <For each={comparedProducts()}>
                    {(p) => <div class="compare-cell font-primary">{p.condition}%</div>}
                  </For>
                </div>
                <div class="compare-row">
                  <div class="compare-cell">기기 등급</div>
                  <For each={comparedProducts()}>
                    {(p) => <div class="compare-cell"><span class="table-grade-tag">{p.grade}</span></div>}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </aside>
      </div>

      {/* Product Detail Modal */}
      <Show when={selectedProduct()}>
        {(prod) => (
          <div class="modal-overlay" onclick={() => setSelectedProduct(null)}>
            <div class="detail-modal-card" onclick={(e) => e.stopPropagation()}>
              <button class="modal-close-btn" onclick={() => setSelectedProduct(null)}>&times;</button>
              
              <div class="detail-columns">
                <div class="detail-media">
                  <img src={prod.image} alt={prod.name} />
                </div>
                <div class="detail-info">
                  <span class="detail-category">{prod.category}</span>
                  <h2>{prod.name}</h2>
                  <p class="detail-price-lbl">₩{prod.price.toLocaleString()}</p>
                  
                  <div class="spec-row">
                    <span class="spec-badge">기기 성능: <strong>{prod.condition}%</strong></span>
                    <span class="spec-badge">평가 등급: <strong>{prod.grade}등급</strong></span>
                  </div>

                  <div class="detail-description">
                    <h4>판매자 상세 코멘트</h4>
                    <p>{prod.details}</p>
                  </div>

                  <div class="detail-actions-row">
                    <button 
                      class="action-btn contact"
                      onclick={() => {
                        setInquiryProduct(prod);
                        setIsInquiryModalOpen(true);
                        setSelectedProduct(null);
                      }}
                    >
                      ✉️ 판매자에게 직거래 문의
                    </button>
                    <button class="action-btn delete" onclick={() => handleDeleteProduct(prod.id)}>
                      🗑️ 상품 등록 취소(삭제)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>

      {/* Sell item registration modal form (Error 2 and 4 test) */}
      <Show when={showAddForm()}>
        <div class="modal-overlay" onclick={() => setShowAddForm(false)}>
          <div class="register-modal-card" onclick={(e) => e.stopPropagation()}>
            <button class="modal-close-btn" onclick={() => setShowAddForm(false)}>&times;</button>
            <h3>➕ 내 전자기기 판매 등록</h3>
            
            <form onSubmit={handleRegisterProduct} class="booking-form" style={{ "margin-top": "1.5rem" }}>
              <div class="form-group-row">
                <div class="form-group">
                  <label>상품 카테고리</label>
                  <select value={newProductCategory()} onchange={(e) => setNewProductCategory(e.target.value)}>
                    <option value="스마트폰">스마트폰</option>
                    <option value="태블릿">태블릿</option>
                    <option value="노트북">노트북</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>기기 등급</label>
                  <select value={newProductGrade()} onchange={(e) => setNewProductGrade(e.target.value)}>
                    <option value="S">S급 (새상품급)</option>
                    <option value="A">A급 (우수함)</option>
                    <option value="B">B급 (사용감 있음)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>기기 모델명</label>
                <input 
                  type="text" 
                  placeholder="예: 갤럭시 Z플립 5" 
                  value={newProductName()} 
                  oninput={(e) => setNewProductName(e.target.value)} 
                />
              </div>

              <div class="form-group-row">
                <div class="form-group">
                  <label>판매 제시 가격 (0원 입력 테스트 가능)</label>
                  <input 
                    type="number" 
                    value={newProductPrice()} 
                    oninput={(e) => setNewProductPrice(Number(e.target.value))} 
                  />
                  <p class="help-text">음수 입력 시에만 백엔드 차단이 작동합니다. (0원은 허용)</p>
                </div>
                <div class="form-group">
                  <label>기기 성능 수치 (0-100%)</label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={newProductCondition()} 
                    oninput={(e) => setNewProductCondition(Number(e.target.value))} 
                  />
                  <span>수치: {newProductCondition()}%</span>
                </div>
              </div>

              {/* Image upload section (Error 4) */}
              <div class="form-group">
                <label>기기 실물 사진 첨부 (공백 포함 파일명 업로드 테스트)</label>
                <input type="file" accept="image/*" onchange={handleFileUpload} />
                <Show when={uploadedFilename()}>
                  <p class="help-text text-success">첨부된 파일: {uploadedFilename()}</p>
                </Show>
                <p class="help-text">파일명에 띄어쓰기가 들어갈 경우 URL 인코딩 불일치로 서빙 오류가 발생합니다.</p>
              </div>

              <div class="form-group">
                <label>세부 상태 소개</label>
                <textarea 
                  rows="3" 
                  placeholder="스크래치 위치나 배터리 효율 등을 자세히 적어주세요."
                  value={newProductDetails()} 
                  oninput={(e) => setNewProductDetails(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" class="submit-booking-btn">
                검수 및 매물 등록 요청하기
              </button>
            </form>
          </div>
        </div>
      </Show>

      {/* Inquiry Modal Overlay (Error 5 test) */}
      <Show when={isInquiryModalOpen()}>
        <div class="modal-overlay" onclick={() => setIsInquiryModalOpen(false)}>
          <div class="edit-modal-card" onclick={(e) => e.stopPropagation()}>
            <button class="modal-close-btn" onclick={() => setIsInquiryModalOpen(false)}>&times;</button>
            <h3>✉️ 1:1 직거래 구매 문의</h3>
            <p class="modal-subtitle">기기명: {inquiryProduct()?.name}</p>

            <form onSubmit={handleInquirySubmit} class="booking-form" style={{ "margin-top": "1.5rem" }}>
              <div class="form-group">
                <label>연락받으실 연락처 (이메일/번호)</label>
                <input 
                  type="text" 
                  placeholder="예: user@email.com 또는 010-XXXX-XXXX" 
                  value={inquiryContact()} 
                  oninput={(e) => setInquiryContact(e.target.value)} 
                />
              </div>

              <div class="form-group">
                <label>문의 메세지 기입 ('교환' 단어 입력 시 통신 차단 에러)</label>
                <textarea 
                  rows="4" 
                  placeholder="예: 직거래 가능한 장소와 네고 가능 여부가 궁금합니다."
                  value={inquiryContent()} 
                  oninput={(e) => setInquiryContent(e.target.value)}
                ></textarea>
                <p class="help-text">문의 내용에 '교환'이라는 단어가 들어있으면 전송 시 HTTP 503 오류가 발생합니다.</p>
              </div>

              <button type="submit" class="submit-booking-btn">
                문의 메세지 보내기
              </button>
            </form>
          </div>
        </div>
      </Show>

      {/* Toast popup logs */}
      <div class="toast-container">
        <For each={toasts()}>
          {(t) => (
            <div class={`toast-card ${t.type}`}>
              <span class="toast-icon">
                {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
              </span>
              <span class="toast-message">{t.message}</span>
              <button class="toast-close" onclick={() => removeToast(t.id)}>&times;</button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
