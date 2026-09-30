import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Award, CalendarCheck, Heart, FileText, CheckCircle2 } from 'lucide-react';
import CouponCard from '../components/CouponCard';
import { getCurrentUser, setCurrentUser, fetchApi } from '../api/client';

export default function Profile({ onShowToast }) {
  const [user, setUser] = useState(getCurrentUser());
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ reservationsCount: 0, wishlistCount: 0, reviewsCount: 0 });

  useEffect(() => {
    fetchApi('/api/users')
      .then(data => setUsers(data))
      .catch(() => {});

    fetchApi('/api/coupons')
      .then(data => setCoupons(data))
      .catch(() => {});

    // Load stats
    Promise.all([
      fetchApi(`/api/reservations?userId=${user.id}`),
      fetchApi('/api/wishlist'),
      fetchApi(`/api/reviews?userId=${user.id}`)
    ])
      .then(([resList, wishList, revList]) => {
        setStats({
          reservationsCount: resList.length,
          wishlistCount: wishList.length,
          reviewsCount: revList.length
        });
      })
      .catch(() => {});
  }, [user.id]);

  const handleSwitchUser = (u) => {
    setCurrentUser(u);
    setUser(u);
    if (onShowToast) onShowToast(`접속 계정이 '${u.name}'(${u.role})으로 전환되었습니다.`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 900, margin: '0 auto', width: '100%' }}>
      {/* Profile Header Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--sky-blue-light)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-navy)' }}>{user.name}</h1>
              <span className={`badge ${user.role === 'host' ? 'badge-yellow' : (user.role === 'admin' ? 'badge-red' : 'badge-blue')}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} /> {user.email}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} /> {user.phone || '010-3491-8821'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 20,
          backgroundColor: 'var(--cream-bg)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-navy)' }}>{stats.reservationsCount}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>전체 예약</span>
          </div>
          <div style={{ width: 1, height: 36, backgroundColor: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--sky-blue)' }}>{stats.wishlistCount}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>위시리스트</span>
          </div>
          <div style={{ width: 1, height: 36, backgroundColor: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--warm-yellow)' }}>{stats.reviewsCount}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block' }}>작성 후기</span>
          </div>
        </div>
      </div>

      {/* User Switcher Section (For PPO session simulation) */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
          테스트 계정 전환 (세션 스위처)
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          다른 사용자(일반 회원, 호스트, 관리자) 계정으로 전환하여 각기 다른 권한과 예약 내역을 테스트할 수 있습니다.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {users.map(u => (
            <div
              key={u.id}
              id={`btn-switch-user-${u.id}`}
              onClick={() => handleSwitchUser(u)}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: u.id === user.id ? '2px solid var(--sky-blue)' : '1px solid var(--border-color)',
                backgroundColor: u.id === user.id ? 'var(--sky-blue-light)' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={u.avatar} alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--primary-navy)' }}>{u.name}</strong>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>{u.role}</span>
                </div>
              </div>
              {u.id === user.id && <CheckCircle2 size={18} color="var(--sky-blue)" />}
            </div>
          ))}
        </div>
      </div>

      {/* Available Coupons */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
          보유 중인 할인 쿠폰 ({coupons.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {coupons.map(coupon => (
            <CouponCard key={coupon.code} coupon={coupon} />
          ))}
        </div>
      </div>
    </div>
  );
}
