import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, MapPin, Phone, Calendar, Clock, DollarSign } from 'lucide-react';
import { fetchReservation } from '../lib/api';

export default function ReceiptModal({
  reservationId,
  isOpen,
  onClose
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && reservationId) {
      setLoading(true);
      fetchReservation(reservationId)
        .then((res) => {
          if (res.success) setData(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, reservationId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ width: '460px' }}>
        <div className="modal-header" style={{ background: '#FAF5ED' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🧾</span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2D3748' }}>
              예약 완료 영수증 & 이용 바우처
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8C9BAE' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#718096' }}>영수증을 불러오는 중...</div>
          ) : !data ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#E53E3E' }}>정보를 찾을 수 없습니다.</div>
          ) : (
            <div>
              {/* Receipt Visual Top */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span className={`badge-status ${
                  data.status === 'CONFIRMED' ? 'status-confirmed' : data.status === 'COMPLETED' ? 'status-completed' : 'status-cancelled'
                }`}>
                  {data.status === 'CONFIRMED' ? '예약 확정 (CONFIRMED)' : data.status === 'COMPLETED' ? '이용 완료 (COMPLETED)' : '예약 취소 (CANCELLED)'}
                </span>
                <h4 style={{ fontSize: '20px', fontWeight: '800', marginTop: '8px', color: '#2D3748' }}>
                  {data.service_name}
                </h4>
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>
                  예약번호: {data.booking_code}
                </p>
              </div>

              {/* Barcode Strip */}
              <div className="barcode-strip" />

              {/* Receipt Key Info */}
              <div style={{ background: '#FAF5ED', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>보호자 / 연락처</span>
                  <span style={{ fontWeight: '700' }}>{data.owner_name} ({data.owner_phone})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>반려동물</span>
                  <span style={{ fontWeight: '700' }}>{data.pet_avatar} {data.pet_name} ({data.pet_breed}, {data.pet_weight}kg)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>이용 일시</span>
                  <span style={{ fontWeight: '700', color: '#3B82A6' }}>{data.booking_date} {data.time_slot} ({data.duration_mins}분)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#718096' }}>픽업 서비스 여부</span>
                  <span style={{ fontWeight: '700' }}>{data.pickup_service ? '왕복 픽업 포함' : '직접 방문'}</span>
                </div>
                {data.special_request && (
                  <div style={{ borderTop: '1px dashed #EDE8DF', paddingTop: '8px' }}>
                    <span style={{ color: '#718096', fontSize: '12px' }}>요청사항: </span>
                    <span style={{ fontWeight: '600', fontSize: '12px' }}>{data.special_request}</span>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div style={{ border: '1.5px solid #EDE8DF', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ fontWeight: '700', marginBottom: '8px', color: '#2D3748' }}>결제 내역 상세</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#718096' }}>기본 서비스 요금</span>
                  <span>{data.base_price?.toLocaleString()}원</span>
                </div>
                {data.pet_weight > 8 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#718096' }}>체중 구간 할증 ({data.pet_weight > 20 ? '대형견' : '중형견'})</span>
                    <span>+{data.pet_weight > 20 ? '20,000' : '10,000'}원</span>
                  </div>
                )}
                {Boolean(data.pickup_service) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#718096' }}>안심 왕복 픽업 서비스</span>
                    <span>+15,000원</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #EDE8DF', paddingTop: '8px', marginTop: '6px', fontSize: '15px', fontWeight: '800', color: '#3B82A6' }}>
                  <span>총 결제 금액</span>
                  <span>{data.total_price?.toLocaleString()}원</span>
                </div>
              </div>

              {/* Location & Guide Notice */}
              <div style={{ fontSize: '11px', color: '#718096', lineHeight: '1.6' }}>
                <p>📍 위치: 서울시 강남구 테헤란로 123 PawCare 프리미엄 케어 센터</p>
                <p>⏰ 예약 시간 10분 전까지 도착해주세요. 예약 당일 취소 시 규정에 따라 위약금이 발생할 수 있습니다.</p>
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
