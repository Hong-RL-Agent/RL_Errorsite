import React, { useState } from 'react';

export default function CenterSection({ menus, students, allergies, subMealRequests, servingLogs, activityLogs, deleteServingLog, testUnauthorizedApprove }) {
  const [activeTab, setActiveTab] = useState('MENUS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'MENUS' ? 'active' : ''}`} onClick={() => setActiveTab('MENUS')}>🍱 주간 식단표 (35개)</button>
        <button className={`tab-btn ${activeTab === 'STUDENTS' ? 'active' : ''}`} onClick={() => setActiveTab('STUDENTS')}>🧑‍🎓 학생 알레르기 (60명)</button>
        <button className={`tab-btn ${activeTab === 'REQUESTS' ? 'active' : ''}`} onClick={() => setActiveTab('REQUESTS')}>🔄 대체식 신청 (40건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>🥣 배식 & 감사 이력</button>
      </div>

      {activeTab === 'MENUS' && (
        <div className="widget-section">
          <h2>🍱 MealSafe 주간 급식 식단 & 알레르기 유발 정보 (35개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>식단ID</th><th>급식 제공일</th><th>구분</th><th>주메뉴 명칭</th><th>알레르기 유발 물질 정보</th><th>제공 예정 대체 식단</th><th>위험도</th></tr>
              </thead>
              <tbody>
                {menus.map(mnu => (
                  <tr key={mnu.id}>
                    <td><strong>{mnu.id}</strong></td>
                    <td><small>{mnu.mealDate}</small></td>
                    <td><small>{mnu.mealType}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{mnu.menuName}</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{mnu.allergiesInfo}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{mnu.substituteOption}</strong></td>
                    <td><span className={`status-badge ${mnu.riskLevel.toLowerCase()}`}>{mnu.riskLevel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STUDENTS' && (
        <div className="widget-section">
          <h2>🧑‍🎓 특이 체질 알레르기 학생 보호자 지정 명단 (60명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>학생ID</th><th>학생 성명</th><th>학년 / 반</th><th>진단 알레르기 항목</th><th>위험 등급</th><th>보호자 연락처</th></tr>
              </thead>
              <tbody>
                {students.map(std => (
                  <tr key={std.id}>
                    <td><strong>{std.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{std.studentName}</strong></td>
                    <td><span className="grade-badge">{std.gradeClass}</span></td>
                    <td><small style={{ color: 'var(--color-danger)' }}>{std.allergies}</small></td>
                    <td><span className={`status-badge ${std.riskLevel.toLowerCase()}`}>{std.riskLevel}</span></td>
                    <td><small>{std.parentPhone}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REQUESTS' && (
        <div className="widget-section">
          <h2>🔄 특별 대체 급식 신청 & 승인 대장 (40건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>신청ID</th><th>학생 성명</th><th>학년반</th><th>대상 원 식단명</th><th>희망 대체 급식 식단</th><th>신청일</th><th>상태</th></tr>
              </thead>
              <tbody>
                {subMealRequests.map(sub => (
                  <tr key={sub.id}>
                    <td><strong>{sub.id}</strong></td>
                    <td><strong>{sub.studentName}</strong></td>
                    <td><small>{sub.gradeClass}</small></td>
                    <td><small>{sub.menuName}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{sub.requestedSubMenu}</strong></td>
                    <td><small>{sub.requestDate}</small></td>
                    <td><span className={`status-badge ${sub.status.toLowerCase()}`}>{sub.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>🥣 실시간 배식 및 대체식 지급 수량 로그 (70건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>로그ID</th><th>신청ID</th><th>수령 학생</th><th>제공 완료 대체식명</th><th>수량</th><th>배식 시간</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {servingLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.subMealId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.studentName}</strong></td>
                    <td><small>{log.menuName}</small></td>
                    <td><strong>{log.servedQuantity}식</strong></td>
                    <td><small>{log.timestamp}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteServingLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 배식 로그 삭제 시 목록에서는 소거되나 메뉴별 배식 수량 및 알레르기 승인율 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 학교 급식 영양안전 종합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>신청ID</th><th>담당 영양사</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.subMealId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedApprove('SUB-2001')}>🔒 권한 없는 직원의 대체식 승인 강제 처리 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 대체식 승인 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
