import React, { useState, useEffect } from 'react';
import { User, Mail, Upload, CheckCircle2, Sparkles, BookOpen, MessageSquare } from 'lucide-react';
import { getCurrentUser, setCurrentUser, fetchApi } from '../api/client';

export default function Profile({ onShowToast }) {
  const [user, setUser] = useState(getCurrentUser());
  const [users, setUsers] = useState([]);
  const [bio, setBio] = useState(user.bio || '취미 클래스를 즐기는 수강생입니다.');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Avatar presets for mock upload
  const avatarPresets = [
    { name: '아바타 A (자연)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { name: '아바타 B (감성)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { name: '아바타 C (프로필)', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
    { name: '아바타 D (전문가)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: '새 이미지 (NEW)', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' }
  ];

  useEffect(() => {
    fetchApi('/api/users')
      .then(data => setUsers(data))
      .catch(() => {});
  }, []);

  const handleSwitchUser = (u) => {
    setCurrentUser(u);
    setUser(u);
    setBio(u.bio || '');
    if (onShowToast) onShowToast(`'${u.name}'(${u.role === 'instructor' ? '강사' : '수강생'}) 계정으로 전환되었습니다.`, 'info');
  };

  // Upload Avatar (SEC-418: upload-preview-sync bug)
  const handleUploadAvatar = (e) => {
    e.preventDefault();
    setUploading(true);

    const targetAvatar = selectedAvatarUrl || avatarPresets[4].url;

    fetchApi('/api/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl: targetAvatar })
    })
      .then(res => {
        setUploading(false);
        if (onShowToast) onShowToast('프로필 이미지가 서버에 업로드되었습니다.', 'success');
        // SEC-418: response contains stale avatar or frontend retains previous avatar
        if (res.user) {
          setUser(prev => ({ ...prev, avatar: res.user.avatar }));
        }
      })
      .catch(err => {
        setUploading(false);
        if (onShowToast) onShowToast(err.message, 'error');
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 840, margin: '0 auto', width: '100%' }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img
            id="profile-avatar-img"
            src={user.avatar}
            alt={user.name}
            style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--soft-blue-light)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-navy)' }}>{user.name}</h1>
              <span className={`badge ${user.role === 'instructor' ? 'badge-blue' : 'badge-beige'}`}>
                {user.role === 'instructor' ? '공방 강사' : '일반 수강생'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} /> {user.email}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 8, lineHeight: 1.5 }}>
              {bio}
            </p>
          </div>
        </div>
      </div>

      {/* Avatar Image Upload Box (SEC-418) */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
          프로필 사진 변경 및 업로드
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          새로운 아바타 이미지 프리셋을 선택하거나 파일 업로드 후 저장하세요.
        </p>

        <form onSubmit={handleUploadAvatar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {avatarPresets.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAvatarUrl(preset.url)}
                style={{
                  padding: '8px',
                  borderRadius: 12,
                  border: selectedAvatarUrl === preset.url ? '2px solid var(--soft-blue)' : '1px solid var(--border-color)',
                  backgroundColor: selectedAvatarUrl === preset.url ? 'var(--soft-blue-light)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <img src={preset.url} alt={preset.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{preset.name}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <input
              id="input-avatar-file"
              type="file"
              accept="image/*"
              className="form-input"
              style={{ padding: '6px 12px', fontSize: 13 }}
            />
            <button
              id="btn-upload-avatar"
              type="submit"
              disabled={uploading}
              className="btn btn-primary"
            >
              <Upload size={15} />
              <span>{uploading ? '업로드 중...' : '프로필 이미지 적용'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* User Switcher (For PPO session test) */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
          테스트 사용자 계정 전환
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          강사(박서준, 최유진)와 일반 수강생(김민지, 이주원, 정다은) 계정 간 세션을 자유롭게 전환할 수 있습니다.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {users.map(u => (
            <div
              key={u.id}
              id={`switch-user-${u.id}`}
              onClick={() => handleSwitchUser(u)}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: u.id === user.id ? '2px solid var(--soft-blue)' : '1px solid var(--border-color)',
                backgroundColor: u.id === user.id ? 'var(--soft-blue-light)' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={u.avatar} alt={u.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--primary-navy)' }}>{u.name}</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{u.role === 'instructor' ? '강사' : '수강생'}</span>
                </div>
              </div>
              {u.id === user.id && <CheckCircle2 size={18} color="var(--soft-blue)" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
