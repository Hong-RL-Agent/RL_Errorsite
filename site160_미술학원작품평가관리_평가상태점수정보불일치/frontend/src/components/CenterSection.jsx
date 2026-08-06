import React, { useState } from 'react';

export default function CenterSection({ artworks, classes, students, evaluations, feedbacks, activityLogs, deleteFeedback, testUnauthorizedConfirmScore }) {
  const [activeTab, setActiveTab] = useState('ARTWORKS');

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'ARTWORKS' ? 'active' : ''}`} onClick={() => setActiveTab('ARTWORKS')}>🖼️ 제출 작품 (80개)</button>
        <button className={`tab-btn ${activeTab === 'CLASSES' ? 'active' : ''}`} onClick={() => setActiveTab('CLASSES')}>🏫 미술 실기반 현황</button>
        <button className={`tab-btn ${activeTab === 'STUDENTS' ? 'active' : ''}`} onClick={() => setActiveTab('STUDENTS')}>🎓 수강 학생 & 목표대학</button>
        <button className={`tab-btn ${activeTab === 'FEEDBACKS' ? 'active' : ''}`} onClick={() => setActiveTab('FEEDBACKS')}>💬 피드백 & 감사 이력</button>
      </div>

      {activeTab === 'ARTWORKS' && (
        <div className="widget-section">
          <h2>🖼️ ArtReview 미술 학원 작품 제출 및 실기 채점 대장 (80개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>작품ID</th><th>작품코드</th><th>작품 제목</th><th>제출 학생명</th><th>소속 실기반</th><th>담당 강사</th><th>제출일</th><th>채점 점수</th><th>등급</th><th>상태</th></tr>
              </thead>
              <tbody>
                {artworks.map(art => (
                  <tr key={art.id}>
                    <td><strong>{art.id}</strong></td>
                    <td><small>{art.artCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{art.artTitle}</strong></td>
                    <td><strong>{art.studentName}</strong></td>
                    <td><span className="class-badge">{art.className}</span></td>
                    <td><small>{art.instructorName}</small></td>
                    <td><small>{art.submitDate}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{art.score}점</strong></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{art.gradeCategory}</small></td>
                    <td><span className={`status-badge ${art.status.toLowerCase()}`}>{art.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CLASSES' && (
        <div className="widget-section">
          <h2>🏫 미술 학원 전담 실기 클래스 현황</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>클래스ID</th><th>실기 클래스명</th><th>담당 전임강사</th><th>수강 인원</th><th>작품 제출 인원</th><th>평균 실기 점수</th><th>상태</th></tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls.id}>
                    <td><strong>{cls.id}</strong></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{cls.className}</strong></td>
                    <td><strong>{cls.instructorName}</strong></td>
                    <td><small>{cls.studentCount}명</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{cls.submittedCount}명 제출</strong></td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{cls.avgScore}점</strong></td>
                    <td><span className={`status-badge ${cls.status.toLowerCase()}`}>{cls.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STUDENTS' && (
        <div className="widget-section">
          <h2>🎓 입시 미술 수강 학생 & 목표 대학 명단 (60명)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>학생ID</th><th>학생 코드</th><th>학생 성명</th><th>소속 클래스</th><th>보호자 연락처</th><th>목표 대학 / 전공</th><th>평균 실기점수</th></tr>
              </thead>
              <tbody>
                {students.map(std => (
                  <tr key={std.id}>
                    <td><strong>{std.id}</strong></td>
                    <td><small>{std.studentCode}</small></td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{std.studentName}</strong></td>
                    <td><span className="class-badge">{std.className}</span></td>
                    <td><small>{std.parentContact}</small></td>
                    <td><small style={{ color: 'var(--color-warning)' }}>{std.targetUniv}</small></td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{std.avgScore}점</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FEEDBACKS' && (
        <div className="widget-section">
          <h2>💬 강사-학생 1:1 작품 피드백 댓글 실시간 로그 (100건)</h2>
          <div className="table-scroll-box" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr><th>피드백ID</th><th>작품ID</th><th>학생명</th><th>담당 강사명</th><th>피드백 및 질의응답 세부 내역</th><th>작성 일시</th><th>삭제</th></tr>
              </thead>
              <tbody>
                {feedbacks.map(fbk => (
                  <tr key={fbk.id}>
                    <td><strong>{fbk.id}</strong></td>
                    <td>{fbk.artId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{fbk.studentName}</strong></td>
                    <td><small>{fbk.instructorName}</small></td>
                    <td><small>{fbk.comment}</small></td>
                    <td><small style={{ color: 'var(--color-success)' }}>{fbk.createdAt}</small></td>
                    <td><button className="delete-btn-sm" onClick={() => deleteFeedback(fbk.id)}>🗑️ 삭제 (E4)</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc" style={{ display: 'block', marginBottom: '1rem' }}>* 피드백 댓글 삭제 시 목록에서는 소거되나 학생별 평균점수, 강사별 평가량, 반별 제출률 통계 수치에는 삭제 전 결과 잔존 (Error 4)</small>

          <h2>📋 미술학원 관제 통합 감사 로그 (90건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr><th>로그ID</th><th>작품ID</th><th>담당 직책</th><th>처리 내역</th><th>일시</th></tr>
              </thead>
              <tbody>
                {activityLogs.map(log => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.artId}</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{log.operator}</strong></td>
                    <td><small>{log.action}</small></td>
                    <td><small>{log.timestamp}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedConfirmScore('ART-7001')}>🔒 권한 없는 강사의 점수 확정 시도 (Error 7)</button>
            <small className="warn-desc" style={{ display: 'block', marginTop: '0.25rem' }}>* HTTP 403 반환이지만 백엔드 감사 로그에는 점수 확정 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
