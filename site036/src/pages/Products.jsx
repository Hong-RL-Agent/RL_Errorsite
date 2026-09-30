import React, { useState, useEffect } from 'react';
import { Package, Check, ShoppingCart, Edit3, Sparkles } from 'lucide-react';
import Modal from '../components/Modal';

export default function Products({ showToast, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit product name modal (SEC-334)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const loadProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Save product name (SEC-334 / site036-bug04)
  const handleSaveProductName = (e) => {
    e.preventDefault();
    if (!editingProduct || !editName.trim()) return;

    setSavingName(true);
    const idempotency_key = `PRODUCT-NAME-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/products/name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: editingProduct.id,
        name: editName.trim(),
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSavingName(false);
      setEditingProduct(null);
      loadProducts();
      showToast('상품명 수정 완료', '상품의 명칭이 성공적으로 변경되었습니다.', 'success', data.transaction_id);
    })
    .catch(err => {
      console.error(err);
      setSavingName(false);
    });
  };

  // Add to cart (SEC-338 / site036-bug08)
  const handleAddToCart = (product) => {
    const idempotency_key = `CART-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      if (onAddToCart) onAddToCart();
      showToast('장바구니 담기 완료', `[${product.name}] 상품이 장바구니에 추가되었습니다.`, 'success', data.transaction_id);
    })
    .catch(err => console.error(err));
  };

  return (
    <div>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 36px auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '8px' }}>
          WorkNest 요금제 및 워크스페이스 플랜
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.94rem' }}>
          팀 규모와 워크플로우에 최적화된 협업 플랜을 선택하고 생산성을 극대화하세요.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {products.map(p => (
          <div 
            key={p.id} 
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              position: 'relative',
              borderColor: p.popular ? 'var(--primary)' : 'var(--gray-200)',
              borderWidth: p.popular ? '2px' : '1px'
            }}
          >
            {p.badge && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  backgroundColor: p.popular ? 'var(--primary)' : '#64748b',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {p.badge}
              </span>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>{p.name}</h3>
                <button 
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  onClick={() => {
                    setEditingProduct(p);
                    setEditName(p.name);
                  }}
                  title="상품명 수정"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--gray-500)', marginBottom: '20px', minHeight: '42px' }}>
                {p.description}
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  ₩{p.price.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}> / {p.interval}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-800)', marginBottom: '10px' }}>포함된 핵심 기능:</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {p.features?.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--navy-800)' }}>
                      <Check size={16} color="#10b981" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button 
              className={`btn ${p.popular ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%' }}
              onClick={() => handleAddToCart(p)}
            >
              <ShoppingCart size={16} /> 장바구니 담기
            </button>
          </div>
        ))}
      </div>

      {/* Edit Product Name Modal (SEC-334) */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="상품명 설정 및 수정"
      >
        <form onSubmit={handleSaveProductName}>
          <div className="form-group">
            <label className="form-label">상품명 (플랜 이름)</label>
            <input
              type="text"
              className="form-control"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingProduct(null)}>
              취소
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingName || !editName.trim()}>
              {savingName ? '저장 중...' : '상품명 저장'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
