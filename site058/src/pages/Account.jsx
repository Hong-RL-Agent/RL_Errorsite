import React, { useState, useEffect } from 'react';
import { User, MapPin, CreditCard, ShieldCheck, Plus, CheckCircle2, Phone, Sparkles, Settings } from 'lucide-react';
import { api } from '../api/client';

export default function Account({ onNavigateTab }) {
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', recipient: '김세탁', phone: '010-3456-7890', address: '', detailAddress: '', isDefault: false });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await api.getAddresses();
        if (res?.addresses) setAddresses(res.addresses);
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    }
    loadAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createAddress(newAddr);
      if (res?.address) {
        const updated = await api.getAddresses();
        if (updated?.addresses) setAddresses(updated.addresses);
        setShowAddModal(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  return (
    <div className="max-w-screen" style={{ paddingTop: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
          마이페이지 & 세탁 설정
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          수거 주소록, 안심 결제 수단 및 맞춤 세탁 케어 옵션을 관리합니다.
        </p>
      </div>

      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>새 수거 주소가 성공적으로 저장되었습니다.</span>
        </div>
      )}

      {/* Profile Overview */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '28px', boxShadow: 'var(--shadow-sm)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{ width: '64px', height: '64px', background: '#ecfdf5', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>김세탁 고객님</h2>
              <span style={{ background: '#ecfdf5', color: '#15803d', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800 }}>
                VIP 프레시 멤버
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
              010-3456-7890 • laundry.kim@freshlaundry.kr
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>누적 세탁 의류</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>48 벌</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>보유 프레시 적립금</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>14,500 P</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>안심 배상 보증</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>100% 적용</div>
          </div>
        </div>
      </div>

      {/* Address Book & Laundry Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Address Book */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#16a34a" />
              수거 주소록 관리
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '6px 12px',
                background: '#ecfdf5',
                color: '#15803d',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} />
              <span>주소 추가</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{addr.label}</span>
                  {addr.isDefault && (
                    <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      기본 배송지
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#334155' }}>
                  {addr.address} {addr.detailAddress}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  수령인: {addr.recipient} ({addr.phone})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Laundry Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#16a34a" />
              결제 수단
            </h3>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>신한카드 (끝자리 4892)</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>FreshPay 원클릭 자동결제 등록됨</div>
              </div>
              <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                안심 결제
              </span>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="#16a34a" />
              맞춤 세탁 케어 옵션
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>세제 종류</span>
                <strong style={{ color: '#16a34a' }}>친환경 알러지케어 식물성 세제</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>와이셔츠 풀먹임</span>
                <strong style={{ color: '#0f172a' }}>기본 자연 풀먹임</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>포장 방식</span>
                <strong style={{ color: '#0f172a' }}>친환경 프레시백 + 비닐 개별포장</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
              새 수거 주소 추가
            </h3>
            <form onSubmit={handleAddAddress}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>주소 별칭</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 우리집, 본가"
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="filter-select"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>기본 주소</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 서울 강남구 테헤란로 123"
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                    className="filter-select"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>상세 주소</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 101동 1204호"
                    value={newAddr.detailAddress}
                    onChange={(e) => setNewAddr({ ...newAddr, detailAddress: e.target.value })}
                    className="filter-select"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 18px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
