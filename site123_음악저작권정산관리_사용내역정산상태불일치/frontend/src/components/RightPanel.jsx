import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedTrack, setSelectedTrack, tracks, triggerStatusSplitRace, triggerCancelUsageConflict, triggerPartialSave }) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('K-POP');
  const [primaryCreatorName, setPrimaryCreatorName] = useState('');
  const [royaltyRate, setRoyaltyRate] = useState(12.5);

  const target = selectedTrack || tracks[0];

  useEffect(() => {
    if (target) {
      setTitle(target.title || '');
      setGenre(target.genre || 'K-POP');
      setPrimaryCreatorName(target.primaryCreatorName || '');
      setRoyaltyRate(target.royaltyRate || 12.5);
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎵 음원 저작권 & 정산 분배 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>음원 제목: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.title}</strong></p>
            <p>대표 권리자: <strong>{target.primaryCreatorName}</strong> | 장르: <strong>{target.genre}</strong></p>
            <p>총 음원 수익: <strong style={{ color: 'var(--color-success)' }}>{target.totalRevenueWon.toLocaleString()}원</strong></p>
            <p>저작권 인세율: <strong style={{ color: 'var(--color-dark)' }}>{target.royaltyRate}%</strong></p>
            <p>정산 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>권리자 인세 배분율(%) (0.1초 완료):</label>
              <input type="number" step="0.5" value={royaltyRate} onChange={(e) => {
                setRoyaltyRate(Number(e.target.value));
                setSelectedTrack({ ...target, royaltyRate: Number(e.target.value) });
              }} />
            </div>

            <div className="form-group">
              <label>정산 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'CONFIRMED'} onChange={(e) => setSelectedTrack({ ...target, status: e.target.value })}>
                <option value="CALCULATING">집계중 (CALCULATING)</option>
                <option value="SETTLING">정산대기 (SETTLING)</option>
                <option value="CONFIRMED">정산확정 (CONFIRMED)</option>
                <option value="PAID">지급완료 (PAID)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusSplitRace(target.id, target, royaltyRate)}>
              정산확정 변경 + 즉시 배분율 변경 (Error 1)
            </button>
            <small className="warn-desc">* 정산 상태 변경(3초 지연) 직후 배분율 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 배분율을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelUsageConflict(target.id)}>
                ⚡ 정산 취소 후 사용 내역 반영 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 정산 취소(0.5초 완료) 직후 사용 내역 반영(4초 지연 완료) 시, 취소된 정산이 SETTLING(정산대기)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 음원을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 음원 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>음원 제목:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>음악 장르 (부분 저장 미반영):</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option value="K-POP">K-POP</option>
                <option value="발라드">발라드</option>
                <option value="힙합/R&B">힙합/R&B</option>
                <option value="댄스/플래시">댄스/플래시</option>
                <option value="인디/어쿠스틱">인디/어쿠스틱</option>
              </select>
            </div>
            <div className="form-group">
              <label>대표 권리자 성명:</label>
              <input type="text" value={primaryCreatorName} onChange={(e) => setPrimaryCreatorName(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, title, genre, primaryCreatorName)}>
              음원 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 제목/장르/대표권리자 동시 수정 시 장르만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 음원을 선택하세요.</div>}
      </div>
    </aside>
  );
}
