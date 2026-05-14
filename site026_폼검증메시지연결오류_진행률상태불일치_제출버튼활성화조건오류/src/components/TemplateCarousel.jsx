import React from 'react';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';

export default function TemplateCarousel({ templates }) {
  return (
    <div className="container" style={{ margin: '60px auto' }}>
      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px' }}>추천 템플릿</h2>
        <div className="flex gap-10" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" style={{ padding: '8px' }} onClick={() => alert('준비중입니다.')}><ChevronLeft size={20} /></button>
          <button className="btn btn-outline" style={{ padding: '8px' }} onClick={() => alert('준비중입니다.')}><ChevronRight size={20} /></button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '20px', overflowX: 'hidden', padding: '10px 0' }}>
        {templates.map(t => (
          <div key={t.id} className="template-card" style={{ cursor: 'pointer' }} onClick={() => alert(`${t.name} 템플릿을 불러옵니다.`)}>
            <div style={{ background: '#f1f5f9', height: '100px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.recommended && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--accent)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>PICK</span>}
              <ClipboardList size={32} color="#cbd5e1" />
            </div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{t.name}</h4>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.category} • {t.count}문항</div>
          </div>
        ))}
      </div>
    </div>
  );
}
