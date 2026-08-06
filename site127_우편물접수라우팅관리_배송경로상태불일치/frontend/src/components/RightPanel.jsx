import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedParcel, setSelectedParcel, parcels, routesList, triggerRouteStatusRace, triggerReturnCompleteConflict, triggerPartialSave }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const target = selectedParcel || parcels[0];

  useEffect(() => {
    if (target) {
      setRecipientName(target.recipientName || '');
      setRecipientPhone(target.recipientPhone || '');
      setDeliveryAddress(target.deliveryAddress || '');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📮 우편물 상세 & 라우팅 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>송장 번호: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.trackingNo}</strong></p>
            <p>수취인: <strong>{target.recipientName}</strong> | 연락처: <small>{target.recipientPhone}</small></p>
            <p>배송 주소: <small>{target.deliveryAddress}</small></p>
            <p>지정 라우팅: <strong style={{ color: 'var(--color-success)' }}>{target.routeName}</strong></p>
            <p>배송 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배송 라우팅 경로 변경 (Error 1 - 3초 지연):</label>
              <select value={target.routeId || ''} onChange={(e) => {
                const r = routesList.find(x => x.id === e.target.value);
                setSelectedParcel({ ...target, routeId: e.target.value, routeName: r?.routeName || '' });
              }}>
                {routesList.map(r => <option key={r.id} value={r.id}>{r.routeName}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>배송 상태 변경 (0.1초 완료):</label>
              <select value={target.status || 'DELIVERING'} onChange={(e) => setSelectedParcel({ ...target, status: e.target.value })}>
                <option value="REGISTERED">접수 (REGISTERED)</option>
                <option value="SORTING">분류중 (SORTING)</option>
                <option value="TRANSIT">이동중 (TRANSIT)</option>
                <option value="DELIVERING">배달중 (DELIVERING)</option>
                <option value="COMPLETED">완료 (COMPLETED)</option>
                <option value="RETURNED">반송 (RETURNED)</option>
                <option value="HOLD">보류 (HOLD)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerRouteStatusRace(target.id, target)}>
              경로 변경 + 즉시 배달중 변경 (Error 1)
            </button>
            <small className="warn-desc">* 경로 변경(3초 지연 완료) 직후 상태 변경(0.1초 완료) 시, 3초 뒤 경로 변경이 구 DB 스냅샷으로 배송 상태를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerReturnCompleteConflict(target.id)}>
                ⚡ 반송 처리 후 배송 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 반송 처리(0.5초 완료) 직후 배송 완료(4초 지연 완료) 시, 반송된 우편물이 COMPLETED(완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 우편물을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 수취인 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>수취인 이름:</label>
              <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>수취인 연락처 (부분 저장 미반영):</label>
              <input type="text" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>배송 주소:</label>
              <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, recipientName, recipientPhone, deliveryAddress)}>
              수취인 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/연락처/배송주소 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 우편물을 선택하세요.</div>}
      </div>
    </aside>
  );
}
