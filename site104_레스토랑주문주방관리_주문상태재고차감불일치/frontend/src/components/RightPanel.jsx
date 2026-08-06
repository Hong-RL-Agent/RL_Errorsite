import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedOrder,
  setSelectedOrder,
  chefs,
  menus,
  ingredients,
  triggerStatusChefRace,
  triggerCancelDeductConflict,
  triggerPartialMenuSave
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [mainIngredient, setMainIngredient] = useState('');

  const targetMenu = menus.find(m => m.name === selectedOrder?.menuName) || menus[0];

  useEffect(() => {
    if (targetMenu) {
      setName(targetMenu.name || '');
      setPrice(targetMenu.price || 0);
      setMainIngredient(targetMenu.mainIngredient || '');
    }
  }, [targetMenu]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Order Status & Chef Assignment Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🍳 주문 상태 & 조리 셰프 배정 관제</h3>
        {selectedOrder ? (
          <div className="detail-panel">
            <p>주문 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedOrder.id}</strong></p>
            <p>테이블: <strong>{selectedOrder.tableNo} ({selectedOrder.tableSection})</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></p>

            <div className="form-group">
              <label>조리 셰프 배정 변경 (0.1초 완료):</label>
              <select 
                value={selectedOrder.chefName || '김주방 (헤드 셰프)'} 
                onChange={(e) => setSelectedOrder({ ...selectedOrder, chefName: e.target.value })}
              >
                {chefs.map(chf => (
                  <option key={chf.id} value={chf.name}>{chf.name} ({chf.station})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>주문 주방 상태 조리중 변경 (Error 1 - 3초 지연):</label>
              <select 
                value={selectedOrder.status || 'RECEIVED'} 
                onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
              >
                <option value="RECEIVED">접수</option>
                <option value="COOKING">조리중 (Error 1 - 3초 지연)</option>
                <option value="COOKED">조리완료</option>
                <option value="SERVED">서빙완료</option>
                <option value="CANCELLED">취소</option>
                <option value="REFUNDED">환불</option>
              </select>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerStatusChefRace(selectedOrder)}>
                상태 변경 후 즉시 담당 셰프 변경 (Error 1)
              </button>
              <small className="warn-desc">* 상태 변경(3초 지연) 직후 셰프 변경(0.1초 완료) 시, 3초 뒤 이전 셰프 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelDeductConflict(selectedOrder)}>
                ⚡ 주문 취소 처리 후 재고 차감 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 주문 취소(0.5초 완료) 직후 재고 차감 실행(4초 지연 완료) 시, 늦은 차감 요청이 취소된 주문을 COOKED 조리완료 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 레스토랑 주문 항목을 선택하세요.</div>
        )}
      </div>

      {/* Menu Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>🍕 레스토랑 메뉴 기본 정보 수정 (Error 8)</h3>
        {targetMenu ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>메뉴명:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>판매 가격 (부분저장 미반영):</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>대표 주재료:</label>
              <input type="text" value={mainIngredient} onChange={(e) => setMainIngredient(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialMenuSave(targetMenu.id, name, price, mainIngredient)}
            >
              메뉴 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 메뉴명/가격/주재료를 동시에 수정하면 백엔드에는 가격만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 메뉴를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
