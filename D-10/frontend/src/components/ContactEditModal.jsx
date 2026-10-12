import React, { useState, useEffect } from 'react';
import { X, Phone, AlertCircle } from 'lucide-react';
import { updateContact } from '../lib/api';

export default function ContactEditModal({
  registration,
  isOpen,
  onClose,
  onUpdated,
  onNotify
}) {
  const [attendeePhone, setAttendeePhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (registration) {
      setAttendeePhone(registration.attendee_phone || '');
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attendeePhone.trim()) {
      onNotify && onNotify('연락처를 입력해주세요.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await updateContact(registration.id, attendeePhone.trim());
      if (res.success) {
        onNotify && onNotify(res.message || '참석자 연락처가 수정되었습니다.', 'success');
        onUpdated && onUpdated();
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '연락처 수정 실패', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={18} color="#F97316" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
              [{registration.reg_code}] 참석자 긴급 연락처 변경
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#FFF7ED', borderLeft: '3px solid #F97316', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#C2410C', display: 'flex', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                행사 당일 입장 바코드 안내 및 긴급 공지(장소/시간 변경) 문자 수신을 위한 연락처입니다.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">휴대폰 연락처 *</label>
              <input
                type="tel"
                required
                placeholder="예: 010-1234-5678"
                className="form-input"
                value={attendeePhone}
                onChange={(e) => setAttendeePhone(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" disabled={saving} className="btn btn-orange">
              {saving ? '저장 중...' : '연락처 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
