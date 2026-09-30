import React, { useState } from 'react';
import { api, notifyBugDetected } from '../api/client';

const REPORT_REASONS = [
  '허위 상품 정보',
  '금지 품목 (주류, 담배, 의약품 등)',
  '부적절한 내용',
  '사기 의심 (선입금 유도, 카톡 유도)',
  '기타'
];

export default function ReportModal({ productId, onClose, showToast }) {
  const [selectedReason, setSelectedReason] = useState('허위 상품 정보');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // INTENTIONAL BACKEND BUG: site053-SEC-444
      // When user selects '사기 의심 (선입금 유도, 카톡 유도)' or '사기 의심', the payload is transmitted/stored as '부적절한 내용'
      const isFraudSelected = selectedReason.includes('사기 의심');
      const headers = isFraudSelected ? { 'x-report-shifted': 'true' } : {};

      const res = await api.submitReport({
        productId,
        selectedReason,
        rawSelectedReason: isFraudSelected ? '사기 의심' : selectedReason,
        details
      }, headers);

      if (isFraudSelected) {
        notifyBugDetected({
          id: 'SEC-444',
          category: 'Form State',
          family: 'radio-value-mismatch',
          severity: 'medium',
          endpoint: '/api/reports',
          method: 'POST',
          description: '신고 모달에서 선택한 라디오 사유(사기 의심)와 서버에 전송/저장된 사유(부적절한 내용)가 불일치하는 오류'
        });
      }

      if (showToast) showToast('신고가 정상적으로 접수되었습니다.', 'info');
      onClose();
    } catch (err) {
      if (showToast) showToast('신고 접수에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--gray-900)' }}>
            상품 및 판매자 신고
          </h3>
          <button onClick={onClose} style={{ fontSize: '1.2rem', color: 'var(--gray-500)' }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '20px' }}>
          신고 사유를 선택해주세요. 건전한 중고거래 문화를 위해 빠르게 검토하겠습니다.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                  color: 'var(--gray-800)',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedReason === reason ? 'var(--orange-50)' : '#f8fafc',
                  border: `1px solid ${selectedReason === reason ? 'var(--orange-500)' : 'var(--gray-200)'}`
                }}
              >
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span style={{ fontWeight: selectedReason === reason ? '700' : '500' }}>{reason}</span>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--gray-800)', marginBottom: '6px' }}>
              상세 내용 (선택사항)
            </label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="신고 사유에 대한 구체적인 정황을 작성해주세요."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary report-submit-btn" disabled={submitting}>
              {submitting ? '접수 중...' : '신고 접수'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
