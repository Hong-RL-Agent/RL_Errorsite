import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

export default function Register({ onRegisterSuccess, onNavigate, onShowToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  // SEC-372: Registration Form Submission
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        onRegisterSuccess(data.user);
        onShowToast({
          title: '신규 회원가입 완료',
          message: `[${data.user?.name}]님의 계정이 생성되었습니다. 환영합니다!`,
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
        onNavigate('courses');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            신규 수강생 회원가입
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ClassBridge와 함께 커리어 성장을 시작하세요.</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">이름 *</label>
            <input
              type="text"
              className="form-input"
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">이메일 계정 *</label>
            <input
              type="email"
              className="form-input"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">휴대폰 번호</label>
            <input
              type="tel"
              className="form-input"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">교재 수령 주소지</label>
            <input
              type="text"
              className="form-input"
              placeholder="서울특별시 강남구 테헤란로 152"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">비밀번호 *</label>
            <input
              type="password"
              className="form-input"
              placeholder="8자 이상 영문, 숫자 조합"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: '44px', fontSize: '15px', marginBottom: '16px' }}
          >
            회원가입 완료하기
          </button>

          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
