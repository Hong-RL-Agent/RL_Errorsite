import React from 'react';
import { User, Award, Clock, HeartHandshake, MapPin, Mail, ShieldCheck } from 'lucide-react';

export default function Profile({ user, navigate }) {
  if (!user) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>로그인이 필요합니다.</h2>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div className="profile-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <img 
            src={user.avatar} 
            alt={user.name} 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>{user.name}</h1>
              <span className={`user-role-badge ${user.role === 'organizer' ? 'organizer' : ''}`}>
                {user.role === 'organizer' ? '활동 주최자' : '일반 봉사자'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={15} /> {user.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={15} /> {user.region}</span>
              {user.organization && <span>• {user.organization}</span>}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">{user.volunteerHours}시간</div>
            <div className="stat-label">인증 봉사활동 시간</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{user.completedCount}회</div>
            <div className="stat-label">참여 완료 활동</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">100%</div>
            <div className="stat-label">참여 약속 이행률</div>
          </div>
        </div>

        {/* Volunteer Certification Info */}
        <div style={{ marginTop: '28px', padding: '18px', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary-light)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={28} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-dark)' }}>1365 자원봉사포털 연계 완료</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NeighborHands에서 인증된 봉사시간은 행정안전부 1365 자원봉사 포털에 자동 등록됩니다.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
