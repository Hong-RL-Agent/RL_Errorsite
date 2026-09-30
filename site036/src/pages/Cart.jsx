import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';

export default function Cart({ setCurrentPage, showToast }) {
  const [cartData, setCartData] = useState({ items: [], totalAmount: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);

  const loadCart = () => {
    fetch('/api/cart')
      .then(res => res.json())
      .then(data => {
        setCartData(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>구독 플랜 및 서비스 장바구니</h2>
          <p className="card-subtitle">선택하신 워크스페이스 플랜 및 부가 서비스를 확인하세요.</p>
        </div>
      </div>

      {cartData.items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <ShoppingCart size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '8px' }}>장바구니가 비어 있습니다</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
            WorkNest의 다양한 팀 요금제와 스토리지 애드온을 둘러보세요.
          </p>
          <button className="btn btn-primary" onClick={() => setCurrentPage('products')}>
            플랜 둘러보기 <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
          {/* Items Table */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartData.items.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '16px',
                    borderBottom: idx !== cartData.items.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                      월간 구독 · 수량: {item.quantity}개
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                      ₩{(item.price * item.quantity).toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                      개당 ₩{item.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Summary Card */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '16px' }}>
              주문 요약
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-500)' }}>
                <span>선택 상품 수량</span>
                <span style={{ fontWeight: 600, color: 'var(--navy-800)' }}>{cartData.itemCount}개</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-500)' }}>
                <span>부가세 (VAT)</span>
                <span style={{ fontWeight: 600, color: 'var(--navy-800)' }}>포함</span>
              </div>
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)' }}>총 결제 예정액</span>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
                  ₩{cartData.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setCurrentPage('payments')}
            >
              <CreditCard size={18} /> 결제 진행하기
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '14px', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
              <ShieldCheck size={14} color="#10b981" /> 256-bit 안전 결제 암호화 적용
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
