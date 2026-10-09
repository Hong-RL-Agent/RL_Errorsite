import React, { useState, useEffect } from 'react';
import { BarChart3, Users, PieChart, Activity, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SurveyInsights({ formId = 'pulse-001' }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5008/v1/insights/${formId}`);
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [formId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '860px', margin: '24px auto 0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(22, 28, 54, 0.95), rgba(16, 20, 39, 0.95))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary-hover)', marginBottom: '6px' }}>
            <BarChart3 size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              설문 실시간 통계
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            리서치 결과 분석 대시보드
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            전체 제출 현황 및 문항별 응답 분포를 실시간으로 집계합니다.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="btn-survey-prev"
          style={{ fontSize: '0.85rem', padding: '10px 16px' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>새로고침</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          통계 데이터를 집계 중입니다...
        </div>
      ) : insights ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Metrics Overview Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>총 응답자 수</span>
                <Users size={18} color="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                {insights.total_responses}명
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>
                * submission_records 기준 실시간 집계
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>집계 문항 수</span>
                <Activity size={18} color="var(--accent-secondary)" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                4개 문항
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                객관식 및 척도형 집계 완료
              </div>
            </div>
          </div>

          {/* Question Level Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Q1 Breakdown */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Q1. 최근 6개월 내 본 서비스 이용 경험
                </h3>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--accent-primary-hover)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  문항별 응답 합계: {insights.question_breakdown?.q1?.sum_of_answers || 100}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(insights.question_breakdown?.q1?.options || []).map(opt => (
                  <div key={opt.option_value} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {opt.option_value === 'YES' ? '예 (이용 경험 있음)' : '아니오 (이용 경험 없음)'}
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{opt.count}명</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${opt.count}%`, height: '100%', background: opt.option_value === 'YES' ? 'var(--accent-primary)' : 'var(--accent-danger)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Q2 Breakdown */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Q2. 최초 유입 및 인지 경로
                </h3>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--accent-primary-hover)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  문항별 응답 합계: {insights.question_breakdown?.q2?.sum_of_answers || 100}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(insights.question_breakdown?.q2?.options || []).map(opt => (
                  <div key={opt.option_value} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{opt.option_value}</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{opt.count}명</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${opt.count}%`, height: '100%', background: 'var(--accent-secondary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Q5 Scale Breakdown */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Q5. 전반적인 품질 및 만족도 척도 분포
                </h3>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--accent-primary-hover)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  문항별 응답 합계: {insights.question_breakdown?.q5?.sum_of_answers || 100}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {(insights.question_breakdown?.q5?.options || []).map(opt => (
                  <div
                    key={opt.option_value}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.option_value}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                      {opt.count}명
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
