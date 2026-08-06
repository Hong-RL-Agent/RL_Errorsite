import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import TicketModal from '../components/TicketModal.jsx';
import {
  fetchUsers,
  fetchShows,
  fetchSeats,
  fetchReservations,
  fetchTicketLogs,
  searchSeatsApi,
  patchPurchaserApi,
  patchSeatApi,
  cancelReservationApi,
  issueTicketApi,
  patchShowPartialApi,
  deleteReservationApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [shows, setShows] = useState([]);
  const [seats, setSeats] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [ticketLogs, setTicketLogs] = useState([]);

  const [activeUser, setActiveUser] = useState('USR-001');
  const [filterGenre, setFilterGenre] = useState('ALL');
  const [filterDate, setFilterDate] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedShowIndex, setSelectedShowIndex] = useState(0);
  const [selectedReservationForModal, setSelectedReservationForModal] = useState(null);
  const [selectedReservationForPanelIndex, setSelectedReservationForPanelIndex] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Stale purchaser cache for Error 1
  const [previousPurchaserCache, setPreviousPurchaserCache] = useState('김철수');

  // Session stats cache (Error 6 Target)
  const [cachedReservationCount, setCachedReservationCount] = useState(2);
  const [cachedUpcomingShowSummary, setCachedUpcomingShowSummary] = useState('오페라의 유령 (VIP-A1석 / 08.15 19:30)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadUsers();
    await loadShows();
    await loadSeats();
    await loadReservations();
    await loadTicketLogs();
  };

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  const loadShows = async () => {
    const data = await fetchShows();
    setShows(data);
  };

  const loadSeats = async () => {
    const data = await fetchSeats();
    setSeats(data);
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);
    if (data.length > 0) {
      setPreviousPurchaserCache(data[0].userName);
    }
  };

  const loadTicketLogs = async () => {
    const data = await fetchTicketLogs();
    setTicketLogs(data);
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
    showToast(`로그인 계정을 [${userId}] 회원으로 변경합니다.`, 'info');
    loadReservations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 사용자 A가 내 티켓을 본 뒤 사용자 B로 로그인하면 티켓 목록은 B 기준으로 바뀌지만, 
    // 상단 예매 개수 및 최근 관람 예정 공연 요약 캐시(cachedReservationCount, cachedUpcomingShowSummary)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Seat & Purchaser update race (Error 1 Trigger)
  const triggerSeatPurchaserRace = (resv) => {
    showToast('좌석 변경과 예매자 정보 수정을 순차 요청합니다.', 'info');

    // 1. Purchaser info update (0.1s done) with STALE purchaser cache!
    patchPurchaserApi(resv.id, resv.userName, resv.seatNo);

    // 2. Seat update (3.0s delay)
    setTimeout(() => {
      patchSeatApi(resv.id, resv.seatNo);
    }, 100);

    setPreviousPurchaserCache(resv.userName);

    setTimeout(async () => {
      showToast('좌석 변경 완료 (좌석은 갱신되었으나 3초 지연 완료로 예매자명이 이전 이름으로 롤백 저장됨)', 'warning');
      await loadReservations();
    }, 4500);
  };

  // Date & Genre search race condition (Error 5 Trigger)
  const triggerSearchRace = (date, genre) => {
    showToast(`공연장 좌석 필터를 조회합니다: [${date} / ${genre}]`, 'info');

    if (date === '2026-08-15') {
      searchSeatsApi('2026-08-15', 'ALL').then(data => {
        setSeats(data);
        showToast('08월 15일 좌석 현황 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (date === '2026-08-16') {
      searchSeatsApi('2026-08-16', 'ALL').then(data => {
        setSeats(data);
        showToast('08월 16일 좌석 현황 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchSeatsApi(date, 'ALL').then(data => {
        setSeats(data);
      });
    }
  };

  // Popularity Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 공연 목록을 인기순 또는 날짜순으로 정렬한 뒤 예매하기 버튼을 누르면 
    // 사용자가 클릭한 공연이 아니라 정렬 전 원본 배열의 같은 index 공연 상세로 이동되어 열리는 결함입니다.
    setSelectedShowIndex(index);
    const clickedShow = sortedShows[index];
    if (clickedShow) {
      showToast(`[${clickedShow.title}] 예매하기 표시 알림 완료 (중앙 좌석 선택 화면에는 인덱스 불일치 공연 데이터가 노출됨)`, 'warning');
    }
  };

  // Cancel Reservation & Issue Ticket Conflict (Error 2 Trigger)
  const triggerCancelIssueConflict = (resv) => {
    showToast('예매 취소 처리와 티켓 재발권을 진행합니다.', 'info');

    // 1. Cancel Reservation (0.5s done)
    cancelReservationApi(resv.id);

    // 2. Issue Ticket & Re-activate (4.0s delay)
    setTimeout(async () => {
      await issueTicketApi(resv.id, 'ADMIN');
      showToast('예매 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadReservations();
    }, 100);

    setTimeout(async () => {
      showToast('티켓 재발권 완료 (4초 지연 완료: 취소된 예매를 다시 ISSUED 발권완료 상태로 재활성화시킴)', 'danger');
      await loadReservations();
    }, 4500);
  };

  // Partial Show Save (Error 8 Trigger)
  const triggerPartialShowSave = async (id, time, venue, price) => {
    await patchShowPartialApi(id, time, venue, price);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 공연 정보 수정 모달에서 공연 시간, 장소, 좌석 가격을 동시에 수정하면 백엔드는 공연 시간과 좌석 가격만 저장하고 
    // 장소는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('공연 시간, 장소, VIP 가격이 성공적으로 수정되었습니다.', 'success');
    await loadShows();
  };

  // Delete Reservation (Error 4 Target)
  const deleteReservation = async (id) => {
    const data = await deleteReservationApi(id);
    if (data.success) {
      showToast('예매 데이터를 삭제했습니다. (공연별 예매율 및 매출 통계 수치에는 계속 유지됨)', 'warning');
      await loadReservations();
    }
  };

  // Test Unauthorized Ticket Issue (Error 7 Trigger)
  const testUnauthorizedTicketIssue = async (id) => {
    try {
      const res = await issueTicketApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (reservationId, seatNo) => {
    await patchSeatApi(reservationId, seatNo);
    showToast(`[${seatNo}] 좌석으로 변경 확정되었습니다.`, 'success');
    setSelectedReservationForModal(null);
    await loadReservations();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('StageOps 예매 관제 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedShowIndex(0);
    await loadAll();
  };

  const sortedShows = useMemo(() => {
    let list = [...shows];
    if (filterGenre !== 'ALL') {
      list = list.filter(s => s.genre === filterGenre);
    }
    if (filterDate !== 'ALL') {
      list = list.filter(s => s.date === filterDate);
    }
    if (sortOrder === 'POPULARITY_DESC') {
      list.sort((a, b) => b.popularity - a.popularity);
    }
    return list;
  }, [shows, filterGenre, filterDate, sortOrder]);

  // Selected Show for Center & Panel (Error 3 Effect)
  const selectedShowForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedShows[selectedShowIndex] || shows[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted shows array
      return shows[selectedShowIndex] || shows[0];
    }
  }, [sortedShows, shows, selectedShowIndex, sortOrder]);

  const userReservations = useMemo(() => {
    return reservations.filter(r => r.userId === activeUser);
  }, [reservations, activeUser]);

  return (
    <div id="app">
      <Header
        activeUser={activeUser}
        handleUserSwitch={handleUserSwitch}
        cachedReservationCount={cachedReservationCount}
        cachedUpcomingShowSummary={cachedUpcomingShowSummary}
        resetSandbox={resetSandbox}
      />

      <div className="stageops-grid">
        <Sidebar
          filterGenre={filterGenre}
          setFilterGenre={setFilterGenre}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          shows={sortedShows}
          selectedShowIndex={selectedShowIndex}
          setSelectedShowIndex={setSelectedShowIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          seats={seats}
          reservations={userReservations}
          ticketLogs={ticketLogs}
          deleteReservation={deleteReservation}
          openTicketModal={(resv) => setSelectedReservationForModal(resv)}
          testUnauthorizedTicketIssue={testUnauthorizedTicketIssue}
        />

        <RightPanel
          selectedReservation={reservations[selectedReservationForPanelIndex] || reservations[0]}
          setSelectedReservation={(updated) => {
            setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
          }}
          triggerSeatPurchaserRace={triggerSeatPurchaserRace}
          seats={seats}
          triggerCancelIssueConflict={triggerCancelIssueConflict}
          selectedShow={selectedShowForPanel}
          triggerPartialShowSave={triggerPartialShowSave}
        />
      </div>

      <TicketModal
        reservation={selectedReservationForModal}
        seats={seats}
        onClose={() => setSelectedReservationForModal(null)}
        onConfirm={handleModalConfirm}
      />

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
