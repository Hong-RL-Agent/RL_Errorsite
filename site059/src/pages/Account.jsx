import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, Bell, Heart, Building2, Save, CheckCircle2, AlertCircle, Settings } from 'lucide-react';

export default function Account({
  favorites = [],
  hospitals = [],
  onSelectHospital,
  onToggleFavorite,
  onNavigateTab
}) {
  const [profile, setProfile] = useState({
    name: '이주이',
    phone: '010-3849-1928',
    email: 'juyi.lee@carebridge.co.kr',
    birth: '1995-06-18',
    bloodType: 'A형 (RH+)',
    allergies: '페니실린 항생제 계열 알레르기'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Default Preferences
  const [preferences, setPreferences] = useState({
    smsNotification: true,
    emailReminder: true,
    nightAlert: false,
    theme: 'light'
  });

  // INTENTIONAL FRONTEND BUG: site059-SEC-472
  // localStorage에 저장된 JSON 파싱 실패로 전체 설정 초기화가 중단되는 오류:
  // 브라우저 localStorage에 저장된 설정값('carebridge_preferences')을 읽어올 때
  // try/catch 방어 코드 없이 직접 JSON.parse()를 실행함.
  // 로컬 스토리지에 손상된 JSON(예: '{"theme":' 등)이 저장되어 있을 경우 SyntaxError가 발생하여
  // 페이지 초기화가 중단되고 마이페이지 설정 렌더링이 실패함.
  useEffect(() => {
    const rawPref = localStorage.getItem('carebridge_preferences');
    if (rawPref) {
      const parsed = JSON.parse(rawPref); // triggers SEC-472 if malformed JSON is present
      if (parsed) {
        setPreferences(parsed);
      }
    }
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem('carebridge_preferences', JSON.stringify(preferences));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const favoriteHospitals = hospitals.filter(h => favorites.includes(h.id));

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          마이페이지 & 환자 프로필
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          환자 기본 정보, 진료 알림 설정 및 즐겨찾는 병원 목록을 관리합니다.
        </p>
      </div>

      {savedSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>사용자 설정이 성공적으로 저장되었습니다.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        {/* Left: Patient Profile Card */}
        <div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem' }}>
                {profile.name[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {profile.name} 님
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>CareBridge 본인인증 완료 회원</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.88rem', background: '#f8fafc', padding: '18px', borderRadius: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>연락처</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{profile.phone}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>이메일</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{profile.email}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>생년월일 / 혈액형</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{profile.birth} ({profile.bloodType})</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>특이사항 / 알레르기</span>
                <div style={{ fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>{profile.allergies}</div>
              </div>
            </div>
          </div>

          {/* Preferences with SEC-472 */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Settings size={18} color="#0284c7" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                진료 예약 알림 및 개인화 설정
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                <span>진료 30분 전 카카오 알림톡 / SMS 수신</span>
                <input
                  type="checkbox"
                  checked={preferences.smsNotification}
                  onChange={(e) => setPreferences({ ...preferences, smsNotification: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                <span>진료 전날 일정 안내 이메일 발송</span>
                <input
                  type="checkbox"
                  checked={preferences.emailReminder}
                  onChange={(e) => setPreferences({ ...preferences, emailReminder: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                <span>야간/휴일 진료 가능 병원 알림 받기</span>
                <input
                  type="checkbox"
                  checked={preferences.nightAlert}
                  onChange={(e) => setPreferences({ ...preferences, nightAlert: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
            </div>

            <button
              onClick={handleSavePreferences}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} />
              <span>설정값 로컬 저장하기</span>
            </button>
          </div>
        </div>

        {/* Right: Favorite Hospitals */}
        <div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={18} color="#ef4444" fill="#ef4444" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  내 즐겨찾기 병원 ({favoriteHospitals.length})
                </h3>
              </div>
            </div>

            {favoriteHospitals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                <Building2 size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.9rem', marginBottom: '14px' }}>등록된 즐겨찾기 병원이 없습니다.</p>
                <button
                  onClick={() => onNavigateTab('hospitals')}
                  style={{ padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  병원 둘러보기
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {favoriteHospitals.map(h => (
                  <div
                    key={h.id}
                    onClick={() => onSelectHospital(h.id)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{h.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{h.address}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(h.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                    >
                      <Heart size={18} fill="#ef4444" color="#ef4444" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
