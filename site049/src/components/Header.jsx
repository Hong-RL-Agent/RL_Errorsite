import React, { useState, useEffect } from 'react';
import { HeartHandshake, Bell, LogIn, LogOut, User, CheckCircle, ChevronDown, Sparkles } from 'lucide-react';
import { api, setStoredUser } from '../api/client';

export default function Header({ user, setUser, currentRoute, navigate }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    loadNotifications();
    api.getUsers().then(setAllUsers).catch(() => {});
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await api.logout();
      // INTENTIONAL BACKEND BUG: site049-SEC-421
      // Server session is cleared, but client state or storage is not fully reset immediately,
      // simulating stale session state
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchUser = async (targetUser) => {
    try {
      const res = await api.login({ userId: targetUser.id });
      if (res.user) {
        setUser(res.user);
        setStoredUser(res.user);
      }
      setShowUserModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      // Update local state partially or trigger refresh
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => navigate('/')}>
          <div className="brand-icon">
            <HeartHandshake size={22} />
          </div>
          <span>NeighborHands</span>
        </div>

        {/* Nav Links */}
        <nav className="nav-menu">
          <button 
            className={`nav-link ${currentRoute === '/' || currentRoute === '/activities' ? 'active' : ''}`}
            onClick={() => navigate('/activities')}
          >
            봉사활동 찾기
          </button>
          <button 
            className={`nav-link ${currentRoute === '/my-activities' ? 'active' : ''}`}
            onClick={() => navigate('/my-activities')}
          >
            참여 내역
          </button>
          <button 
            className={`nav-link ${currentRoute.startsWith('/community') ? 'active' : ''}`}
            onClick={() => navigate('/community')}
          >
            커뮤니티
          </button>
          <button 
            className={`nav-link ${currentRoute === '/organizer' ? 'active' : ''}`}
            onClick={() => navigate('/organizer')}
          >
            활동관리
          </button>
        </nav>

        {/* Right Section */}
        <div className="header-right">
          {/* Notification Bell */}
          <div className="notif-btn-wrapper">
            <button 
              className="icon-button"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              title="알림"
            >
              <Bell size={19} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {showNotifMenu && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>알림 ({unreadCount})</span>
                  <button 
                    style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
                    onClick={async () => {
                      await api.markAllNotificationsRead();
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                  >
                    모두 읽음
                  </button>
                </div>
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.88rem' }}>
                      새로운 알림이 없습니다.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => {
                          if (n.link) navigate(n.link);
                          setShowNotifMenu(false);
                        }}
                      >
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-desc">{n.message}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="notif-time">{n.createdAt}</span>
                          {!n.read && (
                            <button 
                              className="mark-read-btn"
                              style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={(e) => handleMarkRead(n.id, e)}
                            >
                              읽음으로 표시
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ padding: '10px', textAlign: 'center', background: 'var(--cream-alt)', borderTop: '1px solid var(--border-light)' }}>
                  <button 
                    style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotifMenu(false);
                    }}
                  >
                    알림 전체보기 &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="user-profile-pill" onClick={() => setShowUserModal(true)}>
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
                <span className={`user-role-badge ${user.role === 'organizer' ? 'organizer' : ''}`}>
                  {user.role === 'organizer' ? '주최자' : '봉사자'}
                </span>
                <ChevronDown size={14} color="var(--text-light)" />
              </div>
              <button 
                className="icon-button logout-btn" 
                onClick={handleLogout} 
                title="로그아웃"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setShowUserModal(true)}>
              <LogIn size={16} />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>

      {/* User Switcher Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">사용자 전환 (Mock 계정)</h3>
              <button className="icon-button" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              봉사자 또는 활동 주최자 계정으로 간편하게 전환하여 테스트할 수 있습니다.
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
                    background: user && user.id === u.id ? 'var(--primary-subtle)' : 'var(--surface)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                        {u.role === 'organizer' ? `${u.organization} (주최자)` : `${u.region} • ${u.volunteerHours}시간 봉사`}
                      </div>
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
