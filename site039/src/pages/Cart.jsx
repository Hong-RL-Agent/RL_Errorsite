import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, ArrowRight, Truck } from 'lucide-react';

export default function Cart({ onNavigate, onShowToast }) {
  const [cart, setCart] = useState({ items: [], count: 0, subtotal: 0, shippingFee: 0, total: 0 });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty <= 0) return;
    try {
      await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">쇼핑백 (장바구니)</h1>
          <p className="page-subtitle">선택하신 라이프스타일 상품의 수량 및 예상 결제 금액을 확인하세요.</p>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.35 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            장바구니가 비어 있습니다.
          </h3>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>취향에 맞는 따뜻한 라이프스타일 상품을 담아보세요.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('products')}>
            상품 둘러보기
          </button>
        </div>
      ) : (
        <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'flex-start' }}>
          {/* Item List */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>
              담은 상품 목록 ({cart.items.length}개)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      옵션: {item.option}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 8px', fontWeight: 700, fontSize: '13px' }}>{item.quantity}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>결제 예상 금액</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>총 상품금액</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₩{cart.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>배송비</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {cart.shippingFee === 0 ? '무료 (5만원 이상)' : `₩${cart.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, paddingTop: '12px', borderTop: '1px solid var(--border)', color: 'var(--text-main)' }}>
                <span>최종 결제금액</span>
                <span style={{ color: 'var(--primary)' }}>₩{cart.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '15px' }}
              onClick={() => onNavigate('checkout')}
            >
              주문서 작성하기 <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
