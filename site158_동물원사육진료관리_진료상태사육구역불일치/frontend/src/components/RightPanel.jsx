import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedAnimal, setSelectedAnimal, animals, habitats, triggerStatusHabitatRace, triggerCancelFeedingConflict, triggerPartialSave }) {
  const [animalName, setAnimalName] = useState('');
  const [ageYears, setAgeYears] = useState(7);
  const [healthGrade, setHealthGrade] = useState('A (우수)');
  const [habitatZone, setHabitatZone] = useState('아프리카 사바나 야생사육장');

  const target = selectedAnimal || animals[0];

  useEffect(() => {
    if (target) {
      setAnimalName(target.animalName || '');
      setAgeYears(target.ageYears || 7);
      setHealthGrade(target.healthGrade || 'A (우수)');
      setHabitatZone(target.habitatZone || '아프리카 사바나 야생사육장');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🐾 진료 상태 & 사육 구역 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>동물 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.animalCode}</strong></p>
            <p>종류: <strong>{target.species}</strong> | 이름: <strong>{target.animalName}</strong></p>
            <p>나이: <small>{target.ageYears}세</small> | 건강 등급: <strong style={{ color: 'var(--color-success)' }}>{target.healthGrade}</strong></p>
            <p>담당 사육사: <strong>{target.zookeeperName}</strong> | 입원/등록일: <small>{target.admitDate}</small></p>
            <p>현재 배정 사육 구역: <strong style={{ color: 'var(--color-warning)' }}>{target.habitatZone}</strong></p>
            <p>진료 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>사육 구역 변경 (0.1초 완료):</label>
              <select value={habitatZone} onChange={(e) => setHabitatZone(e.target.value)}>
                <option value="아프리카 사바나 야생사육장">아프리카 사바나 야생사육장</option>
                <option value="열대우림 유인원 특별관">열대우림 유인원 특별관</option>
                <option value="남극 펭귄 & 해양동물 수족관">남극 펭귄 & 해양동물 수족관</option>
                <option value="동물병원 특별 격리 입원실">동물병원 특별 격리 입원실</option>
              </select>
            </div>

            <div className="form-group">
              <label>진료 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'COMPLETED'} onChange={(e) => setSelectedAnimal({ ...target, status: e.target.value })}>
                <option value="NORMAL">정상사육 (NORMAL)</option>
                <option value="OBSERVING">관찰필요 (OBSERVING)</option>
                <option value="SCHEDULED">진료예약 (SCHEDULED)</option>
                <option value="IN_TREATMENT">치료중 (IN_TREATMENT)</option>
                <option value="COMPLETED">치료완료 (COMPLETED)</option>
                <option value="CANCELLED">취소/퇴원 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusHabitatRace(target.id, target, habitatZone)}>
              치료완료 변경 + 즉시 사육 구역 변경 (Error 1)
            </button>
            <small className="warn-desc">* 치료완료 변경(3초 지연) 직후 사육 구역 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 사육 구역을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelFeedingConflict(target.id)}>
                ⚡ 진료 취소 후 급여 기록 등록 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 진료 취소(0.5초 완료) 직후 급여 기록 등록(4초 지연 완료) 시, 취소된 진료가 OBSERVING(관찰필요)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 동물을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 동물 개체 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>동물 이름:</label>
              <input type="text" value={animalName} onChange={(e) => setAnimalName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>건강 등급:</label>
              <input type="text" value={healthGrade} onChange={(e) => setHealthGrade(e.target.value)} />
            </div>
            <div className="form-group">
              <label>나이 (부분 저장 미반영):</label>
              <input type="number" value={ageYears} onChange={(e) => setAgeYears(Number(e.target.value))} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, animalName, ageYears, healthGrade)}>
              동물 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/건강등급/나이 동시 수정 시 나이만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 동물을 선택하세요.</div>}
      </div>
    </aside>
  );
}
