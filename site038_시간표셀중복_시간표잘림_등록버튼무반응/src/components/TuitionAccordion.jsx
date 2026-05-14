import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TuitionAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const items = [
    { title: '수강료 결제 방법 안내', content: '신용카드, 계좌이체, 카카오페이, 네이버페이로 결제가 가능합니다. 오프라인 방문 결제 시 제로페이 및 지역화폐 사용이 가능합니다.' },
    { title: '형제/자매 할인 혜택', content: '형제나 자매가 동시 수강 시 각각 수강료의 10%를 할인해 드립니다. 증빙 서류(가족관계증명서)를 행정실에 제출해주세요.' },
    { title: '장기 수강 할인 (3개월 이상)', content: '3개월 일시 결제 시 총 금액의 5%, 6개월 일시 결제 시 총 금액의 10%를 할인해 드립니다.' },
    { title: '교재비 및 기타 제비용', content: '수강료에는 기본 프린트물이 포함되어 있습니다. 단, 시중 교재를 사용하는 경우 별도로 구매하셔야 합니다.' }
  ];

  return (
    <div style={{ marginTop: '80px' }}>
      <h2 className="section-title">수강료 및 혜택 안내</h2>
      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {items.map((item, index) => (
          <div key={index} className="accordion-item">
            <button className="accordion-header" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              {item.title}
              {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {openIndex === index && (
              <div className="accordion-content">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TuitionAccordion;
