'use client';
import React from 'react';
import { Search, Calendar, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';

export default function OrderFilterBar({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  paymentStatus,
  setPaymentStatus,
  deliveryStatus,
  setDeliveryStatus,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onResetFilters
}) {
  return (
    <div className="filter-container">
      {/* 1행: 검색 및 날짜 범위 */}
      <div className="filter-row">
        <div className="search-input-group">
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="주문번호(ORD-), 고객명, 연락처 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="date-range-group">
          <Calendar size={15} color="#94a3b8" />
          <span>주문 기간:</span>
          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span>~</span>
          <input
            type="date"
            className="date-input"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* 2행: 결제/배송 필터 및 정렬 */}
      <div className="filter-row" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="select-box"
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value)}
          >
            <option value="">전체 결제 상태</option>
            <option value="PAID">결제 완료 (PAID)</option>
            <option value="WAITING">입금 대기 (WAITING)</option>
            <option value="CANCELLED">결제 취소 (CANCELLED)</option>
            <option value="REFUND_REQUESTED">환불 요청 (REFUND_REQUESTED)</option>
            <option value="REFUNDED">환불 완료 (REFUNDED)</option>
          </select>

          <select
            className="select-box"
            value={deliveryStatus}
            onChange={e => setDeliveryStatus(e.target.value)}
          >
            <option value="">전체 배송 상태</option>
            <option value="PENDING">배송 대기 (PENDING)</option>
            <option value="PREPARING">배송 준비중 (PREPARING)</option>
            <option value="SHIPPING">배송 중 (SHIPPING)</option>
            <option value="DELIVERED">배송 완료 (DELIVERED)</option>
            <option value="CANCELLED">배송 취소 (CANCELLED)</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="필터 조건을 기본값으로 재설정합니다."
          >
            <RotateCcw size={13} />
            <span>필터 초기화</span>
          </button>
        </div>

        {/* 정렬 드롭다운 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={14} color="#64748b" />
          <select
            className="select-box"
            value={`${sortField}_${sortOrder}`}
            onChange={e => {
              const val = e.target.value;
              if (val === 'order_date_asc') {
                setSortField('order_date');
                setSortOrder('asc');
              } else if (val === 'order_date_desc') {
                setSortField('order_date');
                setSortOrder('desc');
              } else if (val === 'total_amount_desc') {
                setSortField('total_amount');
                setSortOrder('desc');
              } else {
                setSortField('id');
                setSortOrder('desc');
              }
            }}
          >
            <option value="id_desc">최신 주문 등록순</option>
            <option value="order_date_desc">주문 일시 최신순</option>
            <option value="order_date_asc">주문 일시 오래된순</option>
            <option value="total_amount_desc">결제 금액 높은순</option>
          </select>
        </div>
      </div>
    </div>
  );
}
