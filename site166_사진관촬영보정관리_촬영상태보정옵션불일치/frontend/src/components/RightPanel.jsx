import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedReservation, setSelectedReservation, reservations, customers, triggerStatusOptionRace, triggerCancelDispatchConflict, triggerPartialSave }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('010-2222-8888');
  const [shootConcept, setShootConcept] = useState('프리미엄 쿨톤 메이크업 프로필');
  const [retouchOption, setRetouchOption] = useState('피부 톤업 & 윤곽 정밀 성형보정 (1:1 밀착)');

  const target = selectedReservation || reservations[0];
  const targetCustomer = customers.find(c => c.customerName === target?.customerName) || customers[0];

  useEffect(() => {
    if (target) {
      setRetouchOption(target.retouchOption || '피부 톤업 & 윤곽 정밀 성형보정 (1:1 밀착)');
    }
    if (targetCustomer) {
      setCustomerName(targetCustomer.customerName || '');
      setPhone(targetCustomer.phone || '010-2222-8888');
      setShootConcept(targetCustomer.shootConcept || '프리미엄 쿨톤 메이크업 프로필');
    }
  }, [target, targetCustomer]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📷 촬영 상태 & 보정 옵션 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>예약 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.rsvCode}</strong></p>
            <p>고객 성명: <strong>{target.customerName}</strong> ({target.phone})</p>
            <p>촬영 상품: <strong>{target.productName}</strong></p>
            <p>카테고리: <span className="category-badge">{target.productCategory}</span></p>
            <p>촬영 일시: <small>{target.shootDate}</small> | 결제금액: <strong style={{ color: 'var(--color-success)' }}>{target.priceWon?.toLocaleString()}원</strong></p>
            <p>현재 보정 옵션: <small style={{ color: 'var(--color-warning)' }}>{target.retouchOption}</small></p>
            <p>촬영 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>1:1 리터칭 보정 옵션 수정 (0.1초 완료):</label>
              <input type="text" value={retouchOption} onChange={(e) => setRetouchOption(e.target.value)} />
            </div>

            <div className="form-group">
              <label>촬영 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'SHOT_COMPLETED'} onChange={(e) => setSelectedReservation({ ...target, status: e.target.value })}>
                <option value="RESERVED">예약완료 (RESERVED)</option>
                <option value="SHOOTING">촬영중 (SHOOTING)</option>
                <option value="SHOT_COMPLETED">촬영완료 (SHOT_COMPLETED)</option>
                <option value="RETOUCHING">보정작업중 (RETOUCHING)</option>
                <option value="DELIVERED">출고완료 (DELIVERED)</option>
                <option value="CANCELLED">예약취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusOptionRace(target.id, target, retouchOption)}>
              촬영완료 변경 + 즉시 보정 옵션 수정 (Error 1)
            </button>
            <small className="warn-desc">* 촬영완료 변경(3초 지연) 직후 보정 옵션 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 보정 옵션을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelDispatchConflict(target.id)}>
                ⚡ 예약 취소 후 앨범 출고 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 앨범 출고(4초 지연 완료) 시, 취소된 예약이 DELIVERED(출고완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 촬영 예약을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 촬영 고객 정보 수정 (Error 8)</h3>
        {targetCustomer ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>고객 성명:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>선호 촬영 컨셉:</label>
              <input type="text" value={shootConcept} onChange={(e) => setShootConcept(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetCustomer.id, customerName, phone, shootConcept)}>
              고객 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 고객명/촬영컨셉/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 고객을 선택하세요.</div>}
      </div>
    </aside>
  );
}
