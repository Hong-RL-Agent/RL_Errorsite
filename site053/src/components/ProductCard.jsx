import React from 'react';

export default function ProductCard({ product, onSelectProduct, isLiked = false }) {
  const formatPrice = (p) => {
    if (Number(p) === 0) return '나눔 🧡';
    return Number(p).toLocaleString('ko-KR') + '원';
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '방금 전';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${Math.max(1, mins)}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  const getStatusClass = (status) => {
    if (status === '예약중') return 'tag-product-status reserved';
    if (status === '판매완료') return 'tag-product-status completed';
    return 'tag-product-status';
  };

  return (
    <div className="product-item-card" onClick={() => onSelectProduct && onSelectProduct(product.id)}>
      <div className="product-cover-wrap">
        <img
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          loading="lazy"
        />
        {product.tradeMethod && (
          <span className="tag-trade-method">{product.tradeMethod}</span>
        )}
        {product.status && product.status !== '판매중' && (
          <span className={getStatusClass(product.status)}>{product.status}</span>
        )}
      </div>

      <div className="product-content-wrap">
        <div className="product-item-title">{product.title}</div>
        <div className="product-item-location">
          {product.location ? product.location.split(' ').slice(-1)[0] : '우리동네'} · {getTimeAgo(product.createdAt)}
        </div>
        <div className="product-item-price">{formatPrice(product.price)}</div>

        <div className="product-bottom-meta">
          <span>💬 {product.chatCount || 2}</span>
          <span style={{ color: isLiked ? 'var(--primary)' : 'inherit', fontWeight: isLiked ? '800' : 'normal' }}>
            {isLiked ? '♥' : '♡'} {product.likes}
          </span>
          <span>👁 {product.views}</span>
        </div>
      </div>
    </div>
  );
}
