import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

export default function EditWorkoutModal({ 
  workout, 
  onClose, 
  onSubmit 
}) {
  if (!workout) return null;

  const [sets, setSets] = useState(workout.sets);
  const [reps, setReps] = useState(workout.reps);
  const [weightKg, setWeightKg] = useState(workout.weight_kg);
  const [durationMin, setDurationMin] = useState(workout.duration_min);
  const [calories, setCalories] = useState(workout.calories);
  const [notes, setNotes] = useState(workout.notes || '');

  useEffect(() => {
    setSets(workout.sets);
    setReps(workout.reps);
    setWeightKg(workout.weight_kg);
    setDurationMin(workout.duration_min);
    setCalories(workout.calories);
    setNotes(workout.notes || '');
  }, [workout]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(workout.id, {
      sets: Number(sets),
      reps: Number(reps),
      weight_kg: Number(weightKg),
      duration_min: Number(durationMin),
      calories: Number(calories),
      notes
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} color="var(--lime-400)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              [{workout.exercise_name}] 기록 수정
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-main">
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              일자: {workout.workout_date} · 종목: {workout.exercise_name} (#{workout.id})
            </div>

            {/* Sets & Reps & Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  세트 수
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  required
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  반복 횟수
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  required
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  중량 (kg)
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="0"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
            </div>

            {/* Duration & Calories */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  운동 시간 (분)
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  소모 칼로리 (kcal)
                </label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                트레이닝 메모
              </label>
              <input
                type="text"
                className="input-field"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-lime">
              수정사항 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
