import React from "react";

export default function FAQSection({ onPreparing }) {
  return (
    <section className="faq-section">
      <div className="section-heading">
        <span>FAQ</span>
        <h2>자주 묻는 질문</h2>
      </div>
      <div className="faq-list">
        <button onClick={onPreparing}>예약 변경은 언제까지 가능한가요?</button>
        <button onClick={onPreparing}>호텔링 전 준비물이 있나요?</button>
        <button onClick={onPreparing}>방문 돌봄 리포트는 어떻게 받나요?</button>
      </div>
    </section>
  );
}
