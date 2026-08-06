import React, { useState } from 'react';

export default function CenterSection({ auctions, flowers, buyers, winningBids, deliveryOrders, activityLogs, deleteDeliveryOrder, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('AUCTIONS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'AUCTIONS' ? 'active' : ''}`} onClick={() => setActiveTab('AUCTIONS')}>🌸 경매 보드 (55건)</button>
        <button className={`tab-btn ${activeTab === 'FLOWERS' ? 'active' : ''}`} onClick={() => setActiveTab('FLOWERS')}>💐 화훼 품목 (45개)</button>
        <button className={`tab-btn ${activeTab === 'BUYERS' ? 'active' : ''}`} onClick={() => setActiveTab('BUYERS')}>🏬 낙찰 구매상 (30명)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🚚 배송 & 감사 이력</button>
      </div>

      {activeTab === 'AUCTIONS' && (
        <div className="widget-section">
          <h2>🌸 FlowerBid 전국 화훼 경매 & 낙찰 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>경매ID</th><th>경매코드</th><th>화훼 품목명</th><th>생화등급</th><th>경매수량</th><th>배송수량</th><th>시작가</th><th>최종낙찰가</th><th>낙찰 구매자</th><th>상태</th></tr>
              </thead>
              <tbody>
                {auctions.map(auc => (
                  <tr key={auc.id}>
                    <td><strong>{auc.id}</strong></td>
                    <td><small>{auc.auctionCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{auc.flowerName}</strong></td>
                    <td><span className="flower-grade-badge">{auc.grade}</span></td>
                    <td>{auc.quantity}단</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{auc.deliveryQty}단</strong></td>
                    <td><small>{auc.startPriceWon.toLocaleString()}원</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{auc.winningPriceWon.toLocaleString()}원</strong></td>
                    <td><strong>{auc.buyerName}</strong></td>
                    <td><span className={`status-badge ${auc.status.toLowerCase()}`}>{auc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FLOWERS' && (
        <div className="widget-section">
          <h2>💐 경매 입고 화훼 품목 & 콜드체인 재고 현황 (45개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>품목ID</th><th>생화 품목명</th><th>품질 등급</th><th>적정 보관온도</th><th>산지 농가</th><th>현재 재고 수량</th></tr>
              </thead>
              <tbody>
                {flowers.map(flw => (
                  <tr key={flw.id}>
                    <td><strong>{flw.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{flw.flowerName}</strong></td>
                    <td><span className="flower-grade-badge">{flw.grade}</span></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{flw.tempSetting}</small></td>
                    <td><small>{flw.origin}</small></td>
                    <td><strong>{flw.stockQty.toLocaleString()}단</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BUYERS' && (
        <div className="widget-section">
          <h2>🏬 화훼 도매상 & 플라워 스튜디오 구매자 대장 (30명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>구매자ID</th><th>상호명 / 대표자</th><th>사업자등록번호</th><th>연락처</th><th>VIP 등급</th></tr>
              </thead>
              <tbody>
                {buyers.map(buy => (
                  <tr key={buy.id}>
                    <td><strong>{buy.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{buy.buyerName}</strong></td>
                    <td><small>{buy.businessNo}</small></td>
                    <td><small>{buy.phone}</small></td>
                    <td><span className="flower-grade-badge">{buy.vipGrade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🚚 실시간 냉장 탑차 배송 지시 로그 (40건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>경매ID</th><th>낙찰 품목명</th><th>구매자</th><th>배송수량</th><th>목적지 배송 주소</th><th>시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {deliveryOrders.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.auctionId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.flowerName}</strong></td>
                    <td>{log.buyerName}</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{log.deliveryQty}단</strong></td>
                    <td><small>{log.destination}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteDeliveryOrder(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 배송 로그 삭제 시 목록에서는 소거되나 품목별 판매량 및 구매자 주문량 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 화훼 공판장 운영 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>경매ID</th><th>담당 경매사</th><th>처리 내역</th><th>일시</th></tr>
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
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('AUC-2001')}>🔒 권한 없는 직원의 낙찰 최종 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 낙찰 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
