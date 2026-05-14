import { useState } from 'react';

const faqs = [
  ['기존 CRM과 연동되나요?', 'Salesforce, HubSpot, Stripe, Segment 기반 워크플로우 연동을 지원합니다.'],
  ['보안 검토 자료를 받을 수 있나요?', 'SOC2 보고서, DPA, 권한 정책 문서를 데모 요청 후 제공할 수 있습니다.'],
  ['도입 기간은 어느 정도인가요?', '데이터 소스 수에 따라 다르지만 일반적인 스타트업 팀은 2주 안에 핵심 대시보드를 운영합니다.'],
  ['개발자 API가 있나요?', 'REST API와 Webhook 문서를 제공하며 샌드박스 키는 영업팀을 통해 발급됩니다.']
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section faq-section">
      <div className="section-heading">
        <span className="eyebrow">FAQ</span>
        <h2>구매 전 자주 묻는 질문</h2>
      </div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <article className="faq-item" key={question}>
            <button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
              {question}
              <span>{open === index ? '-' : '+'}</span>
            </button>
            {open === index && <p>{answer}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
