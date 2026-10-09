import React from 'react';
import { HelpCircle, BarChart3, FileText, RefreshCw, CheckCircle } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, progressPercent, onReset, resetLoading }) {
  return (
    <header style={{
      background: 'rgba(16, 20, 39, 0.85)',
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
        height: '70px'
      }}>
        {/* Logo */}
        <div
          onClick={() => setCurrentView('intro')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-primary), #3730a3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            PF
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                PulseForm
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                background: 'rgba(99, 102, 241, 0.2)',
                color: 'var(--accent-primary-hover)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                UNSEEN TEST
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              차세대 설문 & 리서치 플랫폼
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setCurrentView('intro')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: currentView === 'intro' || currentView === 'runner' ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
              background: currentView === 'intro' || currentView === 'runner' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              border: currentView === 'intro' || currentView === 'runner' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} />
            설문 참여
          </button>

          <button
            onClick={() => setCurrentView('insights')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: currentView === 'insights' ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
              background: currentView === 'insights' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              border: currentView === 'insights' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart3 size={16} />
            통계 대시보드
          </button>
        </nav>

        {/* System Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onReset}
            disabled={resetLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: '600'
            }}
            title="초기 상태로 리셋 (POST /v1/test/reset)"
          >
            <RefreshCw size={13} className={resetLoading ? 'animate-spin' : ''} />
            {resetLoading ? '리셋 중...' : '시스템 초기화'}
          </button>
        </div>
      </div>

      {/* Progress Bar (Visible during survey running) */}
      {currentView === 'runner' && (
        <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.05)' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)'
          }} />
        </div>
      )}
    </header>
  );
}
