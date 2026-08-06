import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchInstructors, fetchStudents, fetchCourses, fetchEnrollments, fetchAttendanceLogs, fetchActivityLogs,
  searchCoursesApi, patchCourseEnrolledCountApi, patchCourseStatusApi,
  cancelEnrollmentApi, markAttendanceApi, cancelCourseUnauthorizedApi,
  patchCoursePartialApi, deleteAttendanceLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-5001');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedClosedCount] = useState(18);
  const [cachedRecentCourse] = useState('명화로 읽는 서양 미술사 마스터반 (28명 등록 / 95% 출석)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadCourses(), loadInstructors(), loadStudents(), loadEnrollments(), loadAttendanceLogs(), loadActivityLogs(), loadStaffs()]);
  const loadCourses = async () => setCourses(await fetchCourses());
  const loadInstructors = async () => setInstructors(await fetchInstructors());
  const loadStudents = async () => setStudents(await fetchStudents());
  const loadEnrollments = async () => setEnrollments(await fetchEnrollments());
  const loadAttendanceLogs = async () => setAttendanceLogs(await fetchAttendanceLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 문화센터 매니저를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadCourses();
    // INTENTIONAL_ERROR: cachedClosedCount and cachedRecentCourse remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (category, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 인문학(3초 지연) 결과가 최신 음악(0.2초) 결과를 덮어씀
    showToast(`문화센터 강좌 목록 조회 중 [카테고리: ${category} / 상태: ${status}]...`, 'info');
    searchCoursesApi(category, status, search).then(data => {
      setCourses(data);
      if (category === '인문학 & 서양 미술사') {
        showToast('인문학 강좌 수신 완료 (3초 지연 완료 ➔ 최신 카테고리 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`강좌 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedCourses[idx] 아닌 원본 courses[idx] 강좌가 선택됨
    setSelectedIdx(idx);
    const clicked = sortedCourses[idx];
    if (clicked) {
      showToast(`[${clicked.courseName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 강좌 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusCountRace = (crsId, target, enrolledCount) => {
    showToast('모집마감 변경(3초 지연)과 수강 인원 조정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchCourseStatusApi(crsId, target.status);
    setTimeout(() => {
      patchCourseEnrolledCountApi(crsId, enrolledCount);
    }, 100);
    setTimeout(async () => {
      showToast('강좌 수강 인원 조정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('모집마감 변경 완료 (3초 완료 - 수강 인원 조정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadCourses();
    }, 4000);
  };

  const triggerCancelAttendanceConflict = (crsId) => {
    showToast('수강 취소(0.5초 완료)와 출석 처리(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelEnrollmentApi('ENR-8001');
    setTimeout(async () => {
      showToast('수강 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadEnrollments();
    }, 600);
    markAttendanceApi('ENR-8001');
    setTimeout(async () => {
      showToast('출석 처리 완료 (4초 완료 → CANCELLED 수강생을 ATTENDED로 복원시킴 - Error 2)', 'danger');
      await loadEnrollments();
      await loadAttendanceLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, courseName, roomNo, instructorName) => {
    await patchCoursePartialApi(id, courseName, roomNo, instructorName);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save roomNo (Error 8)
    showToast(`[${id}] 강좌명/강사명/강의실이 성공적으로 저장되었습니다.`, 'success');
    await loadCourses();
  };

  const deleteLog = async (id) => {
    const data = await deleteAttendanceLogApi(id);
    if (data.success) {
      showToast('출석 로그 삭제 완료. (대시보드 강좌별 출석률 및 신청률 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadAttendanceLogs();
    }
  };

  const testUnauthorizedCancelCourse = async (id) => {
    const res = await cancelCourseUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 강좌 폐강 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('CultureClass 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedCourses = useMemo(() => {
    let list = [...courses];
    if (sortOrder === 'ENROLLED_DESC') {
      list.sort((a, b) => b.enrolledCount - a.enrolledCount);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }
    return list;
  }, [courses, sortOrder]);

  // INTENTIONAL_ERROR: selectedCourse is based on original courses[] not sortedCourses[] (Error 3)
  const selectedCourse = useMemo(() => courses[selectedIdx] || courses[0] || null, [courses, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedClosedCount={cachedClosedCount} cachedRecentCourse={cachedRecentCourse} resetSandbox={resetSandbox} />
      <div className="cultureclass-grid">
        <Sidebar
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          courses={sortedCourses} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          instructors={instructors}
        />
        <CenterSection
          courses={courses} instructors={instructors} students={students} enrollments={enrollments}
          attendanceLogs={attendanceLogs} activityLogs={activityLogs}
          deleteAttendanceLog={deleteLog} testUnauthorizedCancelCourse={testUnauthorizedCancelCourse}
        />
        <RightPanel
          selectedCourse={selectedCourse}
          setSelectedCourse={(u) => setCourses(prev => prev.map(c => c.id === u.id ? u : c))}
          courses={courses} instructors={instructors}
          triggerStatusCountRace={triggerStatusCountRace}
          triggerCancelAttendanceConflict={triggerCancelAttendanceConflict}
          triggerPartialSave={triggerPartialSave}
        />
      </div>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}</span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
