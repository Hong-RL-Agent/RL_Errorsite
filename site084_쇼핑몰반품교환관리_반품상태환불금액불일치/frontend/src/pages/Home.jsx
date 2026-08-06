import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchOrders,
  fetchReturns,
  searchReturnsApi,
  fetchExchanges,
  fetchInquiries,
  patchPickupDateApi,
  patchReasonApi,
  cancelReturnApi,
  approveRefundApi,
  deleteReturnApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  const [activeAdmin, setActiveAdmin] = useState('ADM-01');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterReason, setFilterReason] = useState('ALL');
  const [refundSortOrder, setRefundSortOrder] = useState('NONE');

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale pickupDate cache for Error 1
  const [previousPickupDateCache, setPreviousPickupDateCache] = useState('2026-08-06');

  // Session stats cache (Error 6 Target)
  const [cachedRefundAmount, setCachedRefundAmount] = useState(189000);
  const [cachedPickupDateMemo, setCachedPickupDateMemo] = useState('2026-08-06 기사 방문 (김철수)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadOrders();
    await loadReturns();
    await loadExchanges();
    await loadInquiries();
  };

  const loadOrders = async () => {
    const data = await fetchOrders();
    setOrders(data);
  };

  const loadReturns = async () => {
    const data = await fetchReturns();
    setReturns(data);
    if (data.length > 0 && !selectedReturn) {
      setSelectedReturn(data[0]);
      setPreviousPickupDateCache(data[0].pickupDate);
    }
  };

  const loadExchanges = async () => {
    const data = await fetchExchanges();
    setExchanges(data);
  };

  const loadInquiries = async () => {
    const data = await fetchInquiries();
    setInquiries(data);
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

  // Admin Session Switch (Error 6 Target)
  const handleAdminSwitch = (adminId) => {
    setActiveAdmin(adminId);
    showToast(`로그인 관리자 계정을 [${adminId}] 회원으로 변경합니다.`, 'info');
    loadReturns();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 관리자 A가 본 반품 상세를 열어둔 상태에서 관리자 B로 로그인하면 반품 목록은 B 권한 기준으로 바뀌지만, 
    // 오른쪽 환불 금액, 수거 일정, 처리 메모 캐시(cachedRefundAmount, cachedPickupDateMemo)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Reason & Pickup Date update race (Error 1 Trigger)
  const triggerReasonPickupRace = (ret) => {
    showToast('반품 수거 일정 변경과 사유 조정을 순차 요청합니다.', 'info');

    patchPickupDateApi(ret.id, ret.pickupDate);

    setTimeout(() => {
      patchReasonApi(ret.id, ret.reason, previousPickupDateCache);
    }, 100);

    setPreviousPickupDateCache(ret.pickupDate);

    setTimeout(async () => {
      showToast('사유 변경 완료 (사유는 갱신되었으나 3초 지연 완료로 수거 일정이 이전 날짜로 롤백 저장됨)', 'warning');
      await loadReturns();
    }, 4500);
  };

  // Status & Reason search race condition (Error 5 Trigger)
  const triggerSearchRace = (status, reason) => {
    showToast(`반품 목록 필터를 조회합니다: [${status} / ${reason}]`, 'info');

    if (status === 'REQUESTED') {
      searchReturnsApi('REQUESTED', reason).then(data => {
        setReturns(data);
        showToast('신청 상태 반품 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (status === 'APPROVED') {
      searchReturnsApi('APPROVED', reason).then(data => {
        setReturns(data);
        showToast('승인 상태 반품 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchReturnsApi(status, reason).then(data => {
        setReturns(data);
      });
    }
  };

  // Refund Amount Sort Approve Index Mismatch (Error 3 Target)
  const confirmRefundApprove = async (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 반품 목록을 환불금액순으로 정렬한 뒤 승인 버튼을 누르면 
    // 사용자가 클릭한 반품건이 아니라 정렬 전 배열의 같은 index 반품건이 승인되어 저장되는 결함입니다.
    const targetReturn = returns[index];
    if (!targetReturn) {
      showToast('반품 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }

    showToast(`[주문 ${targetReturn.orderId}] 환불 승인 알림 표시 완료 (실제 backend DB에는 인덱스 불일치 주문번호로 저장됨)`, 'warning');
    await approveRefundApi(targetReturn.id, 'ADMIN');
    await loadReturns();
  };

  // Cancel Return & Approve Conflict (Error 2 Trigger)
  const triggerCancelApproveConflict = (ret) => {
    showToast('반품 취소 처리와 환불 승인을 진행합니다.', 'info');

    // 1. Cancel Return (0.5s done)
    cancelReturnApi(ret.id);

    // 2. Approve Refund & Re-activate (4.0s delay)
    setTimeout(async () => {
      await approveRefundApi(ret.id, 'ADMIN');
      showToast('반품 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadReturns();
    }, 100);

    setTimeout(async () => {
      showToast('환불 승인 완료 (4초 지연 완료: 취소된 반품을 다시 APPROVED 환불승인 상태로 재활성화시킴)', 'danger');
      await loadReturns();
    }, 4500);
  };

  // Delete Return (Error 4 Target)
  const deleteReturn = async (id) => {
    const data = await deleteReturnApi(id);
    if (data.success) {
      showToast('반품 요청을 삭제했습니다. (상품별 반품률 및 월별 환불 금액 통계 수치에는 계속 유지됨)', 'warning');
      await loadReturns();
    }
  };

  // Test Unauthorized Refund Approve (Error 7 Trigger)
  const testUnauthorizedRefundApprove = async (id) => {
    try {
      const res = await approveRefundApi(id, 'GUEST_STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('ReturnHub 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedReturn(null);
    await loadAll();
  };

  const sortedReturns = useMemo(() => {
    let list = [...returns];
    if (filterStatus !== 'ALL') {
      list = list.filter(r => r.status === filterStatus);
    }
    if (refundSortOrder === 'REFUND_HIGH') {
      list.sort((a, b) => b.refundAmount - a.refundAmount);
    }
    return list;
  }, [returns, filterStatus, refundSortOrder]);

  const adminReturns = useMemo(() => {
    return sortedReturns.filter(r => r.adminId === activeAdmin);
  }, [sortedReturns, activeAdmin]);

  return (
    <div id="app">
      <Header
        activeAdmin={activeAdmin}
        handleAdminSwitch={handleAdminSwitch}
        cachedRefundAmount={cachedRefundAmount}
        cachedPickupDateMemo={cachedPickupDateMemo}
        resetSandbox={resetSandbox}
      />

      <div className="returnhub-grid">
        <Sidebar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterReason={filterReason}
          setFilterReason={setFilterReason}
          refundSortOrder={refundSortOrder}
          setRefundSortOrder={setRefundSortOrder}
          triggerSearchRace={triggerSearchRace}
          returns={sortedReturns}
          selectedReturn={selectedReturn}
          setSelectedReturn={setSelectedReturn}
          confirmRefundApprove={confirmRefundApprove}
        />

        <CenterSection
          returns={adminReturns}
          exchanges={exchanges}
          inquiries={inquiries}
          deleteReturn={deleteReturn}
          testUnauthorizedRefundApprove={testUnauthorizedRefundApprove}
        />

        <RightPanel
          selectedReturn={selectedReturn}
          setSelectedReturn={setSelectedReturn}
          triggerReasonPickupRace={triggerReasonPickupRace}
          triggerCancelApproveConflict={triggerCancelApproveConflict}
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
