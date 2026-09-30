import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Calendar, Bookmark, BookOpen, Users, Plus, CheckCircle, ChevronDown } from 'lucide-react';
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
            <UtensilsCrossed size={20} />
          </div>
          <span>TableNote</span>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          <button 
            className={`nav-link ${currentRoute === '/' || currentRoute === '/recipes' ? 'active' : ''}`}
            onClick={() => navigate('/recipes')}
          >
            레시피 탐색
          </button>
          <button 
            className={`nav-link ${currentRoute === '/meal-planner' ? 'active' : ''}`}
            onClick={() => navigate('/meal-planner')}
          >
            식단 캘린더
          </button>
          <button 
            className={`nav-link ${currentRoute === '/favorites' ? 'active' : ''}`}
            onClick={() => navigate('/favorites')}
          >
            즐겨찾기
          </button>
          <button 
            className={`nav-link ${currentRoute.startsWith('/community') ? 'active' : ''}`}
            onClick={() => navigate('/community')}
          >
            커뮤니티
          </button>
        </nav>

        {/* Right Section */}
        <div className="header-right">
          <button 
            className="btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            onClick={() => navigate('/recipes/new')}
          >
            <Plus size={16} />
            <span>레시피 작성</span>
          </button>

          {/* User Profile Pill */}
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
              <h3 className="modal-title">사용자 전환</h3>
              <button className="icon-button" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              다른 홈쿡러 계정으로 간편하게 전환하여 테스트할 수 있습니다.
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
                    background: user && user.id === u.id ? 'var(--primary-subtle)' : 'var(--cream-card)',
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
