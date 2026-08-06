import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedArticle, setSelectedArticle, articles, editors, triggerStatusEditorRace, triggerDeleteCommentConflict, triggerPartialSave }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [scheduledTime, setScheduledTime] = useState('2026-08-05 14:00');
  const [editorName, setEditorName] = useState('이데스크');
  const [commentText, setCommentText] = useState('데스크 2차 교열 및 팩트체크 검증 완료');

  const target = selectedArticle || articles[0];

  useEffect(() => {
    if (target) {
      setTitle(target.title || '');
      setCategory(target.category || '');
      setScheduledTime(target.scheduledTime || '2026-08-05 14:00');
      setEditorName(target.editorName || '이데스크');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📰 기사 검수 & 편집자 관제 패널</h3>
        {target ? (
          <div className="detail-panel">
            <p>기사 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.articleCode}</strong></p>
            <p>제목: <strong style={{ fontSize: '0.85rem' }}>{target.title}</strong></p>
            <p>카테고리: <strong>{target.category}</strong> | 취재기자: <strong>{target.reporterName}</strong></p>
            <p>담당 편집자: <strong style={{ color: 'var(--color-success)' }}>{target.editorName}</strong></p>
            <p>발행예정시각: <small>{target.scheduledTime}</small></p>
            <p>기사 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>담당 편집자 변경 (0.1초 완료):</label>
              <select value={editorName} onChange={(e) => setEditorName(e.target.value)}>
                {editors.map(e => <option key={e.id} value={e.editorName}>{e.editorName} ({e.dept})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>기사 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'SCHEDULED'} onChange={(e) => setSelectedArticle({ ...target, status: e.target.value })}>
                <option value="DRAFT">초안작성 (DRAFT)</option>
                <option value="REVIEWING">검수중 (REVIEWING)</option>
                <option value="APPROVED">승인완료 (APPROVED)</option>
                <option value="SCHEDULED">발행예약 (SCHEDULED)</option>
                <option value="PUBLISHED">최종발행 (PUBLISHED)</option>
                <option value="REJECTED">반려됨 (REJECTED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusEditorRace(target.id, target, editorName)}>
              발행예약 변경 + 즉시 편집자 변경 (Error 1)
            </button>
            <small className="warn-desc">* 발행예약 변경(3초 지연) 직후 편집자 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 편집자를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <div className="form-group">
                <label>데스크 검수 의견 피드백 메모:</label>
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              </div>
              <button className="cancel-work-btn" onClick={() => triggerDeleteCommentConflict(target.id, editorName, commentText)}>
                ⚡ 기사 삭제 후 검수 의견 작성 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 기사 삭제(0.5초 완료) 직후 검수 의견 작성(4초 지연 완료) 시, 삭제된 기사가 REVIEWING(검수중)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 기사를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 기사 메타정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>기사 헤드라인 제목:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>카테고리 (부분 저장 미반영):</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="form-group">
              <label>발행 예정 시각:</label>
              <input type="text" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, title, category, scheduledTime)}>
              기사 메타정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 제목/카테고리/발행예정시각 동시 수정 시 카테고리만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 기사를 선택하세요.</div>}
      </div>
    </aside>
  );
}
