import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  CalendarCheck, 
  Heart, 
  MessageSquare, 
  Bell, 
  User, 
  Search, 
  Layers, 
  ChevronDown,
  Sparkles,
  Sliders
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, fetchApi } from '../api/client';

export default function Navbar({ activePage, setActivePage, onSearchKeyword }) {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [users, setUsers] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApi('/api/users')
      .then(data => setUsers(data))
      .catch(() => {});

    fetchApi('/api/notifications')
      .then(data => {
        const unread = data.filter(n => !n.read).length;
        setUnreadCount(unread);
      })
      .catch(() => {});

    const handleUserChange = (e) => {
      setUser(e.detail);
    };

    window.addEventListener('tripnest-user-changed', handleUserChange);
    return () => window.removeEventListener('tripnest-user-changed', handleUserChange);
  }, []);

  const handleSelectUser = (u) => {
    setCurrentUser(u);
    setUser(u);
    setShowUserMenu(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchKeyword) {
      onSearchKeyword(searchQuery);
      setActivePage('explore');
    }
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 20px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        {/* Logo */}
        <div 
          onClick={() => setActivePage('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            userSelect: 'none'
          }}
          id="nav-logo"
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.5px' }}>TripNest</span>
            <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--sky-blue)', letterSpacing: '0.5px' }}>EXPERIENCE & EVENT</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: 420, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            id="nav-search-input"
            type="text"
            placeholder="어떤 특별한 체험을 찾으시나요? (예: 서핑, 도자기, 야경투어)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: 9999,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--cream-bg)',
              fontSize: 13,
              transition: 'all 0.2s ease'
            }}
          />
        </form>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button 
            id="nav-btn-explore"
            onClick={() => setActivePage('explore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: activePage === 'explore' ? 'var(--sky-blue)' : 'var(--text-main)',
              backgroundColor: activePage === 'explore' ? 'var(--sky-blue-light)' : 'transparent'
            }}
          >
            <Compass size={18} />
            <span>체험 탐색</span>
          </button>

          <button 
            id="nav-btn-reservations"
            onClick={() => setActivePage('reservations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: activePage === 'reservations' ? 'var(--sky-blue)' : 'var(--text-main)',
              backgroundColor: activePage === 'reservations' ? 'var(--sky-blue-light)' : 'transparent'
            }}
          >
            <CalendarCheck size={18} />
            <span>내 예약</span>
          </button>

          <button 
            id="nav-btn-wishlist"
            onClick={() => setActivePage('wishlist')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: activePage === 'wishlist' ? 'var(--sky-blue)' : 'var(--text-main)',
              backgroundColor: activePage === 'wishlist' ? 'var(--sky-blue-light)' : 'transparent'
            }}
          >
            <Heart size={18} />
            <span>위시리스트</span>
          </button>

          <button 
            id="nav-btn-messages"
            onClick={() => setActivePage('messages')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              color: activePage === 'messages' ? 'var(--sky-blue)' : 'var(--text-muted)'
            }}
            title="메시지"
          >
            <MessageSquare size={19} />
          </button>

          <button 
            id="nav-btn-notifications"
            onClick={() => setActivePage('notifications')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              color: activePage === 'notifications' ? 'var(--sky-blue)' : 'var(--text-muted)'
            }}
            title="알림"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                backgroundColor: 'var(--danger)',
                borderRadius: '50%'
              }} />
            )}
          </button>

          <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

          {/* Host Mode Button */}
          <button 
            id="nav-btn-host"
            onClick={() => setActivePage('host')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: activePage === 'host' ? '#fff' : 'var(--primary-navy)',
              backgroundColor: activePage === 'host' ? 'var(--primary-navy)' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Layers size={16} />
            <span>호스트 모드</span>
          </button>

          {/* User Profile & Switcher */}
          <div style={{ position: 'relative' }}>
            <div 
              id="user-profile-toggle"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px 4px 4px',
                borderRadius: 9999,
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                backgroundColor: '#ffffff'
              }}
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 44,
                width: 240,
                backgroundColor: '#ffffff',
                borderRadius: 12,
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                padding: '8px 0',
                zIndex: 200
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-light)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>현재 접속 계정 (세션 전환)</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-navy)' }}>{currentUser.name} ({currentUser.role})</p>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <button 
                    onClick={() => { setActivePage('profile'); setShowUserMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <User size={15} /> 프로필 관리
                  </button>
                  <button 
                    onClick={() => { setActivePage('settings'); setShowUserMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Sliders size={15} /> 계정 설정
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', padding: '6px 16px 2px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>테스트 사용자 전환</p>
                  {users.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: u.id === currentUser.id ? 'var(--sky-blue-light)' : 'transparent',
                        color: u.id === currentUser.id ? 'var(--sky-blue)' : 'var(--text-main)'
                      }}
                    >
                      <span>{u.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
