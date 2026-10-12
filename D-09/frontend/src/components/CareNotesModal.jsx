import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updatePetCareNotes } from '../lib/api';

export default function CareNotesModal({
  pet,
  isOpen,
  onClose,
  onNotesSaved,
  onNotify
}) {
  const [careNotes, setCareNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pet) {
      setCareNotes(pet.care_notes || '');
    }
  }, [pet]);

  if (!isOpen || !pet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updatePetCareNotes(pet.id, careNotes);
      if (res.success) {
        onNotify && onNotify(res.message || '돌봄 주의사항이 저장되었습니다.', 'success');
        onNotesSaved && onNotesSaved();
        onClose();
      }
    } catch (err) {
      onNotify && onNotify(err.message || '저장 실패', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{pet.avatar || '🐾'}</span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#2D3748' }}>
              [{pet.name}] 돌봄 주의사항 및 핸들링 메모
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8C9BAE' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: '#FFF0F0', borderLeft: '3px solid #FF6B6B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#C92A2A', display: 'flex', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                미용사 및 돌봄 매니저가 서비스 진행 시 반드시 확인하는 주의사항입니다. 민감한 신체 부위, 낯선 소리 반응, 특이 식습관 등을 기록해주세요.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">특별 돌봄 주의사항</label>
              <textarea
                rows={5}
                required
                className="form-textarea"
                placeholder="예: 귀 세정 시 부드럽게 진행 필요, 발 만지는 것에 민감함, 낯선 소리에 잘 놀람 등..."
                value={careNotes}
                onChange={(e) => setCareNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" disabled={saving} className="btn btn-coral">
              {saving ? '저장 중...' : '주의사항 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
