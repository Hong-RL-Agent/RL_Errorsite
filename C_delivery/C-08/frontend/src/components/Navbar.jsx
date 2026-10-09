import React from 'react';
import { Calendar, LayoutGrid, BookmarkCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, onReset, resetLoading }) {
  return (
    <header style={{
      background: 'rgba(20, 30, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        {/* Logo */}
        <div 
          onClick={() => setCurrentTab('spaces')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--brand-primary), #3b5a50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0c1210',
            fontWeight: '800',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(132, 169, 140, 0.3)'
          }}>
            SM
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                StayMeet
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                background: 'rgba(132, 169, 140, 0.2)',
                color: 'var(--brand-primary)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(132, 169, 140, 0.3)'
              }}>
                VALIDATION
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              스마트 공간 & 숙소 통합 예약 관리
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentTab('timeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: currentTab === 'timeline' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              background: currentTab === 'timeline' ? 'rgba(132, 169, 140, 0.15)' : 'transparent',
              border: currentTab === 'timeline' ? '1px solid rgba(132, 169, 140, 0.3)' : '1px solid transparent'
            }}
          >
            <Calendar size={18} />
            이번 주 일정
          </button>

          <button
            onClick={() => setCurrentTab('spaces')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: currentTab === 'spaces' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              background: currentTab === 'spaces' ? 'rgba(132, 169, 140, 0.15)' : 'transparent',
              border: currentTab === 'spaces' ? '1px solid rgba(132, 169, 140, 0.3)' : '1px solid transparent'
            }}
          >
            <LayoutGrid size={18} />
            공간 둘러보기
          </button>

          <button
            onClick={() => setCurrentTab('reservations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: currentTab === 'reservations' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              background: currentTab === 'reservations' ? 'rgba(132, 169, 140, 0.15)' : 'transparent',
              border: currentTab === 'reservations' ? '1px solid rgba(132, 169, 140, 0.3)' : '1px solid transparent'
            }}
          >
            <BookmarkCheck size={18} />
            내 예약
          </button>
        </nav>

        {/* Reset Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onReset}
            disabled={resetLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
            title="초기 데이터로 상태 리셋 (POST /api/test/reset)"
          >
            <RefreshCw size={14} className={resetLoading ? 'animate-spin' : ''} />
            {resetLoading ? '초기화 중...' : '시스템 리셋'}
          </button>
        </div>
      </div>
    </header>
  );
}
