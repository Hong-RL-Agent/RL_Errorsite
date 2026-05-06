import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: '수강 기간에 제한이 있나요?', a: '기본적으로 결제하신 강의는 평생 소장하실 수 있습니다. 단, 강사와의 질의응답 지원 기간은 과정에 따라 다를 수 있습니다.' },
    { q: '결제 취소 및 환불 규정은 어떻게 되나요?', a: '결제 후 7일 이내, 진도율 5% 미만인 경우 전액 환불이 가능합니다. 자세한 사항은 이용약관을 참고해 주세요.' },
    { q: '강의 자료는 어디서 다운로드 받나요?', a: '각 강의의 첫 번째 섹션에 수업 자료를 다운로드 받을 수 있는 링크가 제공됩니다.' }
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2 style={{fontSize: '1.5rem', marginBottom: '1.5rem'}}>자주 묻는 질문</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-q" onClick={() => toggle(index)}>
              <span>{faq.q}</span>
              {openIndex === index ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
            </div>
            {openIndex === index && (
              <div className="faq-a">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
