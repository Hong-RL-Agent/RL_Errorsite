import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Theater } from 'lucide-react';

export default function Register({ setCurrentPage, setCurrentUser, showToast }) {
  const [name, setName] = useState('김민지');
  const [email, setEmail] = useState('minji@example.com');
  const [password, setPassword] = useState('demo-password');
  const [loading, setLoading] = useState(false);

  // Register handler (SEC-342 / site037-bug02)
  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    const idempotency_key = `REGISTER-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.user) {
        setCurrentUser(data.user);
        showToast('회원가입 완료', `환영합니다, ${data.user.name} 님! 3,000P가 적립되었습니다.`, 'success', data.transaction_id, data.bugId, data.secId);
        setCurrentPage('home');
      }
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div style={{ maxWidth: '460px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto' }}>
            <Theater size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>StageOn 회원가입</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--gray-500)', marginTop: '4px' }}>
            공연장 통합 멤버십 가입 시 웰컴 쿠폰 혜택 증정
          </p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">이름 (실명)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="예: 김민지"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">이메일 계정</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="minji@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="영문, 숫자 포함 8자리 이상"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            <UserPlus size={16} /> {loading ? '가입 처리 중...' : '회원가입 완료'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.86rem', color: 'var(--gray-500)' }}>
          이미 계정이 있으신가요?{' '}
          <button 
            onClick={() => setCurrentPage('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
