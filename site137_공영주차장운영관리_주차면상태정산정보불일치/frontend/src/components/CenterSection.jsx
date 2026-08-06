import React, { useState } from 'react';

export default function CenterSection({ parkingSpaces, parkingRecords, settlements, activityLogs, deleteSettlement, testUnauthorizedCancel }) {
  const [activeTab, setActiveTab] = useState('SPACES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'SPACES' ? 'active' : ''}`} onClick={() => setActiveTab('SPACES')}>🅿️ 주차면 배치도 (120면)</button>
        <button className={`tab-btn ${activeTab === 'RECORDS' ? 'active' : ''}`} onClick={() => setActiveTab('RECORDS')}>🚘 입출차 대장 (80건)</button>
        <button className={`tab-btn ${activeTab === 'SETTLEMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('SETTLEMENTS')}>💳 정산 내역 (60건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 관제 감사 이력</button>
      </div>

      {activeTab === 'SPACES' && (
        <div className="widget-section">
          <h2>🅿️ ParkControl 주차장별 주차면 실시간 유도 배치도 (120면)</h2>
          <div className="space-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem', marginTop: '0.75rem', maxHeight: '350px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            {parkingSpaces.map(spc => (
              <div key={spc.id} className={`space-grid-cell ${spc.status.toLowerCase()}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--color-dark)' }}>{spc.spaceNo}</strong>
                  <span className={`status-badge ${spc.status.toLowerCase()}`}>{spc.status}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>{spc.carNo || '빈 주차면'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text)' }}>구분: {spc.spaceType}</div>
                <div style={{ fontSize: '0.58rem', color: 'var(--color-muted)' }}>{spc.lotName.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'RECORDS' && (
        <div className="widget-section">
          <h2>🚘 공영주차장 차량 입출차 & 요금 대장 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>입출차ID</th><th>코드</th><th>주차장명</th><th>주차면</th><th>차량번호</th><th>차종</th><th>입차시각</th><th>출차시각</th><th>정산요금</th><th>상태</th></tr>
              </thead>
              <tbody>
                {parkingRecords.map(rec => (
                  <tr key={rec.id}>
                    <td><strong>{rec.id}</strong></td>
                    <td><small>{rec.recCode}</small></td>
                    <td><small>{rec.lotName}</small></td>
                    <td><span className="space-no-badge">{rec.spaceNo}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rec.carNo}</strong></td>
                    <td><small>{rec.carType}</small></td>
                    <td><small>{rec.inTime}</small></td>
                    <td><small>{rec.outTime}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{rec.feeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${rec.status.toLowerCase()}`}>{rec.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SETTLEMENTS' && (
        <div className="widget-section">
          <h2>💳 무인 정산기 & 신용카드 정산 로그 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>정산ID</th><th>기록ID</th><th>차량번호</th><th>주차장명</th><th>감면 혜택</th><th>정산금액</th><th>정산시각</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {settlements.map(stl => (
                  <tr key={stl.id}>
                    <td><strong>{stl.id}</strong></td>
                    <td>{stl.recId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{stl.carNo}</strong></td>
                    <td><small>{stl.lotName}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{stl.discountType}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{stl.feeWon.toLocaleString()}원</strong></td>
                    <td><small>{stl.settleTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteSettlement(stl.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 정산 로그 삭제 시 목록에서는 소거되나 주차장별 매출, 회전율, 미납 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 관제 센터 시스템 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>기록ID</th><th>담당 관제원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.recId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCancel('SET-3001')}>🔒 권한 없는 직원의 정산 취소 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 정산 취소 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
