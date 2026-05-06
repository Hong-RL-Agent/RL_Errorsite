import React from 'react';

export default function Footer() {
  const menuGroups = [
    { title: '요리 가이드', items: ['기초 칼질법', '육수 내기', '향신료 백과', '플레이팅 팁'] },
    { title: '제철 요리', items: ['봄나물 특집', '여름 보양식', '가을 버섯 요리', '겨울 따뜻한 국물'] },
    { title: '커뮤니티', items: ['요리 톡톡', '우리집 식탁', '셰프의 비법', '이벤트'] }
  ];

  return (
    <footer style={{ marginTop: '80px', padding: '60px 0', background: '#3d405b', color: '#fefae0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, marginBottom: '20px', color: 'white' }}>ChefTable</div>
            <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.6 }}>세상의 모든 레시피를 담다.<br/>당신의 소중한 끼니를 위해 셰프테이블이 함께합니다.</p>
          </div>
          {menuGroups.map(group => (
            <div key={group.title}>
              <h4 style={{ color: 'white', marginBottom: '20px' }}>{group.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: 2.2, opacity: 0.8 }}>
                {group.items.map(item => (
                  <li key={item} style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', textAlign: 'center', opacity: 0.6 }}>
          &copy; 2026 ChefTable Media. All rights reserved. | <span style={{ cursor: 'pointer' }} onClick={() => alert('준비중입니다.')}>개인정보처리방침</span>
        </div>
      </div>
    </footer>
  );
}
