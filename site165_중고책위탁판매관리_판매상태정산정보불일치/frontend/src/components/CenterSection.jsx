import React, { useState } from 'react';

export default function CenterSection({ books, consignors, sales, settlements, inspectionLogs, activityLogs, deleteInspectionLog, testUnauthorizedProcessSettlement }) {
  const [activeTab, setActiveTab] = useState('BOOKS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'BOOKS' ? 'active' : ''}`} onClick={() => setActiveTab('BOOKS')}>📖 위탁 도서 (80권)</button>
        <button className={`tab-btn ${activeTab === 'CONSIGNORS' ? 'active' : ''}`} onClick={() => setActiveTab('CONSIGNORS')}>👤 위탁 신청자 (50명)</button>
        <button className={`tab-btn ${activeTab === 'SETTLEMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('SETTLEMENTS')}>💰 판매 & 정산 내역</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 검수 & 감사 이력</button>
      </div>

      {activeTab === 'BOOKS' && (
        <div className="widget-section">
          <h2>📖 UsedBookConsign 중고책 위탁 판매 관제 대장 (80권)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>도서ID</th><th>도서코드</th><th>중고 도서명</th><th>저자</th><th>카테고리</th><th>위탁 신청자</th><th>판매가</th><th>위탁 정산예정액</th><th>상태 등급</th><th>상태</th></tr>
              </thead>
              <tbody>
                {books.map(bk => (
                  <tr key={bk.id}>
                    <td><strong>{bk.id}</strong></td>
                    <td><small>{bk.bookCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bk.title}</strong></td>
                    <td><small>{bk.author}</small></td>
                    <td><span className="category-badge">{bk.category}</span></td>
                    <td><small>{bk.consignorName}</small></td>
                    <td><strong>{bk.priceWon.toLocaleString()}원</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{bk.payoutAmount.toLocaleString()}원</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{bk.qualityGrade}</small></td>
                    <td><span className={`status-badge ${bk.status.toLowerCase()}`}>{bk.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CONSIGNORS' && (
        <div className="widget-section">
          <h2>👤 위탁 신청자 명단 & 정산 계좌 정보 (50명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>위탁자ID</th><th>위탁자 코드</th><th>성명</th><th>정산 수령 계좌</th><th>연락처</th><th>총 위탁 도서 수</th><th>최초 등록일</th></tr>
              </thead>
              <tbody>
                {consignors.map(csg => (
                  <tr key={csg.id}>
                    <td><strong>{csg.id}</strong></td>
                    <td><small>{csg.consignorCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{csg.consignorName}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{csg.bankAccount}</small></td>
                    <td><small>{csg.phone}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{csg.totalBooks}권</strong></td>
                    <td><small>{csg.registeredDate}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'SETTLEMENTS' && (
        <div className="widget-section">
          <h2>💰 위탁 도서 중고 판매 기록 (60건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>판매ID</th><th>도서ID</th><th>도서명</th><th>위탁자명</th><th>판매가</th><th>정산금액</th><th>판매 완료 시각</th><th>상태</th></tr>
              </thead>
              <tbody>
                {sales.map(sl => (
                  <tr key={sl.id}>
                    <td><strong>{sl.id}</strong></td>
                    <td>{sl.bookId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sl.title}</strong></td>
                    <td><small>{sl.consignorName}</small></td>
                    <td>{sl.salePriceWon.toLocaleString()}원</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{sl.payoutAmount.toLocaleString()}원</strong></td>
                    <td><small>{sl.soldDate}</small></td>
                    <td><span className={`status-badge ${sl.status.toLowerCase()}`}>{sl.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>💰 위탁 정산금 계좌 송금 내역 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>정산ID</th><th>도서ID</th><th>위탁자명</th><th>입금 계좌</th><th>송금 정산액</th><th>정산 일시</th><th>상태</th></tr>
              </thead>
              <tbody>
                {settlements.map(stl => (
                  <tr key={stl.id}>
                    <td><strong>{stl.id}</strong></td>
                    <td>{stl.bookId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{stl.consignorName}</strong></td>
                    <td><small>{stl.bankAccount}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{stl.settleAmount.toLocaleString()}원</strong></td>
                    <td><small>{stl.settleDate}</small></td>
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
          <h2>📋 실물 도서 상태 감정 검수 로그 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>검수로그ID</th><th>도서ID</th><th>도서명</th><th>감정원</th><th>검수 상세 소견 및 등급 판정</th><th>검수 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {inspectionLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bookId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.title}</strong></td>
                    <td><small>{log.inspector}</small></td>
                    <td><small>{log.memo}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.logTime}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteInspectionLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 검수 로그 삭제 시 목록에서는 소거되나 카테고리별 판매율, 위탁자별 정산액, 월별 판매 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 위탁 정산 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>도서ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bookId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedProcessSettlement('BOOK-1001')}>🔒 권한 없는 직원의 정산 완료 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 정산 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
