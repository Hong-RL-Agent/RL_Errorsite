import React, { useState } from 'react';
import { CheckCircle2, ArrowLeft, Send, AlertCircle, Edit3 } from 'lucide-react';

export default function SurveyReview({ form, answers, onEdit, onSubmit, submitting, isFrozen }) {
  const [errorMsg, setErrorMsg] = useState(null);
  const [clickCount, setClickCount] = useState(0);

  const items = form?.items || [];

  const handleFinalSubmit = () => {
    if (isFrozen) return; // Freeze locks submission
    
    // Check if Q5 or any required item is missing
    const isQ5Missing = !answers['q5'] || !answers['q5'].value;
    if (isQ5Missing) {
      setErrorMsg('필수 문항을 입력해주세요.');
      setClickCount(prev => prev + 1);
      return;
    }

    onSubmit();
  };

  return (
    <div style={{
      maxWidth: '740px',
      margin: '32px auto 0 auto',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '36px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary-hover)', fontWeight: '700' }}>
          최종 검토 단계
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
          응답 내용 최종 검토
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          작성하신 응답 내용을 확인해주세요. 수정이 필요한 경우 언제든 수정할 수 있습니다.
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Answers Summary Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map(item => {
          const ans = answers[item.id];
          return (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: ans?.value ? 'var(--text-main)' : 'var(--accent-danger)' }}>
                {ans?.label || ans?.value || '(응답 미입력)'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '20px',
        marginTop: '8px'
      }}>
        <button
          type="button"
          onClick={onEdit}
          className="btn-survey-prev"
        >
          <Edit3 size={16} />
          <span>응답 수정</span>
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={submitting}
          className="btn-submit-action"
        >
          <Send size={18} />
          <span>{submitting ? '제출 중...' : '응답 제출'}</span>
        </button>
      </div>
    </div>
  );
}
