import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { updateProfile } from '../lib/api';

export default function ProfileSection({ user, onProfileUpdated, onShowToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
    }
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateProfile(user.id, { name, email, bio });
      if (res.success) {
        onShowToast('프로필 정보가 성공적으로 저장되었습니다.');
        onProfileUpdated(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('프로필 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-card">
      <div className="section-header">
        <h3 className="section-title">개인 프로필 정보 설정</h3>
        <p className="section-desc">SaaS 플랫폼 내에서 다른 팀원에게 노출될 기본 프로필을 관리합니다.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>사용자 아이디 (고유 식별자)</label>
          <input
            type="text"
            className="form-control"
            value={user.username}
            disabled
            style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}
          />
        </div>

        <div className="form-group">
          <label>성명 / 닉네임</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>연락처 이메일 주소</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>자기소개 / 바이오</label>
          <textarea
            className="form-control"
            rows="3"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="간단한 자기소개를 입력하세요..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={14} />
            <span>{saving ? '저장 중...' : '프로필 변경사항 저장'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
