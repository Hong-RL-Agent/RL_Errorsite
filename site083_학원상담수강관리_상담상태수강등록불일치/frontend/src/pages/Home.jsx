import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStudents,
  fetchConsultations,
  fetchCourses,
  searchCoursesApi,
  fetchAttendance,
  patchConsultationStatusApi,
  patchConsultationTimeApi,
  cancelEnrollmentApi,
  checkAttendanceApi,
  enrollCourseApi,
  deleteConsultationApi,
  patchAttendanceUnauthorizedApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [students, setStudents] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [activeCounselor, setActiveCounselor] = useState('CNS-01');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [closingSoonSortOrder, setClosingSoonSortOrder] = useState('NONE');

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale status cache for Error 1
  const [previousStatusCache, setPreviousStatusCache] = useState('RESERVED');

  // Counselor session stats cache (Error 6 Target)
  const [cachedStudentDetail, setCachedStudentDetail] = useState('김철수 학생 (서울대 컴퓨터공학과 목표)');
  const [cachedPendingConsultCount, setCachedPendingConsultCount] = useState(18);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadStudents();
    await loadConsultations();
    await loadCourses();
    await loadAttendance();
  };

  const loadStudents = async () => {
    const data = await fetchStudents();
    setStudents(data);
    if (data.length > 0 && !selectedStudent) {
      setSelectedStudent(data[0]);
    }
  };

  const loadConsultations = async () => {
    const data = await fetchConsultations();
    setConsultations(data);
    if (data.length > 0 && !selectedConsultation) {
      setSelectedConsultation(data[0]);
      setPreviousStatusCache(data[0].status);
    }
  };

  const loadCourses = async () => {
    const data = await fetchCourses();
    setCourses(data);
    if (data.length > 0 && !selectedCourse) {
      setSelectedCourse(data[0]);
    }
  };

  const loadAttendance = async () => {
    const data = await fetchAttendance();
    setAttendance(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Counselor Session Switch (Error 6 Target)
  const handleCounselorSwitch = (counselorId) => {
    setActiveCounselor(counselorId);
    showToast(`로그인 상담사 계정을 [${counselorId}] 회원으로 변경합니다.`, 'info');
    loadConsultations();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 상담사 A가 본 학생 상담 기록을 열어둔 상태에서 상담사 B로 로그인하면 학생 목록은 B 권한 기준으로 바뀌지만, 
    // 오른쪽 상담 상세 및 상담 예정 건수 캐시(cachedStudentDetail, cachedPendingConsultCount)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Time & Status update race (Error 1 Trigger)
  const triggerTimeStatusRace = (cs) => {
    showToast('상담 예약 시간 조정과 상태 변경을 순차 요청합니다.', 'info');

    patchConsultationStatusApi(cs.id, cs.status);

    setTimeout(() => {
      patchConsultationTimeApi(cs.id, cs.date, cs.timeSlot, previousStatusCache);
    }, 100);

    setPreviousStatusCache(cs.status);

    setTimeout(async () => {
      showToast('시간 변경 완료 (시간대는 갱신되었으나 3초 지연 완료로 상담 상태가 이전 값으로 롤백 저장됨)', 'warning');
      await loadConsultations();
    }, 4500);
  };

  // Subject & Grade search race condition (Error 5 Trigger)
  const triggerSearchRace = (subject, grade) => {
    showToast(`강좌 검색 필터를 조회합니다: [${subject} / ${grade}]`, 'info');

    if (subject === 'MATH') {
      searchCoursesApi('MATH', grade).then(data => {
        setCourses(data);
        showToast('수학 과목 강좌 검색 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (subject === 'ENGLISH') {
      searchCoursesApi('ENGLISH', grade).then(data => {
        setCourses(data);
        showToast('영어 과목 강좌 검색 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchCoursesApi(subject, grade).then(data => {
        setCourses(data);
      });
    }
  };

  // ClosingSoon Sort Course Enroll Index Mismatch (Error 3 Target)
  const confirmCourseEnroll = async (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 강좌 목록을 마감임박순으로 정렬한 뒤 수강 신청 버튼을 누르면 
    // 사용자가 클릭한 강좌가 아니라 정렬 전 배열의 같은 index 강좌로 수강 신청되어 저장되는 결함입니다.
    const targetCourse = courses[index];
    if (!targetCourse) {
      showToast('강좌 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }

    showToast(`[${targetCourse.title}] 수강 신청 알림 표시 완료 (실제 backend DB에는 인덱스 불일치 강좌 id로 저장됨)`, 'warning');
    await enrollCourseApi(targetCourse.id, '학생');
    await loadCourses();
  };

  // Cancel Enrollment & Attendance Conflict (Error 2 Trigger)
  const triggerCancelAttendanceConflict = (std) => {
    showToast('수강 취소 처리와 출결 체크를 진행합니다.', 'info');

    // 1. Cancel Enrollment (0.5s done)
    cancelEnrollmentApi(std.id);

    // 2. Check Attendance & Re-activate (4.0s delay)
    setTimeout(async () => {
      await checkAttendanceApi(std.id, 'CRS-01', 'PRESENT');
      showToast('수강 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadStudents();
    }, 100);

    setTimeout(async () => {
      showToast('출결 체크 완료 (4초 지연 완료: 취소된 수강생을 다시 ENROLLED 수강중 상태로 재활성화시킴)', 'danger');
      await loadStudents();
    }, 4500);
  };

  // Delete Consultation (Error 4 Target)
  const deleteConsultation = async (id) => {
    const data = await deleteConsultationApi(id);
    if (data.success) {
      showToast('상담 기록을 삭제했습니다. (학생별 상담 횟수 및 관리자 상담 전환율 통계 수치에는 계속 유지됨)', 'warning');
      await loadConsultations();
    }
  };

  // Test Unauthorized Attendance Update (Error 7 Trigger)
  const testUnauthorizedAttendanceUpdate = async (id) => {
    try {
      const res = await patchAttendanceUnauthorizedApi(id, 'LATE', 'GUEST_TEACHER');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 로그에는 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('EduBridge 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedConsultation(null);
    await loadAll();
  };

  const sortedCourses = useMemo(() => {
    let list = [...courses];
    if (filterSubject !== 'ALL') {
      list = list.filter(c => c.subject === filterSubject);
    }
    if (closingSoonSortOrder === 'CLOSING_SOON') {
      list.sort((a, b) => (b.closingSoon ? 1 : 0) - (a.closingSoon ? 1 : 0));
    }
    return list;
  }, [courses, filterSubject, closingSoonSortOrder]);

  const counselorConsultations = useMemo(() => {
    return consultations.filter(c => c.counselorId === activeCounselor);
  }, [consultations, activeCounselor]);

  const selectedStudentInfo = useMemo(() => {
    return selectedStudent;
  }, [selectedStudent]);

  return (
    <div id="app">
      <Header
        activeCounselor={activeCounselor}
        handleCounselorSwitch={handleCounselorSwitch}
        cachedStudentDetail={cachedStudentDetail}
        cachedPendingConsultCount={cachedPendingConsultCount}
        resetSandbox={resetSandbox}
      />

      <div className="edubridge-grid">
        <Sidebar
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          filterGrade={filterGrade}
          setFilterGrade={setFilterGrade}
          closingSoonSortOrder={closingSoonSortOrder}
          setClosingSoonSortOrder={setClosingSoonSortOrder}
          triggerSearchRace={triggerSearchRace}
          courses={sortedCourses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          confirmCourseEnroll={confirmCourseEnroll}
        />

        <CenterSection
          consultations={counselorConsultations}
          attendance={attendance}
          deleteConsultation={deleteConsultation}
          testUnauthorizedAttendanceUpdate={testUnauthorizedAttendanceUpdate}
          selectedStudentInfo={selectedStudentInfo}
        />

        <RightPanel
          selectedConsultation={selectedConsultation}
          setSelectedConsultation={setSelectedConsultation}
          triggerTimeStatusRace={triggerTimeStatusRace}
          selectedStudent={selectedStudent}
          triggerCancelAttendanceConflict={triggerCancelAttendanceConflict}
        />
      </div>

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
