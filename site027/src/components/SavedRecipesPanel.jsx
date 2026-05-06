import React from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';

export default function SavedRecipesPanel() {
  const saved = [
    { id: 1, title: "정통 이탈리안 까르보나라", img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=100&h=100&fit=crop" },
    { id: 2, title: "매콤 달콤 떡볶이", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&h=100&fit=crop" }
  ];

  return (
    <aside className="saved-recipes-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Bookmark size={20} color="var(--primary)" fill="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '18px' }}>내가 저장한 레시피</h3>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {saved.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }} onClick={() => alert('레시피 상세 페이지로 이동합니다.')}>
            <img src={item.img} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3, marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2일 전 저장</div>
            </div>
            <ExternalLink size={14} color="#ccc" />
          </div>
        ))}
      </div>

      <button className="btn btn-outline" style={{ width: '100%', marginTop: '25px', padding: '10px', fontSize: '13px' }} onClick={() => alert('준비중입니다.')}>전체 보기</button>
    </aside>
  );
}
