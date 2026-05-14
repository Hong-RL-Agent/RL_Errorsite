import React from "react";

export default function ReviewSection() {
  return <section className="review-section"><div className="section-heading"><span>Reviews</span><h2>고객 후기</h2></div><div className="review-grid">{["꽃 상태가 싱싱했고 포장이 예뻤어요.", "당일 배송 시간이 정확했습니다.", "기념일 선물로 분위기가 정말 좋았어요."].map((text) => <article key={text}><strong>★★★★★</strong><p>{text}</p></article>)}</div></section>;
}
