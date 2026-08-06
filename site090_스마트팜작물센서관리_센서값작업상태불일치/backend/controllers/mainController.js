import { readDB, writeDB } from '../services/dataService.js';

export const getAdmins = (req, res) => {
  const db = readDB();
  res.json(db.admins);
};

export const getZones = (req, res) => {
  const db = readDB();
  res.json(db.zones);
};

export const getCrops = (req, res) => {
  const db = readDB();
  res.json(db.crops);
};

export const getSensors = (req, res) => {
  const db = readDB();
  res.json(db.sensors);
};

export const getWorkLogs = (req, res) => {
  const db = readDB();
  res.json(db.workLogs);
};

export const getAlerts = (req, res) => {
  const db = readDB();
  res.json(db.alerts);
};

export const searchSensors = (req, res) => {
  const { zoneId, type } = req.query;
  const db = readDB();
  let list = db.sensors;

  if (zoneId && zoneId !== 'ALL') {
    list = list.filter(s => s.zoneId === zoneId);
  }
  if (type && type !== 'ALL') {
    list = list.filter(s => s.type === type);
  }

  let delay = 100;
  if (zoneId === 'ZN-A1') {
    delay = 3000; // 3.0s delay
  } else if (zoneId === 'ZN-A2') {
    delay = 200; // 0.2s delay
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Network stale response 오류
  // DESCRIPTION: 구역 필터('ZN-A1' 3초 지연 ➔ 'ZN-A2' 0.2초 완료)와 센서 유형 필터를 빠르게 변경 시 
  // 오래된 이전 응답(ZN-A1)이 최신 센서 목록을 덮어쓰고, 센서 카드 목록은 오래된 필터 결과, 오른쪽 통계 패널은 최신 필터 기준 데이터로 불일치하는 결함입니다.
  setTimeout(() => {
    res.json(list);
  }, delay);
};

export const updateIrrigationVolume = (req, res) => {
  const { id } = req.params;
  const { irrigationVolume, scheduledTime } = req.body;

  setTimeout(() => {
    const db = readDB();
    const crp = db.crops.find(c => c.id === id);
    if (crp) {
      crp.irrigationVolume = irrigationVolume;
      if (scheduledTime) {
        crp.scheduledTime = scheduledTime; // Overwrites scheduledTime with stale value!
      }
      writeDB(db);
      console.log(`[DB VOLUME UPDATE] Updated volume for ${id} to ${irrigationVolume}ml (0.1s done) with time ${scheduledTime}`);
    }
    res.json({ success: true, crop: crp });
  }, 100);
};

export const updateIrrigationTime = (req, res) => {
  const { id } = req.params;
  const { scheduledTime } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Backend 요청 순서 충돌
  // DESCRIPTION: 관수 예약 시간을 변경(3초 지연 완료)한 직후 관수량을 변경(0.1초 완료)하면, 
  // 관수량 변경 API는 0.1초 만에 먼저 완료되나 3초 뒤 완료되는 예약 시간 변경 API 내부에 이전 구형 관수량 정보(irrigationVolume)가 동봉 저장되어 
  // 새로고침 시 사용자 본 관수량과 실제 DB 저장 관수량이 서로 달라지는 레이스 컨디션 결함입니다.
  const dbSnapshot = readDB(); // INTENTIONAL_ERROR: Captures DB state before 0.1s volume write
  setTimeout(() => {
    const crp = dbSnapshot.crops.find(c => c.id === id);
    if (crp) {
      crp.scheduledTime = scheduledTime;
      writeDB(dbSnapshot); // Overwrites data.json, rolling back volume changes made during the 3s delay
      console.log(`[DB SCHEDULE TIME UPDATE] Updated time for ${id} to ${scheduledTime} (3s done, rolled back volume update)`);
    }
    res.json({ success: true, crop: crp });
  }, 3000);
};

export const cancelWorkLog = (req, res) => {
  const { id } = req.params;

  setTimeout(() => {
    const db = readDB();
    const wl = db.workLogs.find(w => w.id === id);
    if (wl) {
      wl.status = 'CANCELLED';
      writeDB(db);
      console.log(`[DB CANCEL WORK LOG] Cancelled work log ${id} (0.5s done)`);
    }
    res.json({ success: true, workLog: wl });
  }, 500);
};

export const resolveAlert = (req, res) => {
  const { id } = req.params;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + JSON DB 상태 충돌
  // DESCRIPTION: 관수 작업 취소 API(0.5초 완료)를 호출한 직후 센서 이상 알림 처리 API를 호출(4초 지연 완료)하면, 
  // 취소 요청은 먼저 0.5초 만에 성공하지만 늦게 완료된 알림 처리 요청(4초 지연)이 취소된 관수 작업을 다시 'IN_PROGRESS'(진행중) 상태로 재활성화시킵니다. 
  // 작업 목록에서는 취소됨, 알림 상세에서는 진행중 작업으로 불일치하게 됩니다.
  setTimeout(() => {
    const db = readDB();
    const alt = db.alerts.find(a => a.id === id);
    if (alt) {
      alt.status = 'RESOLVED';
    }

    // Re-activates cancelled work log back to IN_PROGRESS!
    if (db.workLogs.length > 0) {
      db.workLogs[0].status = 'IN_PROGRESS';
      console.log(`[DB RE-ACTIVATE WORK LOG] Re-activated cancelled work log back to IN_PROGRESS status!`);
    }

    writeDB(db);
    res.json({ success: true, alert: alt });
  }, 4000);
};

export const irrigateCrop = (req, res) => {
  const { id } = req.params;
  const roleHeader = req.headers['x-user-role'];

  // INTENTIONAL_ERROR
  // CATEGORY: Backend 권한 로그 오류
  // DESCRIPTION: 권한 없는 직원(role !== 'ADMIN')이 관수 작업 실행 API를 호출하면 HTTP 403을 반환하지만, 
  // 서버 내부 활동 로그에는 '관수 실행 성공 (IRRIGATION EXECUTION SUCCESS - 200 OK)'으로 잘못 기록되어 보안감사 불일치가 발생하는 결함입니다.
  if (roleHeader && roleHeader !== 'ADMIN') {
    console.log(`[SERVER AUDIT LOG] IRRIGATION EXECUTION SUCCESS for crop ${id} (Status 200 OK)`); // LOGS AS SUCCESS!
    return res.status(403).json({ error: "Unauthorized access: Admin privilege required" });
  }

  const db = readDB();
  const crp = db.crops.find(c => c.id === id);
  res.json({ success: true, crop: crp });
};

export const updateCropPartial = (req, res) => {
  const { id } = req.params;
  const { cropName, growthStage, manager } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: 부분 저장 오류
  // DESCRIPTION: 작물 관리 모달에서 작물명, 생육 단계, 담당자를 동시에 수정하면, 
  // backend data.json에는 작물명(cropName)과 생육 단계(growthStage)만 저장하고 담당자(manager)는 이전 값을 그대로 유지하는 partial save 결함입니다.
  const db = readDB();
  const crp = db.crops.find(c => c.id === id);
  if (crp) {
    if (cropName) crp.name = cropName;
    if (growthStage) crp.growthStage = growthStage;
    // manager is INTENTIONALLY NOT UPDATED!
    writeDB(db);
    console.log(`[DB PARTIAL SAVE] Updated cropName and growthStage for crop ${id}. manager was NOT updated.`);
  }
  res.json({ success: true, crop: crp });
};

export const deleteAlert = (req, res) => {
  const { id } = req.params;
  const db = readDB();

  db.alerts = db.alerts.filter(a => a.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: 통계 집계 불일치
  // DESCRIPTION: 센서 이상 로그를 삭제(`DELETE /api/alerts/:id`) 처리하여 이력 대장에서 소거하더라도, 
  // 구역별 이상 발생률(`farmStats.zoneAlertRates`), 작물별 위험도, 대시보드 경고 개수 수치에는 차감되지 않고 계속 잔존 포함되는 결함입니다.
  writeDB(db);
  console.log(`[DB DELETE ALERT] Removed alert ${id}. farmStats remain unchanged.`);
  res.json({ success: true });
};

export const resetData = (req, res) => {
  const initial = {
    "admins": [
      { "id": "ADM-301", "name": "김농장 대표", "role": "ADMIN", "dept": "스마트팜 총괄제어실" }
    ],
    "zones": [
      { "id": "ZN-A1", "name": "A1 온실 구역 (파프리카)", "type": "유리온실", "cropCount": 3, "avgTemp": 24.5, "avgHumid": 65, "status": "NORMAL" }
    ],
    "crops": [
      { "id": "CRP-101", "name": "파프리카 (빨강)", "zoneId": "ZN-A1", "growthStage": "결실기", "soilMoisture": 45, "riskLevel": 1, "irrigationVolume": 500, "scheduledTime": "08:00", "manager": "이재배", "status": "HEALTHY" }
    ],
    "sensors": [
      { "id": "SN-A1-T", "zoneId": "ZN-A1", "type": "온도", "value": 24.5, "unit": "°C", "status": "NORMAL" }
    ],
    "workLogs": [
      { "id": "WLOG-9001", "cropId": "CRP-101", "cropName": "파프리카 (빨강)", "zoneId": "ZN-A1", "action": "관수 분무 작업 완료", "volume": 500, "timestamp": "2026-08-03 08:00:00", "operator": "이재배 과장", "status": "COMPLETED" }
    ],
    "alerts": [
      { "id": "ALT-001", "zoneId": "ZN-C1", "sensorId": "SN-C1-S", "cropName": "초당옥수수", "type": "토양수분 저하 경고", "value": "18%", "severity": "CRITICAL", "timestamp": "2026-08-03 11:05:00", "status": "UNRESOLVED" }
    ],
    "farmStats": {
      "totalCropsCount": 25,
      "activeSensorsCount": 60,
      "criticalAlertCount": 5
    }
  };
  writeDB(initial);
  res.json({ success: true });
};
