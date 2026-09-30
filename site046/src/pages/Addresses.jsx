import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchApi } from '../api/client';
import { showToast } from '../components/Toast';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    receiver: '',
    phone: '',
    zipcode: '',
    address: '',
    detailAddress: '',
    region: '서울'
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/addresses');
      setAddresses(data.addresses || []);
    } catch (err) {
      showToast('오류', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      showToast('배송지 등록', '새로운 배송지가 성공적으로 등록되었습니다.', 'success');
      setShowAddModal(false);
      setForm({ name: '', receiver: '', phone: '', zipcode: '', address: '', detailAddress: '', region: '서울' });
      loadAddresses();
    } catch (err) {
      showToast('오류', err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('해당 배송지를 삭제하시겠습니까?')) return;
    try {
      await fetchApi(`/api/addresses/${id}`, { method: 'DELETE' });
      showToast('삭제 완료', '배송지가 삭제되었습니다.', 'info');
      loadAddresses();
    } catch (err) {
      showToast('오류', err.message, 'error');
    }
  };

  return (
    <div className="main-wrapper">
      <div className="section-header">
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>배송지 관리</h1>
        <button
          className="primary-btn"
          style={{ width: 'auto', padding: '10px 18px' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          <span>새 배송지 추가</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {addresses.map((addr) => (
          <div key={addr.id} className="card-box" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px' }}>{addr.name}</span>
                  {addr.isDefault && (
                    <span style={{ fontSize: '11px', background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      기본배송지
                    </span>
                  )}
                </div>
                <span className={addr.isDeliverable ? 'badge-deliverable' : 'badge-undeliverable'} style={{ display: 'inline-block', marginTop: '6px' }}>
                  {addr.deliveryType || (addr.isDeliverable ? '새벽/당일배송 가능' : '배송불가 권역')}
                </span>
              </div>

              {!addr.isDefault && (
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  style={{ color: '#94a3b8', padding: '4px' }}
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div style={{ fontSize: '14px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
              {addr.address} {addr.detailAddress}
            </div>

            <div style={{ fontSize: '12.5px', color: '#64748b' }}>
              수령인: {addr.receiver} · {addr.phone}
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>새 배송지 등록</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleAddAddress}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>배송지 별칭</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 집, 회사, 본가"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>수령인</label>
                    <input
                      type="text"
                      required
                      placeholder="받으실 분"
                      value={form.receiver}
                      onChange={(e) => setForm({ ...form, receiver: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>연락처</label>
                    <input
                      type="text"
                      required
                      placeholder="010-0000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>지역(권역)</label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="서울">서울 전지역 (배송가능)</option>
                    <option value="수원">수원/경기남부 (배송가능)</option>
                    <option value="용인">용인/성남/화성 (배송가능)</option>
                    <option value="제주 (배송불가지역)">제주도 (새벽배송 불가)</option>
                    <option value="강원 산간 (배송불가지역)">강원 산간 도서 (새벽배송 불가)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>기본 주소</label>
                  <input
                    type="text"
                    required
                    placeholder="도로명 주소 입력"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>상세 주소</label>
                  <input
                    type="text"
                    placeholder="동/호수, 층수 입력"
                    value={form.detailAddress}
                    onChange={(e) => setForm({ ...form, detailAddress: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{ width: 'auto', padding: '10px 20px' }}
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
