import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';

export default function CourierCard({ courier }) {
  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>담당 기사님 정보</h3>
      <div className="courier-info">
        <img src={courier.photo} alt={courier.name} />
        <div>
          <div style={{ fontWeight: 800, fontSize: '18px' }}>{courier.name} 기사님</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>친절하고 빠른 배송을 약속합니다.</div>
        </div>
      </div>
      <div className="flex gap-10" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Phone size={18} /> 전화하기
        </button>
        <button className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <MessageSquare size={18} /> 메시지
        </button>
      </div>
    </div>
  );
}
