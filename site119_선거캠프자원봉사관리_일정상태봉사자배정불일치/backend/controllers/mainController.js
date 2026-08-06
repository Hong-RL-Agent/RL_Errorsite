import { readDB, writeDB } from '../services/dataService.js';

export const getStaffs = (req, res) => res.json(readDB().staffs);
export const getDistricts = (req, res) => res.json(readDB().districts);
export const getVolunteers = (req, res) => res.json(readDB().volunteers);
export const getSchedules = (req, res) => res.json(readDB().schedules);
export const getReports = (req, res) => res.json(readDB().reports);
export const getAssignmentLogs = (req, res) => res.json(readDB().assignmentLogs);
export const getActivityLogs = (req, res) => res.json(readDB().activityLogs);

export const searchSchedules = (req, res) => {
  const { districtId, status, search } = req.query;
  const db = readDB();
  let list = db.schedules;
  if (districtId && districtId !== 'ALL') list = list.filter(s => s.districtId === districtId);
  if (status && status !== 'ALL') list = list.filter(s => s.status === status);
  if (search) list = list.filter(s => s.title.includes(search) || s.location.includes(search) || s.assignedVolunteerName.includes(search));

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 지역 필터('DIS-01' 3초 지연 ➔ 'DIS-02' 0.2초 완료)와 일정 상태 필터를 빠르게 변경 시
  // 오래된 이전 응답(DIS-01)이 최신 일정 목록을 덮어쓰고, 일정 목록은 오래된 필터 결과,
  // 오른쪽 요약은 최신 필터 기준으로 표시되어 서로 불일치하는 결함입니다.
  let delay = 100;
  if (districtId === 'DIS-01') delay = 3000;
  else if (districtId === 'DIS-02') delay = 200;

  setTimeout(() => res.json(list), delay);
};

export const updateScheduleVolunteer = (req, res) => {
  const { id } = req.params;
  const { assignedVolunteerId, assignedVolunteerName } = req.body;
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.assignedVolunteerId = assignedVolunteerId;
      sch.assignedVolunteerName = assignedVolunteerName;
      writeDB(db);
      console.log(`[DB VOLUNTEER UPDATE] Schedule ${id} volunteer set to ${assignedVolunteerName} (0.1s done)`);
    }
    res.json({ success: true, sch });
  }, 100);
};

export const updateScheduleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 일정 상태를 진행확정(CONFIRMED - 3초 지연 완료)으로 변경한 직후 봉사자를 변경(0.1초 완료)하면,
  // 봉사자 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 일정 상태 변경 API가
  // 요청 시작 시점의 구 DB 스냅샷(이전 봉사자)을 덮어써 저장하여 새로고침 시
  // 일정 목록의 봉사자와 상세 패널의 봉사자가 서로 달라지는 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Snapshot captured at request start!
  setTimeout(() => {
    const sch = dbSnapshot.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = status;
      writeDB(dbSnapshot); // Overwrites DB, rolling back volunteer assignment!
      console.log(`[DB STATUS UPDATE] Schedule ${id} status set to ${status} (3s done, rolled back volunteer update)`);
    }
    res.json({ success: true, sch });
  }, 3000);
};

export const cancelSchedule = (req, res) => {
  const { id } = req.params;
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL SCH] Schedule ${id} status set to CANCELLED (0.5s done)`);
    }
    res.json({ success: true, sch });
  }, 500);
};

export const addFieldReport = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 일정 취소 API(0.5초 완료)를 호출한 직후 현장 보고 등록 API를 호출(4초 지연 완료)하면,
  // 일정 취소는 성공하지만 늦게 완료된 현장 보고 등록 요청(4초 지연)이 취소된 일정을 다시 'COMPLETED'(진행완료) 상태로 바꿔버립니다.
  // 일정 목록에서는 취소됨(CANCELLED), 현장 보고에서는 진행완료(COMPLETED)로 서로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const sch = db.schedules.find(s => s.id === id);
    if (sch) {
      sch.status = 'COMPLETED'; // INTENTIONAL_ERROR: Overwrites CANCELLED back to COMPLETED!
      console.log(`[DB RESTORE STATUS] Re-activated schedule ${id} back to COMPLETED status via field report!`);
    }
    writeDB(db);
    res.json({ success: true, sch });
  }, 4000);
};

export const confirmScheduleUnauthorized = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-staff-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 사용자(role !== 'MANAGER')가 일정 확정 API를 호출하면 HTTP 403 Forbidden을 반환하지만,
  // 서버 내부 활동 감사 로그에는 '일정 확정 성공 (SCHEDULE CONFIRMED SUCCESSFULLY - 200 OK)'으로 잘못 기록되는 결함입니다.
  if (roleHeader && roleHeader !== 'MANAGER') {
    console.log(`[SERVER AUDIT LOG] SCHEDULE CONFIRMED SUCCESSFULLY for schedule ${id} (Status 200 OK)`); // INTENTIONAL_ERROR: Logs as SUCCESS!
    return res.status(403).json({ error: "Unauthorized: Campaign manager role required to confirm schedule" });
  }
  const db = readDB();
  const sch = db.schedules.find(s => s.id === id);
  if (sch) { sch.status = 'CONFIRMED'; writeDB(db); }
  res.json({ success: true, sch });
};

export const updateVolunteerPartial = (req, res) => {
  const { id } = req.params;
  const { name, phone, assignedDistrictId } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 봉사자 정보 수정 모달에서 이름, 연락처, 담당지역을 동시에 수정하면,
  // backend data.json에는 이름(name)과 담당지역(assignedDistrictId)만 저장하고 연락처(phone)는 이전 값을 그대로 유지하지만,
  // 프론트엔드는 세 항목 모두 저장 성공한 것으로 표시하는 partial save 결함입니다.
  const db = readDB();
  const vol = db.volunteers.find(v => v.id === id);
  if (vol) {
    if (name) vol.name = name;
    if (assignedDistrictId) {
      vol.assignedDistrictId = assignedDistrictId;
      const dist = db.districts.find(d => d.id === assignedDistrictId);
      if (dist) vol.districtName = dist.name;
    }
    // phone is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated name and assignedDistrictId for volunteer ${id}. phone was NOT updated.`);
  }
  res.json({ success: true, vol });
};

export const deleteAssignmentLog = (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.assignmentLogs = db.assignmentLogs.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 배정 로그를 삭제(`DELETE /api/assignment-logs/:id`) 처리하여 로그 목록에서 소거하더라도,
  // campaignStats(지역별 참여율, 봉사자별 활동 횟수, 행사 완료율 통계) 수치에는 차감되지 않고 계속 잔존하는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE LOG] Removed assignment log ${id}. campaignStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    staffs: [{ id: "STF-4001", name: "김캠프 (선거대책 총괄본부장)", role: "MANAGER", dept: "중앙 선거대책본부", managedSchedules: 62 }],
    districts: [{ id: "DIS-01", name: "종로구 선거구", headquarters: "종로 중앙 캠프", targetVoters: 120000, assignedVolunteers: 18 }],
    volunteers: [{ id: "VOL-1001", name: "강열정", phone: "010-1234-5678", assignedDistrictId: "DIS-01", districtName: "종로구 선거구", activeHours: 45, status: "AVAILABLE" }],
    schedules: [{ id: "SCH-2001", title: "종로 출근길 인사 및 정책 피켓 유세", districtId: "DIS-01", districtName: "종로구 선거구", location: "종각역 4번 출구", eventDate: "2026-08-05", startTime: "07:30", endTime: "09:00", requiredCount: 10, assignedVolunteerId: "VOL-1001", assignedVolunteerName: "강열정", status: "CONFIRMED" }],
    reports: [{ id: "RPT-5001", scheduleId: "SCH-2001", scheduleTitle: "종로 출근길 인사", reporterName: "강열정", voterFeedback: "정책 피켓 호응도 매우 높음, 추가 소책자 필요", photoCount: 4, reportTime: "2026-08-05 09:15:00", status: "COMPLETED" }],
    assignmentLogs: [{ id: "ALOG-3001", scheduleId: "SCH-2001", volunteerName: "강열정", districtName: "종로구 선거구", assignedDate: "2026-08-04", hours: 2 }],
    activityLogs: [{ id: "ACT-6001", scheduleId: "SCH-2001", operator: "김캠프 (총괄본부장)", action: "종로 출근길 인사 일정 진행확정 승인 및 강열정 봉사자 배정 완료", timestamp: "2026-08-04 18:00:00", status: "SUCCESS" }],
    campaignStats: { totalSchedules: 45, confirmedCount: 22, inProgressCount: 8, completedCount: 12, totalVolunteers: 60, avgParticipationRate: 88.5, totalVotersReached: 350000 }
  };
  writeDB(initial);
  res.json({ success: true });
};
