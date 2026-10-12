import React, { useState } from 'react';
import { X, Dumbbell } from 'lucide-react';

export default function AddWorkoutModal({ 
  isOpen, 
  onClose, 
  exercises, 
  onSubmit,
  defaultDate 
}) {
  if (!isOpen) return null;

  const [exerciseId, setExerciseId] = useState(exercises[0]?.id || 1);
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [weightKg, setWeightKg] = useState(60);
  const [durationMin, setDurationMin] = useState(25);
  const [calories, setCalories] = useState(150);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);

  const selectedEx = exercises.find(e => e.id === Number(exerciseId)) || exercises[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      exercise_id: Number(exerciseId),
      workout_date: date,
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
            <Dumbbell size={20} color="var(--lime-400)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              새 트레이닝 세션 기록
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding: '4px', borderRadius: '50%' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-main">
            {/* Exercise selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                운동 종목 선택 *
              </label>
              <select
                className="select-field"
                value={exerciseId}
                onChange={(e) => setExerciseId(e.target.value)}
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    [{ex.type === 'STRENGTH' ? '근력' : '유산소'}] {ex.name} ({ex.target_muscle})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                운동 일자 *
              </label>
              <input
                type="date"
                className="input-field"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
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
                placeholder="자극 부위, RPE 자각도 등"
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
              기록 저장 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
