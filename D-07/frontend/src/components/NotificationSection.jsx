import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { updatePreferences } from '../lib/api';

export default function NotificationSection({ user, preferences, onPreferencesUpdated, onShowToast }) {
  const [emailMarketing, setEmailMarketing] = useState(Boolean(preferences?.email_marketing));
  const [emailSecurity, setEmailSecurity] = useState(Boolean(preferences?.email_security));
  const [pushDesktop, setPushDesktop] = useState(Boolean(preferences?.push_desktop));
  const [pushSound, setPushSound] = useState(Boolean(preferences?.push_sound));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setEmailMarketing(Boolean(preferences.email_marketing));
      setEmailSecurity(Boolean(preferences.email_security));
      setPushDesktop(Boolean(preferences.push_desktop));
      setPushSound(Boolean(preferences.push_sound));
    }
  }, [preferences]);

  async function handleSave() {
    try {
      setSaving(true);
      const res = await updatePreferences(user.id, {
        email_marketing: emailMarketing,
        email_security: emailSecurity,
        push_desktop: pushDesktop,
        push_sound: pushSound
      });
      if (res.success) {
        onShowToast('알림 환경설정이 성공적으로 저장되었습니다.');
        onPreferencesUpdated(res.data);
      }
    } catch (err) {
      console.error(err);
      onShowToast('알림 설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-card">
      <div className="section-header">
        <h3 className="section-title">이메일 및 푸시 알림 환경설정</h3>
        <p className="section-desc">서비스 업데이트, 마케팅 프로모션 및 데스크톱 푸시 알림 수신 여부를 개별 제어합니다.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 마케팅 이메일 알림 (BUG-D07-03 타깃) */}
        <div className="toggle-item">
          <div className="toggle-label-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="var(--primary)" />
              <h4>마케팅 및 프로모션 이메일 알림</h4>
            </div>
            <p>신규 기능 릴리즈 소식, 이벤트 및 할인 혜택 이메일 수신 여부를 결정합니다.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={emailMarketing}
              onChange={e => setEmailMarketing(e.target.checked)}
              data-switch="email-marketing"
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* 보안 및 계정 알림 */}
        <div className="toggle-item">
          <div className="toggle-label-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="var(--primary)" />
              <h4>계정 보안 및 로그인 알림 (필수 권장)</h4>
            </div>
            <p>새로운 기기 로그인 및 비밀번호 변경 등 보안 관련 중요 알림을 발송합니다.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={emailSecurity}
              onChange={e => setEmailSecurity(e.target.checked)}
              data-switch="email-security"
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* 데스크톱 푸시 알림 */}
        <div className="toggle-item">
          <div className="toggle-label-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={16} color="var(--primary)" />
              <h4>데스크톱 브라우저 푸시 알림</h4>
            </div>
            <p>작업 완료 및 멘션 호출 시 브라우저 우측 하단 푸시 알림 팝업을 표시합니다.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={pushDesktop}
              onChange={e => setPushDesktop(e.target.checked)}
              data-switch="push-desktop"
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* 알림 효과음 */}
        <div className="toggle-item">
          <div className="toggle-label-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} color="var(--primary)" />
              <h4>알림 수신 효과음 (사운드 알림)</h4>
            </div>
            <p>새로운 메시지 또는 알림이 도착했을 때 짧은 비프음을 재생합니다.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={pushSound}
              onChange={e => setPushSound(e.target.checked)}
              data-switch="push-sound"
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={14} />
          <span>{saving ? '저장 중...' : '알림 설정 저장'}</span>
        </button>
      </div>
    </div>
  );
}
