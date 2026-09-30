import React from 'react';
import { User, ShieldCheck, CreditCard, Film, Award } from 'lucide-react';

export default function MyPage({ user, subscription, onNavigate }) {
  if (!user) return null;

  return (
    <div>
      {/* User Summary */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: 36,
          border: '1px solid #e2e8f0',
          marginBottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          flexWrap: 'wrap'
        }}
      >
        <img
          src={user.avatar}
          alt={user.name}
          style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{user.name} 회원님</h2>
            <span style={{ background: '#eef2ff', color: '#6366f1', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 9999 }}>
              {subscription?.planName || 'Passly 회원'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            {user.email} · {user.phone}
          </p>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: '#0f172a', fontWeight: 600 }}>
            <span>구독 상태: <strong style={{ color: '#10b981' }}>{subscription?.status === 'active' ? '정상 이용중' : subscription?.status}</strong></span>
            <span>가입일: <strong>{user.joinedDate}</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Menu */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <div
          onClick={() => onNavigate('subscription')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', cursor: 'pointer' }}
        >
          <ShieldCheck size={28} color="#6366f1" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>내 구독 관리</h4>
          <p style={{ fontSize: 13, color: '#64748b' }}>플랜 변경, 일시정지 및 해지 신청</p>
        </div>

        <div
          onClick={() => onNavigate('billing')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', cursor: 'pointer' }}
        >
          <CreditCard size={28} color="#10b981" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>결제 & 청구 내역</h4>
          <p style={{ fontSize: 13, color: '#64748b' }}>등록 카드 및 월별 영수증 내역 확인</p>
        </div>

        <div
          onClick={() => onNavigate('content')}
          style={{ background: '#ffffff', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', cursor: 'pointer' }}
        >
          <Film size={28} color="#6366f1" style={{ marginBottom: 12 }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>콘텐츠 라운지</h4>
          <p style={{ fontSize: 13, color: '#64748b' }}>4K 시네마, VIP 클래스 스트리밍</p>
        </div>
      </div>
    </div>
  );
}
