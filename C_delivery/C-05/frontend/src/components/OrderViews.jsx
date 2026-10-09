import React from 'react';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';

export function OrderSuccess({ order, onContinueShopping }) {
  if (!order) return null;

  return (
    <div className="order-complete-card">
      <div className="success-icon-wrap">
        <Check size={36} />
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
        주문이 성공적으로 완료되었습니다
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
        주문 번호: <strong style={{ color: 'var(--gold-accent)', fontFamily: 'var(--font-mono)' }}>{order.orderNumber}</strong>
      </p>

      <div style={{
        background: 'var(--bg-pine-surface)',
        border: '1px solid var(--border-pine)',
        borderRadius: 10,
        padding: 20,
        textAlign: 'left',
        marginBottom: 28
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13.5 }}>
          <span style={{ color: 'var(--text-muted)' }}>최종 결제 금액</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-accent)' }}>
            {order.total?.toLocaleString()}원
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
          <span style={{ color: 'var(--text-muted)' }}>주문 상태</span>
          <span style={{ color: 'var(--emerald-accent)', fontWeight: 600 }}>결제 완료 (COMPLETED)</span>
        </div>
      </div>

      <button
        className="btn-place-order"
        onClick={onContinueShopping}
        style={{ margin: '0 auto', maxWidth: 260 }}
      >
        <ShoppingBag size={16} />
        <span>쇼핑 계속하기</span>
      </button>
    </div>
  );
}

export function OrderHistory({ orders }) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Order History</h2>
          <p className="section-desc">완료된 주문 및 배송 현황</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          완료된 주문 내역이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="flow-card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--gold-accent)' }}>
                  {ord.order_number}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {ord.created_at} · {ord.shipping_option_name}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  배송지: {ord.shipping_address}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                  {ord.total?.toLocaleString()}원
                </div>
                <span className="stock-tag" style={{ position: 'static', display: 'inline-block', marginTop: 6 }}>
                  {ord.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
