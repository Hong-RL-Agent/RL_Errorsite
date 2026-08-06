import React, { useState } from 'react';

export default function CourseEditModal({ course, onClose, onConfirm }) {
  const [classroom, setClassroom] = useState(course?.classroom || '');
  const [capacity, setCapacity] = useState(course?.capacity || 40);
  const [professorName, setProfessorName] = useState(course?.professorName || '');

  if (!course) return null;

  const handleSave = () => {
    onConfirm(course.id, classroom, capacity, professorName);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>📚 강의 상세 정보 및 정원 수정 모달</h3>
        <p>강의 코드: <strong style={{ color: 'var(--color-primary)' }}>{course.code}</strong> ({course.name})</p>

        <div className="form-group">
          <label>강의실:</label>
          <input type="text" value={classroom} onChange={(e) => setClassroom(e.target.value)} />
        </div>

        <div className="form-group">
          <label>수강 정원 (명):</label>
          <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value || '0'))} />
        </div>

        <div className="form-group">
          <label>담당 교수:</label>
          <input type="text" value={professorName} onChange={(e) => setProfessorName(e.target.value)} />
        </div>

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장 확정
          </button>
        </div>
      </div>
    </div>
  );
}
