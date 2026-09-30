import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Building, Save, CheckCircle2 } from 'lucide-react';

export default function Profile({ currentUser, setCurrentUser, showToast }) {
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.bio !== undefined) {
      setBio(currentUser.bio);
    }
  }, [currentUser]);

  const handleSaveBio = (e) => {
    e.preventDefault();
    setLoading(true);
    const idempotency_key = `BIO-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/profile/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.profile) {
        setCurrentUser(data.profile);
        showToast('프로필 저장 완료', '프로필 소개 정보가 성공적으로 업데이트되었습니다.', 'success', data.transaction_id);
      }
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <img 
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
            alt="Profile Avatar"
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>{currentUser?.name || '김민준'}</h2>
              <span className="badge badge-active">{currentUser?.status || 'online'}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={14} /> {currentUser?.role || 'Product Lead'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> {currentUser?.department || 'Product Strategy'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {currentUser?.email || 'minjun.kim@worknest.io'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Edit Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">프로필 소개 (Bio) 설정</h3>
            <p className="card-subtitle">팀 멤버들에게 노출되는 내 소개 글을 수정합니다.</p>
          </div>
        </div>

        <form onSubmit={handleSaveBio}>
          <div className="form-group">
            <label className="form-label">한 줄 소개 및 전문 분야</label>
            <textarea
              className="form-control"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="자신의 역할과 협업하고 싶은 분야를 간략히 소개해 주세요."
              rows="4"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? '저장 중...' : '프로필 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
