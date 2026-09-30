import React, { useState, useEffect } from 'react';
import { User, MapPin, Award, Phone, Mail, Save, CheckCircle2 } from 'lucide-react';

export default function MyPage({ currentUser, setCurrentUser, showToast }) {
  const [address, setAddress] = useState(currentUser?.address || '서울특별시 마포구 월드컵북로 10');
  const [detailAddress, setDetailAddress] = useState(currentUser?.detailAddress || '101호');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setAddress(currentUser.address || '');
      setDetailAddress(currentUser.detailAddress || '');
    }
  }, [currentUser]);

  // Save address handler (SEC-343 / site037-bug03)
  const handleSaveAddress = (e) => {
    e.preventDefault();
    setSaving(true);
    const idempotency_key = `ADDRESS-${Date.now()}-${Math.floor(Math.random()*1000)}`;

    fetch('/api/profile/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        detailAddress,
        idempotency_key
      })
    })
    .then(res => res.json())
    .then(data => {
      setSaving(false);
      if (data.profile) {
        setCurrentUser(data.profile);
        showToast('주소 저장 완료', '티켓 수령 기본 배송지 주소가 안전하게 저장되었습니다.', 'success', data.transaction_id, data.bugId, data.secId);
      }
    })
    .catch(err => {
      console.error(err);
      setSaving(false);
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <img 
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
            alt="Avatar"
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} 
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>{currentUser?.name}</h2>
              <span className="badge badge-classic">{currentUser?.role || 'VIP Member'}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.88rem', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {currentUser?.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {currentUser?.phone}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)', fontWeight: 700 }}>
                <Award size={14} /> {currentUser?.membershipPoints?.toLocaleString() || 12500} P
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Management Card (SEC-343) */}
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-900)' }}>티켓 수령 및 우편 주소 관리</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--gray-500)' }}>종이 티켓 및 프로그램북 사전 배송을 위한 기본 수령지입니다.</p>
        </div>

        <form onSubmit={handleSaveAddress}>
          <div className="form-group">
            <label className="form-label">기본 주소 (도로명)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="예: 서울특별시 마포구 월드컵북로 10"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
              <MapPin size={16} color="#7e22ce" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">상세 주소 (동/호수/건물명)</label>
            <input
              type="text"
              className="form-control"
              placeholder="예: 101동 1204호"
              value={detailAddress}
              onChange={e => setDetailAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? '저장 중...' : '주소 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
