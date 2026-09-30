import React, { useState } from 'react';
import { Sliders, Bell, Globe, Shield, Moon, Check } from 'lucide-react';

export default function Settings({ onShowToast }) {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [currency, setCurrency] = useState('KRW');
  const [language, setLanguage] = useState('ko');

  const handleSave = (e) => {
    e.preventDefault();
    if (onShowToast) onShowToast('환경 설정이 성공적으로 저장되었습니다.', 'success');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
          서비스 환경 설정
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          알림 수신 채널, 표시 통화, 언어 및 개인정보 설정을 관리합니다.
        </p>
      </div>

      <form onSubmit={handleSave} style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* Notifications */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="var(--sky-blue)" /> 알림 설정
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--primary-navy)' }}>이메일 알림 수신</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>예약 확정 및 취소 내역을 이메일로 수신합니다.</p>
              </div>
              <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--sky-blue)' }} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 0' }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--primary-navy)' }}>SMS / 카카오 알림톡</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>체험 1일 전 집결 장소 및 시간 안내 메시지를 수신합니다.</p>
              </div>
              <input type="checkbox" checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--sky-blue)' }} />
            </label>
          </div>
        </div>

        {/* Region and Currency */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} color="var(--sky-blue)" /> 언어 및 표시 통화
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">기본 언어</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="form-select">
                <option value="ko">한국어 (Korean)</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">통화 단위</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-select">
                <option value="KRW">KRW (₩, 대한민국 원)</option>
                <option value="USD">USD ($, 미국 달러)</option>
                <option value="EUR">EUR (€, 유로)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
          <button id="btn-save-settings" type="submit" className="btn btn-primary">
            설정 저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
