import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedSchedule, setSelectedSchedule, schedules, volunteers, districts, triggerStatusVolunteerRace, triggerCancelReportConflict, triggerPartialSave }) {
  const [volName, setVolName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedDistrictId, setAssignedDistrictId] = useState('DIS-01');

  const target = selectedSchedule || schedules[0];

  useEffect(() => {
    if (target) {
      const vol = volunteers.find(v => v.id === target.assignedVolunteerId) || volunteers[0];
      if (vol) {
        setVolName(vol.name || '');
        setPhone(vol.phone || '');
        setAssignedDistrictId(vol.assignedDistrictId || 'DIS-01');
      }
    }
  }, [target, volunteers]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🚩 행사 일정 상세 & 봉사자 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>일정 제목: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.title}</strong></p>
            <p>지역구: <strong>{target.districtName}</strong> | 장소: <strong>{target.location}</strong></p>
            <p>일시: <strong>{target.eventDate} ({target.startTime}~{target.endTime})</strong></p>
            <p>필요 인원: <strong style={{ color: 'var(--color-dark)' }}>{target.requiredCount}명</strong></p>
            <p>담당 봉사자: <strong style={{ color: 'var(--color-success)' }}>{target.assignedVolunteerName}</strong></p>
            <p>상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>담당 봉사자 변경 (0.1초 완료):</label>
              <select value={target.assignedVolunteerId || ''} onChange={(e) => {
                const v = volunteers.find(x => x.id === e.target.value);
                setSelectedSchedule({ ...target, assignedVolunteerId: e.target.value, assignedVolunteerName: v?.name || '' });
              }}>
                {volunteers.map(v => <option key={v.id} value={v.id}>{v.name} ({v.districtName})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>일정 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'CONFIRMED'} onChange={(e) => setSelectedSchedule({ ...target, status: e.target.value })}>
                <option value="DRAFT">초안 (DRAFT)</option>
                <option value="REVIEWING">검토중 (REVIEWING)</option>
                <option value="CONFIRMED">진행확정 (CONFIRMED)</option>
                <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                <option value="COMPLETED">진행완료 (COMPLETED)</option>
                <option value="CANCELLED">취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusVolunteerRace(target.id, target)}>
              진행확정 변경 + 즉시 봉사자 변경 (Error 1)
            </button>
            <small className="warn-desc">* 일정 상태 변경(3초 지연) 직후 봉사자 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 봉사자 배정을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelReportConflict(target.id)}>
                ⚡ 일정 취소 후 현장 보고 등록 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 일정 취소(0.5초 완료) 직후 현장 보고 등록(4초 지연 완료) 시, 취소된 일정이 COMPLETED(진행완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 일정을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 자원봉사자 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>봉사자 성명:</label>
              <input type="text" value={volName} onChange={(e) => setVolName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>담당 선거구:</label>
              <select value={assignedDistrictId} onChange={(e) => setAssignedDistrictId(e.target.value)}>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button className="save-btn" onClick={() => {
              const v = volunteers.find(x => x.id === target.assignedVolunteerId) || volunteers[0];
              if (v) triggerPartialSave(v.id, volName, phone, assignedDistrictId);
            }}>
              봉사자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 성명/연락처/담당선거구 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 봉사자를 선택하세요.</div>}
      </div>
    </aside>
  );
}
