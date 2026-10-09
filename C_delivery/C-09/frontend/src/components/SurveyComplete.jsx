import React from 'react';
import { CheckCircle2, BarChart3, RotateCcw } from 'lucide-react';

export default function SurveyComplete({ onGoToInsights, onRestart }) {
  return (
    <div style={{
      maxWidth: '640px',
      margin: '48px auto 0 auto',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '48px 36px',
      boxShadow: 'var(--shadow-card)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.2)',
        color: 'var(--accent-success)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)'
      }}>
        <CheckCircle2 size={44} />
      </div>

      <div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          설문 응답이 제출되었습니다
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
          귀하의 응답이 성공적으로 등록되었습니다. 수집된 의견은 서비스 개선에 소중히 활용됩니다.
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        width: '100%',
        marginTop: '12px'
      }}>
        <button
          onClick={onRestart}
          className="btn-survey-prev"
          style={{ flex: 1, padding: '14px' }}
        >
          <RotateCcw size={16} />
          <span>처음으로</span>
        </button>

        <button
          onClick={onGoToInsights}
          className="btn-survey-next"
          style={{ flex: 1.5, padding: '14px' }}
        >
          <BarChart3 size={18} />
          <span>관리자 통계 확인하기</span>
        </button>
      </div>
    </div>
  );
}
