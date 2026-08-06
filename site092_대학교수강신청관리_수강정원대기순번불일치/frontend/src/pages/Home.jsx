import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import CourseEditModal from '../components/CourseEditModal.jsx';
import {
  fetchAdmins,
  fetchCourses,
  fetchStudents,
  fetchRegistrations,
  fetchWaitlists,
  fetchCart,
  searchCoursesApi,
  addToCartApi,
  registerCourseApi,
  cancelRegistrationApi,
  autoPromoteWaitlistApi,
  updateCourseCapacityApi,
  patchCoursePartialApi,
  deleteRegistrationApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [activeStudent, setActiveStudent] = useState('STD-202601');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedCredits, setCachedCredits] = useState(15);
  const [cachedRecentCourse, setCachedRecentCourse] = useState('CS101 (자바 프로그래밍 응용)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadCourses();
    await loadStudents();
    await loadRegistrations();
    await loadWaitlists();
    await loadCart();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadCourses = async () => {
    const data = await fetchCourses();
    setCourses(data);
  };

  const loadStudents = async () => {
    const data = await fetchStudents();
    setStudents(data);
  };

  const loadRegistrations = async () => {
    const data = await fetchRegistrations();
    setRegistrations(data);
  };

  const loadWaitlists = async () => {
    const data = await fetchWaitlists();
    setWaitlists(data);
  };

  const loadCart = async () => {
    const data = await fetchCart();
    setCartItems(data);
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

  // Student Session Switch (Error 6 Target)
  const handleStudentSwitch = (studentId) => {
    setActiveStudent(studentId);
    showToast(`로그인 계정을 [${studentId}] 학생으로 전환합니다.`, 'info');
    loadCourses();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 학생 A가 시간표를 본 뒤 학생 B로 로그인하면 강의 목록은 B 기준으로 바뀌지만, 
    // 상단 신청 학점(cachedCredits) 및 최근 신청 강의 요약 캐시(cachedRecentCourse)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Cart & Register Race condition (Error 1 Trigger)
  const triggerCartRegisterRace = (crs, studentId) => {
    showToast('장바구니 담기(3초 지연)와 수강신청(0.1초)을 순차 실행합니다.', 'info');

    // 1. Add to Cart (3.0s delay with DB snapshot)
    addToCartApi(studentId, crs.id, crs.name);

    // 2. Register Course (0.1s done)
    setTimeout(() => {
      registerCourseApi(studentId, '김코딩', crs.id, crs.name, crs.credits);
    }, 100);

    setTimeout(async () => {
      showToast('수강신청 완료 (신청은 0.1초 만에 성공했으나 3초 뒤 장바구니 저장 완료로 이미 신청한 강의가 장바구니에 다시 남게 됨)', 'warning');
      await loadRegistrations();
      await loadCart();
    }, 4500);
  };

  // Dept search race condition (Error 5 Trigger)
  const triggerSearchRace = (dept, type) => {
    showToast(`개설 학과 강의 목록을 조회합니다: [${dept} / ${type}]`, 'info');

    if (dept === '컴퓨터공학과') {
      searchCoursesApi('컴퓨터공학과', type).then(data => {
        setCourses(data);
        showToast('컴퓨터공학과 강의 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (dept === 'AI융합학부') {
      searchCoursesApi('AI융합학부', type).then(data => {
        setCourses(data);
        showToast('AI융합학부 강의 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchCoursesApi(dept, type).then(data => {
        setCourses(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 강의 목록을 인기순 또는 잔여좌석순으로 정렬한 뒤 수강신청 버튼을 누르면 
    // 사용자가 클릭한 강의가 아니라 정렬 전 원본 배열의 같은 index 강의가 신청되는 결함입니다.
    setSelectedCourseIndex(index);
    const clickedCourse = sortedCourses[index];
    if (clickedCourse) {
      showToast(`[${clickedCourse.name}] 수강신청 시도 알림 (실제 백엔드 저장 데이터에는 인덱스 불일치 다른 강의 ID가 저장됨)`, 'warning');
    }
  };

  // Cancel & Auto Promote Conflict (Error 2 Trigger)
  const triggerCancelAutoPromoteConflict = (crs) => {
    showToast('수강신청 취소 처리와 대기자 자동 승인을 진행합니다.', 'info');

    const targetReg = registrations.find(r => r.courseId === crs.id) || registrations[0];

    // 1. Cancel Registration (0.5s done)
    cancelRegistrationApi(targetReg.id);

    // 2. Auto Promote Waitlist (4.0s delay with conflict overwrite)
    setTimeout(async () => {
      const targetWait = waitlists[0];
      if (targetWait) {
        await autoPromoteWaitlistApi(targetWait.id);
      }
      showToast('수강신청 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadRegistrations();
    }, 100);

    setTimeout(async () => {
      showToast('대기자 자동 승인 응답 완료 (4초 지연 완료: 취소한 학생의 상태를 다시 REGISTERED 수강중으로 바꿔버림)', 'danger');
      await loadRegistrations();
    }, 4500);
  };

  // Partial Course Save (Error 8 Trigger)
  const triggerPartialCourseSave = async (id, classroom, capacity, professorName) => {
    await patchCoursePartialApi(id, classroom, capacity, professorName);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 강의 정보 수정 모달에서 강의실, 정원, 담당교수를 동시에 수정하면 백엔드는 강의실과 정원만 저장하고 
    // 담당교수는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('강의실, 수강 정원, 담당교수가 성공적으로 수정되었습니다.', 'success');
    await loadCourses();
  };

  // Delete Registration (Error 4 Target)
  const deleteRegistration = async (id) => {
    const data = await deleteRegistrationApi(id);
    if (data.success) {
      showToast('수강신청 내역을 삭제했습니다. (강의별 수강인원 enrolledCount 및 정원 그래프 수치에는 계속 유지됨)', 'warning');
      await loadRegistrations();
    }
  };

  // Test Unauthorized Capacity Update (Error 7 Trigger)
  const testUnauthorizedCapacity = async (id) => {
    try {
      const res = await updateCourseCapacityApi(id, 60, 'TA');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 정원 변경 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (courseId, classroom, capacity, professorName) => {
    await patchCoursePartialApi(courseId, classroom, capacity, professorName);
    showToast(`[${courseId}] 강의 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedCourseForModal(null);
    await loadCourses();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('UniCourse 수강신청 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedCourseIndex(0);
    await loadAll();
  };

  const sortedCourses = useMemo(() => {
    let list = [...courses];
    if (filterDept !== 'ALL') {
      list = list.filter(c => c.dept === filterDept);
    }
    if (sortOrder === 'POPULARITY_DESC') {
      list.sort((a, b) => b.popularity - a.popularity);
    } else if (sortOrder === 'SEATS_ASC') {
      list.sort((a, b) => (a.capacity - a.enrolledCount) - (b.capacity - b.enrolledCount));
    }
    return list;
  }, [courses, filterDept, sortOrder]);

  // Selected Course for RightPanel (Error 3 Effect)
  const selectedCourseForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedCourses[selectedCourseIndex] || courses[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted courses array
      return courses[selectedCourseIndex] || courses[0];
    }
  }, [sortedCourses, courses, selectedCourseIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeStudent={activeStudent}
        handleStudentSwitch={handleStudentSwitch}
        cachedCredits={cachedCredits}
        cachedRecentCourse={cachedRecentCourse}
        resetSandbox={resetSandbox}
      />

      <div className="unicourse-grid">
        <Sidebar
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          filterType={filterType}
          setFilterType={setFilterType}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          courses={sortedCourses}
          selectedCourseIndex={selectedCourseIndex}
          setSelectedCourseIndex={setSelectedCourseIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          courses={courses}
          registrations={registrations}
          waitlists={waitlists}
          cartItems={cartItems}
          deleteRegistration={deleteRegistration}
          openCourseModal={(crs) => setSelectedCourseForModal(crs)}
          testUnauthorizedCapacity={testUnauthorizedCapacity}
        />

        <RightPanel
          selectedCourse={selectedCourseForPanel}
          setSelectedCourse={(updated) => {
            setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
          }}
          activeStudent={activeStudent}
          triggerCartRegisterRace={triggerCartRegisterRace}
          triggerCancelAutoPromoteConflict={triggerCancelAutoPromoteConflict}
          triggerPartialCourseSave={triggerPartialCourseSave}
        />
      </div>

      <CourseEditModal
        course={selectedCourseForModal}
        onClose={() => setSelectedCourseForModal(null)}
        onConfirm={handleModalConfirm}
      />

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
