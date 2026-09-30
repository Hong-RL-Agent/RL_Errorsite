import React, { useState, useEffect } from 'react';
import { User, Mail, Award, CreditCard, Heart, Save, Edit3, Sparkles } from 'lucide-react';

export default function Profile({ onShowToast }) {
  const [profile, setProfile] = useState(null);
  const [bioInput, setBioInput] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setBioInput(data.bio || '');
      })
      .catch(console.error);
  }, []);

  // SEC-362: Profile Bio Save
  const handleSaveBio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioInput })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        onShowToast({
          title: '프로필 소개 저장 완료',
          message: '마이페이지 자기소개(Bio)가 성공적으로 저장되었습니다.',
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">마이페이지 & 프로필 관리</h1>
          <p className="page-subtitle">회원 등급, 포인트, 쿠폰 현황 및 프로필 정보를 관리합니다.</p>
        </div>
      </div>

      <div className="grid-layout grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>회원 등급</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{profile?.role || 'VIP Member'}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>보유 포인트</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{profile?.points?.toLocaleString() || 0} P</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>사용 가능 쿠폰</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{profile?.coupons || 0}장</div>
          </div>
        </div>
      </div>

      {/* Profile Form (SEC-362) */}
      <div className="card" style={{ maxWidth: '680px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--primary)" /> 회원 기본 정보 & 소개글
        </h3>

        <form onSubmit={handleSaveBio}>
          <div className="grid-layout grid-2" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                type="text"
                className="form-input"
                value={profile?.name || ''}
                disabled
                style={{ background: '#f5f5f4' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-input"
                value={profile?.email || ''}
                disabled
                style={{ background: '#f5f5f4' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">프로필 소개글 (Bio) *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="자신의 라이프스타일 취향이나 관심사를 소개해주세요..."
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
          >
            <Save size={16} /> 프로필 소개 저장
          </button>
        </form>
      </div>
    </div>
  );
}
