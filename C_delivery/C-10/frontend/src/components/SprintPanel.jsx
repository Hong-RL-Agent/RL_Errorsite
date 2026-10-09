import React, { useState } from 'react';
import { Zap, Calendar, Plus, CheckCircle, Target, X } from 'lucide-react';

export default function SprintPanel({ projectId, sprints, onSprintCreated, loading }) {
  const [showModal, setShowModal] = useState(false);
  const [sprintName, setSprintName] = useState('Sprint 43 - Mobile Performance Polish');
  const [goal, setGoal] = useState('렌더링 성능 최적화 및 레이턴시 개선');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [saving, setSaving] = useState(false);

  const handleSaveSprint = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5009/workspace/projects/${projectId}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sprintName,
          goal,
          start_date: startDate,
          end_date: endDate // 2026-10-31
        })
      });

      if (res.ok) {
        setShowModal(false);
        if (onSprintCreated) onSprintCreated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
            <Zap size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              애자일 스프린트
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            스프린트 주기 및 목표 관리
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            개발 이터레이션 일정과 핵심 딜리버리 마일스톤을 동기화합니다.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>새 스프린트 생성</span>
        </button>
      </div>

      {/* Sprints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sprints.map(sp => (
          <div
            key={sp.id}
            data-sprint={sp.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {sp.id}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {sp.name}
                  </h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  목표: {sp.goal}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}>
                  <Calendar size={14} color="var(--accent-cyan)" />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {sp.start_date} ~ <strong>Ends {sp.end_date}</strong>
                  </span>
                </div>
                <span className="badge badge-progress">
                  {sp.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sprint Creation Modal (BUG 4: C-10-1445) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 9, 17, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>스프린트</div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  새 스프린트 일정 등록
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  스프린트 이름
                </label>
                <input
                  type="text"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    padding: '10px 14px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  스프린트 목표
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    padding: '10px 14px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      padding: '10px 14px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    종료일 (Due Date)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      padding: '10px 14px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSprint}
                disabled={saving}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: '8px' }}
              >
                <span>{saving ? '저장 중...' : '스프린트 저장'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
