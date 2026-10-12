import React, { useState } from 'react';
import { Search, Calendar, MapPin, User, Ticket, FileText, Phone, XCircle, CheckCircle } from 'lucide-react';

const STATUS_FILTERS = [
  { key: 'ALL', label: '전체 상태' },
  { key: 'CONFIRMED', label: '참가 확정' },
  { key: 'CHECKED_IN', label: '체크인 완료' },
  { key: 'CANCELLED', label: '취소됨' }
];

export default function MyPassesView({
  registrations = [],
  currentUser,
  onViewPass,
  onEditAttendee,
  onEditContact,
  onCancelRegistration
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [userOnlyFilter, setUserOnlyFilter] = useState(false);

  const filtered = registrations.filter((r) => {
    if (userOnlyFilter && currentUser && r.user_id !== currentUser.id) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      const codeMatch = r.reg_code.toLowerCase().includes(q);
      const nameMatch = r.attendee_name.toLowerCase().includes(q);
      const titleMatch = r.event_title.toLowerCase().includes(q);
      if (!codeMatch && !nameMatch && !titleMatch) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge-status status-confirmed">참가 확정</span>;
      case 'CHECKED_IN':
        return <span className="badge-status status-checked-in">체크인 완료</span>;
      case 'CANCELLED':
        return <span className="badge-status status-cancelled">취소됨</span>;
      default:
        return <span className="badge-status">{status}</span>;
    }
  };

  return (
    <div>
      {/* Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={22} color="#7C3AED" />
            <span>나의 참가권 & 행사 신청 내역서</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            발급된 공식 전자 참가권을 확인하고, 참석자 정보 수정 및 참가 취소를 관리할 수 있습니다. (조회: {filtered.length}건)
          </p>
        </div>

        {/* User filter toggle */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setUserOnlyFilter(false)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: !userOnlyFilter ? '#FFFFFF' : 'transparent',
              fontWeight: '700',
              fontSize: '12px',
              color: !userOnlyFilter ? '#7C3AED' : '#64748B',
              cursor: 'pointer'
            }}
          >
            전체 신청 내역
          </button>
          <button
            onClick={() => setUserOnlyFilter(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: userOnlyFilter ? '#FFFFFF' : 'transparent',
              fontWeight: '700',
              fontSize: '12px',
              color: userOnlyFilter ? '#7C3AED' : '#64748B',
              cursor: 'pointer'
            }}
          >
            {currentUser ? `${currentUser.name}님 참가권만` : '내 참가권만'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.key}
              onClick={() => setStatusFilter(sf.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: statusFilter === sf.key ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
                background: statusFilter === sf.key ? '#F5F3FF' : '#FFFFFF',
                color: statusFilter === sf.key ? '#7C3AED' : '#64748B',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {sf.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', flex: 1, minWidth: '220px' }}>
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="발급번호, 참석자명, 행사명 검색..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%' }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        {(statusFilter !== 'ALL' || searchKeyword) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setStatusFilter('ALL');
              setSearchKeyword('');
            }}
          >
            초기화
          </button>
        )}
      </div>

      {/* Passes Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '20px', border: '1.5px dashed #E2E8F0' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎫</div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>조회된 참가권 내역이 없습니다</h3>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            새로운 행사를 탐색하고 참가 신청을 진행해보세요.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filtered.map((r) => (
            <div key={r.id} className="ticket-pass" data-reg-id={r.id} data-reg-code={r.reg_code}>
              <div>
                {/* Pass Header */}
                <div className="ticket-pass-header">
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '800' }}>
                      {r.reg_code}
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                      {r.event_title}
                    </h3>
                  </div>
                  {getStatusBadge(r.status)}
                </div>

                {/* Event Schedule Info */}
                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="#7C3AED" />
                    <span>{r.event_date} ({r.start_time} ~ {r.end_time})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#F97316" />
                    <span>{r.venue}</span>
                  </div>
                </div>

                {/* Attendee Info Card */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '14px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>참석자</span>
                    <span style={{ fontWeight: '800', color: '#0F172A' }}>{r.attendee_name} ({r.attendee_count}명)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>소속</span>
                    <span>{r.attendee_org || '일반'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>연락처</span>
                    <span style={{ fontWeight: '600' }}>{r.attendee_phone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>참가권 / 금액</span>
                    <span style={{ fontWeight: '800', color: '#7C3AED' }}>{r.ticket_tier} PASS ({r.total_amount?.toLocaleString()}원)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1.5px dashed #E2E8F0', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onViewPass(r.id)}
                  title="전자 참가증 상세 확인"
                >
                  <FileText size={13} />
                  <span>참가증</span>
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditAttendee(r)}
                    title="참석자 이름/소속 수정"
                  >
                    <span>참석자 수정</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditContact(r)}
                    title="긴급 연락처 변경"
                    style={{ borderColor: '#FFEDD5', color: '#EA580C' }}
                  >
                    <span>연락처</span>
                  </button>

                  {r.status === 'CONFIRMED' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onCancelRegistration(r)}
                      title="신청 취소"
                      style={{ borderColor: '#FECACA', color: '#DC2626' }}
                    >
                      <XCircle size={13} />
                      <span>취소</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
