import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';

export default function ReviewSummary({ reviews }) {
  return (
    <section style={{ marginTop: '60px', padding: '40px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '30px' }}>고객 리뷰 요약</h2>
      <div className="flex flex-col gap-20">
        {reviews.map(review => (
          <div key={review.id} style={{ paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
              <div className="flex items-center gap-10">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "#ffc107" : "none"} color={i < review.rating ? "#ffc107" : "#ddd"} />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: '#999' }}>{review.date}</span>
              </div>
              <div className="flex items-center gap-10" style={{ fontSize: '13px', color: '#666' }}>
                <ThumbsUp size={14} /> 도움이 됨 ({review.recommendations})
              </div>
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{review.summary}</p>
          </div>
        ))}
      </div>
      <button className="btn btn-outline" style={{ width: '100%', marginTop: '20px', border: '1px solid #ddd' }} onClick={() => alert('준비중입니다.')}>리뷰 전체보기</button>
    </section>
  );
}
