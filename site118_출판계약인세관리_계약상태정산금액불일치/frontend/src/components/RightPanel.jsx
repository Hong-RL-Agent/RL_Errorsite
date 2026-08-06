import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedBook, setSelectedBook, books, contracts, triggerStatusRoyaltyRace, triggerCancelSalesConflict, triggerPartialSave }) {
  const [title, setTitle] = useState('');
  const [pubDate, setPubDate] = useState('');
  const [royaltyRate, setRoyaltyRate] = useState(10.0);

  const target = selectedBook || books[0];

  useEffect(() => {
    if (target) {
      setTitle(target.title || '');
      setPubDate(target.pubDate || '');
      setRoyaltyRate(target.royaltyRate || 10.0);
    }
  }, [target]);

  const ctrOfTarget = contracts.filter(c => target && c.bookId === target.id);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📝 계약 상세 & 인세 정산 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>도서 제목: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.title}</strong></p>
            <p>저자명: <strong>{target.authorName}</strong> | 장르: <strong>{target.genre}</strong></p>
            <p>누적 판매량: <strong style={{ color: 'var(--color-success)' }}>{target.totalSalesCopies.toLocaleString()}부</strong></p>
            <p>계약 인세율: <strong style={{ color: 'var(--color-dark)' }}>{target.royaltyRate}%</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>인세율 수정(%) (0.1초 완료):</label>
              <input type="number" step="0.5" value={royaltyRate} onChange={(e) => {
                setRoyaltyRate(Number(e.target.value));
                setSelectedBook({ ...target, royaltyRate: Number(e.target.value) });
              }} />
            </div>

            <div className="form-group">
              <label>계약/출간 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'PUBLISHED'} onChange={(e) => setSelectedBook({ ...target, status: e.target.value })}>
                <option value="REVIEWING">원고검토 (REVIEWING)</option>
                <option value="CONTRACTED">계약체결 (CONTRACTED)</option>
                <option value="PUBLISHED">출간확정 (PUBLISHED)</option>
                <option value="SETTLING">정산대기 (SETTLING)</option>
                <option value="COMPLETED">정산완료 (COMPLETED)</option>
                <option value="CANCELLED">계약해지 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => {
              const ctr = ctrOfTarget[0] || contracts[0];
              if (ctr) triggerStatusRoyaltyRace(ctr.id, target, royaltyRate);
            }}>
              출간확정 변경 + 즉시 인세율 수정 (Error 1)
            </button>
            <small className="warn-desc">* 계약 상태 변경(3초 지연) 직후 인세율 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 인세율을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => {
                const ctr = ctrOfTarget[0] || contracts[0];
                if (ctr) triggerCancelSalesConflict(ctr.id);
              }}>
                ⚡ 계약 해지 후 판매량 반영 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 계약 해지(0.5초 완료) 직후 판매량 반영(4초 지연 완료) 시, 해지된 계약이 SETTLING(정산대기)으로 복원됨 (Error 2)</small>
            </div>

            {ctrOfTarget.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}>
                <strong style={{ color: 'var(--color-dark)' }}>계약 이력:</strong>
                {ctrOfTarget.map(c => (
                  <div key={c.id} style={{ marginTop: '0.2rem', color: 'var(--color-text)' }}>
                    ▸ {c.contractDate} 체결 (선급금: {c.advanceWon.toLocaleString()}원) <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <div className="empty-lbl-dark">관제할 도서를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 도서 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>도서 제목:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>출간일자 (부분 저장 미반영):</label>
              <input type="date" value={pubDate} onChange={(e) => setPubDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>인세율(%):</label>
              <input type="number" step="0.5" value={royaltyRate} onChange={(e) => setRoyaltyRate(Number(e.target.value))} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, title, pubDate, royaltyRate)}>
              도서 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 제목/출간일/인세율 동시 수정 시 출간일만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 도서를 선택하세요.</div>}
      </div>
    </aside>
  );
}
