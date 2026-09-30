import React, { useEffect, useState } from 'react';
import { PackageCheck, RotateCcw, XCircle, ChevronRight, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Orders({ onReorder, onContinueShopping }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);
  const [selectedRefundItem, setSelectedRefundItem] = useState(null);
  const [refundQuantity, setRefundQuantity] = useState(1);
  const [refundReason, setRefundReason] = useState('단순변심');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/orders');
      setOrders(data.orders || []);
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('정말 주문을 취소하시겠습니까?')) return;
    try {
      const data = await fetchApi(`/api/orders/${orderId}/cancel`, {
        method: 'POST'
      });
      showToast('주문 취소 완료', `주문(${orderId})이 성공적으로 취소되었습니다.`, 'success');
      loadOrders();
    } catch (err) {
      showToast('취소 실패', err.message, 'error');
    }
  };

  const handleOpenRefundModal = (order, item) => {
    setSelectedRefundOrder(order);
    setSelectedRefundItem(item);
    setRefundQuantity(1);
    setRefundReason('단순변심');
  };

  const handleSubmitRefund = async () => {
    if (!selectedRefundOrder || !selectedRefundItem) return;
    setSubmittingRefund(true);
    try {
      const data = await fetchApi(`/api/orders/${selectedRefundOrder.id}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedRefundItem.productId,
          quantity: Number(refundQuantity) || 1,
          reason: refundReason
        })
      });

      showToast('환불 신청 접수', `환불 금액: ${data.refund.refundAmount.toLocaleString()}원`, 'success');
      setSelectedRefundOrder(null);
      setSelectedRefundItem(null);
      loadOrders();
    } catch (err) {
      showToast('환불 실패', err.message, 'error');
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: '#64748b' }}>주문 내역을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="main-wrapper">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <PackageCheck size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>주문 내역이 없습니다</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>FreshCart의 신선한 상품을 주문해보세요.</p>
          <button className="primary-btn" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={onContinueShopping}>
            쇼핑하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>주문 및 배송 내역</h1>

      <div>
        {orders.map((order) => {
          const isCancelled = order.status === 'CANCELLED';
          const isRefunded = order.status === 'REFUNDED';
          const isPartiallyRefunded = order.status === 'PARTIALLY_REFUNDED';

          return (
            <div key={order.id} className="card-box" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>{order.id}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: isCancelled ? '#fee2e2' : isRefunded ? '#fef3c7' : isPartiallyRefunded ? '#ffedd5' : '#dcfce7',
                      color: isCancelled ? '#991b1b' : isRefunded ? '#92400e' : isPartiallyRefunded ? '#9a3412' : '#166534'
                    }}>
                      {isCancelled ? '주문취소' : isRefunded ? '전체환불' : isPartiallyRefunded ? '부분환불완료' : '배송준비중 (주문완료)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                    주문일시: {order.createdAt} · 배송시간: {order.deliverySlot?.title}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isCancelled && !isRefunded && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <XCircle size={14} />
                      <span>전체 주문 취소</span>
                    </button>
                  )}

                  <button
                    onClick={() => onReorder(order.items)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShoppingCart size={14} />
                    <span>재주문 담기</span>
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{item.name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {item.price.toLocaleString()}원 × {item.quantity}개
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>

                      {!isCancelled && !isRefunded && (
                        <button
                          onClick={() => handleOpenRefundModal(order, item)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#fff7ed',
                            border: '1px solid #fed7aa',
                            color: '#c2410c',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>부분 환불신청</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Refund History if any */}
              {order.refundHistory?.length > 0 && (
                <div style={{ background: '#fffbeb', padding: '12px 16px', borderRadius: '8px', marginTop: '14px', border: '1px solid #fef3c7' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e', marginBottom: '4px' }}>
                    📦 환불 내역
                  </div>
                  {order.refundHistory.map((rf) => (
                    <div key={rf.id} style={{ fontSize: '12.5px', color: '#78350f', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>[{rf.productName}] {rf.quantity}개 (사유: {rf.reason})</span>
                      <strong style={{ color: '#b45309' }}>환불액: {rf.refundAmount.toLocaleString()}원</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', fontSize: '13.5px' }}>
                <div style={{ color: '#64748b' }}>
                  배송지: <strong>{order.address?.address} {order.address?.detailAddress}</strong> ({order.address?.receiver})
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {order.couponDiscount > 0 && (
                    <span style={{ color: '#ef4444' }}>쿠폰할인 -{order.couponDiscount.toLocaleString()}원</span>
                  )}
                  {order.usedPoints > 0 && (
                    <span style={{ color: '#ef4444' }}>포인트 -{order.usedPoints.toLocaleString()}P</span>
                  )}
                  <span style={{ color: '#64748b' }}>적립예정: +{order.earnedPoints.toLocaleString()}P</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                    총 결제금액: {order.finalAmount.toLocaleString()}원
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Partial Refund Modal */}
      {selectedRefundOrder && selectedRefundItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>부분 환불 / 반품 신청</h3>
              <button onClick={() => setSelectedRefundOrder(null)} style={{ color: '#94a3b8' }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{selectedRefundItem.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  단가: {selectedRefundItem.price.toLocaleString()}원 · 주문수량: {selectedRefundItem.quantity}개
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>환불 수량</label>
                <input
                  type="number"
                  min="1"
                  max={selectedRefundItem.quantity}
                  value={refundQuantity}
                  onChange={(e) => setRefundQuantity(Math.min(selectedRefundItem.quantity, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>환불 사유</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="단순변심">단순변심 / 주문 실수</option>
                  <option value="신선도불만족">신선도 불만족 / 품질 이상</option>
                  <option value="배송지연">배송 시간 지연</option>
                  <option value="오배송">다른 상품 오배송</option>
                </select>
              </div>

              {selectedRefundOrder.couponDiscount > 0 && (
                <div style={{ fontSize: '12.5px', color: '#9a3412', background: '#ffedd5', padding: '10px', borderRadius: '6px' }}>
                  ℹ️ 본 주문에는 {selectedRefundOrder.couponDiscount.toLocaleString()}원의 주문 할인이 적용되어 있습니다.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setSelectedRefundOrder(null)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              >
                취소
              </button>
              <button
                onClick={handleSubmitRefund}
                disabled={submittingRefund}
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#c2410c', color: 'white', fontWeight: 800 }}
              >
                {submittingRefund ? '처리 중...' : '환불 확정 요청'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
