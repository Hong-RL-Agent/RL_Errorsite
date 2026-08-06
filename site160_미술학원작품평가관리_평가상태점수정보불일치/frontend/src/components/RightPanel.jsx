import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedArtwork, setSelectedArtwork, artworks, students, triggerStatusScoreRace, triggerCancelFeedbackConflict, triggerPartialSave }) {
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('입시미술 수시집중 A반');
  const [parentContact, setParentContact] = useState('010-9999-8888');
  const [score, setScore] = useState(96);

  const target = selectedArtwork || artworks[0];
  const targetStudent = students.find(s => s.studentName === target?.studentName) || students[0];

  useEffect(() => {
    if (target) {
      setScore(target.score || 96);
    }
    if (targetStudent) {
      setStudentName(targetStudent.studentName || '');
      setClassName(targetStudent.className || '입시미술 수시집중 A반');
      setParentContact(targetStudent.parentContact || '010-9999-8888');
    }
  }, [target, targetStudent]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🖼️ 평가 상태 & 실기 점수 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>작품 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.artCode}</strong></p>
            <p>작품 제목: <strong>{target.artTitle}</strong></p>
            <p>제출 학생: <strong>{target.studentName}</strong> | 반: <span className="class-badge">{target.className}</span></p>
            <p>담당 강사: <strong>{target.instructorName}</strong> | 제출일: <small>{target.submitDate}</small></p>
            <p>평가 등급: <small style={{ color: 'var(--color-warning)' }}>{target.gradeCategory}</small></p>
            <p>현재 실기 평가 점수: <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>{target.score}점</strong></p>
            <p>평가 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>실기 평가 점수 수정 (0.1초 완료):</label>
              <input type="number" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>평가 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'COMPLETED'} onChange={(e) => setSelectedArtwork({ ...target, status: e.target.value })}>
                <option value="SUBMITTED">제출완료 (SUBMITTED)</option>
                <option value="EVALUATING">평가중 (EVALUATING)</option>
                <option value="COMPLETED">평가완료 (COMPLETED)</option>
                <option value="CANCELLED">제출취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusScoreRace(target.id, target, score)}>
              평가완료 변경 + 즉시 점수 수정 (Error 1)
            </button>
            <small className="warn-desc">* 평가완료 변경(3초 지연) 직후 점수 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 점수를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelFeedbackConflict(target.id)}>
                ⚡ 제출 취소 후 피드백 작성 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 제출 취소(0.5초 완료) 직후 피드백 작성(4초 지연 완료) 시, 취소된 작품이 EVALUATING(평가중)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 작품을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 수강 학생 정보 수정 (Error 8)</h3>
        {targetStudent ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>학생 성명:</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>보호자 연락처:</label>
              <input type="text" value={parentContact} onChange={(e) => setParentContact(e.target.value)} />
            </div>
            <div className="form-group">
              <label>소속 실기반 (부분 저장 미반영):</label>
              <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetStudent.id, studentName, className, parentContact)}>
              학생 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 학생명/보호자연락처/실기반 동시 수정 시 실기반만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 학생을 선택하세요.</div>}
      </div>
    </aside>
  );
}
