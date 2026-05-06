import React from 'react';
import { Megaphone, Star } from 'lucide-react';

export default function Sidebar({ announcements }) {
  return (
    // INTENTIONAL GUI BUG: site004-bug03
    // Type: css-layout
    // 사이드바 컨테이너에 data-bug-id 부여. CSS에서 absolute 로 띄워져 본문을 덮음.
    <aside className="sidebar" data-bug-id="site004-bug03">
      <div className="widget">
        <h3 className="widget-title">내 프로필</h3>
        <div className="profile-card">
          <div className="avatar">학</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>학습자</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>일반 회원</div>
          </div>
        </div>
      </div>
      
      <div className="widget">
        <h3 className="widget-title">
          <Megaphone size={18} color="var(--primary)" />
          공지사항
        </h3>
        <ul className="announcement-list">
          {announcements.map(item => (
            <li key={item.id}>
              <div className="announcement-title">{item.title}</div>
              <div className="announcement-date">{item.date}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="widget" style={{ marginTop: '40px', background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', padding: '20px', borderRadius: '12px', color: 'white' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Star fill="white" size={20} />
          프리미엄 패스
        </h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
          모든 강의를 무제한으로 수강하세요! 지금 가입하면 첫 달 무료.
        </p>
      </div>
    </aside>
  );
}
