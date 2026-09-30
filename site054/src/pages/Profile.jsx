import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import LoanCard from '../components/LoanCard';
import { api } from '../api/client';

export default function Profile({ onSelectBook, onOpenReader, setActivePage }) {
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProf() {
      setLoading(true);
      try {
        const res = await api.getProfile();
        if (res && res.success) {
          setProfileData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProf();
  }, []);

  const user = profileData?.user || {
    name: '이도서',
    membershipId: 'BN-2026-0953',
    grade: '열심 독서가 (VIP)',
    maxLoanLimit: 7,
    currentLoanCount: 3,
    totalReadBooks: 28,
    favoriteCategory: '소설 & IT'
  };

  const activeLoans = profileData?.activeLoans || [];
  const returnedLoans = profileData?.returnedLoans || [];
  const wishlists = profileData?.wishlist || [];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
          내 서재 &middot; 도서관 회원정보
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          대여 통계, 회원 등급 혜택 및 나의 독서 활동을 관리하세요.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-main)' }}>
              {user.name} 님
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              회원번호: {user.membershipId} &middot; <strong style={{ color: 'var(--primary-dark)' }}>{user.grade}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', background: 'var(--bg-subtle)', padding: '16px 24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-dark)' }}>{user.totalReadBooks}권</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>누적 완독</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary-dark)' }}>{activeLoans.length}/{user.maxLoanLimit}권</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>대여 현황</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '24px' }}>
        <button
          className={`btn-secondary-lib ${activeTab === 'stats' ? 'btn-primary-lib' : ''}`}
          style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveTab('stats')}
        >
          📊 독서 통계 및 혜택
        </button>
        <button
          className={`btn-secondary-lib ${activeTab === 'loans' ? 'btn-primary-lib' : ''}`}
          style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveTab('loans')}
        >
          📖 대여 중 도서 ({activeLoans.length})
        </button>
        <button
          className={`btn-secondary-lib ${activeTab === 'history' ? 'btn-primary-lib' : ''}`}
          style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)' }}
          onClick={() => setActiveTab('history')}
        >
          ✅ 완독 히스토리 ({returnedLoans.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>
              🎯 이번 달 독서 목표
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              월간 목표: 5권 중 <strong>3권 완독 (60%)</strong>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--sage)', borderRadius: 'var(--radius-full)' }}></div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>
              💡 선호 독서 분야
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '800' }}>
              {user.favoriteCategory}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              소설 45%, IT/기술 30%, 인문 25%
            </div>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
              현재 대여 중인 도서가 없습니다.
            </div>
          ) : (
            activeLoans.map(l => (
              <LoanCard key={l.id} loan={l} onRead={onOpenReader} />
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {returnedLoans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
              지난 완독 기록이 없습니다.
            </div>
          ) : (
            returnedLoans.map(l => (
              <LoanCard key={l.id} loan={l} onRead={onOpenReader} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
