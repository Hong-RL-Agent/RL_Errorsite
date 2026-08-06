import React, { useState } from 'react';

export default function CenterSection({
  consultations,
  attendance,
  deleteConsultation,
  testUnauthorizedAttendanceUpdate,
  selectedStudentInfo
}) {
  const [activeTab, setActiveTab] = useState('CONSULTATION_TIMELINE'); // 'CONSULTATION_TIMELINE' | 'ATTENDANCE_MATRIX' | 'KANBAN_BOARD'

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'CONSULTATION_TIMELINE' ? 'active' : ''}`}
          onClick={() => setActiveTab('CONSULTATION_TIMELINE')}
        >
          📝 학원 상담 타임라인 (30건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ATTENDANCE_MATRIX' ? 'active' : ''}`}
          onClick={() => setActiveTab('ATTENDANCE_MATRIX')}
        >
          ⏱️ 학생 출결 현황 체크 (40건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'KANBAN_BOARD' ? 'active' : ''}`}
          onClick={() => setActiveTab('KANBAN_BOARD')}
        >
          📋 관리자 상담 단계별 칸반
        </button>
      </div>

      {activeTab === 'CONSULTATION_TIMELINE' && (
        <div className="widget-section">
          <h2>📝 학원 상담 신청 & 타임라인 기록 (최소 30개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>상담 ID</th>
                  <th>학생명</th>
                  <th>과목</th>
                  <th>담당 상담사</th>
                  <th>상담 일시</th>
                  <th>상담 주제</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map(cs => (
                  <tr key={cs.id}>
                    <td><strong>{cs.id}</strong></td>
                    <td>{cs.studentName}</td>
                    <td><span className="subject-tag">{cs.subject}</span></td>
                    <td>{cs.counselorName}</td>
                    <td>{cs.date} {cs.timeSlot}</td>
                    <td><small>{cs.topic}</small></td>
                    <td><span className={`status-badge ${cs.status.toLowerCase()}`}>{cs.status}</span></td>
                    <td>
                      <button 
                        className="delete-btn-sm"
                        onClick={() => deleteConsultation(cs.id)}
                      >
                        🗑️ 삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 상담 기록 삭제(DELETE) 시 대장에서는 소거되나 학생별 상담 횟수 및 관리자 상담 전환율 통계 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'ATTENDANCE_MATRIX' && (
        <div className="widget-section">
          <h2>⏱️ 학생 일일 출결 체크 대장 (최소 40개)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>출결 ID</th>
                  <th>학생명</th>
                  <th>강좌명</th>
                  <th>출석일자</th>
                  <th>출결 상태</th>
                  <th>보안권한 테스트</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(att => (
                  <tr key={att.id}>
                    <td><strong>{att.id}</strong></td>
                    <td>{att.studentName}</td>
                    <td>{att.courseTitle}</td>
                    <td>{att.date}</td>
                    <td><span className={`status-badge ${att.status.toLowerCase()}`}>{att.status}</span></td>
                    <td>
                      <button 
                        className="delete-btn-sm"
                        onClick={() => testUnauthorizedAttendanceUpdate(att.id)}
                      >
                        🔒 무권한 수정 (Error 7)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 권한 없는 강사가 출결 수정 시 HTTP 403 오류를 반환하지만, 서버 활동 로그에는 수정 성공(Status 200 OK)으로 기록됨 (Error 7)</small>
        </div>
      )}

      {activeTab === 'KANBAN_BOARD' && selectedStudentInfo && (
        <div className="widget-section">
          <h2>📋 관리자 상담 단계별 칸반 보드 및 대시보드</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>상담 대기 (RESERVED)</th>
                  <th>상담 완료 (COMPLETED)</th>
                  <th>상담 취소 (CANCELLED)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>김철수</strong> (영어 빈칸추론)<br/>
                    <strong>박민수</strong> (국어 내신특강)<br/>
                    <strong>강서연</strong> (EBS 수능영어)
                  </td>
                  <td>
                    <strong>김철수</strong> (수학 킬러문항)<br/>
                    <strong>이영희</strong> (미적분 파이널)<br/>
                    <strong>정수진</strong> (영재고 컨설팅)
                  </td>
                  <td>
                    <strong>최동현</strong> (수강 취소 상담)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
