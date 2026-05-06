import React, { useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';

export default function RespondentForm({ onStart, data, onChange }) {
  const [showError, setShowError] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleStart = () => {
    if (!validateEmail(data.email)) {
      setShowError(true);
      return;
    }
    onStart();
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '25px' }}>응답자 정보 입력</h2>
      
      <div className="form-group">
        <label className="label">성함</label>
        <input className="input" placeholder="이름을 입력하세요" value={data.name} onChange={(e) => onChange('name', e.target.value)} />
      </div>

      {/* INTENTIONAL GUI BUG: site026-bug01
         // Type: validation-message-disconnect
         // Description: 이메일 검증 메시지를 표시하지만 input과 aria-describedby로 연결하지 않음.
      */}
      <div className="form-group" data-bug-id="site026-bug01">
        <label className="label">이메일 주소 <span style={{ color: 'var(--error)' }}>*</span></label>
        <input 
          className="input" 
          placeholder="example@email.com" 
          style={{ borderColor: showError ? 'var(--error)' : 'var(--border)' }}
          value={data.email} 
          onChange={(e) => {
            onChange('email', e.target.value);
            if (showError) setShowError(false);
          }}
        />
        {showError && (
          <div className="error-message" id="email-error-msg">
            <AlertCircle size={14} /> 올바른 이메일 형식이 아닙니다.
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
        <Info size={16} />
        수집된 정보는 설문 결과 분석용으로만 사용되며 외부에 공개되지 않습니다.
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: '30px', padding: '15px' }} onClick={handleStart}>
        설문 시작하기
      </button>
    </div>
  );
}
