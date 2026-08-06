import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import StudentEditModal from '../components/StudentEditModal.jsx';
import {
  fetchStaffs,
  fetchStudents,
  fetchRooms,
  fetchApplications,
  fetchActivityLogs,
  searchStudentsApi,
  patchStudentRoomApi,
  patchStudentStatusApi,
  checkoutStudentApi,
  updateRoomOccupancyApi,
  forceChangeRoomUnauthorizedApi,
  patchStudentPartialApi,
  approveApplicationApi,
  deleteAllocationLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STAFF-4001');
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedAppIndex, setSelectedAppIndex] = useState(0);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedWaitingApplicants, setCachedWaitingApplicants] = useState(22);
  const [cachedRecentStudent] = useState('김동남 (컴퓨터공학과 / 명덕관 301호 / GPA 4.12)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadStaffs();
    await loadStudents();
    await loadRooms();
    await loadApplications();
    await loadActivityLogs();
  };

  const loadStaffs = async () => {
    const data = await fetchStaffs();
    setStaffs(data);
  };

  const loadStudents = async () => {
    const data = await fetchStudents();
    setStudents(data);
  };

  const loadRooms = async () => {
    const data = await fetchRooms();
    setRooms(data);
  };

  const loadApplications = async () => {
    const data = await fetchApplications();
    setApplications(data);
  };

  const loadActivityLogs = async () => {
    const data = await fetchActivityLogs();
    setActivityLogs(data);
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

  // Staff Session Switch (Error 6 Target)
  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 사감/관장을 [${staffId}] 권한으로 변경합니다.`, 'info');
    loadStudents();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A가 학생 상세를 본 뒤 직원 B로 로그인하면 학생 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 대기자 수(cachedWaitingApplicants) 및 최근 학생 상세 캐시(cachedRecentStudent)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Room & Status update race condition (Error 1 Trigger)
  const triggerRoomStatusRace = (stu) => {
    showToast('배정 호실 변경(3초 지연)과 입사 상태 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Status update (0.1s done)
    patchStudentStatusApi(stu.id, stu.status);

    // 2. Room update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchStudentRoomApi(stu.id, stu.roomNo);
    }, 100);

    setTimeout(async () => {
      showToast('학생 배정 호실 변경 완료 (호실은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 상태와 구 호실 조합이 롤백 저장됨)', 'warning');
      await loadStudents();
    }, 4500);
  };

  // Dorm building search race condition (Error 5 Trigger)
  const triggerSearchRace = (dormBuilding, search) => {
    showToast(`기숙사동 학생 목록을 조회합니다: [${dormBuilding} / ${search}]`, 'info');

    if (dormBuilding === '명덕관') {
      searchStudentsApi('명덕관', 'ALL', search).then(data => {
        setStudents(data);
        showToast('명덕관 학생 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (dormBuilding === '진리관') {
      searchStudentsApi('진리관', 'ALL', search).then(data => {
        setStudents(data);
        showToast('진리관 학생 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchStudentsApi(dormBuilding, 'ALL', search).then(data => {
        setStudents(data);
      });
    }
  };

  // Sort Open Approve Index Mismatch (Error 3 Target)
  const openApproveMismatch = async (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 입사 신청 목록을 성적순/신청일순으로 정렬한 뒤 승인 버튼을 누르면 
    // 사용자가 클릭한 학생이 아니라 정렬 전 원본 배열의 같은 index 학생 신청이 승인되는 결함입니다.
    const clickedApp = sortedApplications[index];
    if (clickedApp) {
      showToast(`[${clickedApp.studentName}] 입사 신청 승인 완료 (백엔드에는 인덱스 불일치 다른 학생 신청이 승인 저장됨)`, 'warning');
      const rawTarget = applications[index];
      if (rawTarget) {
        await approveApplicationApi(rawTarget.id);
        await loadApplications();
        await loadStudents();
      }
    }
  };

  // Checkout Student & Room Occupancy Conflict (Error 2 Trigger)
  const triggerCheckoutOccupancyConflict = (stu) => {
    showToast('퇴사 처리와 호실 점유 상태 갱신을 연쇄 진행합니다.', 'info');

    // 1. Checkout Student (0.5s done, status = CHECKED_OUT)
    checkoutStudentApi(stu.id);

    // 2. Room Occupancy Update (4.0s delay with restore to CHECKED_IN)
    setTimeout(async () => {
      const targetRoom = rooms.find(r => r.roomNo === stu.roomNo);
      if (targetRoom) {
        await updateRoomOccupancyApi(targetRoom.id);
      }
      showToast('퇴사 처리 응답 완료 (0.5초 완료)', 'warning');
      await loadStudents();
    }, 100);

    setTimeout(async () => {
      showToast('호실 점유 갱신 응답 완료 (4초 지연 완료: 퇴사한 학생을 CHECKED_IN 입사중 상태로 복원시킴)', 'danger');
      await loadStudents();
      await loadRooms();
    }, 4500);
  };

  // Partial Student Save (Error 8 Trigger)
  const triggerPartialStudentSave = async (id, phone, parentPhone, preferredRoommate) => {
    await patchStudentPartialApi(id, phone, parentPhone, preferredRoommate);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 학생 정보 수정 모달에서 연락처, 보호자 연락처, 희망 룸메이트를 동시에 수정하면 백엔드는 연락처와 희망 룸메이트만 저장하고 
    // 보호자 연락처는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('연락처, 보호자 연락처, 희망 룸메이트가 성공적으로 저장되었습니다.', 'success');
    await loadStudents();
  };

  // Delete Allocation Log (Error 4 Target)
  const deleteAllocationLog = async (id) => {
    const data = await deleteAllocationLogApi(id);
    if (data.success) {
      showToast('호실 배정 로그를 삭제했습니다. (층별 점유율 및 성별 배정 수치에는 계속 유지됨)', 'warning');
      await loadActivityLogs();
    }
  };

  // Test Unauthorized Force Change (Error 7 Trigger)
  const testUnauthorizedForceChange = async (id) => {
    try {
      const res = await forceChangeRoomUnauthorizedApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 호실 강제 변경 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (stuId, phone, parentPhone, preferredRoommate) => {
    await patchStudentPartialApi(stuId, phone, parentPhone, preferredRoommate);
    showToast(`[${stuId}] 학생 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedStudentForModal(null);
    await loadStudents();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('DormLink 기숙사 행정 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedAppIndex(0);
    await loadAll();
  };

  const sortedApplications = useMemo(() => {
    let list = [...applications];
    if (filterBuilding !== 'ALL') {
      list = list.filter(a => a.dormBuilding === filterBuilding);
    }
    if (searchTerm) {
      list = list.filter(a => a.studentName.includes(searchTerm) || a.studentId.includes(searchTerm) || a.id.includes(searchTerm));
    }
    if (sortOrder === 'GPA_DESC') {
      list.sort((a, b) => b.gpa - a.gpa);
    } else if (sortOrder === 'DATE_ASC') {
      list.sort((a, b) => a.appDate.localeCompare(b.appDate));
    }
    return list;
  }, [applications, filterBuilding, searchTerm, sortOrder]);

  const selectedStudentForPanel = useMemo(() => {
    return students[0] || null;
  }, [students]);

  return (
    <div id="app">
      <Header
        activeStaff={activeStaff}
        handleStaffSwitch={handleStaffSwitch}
        cachedWaitingApplicants={cachedWaitingApplicants}
        cachedRecentStudent={cachedRecentStudent}
        resetSandbox={resetSandbox}
      />

      <div className="dormlink-grid">
        <Sidebar
          filterBuilding={filterBuilding}
          setFilterBuilding={setFilterBuilding}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          applications={sortedApplications}
          selectedAppIndex={selectedAppIndex}
          setSelectedAppIndex={setSelectedAppIndex}
          openApproveMismatch={openApproveMismatch}
        />

        <CenterSection
          students={students}
          rooms={rooms}
          applications={applications}
          activityLogs={activityLogs}
          deleteAllocationLog={deleteAllocationLog}
          openStudentModal={(s) => setSelectedStudentForModal(s)}
          testUnauthorizedForceChange={testUnauthorizedForceChange}
        />

        <RightPanel
          selectedStudent={selectedStudentForPanel}
          setSelectedStudent={(updated) => {
            setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
          }}
          students={students}
          rooms={rooms}
          triggerRoomStatusRace={triggerRoomStatusRace}
          triggerCheckoutOccupancyConflict={triggerCheckoutOccupancyConflict}
          triggerPartialStudentSave={triggerPartialStudentSave}
        />
      </div>

      <StudentEditModal
        student={selectedStudentForModal}
        onClose={() => setSelectedStudentForModal(null)}
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
