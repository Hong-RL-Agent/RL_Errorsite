import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { updateAttendee } from '../lib/api';

export default function AttendeeEditModal({
  registration,
  isOpen,
  onClose,
  onUpdated,
  onNotify
}) {
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeOrg, setAttendeeOrg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (registration) {
      setAttendeeName(registration.attendee_name || '');
      setAttendeeEmail(registration.attendee_email || '');
      setAttendeeOrg(registration.attendee_org || '');
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateAttendee(registration.id, {
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
        attendeeOrg: attendeeOrg.trim()
      });

      if (res.success) {
        onNotify && onNotify(res.message || '참석자 정보가 수정되었습니다.', 'success');
        onUpdated && onUpdated();
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '수정 실패', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#7C3AED" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
              [{registration.reg_code}] 참석자 정보 수정
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
            <div className="form-group">
              <label className="form-label">참석자 성명 *</label>
              <input
                type="text"
                required
                className="form-input"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">참석자 이메일</label>
              <input
                type="email"
                className="form-input"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">소속 기업 / 단체</label>
              <input
                type="text"
                className="form-input"
                value={attendeeOrg}
                onChange={(e) => setAttendeeOrg(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
