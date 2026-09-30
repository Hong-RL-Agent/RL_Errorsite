import React, { useState, useEffect } from 'react';
import { User, MapPin, Mail, Phone, BookOpen, Clock, Award, Save } from 'lucide-react';

export default function Profile({ onShowToast }) {
  const [user, setUser] = useState(null);
  const [addressInput, setAddressInput] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setAddressInput(data.address || '');
      })
      .catch(console.error);
  }, []);

  // SEC-373: Address Field Save
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        onShowToast({
          title: '주소지 저장 완료',
          message: '실물 교재 및 웰컴 키트 배송지 주소가 업데이트되었습니다.',
          type: 'success',
          bugId: data.bugId,
          secId: data.secId,
          reqId: data.request_id
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">프로필 설정 & 교재 배송지</h1>
          <p className="page-subtitle">수강생 정보, 학습 통계 및 실물 교재 배송지 주소를 관리합니다.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-layout grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>수강 중인 강의</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{user?.enrolledCourses || 3}개</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>누적 학습 시간</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{user?.learningHours || 42}시간</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>취득 수료증</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{user?.completedCourses || 1}개</div>
          </div>
        </div>
      </div>

      {/* Address Form Card (SEC-373) */}
      <div className="card" style={{ maxWidth: '680px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--primary)" /> 교재 배송지 및 기본 정보
        </h3>

        <form onSubmit={handleSaveAddress}>
          <div className="grid-layout grid-2" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                type="text"
                className="form-input"
                value={user?.name || ''}
                disabled
                style={{ background: '#f8fafc' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ background: '#f8fafc' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">휴대폰 번호</label>
            <input
              type="text"
              className="form-input"
              value={user?.phone || '010-3842-9912'}
              disabled
              style={{ background: '#f8fafc' }}
            />
          </div>

          {/* SEC-373: Address Field */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">실물 교재 수령 주소지 *</label>
            <input
              type="text"
              className="form-input"
              placeholder="예: 서울특별시 강남구 테헤란로 152, 14층"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            <Save size={15} /> 배송지 주소 저장
          </button>
        </form>
      </div>
    </div>
  );
}
