import React, { useState } from 'react';

export default function CenterSection({ auctions, items, wholesalers, shipmentLogs, activityLogs, deleteShipmentLog, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('AUCTIONS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'AUCTIONS' ? 'active' : ''}`} onClick={() => setActiveTab('AUCTIONS')}>🐟 경매 대장 (50건)</button>
        <button className={`tab-btn ${activeTab === 'ITEMS' ? 'active' : ''}`} onClick={() => setActiveTab('ITEMS')}>⚓ 수산물 품목 (40개)</button>
        <button className={`tab-btn ${activeTab === 'WHOLESALERS' ? 'active' : ''}`} onClick={() => setActiveTab('WHOLESALERS')}>🏬 중도매인 명단 (30명)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🚛 출하 & 감사 이력</button>
      </div>

      {activeTab === 'AUCTIONS' && (
        <div className="widget-section">
          <h2>🐟 FishAuction 수산물 실시간 경매 대장 (50건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>경매ID</th><th>수산물 품목명</th><th>산지</th><th>보관 온도</th><th>경매 물량(kg)</th><th>시작가</th><th>최고 낙찰가</th><th>낙찰 중도매인</th><th>상태</th></tr>
              </thead>
              <tbody>
                {auctions.map(auc => (
                  <tr key={auc.id}>
                    <td><strong>{auc.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{auc.itemName}</strong></td>
                    <td><small>{auc.origin}</small></td>
                    <td><small>{auc.tempStorage}</small></td>
                    <td><strong style={{ color: 'var(--color-dark)' }}>{auc.quantityKg}kg</strong></td>
                    <td>{auc.startPriceWon.toLocaleString()}원</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{auc.winPriceWon.toLocaleString()}원</strong></td>
                    <td><small>{auc.winnerName}</small></td>
                    <td><span className={`status-badge ${auc.status.toLowerCase()}`}>{auc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ITEMS' && (
        <div className="widget-section">
          <h2>⚓ 위생 수산물 품목 & 콜드체인 보관 기준 (40개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>품목ID</th><th>수산물 품목명</th><th>산지 어항</th><th>콜드체인 보관온도</th><th>거래 단위</th><th>평균 시세</th></tr>
              </thead>
              <tbody>
                {items.map(itm => (
                  <tr key={itm.id}>
                    <td><strong>{itm.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{itm.itemName}</strong></td>
                    <td><small>{itm.origin}</small></td>
                    <td><span className="origin-badge">{itm.tempStorage}</span></td>
                    <td>{itm.unit}</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{itm.avgPriceWon.toLocaleString()}원</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'WHOLESALERS' && (
        <div className="widget-section">
          <h2>🏬 도매시장 공인 중도매인 명단 (30명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>중도매인ID</th><th>중도매인 성명 / 지정번호</th><th>허가 번호</th><th>외상 경매 한도액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {wholesalers.map(whl => (
                  <tr key={whl.id}>
                    <td><strong>{whl.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{whl.name}</strong></td>
                    <td><small>{whl.licenseNo}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{(whl.creditLimitWon / 10000).toLocaleString()}만원</strong></td>
                    <td><span className={`status-badge ${whl.status.toLowerCase()}`}>{whl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🚛 콜드체인 차량 수산물 출하 실적 로그 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>경매ID</th><th>출하 품목명</th><th>실 출하 수량</th><th>배정 차량번호</th><th>출하 완료 시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {shipmentLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.auctionId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.itemName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{log.shippedKg}kg</strong></td>
                    <td><small>{log.vehicleNo}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteShipmentLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 출하 로그 삭제 시 목록에서는 소거되나 품목별 시세 및 중도매인 낙찰량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 수산시장 경매 유통 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>경매ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.auctionId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('AUC-2001')}>🔒 권한 없는 직원의 낙찰 확정 강제 승인 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 낙찰 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
