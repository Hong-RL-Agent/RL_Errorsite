import React from 'react';
import { RotateCcw, LogOut, UserCheck } from 'lucide-react';

export default function Header({
  currentUser,
  users,
  onSwitchUser,
  onLogout,
  onReset,
  isResetting
}) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">PS</div>
        <div className="brand-name">PrefSpace</div>
      </div>

      <div className="nav-actions">
        {/* 테스트 계정 빠른 전환 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={16} color="#2563eb" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            계정 선택:
          </span>
          <select
            className="user-switch-select"
            value={currentUser?.username || ''}
            onChange={e => onSwitchUser(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.username}>
                {u.name} ({u.username})
              </option>
            ))}
          </select>
        </div>

        {/* 로그아웃 / 재로그인 버튼 */}
        <button
          className="btn btn-secondary"
          onClick={onLogout}
          title="현재 세션을 로그아웃하고 재로그인 화면으로 이동합니다."
        >
          <LogOut size={14} />
          <span>로그아웃 / 재로그인</span>
        </button>

        {/* 시스템 데이터 초기화 버튼 */}
        <button
          className="btn btn-secondary"
          onClick={onReset}
          disabled={isResetting}
          title="SQLite DB 및 모든 설정을 초기 상태로 완전 복원합니다."
        >
          <RotateCcw size={14} className={isResetting ? 'spin' : ''} />
          <span>{isResetting ? '초기화 중...' : '시스템 데이터 초기화'}</span>
        </button>
      </div>
    </header>
  );
}
