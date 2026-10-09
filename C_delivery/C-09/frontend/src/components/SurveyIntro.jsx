import React from 'react';
import { Sparkles, Clock, CheckSquare, ArrowRight, Shield } from 'lucide-react';

export default function SurveyIntro({ form, onStartSurvey, loading }) {
  return (
    <div style={{
      maxWidth: '720px',
      margin: '40px auto 0 auto',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '40px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Badge Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary-hover)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: '700',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <Sparkles size={14} /> 정기 사용자 경험 리서치
        </span>
      </div>

      {/* Main Title & Description */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '12px' }}>
          {form?.title || '2026 서비스 이용 경험 조사'}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          {form?.description || '사용자 중심의 서비스 개선을 위한 심층 리서치 설문조사입니다. 귀하의 소중한 의견을 들려주세요.'}
        </p>
      </div>

      {/* Info Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '20px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckSquare size={20} color="var(--accent-primary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>문항 구성</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>총 5문항</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="var(--accent-secondary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>예상 소요시간</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>약 2~3분</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} color="var(--accent-success)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>응답 보호</div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>익명성 보장</div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div style={{ paddingTop: '8px' }}>
        <button
          onClick={onStartSurvey}
          disabled={loading}
          className="btn-survey-next"
          style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
        >
          <span>{loading ? '설문 세션 생성 중...' : '응답 계속하기'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
