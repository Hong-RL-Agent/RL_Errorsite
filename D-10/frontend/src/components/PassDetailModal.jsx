import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, User, Ticket, Building, ShieldCheck } from 'lucide-react';
import { fetchRegistration } from '../lib/api';

export default function PassDetailModal({
  registrationId,
  isOpen,
  onClose
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && registrationId) {
      setLoading(true);
      fetchRegistration(registrationId)
        .then((res) => {
          if (res.success) setData(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, registrationId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ width: '480px' }}>
        <div className="modal-header" style={{ background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={20} color="#7C3AED" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
              공식 전자 참가증 & 바우처 (Pass Voucher)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>참가증을 불러오는 중...</div>
          ) : !data ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#DC2626' }}>정보를 찾을 수 없습니다.</div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span className={`badge-status ${
                  data.status === 'CONFIRMED' ? 'status-confirmed' : data.status === 'CHECKED_IN' ? 'status-checked-in' : 'status-cancelled'
                }`}>
                  {data.status === 'CONFIRMED' ? '참가 확정 (CONFIRMED)' : data.status === 'CHECKED_IN' ? '체크인 완료 (CHECKED IN)' : '취소됨 (CANCELLED)'}
                </span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginTop: '10px', color: '#0F172A' }}>
                  {data.event_title}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  발급번호: {data.reg_code}
                </p>
              </div>

              {/* Barcode Strip */}
              <div className="barcode-pattern" />

              {/* Pass Details Info */}
              <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '16px', marginBottom: '18px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>참석자명</span>
                  <span style={{ fontWeight: '800' }}>{data.attendee_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>소속 기관</span>
                  <span style={{ fontWeight: '600' }}>{data.attendee_org || '일반 개인'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>연락처</span>
                  <span style={{ fontWeight: '600' }}>{data.attendee_phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>참가권 종류</span>
                  <span style={{ fontWeight: '800', color: '#7C3AED' }}>{data.ticket_tier} PASS ({data.attendee_count}명)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>일시</span>
                  <span style={{ fontWeight: '700' }}>{data.event_date} ({data.start_time} ~ {data.end_time})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>장소</span>
                  <span style={{ fontWeight: '700' }}>{data.venue}</span>
                </div>
                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800' }}>결제 금액</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#F97316' }}>
                    {data.total_amount?.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.6' }}>
                <p>📌 현장 등록 데스크에서 본 전자 참가증 또는 예약번호를 제시해주세요.</p>
                <p>📌 VIP 패스는 전용 패스트트랙 및 VIP 네트워킹 라운지 입장이 제공됩니다.</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
