import React, { useState } from 'react';

export default function CenterSection({ books, donors, distributors, classifyLogs, activityLogs, deleteClassifyLog, testUnauthorizedComplete }) {
  const [activeTab, setActiveTab] = useState('BOOKS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'BOOKS' ? 'active' : ''}`} onClick={() => setActiveTab('BOOKS')}>📖 기증 도서 (70권)</button>
        <button className={`tab-btn ${activeTab === 'DONORS' ? 'active' : ''}`} onClick={() => setActiveTab('DONORS')}>🎁 기증자 명단 (35명)</button>
        <button className={`tab-btn ${activeTab === 'DISTRIBUTORS' ? 'active' : ''}`} onClick={() => setActiveTab('DISTRIBUTORS')}>🏢 나눔 배포처 (20개)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🏷️ KDC 분류 & 감사 이력</button>
      </div>

      {activeTab === 'BOOKS' && (
        <div className="widget-section">
          <h2>📖 BookDonate 공공 도서 기증 & 분류 대장 (70권)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>도서ID</th><th>도서코드</th><th>기증 도서 제목</th><th>저자</th><th>KDC 분야</th><th>보존 상태등급</th><th>기증자 성명</th><th>배정 배포처</th><th>접수일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {books.map(bk => (
                  <tr key={bk.id}>
                    <td><strong>{bk.id}</strong></td>
                    <td><small>{bk.bookCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{bk.title}</strong></td>
                    <td><small>{bk.author}</small></td>
                    <td><small>{bk.category}</small></td>
                    <td><span className="condition-badge">{bk.conditionGrade}</span></td>
                    <td><strong>{bk.donorName}</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{bk.distributorName}</strong></td>
                    <td><small>{bk.receivedDate}</small></td>
                    <td><span className={`status-badge ${bk.status.toLowerCase()}`}>{bk.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DONORS' && (
        <div className="widget-section">
          <h2>🎁 기증자 및 출판/문화 재단 명단 (35명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>기증자ID</th><th>기증자 성명 / 기관명</th><th>연락처</th><th>누적 기증 도서 수</th><th>소재지 주소</th></tr>
              </thead>
              <tbody>
                {donors.map(dnr => (
                  <tr key={dnr.id}>
                    <td><strong>{dnr.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{dnr.donorName}</strong></td>
                    <td><small>{dnr.phone}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{dnr.donatedCount}권</strong></td>
                    <td><small>{dnr.address}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'DISTRIBUTORS' && (
        <div className="widget-section">
          <h2>🏢 도서 나눔 지원 대상 배포처 기관 (20개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>배포처ID</th><th>기관/도서관 명칭</th><th>시설 구분</th><th>희망 기증 분야</th><th>누적 배정 도서 수</th></tr>
              </thead>
              <tbody>
                {distributors.map(dst => (
                  <tr key={dst.id}>
                    <td><strong>{dst.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{dst.orgName}</strong></td>
                    <td><small>{dst.category}</small></td>
                    <td><small>{dst.requiredCategory}</small></td>
                    <td><strong>{dst.allocatedBooks}권</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🏷️ KDC 십진 분류 및 사서 검수 로그 (80건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>도서ID</th><th>도서 제목</th><th>분야</th><th>KDC 분류기호</th><th>담당 사서</th><th>시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {classifyLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.bookId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.title}</strong></td>
                    <td><small>{log.category}</small></td>
                    <td><span className="condition-badge">{log.kdcCode}</span></td>
                    <td><small>{log.assignedBy}</small></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteClassifyLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 분류 로그 삭제 시 목록에서는 소거되나 분야별 도서 수 및 배포처별 배정 수 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 기증 도서 시스템 통합 운영 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>도서ID</th><th>담당 사서</th><th>처리 내역</th><th>일시</th></tr>
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
            <button className="delete-btn-sm" onClick={() => testUnauthorizedComplete('BK-1001')}>🔒 권한 없는 직원의 배포 완료 강제 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 배포 완료 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
