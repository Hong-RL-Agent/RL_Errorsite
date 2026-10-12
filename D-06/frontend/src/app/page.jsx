'use client';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatCards from '../components/StatCards';
import OrderFilterBar from '../components/OrderFilterBar';
import OrderTable from '../components/OrderTable';
import OrderDetailModal from '../components/OrderDetailModal';
import DeliveryStatusModal from '../components/DeliveryStatusModal';
import CancelOrderModal from '../components/CancelOrderModal';
import RefundApproveModal from '../components/RefundApproveModal';
import CustomerListModal from '../components/CustomerListModal';
import { fetchStats, fetchOrders, resetDatabase } from '../lib/api';

export default function OrderPilotApp() {
  const [activeView, setActiveView] = useState('orders');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);

  // 검색 및 필터 상태
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // 모달 상태
  const [detailOrder, setDetailOrder] = useState(null);
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [refundOrder, setRefundOrder] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // 토스트 & 리셋 상태
  const [toastMessage, setToastMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [search, startDate, endDate, paymentStatus, deliveryStatus, sortField, sortOrder, page]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        fetchStats(),
        fetchOrders({
          search,
          startDate,
          endDate,
          paymentStatus,
          deliveryStatus,
          sort: sortField,
          order: sortOrder,
          page,
          limit: 10
        })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) {
        setOrders(ordersRes.data);
        setPagination(ordersRes.pagination);
      }
    } catch (err) {
      console.error(err);
      showToast('주문 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  }

  function handleResetFilters() {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPaymentStatus('');
    setDeliveryStatus('');
    setSortField('id');
    setSortOrder('desc');
    setPage(1);
    showToast('필터가 기본값으로 초기화되었습니다.');
  }

  async function handleResetDatabase() {
    try {
      setIsResetting(true);
      const res = await resetDatabase();
      if (res.success) {
        showToast('데이터베이스 및 모든 조회 상태가 초기 75건 주문으로 복원되었습니다.');
        handleResetFilters();
      }
    } catch (err) {
      console.error(err);
      showToast('데이터 초기화에 실패했습니다.');
    } finally {
      setIsResetting(false);
    }
  }

  // 현재 필터 컨텍스트 객체
  const filterContext = {
    search,
    startDate,
    endDate,
    paymentStatus,
    deliveryStatus,
    sortField,
    sortOrder,
    page
  };

  return (
    <div>
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onReset={handleResetDatabase}
        isResetting={isResetting}
        onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
      />

      <main className="page-container">
        {/* 상단 KPI 지표 */}
        <StatCards stats={stats} />

        {/* 메인 주문 목록 카드 */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">이커머스 통합 주문 및 배송 관리</h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              총 {pagination.total}건의 주문 내역
            </span>
          </div>

          <div className="card-body">
            {/* 필터 및 검색 바 */}
            <OrderFilterBar
              search={search}
              setSearch={s => { setSearch(s); setPage(1); }}
              startDate={startDate}
              setStartDate={d => { setStartDate(d); setPage(1); }}
              endDate={endDate}
              setEndDate={d => { setEndDate(d); setPage(1); }}
              paymentStatus={paymentStatus}
              setPaymentStatus={p => { setPaymentStatus(p); setPage(1); }}
              deliveryStatus={deliveryStatus}
              setDeliveryStatus={del => { setDeliveryStatus(del); setPage(1); }}
              sortField={sortField}
              setSortField={setSortField}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onResetFilters={handleResetFilters}
            />

            {/* 주문 데이터 테이블 */}
            <OrderTable
              orders={orders}
              loading={loading}
              pagination={pagination}
              onPageChange={setPage}
              onOpenDetail={setDetailOrder}
              onOpenDeliveryModal={setDeliveryOrder}
              onOpenCancelModal={setCancelOrder}
              onOpenRefundModal={setRefundOrder}
            />
          </div>
        </div>
      </main>

      {/* 모달 레이아웃들 */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          filterContext={filterContext}
          onClose={() => setDetailOrder(null)}
          onRefresh={loadDashboard}
          onShowToast={showToast}
        />
      )}

      {deliveryOrder && (
        <DeliveryStatusModal
          order={deliveryOrder}
          filterContext={filterContext}
          onClose={() => setDeliveryOrder(null)}
          onRefresh={loadDashboard}
          onShowToast={showToast}
        />
      )}

      {cancelOrder && (
        <CancelOrderModal
          order={cancelOrder}
          filterContext={filterContext}
          onClose={() => setCancelOrder(null)}
          onRefresh={loadDashboard}
          onShowToast={showToast}
        />
      )}

      {refundOrder && (
        <RefundApproveModal
          order={refundOrder}
          filterContext={filterContext}
          onClose={() => setRefundOrder(null)}
          onRefresh={loadDashboard}
          onShowToast={showToast}
        />
      )}

      <CustomerListModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      {/* 토스트 알림 바 */}
      {toastMessage && (
        <div className="toast-bar">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
