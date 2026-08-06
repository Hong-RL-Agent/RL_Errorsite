import React, { useState } from 'react';

export default function CenterSection({ orders, counters, passengers, products, pickupLogs, activityLogs, deletePickupLog, testUnauthorizedCompletePickup }) {
  const [activeTab, setActiveTab] = useState('ORDERS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'ORDERS' ? 'active' : ''}`} onClick={() => setActiveTab('ORDERS')}>🛍️ 면세품 주문 (70개)</button>
        <button className={`tab-btn ${activeTab === 'COUNTERS' ? 'active' : ''}`} onClick={() => setActiveTab('COUNTERS')}>🏬 픽업 카운터 배치</button>
        <button className={`tab-btn ${activeTab === 'PASSENGERS' ? 'active' : ''}`} onClick={() => setActiveTab('PASSENGERS')}>✈️ 승객 & 여권 정보</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 픽업 & 감사 이력</button>
      </div>

      {activeTab === 'ORDERS' && (
        <div className="widget-section">
          <h2>🛍️ DutyPickup 공항 면세품 픽업 통합 관제 대장 (70개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>주문ID</th><th>주문코드</th><th>승객명</th><th>여권 영문명</th><th>탑승 항공편</th><th>배정 인도장 카운터</th><th>출국 시각</th><th>면세품 항목</th><th>수량</th><th>금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id}>
                    <td><strong>{ord.id}</strong></td>
                    <td><small>{ord.orderCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ord.passengerName}</strong></td>
                    <td><small>{ord.passportEnglishName}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{ord.flightNo}</small></td>
                    <td><span className="counter-badge">{ord.counterName}</span></td>
                    <td><small>{ord.departureTime}</small></td>
                    <td><small>{ord.productName}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ord.itemQuantity}개</strong></td>
                    <td><strong>${ord.totalPriceUsd}</strong></td>
                    <td><span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'COUNTERS' && (
        <div className="widget-section">
          <h2>🏬 인천/김포/김해 공항 면세품 픽업 카운터 배치 현황</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>카운터ID</th><th>인도장 카운터명</th><th>터미널 위치</th><th>최대 인도 처리용량</th><th>현재 인도 중 수량</th><th>상태</th></tr>
              </thead>
              <tbody>
                {counters.map(ctr => (
                  <tr key={ctr.id}>
                    <td><strong>{ctr.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ctr.counterName}</strong></td>
                    <td><small>{ctr.terminal}</small></td>
                    <td><small>{ctr.capacity}건</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ctr.currentProcessing}건 인도 중</strong></td>
                    <td><span className={`status-badge ${ctr.status.toLowerCase()}`}>{ctr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PASSENGERS' && (
        <div className="widget-section">
          <h2>✈️ 출국 승객 & 여권 본인확인 명단 (60명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>승객ID</th><th>승객 코드</th><th>승객 성명</th><th>여권 영문 성명</th><th>출국 항공편</th><th>출국 예정 일시</th><th>총 면세 주문</th></tr>
              </thead>
              <tbody>
                {passengers.map(psg => (
                  <tr key={psg.id}>
                    <td><strong>{psg.id}</strong></td>
                    <td><small>{psg.passengerCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{psg.passengerName}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{psg.passportEnglishName}</small></td>
                    <td><small>{psg.flightNo}</small></td>
                    <td><small>{psg.departureTime}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{psg.totalOrders}건</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 현장 바코드 스캔 및 인도 서명 픽업 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>픽업로그ID</th><th>주문ID</th><th>승객명</th><th>인도장 카운터</th><th>인도 수량 및 검수 내역</th><th>픽업 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {pickupLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.ordId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.passengerName}</strong></td>
                    <td><small>{log.counterName}</small></td>
                    <td><small>{log.itemSummary}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.pickupTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deletePickupLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 픽업 로그 삭제 시 목록에서는 소거되나 카운터별 처리량, 상품별 준비율, 시간대별 픽업률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 공항 인도장 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>주문ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.ordId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompletePickup('ORD-5001')}>🔒 권한 없는 직원의 픽업 완료 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 픽업 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
