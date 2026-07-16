<template>
  <div class="libraryloop-app">
    <!-- App Navbar Header -->
    <header className="app-navbar">
      <div className="navbar-logo">
        <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="logo-title">LibraryLoop</span>
        <span className="logo-subtitle">도서 대출 &amp; 스마트 열람실 좌석 예약</span>
      </div>
      <div className="navbar-actions">
        <button 
          v-for="tab in ['search', 'seats', 'history']" 
          :key="tab"
          :class="['nav-btn', activeTab === tab ? 'active' : '']"
          @click="activeTab = tab"
        >
          <span v-if="tab === 'search'">📚 도서 검색 &amp; 대출</span>
          <span v-else-if="tab === 'seats'">🪑 열람실 좌석 예약</span>
          <span v-else>📋 내 대출/예약 내역 ({{ loans.length + seatReservations.filter(s => s.userName === userNameInput).length }})</span>
        </button>
      </div>
    </header>

    <!-- Main Tabbed Layouts -->
    <div v-if="activeTab === 'search'" class="search-tab-grid">
      
      <!-- Left Category Sidebar -->
      <aside class="panel-section column-categories">
        <div class="panel-header">
          <h2>📁 도서 분류</h2>
        </div>
        <div class="cat-list">
          <button 
            v-for="cat in ['전체', '소설', '과학', '인문', '철학']" 
            :key="cat"
            :class="[selectedCategory === cat ? 'active' : '']"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="available-filter-box">
          <label class="checkbox-container">
            <input type="checkbox" v-model="onlyAvailable" />
            <span class="chk-label">대출 가능한 도서만 보기</span>
          </label>
        </div>

        <div class="user-identity-box">
          <h3>👤 이용자 정보 기입</h3>
          <input 
            type="text" 
            v-model="userNameInput" 
            placeholder="성함 입력 (예: 홍길동)"
            class="user-input-field"
          />
        </div>
      </aside>

      <!-- Center Book Shelf List -->
      <main class="panel-section column-bookshelf">
        <div class="panel-header search-header-row">
          <h2>📖 도서관 책장 목록</h2>
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="도서명 또는 저자 검색..." 
              class="search-bar"
            />
          </div>
        </div>

        <div class="bookshelf-grid">
          <div 
            v-for="book in filteredBooks" 
            :key="book.id" 
            :class="['book-card', !book.available ? 'rented' : '']"
          >
            <div class="book-cover-frame">
              <img :src="book.coverUrl" :alt="book.title" class="book-cover-img" />
              <div v-if="book.id === 'book-08'" class="error-badge">예외 유발 도서</div>
            </div>
            <div class="book-details">
              <span class="book-cat-tag">{{ book.category }}</span>
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
              
              <button 
                class="add-basket-btn" 
                @click="addToBasket(book)"
              >
                📥 대출 바구니 담기
              </button>
            </div>
          </div>
          <div v-if="filteredBooks.length === 0" class="empty-placeholder">
            검색 필터에 일치하는 소장 도서가 없습니다.
          </div>
        </div>
      </main>

      <!-- Right Loan Basket -->
      <aside class="panel-section column-basket">
        <div class="panel-header">
          <h2>🛒 대출 신청 바구니</h2>
        </div>

        <div class="basket-contents-wrapper">
          <div v-if="basket.length === 0" class="empty-placeholder-box">
            대출을 희망하는 도서를 왼쪽 책장에서 골라 바구니에 담아주세요.
          </div>
          <div v-else class="basket-items-list">
            <div 
              v-for="(item, index) in basket" 
              :key="item.id + '-' + index"
              class="basket-item-card"
            >
              <!-- Cover image using index mapping (Error 1) -->
              <img 
                :src="getBasketCover(item, index)" 
                alt="도서 커버" 
                class="basket-item-img"
              />
              <div class="basket-item-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.author }}</p>
                <button class="remove-item-btn" @click="removeFromBasket(index)">&times; 제외</button>
              </div>
            </div>

            <div class="basket-actions-footer">
              <div class="basket-count-lbl">총 <strong>{{ basket.length }}</strong>권 대출 검토 중</div>
              <button class="apply-loan-btn" @click="submitLoanApplication">
                📚 일괄 대출 신청하기
              </button>
            </div>
          </div>
        </div>
      </aside>

    </div>

    <!-- Seat Reservation Tab -->
    <div v-else-if="activeTab === 'seats'" class="seats-tab-grid">
      
      <!-- Left selection menu -->
      <aside class="panel-section column-room-selection">
        <div class="panel-header">
          <h2>🚪 열람실 선택</h2>
        </div>
        <div class="room-buttons">
          <button 
            v-for="room in ['제1열람실', '제2열람실']" 
            :key="room"
            :class="[selectedRoom === room ? 'active' : '']"
            @click="selectRoom(room)"
          >
            {{ room }}
          </button>
        </div>

        <div class="seat-legend-box">
          <h3>📌 좌석 상태 예제</h3>
          <div class="legend-row"><span class="legend-dot avail"></span><span>예약 가능 좌석</span></div>
          <div class="legend-row"><span class="legend-dot selected"></span><span>내가 선택한 좌석</span></div>
          <div class="legend-row"><span class="legend-dot occupied"></span><span>이용 중인 좌석</span></div>
        </div>

        <div class="user-identity-box">
          <h3>👤 이용자 정보 기입</h3>
          <input 
            type="text" 
            v-model="userNameInput" 
            placeholder="성함 입력"
            class="user-input-field"
          />
        </div>
      </aside>

      <!-- Center Floor Plan Seat Map -->
      <main class="panel-section column-seatmap">
        <div class="panel-header">
          <h2>🗺️ {{ selectedRoom }} 좌석 배치도 및 도메인 평면도</h2>
        </div>

        <div class="floorplan-layout-canvas">
          <div class="entrance-bar">🚪 주출입구 (ENTRANCE)</div>
          
          <div class="seats-matrix-container">
            <div 
              v-for="seat in mockSeatsList" 
              :key="seat"
              :class="['seat-block', getSeatStatusClass(seat)]"
              @click="handleSelectSeat(seat)"
            >
              <div class="seat-id-lbl">{{ seat }}</div>
            </div>
          </div>

          <div class="bookshelves-deco-bar">📚 벽면 모바일 자료실 서가 구역</div>
        </div>
      </main>

      <!-- Right Seat Summary Check -->
      <aside class="panel-section column-seat-checkout">
        <div class="panel-header">
          <h2>🪑 좌석 예약 신청서</h2>
        </div>

        <div class="seat-checkout-card">
          <div v-if="!selectedSeat" class="empty-placeholder-box">
            좌석 배치도에서 이용할 좌석을 클릭하여 지정해 주십시오.
          </div>
          <div v-else class="checkout-active-info">
            <div class="checkout-row">
              <span>선택 좌석 코드:</span>
              <strong class="text-teal">{{ selectedSeat }}</strong>
            </div>
            <div class="checkout-row">
              <span>지정 열람실:</span>
              <strong>{{ selectedSeatRoom }}</strong>
            </div>

            <button class="commit-seat-btn" @click="submitSeatReservation">
              🪑 좌석 예약 확정하기
            </button>
          </div>
        </div>
      </aside>

    </div>

    <!-- History Tab -->
    <div v-else class="panel-section history-tab-layout">
      <div class="panel-header">
        <h2>📋 도서 대출 및 좌석 예약 종합 내역</h2>
        <p class="subtitle">현재 데이터베이스에 적재된 대출 상태를 실시간 체크합니다.</p>
      </div>

      <div class="history-grid-split">
        
        <!-- Book Loan Lists -->
        <div class="history-column">
          <h3>📖 도서 대출 승인 내역 ({{ loans.length }}건)</h3>
          <div class="loans-vertical-scroll">
            <div v-if="loans.length === 0" class="empty-placeholder">최근 대출 승인 정보가 비어 있습니다.</div>
            <div 
              v-for="loan in loans" 
              :key="loan.id" 
              class="history-card loan-card-item"
            >
              <div class="history-card-head">
                <span class="card-date">{{ loan.date }}</span>
                <button class="btn-return" @click="returnBook(loan.id)">반납하기</button>
              </div>
              <h4>{{ loan.bookTitle }}</h4>
              <p>대출인: <strong>{{ loan.userName }}</strong></p>
              <p class="card-id-lbl">No.{{ loan.id }}</p>
            </div>
          </div>
        </div>

        <!-- Seat Reservation Lists -->
        <div class="history-column">
          <h3>🪑 열람실 좌석 배정 내역 ({{ seatReservations.length }}건)</h3>
          <div class="seats-vertical-scroll">
            <div v-if="seatReservations.length === 0" class="empty-placeholder">현재 예약된 좌석이 없습니다.</div>
            <div 
              v-for="res in seatReservations" 
              :key="res.roomName + '-' + res.seatId" 
              class="history-card seat-card-item"
            >
              <div class="history-card-head">
                <span class="card-date">이용 중</span>
                <button class="btn-cancel" @click="cancelSeat(res.seatId, res.roomName)">예약 취소</button>
              </div>
              <h4>{{ res.roomName }} - {{ res.seatId }}</h4>
              <p>이용자: <strong>{{ res.userName }}</strong></p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Toast container alerts -->
    <div class="toast-container">
      <div 
        v-for="t in toasts" 
        :key="t.id" 
        :class="['toast-card', t.type]"
      >
        <span class="toast-icon">
          {{ t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️' }}
        </span>
        <span class="toast-message">{{ t.message }}</span>
        <button class="toast-close" @click="removeToast(t.id)">&times;</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    // DB state
    const books = ref([]);
    const loans = ref([]);
    const seatReservations = ref([]);

    // Tabs & Filters
    const activeTab = ref('search');
    const selectedCategory = ref('전체');
    const onlyAvailable = ref(false);
    const searchQuery = ref('');
    
    // User info
    const userNameInput = ref('홍길동');

    // Basket
    const basket = ref([]);

    // Seat reservation states
    const selectedRoom = ref('제1열람실');
    const selectedSeat = ref(null);
    const selectedSeatRoom = ref(null);

    // Mock seats matrix
    const mockSeatsList = [
      'A-01', 'A-02', 'A-03', 'A-04',
      'B-01', 'B-02', 'B-03', 'B-04',
      'C-01', 'C-02', 'C-03', 'C-04',
      'D-01', 'D-02', 'D-03', 'D-04'
    ];

    // UI state
    const toasts = ref([]);

    onMounted(() => {
      loadBooks();
      loadLoans();
      loadSeats();
    });

    const loadBooks = async () => {
      try {
        const res = await fetch('/api/books');
        const data = await res.json();
        books.value = data;
      } catch (err) {
        showToast('도서 DB 로딩 실패', 'danger');
      }
    };

    const loadLoans = async () => {
      try {
        const res = await fetch('/api/loans');
        const data = await res.json();
        loans.value = data;
      } catch (err) {
        showToast('대출 현황 조회 실패', 'danger');
      }
    };

    const loadSeats = async () => {
      try {
        const res = await fetch('/api/seats');
        const data = await res.json();
        seatReservations.value = data;
      } catch (err) {
        showToast('좌석 정보 조회 실패', 'danger');
      }
    };

    const filteredBooks = computed(() => {
      return books.value.filter(b => {
        const matchesCategory = selectedCategory.value === '전체' || b.category === selectedCategory.value;
        const matchesSearch = b.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                              b.author.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesAvailable = !onlyAvailable.value || b.available;
        return matchesCategory && matchesSearch && matchesAvailable;
      });
    });

    const addToBasket = (book) => {
      basket.value.push(book);
      showToast(`${book.title} 도서가 대출 바구니에 추가되었습니다.`, 'success');
    };

    const removeFromBasket = (index) => {
      basket.value.splice(index, 1);
    };

    // Error 1: Cover changes when filter changes
    const getBasketCover = (item, index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: 오류 카테고리 (Frontend)
      // DESCRIPTION: 도서 바구니에 담긴 아이템의 표지 이미지를 가져올 때, 도서 고유의 coverUrl 필드를 직접 사용하지 않고
      // 현재 필터링된 도서 목록(filteredBooks)의 동일 인덱스(index)를 기준으로 불러오도록 조작합니다.
      // 이로 인해 사용자가 책장에 도서를 담아두고 다른 카테고리 필터로 탐색 영역을 바꾸면 
      // 바구니 속 책 제목은 유지되나 이미지는 바뀐 도서의 것으로 변경되어 화면 불일치 결함이 일어납니다.
      if (filteredBooks.value && filteredBooks.value[index]) {
        return filteredBooks.value[index].coverUrl;
      }
      return item.coverUrl;
    };

    const submitLoanApplication = async () => {
      if (!userNameInput.value.trim()) {
        showToast('대출 신청자 성함을 기입하셔야 대출이 가능합니다.', 'warning');
        return;
      }

      let successCount = 0;
      let failMessage = '';

      for (const book of basket.value) {
        try {
          const res = await fetch('/api/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookId: book.id,
              userName: userNameInput.value
            })
          });
          const data = await res.json();
          if (res.ok) {
            successCount++;
          } else {
            failMessage = data.error || '대출 처리 실패';
          }
        } catch (err) {
          failMessage = '서버 통신 실패';
        }
      }

      if (successCount > 0) {
        showToast(`${successCount}권의 도서 대출 신청이 승인되었습니다.`, 'success');
        basket.value = [];
        loadLoans();
      }

      if (failMessage) {
        showToast(`[대출 실패 안내] ${failMessage}`, 'danger');
      }
    };

    const returnBook = async (loanId) => {
      try {
        const res = await fetch(`/api/loans/${loanId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          showToast('도서 반납 처리가 완료되었습니다.', 'success');
          loadLoans();
        }
      } catch (err) {
        showToast('도서 반납 통신 에러', 'danger');
      }
    };

    const selectRoom = (roomName) => {
      selectedRoom.value = roomName;

      // INTENTIONAL_ERROR
      // CATEGORY: 오류 카테고리 (Frontend)
      // DESCRIPTION: 사용자가 어떤 열람실 방에서 좌석을 고른(A-12 등) 다음 다른 열람실로 
      // 방 필터를 변경할 때, 기존에 찜해 두었던 좌석 코드(selectedSeat) 변수 정보를 null 상태로 초기화하지 않습니다.
      // 이로 인해 예약 요약 카드에는 새로 바뀐 열람실의 좌석인 것처럼 구식 데이터가 겹쳐서 표시되는 모순을 낳습니다.
      // 원래 해야 할 아래 초기화 코드를 누락시킵니다:
      // selectedSeat.value = null;
    };

    const handleSelectSeat = (seatId) => {
      selectedSeat.value = seatId;
      selectedSeatRoom.value = selectedRoom.value;
    };

    const getSeatStatusClass = (seatId) => {
      const isSelected = selectedSeat.value === seatId && selectedSeatRoom.value === selectedRoom.value;
      if (isSelected) return 'selected';

      const isOccupied = seatReservations.value.some(s => s.seatId === seatId && s.roomName === selectedRoom.value);
      if (isOccupied) return 'occupied';

      return 'avail';
    };

    const submitSeatReservation = async () => {
      if (!userNameInput.value.trim()) {
        showToast('이용자 정보를 작성해야 좌석 배정이 가능합니다.', 'warning');
        return;
      }

      try {
        const res = await fetch('/api/seats/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seatId: selectedSeat.value,
            roomName: selectedSeatRoom.value,
            userName: userNameInput.value
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`${selectedSeatRoom.value} ${selectedSeat.value} 좌석 예약이 배정되었습니다.`, 'success');
          selectedSeat.value = null;
          loadSeats();
          activeTab.value = 'history';
        } else {
          showToast(`예약 불가: ${data.error}`, 'danger');
        }
      } catch (err) {
        showToast('좌석 예약 통신 중 예외 에러', 'danger');
      }
    };

    const cancelSeat = async (seatId, roomName) => {
      try {
        const res = await fetch('/api/seats/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatId, roomName })
        });
        if (res.ok) {
          showToast('열람실 좌석 반납이 정상 완료되었습니다.', 'success');
          loadSeats();
        }
      } catch (err) {
        showToast('좌석 반납 요청 실패', 'danger');
      }
    };

    const showToast = (message, type = 'info') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    };

    const removeToast = (id) => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    };

    return {
      books,
      loans,
      seatReservations,
      activeTab,
      selectedCategory,
      onlyAvailable,
      searchQuery,
      userNameInput,
      basket,
      selectedRoom,
      selectedSeat,
      selectedSeatRoom,
      mockSeatsList,
      toasts,
      filteredBooks,
      addToBasket,
      removeFromBasket,
      getBasketCover,
      submitLoanApplication,
      returnBook,
      selectRoom,
      handleSelectSeat,
      getSeatStatusClass,
      submitSeatReservation,
      cancelSeat,
      removeToast
    };
  }
}
</script>
