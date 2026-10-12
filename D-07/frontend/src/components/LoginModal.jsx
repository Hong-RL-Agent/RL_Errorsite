import React, { useState } from 'react';
import { LogIn, UserCheck } from 'lucide-react';

export default function LoginModal({ isOpen, users, onLogin }) {
  const [selectedUsername, setSelectedUsername] = useState(users[0]?.username || 'user_alex');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(selectedUsername);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
              PrefSpace 사용자 재로그인
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              환경설정 상태 영속성(STATE_REVISIT)을 검증하기 위해 로그인할 테스트 계정을 선택하세요.
            </p>

            <div className="form-group">
              <label>테스트 계정 선택</label>
              <select
                className="form-control"
                value={selectedUsername}
                onChange={e => setSelectedUsername(e.target.value)}
                data-login-user-select
              >
                {users.map(u => (
                  <option key={u.id} value={u.username}>
                    {u.name} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <UserCheck size={14} />
              <span>선택한 계정으로 로그인</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
