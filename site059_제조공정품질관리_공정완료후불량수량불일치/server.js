import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5059;

app.use(cors());
app.use(express.json());

// Work Orders Database (Minimum 15 items)
let orders = [
  { id: "wo-01", line: "생산 1라인", name: "반도체 패키징 웨이퍼 세정", producedCount: 120, defectCount: 5, yieldCount: 115, worker: "김철수 대리", status: "RUNNING", memo: "세정 노즐 압력 상태 점검 완료." },
  { id: "wo-02", line: "생산 1라인", name: "디스플레이 코팅 글라스 가열", producedCount: 90, defectCount: 3, yieldCount: 87, worker: "박준영 과장", status: "RUNNING", memo: "퍼니스 온도 120도 유지 설정." },
  { id: "wo-03", line: "생산 1라인", name: "PCB 에칭 구리 박막 패턴", producedCount: 150, defectCount: 8, yieldCount: 142, worker: "이민우 주임", status: "COMPLETED", memo: "패턴 에칭 잔사 없음 확인." },
  { id: "wo-04", line: "생산 2라인", name: "2차전지 양극재 분말 혼합", producedCount: 110, defectCount: 2, yieldCount: 108, worker: "최하은 사원", status: "RUNNING", memo: "교반 스핀들 알람 발생 이력 없음." },
  { id: "wo-05", line: "생산 2라인", name: "센서 모듈 하우징 조립", producedCount: 80, defectCount: 1, yieldCount: 79, worker: "정다은 사원", status: "RUNNING", memo: "조립 프레스 가압 오차 범위 이내." },
  { id: "wo-06", line: "생산 2라인", name: "스마트 전력 미터 회로 조립", producedCount: 105, defectCount: 4, yieldCount: 101, worker: "홍길동 주임", status: "COMPLETED", memo: "회로 단선 유무 전압 테스트 통과." },
  { id: "wo-07", line: "생산 1라인", name: "광센서 렌즈 초점 검사", producedCount: 130, defectCount: 6, yieldCount: 124, worker: "강민재 사원", status: "RUNNING", memo: "오토포커싱 렌즈 캘리브레이션 완료." },
  { id: "wo-08", line: "생산 1라인", name: "머신 비전 검사용 조명 조립", producedCount: 70, defectCount: 2, yieldCount: 68, worker: "조민식 대리", status: "RUNNING", memo: "LED 광량 균일성 테스트 완료." },
  { id: "wo-09", line: "생산 2라인", name: "전원 공급 장치 트랜스 권선", producedCount: 95, defectCount: 3, yieldCount: 92, worker: "윤서연 사원", status: "RUNNING", memo: "코일 인장력 조절 풀림 방지 조치." },
  { id: "wo-10", line: "생산 2라인", name: "제어 보드 커패시터 SMT 마운팅", producedCount: 200, defectCount: 10, yieldCount: 190, worker: "신태용 과장", status: "COMPLETED", memo: "납조 리플로우 온도 프로파일 업로드 완료." },
  { id: "wo-11", line: "생산 1라인", name: "레이저 마킹 식별 기호 조각", producedCount: 160, defectCount: 7, yieldCount: 153, worker: "임재원 주임", status: "RUNNING", memo: "바코드 판독성 테스트 스캔 오차 무." },
  { id: "wo-12", line: "생산 1라인", name: "알루미늄 케이스 리벳팅 체결", producedCount: 85, defectCount: 2, yieldCount: 83, worker: "장지수 사원", status: "RUNNING", memo: "체결 에어 토크 압력 정밀 교정 완료." },
  { id: "wo-13", line: "생산 2라인", name: "터치 패널 기능 전도율 테스트", producedCount: 140, defectCount: 5, yieldCount: 135, worker: "오민혁 주임", status: "RUNNING", memo: "임피던스 주파수 전압 안정 구동." },
  { id: "wo-14", line: "생산 2라인", name: "와이어링 하네스 피복 가공", producedCount: 180, defectCount: 8, yieldCount: 172, worker: "한승우 사원", status: "RUNNING", memo: "가공 탈피 길이 정밀 세팅." },
  { id: "wo-15", line: "생산 1라인", name: "카메라 모듈 렌즈 접착 경화", producedCount: 95, defectCount: 1, yieldCount: 94, worker: "배현우 과장", status: "RUNNING", memo: "UV 경화기 파장 강도 테스트 필." }
];

// Equipment database
let equipment = [
  { id: "eq-01", name: "리플로우 가열로 (furnace-01)", status: "RUNNING", line: "생산 1라인" },
  { id: "eq-02", name: "자동 에칭 머신 (etcher-03)", status: "RUNNING", line: "생산 1라인" },
  { id: "eq-03", name: "고속 칩 마운터 (mounter-02)", status: "RUNNING", line: "생산 2라인" }
];

// Materials usage ledger
let materialsUsage = [
  { id: "mat-01", orderId: "wo-01", itemName: "초순수 세정제 (DI Water)", qty: 250 },
  { id: "mat-02", orderId: "wo-03", itemName: "동박 회로 기판 (Copper FR4)", qty: 150 },
  { id: "mat-03", orderId: "wo-10", itemName: "칩 커패시터 100nF", qty: 400 }
];

// Quality inspections reports
let inspections = [
  { id: "insp-01", orderId: "wo-01", inspector: "이품질 과장", defectDesc: "웨이퍼 스크래치 미세 균열", severity: "HIGH" },
  { id: "insp-02", orderId: "wo-03", inspector: "박검사 대리", defectDesc: "패턴 박리 불량", severity: "MEDIUM" }
];

// Cache to simulate Worker transition (Error 6 Target)
const workerTransitionCache = {};

// API: Get orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// API: Add order
app.post('/api/orders', (req, res) => {
  const { line, name, worker } = req.body;
  const newOrder = {
    id: `wo-${Date.now()}`,
    line,
    name,
    producedCount: 0,
    defectCount: 0,
    yieldCount: 0,
    worker,
    status: "RUNNING",
    memo: "대기 중인 신규 작업 지시입니다."
  };
  orders.push(newOrder);
  res.json(newOrder);
});

// API: Delete order (Error 3 Target - stats delete leak)
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  orders = orders.filter(o => o.id !== id);

  // INTENTIONAL_ERROR
  // CATEGORY: Database
  // DESCRIPTION: 작업 지시를 제거(DELETE)해도 해당 지시 번호에 연결 기입되어 있던 
  // 자재 소요 대장(`materialsUsage`) 및 품질 리포트(`inspections`) 데이터를 연쇄 삭제(Cascade)하지 않고 
  // 그대로 남겨 두어 지표 누적 합산 결과가 왜곡되고 고아 데이터가 방치되는 결함입니다.
  console.log(`[DB DELETE ORDER] Removed order ${id}. Materials/Inspections left behind!`);
  res.json({ success: true });
});

// API: Complete order (Error 1 Target - 0.1s completion)
app.post('/api/orders/:id/complete', (req, res) => {
  const { id } = req.params;
  const ord = orders.find(o => o.id === id);

  setTimeout(() => {
    if (ord) {
      ord.status = "COMPLETED";
      ord.yieldCount = ord.producedCount - ord.defectCount;
      console.log(`[DB COMPLETE ORDER] ${id} completed. Yield: ${ord.yieldCount}`);
    }
    res.json({ success: true, order: ord });
  }, 100);
});

// API: Update defect count (Error 1 Target - 3s delay recalculation)
app.patch('/api/orders/:id/defect', (req, res) => {
  const { id } = req.params;
  const { defectCount } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Backend + Database
  // DESCRIPTION: 불량 수량 수정(PATCH) 요청을 3초 지연 처리합니다. 
  // 완료 요청(0.1초 완료)이 생산 수량을 락인한 후 뒤늦게 실행된 불량 수정이 
  // 이전의 stale 생산량을 기준 삼아 최종 양품 수량(`yieldCount`)을 구형 산식으로 
  // 덮어써서 최종 데이터베이스 값과 화면 수치가 달라지는 결함입니다.
  setTimeout(() => {
    const ord = orders.find(o => o.id === id);
    if (ord) {
      ord.defectCount = Number(defectCount);
      // Recalculates using a stale total count of 100 instead of current producedCount!
      ord.yieldCount = 100 - ord.defectCount;
      console.log(`[DB DEFECT UPDATE] Defect set to ${defectCount}, yield set to ${ord.yieldCount}`);
    }
    res.json({ success: true, order: ord });
  }, 3000);
});

// API: Assign worker (Error 6 Target - 0.1s delay)
app.patch('/api/orders/:id/worker', (req, res) => {
  const { id } = req.params;
  const { worker } = req.body;

  setTimeout(() => {
    const ord = orders.find(o => o.id === id);
    if (ord) {
      workerTransitionCache[id] = ord.worker; // Cache old worker
      ord.worker = worker;
      console.log(`[DB ASSIGN WORKER] Worker for ${id} set to ${worker}`);
    }
    res.json({ success: true, order: ord });
  }, 100);
});

// API: Update memo (Error 6 Target - 3s delay)
app.patch('/api/orders/:id/memo', (req, res) => {
  const { id } = req.params;
  const { memo } = req.body;

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Database
  // DESCRIPTION: 공정 메모 저장(PATCH)을 3초 지연 처리합니다. 
  // 그 사이 작업자 배정 변경(0.1초 완료)이 완료되어 DB에는 새 작업자가 적용되나, 
  // 3초 뒤 완료되는 메모 저장 스레드가 배정 메모리 기입 시 이전 작업자 ID 정보와 결합하여 
  // 덮어씀으로써 최종 데이터베이스에는 이전 작업자와 새 메모리 조합으로 엉켜 저장되는 결함입니다.
  setTimeout(() => {
    const ord = orders.find(o => o.id === id);
    if (ord) {
      ord.memo = memo;
      if (workerTransitionCache[id]) {
        ord.worker = workerTransitionCache[id]; // Revert to cached old worker!
      }
    }
    console.log(`[DB MEMO SAVE] Memo saved. Worker reverted to ${ord?.worker}`);
    res.json({ success: true, order: ord });
  }, 3000);
});

// API: Get equipment
app.get('/api/equipment', (req, res) => {
  res.json(equipment);
});

// API: Refresh equipment (Error 4 Target - refresh delay race)
app.get('/api/equipment/refresh', (req, res) => {
  const { count } = req.query;

  let delay = 100;
  if (count === '1') {
    delay = 3000; // 3s delay
  } else {
    delay = 200; // 0.2s delay
  }

  const equipmentCopy = JSON.parse(JSON.stringify(equipment));
  if (count === '1') {
    equipmentCopy[0].status = "OFFLINE"; // Stale value
  } else {
    equipmentCopy[0].status = "RUNNING"; // Fresh value
  }

  // INTENTIONAL_ERROR
  // CATEGORY: Frontend + Network
  // DESCRIPTION: 설비 상태 새로고침 속도 차이로 인해 
  // 3초 지연된 OFFLINE(stale) 데이터가 0.2초짜리 RUNNING(fresh) 데이터보다 늦게 도착하여 
  // 화면을 덮어씀으로써, 중앙 공정 흐름도 상태 마커와 상세 패널의 텍스트 정보 불일치를 빚는 결함입니다.
  setTimeout(() => {
    res.json(equipmentCopy);
  }, delay);
});

// API: Get materials
app.get('/api/materials', (req, res) => {
  res.json(materialsUsage);
});

// API: Get inspections
app.get('/api/inspections', (req, res) => {
  res.json(inspections);
});

// API: Patch quality defect edit (Error 5 Target)
app.patch('/api/inspections/:id', (req, res) => {
  const { id } = req.params;
  const { role, defectCount } = req.body;

  const insp = inspections.find(i => i.id === id);
  if (insp) {
    const ord = orders.find(o => o.id === insp.orderId);
    if (ord) {
      // INTENTIONAL_ERROR
      // CATEGORY: Backend
      // DESCRIPTION: 관리자 권한이 아닌 일반 현장 작업자(role === 'WORKER')의 요청에 대해 
      // HTTP 403 Forbidden 에러 응답을 내려보내 수정이 거부된 것처럼 처리하지만, 
      // 실제 백엔드 메모리 DB 테이블의 불량 수량 필드(`defectCount`)는 기습적으로 
      // 미리 고쳐 저장을 감행해두는 보안 권한 통제 결함입니다.
      ord.defectCount = Number(defectCount);
      ord.yieldCount = ord.producedCount - ord.defectCount;
      console.log(`[DB INSPECTION BYPASS] Inspection modified. Defect quantity changed to ${defectCount} without manager rights!`);
    }
  }

  if (role !== 'MANAGER') {
    return res.status(403).json({ error: "품질 관리자 권한이 필요합니다. (403)" });
  }

  res.json({ success: true });
});

// API: Reset DB
app.post('/api/reset', (req, res) => {
  orders = [
    { id: "wo-01", line: "생산 1라인", name: "반도체 패키징 웨이퍼 세정", producedCount: 120, defectCount: 5, yieldCount: 115, worker: "김철수 대리", status: "RUNNING", memo: "세정 노즐 압력 상태 점검 완료." },
    { id: "wo-02", line: "생산 1라인", name: "디스플레이 코팅 글라스 가열", producedCount: 90, defectCount: 3, yieldCount: 87, worker: "박준영 과장", status: "RUNNING", memo: "퍼니스 온도 120도 유지 설정." },
    { id: "wo-03", line: "생산 1라인", name: "PCB 에칭 구리 박막 패턴", producedCount: 150, defectCount: 8, yieldCount: 142, worker: "이민우 주임", status: "COMPLETED", memo: "패턴 에칭 잔사 없음 확인." },
    { id: "wo-04", line: "생산 2라인", name: "2차전지 양극재 분말 혼합", producedCount: 110, defectCount: 2, yieldCount: 108, worker: "최하은 사원", status: "RUNNING", memo: "교반 스핀들 알람 발생 이력 없음." },
    { id: "wo-05", line: "생산 2라인", name: "센서 모듈 하우징 조립", producedCount: 80, defectCount: 1, yieldCount: 79, worker: "정다은 사원", status: "RUNNING", memo: "조립 프레스 가압 오차 범위 이내." }
  ];
  
  equipment = [
    { id: "eq-01", name: "리플로우 가열로 (furnace-01)", status: "RUNNING", line: "생산 1라인" },
    { id: "eq-02", name: "자동 에칭 머신 (etcher-03)", status: "RUNNING", line: "생산 1라인" },
    { id: "eq-03", name: "고속 칩 마운터 (mounter-02)", status: "RUNNING", line: "생산 2라인" }
  ];

  materialsUsage = [
    { id: "mat-01", orderId: "wo-01", itemName: "초순수 세정제 (DI Water)", qty: 250 },
    { id: "mat-02", orderId: "wo-03", itemName: "동박 회로 기판 (Copper FR4)", qty: 150 }
  ];

  inspections = [
    { id: "insp-01", orderId: "wo-01", inspector: "이품질 과장", defectDesc: "웨이퍼 스크래치 미세 균열", severity: "HIGH" }
  ];

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[FactoryLine Backend] Express server running on http://localhost:${PORT}`);
});
