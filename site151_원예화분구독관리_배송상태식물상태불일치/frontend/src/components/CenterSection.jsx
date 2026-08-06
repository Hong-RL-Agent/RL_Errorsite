import React, { useState } from 'react';

export default function CenterSection({ subscribers, plants, deliveries, healthLogs, replacements, activityLogs, deleteHealthLog, testUnauthorizedApproveReplacement }) {
  const [activeTab, setActiveTab] = useState('SUBSCRIBERS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'SUBSCRIBERS' ? 'active' : ''}`} onClick={() => setActiveTab('SUBSCRIBERS')}>🪴 구독 고객 (50명)</button>
        <button className={`tab-btn ${activeTab === 'PLANTS' ? 'active' : ''}`} onClick={() => setActiveTab('PLANTS')}>🌿 등록 식물 (60개)</button>
        <button className={`tab-btn ${activeTab === 'DELIVERIES' ? 'active' : ''}`} onClick={() => setActiveTab('DELIVERIES')}>🚚 배송 & 교체 (55/35건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 건강도 & 감사 이력</button>
      </div>

      {activeTab === 'SUBSCRIBERS' && (
        <div className="widget-section">
          <h2>🪴 PlantSub 프리미엄 화분 정기 구독 고객 대장 (50명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>구독ID</th><th>구독코드</th><th>구독 고객명</th><th>구독 화분 식물명</th><th>식물 유형</th><th>배송지 주소</th><th>식물 건강 상태</th><th>배송일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub.id}>
                    <td><strong>{sub.id}</strong></td>
                    <td><small>{sub.subCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sub.subscriberName}</strong></td>
                    <td><strong>{sub.plantName}</strong></td>
                    <td><span className="plant-badge">{sub.plantType}</span></td>
                    <td><small>{sub.deliveryAddress}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{sub.healthStatus}</strong></td>
                    <td><small>{sub.deliveryDate}</small></td>
                    <td><span className={`status-badge ${sub.status.toLowerCase()}`}>{sub.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PLANTS' && (
        <div className="widget-section">
          <h2>🌿 원예 화분 식물 품종 및 생육 정보 (60개 품종)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>식물ID</th><th>식물 명칭</th><th>식물 카테고리</th><th>권장 물주기 주기</th><th>햇빛 적정 등급</th><th>상태</th></tr>
              </thead>
              <tbody>
                {plants.map(plt => (
                  <tr key={plt.id}>
                    <td><strong>{plt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{plt.plantName}</strong></td>
                    <td><span className="plant-badge">{plt.plantType}</span></td>
                    <td><small>{plt.waterCycle}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{plt.sunlightGrade}</small></td>
                    <td><span className={`status-badge ${plt.status.toLowerCase()}`}>{plt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DELIVERIES' && (
        <div className="widget-section">
          <h2>🚚 화분 정기 배송 및 교체 신청 현황 (55건 배송 / 35건 교체)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>배송ID</th><th>구독ID</th><th>구독자 성명</th><th>배송 식물명</th><th>담당 배송원</th><th>출하 시각</th><th>상태</th></tr>
              </thead>
              <tbody>
                {deliveries.map(del => (
                  <tr key={del.id}>
                    <td><strong>{del.id}</strong></td>
                    <td>{del.subId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{del.subscriberName}</strong></td>
                    <td>{del.plantName}</td>
                    <td><small>{del.courierName}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{del.dispatchTime}</small></td>
                    <td><span className={`status-badge ${del.status.toLowerCase()}`}>{del.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🪴 화분 교체 요청 신청서 (35건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>교체ID</th><th>구독ID</th><th>신청 고객명</th><th>교체 사유 및 식물 상태</th><th>신청일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {replacements.map(rep => (
                  <tr key={rep.id}>
                    <td><strong>{rep.id}</strong></td>
                    <td>{rep.subId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rep.subscriberName}</strong></td>
                    <td><small>{rep.reason}</small></td>
                    <td><small>{rep.requestDate}</small></td>
                    <td><span className={`status-badge ${rep.status.toLowerCase()}`}>{rep.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 식물 건강도 진단 & 잎 활력 상태 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>진단로그ID</th><th>구독ID</th><th>식물명</th><th>고객명</th><th>잎 상태 및 발아 현황</th><th>수분 수치</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {healthLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.subId}</td>
                    <td><small>{log.plantName}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.subscriberName}</strong></td>
                    <td><small>{log.leafStatus}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.moistureLevel}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteHealthLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 식물 상태 로그 삭제 시 목록에서는 소거되나 식물별 건강도, 고객별 교체율, 월별 배송 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 원예 화분 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>구독ID</th><th>담당 원예사</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.subId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApproveReplacement('SUB-6001')}>🔒 권한 없는 직원의 화분 교체 승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 교체 승인 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
