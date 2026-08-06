import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedAuction, setSelectedAuction, auctions, flowers, triggerStatusQtyRace, triggerCancelDispatchConflict, triggerPartialSave }) {
  const [flowerName, setFlowerName] = useState('');
  const [grade, setGrade] = useState('특상급');
  const [tempSetting, setTempSetting] = useState('4℃ 냉장보관');
  const [deliveryQty, setDeliveryQty] = useState(300);

  const target = selectedAuction || auctions[0];

  useEffect(() => {
    if (target) {
      setDeliveryQty(target.deliveryQty || 300);
      const flw = flowers.find(f => f.flowerName === target.flowerName);
      if (flw) {
        setFlowerName(flw.flowerName || '');
        setGrade(flw.grade || '특상급');
        setTempSetting(flw.tempSetting || '4℃ 냉장보관');
      }
    }
  }, [target, flowers]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🌸 화훼 경매 & 배송 수량 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>경매 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.auctionCode}</strong></p>
            <p>생화 품목: <strong style={{ fontSize: '0.85rem' }}>{target.flowerName}</strong> ({target.grade})</p>
            <p>경매 수량: <strong>{target.quantity}단</strong> | 낙찰가: <strong>{target.winningPriceWon.toLocaleString()}원</strong></p>
            <p>낙찰 구매자: <strong>{target.buyerName}</strong></p>
            <p>출고 배송 수량: <strong style={{ color: 'var(--color-warning)' }}>{target.deliveryQty}단</strong></p>
            <p>낙찰/배송 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>출고 배송 수량 수정 (0.1초 완료):</label>
              <input type="number" value={deliveryQty} onChange={(e) => setDeliveryQty(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>낙찰/배송 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'WON'} onChange={(e) => setSelectedAuction({ ...target, status: e.target.value })}>
                <option value="BIDDING">경매중 (BIDDING)</option>
                <option value="WON">낙찰완료 (WON)</option>
                <option value="READY_FOR_DELIVERY">배송준비 (READY_FOR_DELIVERY)</option>
                <option value="DELIVERING">배송중 (DELIVERING)</option>
                <option value="CANCELLED">낙찰취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusQtyRace(target.id, target, deliveryQty)}>
              낙찰완료 변경 + 즉시 배송수량 수정 (Error 1)
            </button>
            <small className="warn-desc">* 낙찰완료 변경(3초 지연) 직후 배송수량 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 배송수량을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelDispatchConflict(target.id)}>
                ⚡ 낙찰 취소 후 배송 지시 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 낙찰 취소(0.5초 완료) 직후 배송 지시(4초 지연 완료) 시, 취소된 낙찰이 READY_FOR_DELIVERY(배송준비)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 경매를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 화훼 품목 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>생화 꽃이름:</label>
              <input type="text" value={flowerName} onChange={(e) => setFlowerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>품질 등급 (부분 저장 미반영):</label>
              <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <div className="form-group">
              <label>콜드체인 보관온도:</label>
              <input type="text" value={tempSetting} onChange={(e) => setTempSetting(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => {
              const flw = flowers.find(f => f.flowerName === target.flowerName) || flowers[0];
              if (flw) triggerPartialSave(flw.id, flowerName, grade, tempSetting);
            }}>
              품목 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 꽃이름/등급/보관온도 동시 수정 시 등급만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 품목을 선택하세요.</div>}
      </div>
    </aside>
  );
}
