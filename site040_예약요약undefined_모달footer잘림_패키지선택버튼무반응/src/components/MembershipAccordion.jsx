import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const MembershipAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const perks = [
    { title: 'GOLD MEMBERSHIP 혜택', content: '연회비 결제 시 모든 프로그램 20% 상시 할인 및 월 1회 프라이빗 룸 무료 업그레이드 혜택을 제공합니다.' },
    { title: '신규 가입 바우처', content: '아쥬르 스파 신규 가입 시 첫 방문 30,000원 할인 바우처를 즉시 발급해 드립니다.' },
    { title: '생일 기념 리츄얼', content: '생일 당월 방문 시 시그니처 웰컴 드링크와 미니 아로마 캔들 세트를 증정합니다.' }
  ];

  return (
    <div style={{ marginTop: '100px' }}>
      <h2 className="section-title">Membership Perks</h2>
      <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid var(--border-color)' }}>
        {perks.map((perk, index) => (
          <div key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
            <button 
              style={{ width: '100%', padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: 'none', cursor: 'pointer' }}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            >
              <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--primary)' }}>{perk.title}</span>
              {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
            </button>
            {openIndex === index && (
              <div style={{ padding: '0 25px 25px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                {perk.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipAccordion;
