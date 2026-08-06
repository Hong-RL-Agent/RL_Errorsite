import React, { useState } from 'react';

export default function CenterSection({ rentals, equipments, customers, returnLogs, safetyLogs, activityLogs, deleteReturnLog, testUnauthorizedConfirmDamage }) {
  const [activeTab, setActiveTab] = useState('RENTALS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'RENTALS' ? 'active' : ''}`} onClick={() => setActiveTab('RENTALS')}>🏄 장비 대여 (55건)</button>
        <button className={`tab-btn ${activeTab === 'EQUIPMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('EQUIPMENTS')}>🚤 마리나 장비 (60개)</button>
        <button className={`tab-btn ${activeTab === 'CUSTOMERS' ? 'active' : ''}`} onClick={() => setActiveTab('CUSTOMERS')}>👨‍✈️ 고객 & 안전교육</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 반납 & 감사 이력</button>
      </div>

      {activeTab === 'RENTALS' && (
        <div className="widget-section">
          <h2>🏄 MarineRent 해양 레저 장비 대여 통합 대장 (55건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>대여ID</th><th>대여코드</th><th>마리나 지점명</th><th>대여 장비명</th><th>이용 고객명</th><th>보관 위치 계류장</th><th>대여 시작시간</th><th>반납 예정시간</th><th>대여료</th><th>상태</th></tr>
              </thead>
              <tbody>
                {rentals.map(rnt => (
                  <tr key={rnt.id}>
                    <td><strong>{rnt.id}</strong></td>
                    <td><small>{rnt.rentalCode}</small></td>
                    <td><span className="branch-badge">{rnt.branchName}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{rnt.equipmentName}</strong></td>
                    <td><strong>{rnt.customerName}</strong></td>
                    <td><small>{rnt.storageLocation}</small></td>
                    <td><small>{rnt.startTime}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{rnt.returnTime}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{rnt.feeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${rnt.status.toLowerCase()}`}>{rnt.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'EQUIPMENTS' && (
        <div className="widget-section">
          <h2>🚤 마리나 보관 해양 레저 장비 명세 (60개 장비)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>장비ID</th><th>장비 코드</th><th>장비 명칭</th><th>카테고리</th><th>보관 선착장 계류장</th><th>안전 등급</th><th>이용률 (%)</th><th>상태</th></tr>
              </thead>
              <tbody>
                {equipments.map(eqp => (
                  <tr key={eqp.id}>
                    <td><strong>{eqp.id}</strong></td>
                    <td><small>{eqp.equipmentCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{eqp.equipmentName}</strong></td>
                    <td><span className="branch-badge">{eqp.category}</span></td>
                    <td><small>{eqp.storageLocation}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{eqp.safetyGrade}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{eqp.usageRate}%</strong></td>
                    <td><span className={`status-badge ${eqp.status.toLowerCase()}`}>{eqp.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CUSTOMERS' && (
        <div className="widget-section">
          <h2>👨‍✈️ 해양 장비 이용 등록 고객 명단 (50명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>고객ID</th><th>고객 성명</th><th>연락처</th><th>안전 교육 이수 여부</th><th>선호 마리나 지점</th><th>누적 대여 횟수</th></tr>
              </thead>
              <tbody>
                {customers.map(cst => (
                  <tr key={cst.id}>
                    <td><strong>{cst.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cst.customerName}</strong></td>
                    <td><small>{cst.phone}</small></td>
                    <td><span className="branch-badge">{cst.safetyCert}</span></td>
                    <td><small>{cst.preferredBranch}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cst.totalRentals}회</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>🤿 해양 레저 사전 안전 교육 이수 기록 (60건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>교육ID</th><th>이수 고객명</th><th>안전 교육 과목명</th><th>이수 일시</th><th>담당 해양 교관</th><th>상태</th></tr>
              </thead>
              <tbody>
                {safetyLogs.map(sft => (
                  <tr key={sft.id}>
                    <td><strong>{sft.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{sft.customerName}</strong></td>
                    <td><small>{sft.courseName}</small></td>
                    <td><small>{sft.certDate}</small></td>
                    <td><strong>{sft.instructor}</strong></td>
                    <td><span className={`status-badge ${sft.status.toLowerCase()}`}>{sft.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 장비 반납 점검 및 외관 파손 실시간 검수 로그 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>반납로그ID</th><th>대여ID</th><th>장비명</th><th>고객명</th><th>점검 소견 내역</th><th>반납 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {returnLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rntId}</td>
                    <td><small>{log.equipmentName}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.customerName}</strong></td>
                    <td><small>{log.inspectionResult}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.returnDate}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteReturnLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 반납 점검 로그 삭제 시 목록에서는 소거되나 장비별 손상률, 지점별 이용률, 고객별 대여 횟수 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 마리나 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>대여ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.rntId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirmDamage('RNT-7001')}>🔒 권한 없는 직원의 손상 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 손상 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
