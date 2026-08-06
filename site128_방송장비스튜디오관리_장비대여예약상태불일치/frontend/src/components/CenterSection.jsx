import React, { useState } from 'react';

export default function CenterSection({ gears, studios, reservations, rentalLogs, activityLogs, deleteRentalLog, testUnauthorizedDispose }) {
  const [activeTab, setActiveTab] = useState('GEARS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'GEARS' ? 'active' : ''}`} onClick={() => setActiveTab('GEARS')}>📹 장비 대장 (50개)</button>
        <button className={`tab-btn ${activeTab === 'STUDIOS' ? 'active' : ''}`} onClick={() => setActiveTab('STUDIOS')}>🎙️ 스튜디오 (12개)</button>
        <button className={`tab-btn ${activeTab === 'RESERVATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('RESERVATIONS')}>📅 예약 타임라인 (45건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🛠️ 대여 & 정비 로그</button>
      </div>

      {activeTab === 'GEARS' && (
        <div className="widget-section">
          <h2>📹 StudioGear 방송 장비 자산 관제 대장 (50개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>장비ID</th><th>방송 장비 명칭</th><th>장비 카테고리</th><th>보관 위치</th><th>일일 대여료</th><th>가동 사용률</th><th>최근 점검일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {gears.map(ger => (
                  <tr key={ger.id}>
                    <td><strong>{ger.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ger.gearName}</strong></td>
                    <td><span className="cat-badge">{ger.category}</span></td>
                    <td><small>{ger.location}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ger.dailyFeeWon.toLocaleString()}원</strong></td>
                    <td><strong>{ger.utilizationRate}%</strong></td>
                    <td><small>{ger.inspectionDate}</small></td>
                    <td><span className={`status-badge ${ger.status.toLowerCase()}`}>{ger.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STUDIOS' && (
        <div className="widget-section">
          <h2>🎙️ 방송 제작 스튜디오 시설 현황 (12개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>스튜디오ID</th><th>스튜디오 명칭</th><th>위치 층수</th><th>최대 수용인원</th><th>시간당 이용료</th></tr>
              </thead>
              <tbody>
                {studios.map(std => (
                  <tr key={std.id}>
                    <td><strong>{std.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{std.name}</strong></td>
                    <td><small>{std.floor}</small></td>
                    <td>{std.maxCapacity}명</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{std.hourlyRateWon.toLocaleString()}원</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RESERVATIONS' && (
        <div className="widget-section">
          <h2>📅 방송 스튜디오 장비 예약 타임라인 (45건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>장비 명칭</th><th>예약 사용자/제작국</th><th>사용 스튜디오</th><th>예약 날짜</th><th>예약 시간대</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reservations.map(resv => (
                  <tr key={resv.id}>
                    <td><strong>{resv.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{resv.gearName}</strong></td>
                    <td><strong>{resv.userName}</strong></td>
                    <td><small>{resv.studioName}</small></td>
                    <td><small>{resv.reserveDate}</small></td>
                    <td><strong style={{ color: 'var(--color-dark)' }}>{resv.startTime} ~ {resv.endTime}</strong></td>
                    <td><span className={`status-badge ${resv.status.toLowerCase()}`}>{resv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🛠️ 장비 대여 반납 & 점검 검수 로그 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>대여 장비명</th><th>대여 PD/엔지니어</th><th>출고 시간</th><th>반납 시간</th><th>반납 점검 의견</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {rentalLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.gearName}</strong></td>
                    <td><small>{log.userName}</small></td>
                    <td><small>{log.checkoutTime}</small></td>
                    <td><small>{log.returnTime}</small></td>
                    <td><small>{log.checkNotes}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteRentalLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 대여 로그 삭제 시 목록에서는 소거되나 장비별 사용률 및 스튜디오별 예약률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 방송 제작 기술 운영 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.reservationId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedDispose('GER-1001')}>🔒 권한 없는 직원의 방송 장비 강제 폐기 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 장비 폐기 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
