import React from 'react';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart({ cart = [], onUpdateQuantity, onRemoveItem, onProceedCheckout, onNavigate }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>장바구니 ({cart.length}개)</h2>
          <p>선택하신 가구 및 인테리어 소품 목록입니다.</p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: 20, border: '1px solid #e9e3da' }}>
          <ShoppingBag size={48} color="#9e968b" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f1d1a', marginBottom: 8 }}>장바구니가 비어 있습니다</h3>
          <p style={{ fontSize: 14, color: '#6b645b', marginBottom: 20 }}>Roomly의 감각적인 인테리어 가구를 둘러보세요.</p>
          <button className="hero-btn" onClick={() => onNavigate('home')}>
            가구 컬렉션 둘러보기
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32 }}>
          {/* Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  padding: 20,
                  borderRadius: 16,
                  border: '1px solid #e9e3da',
                  display: 'flex',
                  gap: 18,
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12, background: '#f6f3ee' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1f1d1a', marginBottom: 4 }}>
                    {item.name}
                  </h4>
                  <div style={{ fontSize: 13, color: '#6b645b', marginBottom: 6 }}>
                    옵션: {item.color}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#855b32' }}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e9e3da', borderRadius: 8 }}>
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    style={{ padding: '4px 10px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ padding: '4px 10px', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    style={{ padding: '4px 10px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#9e968b', cursor: 'pointer', padding: 8 }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div style={{ background: '#ffffff', padding: 28, borderRadius: 20, border: '1px solid #e9e3da', height: 'fit-content' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1f1d1a', marginBottom: 20 }}>
              결제 예정 금액
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b645b', marginBottom: 10 }}>
              <span>상품 총 금액</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b645b', marginBottom: 16 }}>
              <span>가구 배송비</span>
              <span style={{ color: '#5b6b4e', fontWeight: 700 }}>무료 배송</span>
            </div>

            <div style={{ borderTop: '1px solid #e9e3da', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: '#1f1d1a', marginBottom: 24 }}>
              <span>최종 주문 금액</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>

            <button
              className="hero-btn"
              onClick={onProceedCheckout}
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              주문서 작성 및 결제하기 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
