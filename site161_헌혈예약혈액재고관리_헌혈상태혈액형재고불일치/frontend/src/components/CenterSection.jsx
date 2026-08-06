import React, { useState } from 'react';

export default function CenterSection({ reservations, centers, donors, questionnaires, bloodLogs, activityLogs, deleteBloodLog, testUnauthorizedCompleteDonation }) {
  const [activeTab, setActiveTab] = useState('RESERVATIONS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'RESERVATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('RESERVATIONS')}>🩸 헌혈 예약 (60건)</button>
        <button className={`tab-btn ${activeTab === 'CENTERS' ? 'active' : ''}`} onClick={() => setActiveTab('CENTERS')}>🏥 헌혈 센터 현황</button>
        <button className={`tab-btn ${activeTab === 'DONORS' ? 'active' : ''}`} onClick={() => setActiveTab('DONORS')}>🙋‍♂️ 헌혈자 & 혈액형</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 재고 & 감사 이력</button>
      </div>

      {activeTab === 'RESERVATIONS' && (
        <div className="widget-section">
          <h2>🩸 BloodReserve 헌혈 예약 및 채혈 관제 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>예약코드</th><th>헌혈자 성명</th><th>혈액형</th><th>배정 헌혈 센터</th><th>예약 시각</th><th>헌혈 구분</th><th>센터 재고 수량</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reservations.map(rsv => (
                  <tr key={rsv.id}>
                    <td><strong>{rsv.id}</strong></td>
                    <td><small>{rsv.rsvCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rsv.donorName}</strong></td>
                    <td><span className="center-badge">{rsv.bloodType}</span></td>
                    <td><small>{rsv.centerName}</small></td>
                    <td><small>{rsv.reservationTime}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{rsv.donationType}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{rsv.bloodStockUnits}팩</strong></td>
                    <td><span className={`status-badge ${rsv.status.toLowerCase()}`}>{rsv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CENTERS' && (
        <div className="widget-section">
          <h2>🏥 전국 헌혈 센터 & 일일 채혈 수용 현황 (10개 센터)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>센터ID</th><th>헌혈 센터명</th><th>소재지 구역</th><th>일일 최대 수용인원</th><th>금일 현재 진행인원</th><th>상태</th></tr>
              </thead>
              <tbody>
                {centers.map(ctr => (
                  <tr key={ctr.id}>
                    <td><strong>{ctr.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ctr.centerName}</strong></td>
                    <td><small>{ctr.region}</small></td>
                    <td><small>{ctr.dailyCapacity}명</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ctr.currentDonations}명 진행</strong></td>
                    <td><span className={`status-badge ${ctr.status.toLowerCase()}`}>{ctr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DONORS' && (
        <div className="widget-section">
          <h2>🙋‍♂️ 등록 헌혈자 명단 & 누적 헌혈 횟수 (70명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>헌혈자ID</th><th>헌혈자 코드</th><th>성명</th><th>연락처</th><th>혈액형</th><th>누적 헌혈 횟수</th><th>건강 상태</th></tr>
              </thead>
              <tbody>
                {donors.map(dnr => (
                  <tr key={dnr.id}>
                    <td><strong>{dnr.id}</strong></td>
                    <td><small>{dnr.donorCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{dnr.donorName}</strong></td>
                    <td><small>{dnr.phone}</small></td>
                    <td><span className="center-badge">{dnr.bloodType}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{dnr.totalDonations}회</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{dnr.healthStatus}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>📋 사전 문진 판정 기록 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>문진ID</th><th>예약ID</th><th>헌혈자명</th><th>의사/간호사 문진 소견</th><th>문진 일시</th><th>판정 상태</th></tr>
              </thead>
              <tbody>
                {questionnaires.map(qst => (
                  <tr key={qst.id}>
                    <td><strong>{qst.id}</strong></td>
                    <td>{qst.rsvId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{qst.donorName}</strong></td>
                    <td><small>{qst.doctorComment}</small></td>
                    <td><small>{qst.screenDate}</small></td>
                    <td><span className={`status-badge ${qst.status.toLowerCase()}`}>{qst.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 혈액형별 채혈 팩 입고 및 보관 실시간 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>재고로그ID</th><th>예약ID</th><th>혈액형</th><th>센터명</th><th>채혈 팩 세부 내역</th><th>입고 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {bloodLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rsvId}</td>
                    <td><span className="center-badge">{log.bloodType}</span></td>
                    <td><small>{log.centerName}</small></td>
                    <td><small>{log.unitPacks}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.logTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteBloodLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 재고 로그 삭제 시 목록에서는 소거되나 혈액형별 보유량, 센터별 헌혈 수, 월별 헌혈 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 혈액원 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rsvId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompleteDonation('RSV-6001')}>🔒 권한 없는 직원의 헌혈 완료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 헌혈 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
