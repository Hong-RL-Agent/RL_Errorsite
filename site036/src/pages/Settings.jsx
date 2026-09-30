import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Globe, Save } from 'lucide-react';

export default function Settings({ showToast }) {
  const [workspaceName, setWorkspaceName] = useState('Global Enterprise HQ');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('설정 저장 완료', '워크스페이스 환경 설정이 안전하게 저장되었습니다.', 'success');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>워크스페이스 환경 설정</h2>
          <p className="card-subtitle">플랫폼 보안, 알림 및 도메인 설정을 구성합니다.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSaveSettings}>
          <div className="form-group">
            <label className="form-label">워크스페이스 공식 명칭</label>
            <input
              type="text"
              className="form-control"
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              required
            />
          </div>

          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '18px', margin: '20px 0' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '14px' }}>알림 및 보안</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-900)' }}>프로젝트 및 댓글 이메일 알림</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>참여 중인 프로젝트에 새 변경사항 발생 시 이메일을 전송합니다.</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-900)' }}>2단계 인증 (2FA) 강화</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>로그인 시 모바일 OTP 인증을 필수화합니다.</div>
              </div>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={e => setTwoFactor(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-200)', paddingTop: '18px' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> 설정 내용 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
