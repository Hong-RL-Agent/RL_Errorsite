import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedMember, setSelectedMember, members, lanes, triggerStatusLaneRace, triggerCancelAttendanceConflict, triggerPartialSave }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('상급 (ADVANCED)');
  const [laneNo, setLaneNo] = useState('1번 레인 (수심 1.5m / 25m)');

  const target = selectedMember || members[0];

  useEffect(() => {
    if (target) {
      setName(target.name || '');
      setPhone(target.phone || '');
      setLevel(target.level || '상급 (ADVANCED)');
      setLaneNo(target.laneNo || '1번 레인 (수심 1.5m / 25m)');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🏊 강습 상태 & 레인 배정 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>회원 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.mbCode}</strong></p>
            <p>회원 성명: <strong style={{ fontSize: '0.85rem' }}>{target.name}</strong></p>
            <p>수강 강습반: <strong>{target.className}</strong> ({target.level})</p>
            <p>배정 레인: <span className="lane-badge">{target.laneNo}</span> | 담당: <strong>{target.instructor}</strong></p>
            <p>출석률: <strong style={{ color: 'var(--color-success)' }}>{target.attendanceRatePercent}%</strong> | 등록: <small>{target.regDate}</small></p>
            <p>강습 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>배정 레인 변경 (0.1초 완료):</label>
              <select value={laneNo} onChange={(e) => setLaneNo(e.target.value)}>
                {lanes.map(l => <option key={l.id} value={l.laneNo}>{l.laneNo}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>강습 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'IN_PROGRESS'} onChange={(e) => setSelectedMember({ ...target, status: e.target.value })}>
                <option value="OPEN">접수중 (OPEN)</option>
                <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                <option value="ATTENDED">출석완료 (ATTENDED)</option>
                <option value="COMPLETED">종료됨 (COMPLETED)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusLaneRace(target.id, target, laneNo)}>
              진행중 변경 + 즉시 레인 변경 (Error 1)
            </button>
            <small className="warn-desc">* 진행중 변경(3초 지연) 직후 레인 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 레인을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelAttendanceConflict(target.id)}>
                ⚡ 강습 취소 후 출석 처리 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 강습 취소(0.5초 완료) 직후 출석 처리(4초 지연 완료) 시, 취소된 강습이 ATTENDED(출석완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 회원을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 회원 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>회원 성명:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>강습 레벨:</label>
              <input type="text" value={level} onChange={(e) => setLevel(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, name, phone, level)}>
              회원 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/강습레벨/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 회원을 선택하세요.</div>}
      </div>
    </aside>
  );
}
