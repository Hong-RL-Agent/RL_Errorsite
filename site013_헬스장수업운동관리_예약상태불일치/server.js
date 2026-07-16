import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5012;

app.use(cors());
app.use(express.json());

// Trainer Database
let trainers = [
  { id: "trn-01", name: "제이슨 트레이너", specialty: "바디 프로필 & 고강도 벌크업", rating: 4.9, avatar: "💪" },
  { id: "trn-02", name: "클로이 트레이너", specialty: "재활 전문 필라테스 & 체형 교정", rating: 4.8, avatar: "🧘" },
  { id: "trn-03", name: "아론 트레이너", specialty: "크로스핏 & 스파르타 서킷 트레이닝", rating: 4.7, avatar: "🏋️" }
];

// Classes Database (Group timetables)
let classes = [
  { id: "cls-01", title: "파워 리프팅 스쿼트", trainer: "제이슨 트레이너", time: "10:00", date: "2026-06-25", duration: "50분", capacity: 10, remainingCapacity: 5, type: "웨이트" },
  { id: "cls-02", title: "기구 코어 필라테스", trainer: "클로이 트레이너", time: "11:00", date: "2026-06-25", duration: "50분", capacity: 8, remainingCapacity: 4, type: "유연성" },
  { id: "cls-03", title: "고강도 서킷 타바타", trainer: "아론 트레이너", time: "14:00", date: "2026-06-25", duration: "50분", capacity: 12, remainingCapacity: 9, type: "크로스핏" },
  { id: "cls-04", title: "스핀 바이크 스피딩", trainer: "제이슨 트레이너", time: "16:00", date: "2026-06-25", duration: "50분", capacity: 15, remainingCapacity: 12, type: "유산소" },
  { id: "cls-05", title: "인터벌 타바타 유산소", trainer: "아론 트레이너", time: "10:00", date: "2026-06-26", duration: "50분", capacity: 12, remainingCapacity: 11, type: "크로스핏" },
  { id: "cls-06", title: "스트레칭 척추 교정", trainer: "클로이 트레이너", time: "11:00", date: "2026-06-26", duration: "50분", capacity: 8, remainingCapacity: 7, type: "유연성" },
  { id: "cls-07", title: "하체 벌크업 트레이닝", trainer: "제이슨 트레이너", time: "15:00", date: "2026-06-26", duration: "50분", capacity: 10, remainingCapacity: 8, type: "웨이트" }
];

// Workout log database
let workoutLogs = [
  { id: "log-1", date: "2026-06-22", type: "웨이트", duration: 60, intensity: 4, memo: "하체 스쿼트 5세트 완료. 중량 100kg 타격." },
  { id: "log-2", date: "2026-06-23", type: "유산소", duration: 45, intensity: 3, memo: "트레드밀 인터벌 런닝 45분 가동." }
];

// Active Reservations Database
let reservations = [
  { id: "res-401", classId: "cls-01", className: "파워 리프팅 스쿼트", userName: "홍길동", date: "2026-06-25", time: "10:00" }
];

// API: Get trainers
app.get('/api/trainers', (req, res) => {
  res.json(trainers);
});

// API: Get classes
app.get('/api/classes', (req, res) => {
  res.json(classes);
});

// API: Get workout logs
app.get('/api/workouts', (req, res) => {
  res.json(workoutLogs);
});

// API: Add workout log (Error 2)
app.post('/api/workouts', (req, res) => {
  const { type, duration, intensity, memo } = req.body;

  if (!type || duration === undefined || intensity === undefined) {
    return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Backend
  // DESCRIPTION: 운동 기록 저장 시 운동 시간(duration) 수치가 음수(-)인 경우에만 
  // 에러 코드(400 Bad Request)로 필터링 차단하고, 실제 물리적으로 불가능한 수치인 '0'을 입력한 경우에는 
  // 어떠한 제어문 검증 없이 그대로 저장을 허용하여 가짜 데이터(0분 운동 기록)가 DB에 적재되게 방치합니다.
  if (duration < 0) {
    return res.status(400).json({ error: "운동 시간은 음수를 기입할 수 없습니다." });
  }

  const newLog = {
    id: `log-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type,
    duration: Number(duration),
    intensity: Number(intensity),
    memo: memo || ""
  };

  workoutLogs.push(newLog);
  res.status(201).json(newLog);
});

// API: Get reservations
app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

// API: Book a class
app.post('/api/reservations', (req, res) => {
  const { classId, userName } = req.body;

  if (!classId || !userName) {
    return res.status(400).json({ error: "수업 ID 및 회원명이 누락되었습니다." });
  }

  const targetClass = classes.find(c => c.id === classId);
  if (!targetClass) {
    return res.status(404).json({ error: "수업 정보를 찾을 수 없습니다." });
  }

  if (targetClass.remainingCapacity <= 0) {
    return res.status(400).json({ error: "수업의 예약 가능 정원이 마감되었습니다." });
  }

  // Check double booking
  const alreadyBooked = reservations.some(r => r.classId === classId && r.userName === userName);
  if (alreadyBooked) {
    return res.status(400).json({ error: "이미 예약 완료한 수업입니다." });
  }

  // Decrement capacity
  targetClass.remainingCapacity -= 1;

  const newRes = {
    id: `res-${Date.now()}`,
    classId,
    className: targetClass.title,
    userName,
    date: targetClass.date,
    time: targetClass.time
  };

  reservations.push(newRes);
  res.status(201).json(newRes);
});

// API: Cancel reservation (Error 3)
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const index = reservations.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "예약 정보를 찾을 수 없습니다." });
  }

  const deletedRes = reservations[index];
  reservations.splice(index, 1);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 예약을 취소할 때 예약 테이블(reservations)에서는 삭제를 진행하지만, 
  // 취소된 그룹 수업의 남은 예약 정원 수(remainingCapacity)를 복구(+1)해 주는 작업을 누락하여 
  // 한 번 들어찼다가 취소된 자리가 영구히 잠겨버려 추가 수강 신청이 불가능해지는 상태 결함을 유발합니다.
  // 아래 가용 정원 복구 계산식을 누락시킵니다:
  // const targetClass = classes.find(c => c.id === deletedRes.classId);
  // if (targetClass) targetClass.remainingCapacity += 1;

  res.json({ success: true, message: "수업 예약 취소 처리가 완료되었습니다." });
});

app.listen(PORT, () => {
  console.log(`[FitRoute Backend] Express server running on http://localhost:${PORT}`);
});
