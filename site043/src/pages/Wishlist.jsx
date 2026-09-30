import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag, Zap, AlertCircle } from 'lucide-react';

export default function Wishlist({ onAddToCart, onBuyNow, showToast }) {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveWish = async (id) => {
    try {
      await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      showToast('찜 목록에서 삭제되었습니다.', 'info');
      fetchWishlist();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishPurchase = (item) => {
    // SEC-398: Wishlist purchase triggers action on item that may be discontinued
    showToast(
      `찜 목록 상품 [${item.name}] 구매 요청이 진행됩니다.`,
      'site043-bug03',
      'SEC-398'
    );
    onBuyNow({
      id: item.productId,
      name: item.name,
      discountPrice: item.price,
      price: item.price,
      image: item.image,
      status: item.status
    });
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>찜한 가구 & 소품 ({wishlist.length}개)</h2>
          <p>마음에 담아둔 인테리어 아이템을 모아보고 바로 주문하세요.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: 20, border: '1px solid #e9e3da' }}>
          <Heart size={48} color="#9e968b" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f1d1a', marginBottom: 8 }}>찜한 상품이 없습니다</h3>
          <p style={{ fontSize: 14, color: '#6b645b' }}>상품 상세 페이지에서 하트 아이콘을 눌러 찜해보세요.</p>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="product-card">
              <div className="card-img-wrap">
                <img src={item.image} alt={item.name} className="card-img" />
                <button
                  className="card-wish-btn active"
                  onClick={() => handleRemoveWish(item.id)}
                  title="찜 취소"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="card-info">
                <h3 className="card-name">{item.name}</h3>
                <div className="card-price-row">
                  <span className="final-price">{item.price.toLocaleString()}원</span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => handleWishPurchase(item)}
                    className="hero-btn"
                    style={{ flex: 1, padding: '10px', fontSize: 13, justifyContent: 'center' }}
                  >
                    <Zap size={14} />
                    바로구매
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
