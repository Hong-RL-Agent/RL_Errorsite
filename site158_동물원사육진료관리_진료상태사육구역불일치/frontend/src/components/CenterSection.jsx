import React, { useState } from 'react';

export default function CenterSection({ animals, habitats, zookeepers, medicalRecords, feedingLogs, activityLogs, deleteFeedingLog, testUnauthorizedCompleteTreatment }) {
  const [activeTab, setActiveTab] = useState('ANIMALS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'ANIMALS' ? 'active' : ''}`} onClick={() => setActiveTab('ANIMALS')}>🦁 동물 개체 대장 (70마리)</button>
        <button className={`tab-btn ${activeTab === 'HABITATS' ? 'active' : ''}`} onClick={() => setActiveTab('HABITATS')}>🏞️ 사육 구역 & 환경</button>
        <button className={`tab-btn ${activeTab === 'ZOOKEEPERS' ? 'active' : ''}`} onClick={() => setActiveTab('ZOOKEEPERS')}>👨‍⚕️ 사육사 & 수의사</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 급여 & 감사 이력</button>
      </div>

      {activeTab === 'ANIMALS' && (
        <div className="widget-section">
          <h2>🦁 ZooCare 동물원 사육 개체 통합 대장 (70마리)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>동물ID</th><th>동물코드</th><th>동물 개체명 (종)</th><th>나이</th><th>현재 사육 구역</th><th>건강 등급</th><th>위험도</th><th>담당 사육사</th><th>등록일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {animals.map(anm => (
                  <tr key={anm.id}>
                    <td><strong>{anm.id}</strong></td>
                    <td><small>{anm.animalCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{anm.animalName} ({anm.species})</strong></td>
                    <td><small>{anm.ageYears}세</small></td>
                    <td><span className="habitat-badge">{anm.habitatZone}</span></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{anm.healthGrade}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{anm.riskLevel}</small></td>
                    <td><strong>{anm.zookeeperName}</strong></td>
                    <td><small>{anm.admitDate}</small></td>
                    <td><span className={`status-badge ${anm.status.toLowerCase()}`}>{anm.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HABITATS' && (
        <div className="widget-section">
          <h2>🏞️ 동물원 사육 구역 & 온습도 환경 현황 (20개 구역)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>구역ID</th><th>사육 구역명</th><th>수용 가능 개체 수</th><th>현재 사육 개체 수</th><th>적정 설정 온도</th><th>상태</th></tr>
              </thead>
              <tbody>
                {habitats.map(hbt => (
                  <tr key={hbt.id}>
                    <td><strong>{hbt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{hbt.habitatZone}</strong></td>
                    <td><small>{hbt.capacity}마리</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{hbt.currentAnimals}마리</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{hbt.temperatureC}°C</strong></td>
                    <td><span className={`status-badge ${hbt.status.toLowerCase()}`}>{hbt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ZOOKEEPERS' && (
        <div className="widget-section">
          <h2>👨‍⚕️ 동물원 전담 사육사 & 수의관 명단 (25명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>사육사ID</th><th>사육사 성명</th><th>연락처</th><th>전문 수의 / 사육 분야</th><th>담당 동물 개체 수</th><th>평점</th></tr>
              </thead>
              <tbody>
                {zookeepers.map(zkp => (
                  <tr key={zkp.id}>
                    <td><strong>{zkp.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{zkp.zookeeperName}</strong></td>
                    <td><small>{zkp.phone}</small></td>
                    <td><small>{zkp.specialty}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{zkp.assignedAnimals}마리 케어</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {zkp.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 동물 일일 급여 및 영양 투여 실시간 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>급여로그ID</th><th>동물ID</th><th>동물명</th><th>사육 구역명</th><th>급여 식단 및 영양제 내역</th><th>급여 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {feedingLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.anmId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.animalName}</strong></td>
                    <td><small>{log.habitatZone}</small></td>
                    <td><small>{log.foodItem}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.feedTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteFeedingLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 급여 로그 삭제 시 목록에서는 소거되나 종별 급여량, 구역별 건강위험도, 사육사별 처리량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 동물원 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>동물ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.anmId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompleteTreatment('ANM-3001')}>🔒 권한 없는 직원의 치료 완료 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 치료 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
