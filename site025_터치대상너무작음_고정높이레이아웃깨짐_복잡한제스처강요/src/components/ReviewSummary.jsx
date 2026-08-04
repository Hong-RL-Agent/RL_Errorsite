import React from 'react';
import { MessageSquare, ThumbsUp } from 'lucide-react';

export default function ReviewSummary() {
  return (
    <div style={{ marginTop: '40px', padding: '30px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>생생한 이용 후기</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ padding: '15px', background: '#fcfcfc', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>사용자***</span>
              <span style={{ color: '#ffc107', fontSize: '12px' }}>★★★★★</span>
            </div>
            <p style={{ fontSize: '13px', color: '#444', margin: '0 0 10px 0', lineHeight: 1.5 }}>
              배달도 정말 빠르고 음식도 따뜻하게 잘 왔어요. 다음에도 또 주문할게요!
            </p>
            <div style={{ display: 'flex', gap: '15px', color: '#999', fontSize: '12px' }}>
              <span className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={14} /> 12</span>
              <span className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14} /> 2</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
