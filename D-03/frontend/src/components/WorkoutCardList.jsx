import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Trash2, 
  Edit2, 
  Flame, 
  Clock, 
  Layers, 
  Dumbbell,
  Search,
  Check
} from 'lucide-react';

export default function WorkoutCardList({ 
  workouts, 
  onToggleComplete, 
  onEditWorkout, 
  onDeleteWorkout 
}) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = workouts.filter((w) => {
    if (typeFilter !== 'ALL' && w.type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = w.exercise_name.toLowerCase().includes(q) ||
                    (w.notes && w.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="content-card" style={{ marginTop: '24px' }}>
      <div className="card-heading" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 className="card-title-text">
            <Dumbbell size={18} color="var(--lime-400)" />
            <span>상세 운동 세션 기록 ({filtered.length}건)</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            수행한 종목별 세트, 반복 횟수, 중량 및 완료 여부
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', padding: '6px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="운동명, 메모 검색..."
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.84rem', outline: 'none', width: '130px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className={`btn btn-sm ${typeFilter === 'ALL' ? 'btn-lime' : 'btn-outline'}`}
            onClick={() => setTypeFilter('ALL')}
          >
            전체
          </button>
          <button
            className={`btn btn-sm ${typeFilter === 'STRENGTH' ? 'btn-lime' : 'btn-outline'}`}
            onClick={() => setTypeFilter('STRENGTH')}
          >
            근력 트레이닝
          </button>
          <button
            className={`btn btn-sm ${typeFilter === 'CARDIO' ? 'btn-lime' : 'btn-outline'}`}
            onClick={() => setTypeFilter('CARDIO')}
          >
            유산소
          </button>
        </div>
      </div>

      {/* Grid of workout cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          등록된 운동 기록이 없습니다.
        </div>
      ) : (
        <div className="workout-grid">
          {filtered.map((item) => {
            const isDone = item.is_completed === 1;
            const isStrength = item.type === 'STRENGTH';

            return (
              <div 
                key={item.id} 
                className={`workout-item-card ${isDone ? 'completed' : 'uncompleted'}`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className={`item-badge-type ${isStrength ? 'badge-strength' : 'badge-cardio'}`}>
                      {isStrength ? '근력 웨이트' : '유산소'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.workout_date}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                    {item.exercise_name}
                  </h4>

                  {/* Volume Metrics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '6px', 
                    background: 'var(--bg-input)', 
                    padding: '8px 10px', 
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>세트(SETS)</span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--lime-300)' }}>
                        {item.sets}SET
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {isStrength ? '반복(REPS)' : '시간'}
                      </span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {isStrength ? `${item.reps}회` : `${item.duration_min}분`}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {isStrength ? '중량(KG)' : '칼로리'}
                      </span>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38BDF8' }}>
                        {isStrength ? `${item.weight_kg}kg` : `${item.calories}kcal`}
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '18px' }}>
                      "{item.notes}"
                    </div>
                  )}
                </div>

                {/* Card footer actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  {/* Complete Toggle Button */}
                  <button
                    className={`btn btn-sm ${isDone ? 'btn-lime' : 'btn-outline'}`}
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    onClick={() => onToggleComplete(item.id)}
                  >
                    {isDone ? <Check size={13} /> : <Circle size={13} />}
                    <span>{isDone ? '운동 완료' : '완료 체크'}</span>
                  </button>

                  {/* Edit & Delete */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => onEditWorkout(item)}
                      title="운동 기록 수정"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 8px' }}
                      onClick={() => onDeleteWorkout(item.id)}
                      title="운동 기록 삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
