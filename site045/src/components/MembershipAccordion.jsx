import { useState } from 'react';

const benefits = [
  {
    title: '프리미엄 멤버십 할인',
    description: '멤버십 고객은 첫 예약 시 15% 할인 혜택을 받습니다.'
  },
  {
    title: '정기 케어 우선 예약',
    description: '월간 멤버는 인기 스타일리스트의 우선 예약을 지원합니다.'
  },
  {
    title: '시그니처 패키지 업그레이드',
    description: '두 번째 예약부터 케어 패키지 업그레이드를 제공합니다.'
  }
];

export default function MembershipAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="membership-section">
      <div className="section-header">
        <h3>멤버십 혜택</h3>
        <p>뷰티 멤버십으로 더 많은 혜택을 누리세요.</p>
      </div>
      <div className="accordion-list">
        {benefits.map((benefit, index) => (
          <div key={benefit.title} className={`accordion-item ${openIndex === index ? 'open' : ''}`}>
            <button type="button" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              <span>{benefit.title}</span>
              <strong>{openIndex === index ? '−' : '+'}</strong>
            </button>
            {openIndex === index && <p>{benefit.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
