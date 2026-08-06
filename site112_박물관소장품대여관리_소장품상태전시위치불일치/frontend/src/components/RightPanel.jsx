import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedArtifact, setSelectedArtifact, artifacts, galleries, loanRequests, triggerGalleryConservationRace, triggerCancelReturnConflict, triggerPartialSave }) {
  const [artName, setArtName] = useState('');
  const [madeYear, setMadeYear] = useState(0);
  const [conservationGrade, setConservationGrade] = useState('A');
  const target = selectedArtifact || artifacts[0];

  useEffect(() => {
    if (target) {
      setArtName(target.name || '');
      setMadeYear(target.madeYear || 0);
      setConservationGrade(target.conservationGrade || 'A');
    }
  }, [target]);

  const loanOfTarget = loanRequests.filter(l => target && l.artifactId === target.id);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📜 소장품 상세 & 전시 위치 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>소장품: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.name}</strong></p>
            <p>시대: <strong>{target.era}</strong> | 분류: <strong>{target.category}</strong></p>
            <p>현재 전시실: <strong>{target.galleryName}</strong></p>
            <p>보존등급: <strong style={{ color: 'var(--color-warning)' }}>{target.conservationGrade}등급</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>전시실 변경 (Error 1 - 3초 지연):</label>
              <select value={target.galleryId || ''} onChange={(e) => {
                const g = galleries.find(x => x.id === e.target.value);
                setSelectedArtifact({ ...target, galleryId: e.target.value, galleryName: g?.name || '' });
              }}>
                {galleries.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>보존등급 변경 (0.1초 완료):</label>
              <select value={target.conservationGrade || 'A'} onChange={(e) => setSelectedArtifact({ ...target, conservationGrade: e.target.value })}>
                <option value="S">S등급 (최상)</option>
                <option value="A">A등급 (상)</option>
                <option value="B">B등급 (중)</option>
                <option value="C">C등급 (하/위험)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerGalleryConservationRace(target)}>
              전시 위치 변경 + 즉시 보존등급 변경 (Error 1)
            </button>
            <small className="warn-desc">* 전시 위치 변경(3초 지연) 직후 보존등급 변경(0.1초 완료) 시, 3초 뒤 위치 변경이 구 DB 스냅샷으로 보존등급을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => {
                const loan = loanOfTarget[0];
                if (loan) triggerCancelReturnConflict(loan.id);
              }}>
                ⚡ 대여 취소 후 반납 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 대여 취소(0.5초 완료) 직후 반납 완료(4초 지연 완료) 시, 취소된 대여가 RETURNED로 복원됨 (Error 2)</small>
            </div>

            {loanOfTarget.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}>
                <strong style={{ color: 'var(--color-dark)' }}>대여 이력:</strong>
                {loanOfTarget.map(l => (
                  <div key={l.id} style={{ marginTop: '0.2rem', color: 'var(--color-text)' }}>
                    ▸ {l.requestingOrg} ({l.startDate} ~ {l.endDate}) <span className={`status-badge ${l.status.toLowerCase()}`}>{l.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <div className="empty-lbl-dark">관제할 소장품을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 소장품 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>소장품명:</label>
              <input type="text" value={artName} onChange={(e) => setArtName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>제작연도 (부분 저장 미반영):</label>
              <input type="number" value={madeYear} onChange={(e) => setMadeYear(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>보존등급:</label>
              <select value={conservationGrade} onChange={(e) => setConservationGrade(e.target.value)}>
                <option value="S">S등급</option><option value="A">A등급</option>
                <option value="B">B등급</option><option value="C">C등급</option>
              </select>
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, artName, madeYear, conservationGrade)}>
              소장품 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 작품명/제작연도/보존등급 동시 수정 시 제작연도만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 소장품을 선택하세요.</div>}
      </div>
    </aside>
  );
}
