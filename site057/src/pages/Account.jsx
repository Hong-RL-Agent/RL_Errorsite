import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Leaf, MapPin, Award, CheckCircle2, Phone, Mail, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../api/client';

export default function Account({ onNavigateTab }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        const data = await api.getAccount();
        if (data && data.account) {
          setAccount(data.account);
          setFormData({
            name: data.account.name,
            phone: data.account.phone,
            email: data.account.email
          });
        }
      } catch (err) {
        console.error('Failed to load account:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, []);

  const handleToggleAutoPay = async () => {
    if (!account) return;
    try {
      const res = await api.updateAccount({ autoPayment: !account.autoPayment });
      if (res && res.account) {
        setAccount(res.account);
      }
    } catch (err) {
      console.error('Failed to update auto payment:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateAccount(formData);
      if (res && res.account) {
        setAccount(res.account);
        setEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-screen" style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
        <p>계정 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          내 계정 & 라이더 프로필
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          멤버십 등급, 결제 수단, 에코 리워드 및 안전 인증 내역을 관리합니다.
        </p>
      </div>

      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>프로필 정보가 성공적으로 변경되었습니다.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px', boxShadow: 'var(--shadow-sm)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', background: '#ecfccb', color: '#65a30d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>{account.name}</h2>
                <span style={{ background: '#f7fee7', color: '#4d7c0f', border: '1px solid #bef264', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800 }}>
                  {account.membership}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
                {account.email} • {account.phone}
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            style={{
              padding: '8px 18px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {editing ? '취소' : '정보 수정'}
          </button>
        </div>

        {/* Edit Form */}
        {editing ? (
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '12px', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>성명</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="filter-select"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>휴대폰</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="filter-select"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>이메일</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="filter-select"
                style={{ width: '100%' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#65a30d',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer',
                height: '42px'
              }}
            >
              저장
            </button>
          </form>
        ) : null}

        {/* 4 Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>보유 크레딧</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#65a30d', marginTop: '4px' }}>
              {account.creditBalance.toLocaleString()} P
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>총 라이딩 횟수</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {account.totalRides} 회
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>누적 이동 거리</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
              {account.totalDistanceKm} km
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CO₂ 탄소 절감량</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
              {account.carbonSavedKg} kg
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#65a30d" />
            등록 결제 수단
          </h3>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{account.paymentCard}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>기본 자동 결제 카드</div>
            </div>
            <span style={{ fontSize: '0.8rem', background: '#ecfccb', color: '#3f6212', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
              기본 결제
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>하차 시 자동 결제 활성화</span>
            <button
              onClick={handleToggleAutoPay}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {account.autoPayment ? (
                <ToggleRight size={32} color="#65a30d" />
              ) : (
                <ToggleLeft size={32} color="#94a3b8" />
              )}
            </button>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="#65a30d" />
            안전 주행 인증 상태
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>운전면허증 인증</span>
              <strong style={{ color: '#15803d' }}>2종 보통 유효 (인증 완료)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>헬멧 착용 서약</span>
              <strong style={{ color: '#15803d' }}>완료 (안전 캠페인 동의)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>주행 속도 제한</span>
              <strong style={{ color: '#0f172a' }}>최고 25km/h 법정 준수</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
