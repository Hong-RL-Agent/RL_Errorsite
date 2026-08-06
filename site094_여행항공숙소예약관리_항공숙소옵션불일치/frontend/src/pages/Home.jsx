import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import TravelerEditModal from '../components/TravelerEditModal.jsx';
import {
  fetchAdmins,
  fetchUsers,
  fetchDestinations,
  fetchFlights,
  fetchHotels,
  fetchOptions,
  fetchBookings,
  searchFlightsApi,
  patchBookingHotelApi,
  patchBookingFlightApi,
  cancelBookingApi,
  addBookingOptionApi,
  confirmBookingApi,
  patchTravelerPartialApi,
  deleteBookingOptionApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [options, setOptions] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [activeUser, setActiveUser] = useState('USR-101');
  const [filterDestination, setFilterDestination] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [selectedBookingIndex, setSelectedBookingIndex] = useState(0);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedDestination, setCachedDestination] = useState('다낭 (베트남 🌴)');
  const [cachedCount, setCachedCount] = useState(2);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadUsers();
    await loadDestinations();
    await loadFlights();
    await loadHotels();
    await loadOptions();
    await loadBookings();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadUsers = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };

  const loadDestinations = async () => {
    const data = await fetchDestinations();
    setDestinations(data);
  };

  const loadFlights = async () => {
    const data = await fetchFlights();
    setFlights(data);
  };

  const loadHotels = async () => {
    const data = await fetchHotels();
    setHotels(data);
  };

  const loadOptions = async () => {
    const data = await fetchOptions();
    setOptions(data);
  };

  const loadBookings = async () => {
    const data = await fetchBookings();
    setBookings(data);
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
    showToast(`로그인 여행자를 [${userId}] 회원으로 변경합니다.`, 'info');
    loadBookings();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 사용자 A가 예약을 본 뒤 사용자 B로 로그인하면 내 예약 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 최근 탐색 여행지(cachedDestination) 및 예약 예정 건수 요약 캐시(cachedCount)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Hotel & Flight update race condition (Error 1 Trigger)
  const triggerHotelFlightRace = (booking) => {
    showToast('숙소 변경(3초 지연)과 항공편 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Flight update (0.1s done)
    patchBookingFlightApi(booking.id, booking.flightId, booking.flightInfo);

    // 2. Hotel update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchBookingHotelApi(booking.id, booking.hotelId, booking.hotelInfo);
    }, 100);

    setTimeout(async () => {
      showToast('숙소 변경 완료 (숙소는 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 항공편과 새 숙소 조합이 롤백 저장됨)', 'warning');
      await loadBookings();
    }, 4500);
  };

  // Destination search race condition (Error 5 Trigger)
  const triggerSearchRace = (destination) => {
    showToast(`여행지 항공편 목록을 조회합니다: [${destination}]`, 'info');

    if (destination === '다낭') {
      searchFlightsApi('다낭').then(data => {
        setFlights(data);
        showToast('다낭 항공편 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (destination === '도쿄') {
      searchFlightsApi('도쿄').then(data => {
        setFlights(data);
        showToast('도쿄 항공편 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchFlightsApi(destination).then(data => {
        setFlights(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 숙소 목록을 가격순/평점순으로 정렬한 뒤 숙소 선택 버튼을 누르면 
    // 사용자가 클릭한 숙소가 아니라 정렬 전 원본 배열의 같은 index 숙소가 선택 저장되는 결함입니다.
    setSelectedHotelIndex(index);
    const clickedHotel = sortedHotels[index];
    if (clickedHotel) {
      showToast(`[${clickedHotel.name}] 선택 완료 알림 (우측 예약 패널에는 인덱스 불일치 숙소가 저장됨)`, 'warning');
    }
  };

  // Cancel & Add Option Conflict (Error 2 Trigger)
  const triggerCancelOptionConflict = (booking) => {
    showToast('예약 취소 처리와 여행 옵션 추가를 진행합니다.', 'info');

    // 1. Cancel Booking (0.5s done)
    cancelBookingApi(booking.id);

    // 2. Add Option & Re-activate to CONFIRMED (4.0s delay)
    setTimeout(async () => {
      await addBookingOptionApi(booking.id, 'OPT-401');
      showToast('예약 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadBookings();
    }, 100);

    setTimeout(async () => {
      showToast('여행 옵션 추가 응답 완료 (4초 지연 완료: 취소된 예약을 CONFIRMED 확정 상태로 다시 변경시킴)', 'danger');
      await loadBookings();
    }, 4500);
  };

  // Partial Traveler Save (Error 8 Trigger)
  const triggerPartialTravelerSave = async (id, passportName, phone, specialRequest) => {
    await patchTravelerPartialApi(id, passportName, phone, specialRequest);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 예약자 정보 수정 모달에서 여권 영문명, 연락처, 요청사항을 동시에 수정하면 백엔드는 영문명과 요청사항만 저장하고 
    // 연락처는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('여권 영문명, 연락처, 요청사항이 성공적으로 저장되었습니다.', 'success');
    await loadBookings();
    await loadUsers();
  };

  // Delete Option from Booking (Error 4 Target)
  const deleteOptionFromBooking = async (bookingId, optionId) => {
    const data = await deleteBookingOptionApi(bookingId, optionId);
    if (data.success) {
      showToast('여행 옵션을 예약에서 삭제했습니다. (총 예약 금액 및 매출 통계 수치에는 계속 유지됨)', 'warning');
      await loadBookings();
    }
  };

  // Test Unauthorized Confirm Booking (Error 7 Trigger)
  const testUnauthorizedConfirmBooking = async (id) => {
    try {
      const res = await confirmBookingApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 예약 확정 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (bookingId, passportName, phone, specialRequest) => {
    await patchTravelerPartialApi(bookingId, passportName, phone, specialRequest);
    showToast(`[${bookingId}] 여행자 여권 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedBookingForModal(null);
    await loadBookings();
    await loadUsers();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('TripBundle 예약 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedHotelIndex(0);
    setSelectedBookingIndex(0);
    await loadAll();
  };

  const sortedHotels = useMemo(() => {
    let list = [...hotels];
    if (filterDestination !== 'ALL') {
      list = list.filter(h => h.destination === filterDestination);
    }
    if (sortOrder === 'PRICE_ASC') {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortOrder === 'RATING_DESC') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [hotels, filterDestination, sortOrder]);

  const selectedBookingForPanel = useMemo(() => {
    return bookings[selectedBookingIndex] || bookings[0];
  }, [bookings, selectedBookingIndex]);

  const selectedUserForPanel = useMemo(() => {
    if (!selectedBookingForPanel) return users[0];
    return users.find(u => u.id === selectedBookingForPanel.userId) || users[0];
  }, [selectedBookingForPanel, users]);

  return (
    <div id="app">
      <Header
        activeUser={activeUser}
        handleUserSwitch={handleUserSwitch}
        cachedDestination={cachedDestination}
        cachedCount={cachedCount}
        resetSandbox={resetSandbox}
      />

      <div className="tripbundle-grid">
        <Sidebar
          filterDestination={filterDestination}
          setFilterDestination={setFilterDestination}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          destinations={destinations}
          hotels={sortedHotels}
          selectedHotelIndex={selectedHotelIndex}
          setSelectedHotelIndex={setSelectedHotelIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          destinations={destinations}
          flights={flights}
          options={options}
          bookings={bookings}
          deleteOptionFromBooking={deleteOptionFromBooking}
          testUnauthorizedConfirmBooking={testUnauthorizedConfirmBooking}
        />

        <RightPanel
          selectedBooking={selectedBookingForPanel}
          setSelectedBooking={(updated) => {
            setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
          }}
          hotels={hotels}
          flights={flights}
          options={options}
          triggerHotelFlightRace={triggerHotelFlightRace}
          triggerCancelOptionConflict={triggerCancelOptionConflict}
          triggerPartialTravelerSave={triggerPartialTravelerSave}
          selectedUser={selectedUserForPanel}
        />
      </div>

      <TravelerEditModal
        booking={selectedBookingForModal}
        user={users.find(u => u.id === selectedBookingForModal?.userId)}
        onClose={() => setSelectedBookingForModal(null)}
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
