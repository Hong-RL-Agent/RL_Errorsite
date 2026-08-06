import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedBook, setSelectedBook, books, distributors, triggerStatusDistributorRace, triggerCancelDistributionConflict, triggerPartialSave }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [conditionGrade, setConditionGrade] = useState('A등급 (양호)');
  const [distributorName, setDistributorName] = useState('푸른꿈 작은도서관');

  const target = selectedBook || books[0];

  useEffect(() => {
    if (target) {
      setTitle(target.title || '');
      setAuthor(target.author || '');
      setConditionGrade(target.conditionGrade || 'A등급 (양호)');
      setDistributorName(target.distributorName || '푸른꿈 작은도서관');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📚 도서 분류 & 배포처 관제 패널</h3>
        {target ? (
          <div className="detail-panel">
            <p>도서 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.bookCode}</strong></p>
            <p>제목: <strong style={{ fontSize: '0.85rem' }}>{target.title}</strong> (저자: {target.author})</p>
            <p>분야: <strong>{target.category}</strong> | 상태등급: <strong>{target.conditionGrade}</strong></p>
            <p>기증자: <strong>{target.donorName}</strong> | 접수일: <small>{target.receivedDate}</small></p>
            <p>배정 배포처: <strong style={{ color: 'var(--color-success)' }}>{target.distributorName}</strong></p>
            <p>기증/분류 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배정 배포처 변경 (0.1초 완료):</label>
              <select value={distributorName} onChange={(e) => setDistributorName(e.target.value)}>
                {distributors.map(d => <option key={d.id} value={d.orgName}>{d.orgName} ({d.category})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>기증/분류 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'CLASSIFIED'} onChange={(e) => setSelectedBook({ ...target, status: e.target.value })}>
                <option value="PENDING">접수대기 (PENDING)</option>
                <option value="INSPECTING">상태검수중 (INSPECTING)</option>
                <option value="CLASSIFIED">분류완료 (CLASSIFIED)</option>
                <option value="READY_TO_DISTRIBUTE">배포준비 (READY_TO_DISTRIBUTE)</option>
                <option value="DISTRIBUTED">배포완료 (DISTRIBUTED)</option>
                <option value="CANCELLED">기증취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusDistributorRace(target.id, target, distributorName)}>
              분류완료 변경 + 즉시 배포처 변경 (Error 1)
            </button>
            <small className="warn-desc">* 분류완료 변경(3초 지연) 직후 배포처 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 배포처를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelDistributionConflict(target.id)}>
                ⚡ 기증 취소 후 배포 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 기증 취소(0.5초 완료) 직후 배포 완료(4초 지연 완료) 시, 취소된 기증 도서가 DISTRIBUTED(배포완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 도서를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 도서 상세 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>기증 도서 제목:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>저자 성명 (부분 저장 미반영):</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="form-group">
              <label>보존 상태등급:</label>
              <input type="text" value={conditionGrade} onChange={(e) => setConditionGrade(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, title, author, conditionGrade)}>
              도서 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 제목/저자/보존등급 동시 수정 시 저자만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 도서를 선택하세요.</div>}
      </div>
    </aside>
  );
}
