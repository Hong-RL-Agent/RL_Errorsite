import React, { useState } from 'react';

export default function CenterSection({ scenes, actors, locations, filmingLogs, activityLogs, deleteFilmingLog, testUnauthorizedComplete }) {
  const [activeTab, setActiveTab] = useState('SCENES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'SCENES' ? 'active' : ''}`} onClick={() => setActiveTab('SCENES')}>🎬 장면 대장 (60건)</button>
        <button className={`tab-btn ${activeTab === 'ACTORS' ? 'active' : ''}`} onClick={() => setActiveTab('ACTORS')}>🎭 출연 배우 (25명)</button>
        <button className={`tab-btn ${activeTab === 'LOCATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('LOCATIONS')}>📍 로케이션 세트 (20개)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🎥 촬영 & 감사 이력</button>
      </div>

      {activeTab === 'SCENES' && (
        <div className="widget-section">
          <h2>🎬 FilmBoard 영화 제작 장면(Scene) 시나리오 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>장면ID</th><th>씬 번호</th><th>장면 콘티 명칭</th><th>촬영 예정일</th><th>로케이션 세트장</th><th>주요 출연 배우</th><th>배우 콜타임/스케줄</th><th>중요도</th><th>상태</th></tr>
              </thead>
              <tbody>
                {scenes.map(scn => (
                  <tr key={scn.id}>
                    <td><strong>{scn.id}</strong></td>
                    <td><span className="scene-no-badge">{scn.sceneNo}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{scn.sceneName}</strong></td>
                    <td><small>{scn.shootDate}</small></td>
                    <td><small>{scn.location}</small></td>
                    <td><strong>{scn.actorName}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{scn.actorSchedule}</small></td>
                    <td><small>{scn.importance}</small></td>
                    <td><span className={`status-badge ${scn.status.toLowerCase()}`}>{scn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ACTORS' && (
        <div className="widget-section">
          <h2>🎭 주요 캐스팅 출연 배우 & 콜타임 스케줄 (25명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>배우ID</th><th>배우 성명</th><th>담당 극중 배역</th><th>소속 기획사</th><th>현장 콜타임</th><th>출연 확정 상태</th></tr>
              </thead>
              <tbody>
                {actors.map(act => (
                  <tr key={act.id}>
                    <td><strong>{act.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{act.actorName}</strong></td>
                    <td><strong>{act.roleName}</strong></td>
                    <td><small>{act.agency}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{act.callTime}</strong></td>
                    <td><span className={`status-badge ${act.status.toLowerCase()}`}>{act.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOCATIONS' && (
        <div className="widget-section">
          <h2>📍 야외 로케이션 & 촬영 세트장 현황 (20개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>세트ID</th><th>로케이션/세트장 명칭</th><th>상세 주소</th><th>일일 대관료</th><th>촬영 허가 상태</th></tr>
              </thead>
              <tbody>
                {locations.map(loc => (
                  <tr key={loc.id}>
                    <td><strong>{loc.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{loc.locationName}</strong></td>
                    <td><small>{loc.address}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{loc.rentalFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${loc.permissionStatus.toLowerCase()}`}>{loc.permissionStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🎥 실시간 현장 촬영 테이크(Take) 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>장면ID</th><th>촬영 장면명</th><th>총 테이크 수</th><th>누적 촬영시간</th><th>현장 스크립트 특이사항</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {filmingLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.sceneId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.sceneName}</strong></td>
                    <td><strong>{log.takeCount}Take</strong></td>
                    <td><small>{log.filmingTimeMinutes}분</small></td>
                    <td><small>{log.notes}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteFilmingLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 촬영 로그 삭제 시 목록에서는 소거되나 배우별 촬영 시간 및 로케이션 사용률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 영화 제작 프로덕션 운영 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>장면ID</th><th>담당 연출자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.sceneId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedComplete('SCN-1001')}>🔒 권한 없는 스태프의 촬영 완료 강제 승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 촬영 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
