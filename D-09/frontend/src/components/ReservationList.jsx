import React, { useState } from 'react';
import { Search, Calendar, Clock, DollarSign, FileText, XCircle, RotateCcw } from 'lucide-react';

const STATUS_FILTERS = [
  { key: 'ALL', label: '전체 상태' },
  { key: 'CONFIRMED', label: '예약 확정' },
  { key: 'COMPLETED', label: '이용 완료' },
  { key: 'CANCELLED', label: '예약 취소' }
];

const CATEGORY_FILTERS = [
  { key: 'ALL', label: '모든 서비스' },
  { key: 'GROOMING', label: '✂️ 프리미엄 미용' },
  { key: 'HOTEL', label: '🏨 펫 호텔' },
  { key: 'DAYCARE', label: '🎒 댕댕이 유치원' },
  { key: 'SPA', label: '🛁 아로마 스파&목욕' },
  { key: 'TRAINING', label: '🎓 맞춤 훈련' },
  { key: 'VET', label: '🩺 건강검진' },
  { key: 'DENTAL', label: '🦷 덴탈 케어' },
  { key: 'AGILITY', label: '🎾 실내 어질리티' }
];

export default function ReservationList({
  reservations = [],
  currentUser,
  onViewReceipt,
  onOpenReschedule,
  onCancelReservation
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterOwnerOnly, setFilterOwnerOnly] = useState(false);

  // Filtered reservations
  const filtered = reservations.filter((r) => {
    if (filterOwnerOnly && currentUser && r.user_id !== currentUser.id) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && r.service_category !== categoryFilter) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      const codeMatch = r.booking_code.toLowerCase().includes(q);
      const petMatch = r.pet_name.toLowerCase().includes(q);
      const srvMatch = r.service_name.toLowerCase().includes(q);
      if (!codeMatch && !petMatch && !srvMatch) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge-status status-confirmed">예약 확정</span>;
      case 'COMPLETED':
        return <span className="badge-status status-completed">이용 완료</span>;
      case 'CANCELLED':
        return <span className="badge-status status-cancelled">예약 취소</span>;
      default:
        return <span className="badge-status">{status}</span>;
    }
  };

  return (
    <div>
      {/* Section Banner */}
      <div className="section-banner">
        <div>
          <h2 className="section-title">
            <FileText size={22} color="#3B82A6" />
            <span>PawCare 예약 내역서 & 바우처 센터</span>
          </h2>
          <p className="section-subtitle">
            실시간 예약 현황을 확인하고, 일정 변경 및 영수증 확인서를 열람할 수 있습니다. (조회: {filtered.length}건)
          </p>
        </div>

        {/* Filter Toggle */}
        <div style={{ display: 'flex', background: '#FAF5ED', padding: '4px', borderRadius: '10px', border: '1px solid #EDE8DF' }}>
          <button
            onClick={() => setFilterOwnerOnly(false)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: !filterOwnerOnly ? '#FFFFFF' : 'transparent',
              fontWeight: '700',
              fontSize: '12px',
              color: !filterOwnerOnly ? '#3B82A6' : '#718096',
              cursor: 'pointer'
            }}
          >
            전체 예약 보기
          </button>
          <button
            onClick={() => setFilterOwnerOnly(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: filterOwnerOnly ? '#FFFFFF' : 'transparent',
              fontWeight: '700',
              fontSize: '12px',
              color: filterOwnerOnly ? '#3B82A6' : '#718096',
              cursor: 'pointer'
            }}
          >
            {currentUser ? `${currentUser.name}님 예약만` : '내 예약만'}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '18px', border: '1.5px solid #EDE8DF', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Status Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.key}
              onClick={() => setStatusFilter(sf.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: statusFilter === sf.key ? '1.5px solid #3B82A6' : '1px solid #EDE8DF',
                background: statusFilter === sf.key ? '#EBF4F6' : '#FFFFFF',
                color: statusFilter === sf.key ? '#3B82A6' : '#718096',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {sf.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px', padding: '6px 12px', fontSize: '12px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {CATEGORY_FILTERS.map((cf) => (
            <option key={cf.key} value={cf.key}>{cf.label}</option>
          ))}
        </select>

        {/* Search Field */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FAF5ED', padding: '6px 12px', borderRadius: '10px', border: '1px solid #EDE8DF', flex: 1, minWidth: '200px' }}>
          <Search size={14} color="#8C9BAE" />
          <input
            type="text"
            placeholder="예약번호, 반려동물 이름 검색..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || searchKeyword) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
              setSearchKeyword('');
            }}
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px', border: '1.5px dashed #EDE8DF' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>조건에 맞는 예약 내역이 없습니다</h3>
          <p style={{ fontSize: '13px', color: '#718096' }}>
            필터 설정을 변경하거나 새로운 케어 서비스를 예약해보세요.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((r) => (
            <div key={r.id} className="receipt-card" data-reservation-id={r.id} data-booking-code={r.booking_code}>
              {/* Receipt Header */}
              <div className="receipt-header">
                <div>
                  <div style={{ fontSize: '11px', color: '#8C9BAE', fontWeight: '700', letterSpacing: '0.5px' }}>
                    {r.booking_code}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2D3748', marginTop: '2px' }}>
                    {r.service_name}
                  </h3>
                </div>
                {getStatusBadge(r.status)}
              </div>

              {/* Pet & Owner Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FAF5ED', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '24px' }}>{r.pet_avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#2D3748' }}>
                    {r.pet_name} <span style={{ fontSize: '11px', color: '#718096', fontWeight: '500' }}>({r.pet_breed}, {r.pet_weight}kg)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#8C9BAE' }}>
                    보호자: {r.owner_name} ({r.owner_phone})
                  </div>
                </div>
              </div>

              {/* Schedule & Price Details */}
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    <span>예약 일정</span>
                  </span>
                  <span style={{ fontWeight: '700', color: '#3B82A6' }}>
                    {r.booking_date} ({r.time_slot})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={13} />
                    <span>결제 금액</span>
                  </span>
                  <span style={{ fontWeight: '800', color: '#2D3748' }}>
                    {r.total_price?.toLocaleString()}원
                  </span>
                </div>
                {r.special_request && (
                  <div style={{ background: '#FFFDF9', padding: '6px 8px', borderRadius: '6px', border: '1px solid #EDE8DF', fontSize: '11px', color: '#4A5568' }}>
                    요청: {r.special_request}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1.5px dashed #EDE8DF', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onViewReceipt(r.id)}
                  title="상세 바우처 영수증 열람"
                >
                  <FileText size={13} />
                  <span>영수증</span>
                </button>

                {r.status === 'CONFIRMED' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenReschedule(r, { serviceCategory: categoryFilter })}
                      title="예약 날짜 및 시간 변경"
                    >
                      <span>일정 변경</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onCancelReservation(r)}
                      title="예약 취소"
                      style={{ borderColor: '#FFC9C9', color: '#FA5252' }}
                    >
                      <XCircle size={13} />
                      <span>취소</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
