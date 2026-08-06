import React, { useState } from 'react';

export default function CenterSection({ reservations, designers, clients, visitLogs, activityLogs, deleteVisitLog, testUnauthorizedRefund }) {
  const [activeTab, setActiveTab] = useState('RESERVATIONS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'RESERVATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('RESERVATIONS')}>📅 시술 예약 (55건)</button>
        <button className={`tab-btn ${activeTab === 'DESIGNERS' ? 'active' : ''}`} onClick={() => setActiveTab('DESIGNERS')}>💇‍♀️ 디자이너 프로필 (15명)</button>
        <button className={`tab-btn ${activeTab === 'CLIENTS' ? 'active' : ''}`} onClick={() => setActiveTab('CLIENTS')}>💆‍♀️ VIP 고객 명단 (45명)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📜 방문 로그 & 감사 이력</button>
      </div>

      {activeTab === 'RESERVATIONS' && (
        <div className="widget-section">
          <h2>📅 HairStudioPro 실시간 디자이너 시술 예약 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>예약코드</th><th>지점</th><th>담당 디자이너</th><th>고객 성함</th><th>선택 시술 옵션</th><th>예약시각</th><th>결제금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id}>
                    <td><strong>{res.id}</strong></td>
                    <td><small>{res.resCode}</small></td>
                    <td><span className="branch-badge">{res.branch}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{res.designerName}</strong></td>
                    <td><strong>{res.clientName}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{res.treatmentName}</small></td>
                    <td><small>{res.resTime}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{res.priceWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${res.status.toLowerCase()}`}>{res.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DESIGNERS' && (
        <div className="widget-section">
          <h2>💇‍♀️ 수석 헤어 디렉터 및 스타일리스트 대장 (15명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>디자이너ID</th><th>성명 / 직책</th><th>소속 지점</th><th>전문 시술 분야</th><th>고객 평점</th></tr>
              </thead>
              <tbody>
                {designers.map(dsg => (
                  <tr key={dsg.id}>
                    <td><strong>{dsg.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{dsg.name}</strong> <small>({dsg.title})</small></td>
                    <td><span className="branch-badge">{dsg.branch}</span></td>
                    <td><small>{dsg.specialty}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {dsg.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CLIENTS' && (
        <div className="widget-section">
          <h2>💆‍♀️ 지점별 VIP 및 로열티 고객 관리 명단 (45명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>고객ID</th><th>고객 성함</th><th>연락처</th><th>지정 선호 디자이너</th><th>VIP 등급</th><th>누적 방문 횟수</th></tr>
              </thead>
              <tbody>
                {clients.map(cli => (
                  <tr key={cli.id}>
                    <td><strong>{cli.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cli.clientName}</strong></td>
                    <td><small>{cli.phone}</small></td>
                    <td><strong>{cli.preferredDesigner}</strong></td>
                    <td><span className="branch-badge">{cli.vipGrade}</span></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cli.visitCount}회</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📜 실시간 고객 시술 방문 및 결제 완료 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>고객 성함</th><th>담당 디자이너</th><th>완료 시술 옵션</th><th>결제금액</th><th>방문시각</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {visitLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.resId}</td>
                    <td><strong>{log.clientName}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.designerName}</strong></td>
                    <td><small>{log.treatmentName}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{log.paidAmountWon.toLocaleString()}원</strong></td>
                    <td><small>{log.visitDate}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteVisitLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 방문 로그 삭제 시 목록에서는 소거되나 디자이너별 매출, 옵션별 선택률, 고객 재방문율 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 프리미엄 살롱 운영 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>예약ID</th><th>담당 직원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.resId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedRefund('RES-1001')}>🔒 권한 없는 직원의 시술 예약 환불 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 환불 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
