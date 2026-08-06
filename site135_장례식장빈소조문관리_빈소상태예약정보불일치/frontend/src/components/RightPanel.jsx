import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedAltar, setSelectedAltar, altars, reservations, triggerStatusScheduleRace, triggerCancelGuideConflict, triggerPartialSave }) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [requests, setRequests] = useState('');
  const [scheduleText, setScheduleText] = useState('2026-08-04 입실 ➔ 08-06 07:00 발인');
  const [visitorGroup, setVisitorGroup] = useState('대한상공회의소 임직원 조문단');
  const [visitorCount, setVisitorCount] = useState(45);

  const target = selectedAltar || altars[0];
  const targetRes = reservations.find(r => r.altarNo === target?.altarNo) || reservations[0];

  useEffect(() => {
    if (targetRes) {
      setScheduleText(targetRes.scheduleText || '2026-08-04 입실 ➔ 08-06 07:00 발인');
      setClientName(targetRes.clientName || '');
      setPhone(targetRes.phone || '');
      setRequests(targetRes.requests || '');
    }
  }, [targetRes]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🏛️ 빈소 상태 & 장례 일정 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>빈소 호수: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.altarNo}</strong> ({target.size})</p>
            <p>고인 성함: <strong style={{ fontSize: '0.88rem' }}>{target.deceasedName}</strong> | 상주: <strong>{target.chiefMourner}</strong></p>
            <p>입실 일시: <small>{target.entryDate}</small> | 발인: <small style={{ color: 'var(--color-success)' }}>{target.funeralDate}</small></p>
            <p>빈소 이용 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>장례 일정 문구 수정 (0.1초 완료):</label>
              <input type="text" value={scheduleText} onChange={(e) => setScheduleText(e.target.value)} />
            </div>

            <div className="form-group">
              <label>빈소 이용 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_USE'} onChange={(e) => setSelectedAltar({ ...target, status: e.target.value })}>
                <option value="VACANT">빈소대기 (VACANT)</option>
                <option value="IN_USE">사용중 (IN_USE)</option>
                <option value="GUIDING">안내중 (GUIDING)</option>
                <option value="CLEANING">정리중 (CLEANING)</option>
                <option value="CANCELLED">예약취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusScheduleRace(targetRes?.id || target.id, target, scheduleText)}>
              사용중 변경 + 즉시 일정 변경 (Error 1)
            </button>
            <small className="warn-desc">* 사용중 변경(3초 지연) 직후 일정 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 일정을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <div className="form-group">
                <label>조문 단체 및 방문자 수:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={visitorGroup} onChange={(e) => setVisitorGroup(e.target.value)} placeholder="조문 단체명" />
                  <input type="number" value={visitorCount} onChange={(e) => setVisitorCount(e.target.value)} style={{ width: '80px' }} />
                </div>
              </div>
              <button className="cancel-work-btn" onClick={() => triggerCancelGuideConflict(targetRes?.id || target.id, visitorGroup, visitorCount)}>
                ⚡ 예약 취소 후 조문객 안내 등록 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 예약 취소(0.5초 완료) 직후 조문객 안내 등록(4초 지연 완료) 시, 취소된 예약이 GUIDING(안내중)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 빈소를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 상주/예약자 정보 수정 (Error 8)</h3>
        {targetRes ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>신청 상주/예약자 성명:</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>의전 요청사항:</label>
              <input type="text" value={requests} onChange={(e) => setRequests(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetRes.id, clientName, phone, requests)}>
              상주 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/연락처/요청사항 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 상주 정보를 선택하세요.</div>}
      </div>
    </aside>
  );
}
