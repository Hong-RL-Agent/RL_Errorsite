import React, { useState } from 'react';
import { LogIn, Lock, Mail, Theater } from 'lucide-react';

export default function Login({ setCurrentPage, setCurrentUser, showToast }) {
  const [email, setEmail] = useState('minji@example.com');
  const [password, setPassword] = useState('demo-password');
  const [loading, setLoading] = useState(false);

  // Login handler (SEC-341 / site037-bug01)
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    const idempotency_key = `LOGIN-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        showToast('로그인 성공', `${data.user.name} 님 환영합니다!`, 'success', data.transaction_id, data.bugId, data.secId);
        setCurrentPage('home');
      }
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto' }}>
            <Theater size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>StageOn 로그인</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--gray-500)', marginTop: '4px' }}>
            문화·공연 예매와 멤버십 혜택을 이용하세요.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">이메일 계정</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="visitor@example.com"
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
                placeholder="비밀번호를 입력하세요"
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
            <LogIn size={16} /> {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.86rem', color: 'var(--gray-500)' }}>
          아직 회원이 아니신가요?{' '}
          <button 
            onClick={() => setCurrentPage('register')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
