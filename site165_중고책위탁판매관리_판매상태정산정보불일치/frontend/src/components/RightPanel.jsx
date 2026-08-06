import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedBook, setSelectedBook, books, consignors, triggerStatusPayoutRace, triggerCancelSettlementConflict, triggerPartialSave }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('유발 하라리');
  const [priceWon, setPriceWon] = useState(14000);
  const [payoutAmount, setPayoutAmount] = useState(10500);

  const target = selectedBook || books[0];
  const targetConsignor = consignors.find(c => c.consignorName === target?.consignorName) || consignors[0];

  useEffect(() => {
    if (target) {
      setPayoutAmount(target.payoutAmount || 10500);
    }
    if (target) {
      setTitle(target.title || '');
      setAuthor(target.author || '유발 하라리');
      setPriceWon(target.priceWon || 14000);
    }
  }, [target, targetConsignor]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📚 판매 상태 & 위탁 정산액 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>도서 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.bookCode}</strong></p>
            <p>도서명: <strong>{target.title}</strong></p>
            <p>저자: <small>{target.author}</small> | 위탁자: <strong>{target.consignorName}</strong></p>
            <p>카테고리: <span className="category-badge">{target.category}</span></p>
            <p>중고 판매가: <strong>{target.priceWon?.toLocaleString()}원</strong> (상태: <small style={{ color: 'var(--color-warning)' }}>{target.qualityGrade}</small>)</p>
            <p>위탁 정산 예정액: <strong style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>{target.payoutAmount?.toLocaleString()}원</strong></p>
            <p>판매 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>위탁 정산 예정액 수정 (0.1초 완료):</label>
              <input type="number" min="0" value={payoutAmount} onChange={(e) => setPayoutAmount(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>판매 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'SOLD'} onChange={(e) => setSelectedBook({ ...target, status: e.target.value })}>
                <option value="RECEIVED">위탁접수 (RECEIVED)</option>
                <option value="INSPECTED">검수완료 (INSPECTED)</option>
                <option value="ON_SALE">판매중 (ON_SALE)</option>
                <option value="SOLD">판매완료/정산대기 (SOLD)</option>
                <option value="SETTLED">정산완료 (SETTLED)</option>
                <option value="CANCELLED">판매취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusPayoutRace(target.id, target, payoutAmount)}>
              판매완료 변경 + 즉시 정산 금액 수정 (Error 1)
            </button>
            <small className="warn-desc">* 판매완료 변경(3초 지연) 직후 정산 금액 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 정산 금액을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelSettlementConflict(target.id)}>
                ⚡ 판매 취소 후 정산 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 판매 취소(0.5초 완료) 직후 정산 완료(4초 지연 완료) 시, 취소된 판매가 SETTLED(정산완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 위탁 도서를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 위탁 도서 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>중고 도서명:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>중고 판매가 (원):</label>
              <input type="number" value={priceWon} onChange={(e) => setPriceWon(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>저자 (부분 저장 미반영):</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, title, author, priceWon)}>
              도서 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 도서명/판매가/저자 동시 수정 시 저자만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 도서를 선택하세요.</div>}
      </div>
    </aside>
  );
}
