import React, { useState } from 'react';

export default function CenterSection({ courses, instructors, students, enrollments, attendanceLogs, activityLogs, deleteAttendanceLog, testUnauthorizedCancelCourse }) {
  const [activeTab, setActiveTab] = useState('COURSES');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'COURSES' ? 'active' : ''}`} onClick={() => setActiveTab('COURSES')}>📚 강좌 대장 (40개)</button>
        <button className={`tab-btn ${activeTab === 'INSTRUCTORS' ? 'active' : ''}`} onClick={() => setActiveTab('INSTRUCTORS')}>👩‍🏫 강사/강의실</button>
        <button className={`tab-btn ${activeTab === 'ENROLLMENTS' ? 'active' : ''}`} onClick={() => setActiveTab('ENROLLMENTS')}>🎫 수강신청 (70건)</button>
        <button className={`tab-btn ${activeTab === 'LOGS' ? 'active' : ''}`} onClick={() => setActiveTab('LOGS')}>📋 출석 & 감사 이력</button>
      </div>

      {activeTab === 'COURSES' && (
        <div className="widget-section">
          <h2>📚 CultureClass 시민 문화센터 개설 강좌 운영 대장 (40개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>강좌ID</th><th>강좌코드</th><th>카테고리</th><th>강좌 명칭</th><th>담당 강사명</th><th>배정 강의실</th><th>개강 시작일</th><th>수강인원 / 정원</th><th>수강료</th><th>상태</th></tr>
              </thead>
              <tbody>
                {courses.map(crs => (
                  <tr key={crs.id}>
                    <td><strong>{crs.id}</strong></td>
                    <td><small>{crs.courseCode}</small></td>
                    <td><span className="category-badge">{crs.category}</span></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{crs.courseName}</strong></td>
                    <td><strong>{crs.instructorName}</strong></td>
                    <td><small>{crs.roomNo}</small></td>
                    <td><small>{crs.startDate}</small></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{crs.enrolledCount}명 / {crs.maxCapacity}명</strong></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{crs.tuitionFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${crs.status.toLowerCase()}`}>{crs.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'INSTRUCTORS' && (
        <div className="widget-section">
          <h2>👩‍🏫 문화센터 전문 초빙 강사 명단 (20명)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>강사ID</th><th>강사 성명</th><th>연락처</th><th>전공 / 강의 분야</th><th>현재 담당 강좌 수</th><th>강사 평점</th></tr>
              </thead>
              <tbody>
                {instructors.map(ins => (
                  <tr key={ins.id}>
                    <td><strong>{ins.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{ins.instructorName}</strong></td>
                    <td><small>{ins.phone}</small></td>
                    <td><small>{ins.major}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{ins.assignedCourses}개 강좌</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>⭐ {ins.rating} / 5.0</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>👨‍🎓 수강생 인적사항 명단 (80명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>수강생ID</th><th>수강생 성명</th><th>연락처</th><th>배정 강의실</th><th>수강 강좌명</th><th>누적 출석률</th></tr>
              </thead>
              <tbody>
                {students.map(std => (
                  <tr key={std.id}>
                    <td><strong>{std.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{std.studentName}</strong></td>
                    <td><small>{std.phone}</small></td>
                    <td><small>{std.roomNo}</small></td>
                    <td><small>{std.courseName}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{std.attendanceRate}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ENROLLMENTS' && (
        <div className="widget-section">
          <h2>🎫 강좌 수강 신청 등록 현황 대장 (70건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>신청ID</th><th>강좌ID</th><th>신청 강좌명</th><th>수강생 성명</th><th>신청 등록일</th><th>수강료</th><th>상태</th></tr>
              </thead>
              <tbody>
                {enrollments.map(enr => (
                  <tr key={enr.id}>
                    <td><strong>{enr.id}</strong></td>
                    <td>{enr.courseId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{enr.courseName}</strong></td>
                    <td><strong>{enr.studentName}</strong></td>
                    <td><small>{enr.enrollDate}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{enr.tuitionFeeWon.toLocaleString()}원</strong></td>
                    <td><span className={`status-badge ${enr.status.toLowerCase()}`}>{enr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="widget-section">
          <h2>📋 강의실 출석 실시간 체크 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>출석로그ID</th><th>강좌ID</th><th>강좌명</th><th>수강생명</th><th>출석 일시</th><th>담당 강사명</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {attendanceLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.courseId}</td>
                    <td><small>{log.courseName}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.studentName}</strong></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{log.attendDate}</small></td>
                    <td><strong>{log.instructorName}</strong></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteAttendanceLog(log.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 출석 로그 삭제 시 목록에서는 소거되나 강좌별 출석률, 강사별 수업 수, 카테고리별 신청률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 문화센터 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>강좌ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.courseId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCancelCourse('CRS-1001')}>🔒 권한 없는 직원의 강좌 폐강 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 폐강 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
