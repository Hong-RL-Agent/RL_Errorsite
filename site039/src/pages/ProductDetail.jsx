import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, ArrowLeft, Check, ShieldCheck, Truck, MessageSquare, Send } from 'lucide-react';

export default function ProductDetail({ product, onBack, onAddToCart, onShowToast, onNavigate }) {
  const [selectedOption, setSelectedOption] = useState(product?.options ? product.options[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    if (product?.id) {
      fetch(`/api/products/${product.id}/comments`)
        .then(res => res.json())
        .then(data => setComments(data))
        .catch(console.error);
    }
  }, [product]);

  if (!product) return null;

  // SEC-368: Add to Cart
  const handleAddToCart = async () => {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          option: selectedOption,
          quantity
        })
      });
      const data = await res.json();
      if (data.success) {
        onAddToCart(product, selectedOption, quantity);
        onShowToast({
          title: '장바구니 담기 완료',
          message: `[${product.name}] 상품(${quantity}개)이 장바구니에 추가되었습니다.`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SEC-366: Product Comment Submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/products/${product.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          rating: newRating
        })
      });
      const data = await res.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
        onShowToast({
          title: '상품 한줄평 등록 완료',
          message: '소중한 상품 리뷰 댓글이 등록되었습니다.',
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <button
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ width: 'fit-content' }}
      >
        <ArrowLeft size={15} /> 목록으로 돌아가기
      </button>

      <div className="grid-layout grid-2" style={{ gridTemplateColumns: '1fr 1.1fr', gap: '36px' }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', background: '#f5f0eb' }}>
            <img
              src={product.thumbnail}
              alt={product.name}
              style={{ width: '100%', height: '420px', objectFit: 'cover' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            {product.images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border)', cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {/* Product Meta & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>
            {product.brand}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', lineHeight: 1.3 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '14px', fontWeight: 700 }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{product.rating}</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>리뷰 {product.reviewCount}건</span>
            <span className="badge badge-olive">재고 {product.stock}개 남음</span>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>판매가</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              {product.discountRate > 0 && (
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e11d48' }}>
                  {product.discountRate}%
                </span>
              )}
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                ₩{(product.finalPrice || product.price).toLocaleString()}
              </span>
              {product.discountRate > 0 && (
                <span style={{ fontSize: '1rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₩{product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Options */}
          {product.options && (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">옵션 선택</label>
              <select
                className="form-input"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                {product.options.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">수량</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span style={{ padding: '0 12px', fontWeight: 700, fontSize: '15px' }}>{quantity}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* SEC-368: Add to Cart Action */}
          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center', height: '48px', fontSize: '15px' }}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} /> 장바구니 담기
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1.2, justifyContent: 'center', height: '48px', fontSize: '15px' }}
              onClick={() => {
                handleAddToCart();
                onNavigate('checkout');
              }}
            >
              바로 구매하기
            </button>
          </div>
        </div>
      </div>

      {/* Description & Review Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>상품 상세 설명</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '14px', marginBottom: '32px' }}>
          {product.description}
        </p>

        {/* SEC-366: Product Comments */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--primary)" /> 구매 고객 상품 댓글 & 한줄평 ({comments.length}건)
          </h3>

          <form onSubmit={handleAddComment} style={{ marginBottom: '24px', background: '#fbf9f6', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>평점:</span>
              <select
                className="form-input"
                style={{ width: '120px' }}
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
              >
                <option value={5}>★★★★★ (5점)</option>
                <option value={4}>★★★★☆ (4점)</option>
                <option value={3}>★★★☆☆ (3점)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="상품에 대한 느낌이나 사용 후기를 남겨주세요."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <Send size={15} /> 댓글 등록
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '14px 16px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{c.userName}</span>
                  <span style={{ fontSize: '12px', color: '#f59e0b' }}>{'★'.repeat(c.rating || 5)}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>{c.content}</p>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{c.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
