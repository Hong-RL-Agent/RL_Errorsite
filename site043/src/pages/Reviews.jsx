import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';

export default function Reviews({ showToast }) {
  const [reviews, setReviews] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('prod-103'); // Soft Boucle Lounge Armchair (from cancelled order)
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          rating,
          content,
          canReview: true // Client asserts review eligibility
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          '상품 후기가 등록되었습니다!',
          data.bugId || 'site043-bug05',
          data.secId || 'SEC-400'
        );
        setContent('');
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>실제 구매 고객 포토 & 텍스트 리뷰</h2>
          <p>공간을 바꾼 고객님들의 생생한 인테리어 후기입니다.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
        {/* Write Review Card */}
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, border: '1px solid #e9e3da', height: 'fit-content' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1f1d1a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquarePlus size={18} color="#855b32" />
            인테리어 후기 작성
          </h3>

          <form onSubmit={handleCreateReview}>
            <div className="form-group">
              <label className="form-label">리뷰 작성 상품 선택</label>
              <select
                className="form-select"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="prod-103">소프트 부클레 라운지 암체어 (취소 주문 건)</option>
                <option value="prod-104">미드센추리 플로어 아치 램프 (배송 완료 건)</option>
                <option value="prod-101">노르딕 모던 3인용 패브릭 소파</option>
                <option value="prod-102">내추럴 오크 원목 다이닝 식탁</option>
                <option value="prod-106">워셔블 단모 사이잘룩 러그</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">별점 평가</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    size={24}
                    color="#f59e0b"
                    fill={num <= rating ? '#f59e0b' : 'none'}
                    onClick={() => setRating(num)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">후기 내용</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="가구의 착석감, 마감 퀄리티, 실제 배치 느낌을 공유해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="hero-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? '후기 등록 중...' : '포토/텍스트 후기 등록하기'}
            </button>
          </form>
        </div>

        {/* Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#ffffff',
                padding: 22,
                borderRadius: 16,
                border: '1px solid #e9e3da'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#1f1d1a' }}>{r.author}</span>
                  <span style={{ fontSize: 12, color: '#9e968b' }}>{r.date}</span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#3d3832', lineHeight: 1.6 }}>{r.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
