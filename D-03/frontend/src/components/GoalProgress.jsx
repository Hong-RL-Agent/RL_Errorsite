import React from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';

export default function GoalProgress({ goals, onToggleGoal }) {
  return (
    <div className="content-card">
      <div className="card-heading">
        <div>
          <h3 className="card-title-text">
            <Target size={18} color="var(--lime-400)" />
            <span>주간 트레이닝 목표 달성률</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            이번 주 설정한 핵심 운동 달성 체크
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {goals.map((g) => {
          const rate = g.target_value > 0 ? Math.min(100, (g.current_value / g.target_value) * 100) : 0;
          const isDone = g.is_achieved === 1;

          return (
            <div
              key={g.id}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-card-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    onClick={() => onToggleGoal(g.id)}
                    title="목표 달성 여부 토글"
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} color="var(--lime-400)" />
                    ) : (
                      <Circle size={18} color="#64748B" />
                    )}
                  </button>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isDone ? 'var(--lime-300)' : '#FFFFFF' }}>
                    {g.title}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {g.current_value} / {g.target_value} {g.unit} ({rate.toFixed(0)}%)
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', background: '#12151B', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${rate}%`,
                    background: isDone ? 'var(--lime-400)' : '#38BDF8',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
