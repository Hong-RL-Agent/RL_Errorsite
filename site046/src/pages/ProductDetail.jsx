import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Star, ShieldCheck, Truck, MessageSquare } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function ProductDetail({ product, onBack, onAddToCart, isWishlisted, onToggleWishlist, onNavigateCheckout }) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const loadReviews = async () => {
    try {
      const data = await fetchApi(`/api/products/${product.id}/reviews`);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await fetchApi('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          content: newReviewText.trim()
        })
      });
      showToast('리뷰 등록 완료', '소중한 상품 후기가 등록되었습니다.', 'success');
      setNewReviewText('');
      loadReviews();
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const discountRate = Math.round(((product.price - product.discountPrice) / product.price) * 100);

  return (
    <div className="main-wrapper">
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 700, marginBottom: '20px', fontSize: '14px' }}
      >
        <ArrowLeft size={18} />
        <span>목록으로 돌아가기</span>
      </button>

      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 460px) 1fr',
        gap: '40px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ width: '100%', paddingTop: '85%', position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 700, marginBottom: '6px' }}>{product.category}</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 800 }}>{product.rating}</span>
            </div>
            <span style={{ color: '#94a3b8' }}>·</span>
            <span style={{ color: '#64748b', fontSize: '13.5px' }}>리뷰 {reviews.length + (product.reviewCount || 0)}개</span>
            <span style={{ color: '#94a3b8' }}>·</span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: '13px' }}>재고 {product.stock}개 남음</span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            {discountRate > 0 && (
              <div style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through' }}>
                {product.price.toLocaleString()}원
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              {discountRate > 0 && <span style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{discountRate}%</span>}
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{product.discountPrice.toLocaleString()}원</span>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '24px' }}>
            {product.description}
          </p>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', marginBottom: '8px' }}>
              <Truck size={16} color="#10b981" />
              <span><strong>배송안내:</strong> 밤 11시 전 결제 시 내일 아침 7시 전 도착 (40,000원 이상 무료배송)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span><strong>신선보장:</strong> 신선도 불만족 시 100% 무료 교환/환불</span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>수량 선택</span>
            <div className="qty-control">
              <button 
                className="qty-btn" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="qty-val">{quantity}</span>
              <button 
                className="qty-btn" 
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <span style={{ fontWeight: 700, color: '#64748b' }}>총 결제 금액</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
              {(product.discountPrice * quantity).toLocaleString()}원
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onToggleWishlist(product.id)}
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                color: isWishlisted ? '#ef4444' : '#64748b',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>

            <button
              className="primary-btn"
              onClick={() => {
                onAddToCart(product, quantity);
                showToast('장바구니 담기 완료', `${product.name} ${quantity}개가 담겼습니다.`, 'success');
              }}
            >
              <ShoppingCart size={18} />
              <span>장바구니 담기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="card-box">
        <div className="card-box-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="#10b981" />
            <span>구매 고객 신선 후기 ({reviews.length}개)</span>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>별점 선택:</span>
            <select
              value={newRating}
              onChange={(e) => setNewRating(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
              <option value="4">⭐⭐⭐⭐ (4점)</option>
              <option value="3">⭐⭐⭐ (3점)</option>
              <option value="2">⭐⭐ (2점)</option>
              <option value="1">⭐ (1점)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="상품에 대한 솔직한 후기를 남겨주세요."
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={submittingReview}
              style={{ padding: '0 20px', background: '#059669', color: 'white', fontWeight: 700, borderRadius: '8px' }}
            >
              등록
            </button>
          </div>
        </form>

        {/* Reviews List */}
        <div>
          {reviews.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>아직 등록된 후기가 없습니다. 첫 후기를 작성해보세요!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{rev.author}</span>
                    <div style={{ display: 'flex' }}>
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{rev.date}</span>
                </div>
                <p style={{ fontSize: '14px', color: '#334155' }}>{rev.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
