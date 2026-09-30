import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  CalendarCheck, 
  MessageSquare, 
  User, 
  ChevronDown, 
  Layers, 
  Sparkles,
  Award
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, fetchApi } from '../api/client';

export default function Header({ activePage, setActivePage, onSearchKeyword }) {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [users, setUsers] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApi('/api/users')
      .then(data => setUsers(data))
      .catch(() => {});

    const handleUserChange = (e) => {
      setUser(e.detail);
    };

    window.addEventListener('classmate-user-changed', handleUserChange);
    return () => window.removeEventListener('classmate-user-changed', handleUserChange);
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
      setActivePage('search');
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
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.5px' }}>ClassMate</span>
            <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--soft-blue)', letterSpacing: '0.5px' }}>WORKSHOP & COMMUNITY</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: 420, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            id="nav-search-input"
            type="text"
            placeholder="어떤 원데이 클래스를 찾으시나요? (예: 도예, 베이킹, 사진)"
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
            id="nav-btn-search"
            onClick={() => setActivePage('search')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: activePage === 'search' ? 'var(--soft-blue)' : 'var(--text-main)',
              backgroundColor: activePage === 'search' ? 'var(--soft-blue-light)' : 'transparent'
            }}
          >
            <Search size={17} />
            <span>클래스 찾기</span>
          </button>

          <button 
            id="nav-btn-my-classes"
            onClick={() => setActivePage('my-classes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: activePage === 'my-classes' ? 'var(--soft-blue)' : 'var(--text-main)',
              backgroundColor: activePage === 'my-classes' ? 'var(--soft-blue-light)' : 'transparent'
            }}
          >
            <CalendarCheck size={17} />
            <span>내 클래스</span>
          </button>

          <button 
            id="nav-btn-community"
            onClick={() => setActivePage('community')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: activePage === 'community' ? 'var(--soft-blue)' : 'var(--text-main)',
              backgroundColor: activePage === 'community' ? 'var(--soft-blue-light)' : 'transparent'
            }}
          >
            <MessageSquare size={17} />
            <span>커뮤니티</span>
          </button>

          <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

          {/* Instructor Center Button */}
          <button 
            id="nav-btn-instructor"
            onClick={() => setActivePage('instructor')}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: activePage === 'instructor' ? '#fff' : 'var(--primary-navy)',
              backgroundColor: activePage === 'instructor' ? 'var(--primary-navy)' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Layers size={16} />
            <span>강사센터</span>
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
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>현재 접속 계정</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-navy)' }}>{currentUser.name} ({currentUser.role === 'instructor' ? '강사' : '일반 회원'})</p>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <button 
                    onClick={() => { setActivePage('profile'); setShowUserMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <User size={15} /> 마이페이지
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', padding: '6px 16px 2px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>테스트 계정 전환</p>
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
                        backgroundColor: u.id === currentUser.id ? 'var(--soft-blue-light)' : 'transparent',
                        color: u.id === currentUser.id ? 'var(--soft-blue)' : 'var(--text-main)'
                      }}
                    >
                      <span>{u.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.role === 'instructor' ? '강사' : '수강생'}</span>
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
