import React, { useState } from 'react';

export default function CenterSection({ books, contracts, settlements, salesLogs, activityLogs, deleteSalesLog, testUnauthorizedConfirm }) {
  const [activeTab, setActiveTab] = useState('BOOKS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'BOOKS' ? 'active' : ''}`} onClick={() => setActiveTab('BOOKS')}>📚 출판 도서 대장 (40개)</button>
        <button className={`tab-btn ${activeTab === 'CONTRACTS' ? 'active' : ''}`} onClick={() => setActiveTab('CONTRACTS')}>📝 저자 계약 타임라인 (35건)</button>
        <button className={`tab-btn ${activeTab === 'SETTLEMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('SETTLEMENTS')}>💰 저자 인세 정산 (40건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📊 판매 로그 & 감사 이력</button>
      </div>

      {activeTab === 'BOOKS' && (
        <div className="widget-section">
          <h2>📚 PublishLedger 도서 출판 대장 (40개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>도서ID</th><th>도서 제목</th><th>저자명</th><th>장르</th><th>정가(원)</th><th>계약 인세율</th><th>누적 판매량</th><th>출간일자</th><th>상태</th></tr>
              </thead>
              <tbody>
                {books.map(bk => (
                  <tr key={bk.id}>
                    <td><strong>{bk.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bk.title}</strong></td>
                    <td><small>{bk.authorName}</small></td>
                    <td><span className="genre-badge">{bk.genre}</span></td>
                    <td><strong>{bk.priceWon.toLocaleString()}원</strong></td>
                    <td><strong style={{ color: 'var(--color-dark)' }}>{bk.royaltyRate}%</strong></td>
                    <td><strong>{bk.totalSalesCopies.toLocaleString()}부</strong></td>
                    <td><small>{bk.pubDate}</small></td>
                    <td><span className={`status-badge ${bk.status.toLowerCase()}`}>{bk.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CONTRACTS' && (
        <div className="widget-section">
          <h2>📝 출판 저작권 계약 대장 (35건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>계약ID</th><th>도서 제목</th><th>저자명</th><th>계약 인세율</th><th>선급금(원)</th><th>계약체결일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {contracts.map(ctr => (
                  <tr key={ctr.id}>
                    <td><strong>{ctr.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ctr.bookTitle}</strong></td>
                    <td><small>{ctr.authorName}</small></td>
                    <td><strong style={{ color: 'var(--color-dark)' }}>{ctr.royaltyRate}%</strong></td>
                    <td><strong>{ctr.advanceWon.toLocaleString()}원</strong></td>
                    <td><small>{ctr.contractDate}</small></td>
                    <td><span className={`status-badge ${ctr.status.toLowerCase()}`}>{ctr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SETTLEMENTS' && (
        <div className="widget-section">
          <h2>💰 저자 인세 분기 정산 내역 (40건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>정산ID</th><th>도서 제목</th><th>저자명</th><th>정산 분기</th><th>판매 부수</th><th>총 매출액</th><th>인세 발생액</th><th>실 지급액</th><th>상태</th></tr>
              </thead>
              <tbody>
                {settlements.map(stl => (
                  <tr key={stl.id}>
                    <td><strong>{stl.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{stl.bookTitle}</strong></td>
                    <td><small>{stl.authorName}</small></td>
                    <td><small>{stl.salesPeriod}</small></td>
                    <td>{stl.soldCopies.toLocaleString()}부</td>
                    <td>{stl.grossSalesWon.toLocaleString()}원</td>
                    <td><strong>{stl.royaltyWon.toLocaleString()}원</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{stl.netPayoutWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${stl.status.toLowerCase()}`}>{stl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📊 서점 유통 실시간 판매 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>도서 제목</th><th>판매 유통 채널</th><th>판매 부수</th><th>매출액</th><th>판매 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {salesLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.bookTitle}</strong></td>
                    <td><small>{log.channel}</small></td>
                    <td><strong>{log.copies.toLocaleString()}부</strong></td>
                    <td>{log.amountWon.toLocaleString()}원</td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteSalesLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 판매 로그 삭제 시 목록에서는 소거되나 대시보드 도서별 판매량 및 저자별 인세 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 출판 정산 관리 감사 활동 로그 (80건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>계약ID</th><th>담당자</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.contractId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirm('STL-6001')}>🔒 권한 없는 직원의 인세 정산 강제 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 정산확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
