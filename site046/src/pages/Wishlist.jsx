import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Wishlist({ onSelectProduct, onAddToCart, onContinueShopping }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/wishlist');
      setWishlist(data.wishlist || []);
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await fetchApi(`/api/wishlist/${productId}`, { method: 'DELETE' });
      showToast('찜 해제', '찜 목록에서 삭제되었습니다.', 'info');
      loadWishlist();
    } catch (err) {
      showToast('오류', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: '#64748b' }}>찜 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="main-wrapper">
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Heart size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>찜한 상품이 없습니다</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>자주 찾는 신선 식료품에 하트를 눌러보세요.</p>
          <button className="primary-btn" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={onContinueShopping}>
            상품 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>찜한 상품 ({wishlist.length})</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {wishlist.map((product) => (
          <div key={product.id} className="card-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', background: '#f8fafc', cursor: 'pointer' }} onClick={() => onSelectProduct(product)}>
              <img src={product.image} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{product.category}</div>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', cursor: 'pointer' }} onClick={() => onSelectProduct(product)}>
              {product.name}
            </div>

            <div style={{ marginTop: 'auto', marginBottom: '14px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#059669' }}>
                {product.discountPrice.toLocaleString()}원
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleRemove(product.id)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#ef4444' }}
                title="찜 취소"
              >
                <Trash2 size={16} />
              </button>
              <button
                className="primary-btn"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => {
                  onAddToCart(product);
                  showToast('장바구니 담기', `${product.name}이 담겼습니다.`, 'success');
                }}
              >
                <ShoppingCart size={16} />
                <span>담기</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
