import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedAuction, setSelectedAuction, auctions, items, triggerStatusQuantityRace, triggerCancelShipmentConflict, triggerPartialSave }) {
  const [itemName, setItemName] = useState('');
  const [origin, setOrigin] = useState('제주 서귀포');
  const [tempStorage, setTempStorage] = useState('-1.5℃');
  const [quantityKg, setQuantityKg] = useState(450);

  const target = selectedAuction || auctions[0];

  useEffect(() => {
    if (target) {
      setItemName(target.itemName || '');
      setOrigin(target.origin || '제주 서귀포');
      setTempStorage(target.tempStorage || '-1.5℃');
      setQuantityKg(target.quantityKg || 450);
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>⚓ 경매 낙찰 & 출하 수량 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>품목명: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.itemName}</strong></p>
            <p>산지 어항: <strong>{target.origin}</strong> | 보관: <strong>{target.tempStorage}</strong></p>
            <p>낙찰 금액: <strong style={{ color: 'var(--color-success)' }}>{target.winPriceWon.toLocaleString()}원</strong></p>
            <p>낙찰자: <strong>{target.winnerName}</strong></p>
            <p>경매/낙찰 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>출하 예정 수량(kg) 수정 (0.1초 완료):</label>
              <input type="number" value={quantityKg} onChange={(e) => {
                setQuantityKg(Number(e.target.value));
                setSelectedAuction({ ...target, quantityKg: Number(e.target.value) });
              }} />
            </div>

            <div className="form-group">
              <label>낙찰/출하 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'WON'} onChange={(e) => setSelectedAuction({ ...target, status: e.target.value })}>
                <option value="BIDDING">입찰중 (BIDDING)</option>
                <option value="WIN_PENDING">낙찰대기 (WIN_PENDING)</option>
                <option value="WON">낙찰완료 (WON)</option>
                <option value="SHIPPED">출하완료 (SHIPPED)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusQuantityRace(target.id, target, quantityKg)}>
              낙찰완료 변경 + 즉시 수량 수정 (Error 1)
            </button>
            <small className="warn-desc">* 낙찰 상태 변경(3초 지연) 직후 수량 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 출하 수량을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelShipmentConflict(target.id)}>
                ⚡ 낙찰 취소 후 출하 확정 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 낙찰 취소(0.5초 완료) 직후 출하 확정(4초 지연 완료) 시, 취소된 낙찰이 SHIPPED(출하완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 경매를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 수산물 품목 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>품목명:</label>
              <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>산지 어항 (부분 저장 미반영):</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </div>
            <div className="form-group">
              <label>콜드체인 보관온도:</label>
              <input type="text" value={tempStorage} onChange={(e) => setTempStorage(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => {
              const itemObj = items.find(i => i.itemName === target.itemName) || items[0];
              if (itemObj) triggerPartialSave(itemObj.id, itemName, origin, tempStorage);
            }}>
              품목 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 품목명/산지/보관온도 동시 수정 시 산지만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 품목을 선택하세요.</div>}
      </div>
    </aside>
  );
}
