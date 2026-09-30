import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Key, Globe, Save } from 'lucide-react';

export default function Settings({ onShowToast }) {
  const [profile, setProfile] = useState({
    name: '강지훈',
    email: 'creator@example.com',
    channelName: 'DailyFrame Studio',
    subscribers: '142,000',
    bio: '서울의 감각적인 카페와 여행 브이로그를 제작하는 영상 크리에이터입니다.',
    mainPlatform: 'YouTube'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/creator/profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setProfile(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/creator/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        onShowToast({
          title: '프로필 설정 저장 완료',
          message: '크리에이터 프로필 정보가 성공적으로 업데이트되었습니다.',
          type: 'success'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">설정 & 크리에이터 프로필</h1>
          <p className="page-subtitle">채널 기본 정보, 알림 수신 설정 및 플랫폼 연동을 관리합니다.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--primary-color)" /> 크리에이터 기본 정보
        </h3>

        <form onSubmit={handleSave}>
          <div className="grid-layout grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">크리에이터 성명</label>
              <input
                type="text"
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">이메일 주소</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                disabled
                style={{ background: 'var(--bg-main)', color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          <div className="grid-layout grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">채널/스튜디오 명칭</label>
              <input
                type="text"
                className="form-input"
                value={profile.channelName}
                onChange={(e) => setProfile({ ...profile, channelName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">주력 플랫폼</label>
              <select
                className="form-input"
                value={profile.mainPlatform}
                onChange={(e) => setProfile({ ...profile, mainPlatform: e.target.value })}
              >
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Podcast">Podcast</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">채널 소개 (Bio)</label>
            <textarea
              className="form-input"
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '12px' }}
            disabled={saving}
          >
            <Save size={16} /> {saving ? '저장 중...' : '설정 저장'}
          </button>
        </form>
      </div>
    </div>
  );
}
