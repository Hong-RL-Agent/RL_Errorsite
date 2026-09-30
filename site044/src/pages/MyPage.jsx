import React from 'react';
import { User, Calendar, Heart, Award, ShieldCheck } from 'lucide-react';

export default function MyPage({ user, onNavigate }) {
  if (!user) return null;

  return (
    <div>
      {/* Profile Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: 36,
          border: '1px solid #e7e5e4',
          marginBottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#c2410c',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 800
          }}
        >
          {user.name.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917' }}>{user.name} 님</h2>
            <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 9999 }}>
              {user.tier}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#78716c', marginBottom: 12 }}>
            {user.email} · {user.phone}
          </p>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: '#1c1917', fontWeight: 600 }}>
            <span>방문 완료: <strong>8회</strong></span>
            <span>노쇼(No-Show): <strong>0회 (매너 다이너)</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Menu */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <div
          onClick={() => onNavigate('reservations')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e7e5e4', cursor: 'pointer' }}
        >
          <Calendar size={28} color="#c2410c" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1c1917', marginBottom: 4 }}>나의 예약 관리</h4>
          <p style={{ fontSize: 13, color: '#78716c' }}>실시간 예약 내역 조회, 인원/시간 변경 및 취소</p>
        </div>

        <div
          onClick={() => onNavigate('wishlist')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e7e5e4', cursor: 'pointer' }}
        >
          <Heart size={28} color="#ef4444" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#1c1917', marginBottom: 4 }}>저장한 레스토랑</h4>
          <p style={{ fontSize: 13, color: '#78716c' }}>내가 찜한 미식 핫플레이스 목록</p>
        </div>
      </div>
    </div>
  );
}
