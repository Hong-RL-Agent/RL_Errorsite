import React, { useState } from 'react';

export default function CenterSection({ orders, options, artisans, customers, craftLogs, activityLogs, deleteCraftLog, testUnauthorizedShipOrder }) {
  const [activeTab, setActiveTab] = useState('ORDERS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'ORDERS' ? 'active' : ''}`} onClick={() => setActiveTab('ORDERS')}>🛠️ 주문 제작 (60건)</button>
        <button className={`tab-btn ${activeTab === 'OPTIONS' ? 'active' : ''}`} onClick={() => setActiveTab('OPTIONS')}>🎨 커스텀 옵션 (40개)</button>
        <button className={`tab-btn ${activeTab === 'ARTISANS' ? 'active' : ''}`} onClick={() => setActiveTab('ARTISANS')}>👨‍🎨 장인 & 고객</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 공정 & 감사 이력</button>
      </div>

      {activeTab === 'ORDERS' && (
        <div className="widget-section">
          <h2>🛠️ CraftOrder 수제 공방 주문 제작 통합 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>주문ID</th><th>주문코드</th><th>옵션 유형</th><th>주문 상품명</th><th>고객명</th><th>선택 옵션 색상</th><th>담당 아티잔</th><th>제작 마감일</th><th>주문 금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id}>
                    <td><strong>{ord.id}</strong></td>
                    <td><small>{ord.orderCode}</small></td>
                    <td><span className="option-badge">{ord.optionType}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ord.productName}</strong></td>
                    <td><strong>{ord.customerName}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{ord.optionColor}</small></td>
                    <td><strong>{ord.artisanName}</strong></td>
                    <td><small>{ord.dueDate}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ord.orderPriceWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'OPTIONS' && (
        <div className="widget-section">
          <h2>🎨 핸드메이드 커스텀 옵션 명세 (40개 옵션)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>옵션ID</th><th>옵션 명칭</th><th>카테고리</th><th>기본 색상 / 마감</th><th>옵션 추가비</th><th>상태</th></tr>
              </thead>
              <tbody>
                {options.map(opt => (
                  <tr key={opt.id}>
                    <td><strong>{opt.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{opt.optionName}</strong></td>
                    <td><span className="option-badge">{opt.optionType}</span></td>
                    <td><small>{opt.optionColor}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>+{opt.extraCostWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${opt.status.toLowerCase()}`}>{opt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ARTISANS' && (
        <div className="widget-section">
          <h2>👨‍🎨 공방 전문 루티어 & 아티잔 장인 현황 (15명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>아티잔ID</th><th>아티잔 성명</th><th>연락처</th><th>전문 수제 공예 분야</th><th>현재 담당 제작 건수</th><th>평점</th></tr>
              </thead>
              <tbody>
                {artisans.map(art => (
                  <tr key={art.id}>
                    <td><strong>{art.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{art.artisanName}</strong></td>
                    <td><small>{art.phone}</small></td>
                    <td><small>{art.specialty}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{art.assignedOrders}건 제작</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {art.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🛍️ 수제 커스텀 주문 고객 명단 (45명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>고객ID</th><th>고객 성명</th><th>연락처</th><th>선택 옵션 색상</th><th>배송 요청 메모</th><th>누적 주문</th></tr>
              </thead>
              <tbody>
                {customers.map(cst => (
                  <tr key={cst.id}>
                    <td><strong>{cst.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cst.customerName}</strong></td>
                    <td><small>{cst.phone}</small></td>
                    <td><small>{cst.optionColor}</small></td>
                    <td><small>{cst.deliveryNote}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cst.totalOrders}회</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 핸드메이드 제작 공정 실시간 작업 로그 (90건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>공정로그ID</th><th>주문ID</th><th>상품명</th><th>담당 아티잔</th><th>세부 제작 공정 작업 내역</th><th>작업 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {craftLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.ordId}</td>
                    <td><small>{log.productName}</small></td>
                    <td><strong>{log.artisanName}</strong></td>
                    <td><small>{log.craftStep}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.craftTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteCraftLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 제작 로그 삭제 시 목록에서는 소거되나 제작자별 처리량, 옵션별 주문 수, 월별 발송 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 공방 관제 통합 감사 로그 (90건)</h2>
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
            <button className="delete-btn-sm" onClick={() => testUnauthorizedShipOrder('ORD-8001')}>🔒 권한 없는 직원의 주문 발송 완료 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 발송 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
