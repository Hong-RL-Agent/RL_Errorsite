import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShoppingBag, ShieldCheck, ChevronRight, User, Phone, Mail } from 'lucide-react';

export default function MyPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/mypage')
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">마이페이지</h1>
          <p className="page-desc">회원 정보 및 배송지, 주문 관리</p>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="mypage-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div className="user-avatar-badge">
            {profile?.user?.name ? profile.user.name[0] : '이'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                {profile?.user?.name || '이주이'} 님
              </h2>
              <span style={{
                background: 'rgba(67, 97, 238, 0.15)',
                color: 'var(--cobalt-primary)',
                border: '1px solid rgba(67, 97, 238, 0.3)',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700
              }}>
                {profile?.user?.tier || 'VIP Platinum'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>{profile?.user?.email || 'juyi.lee@example.com'}</span>
              <span>·</span>
              <span>{profile?.user?.phone || '010-3849-2819'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Navigation Grid */}
      <div className="mypage-menu-list">
        <Link to="/mypage/addresses" className="mypage-menu-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'var(--cobalt-light)',
              color: 'var(--cobalt-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>배송지 관리</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                등록된 배송지: {profile?.addressCount || 2}개
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </Link>

        <Link to="/order" className="mypage-menu-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(76, 201, 240, 0.12)',
              color: 'var(--cyan-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>주문서 / 결제</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                배송지 선택 및 주문 테스트
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </Link>
      </div>
    </div>
  );
}
