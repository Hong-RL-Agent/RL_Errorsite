import React, { useEffect, useState } from 'react';
import { BookmarkCheck, Clock, FileText, AlertCircle, Edit, XCircle } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delivery memo edit state
  const [editingMemoRes, setEditingMemoRes] = useState(null);
  const [deliveryMemoText, setDeliveryMemoText] = useState('');

  // Refund reason modal state
  const [refundRes, setRefundRes] = useState(null);
  const [refundReasonText, setRefundReasonText] = useState('서비스 일정이 변경되었습니다.');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/reservations');
      setReservations(data.reservations || []);
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Triggers SEC-383: async-no-feedback on Delivery Memo
  const handleSaveDeliveryMemo = (e) => {
    e.preventDefault();
    if (!editingMemoRes) return;

    // Intentionally without loading/cancel feedback UI state for SEC-383
    fetchApi(`/api/reservations/${editingMemoRes.id}/delivery-memo`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryMemo: deliveryMemoText })
    }).then(() => {
      showToast('메모 저장 완료', '배송/용품 메모가 수정되었습니다.', 'success');
      setEditingMemoRes(null);
      loadReservations();
    }).catch((err) => {
      showToast('오류', err.message, 'error');
    });
  };

  // Triggers SEC-384: async-no-feedback on Refund Reason
  const handleSubmitRefundReason = (e) => {
    e.preventDefault();
    if (!refundRes) return;

    // Intentionally without loading/cancel feedback UI state for SEC-384
    fetchApi(`/api/reservations/${refundRes.id}/refund-reason`, {
      method: 'POST',
      body: JSON.stringify({ reason: refundReasonText })
    }).then(() => {
      showToast('취소 접수 완료', '예약 취소 및 환불 신청이 완료되었습니다.', 'success');
      setRefundRes(null);
      loadReservations();
    }).catch((err) => {
      showToast('오류', err.message, 'error');
    });
  };

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>예약 및 돌봄 내역</h1>

      {reservations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <BookmarkCheck size={40} color="#8d99ae" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#64748b' }}>예약 내역이 없습니다.</h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reservations.map((resv) => {
            const isCancelled = resv.status === 'CANCELLED';
            return (
              <div key={resv.id} className="card-box" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#1b4332' }}>{resv.id}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: isCancelled ? '#fee2e2' : '#dcfce7',
                      color: isCancelled ? '#991b1b' : '#166534'
                    }}>
                      {isCancelled ? '예약취소 (환불완료)' : '예약확정'}
                    </span>
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#2d6a4f' }}>
                    {resv.price?.toLocaleString()}원
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#8d99ae', fontWeight: 700 }}>서비스명</div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#1b261e' }}>{resv.serviceTitle}</div>
                    <div style={{ fontSize: '13px', color: '#526156' }}>담당: {resv.providerName}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#8d99ae', fontWeight: 700 }}>예약 일정 & 반려동물</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1b261e' }}>{resv.date} ({resv.time})</div>
                    <div style={{ fontSize: '13px', color: '#526156' }}>대상: {resv.petName}</div>
                  </div>
                </div>

                {/* Delivery memo & Notes box */}
                <div style={{ background: '#f8faf7', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#2d6a4f' }}>📦 배송 및 돌봄 용품 보관 메모</span>
                    {!isCancelled && (
                      <button
                        onClick={() => { setEditingMemoRes(resv); setDeliveryMemoText(resv.deliveryMemo || ''); }}
                        style={{ color: '#2d6a4f', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <Edit size={12} />
                        <span>메모 수정</span>
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '13.5px', color: '#334155' }}>{resv.deliveryMemo || '등록된 배송/용품 메모가 없습니다.'}</p>
                </div>

                {!isCancelled && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => { setRefundRes(resv); setRefundReasonText('서비스 일정이 변경되었습니다.'); }}
                      style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <XCircle size={14} />
                      <span>예약 취소 및 환불 신청</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Delivery Memo Modal */}
      {editingMemoRes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>배송/용품 메모 수정</h3>
            <form onSubmit={handleSaveDeliveryMemo}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>문 앞 비치 위치 및 주의사항</label>
                <textarea
                  rows="3"
                  value={deliveryMemoText}
                  onChange={(e) => setDeliveryMemoText(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingMemoRes(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  취소
                </button>
                <button type="submit" className="primary-btn">
                  메모 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Reason Modal */}
      {refundRes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>예약 취소 및 환불 사유 입력</h3>
            <form onSubmit={handleSubmitRefundReason}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>환불 사유 선택 또는 입력</label>
                <select
                  value={refundReasonText}
                  onChange={(e) => setRefundReasonText(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}
                >
                  <option value="서비스 일정이 변경되었습니다.">서비스 일정이 변경되었습니다.</option>
                  <option value="예약한 시간을 이용하기 어렵습니다.">예약한 시간을 이용하기 어렵습니다.</option>
                  <option value="다른 서비스를 이용하기로 했습니다.">다른 서비스를 이용하기로 했습니다.</option>
                  <option value="개인 사정으로 인한 취소">개인 사정으로 인한 취소</option>
                </select>
                <input
                  type="text"
                  placeholder="상세 사유 추가 입력"
                  value={refundReasonText}
                  onChange={(e) => setRefundReasonText(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setRefundRes(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  돌아가기
                </button>
                <button type="submit" className="primary-btn" style={{ background: '#e63946' }}>
                  환불 요청 제출
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
