import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, MapPin } from 'lucide-react';

export function NewAddressPage({ onAddAddress }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    label: '학교',
    recipient_name: '이주이',
    phone: '010-3849-2819',
    postal_code: '16500',
    address_line1: '경기도 수원시',
    address_line2: '팔달구 테스트로 50',
    is_default: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddAddress(formData);
    navigate('/mypage/addresses');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">새 배송지 추가</h1>
          <p className="page-desc">새로운 배송지 정보를 입력하세요.</p>
        </div>
        <Link to="/mypage/addresses" className="icon-btn" style={{ width: 'auto', padding: '0 12px', gap: 6 }}>
          <ArrowLeft size={14} />
          <span>목록으로</span>
        </Link>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">배송지 이름 (별칭)</label>
            <input
              type="text"
              className="form-input"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">받는 분 성함</label>
            <input
              type="text"
              className="form-input"
              value={formData.recipient_name}
              onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">연락처</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">우편번호</label>
            <input
              type="text"
              className="form-input"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">기본 주소</label>
            <input
              type="text"
              className="form-input"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">상세 주소</label>
            <input
              type="text"
              className="form-input"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary-action" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            <Check size={16} />
            <span>배송지 등록 완료</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function EditAddressPage({ addresses, onEditAddress }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const addressId = parseInt(id);

  const targetAddr = addresses.find((a) => a.id === addressId);

  const [formData, setFormData] = useState({
    label: '',
    recipient_name: '',
    phone: '',
    postal_code: '',
    address_line1: '',
    address_line2: ''
  });

  useEffect(() => {
    if (targetAddr) {
      setFormData({
        label: targetAddr.label,
        recipient_name: targetAddr.recipient_name,
        phone: targetAddr.phone,
        postal_code: targetAddr.postal_code,
        address_line1: targetAddr.address_line1,
        address_line2: targetAddr.address_line2
      });
    }
  }, [targetAddr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onEditAddress(addressId, formData);
    navigate('/mypage/addresses');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">배송지 수정</h1>
          <p className="page-desc">기존 배송지 정보를 변경합니다.</p>
        </div>
        <Link to="/mypage/addresses" className="icon-btn" style={{ width: 'auto', padding: '0 12px', gap: 6 }}>
          <ArrowLeft size={14} />
          <span>목록으로</span>
        </Link>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">배송지 이름</label>
            <input
              type="text"
              className="form-input"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">상세 주소 (수정 테스트 대상)</label>
            <input
              type="text"
              className="form-input"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary-action" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            <Check size={16} />
            <span>수정사항 저장</span>
          </button>
        </form>
      </div>
    </div>
  );
}
