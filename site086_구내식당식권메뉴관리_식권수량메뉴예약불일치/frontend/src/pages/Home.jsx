import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchMenus,
  fetchTickets,
  fetchReservations,
  fetchEmployees,
  searchMenusApi,
  patchReservationMenuApi,
  patchReservationQuantityApi,
  cancelReservationApi,
  useTicketForReservationApi,
  createReservationApi,
  deleteReservationApi,
  deleteMenuUnauthorizedApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [menus, setMenus] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [activeEmp, setActiveEmp] = useState('EMP-01');
  const [filterCafeteria, setFilterCafeteria] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [popSortOrder, setPopSortOrder] = useState('NONE');

  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale menu cache for Error 1
  const [previousMenuIdCache, setPreviousMenuIdCache] = useState('MNU-101');
  const [previousMenuNameCache, setPreviousMenuNameCache] = useState('한식: 돈육 김치찌개');

  // Session stats cache (Error 6 Target)
  const [cachedRemainingTickets, setCachedRemainingTickets] = useState(22);
  const [cachedNextReservation, setCachedNextReservation] = useState('제육 볶음 2개 (08.10 점심)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadMenus();
    await loadTickets();
    await loadReservations();
    await loadEmployees();
  };

  const loadMenus = async () => {
    const data = await fetchMenus();
    setMenus(data);
    if (data.length > 0 && !selectedMenu) {
      setSelectedMenu(data[0]);
    }
  };

  const loadTickets = async () => {
    const data = await fetchTickets();
    setTickets(data);
  };

  const loadReservations = async () => {
    const data = await fetchReservations();
    setReservations(data);
    if (data.length > 0 && !selectedReservation) {
      setSelectedReservation(data[0]);
      setPreviousMenuIdCache(data[0].menuId);
      setPreviousMenuNameCache(data[0].menuName);
    }
  };

  const loadEmployees = async () => {
    const data = await fetchEmployees();
    setEmployees(data);
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

  // Employee Session Switch (Error 6 Target)
  const handleEmpSwitch = (empId) => {
    setActiveEmp(empId);
    showToast(`로그인 사원 계정을 [${empId}] 회원으로 변경합니다.`, 'info');
    loadReservations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A의 식권 내역을 본 뒤 직원 B로 로그인하면 식권 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 잔여 식권 수 및 다음 예약 요약 캐시(cachedRemainingTickets, cachedNextReservation)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Quantity & Menu update race (Error 1 Trigger)
  const triggerQuantityMenuRace = (resv) => {
    showToast('예약 메뉴 변경과 수량 조정을 순차 요청합니다.', 'info');

    patchReservationMenuApi(resv.id, resv.menuId, resv.menuName);

    setTimeout(() => {
      patchReservationQuantityApi(resv.id, resv.quantity, previousMenuIdCache, previousMenuNameCache);
    }, 100);

    setPreviousMenuIdCache(resv.menuId);
    setPreviousMenuNameCache(resv.menuName);

    setTimeout(async () => {
      showToast('수량 변경 완료 (수량은 갱신되었으나 3초 지연 완료로 예약 메뉴가 이전 메뉴로 롤백 저장됨)', 'warning');
      await loadReservations();
    }, 4500);
  };

  // Cafeteria & Type search race condition (Error 5 Trigger)
  const triggerSearchRace = (cafeteria, type) => {
    showToast(`구내식당 메뉴 필터를 조회합니다: [${cafeteria} / ${type}]`, 'info');

    if (cafeteria === 'CAFETERIA_1') {
      searchMenusApi('CAFETERIA_1', type).then(data => {
        setMenus(data);
        showToast('제1식당 메뉴 검색 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (cafeteria === 'CAFETERIA_2') {
      searchMenusApi('CAFETERIA_2', type).then(data => {
        setMenus(data);
        showToast('제2식당 메뉴 검색 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchMenusApi(cafeteria, type).then(data => {
        setMenus(data);
      });
    }
  };

  // Popularity Sort Menu Reserve Index Mismatch (Error 3 Target)
  const confirmMenuReserve = async (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 메뉴 목록을 인기순으로 정렬한 뒤 예약 버튼을 누르면 
    // 사용자가 클릭한 메뉴가 아니라 정렬 전 배열의 같은 index 메뉴가 예약되어 저장되는 결함입니다.
    const targetMenu = menus[index];
    if (!targetMenu) {
      showToast('메뉴 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }

    showToast(`[${targetMenu.name}] 예약 신청 알림 표시 완료 (실제 backend DB에는 인덱스 불일치 메뉴 id로 저장됨)`, 'warning');
    await createReservationApi('EMP-01', '김철수 팀장', targetMenu.id, targetMenu.name, 1);
    await loadReservations();
  };

  // Cancel Reservation & Use Ticket Conflict (Error 2 Trigger)
  const triggerCancelTicketConflict = (resv) => {
    showToast('메뉴 예약 취소와 식권 사용을 진행합니다.', 'info');

    // 1. Cancel Reservation (0.5s done)
    cancelReservationApi(resv.id);

    // 2. Use Ticket & Re-activate (4.0s delay)
    setTimeout(async () => {
      await useTicketForReservationApi(resv.id);
      showToast('예약 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadReservations();
    }, 100);

    setTimeout(async () => {
      showToast('식권 사용 완료 (4초 지연 완료: 취소된 예약을 다시 USED 사용완료 상태로 재활성화시킴)', 'danger');
      await loadReservations();
    }, 4500);
  };

  // Delete Reservation (Error 4 Target)
  const deleteReservation = async (id) => {
    const data = await deleteReservationApi(id);
    if (data.success) {
      showToast('메뉴 예약을 삭제했습니다. (메뉴별 예약 수량 및 식당 정산 통계 수치에는 계속 유지됨)', 'warning');
      await loadReservations();
    }
  };

  // Test Unauthorized Menu Delete (Error 7 Trigger)
  const deleteMenuUnauthorized = async (id) => {
    try {
      const res = await deleteMenuUnauthorizedApi(id, 'GUEST_EMP');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('MealPass 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedReservation(null);
    await loadAll();
  };

  const sortedMenus = useMemo(() => {
    let list = [...menus];
    if (filterCafeteria !== 'ALL') {
      list = list.filter(m => m.cafeteria === filterCafeteria);
    }
    if (popSortOrder === 'POPULAR') {
      list.sort((a, b) => b.popularity - a.popularity);
    }
    return list;
  }, [menus, filterCafeteria, popSortOrder]);

  const empReservations = useMemo(() => {
    return reservations.filter(r => r.empId === activeEmp);
  }, [reservations, activeEmp]);

  return (
    <div id="app">
      <Header
        activeEmp={activeEmp}
        handleEmpSwitch={handleEmpSwitch}
        cachedRemainingTickets={cachedRemainingTickets}
        cachedNextReservation={cachedNextReservation}
        resetSandbox={resetSandbox}
      />

      <div className="mealpass-grid">
        <Sidebar
          filterCafeteria={filterCafeteria}
          setFilterCafeteria={setFilterCafeteria}
          filterType={filterType}
          setFilterType={setFilterType}
          popSortOrder={popSortOrder}
          setPopSortOrder={setPopSortOrder}
          triggerSearchRace={triggerSearchRace}
          menus={sortedMenus}
          selectedMenu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
          confirmMenuReserve={confirmMenuReserve}
        />

        <CenterSection
          reservations={empReservations}
          tickets={tickets}
          deleteReservation={deleteReservation}
          deleteMenuUnauthorized={deleteMenuUnauthorized}
        />

        <RightPanel
          selectedReservation={selectedReservation}
          setSelectedReservation={setSelectedReservation}
          triggerQuantityMenuRace={triggerQuantityMenuRace}
          menus={menus}
          triggerCancelTicketConflict={triggerCancelTicketConflict}
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
