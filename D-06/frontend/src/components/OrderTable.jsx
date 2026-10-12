'use client';
import React from 'react';
import { Eye, Truck, XCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OrderTable({
  orders,
  loading,
  pagination,
  onPageChange,
  onOpenDetail,
  onOpenDeliveryModal,
  onOpenCancelModal,
  onOpenRefundModal
}) {
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'PAID': return <span className="badge badge-paid">결제 완료</span>;
      case 'WAITING': return <span className="badge badge-waiting">입금 대기</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">결제 취소</span>;
      case 'REFUND_REQUESTED': return <span className="badge badge-refund-req">환불 요청</span>;
      case 'REFUNDED': return <span className="badge badge-refunded">환불 완료</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getDeliveryBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-delivery-pending">배송 대기</span>;
      case 'PREPARING': return <span className="badge badge-delivery-preparing">배송 준비중</span>;
      case 'SHIPPING': return <span className="badge badge-delivery-shipping">배송 중</span>;
      case 'DELIVERED': return <span className="badge badge-delivery-delivered">배송 완료</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">취소됨</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>주문번호</th>
              <th>주문일시</th>
              <th>주문자명</th>
              <th>결제금액</th>
              <th>결제수단</th>
              <th>결제 상태</th>
              <th>배송 상태</th>
              <th>운송장 정보</th>
              <th style={{ textAlign: 'center' }}>주문 관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  주문 목록을 불러오는 중입니다...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  조건에 해당하는 주문이 없습니다.
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} data-order-no={o.order_no} data-order-id={o.id}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{o.order_no}</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{o.order_date}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{o.customer_name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{o.customer_phone}</div>
                  </td>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>
                    {Number(o.total_amount).toLocaleString()}원
                  </td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>
                    {o.payment_method === 'CREDIT_CARD' ? '신용카드' : o.payment_method === 'NAVER_PAY' ? '네이버페이' : o.payment_method === 'KAKAO_PAY' ? '카카오페이' : '무통장입금'}
                  </td>
                  <td>{getPaymentBadge(o.payment_status)}</td>
                  <td>{getDeliveryBadge(o.delivery_status)}</td>
                  <td>
                    {o.tracking_number ? (
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#0f172a', fontWeight: '500' }}>{o.courier}</span>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>{o.tracking_number}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '12px' }}>미발급</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenDetail(o)}
                        title="주문 품목 및 상세 정보"
                      >
                        <Eye size={12} />
                        <span>상세</span>
                      </button>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenDeliveryModal(o)}
                        title="배송 상태 변경 및 운송장 입력"
                      >
                        <Truck size={12} />
                        <span>배송</span>
                      </button>

                      {o.payment_status === 'REFUND_REQUESTED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}
                          onClick={() => onOpenRefundModal(o)}
                          title="환불 요청 승인 처리"
                        >
                          <CheckCircle2 size={12} />
                          <span>환불</span>
                        </button>
                      )}

                      {(o.payment_status === 'PAID' || o.payment_status === 'WAITING') && o.delivery_status !== 'DELIVERED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#dc2626' }}
                          onClick={() => onOpenCancelModal(o)}
                          title="주문 취소 처리"
                        >
                          <XCircle size={12} />
                          <span>취소</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination-area">
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            페이지 {pagination.page} / {pagination.totalPages} (총 {pagination.total}건)
          </span>

          <div className="page-btn-group">
            <button
              className="page-btn"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`page-btn ${pagination.page === p ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
