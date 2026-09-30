import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Plus, User, CheckCircle, ChevronDown, BookOpen } from 'lucide-react';
import { api, setStoredUser } from '../api/client';

export default function Header({ user, setUser, currentRoute, navigate }) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    api.getUsers().then(setAllUsers).catch(() => {});
  }, []);

  const handleSwitchUser = async (targetUser) => {
    try {
      const res = await api.login(targetUser.id);
      if (res.user) {
        setUser(res.user);
        setStoredUser(res.user);
      }
      setShowUserModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => navigate('/')}>
          <div className="brand-icon">
            <Compass size={22} />
          </div>
          <span>TripLog</span>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          <button 
            className={`nav-link ${currentRoute === '/' || currentRoute === '/travel' ? 'active' : ''}`}
            onClick={() => navigate('/travel')}
          >
            여행 찾기
          </button>
          <button 
            className={`nav-link ${currentRoute === '/travel/new' ? 'active' : ''}`}
            onClick={() => navigate('/travel/new')}
          >
            일정 만들기
          </button>
          <button 
            className={`nav-link ${currentRoute === '/my-travel' ? 'active' : ''}`}
            onClick={() => navigate('/my-travel')}
          >
            내 여행
          </button>
          <button 
            className={`nav-link ${currentRoute.startsWith('/community') ? 'active' : ''}`}
            onClick={() => navigate('/community')}
          >
            여행 커뮤니티
          </button>
        </nav>

        {/* Right Section */}
        <div className="header-right">
          <button 
            className="btn-primary" 
            style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            onClick={() => navigate('/travel/new')}
          >
            <Plus size={16} />
            <span>여행기 작성</span>
          </button>

          {/* User Profile */}
          {user && (
            <div className="user-profile-pill" onClick={() => setShowUserModal(true)}>
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <span className="user-name">{user.name}</span>
              <ChevronDown size={14} color="var(--text-light)" />
            </div>
          )}
        </div>
      </div>

      {/* User Switcher Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">여행자 계정 전환</h3>
              <button className="icon-button" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              다른 여행 크리에이터 계정으로 간편하게 전환할 수 있습니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allUsers.map(u => (
                <div 
                  key={u.id}
                  onClick={() => handleSwitchUser(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: user && user.id === u.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: user && user.id === u.id ? 'var(--primary-subtle)' : 'var(--sand-card)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{u.bio}</div>
                    </div>
                  </div>
                  {user && user.id === u.id && <CheckCircle size={20} color="var(--primary)" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
