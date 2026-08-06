import React, { useState } from 'react';

export default function CenterSection({ products, stores, discountLogs, disposalLogs, activityLogs, deleteDisposalLog, testUnauthorizedConfirmDisposal }) {
  const [activeTab, setActiveTab] = useState('PRODUCTS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'PRODUCTS' ? 'active' : ''}`} onClick={() => setActiveTab('PRODUCTS')}>🥩 신선식품 (70개)</button>
        <button className={`tab-btn ${activeTab === 'STORES' ? 'active' : ''}`} onClick={() => setActiveTab('STORES')}>🏢 지점 매장 (10개)</button>
        <button className={`tab-btn ${activeTab === 'DISCOUNTS' ? 'active' : ''}`} onClick={() => setActiveTab('DISCOUNTS')}>🏷️ 할인 이력 (60건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🗑️ 손실 폐기 & 감사 이력</button>
      </div>

      {activeTab === 'PRODUCTS' && (
        <div className="widget-section">
          <h2>🥩 FreshMark 대형마트 신선식품 유통기한 & 할인 매대 대장 (70개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>상품ID</th><th>상품코드</th><th>상품명</th><th>카테고리</th><th>매장명</th><th>보관온도</th><th>할인율</th><th>현재판매가</th><th>유통기한 마감시각</th><th>상태</th></tr>
              </thead>
              <tbody>
                {products.map(prd => (
                  <tr key={prd.id}>
                    <td><strong>{prd.id}</strong></td>
                    <td><small>{prd.prodCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{prd.productName}</strong></td>
                    <td><small>{prd.category}</small></td>
                    <td><span className="store-badge">{prd.storeName}</span></td>
                    <td><small>{prd.storageTemp}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{prd.discountRatePercent}% Off</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{prd.currentPriceWon.toLocaleString()}원</strong></td>
                    <td><small>{prd.expiryDate}</small></td>
                    <td><span className={`status-badge ${prd.status.toLowerCase()}`}>{prd.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STORES' && (
        <div className="widget-section">
          <h2>🏢 지점별 신선 코너 및 유통기한 관리 현황 (10개 매장)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>매장ID</th><th>지점 명칭</th><th>매장 주소</th><th>신선식품 매대 수</th><th>현재 진열 품목 수</th></tr>
              </thead>
              <tbody>
                {stores.map(str => (
                  <tr key={str.id}>
                    <td><strong>{str.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{str.storeName}</strong></td>
                    <td><small>{str.location}</small></td>
                    <td><strong>{str.freshZoneCount}개 매대</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{str.activeProducts}개 품목</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DISCOUNTS' && (
        <div className="widget-section">
          <h2>🏷️ 신선식품 마감 타임세일 할인율 적용 이력 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>할인ID</th><th>상품ID</th><th>상품명</th><th>매장</th><th>이전 할인율</th><th>변경 할인율</th><th>담당자</th><th>일시</th></tr>
              </thead>
              <tbody>
                {discountLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.prodId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.productName}</strong></td>
                    <td><span className="store-badge">{log.storeName}</span></td>
                    <td><small>{log.prevDiscountRate}%</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{log.newDiscountRate}% Off</strong></td>
                    <td><small>{log.appliedBy}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🗑️ 유통기한 마감 신선식품 폐기 손실 로그 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>폐기ID</th><th>상품ID</th><th>상품명</th><th>매장</th><th>폐기 수량</th><th>손실금액</th><th>폐기 사유</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {disposalLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.prodId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.productName}</strong></td>
                    <td><span className="store-badge">{log.storeName}</span></td>
                    <td><strong>{log.disposedQty}개</strong></td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>{log.lossAmountWon.toLocaleString()}원</strong></td>
                    <td><small>{log.reason}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteDisposalLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 폐기 로그 삭제 시 목록에서는 소거되나 매장별 폐기율, 카테고리별 손실금액, 일별 할인 판매 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 마트 신선식품 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>상품ID</th><th>담당 직원</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.prodId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirmDisposal('PRD-5001')}>🔒 권한 없는 직원의 신선식품 최종 폐기 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 폐기 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
