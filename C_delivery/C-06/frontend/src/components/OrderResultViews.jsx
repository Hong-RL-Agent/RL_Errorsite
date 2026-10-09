import React from 'react';
import { CheckCircle2, ShoppingBag, AlertTriangle, X } from 'lucide-react';

export function OrderSuccessView({ order, onReturnMenu }) {
  if (!order) return null;

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      padding: '40px 24px',
      textAlign: 'center',
      maxWidth: 520,
      margin: '40px auto'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(255, 87, 34, 0.15)',
        color: 'var(--coral-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 18px',
        border: '1px solid var(--coral-primary)'
      }}>
        <CheckCircle2 size={36} />
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
        주문이 정상적으로 접수되었습니다
      </h2>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24 }}>
        주문번호: <strong style={{ color: 'var(--coral-primary)', fontFamily: 'var(--font-mono)' }}>{order.orderNumber}</strong>
      </p>

      <div style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        padding: 18,
        textAlign: 'left',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>최종 결제 금액</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--coral-primary)' }}>
            {order.finalAmount?.toLocaleString()}원
          </span>
        </div>
        {order.riderTip > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <span>포함된 라이더 팁</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>+{order.riderTip?.toLocaleString()}원</span>
          </div>
        )}
      </div>

      <button
        className="btn-checkout-submit"
        onClick={onReturnMenu}
        style={{ maxWidth: 220, margin: '0 auto' }}
      >
        <ShoppingBag size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        <span>메뉴로 돌아가기</span>
      </button>
    </div>
  );
}

export function OrderHistoryView({ orders }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>주문 내역</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          완료된 배달 주문 내역입니다.
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          주문 내역이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="checkout-section-card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: 'var(--coral-primary)' }}>
                  {ord.order_number}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {ord.created_at} · {ord.store_name}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  배달지: {ord.address}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                  {ord.final_amount?.toLocaleString()}원
                </div>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald-accent)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  marginTop: 6
                }}>
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

export function PriceChangeConflictModal({ isOpen, onClose, errorDetails }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" style={{ maxWidth: 440, border: '1px solid rgba(244, 63, 94, 0.5)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-sheet-header" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--rose-accent)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>409 Conflict — 가격 변경</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-sheet-body">
          <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.5 }}>
            {errorDetails?.message || '상품 가격이 변경되었습니다. 주문 금액을 다시 확인해주세요.'}
          </p>

          <div style={{
            background: 'var(--bg-input)',
            padding: 12,
            borderRadius: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#fb7185',
            border: '1px solid rgba(244, 63, 94, 0.2)'
          }}>
            Status: 409 Conflict | error: "PRICE_CHANGED" | Expected: {errorDetails?.expected}원 | Cart: {errorDetails?.cartPrice}원
          </div>
        </div>

        <div className="modal-sheet-footer">
          <button className="btn-checkout-submit" onClick={onClose} style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid #f43f5e', color: '#fb7185' }}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
