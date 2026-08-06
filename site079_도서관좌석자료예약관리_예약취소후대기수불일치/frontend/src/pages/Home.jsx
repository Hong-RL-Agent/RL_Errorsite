import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchSeats,
  fetchBooks,
  searchBooksApi,
  fetchBookDetailApi,
  fetchReservations,
  fetchUsers,
  patchCapacityApi,
  patchTimeSlotApi,
  reserveSeatApi,
  cancelReservationApi,
  deleteReservationApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [seats, setSeats] = useState([]);
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);

  const [activeUser, setActiveUser] = useState('USER_A');
  const [filterFloor, setFilterFloor] = useState('ALL');
  const [filterSeatType, setFilterSeatType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBookCategory, setFilterBookCategory] = useState('ALL');
  const [pubYearSortOrder, setPubYearSortOrder] = useState('NONE');

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookDetail, setSelectedBookDetail] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale capacity cache for Error 1
  const [previousCapacityCache, setPreviousCapacityCache] = useState(1);

  // User session stats cache (Error 6 Target)
  const [cachedOverdueNotice, setCachedOverdueNotice] = useState('김철수 님 (연체 1건 - 반납 필요)');
  const [cachedDueDateSummary, setCachedDueDateSummary] = useState('2026-08-05 (클린 코드)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadSeats();
    await loadBooks();
    await loadReservations();
    await loadUsers();
  };

  const loadSeats = async () => {
    const data = await fetchSeats();
    setSeats(data);
    if (data.length > 0 && !selectedSeat) {
      setSelectedSeat(data[0]);
    }
  };

  const loadBooks = async () => {
    const data = await fetchBooks();
    setBooks(data);
    if (data.length > 0 && !selectedBook) {
      selectBook(data[0]);
    }
  };

  const selectBook = async (book) => {
    setSelectedBook(book);
    try {
      const detail = await fetchBookDetailApi(book.id);
      setSelectedBookDetail(detail);
    } catch (e) {
      setSelectedBookDetail(book);
    }
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);

    const userList = data.filter(r => r.userId === activeUser);
    if (userList.length > 0 && !selectedReservation) {
      setSelectedReservation(userList[0]);
      setPreviousCapacityCache(userList[0].capacity);
    }
  };

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // User Session Switch (Error 6 Target)
  const handleUserSwitch = (userId) => {
    setActiveUser(userId);
    showToast(`로그인 이용자 계정을 [${userId}] 회원으로 변경합니다.`, 'info');
    loadReservations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 이용자 A의 대출 내역을 본 뒤 이용자 B로 로그인하면 대출 목록은 B 기준으로 바뀌나, 
    // 상단 연체 알림과 반납 예정일 요약 캐시(cachedOverdueNotice, cachedDueDateSummary)를 갱신하지 않고 사용자 A 데이터로 남겨두는 결함입니다.
  };

  // TimeSlot & Capacity update race (Error 1 Trigger)
  const triggerTimeCapacityRace = (resv) => {
    showToast('스터디룸 이용 시간 변경과 인원 조정을 순차 요청합니다.', 'info');

    patchCapacityApi(resv.id, resv.capacity);

    setTimeout(() => {
      patchTimeSlotApi(resv.id, resv.timeSlot, previousCapacityCache);
    }, 100);

    setPreviousCapacityCache(resv.capacity);

    setTimeout(async () => {
      showToast('시간 변경 완료 (시간대는 갱신되었으나 3초 지연 완료로 인원이 이전 값으로 롤백 저장됨)', 'warning');
      await loadReservations();
    }, 4500);
  };

  // Category & Query search race condition (Error 5 Trigger)
  const triggerSearchRace = (query, category) => {
    showToast(`도서 검색 필터를 조회합니다: [${query} / ${category}]`, 'info');

    if (category === 'COMPUTER') {
      searchBooksApi(query, 'COMPUTER').then(data => {
        setBooks(data);
        showToast('컴퓨터/IT 자료 검색 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (category === 'LITERATURE') {
      searchBooksApi(query, 'LITERATURE').then(data => {
        setBooks(data);
        showToast('문학/소설 자료 검색 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchBooksApi(query, category).then(data => {
        setBooks(data);
      });
    }
  };

  // PubYear Sort Book Reservation Index Mismatch (Error 3 Target)
  const confirmReserveBook = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 자료 검색 결과를 출판연도순으로 정렬한 뒤 예약 버튼을 누르면 
    // 화면의 정렬 인덱스(index)를 원본 자료 배열(books)에 대입해 
    // 클릭한 도서가 아닌 엉뚱한 자료가 예약되는 결함입니다.
    const targetBook = books[index];
    if (!targetBook) {
      showToast('도서 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }
    showToast(`[${targetBook.title}] 자료 예약이 완료되었습니다. (인덱스 불일치 오예약 가능)`, 'warning');
  };

  // Reserve & Cancel Conflict (Error 2 Trigger)
  const triggerReserveCancelConflict = (resv) => {
    showToast('좌석 예약 취소와 동시 재예약을 진행합니다.', 'info');

    // 1. Cancel Reservation (4.0s delay)
    cancelReservationApi(resv.id);

    // 2. Re-reserve Seat (0.5s delay)
    setTimeout(async () => {
      await reserveSeatApi(resv.targetId, activeUser, activeUser === 'USER_A' ? '김철수' : '이영희');
      showToast('새 좌석 예약 성공 (0.5초 완료)', 'success');
      await loadSeats();
      await loadReservations();
    }, 100);

    setTimeout(async () => {
      showToast('취소 처리 응답 완료 (4초 지연 완료: 새로 완료된 새 예약까지 CANCELLED 상태로 강제 덮어씀)', 'danger');
      await loadSeats();
      await loadReservations();
    }, 4500);
  };

  // Delete Reservation (Error 4 Target)
  const deleteReservation = async (id) => {
    const data = await deleteReservationApi(id);
    if (data.success) {
      showToast('예약/대출 내역을 삭제했습니다. (자료별 대기 수 및 관리자 통계에는 계속 남아 불일치함)', 'warning');
      await loadReservations();
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('LibrarySeat 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedSeat(null);
    setSelectedBook(null);
    setSelectedReservation(null);
    await loadAll();
  };

  const sortedBooks = useMemo(() => {
    let list = [...books];
    if (filterBookCategory !== 'ALL') {
      list = list.filter(b => b.category === filterBookCategory);
    }
    if (searchQuery) {
      list = list.filter(b => b.title.includes(searchQuery) || b.author.includes(searchQuery));
    }
    if (pubYearSortOrder === 'PUB_DESC') {
      list.sort((a, b) => b.pubYear - a.pubYear);
    }
    return list;
  }, [books, filterBookCategory, searchQuery, pubYearSortOrder]);

  const userReservations = useMemo(() => {
    return reservations.filter(r => r.userId === activeUser);
  }, [reservations, activeUser]);

  return (
    <div id="app">
      <Header
        activeUser={activeUser}
        handleUserSwitch={handleUserSwitch}
        cachedOverdueNotice={cachedOverdueNotice}
        cachedDueDateSummary={cachedDueDateSummary}
        resetSandbox={resetSandbox}
      />

      <div className="libraryseat-grid">
        <Sidebar
          filterFloor={filterFloor}
          setFilterFloor={setFilterFloor}
          filterSeatType={filterSeatType}
          setFilterSeatType={setFilterSeatType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterBookCategory={filterBookCategory}
          setFilterBookCategory={setFilterBookCategory}
          pubYearSortOrder={pubYearSortOrder}
          setPubYearSortOrder={setPubYearSortOrder}
          triggerSearchRace={triggerSearchRace}
          seats={seats}
          selectedSeat={selectedSeat}
          setSelectedSeat={setSelectedSeat}
        />

        <CenterSection
          seats={seats}
          selectedSeat={selectedSeat}
          setSelectedSeat={setSelectedSeat}
          sortedBooks={sortedBooks}
          selectedBook={selectedBook}
          setSelectedBook={selectBook}
          confirmReserveBook={confirmReserveBook}
          userReservations={userReservations}
          deleteReservation={deleteReservation}
          triggerReserveCancelConflict={triggerReserveCancelConflict}
        />

        <RightPanel
          selectedReservation={selectedReservation}
          setSelectedReservation={setSelectedReservation}
          triggerTimeCapacityRace={triggerTimeCapacityRace}
          selectedBookDetail={selectedBookDetail}
        />
      </div>

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
