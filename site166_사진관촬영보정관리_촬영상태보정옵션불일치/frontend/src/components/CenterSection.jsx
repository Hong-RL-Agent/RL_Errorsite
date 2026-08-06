import React, { useState } from 'react';

export default function CenterSection({ reservations, products, customers, retouchTasks, dispatchLogs, activityLogs, deleteDispatchLog, testUnauthorizedCompleteDispatch }) {
  const [activeTab, setActiveTab] = useState('RESERVATIONS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'RESERVATIONS' ? 'active' : ''}`} onClick={() => setActiveTab('RESERVATIONS')}>📷 촬영 예약 (60건)</button>
        <button className={`tab-btn ${activeTab === 'PRODUCTS' ? 'active' : ''}`} onClick={() => setActiveTab('PRODUCTS')}>🖼️ 촬영 상품 (25개)</button>
        <button className={`tab-btn ${activeTab === 'CUSTOMERS' ? 'active' : ''}`} onClick={() => setActiveTab('CUSTOMERS')}>👤 등록 고객 (50명)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 보정 & 출고 로그</button>
      </div>

      {activeTab === 'RESERVATIONS' && (
        <div className="widget-section">
          <h2>📷 PhotoStudioOps 사진관 촬영 예약 & 1:1 보정 관제 대장 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>예약ID</th><th>예약코드</th><th>고객명</th><th>연락처</th><th>촬영 상품명</th><th>상품 카테고리</th><th>촬영 일시</th><th>보정 요청 옵션</th><th>결제금액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {reservations.map(rsv => (
                  <tr key={rsv.id}>
                    <td><strong>{rsv.id}</strong></td>
                    <td><small>{rsv.rsvCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rsv.customerName}</strong></td>
                    <td><small>{rsv.phone}</small></td>
                    <td><strong>{rsv.productName}</strong></td>
                    <td><span className="category-badge">{rsv.productCategory}</span></td>
                    <td><small>{rsv.shootDate}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{rsv.retouchOption}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{rsv.priceWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${rsv.status.toLowerCase()}`}>{rsv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PRODUCTS' && (
        <div className="widget-section">
          <h2>🖼️ 스튜디오 대표 촬영 패키지 상품 목록 (25개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>상품ID</th><th>상품 코드</th><th>촬영 상품명</th><th>카테고리</th><th>기본 가격</th><th>상태</th></tr>
              </thead>
              <tbody>
                {products.map(prd => (
                  <tr key={prd.id}>
                    <td><strong>{prd.id}</strong></td>
                    <td><small>{prd.productCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{prd.productName}</strong></td>
                    <td><small>{prd.productCategory}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{prd.priceWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${prd.status.toLowerCase()}`}>{prd.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CUSTOMERS' && (
        <div className="widget-section">
          <h2>👤 촬영 고객 명단 & 희망 촬영 컨셉 (50명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>고객ID</th><th>고객 코드</th><th>고객 성명</th><th>연락처</th><th>선호 촬영 컨셉 & 톤</th><th>누적 예약 횟수</th><th>최초 등록일</th></tr>
              </thead>
              <tbody>
                {customers.map(cst => (
                  <tr key={cst.id}>
                    <td><strong>{cst.id}</strong></td>
                    <td><small>{cst.customerCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cst.customerName}</strong></td>
                    <td><small>{cst.phone}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{cst.shootConcept}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cst.totalReservations}회</strong></td>
                    <td><small>{cst.registeredDate}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 앨범 / 프리미엄 액자 택배 출고 실시간 로그 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>출고로그ID</th><th>예약ID</th><th>고객명</th><th>출고 물품 세부 내역</th><th>출고 처리 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {dispatchLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rsvId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.customerName}</strong></td>
                    <td><small>{log.itemType}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.dispatchTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteDispatchLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 보정/출고 로그 삭제 시 목록에서는 소거되나 작업자별 처리량, 상품별 선택률, 월별 출고율 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 사진관 스튜디오 관제 통합 감사 로그 (90건)</h2>
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
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCompleteDispatch('RSV-4001')}>🔒 권한 없는 직원의 앨범 출고 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 앨범 출고 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
