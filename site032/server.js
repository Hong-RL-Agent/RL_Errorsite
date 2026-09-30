import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9931;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// =========================================================
// MOCK DATA & IN-MEMORY STORAGE
// =========================================================

// Labs
let labs = [
  {
    id: 'lab_01',
    name: 'Molecular Biology & Genetics Lab',
    department: '생명공학 연구본부',
    location: '첨단융합연구동 B동 402호',
    managerId: 'usr_res_01',
    memberCount: 14,
    status: '정상 가동중 (BSL-2)',
    createdAt: '2024-02-10'
  },
  {
    id: 'lab_02',
    name: 'Advanced Materials Research Lab',
    department: '신소재나노 연구소',
    location: '나노종합기술원 A동 315호',
    managerId: 'usr_res_01',
    memberCount: 9,
    status: '실험 진행중 (클린룸 1000 Class)',
    createdAt: '2024-06-15'
  },
  {
    id: 'lab_03',
    name: 'Bioinformatics & Computational Lab',
    department: '유전체 빅데이터 연구센터',
    location: 'ICT 융합관 C동 510호',
    managerId: 'usr_res_01',
    memberCount: 11,
    status: '분석 가동중 (GPU 클러스터)',
    createdAt: '2025-01-20'
  }
];

let selectedLabId = 'lab_01';

// Current Researcher User
let currentUser = {
  id: 'usr_res_01',
  name: '정서윤',
  email: 'seoyoon.jung@nexuralab.org',
  role: '책임연구원 (Principal Investigator)',
  department: '분자생물학 & 유전체 연구실',
  phone: '010-8291-7734',
  profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  status: '연구실 재실',
  joinedAt: '2023-03-01'
};

// Researchers
let researchers = [
  { id: 'usr_res_01', name: '정서윤', email: 'seoyoon.jung@nexuralab.org', role: '책임연구원', department: '분자생물학', phone: '010-8291-7734', status: '재실' },
  { id: 'usr_res_02', name: '강민우', email: 'minwoo.kang@nexuralab.org', role: '선임연구원', department: '유전체공학', phone: '010-3329-8812', status: '실험중' },
  { id: 'usr_res_03', name: '송하은', email: 'haeun.song@nexuralab.org', role: '전임연구원', department: '단백질구조분석', phone: '010-9102-3490', status: '재실' },
  { id: 'usr_res_04', name: '조유진', email: 'yoojin.cho@nexuralab.org', role: '연구원', department: '세포배양', phone: '010-4491-1182', status: '장비사용' }
];

// Researcher Addresses
let researcherAddresses = [
  { addressId: 'ADDR-INIT-01', researcherId: 'usr_res_01', street: '서울특별시 강남구 테헤란로 152', detail: '강남파이낸스센터 바이오텍 R&D 8층', postalCode: '06236' }
];

// Projects
let projects = [
  {
    id: 'proj_01',
    name: 'CRISPR 기반 타겟 유전자 편집 효율 연구',
    description: 'Cas9 단백질 전달체 최적화를 통한 체외 유전자 교정 효율 극대화',
    principalInvestigator: '정서윤 박사',
    status: '진행중 (Phase 2)',
    startDate: '2026-03-01',
    expectedEndDate: '2026-12-31',
    memberIds: ['usr_res_01', 'usr_res_02'],
    experimentCount: 8,
    createdAt: '2026-03-01'
  },
  {
    id: 'proj_02',
    name: '단백질 결정 구조 및 열역학적 안정성 분석',
    description: '고분해능 분광학을 이용한 재조합 효소의 3차원 안정성 프로파일링',
    principalInvestigator: '강민우 박사',
    status: '진행중 (Phase 1)',
    startDate: '2026-05-15',
    expectedEndDate: '2026-11-30',
    memberIds: ['usr_res_02', 'usr_res_03'],
    experimentCount: 5,
    createdAt: '2026-05-15'
  },
  {
    id: 'proj_03',
    name: '환경 오염원 식별을 위한 미생물 메타유전체 분석',
    description: '차세대 시퀀싱(NGS)을 활용한 수계 미생물 군집 구조 및 내성 유전자 분석',
    principalInvestigator: '정서윤 박사',
    status: '진행중 (샘플링 완료)',
    startDate: '2026-07-01',
    expectedEndDate: '2027-02-28',
    memberIds: ['usr_res_01', 'usr_res_04'],
    experimentCount: 6,
    createdAt: '2026-07-01'
  }
];

// Equipment
let equipmentList = [
  {
    id: 'eq_01',
    name: 'Real-Time PCR 정량 증폭기 (QuantStudio 7 Pro)',
    category: '분자생물학',
    model: 'QS7-PRO-96W',
    serialNumber: 'SN-QS7-2024-0982',
    location: '402호 PCR Prep Room',
    status: '예약 가능 (대기)',
    lastInspectionDate: '2026-08-15',
    nextInspectionDate: '2026-11-15',
    description: '96-well 초고감도 실시간 형광 PCR 증폭 및 정량 분석기',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_02',
    name: '초고속 냉각 원심분리기 (Avanti JXN-30)',
    category: '원심분리',
    model: 'AVANTI-JXN30',
    serialNumber: 'SN-AVT-2023-4410',
    location: '402호 원심분리실',
    status: '예약 가능 (대기)',
    lastInspectionDate: '2026-09-01',
    nextInspectionDate: '2026-12-01',
    description: '최대 30,000 RPM, 고밀도 단백질 및 세포 소기관 분리',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_03',
    name: '자외선-가시광 분광광도계 (NanoDrop One C)',
    category: '정량분석',
    model: 'ND-ONE-C',
    serialNumber: 'SN-NDO-2025-1102',
    location: '402호 분석 벤치 1',
    status: '사용중 (강민우 연구원)',
    lastInspectionDate: '2026-08-20',
    nextInspectionDate: '2026-11-20',
    description: '1uL 미량 핵산(DNA/RNA) 및 단백질 흡광도 정밀 측정기',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_04',
    name: '공초점 레이저 형광 현미경 (LSM 980 with Airyscan 2)',
    category: '영상분석',
    model: 'ZEISS-LSM980',
    serialNumber: 'SN-LSM-2024-8843',
    location: '403호 암실 현미경실',
    status: '예약 가능 (대기)',
    lastInspectionDate: '2026-07-10',
    nextInspectionDate: '2026-10-10',
    description: '초고해상도 다채널 3차원 형광 세포 이미징 시스템',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'eq_05',
    name: '정밀 CO2 세포 배양 인큐베이터 (Heracell VIOS 160i)',
    category: '세포배양',
    model: 'HC-VIOS-160',
    serialNumber: 'SN-HCV-2024-3320',
    location: '404호 세포배양실',
    status: '가동중 (배양 6건)',
    lastInspectionDate: '2026-09-10',
    nextInspectionDate: '2026-12-10',
    description: '37℃ / 5% CO2 / 95% 습도 정밀 제어 세포 인큐베이터',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80'
  }
];

// Reservations
let reservations = [
  { id: 'res_01', equipmentId: 'eq_01', equipmentName: 'Real-Time PCR 정량 증폭기', researcherId: 'usr_res_01', researcherName: '정서윤', date: '2026-09-27', startTime: '10:00', endTime: '12:30', purpose: 'CRISPR 타겟 유전자 발현 정량 분석' },
  { id: 'res_02', equipmentId: 'eq_03', equipmentName: '자외선-가시광 분광광도계', researcherId: 'usr_res_02', researcherName: '강민우', date: '2026-09-26', startTime: '14:00', endTime: '16:00', purpose: '단백질 용출액 A280 농도 측정' },
  { id: 'res_03', equipmentId: 'eq_04', equipmentName: '공초점 레이저 형광 현미경', researcherId: 'usr_res_03', researcherName: '송하은', date: '2026-09-28', startTime: '09:30', endTime: '12:00', purpose: '형광 염색 세포 핵 및 골격 3D 이미징' }
];

// Experiments
let experiments = [
  {
    id: 'exp_01',
    projectId: 'proj_01',
    name: 'HEK293T 세포 CRISPR-Cas9 트랜스펙션 3차 반복',
    researcherId: 'usr_res_01',
    researcherName: '정서윤',
    equipmentId: 'eq_01',
    scheduledAt: '2026-09-27 10:00',
    status: '진행예정',
    protocol: 'Lipofectamine 3000 시약 3.5uL 및 sgRNA-Cas9 RNP 복합체 500ng 전달',
    notes: '세포 Confluency 75% 상태에서 진행, 48시간 후 gDNA 추출 예정',
    createdAt: '2026-09-24'
  },
  {
    id: 'exp_02',
    projectId: 'proj_02',
    name: 'Ni-NTA 친화성 크로마토그래피 재조합 단백질 정제',
    researcherId: 'usr_res_02',
    researcherName: '강민우',
    equipmentId: 'eq_02',
    scheduledAt: '2026-09-26 13:00',
    status: '완료 (분석중)',
    protocol: '500mM Imidazole 단계별 용출 및 완충용액 교환 투석',
    notes: '순도 95% 이상 밴드 확인, SDS-PAGE 전기영동 검증 완료',
    createdAt: '2026-09-22'
  }
];

// Reagents
let reagents = [
  { id: 'reag_01', name: 'TaqMan Fast Advanced Master Mix (5mL)', category: 'PCR 시약', quantity: 8, unit: 'EA', minimumStock: 3, expirationDate: '2027-04-30', storageCondition: '-20℃ 냉동', status: '충분' },
  { id: 'reag_02', name: 'Phosphate-Buffered Saline (1X PBS, 500mL)', category: '완충액', quantity: 24, unit: 'BTL', minimumStock: 10, expirationDate: '2027-08-15', storageCondition: '상온 (RT)', status: '충분' },
  { id: 'reag_03', name: 'Lipofectamine 3000 Transfection Reagent', category: '전달체', quantity: 2, unit: 'KIT', minimumStock: 3, expirationDate: '2026-12-31', storageCondition: '4℃ 냉장', status: '재고부족' },
  { id: 'reag_04', name: 'Sterile Filter Pipette Tips 200uL (960팁)', category: '소모품', quantity: 18, unit: 'BOX', minimumStock: 5, expirationDate: '2029-01-01', storageCondition: '건랭소', status: '충분' },
  { id: 'reag_05', name: 'Quick-RNA Miniprep Plus Kit (50 Prep)', category: '추출키트', quantity: 1, unit: 'KIT', minimumStock: 2, expirationDate: '2026-11-20', storageCondition: 'RT/4℃', status: '재고부족' }
];

let reagentReceipts = [
  { receiptId: 'REC-INIT-01', reagentId: 'reag_01', reagentName: 'TaqMan Fast Advanced Master Mix', quantity: 5, receivedAt: '2026-09-20', receivedBy: '정서윤' }
];

// Samples
let samples = [
  { id: 'smp_01', projectId: 'proj_01', name: 'HEK293T-CRISPR-Clone-A3', sampleType: '포유류 세포주', collectedAt: '2026-09-22', status: '액체질소 보관 (-196℃)', storageLocation: 'LN2 Tank 2 Rack B-4', researcherId: 'usr_res_01', notes: 'Exon 3 타겟 돌연변이 도입 세포주 (Passage 6)' },
  { id: 'smp_02', projectId: 'proj_01', name: 'HEK293T-WT-Control', sampleType: '대조군 세포주', collectedAt: '2026-09-22', status: '액체질소 보관 (-196℃)', storageLocation: 'LN2 Tank 2 Rack B-1', researcherId: 'usr_res_01', notes: '미처리 대조군 야생형 세포주' },
  { id: 'smp_03', projectId: 'proj_02', name: 'Rec-Enzyme-His-Eluate-P2', sampleType: '정제 단백질 용액', collectedAt: '2026-09-26', status: '-80℃ 초저온 냉동', storageLocation: 'Deep Freezer 1 Box C-12', researcherId: 'usr_res_02', notes: '순도 96.2%, 농도 2.85 mg/mL' }
];

// Lab Notes
let labNotes = [
  { id: 'note_01', projectId: 'proj_01', experimentId: 'exp_01', title: 'Cas9 RNP 트랜스펙션 최적 비율 관찰 및 결과 노트', content: 'sgRNA 농도를 1.2배 상향 투입하였을 때 세포 독성 없이 인델(Indel) 유도 효율이 68%에서 82%로 대폭 향상됨을 확인하였다.', author: '정서윤 책임연구원', date: '2026-09-25' },
  { id: 'note_02', projectId: 'proj_02', experimentId: 'exp_02', title: '단백질 투석 완충액 pH 조건별 침전 양상 비교', content: 'pH 7.4 Tris-HCl 완충용액에서 4℃ 12시간 투석 시 침전 없이 균일한 용액 상태가 안정적으로 유지됨.', author: '강민우 선임연구원', date: '2026-09-26' }
];

// Experiment Results
let experimentResults = [
  { id: 'res_01', experimentId: 'exp_01', title: 'CRISPR 타겟 유전자 온타겟(On-target) 편집 효율', resultType: '정량 분석', value: 84.6, unit: '%', interpretation: '기존 대비 +16.6% 향상, 유의확률 p < 0.001', createdBy: '정서윤', createdAt: '2026-09-25 17:30' },
  { id: 'res_02', experimentId: 'exp_02', title: '정제 재조합 효소 비활성도(Specific Activity)', resultType: '효소 활성', value: 1480, unit: 'U/mg', interpretation: '표준 상용 시약 대비 1.25배 우수한 촉매 효율', createdBy: '강민우', createdAt: '2026-09-26 15:45' }
];

// Equipment Maintenance
let maintenanceLogs = [
  { id: 'maint_01', equipmentId: 'eq_01', equipmentName: 'Real-Time PCR 정량 증폭기', type: '정기 캘리브레이션', date: '2026-08-15', engineer: 'Thermo Fisher 기술지원팀', result: '광학 필터 및 열 블록 오차 0.05℃ 이내 적합' },
  { id: 'maint_02', equipmentId: 'eq_02', equipmentName: '초고속 냉각 원심분리기', type: '로터 안전 점검', date: '2026-09-01', engineer: 'Beckman Coulter 전담 엔지니어', result: '진공 챔버 및 진동 센서 정상' }
];

// Announcements & Messages
let announcements = [
  { id: 'ann_01', title: '2026년 하반기 연구실 안전 및 BSL-2 정기 교육 안내', content: '연구원 전원은 10월 15일까지 연구실 환경안전 온라인 법정 교육을 이수해주시기 바랍니다.', date: '2026-09-22', author: '연구안전관리실' },
  { id: 'ann_02', title: '공초점 형광현미경(LSM 980) 레이저 모듈 교체 완료 안내', content: '405nm 및 561nm 레이저 다이오드 교체 및 영점 캘리브레이션이 완료되었습니다.', date: '2026-09-18', author: '정서윤 책임연구원' }
];

let messages = [
  { id: 'msg_01', sender: '강민우 선임연구원', receiver: '정서윤', content: '박사님, 2호 프로젝트 단백질 샘플 농도 측정이 완료되어 결과 리포트 등록해두었습니다.', time: '14:35', read: false },
  { id: 'msg_02', sender: '연구안전실', receiver: '정서윤', content: '402호 위험물질 보관함 시약 정기 점검이 승인 완료되었습니다.', time: '11:20', read: true }
];

let notifications = [
  { id: 'notif_01', title: '장비 예약 승인 완료', message: '내일(09/27) 10:00 Real-Time PCR 장비 예약이 승인되었습니다.', time: '10분 전', read: false },
  { id: 'notif_02', title: '시약 최소 재고 도달 경보', message: 'Lipofectamine 3000 재고가 2개로 최소 기준(3개) 미만입니다.', time: '1시간 전', read: false }
];

// =========================================================
// API ROUTES
// =========================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'site032'
  });
});

// Auth & Researchers
app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: '로그아웃 완료' });
});

app.get('/api/researchers', (req, res) => {
  res.json({ success: true, researchers });
});

app.post('/api/researchers', (req, res) => {
  const newRes = { id: 'usr_res_' + Date.now(), ...req.body, status: '재실' };
  researchers.push(newRes);
  res.json({ success: true, researcher: newRes });
});

app.get('/api/researchers/:researcherId', (req, res) => {
  const r = researchers.find(item => item.id === req.params.researcherId) || researchers[0];
  res.json({ success: true, researcher: r });
});

app.patch('/api/researchers/:researcherId', (req, res) => {
  const idx = researchers.findIndex(r => r.id === req.params.researcherId);
  if (idx !== -1) {
    researchers[idx] = { ...researchers[idx], ...req.body };
    res.json({ success: true, researcher: researchers[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Researcher not found' });
  }
});

app.get('/api/researcher/address', (req, res) => {
  res.json({ success: true, addresses: researcherAddresses });
});

// Labs & Projects
app.get('/api/labs', (req, res) => {
  res.json({ success: true, labs, selectedLabId });
});

app.get('/api/labs/:labId', (req, res) => {
  const lab = labs.find(l => l.id === req.params.labId) || labs[0];
  res.json({ success: true, lab });
});

app.get('/api/projects', (req, res) => {
  res.json({ success: true, projects });
});

app.get('/api/projects/:projectId', (req, res) => {
  const proj = projects.find(p => p.id === req.params.projectId) || projects[0];
  res.json({ success: true, project: proj });
});

app.patch('/api/projects/:projectId', (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.projectId);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...req.body };
    res.json({ success: true, project: projects[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Project not found' });
  }
});

// Experiments & Schedules
app.get('/api/experiments', (req, res) => {
  res.json({ success: true, experiments });
});

app.get('/api/experiments/:experimentId', (req, res) => {
  const exp = experiments.find(e => e.id === req.params.experimentId) || experiments[0];
  res.json({ success: true, experiment: exp });
});

app.patch('/api/experiments/:experimentId', (req, res) => {
  const idx = experiments.findIndex(e => e.id === req.params.experimentId);
  if (idx !== -1) {
    experiments[idx] = { ...experiments[idx], ...req.body };
    res.json({ success: true, experiment: experiments[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Experiment not found' });
  }
});

app.get('/api/experiment-schedules', (req, res) => {
  res.json({ success: true, schedules: experiments });
});

// Equipment & Reservations
app.get('/api/equipment', (req, res) => {
  res.json({ success: true, equipment: equipmentList });
});

app.get('/api/equipment/:equipmentId', (req, res) => {
  const eq = equipmentList.find(e => e.id === req.params.equipmentId) || equipmentList[0];
  res.json({ success: true, equipment: eq });
});

app.get('/api/equipment/:equipmentId/availability', (req, res) => {
  res.json({ success: true, availableSlots: ['09:00~11:00', '13:00~15:00', '16:00~18:00'] });
});

app.get('/api/equipment/reservations', (req, res) => {
  res.json({ success: true, reservations });
});

app.patch('/api/equipment/reservations/:reservationId', (req, res) => {
  const idx = reservations.findIndex(r => r.id === req.params.reservationId);
  if (idx !== -1) {
    reservations[idx] = { ...reservations[idx], ...req.body };
    res.json({ success: true, reservation: reservations[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Reservation not found' });
  }
});

app.get('/api/equipment/maintenance', (req, res) => {
  res.json({ success: true, maintenanceLogs });
});

app.post('/api/equipment/maintenance', (req, res) => {
  const newMaint = { id: 'maint_' + Date.now(), ...req.body };
  maintenanceLogs.push(newMaint);
  res.json({ success: true, maintenance: newMaint });
});

// Reagents
app.get('/api/reagents', (req, res) => {
  res.json({ success: true, reagents });
});

app.get('/api/reagents/:reagentId', (req, res) => {
  const reag = reagents.find(r => r.id === req.params.reagentId) || reagents[0];
  res.json({ success: true, reagent: reag });
});

app.patch('/api/reagents/:reagentId', (req, res) => {
  const idx = reagents.findIndex(r => r.id === req.params.reagentId);
  if (idx !== -1) {
    reagents[idx] = { ...reagents[idx], ...req.body };
    res.json({ success: true, reagent: reagents[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Reagent not found' });
  }
});

app.post('/api/reagents/usage', (req, res) => {
  const { reagentId, amount } = req.body;
  const reag = reagents.find(r => r.id === reagentId);
  if (reag && reag.quantity > 0) {
    reag.quantity = Math.max(0, reag.quantity - (amount || 1));
  }
  res.json({ success: true, reagent: reag });
});

// Samples & Results
app.get('/api/samples', (req, res) => {
  res.json({ success: true, samples });
});

app.get('/api/samples/:sampleId', (req, res) => {
  const smp = samples.find(s => s.id === req.params.sampleId) || samples[0];
  res.json({ success: true, sample: smp });
});

app.patch('/api/samples/:sampleId', (req, res) => {
  const idx = samples.findIndex(s => s.id === req.params.sampleId);
  if (idx !== -1) {
    samples[idx] = { ...samples[idx], ...req.body };
    res.json({ success: true, sample: samples[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Sample not found' });
  }
});

app.get('/api/experiment-results', (req, res) => {
  res.json({ success: true, results: experimentResults });
});

app.get('/api/experiment-results/:resultId', (req, res) => {
  const r = experimentResults.find(item => item.id === req.params.resultId) || experimentResults[0];
  res.json({ success: true, result: r });
});

// Lab Notes
app.get('/api/lab-notes', (req, res) => {
  res.json({ success: true, notes: labNotes });
});

app.get('/api/lab-notes/:noteId', (req, res) => {
  const n = labNotes.find(item => item.id === req.params.noteId) || labNotes[0];
  res.json({ success: true, note: n });
});

app.patch('/api/lab-notes/:noteId', (req, res) => {
  const idx = labNotes.findIndex(n => n.id === req.params.noteId);
  if (idx !== -1) {
    labNotes[idx] = { ...labNotes[idx], ...req.body };
    res.json({ success: true, note: labNotes[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Note not found' });
  }
});

// Announcements & Messages
app.get('/api/announcements', (req, res) => {
  res.json({ success: true, announcements });
});

app.post('/api/announcements', (req, res) => {
  const newAnn = { id: 'ann_' + Date.now(), ...req.body, date: new Date().toISOString().split('T')[0] };
  announcements.unshift(newAnn);
  res.json({ success: true, announcement: newAnn });
});

app.get('/api/messages', (req, res) => {
  res.json({ success: true, messages });
});

app.post('/api/messages', (req, res) => {
  const newMsg = { id: 'msg_' + Date.now(), sender: currentUser.name, time: new Date().toLocaleTimeString().slice(0, 5), read: false, ...req.body };
  messages.unshift(newMsg);
  res.json({ success: true, messageItem: newMsg });
});

app.patch('/api/messages/:messageId/read', (req, res) => {
  const m = messages.find(item => item.id === req.params.messageId);
  if (m) m.read = true;
  res.json({ success: true, messages });
});

// Reports & Notifications
app.get('/api/reports', (req, res) => {
  res.json({
    success: true,
    report: {
      activeProjectsCount: projects.length,
      monthlyExperimentsTotal: 24,
      equipmentUtilizationRate: '87.4%',
      reagentsLowStockCount: reagents.filter(r => r.status === '재고부족').length,
      samplePreservationCount: samples.length
    }
  });
});

app.get('/api/reports/experiments', (req, res) => {
  res.json({
    success: true,
    experimentStats: [
      { month: '2026-06', count: 18, successRate: '94.2%' },
      { month: '2026-07', count: 22, successRate: '96.0%' },
      { month: '2026-08', count: 26, successRate: '95.5%' },
      { month: '2026-09', count: 24, successRate: '97.1%' }
    ]
  });
});

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, notifications });
});

app.patch('/api/notifications/:notificationId/read', (req, res) => {
  const n = notifications.find(item => item.id === req.params.notificationId);
  if (n) n.read = true;
  res.json({ success: true, notifications });
});


// =========================================================================
// 10 INTENDED VULNERABILITY ENDPOINTS (Idempotency Key Missing: SEC-341 ~ SEC-350)
// =========================================================================

/**
 * SEC-341: 로그인 폼 멱등성 키 누락
 * 관련 API: POST /api/auth/login
 * 취약점 목적: 로그인 요청 시 Idempotency-Key 검증 누락으로 중복 인증 트랜잭션(transactionId) 생성
 * 정상적으로 필요한 Idempotency-Key 처리: Idempotency-Key 헤더를 확인하여 동일 키 재요청 시 기존 transactionId 반환
 * 의도된 취약 로직: Idempotency-Key 헤더 유무와 무관하게 매 요청마다 새로운 transactionId를 무조건 생성
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/auth/login 2회 호출 후 서로 다른 transactionId 확인
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Vulnerable logic: Ignores Idempotency-Key header and generates a new transactionId each time
  const transactionId = 'TX-LOGIN-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  
  res.json({
    success: true,
    message: '로그인 인증 트랜잭션이 처리되었습니다.',
    data: {
      transactionId: transactionId,
      user: currentUser,
      authenticatedAt: new Date().toISOString()
    }
  });
});


/**
 * SEC-342: 회원가입 폼 멱등성 키 누락
 * 관련 API: POST /api/auth/register
 * 취약점 목적: 신규 연구원 계정 등록 시 Idempotency-Key 누락으로 중복 registrationId 생성
 * 정상적으로 필요한 Idempotency-Key 처리: 동일 Idempotency-Key 재전송 시 최초 생성된 registrationId 반환
 * 의도된 취약 로직: Idempotency-Key를 저장/대조하지 않고 매번 새로운 registrationId 발급
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/auth/register 2회 호출 시 상이한 registrationId 확인
 */
app.post('/api/auth/register', (req, res) => {
  const { email, name, department, role, phone } = req.body;
  // Vulnerable logic: Generates a new registrationId each time without checking idempotency key
  const registrationId = 'REG-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  
  const newMember = {
    id: 'usr_res_' + Date.now(),
    name: name || '신규 연구원',
    email: email || 'new.researcher@nexuralab.org',
    role: role || '전임연구원',
    department: department || '분자생물학',
    phone: phone || '010-0000-0000',
    status: '정규 등록 승인'
  };
  researchers.push(newMember);
  
  res.json({
    success: true,
    message: '연구원 계정 등록이 완료되었습니다.',
    data: {
      registrationId: registrationId,
      researcher: newMember
    }
  });
});


/**
 * SEC-343: 연구원 주소 정보 저장 멱등성 키 누락
 * 관련 API: POST /api/researcher/address
 * 취약점 목적: 연구원 배송지/연구실 주소 등록 시 Idempotency-Key 누락으로 중복 addressId 생성 및 중복 저장
 * 정상적으로 필요한 Idempotency-Key 처리: 기존 저장된 주소 레코드를 대조하여 멱등성 보장
 * 의도된 취약 로직: Idempotency-Key 검증 없이 매 요청마다 새로운 addressId를 생성하여 배열에 누적
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/researcher/address 2회 호출 시 상이한 addressId 생성 확인
 */
app.post('/api/researcher/address', (req, res) => {
  const { street, detail, postalCode } = req.body;
  // Vulnerable logic: Ignores Idempotency-Key header and creates a new addressId
  const addressId = 'ADDR-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  
  const newAddr = {
    addressId: addressId,
    researcherId: currentUser.id,
    street: street || '서울특별시 서초구 양재동 R&D 이노베이션 파크',
    detail: detail || '바이오 첨단 분석 연구동 3층 302호',
    postalCode: postalCode || '06774'
  };
  researcherAddresses.push(newAddr);
  
  res.json({
    success: true,
    message: '연구원 연구실 주소가 저장되었습니다.',
    data: {
      addressId: addressId,
      address: newAddr
    }
  });
});


/**
 * SEC-344: 실험 프로젝트 생성 멱등성 키 누락
 * 관련 API: POST /api/projects
 * 취약점 목적: 신규 연구 프로젝트 개설 시 Idempotency-Key 누락으로 동일 프로젝트 중복 생성 및 서로 다른 projectId 발급
 * 정상적으로 필요한 Idempotency-Key 처리: 멱등성 키를 기반으로 중복 프로젝트 생성을 방지하고 기존 projectId 반환
 * 의도된 취약 로직: 매 요청마다 무조건 새로운 projectId를 생성하여 projects 배열에 추가
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/projects 2회 호출 후 서로 다른 projectId 생성 확인
 */
app.post('/api/projects', (req, res) => {
  const { name, description, principalInvestigator, expectedEndDate } = req.body;
  // Vulnerable logic: Ignores Idempotency-Key header, duplicates project
  const projectId = 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  
  const newProj = {
    id: projectId,
    name: name || '신규 첨단 바이오 연구 프로젝트',
    description: description || '단백질 구조 및 유전자 기능 분석 프로젝트',
    principalInvestigator: principalInvestigator || currentUser.name,
    status: '신규 개설 (Phase 1)',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: expectedEndDate || '2027-03-31',
    memberIds: [currentUser.id],
    experimentCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
  projects.unshift(newProj);
  
  res.json({
    success: true,
    message: '연구 프로젝트가 성공적으로 개설되었습니다.',
    data: {
      projectId: projectId,
      project: newProj
    }
  });
});


/**
 * SEC-345: 실험 등록 멱등성 키 누락
 * 관련 API: POST /api/experiments
 * 취약점 목적: 실험 등록 시 Idempotency-Key 누락으로 중복 실험 레코드 생성 및 별도 experimentId 발급
 * 정상적으로 필요한 Idempotency-Key 처리: 키를 저장하여 동일 실험 등록 재시도 시 기존 experimentId 반환
 * 의도된 취약 로직: 멱등성 키 검증 없이 매 요청마다 새로운 experimentId를 생성하여 experiments 배열에 누적
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/experiments 2회 호출 시 서로 다른 experimentId 확인
 */
app.post('/api/experiments', (req, res) => {
  const { projectId, name, protocol, notes, scheduledAt, equipmentId } = req.body;
  // Vulnerable logic: Generates a new experimentId without checking Idempotency-Key
  const experimentId = 'exp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  
  const newExp = {
    id: experimentId,
    projectId: projectId || projects[0]?.id || 'proj_01',
    name: name || '표준 분자생물학 정밀 검증 실험',
    researcherId: currentUser.id,
    researcherName: currentUser.name,
    equipmentId: equipmentId || 'eq_01',
    scheduledAt: scheduledAt || '2026-09-30 14:00',
    status: '진행예정',
    protocol: protocol || '표준 완충용액 배합 및 시료 정량 프로토콜',
    notes: notes || '실험실 BSL-2 안전 수칙 준수',
    createdAt: new Date().toISOString().split('T')[0]
  };
  experiments.unshift(newExp);
  
  res.json({
    success: true,
    message: '실험 일정이 정상적으로 등록되었습니다.',
    data: {
      experimentId: experimentId,
      experiment: newExp
    }
  });
});


/**
 * SEC-346: 실험 장비 예약 멱등성 키 누락
 * 관련 API: POST /api/equipment/reservations
 * 취약점 목적: 정밀 실험 장비 타임슬롯 예약 시 Idempotency-Key 누락으로 중복 reservationId 생성
 * 정상적으로 필요한 Idempotency-Key 처리: 동일 키 재요청 시 기존 예약 내역 반환 및 중복 예약 차단
 * 의도된 취약 로직: Idempotency-Key 검증 없이 매번 새로운 reservationId를 생성하여 reservations 배열에 추가
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/equipment/reservations 2회 호출 시 서로 다른 reservationId 확인
 */
app.post('/api/equipment/reservations', (req, res) => {
  const { equipmentId, date, startTime, endTime, purpose } = req.body;
  const eq = equipmentList.find(e => e.id === equipmentId) || equipmentList[0];
  
  // Vulnerable logic: Ignores Idempotency-Key and creates duplicate reservationId
  const reservationId = 'res_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  
  const newRes = {
    id: reservationId,
    equipmentId: eq.id,
    equipmentName: eq.name,
    researcherId: currentUser.id,
    researcherName: currentUser.name,
    date: date || '2026-09-29',
    startTime: startTime || '13:00',
    endTime: endTime || '15:30',
    purpose: purpose || '세포 유전자 발현 정밀 형광 분석'
  };
  reservations.unshift(newRes);
  
  res.json({
    success: true,
    message: '실험 장비 예약이 완료되었습니다.',
    data: {
      reservationId: reservationId,
      reservation: newRes
    }
  });
});


/**
 * SEC-347: 시약 재고 입고 기록 멱등성 키 누락
 * 관련 API: POST /api/reagents/receipts
 * 취약점 목적: 시약 및 소모품 입고 시 Idempotency-Key 누락으로 중복 receiptId 생성 및 시약 재고 수량 중복 누적 증가
 * 정상적으로 필요한 Idempotency-Key 처리: 동일 키 입고 요청 시 재고 증가를 1회만 처리하고 기존 receiptId 반환
 * 의도된 취약 로직: 멱등성 키 검증 없이 매 요청마다 receiptId를 새로 발급하고 시약 quantity를 계속 더함
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/reagents/receipts 2회 호출 시 상이한 receiptId 및 재고 중복 증가 확인
 */
app.post('/api/reagents/receipts', (req, res) => {
  const { reagentId, quantity } = req.body;
  const reag = reagents.find(r => r.id === reagentId) || reagents[0];
  const addedQty = Number(quantity) || 5;
  
  // Vulnerable logic: Ignores Idempotency-Key, duplicates receiptId and increments stock repeatedly
  const receiptId = 'REC-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  reag.quantity += addedQty;
  if (reag.quantity >= reag.minimumStock) reag.status = '충분';
  
  const newReceipt = {
    receiptId: receiptId,
    reagentId: reag.id,
    reagentName: reag.name,
    quantity: addedQty,
    currentStock: reag.quantity,
    receivedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    receivedBy: currentUser.name
  };
  reagentReceipts.unshift(newReceipt);
  
  res.json({
    success: true,
    message: '시약 입고 처리가 완료되었습니다.',
    data: {
      receiptId: receiptId,
      receipt: newReceipt,
      reagent: reag
    }
  });
});


/**
 * SEC-348: 연구 샘플 등록 멱등성 키 누락
 * 관련 API: POST /api/samples
 * 취약점 목적: 생체 바이오 샘플 등록 시 Idempotency-Key 누락으로 동일 샘플 중복 생성 및 별도 sampleId 발급
 * 정상적으로 필요한 Idempotency-Key 처리: 키를 대조하여 멱등성을 보장하고 기존 sampleId 반환
 * 의도된 취약 로직: Idempotency-Key 검증 없이 매 요청마다 새로운 sampleId를 생성하여 samples 배열에 추가
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/samples 2회 호출 시 서로 다른 sampleId 확인
 */
app.post('/api/samples', (req, res) => {
  const { projectId, name, sampleType, storageLocation, notes } = req.body;
  // Vulnerable logic: Ignores Idempotency-Key header, duplicates sampleId
  const sampleId = 'smp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  
  const newSmp = {
    id: sampleId,
    projectId: projectId || projects[0]?.id || 'proj_01',
    name: name || 'HEK293T-Recombinant-Sample-A',
    sampleType: sampleType || '유전자 편집 세포주',
    collectedAt: new Date().toISOString().split('T')[0],
    status: '-80℃ 초저온 동결 보관',
    storageLocation: storageLocation || 'Deep Freezer 2 Rack A-3',
    researcherId: currentUser.id,
    notes: notes || '세포 생존율 98% 보존'
  };
  samples.unshift(newSmp);
  
  res.json({
    success: true,
    message: '연구 샘플이 성공적으로 등록되었습니다.',
    data: {
      sampleId: sampleId,
      sample: newSmp
    }
  });
});


/**
 * SEC-349: 연구 노트 작성 멱등성 키 누락
 * 관련 API: POST /api/lab-notes
 * 취약점 목적: 실험 관찰 연구 노트 저장 시 Idempotency-Key 누락으로 동일 내용의 중복 noteId 생성
 * 정상적으로 필요한 Idempotency-Key 처리: 동일 키 재전송 시 기존 연구 노트 noteId 반환
 * 의도된 취약 로직: Idempotency-Key를 저장하지 않고 매 요청마다 새로운 noteId를 생성하여 labNotes 배열에 누적
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/lab-notes 2회 호출 시 서로 다른 noteId 생성 확인
 */
app.post('/api/lab-notes', (req, res) => {
  const { projectId, experimentId, title, content } = req.body;
  // Vulnerable logic: Ignores Idempotency-Key and creates new noteId
  const noteId = 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  
  const newNote = {
    id: noteId,
    projectId: projectId || projects[0]?.id || 'proj_01',
    experimentId: experimentId || experiments[0]?.id || 'exp_01',
    title: title || '실험 관찰 및 중간 분석 연구 노트',
    content: content || '실험 프로토콜 수행 과정에서 특이 반응 없이 목표 밴드가 선명히 검출됨.',
    author: `${currentUser.name} 책임연구원`,
    date: new Date().toISOString().split('T')[0]
  };
  labNotes.unshift(newNote);
  
  res.json({
    success: true,
    message: '연구 노트가 정상적으로 저장되었습니다.',
    data: {
      noteId: noteId,
      note: newNote
    }
  });
});


/**
 * SEC-350: 실험 결과 기록 멱등성 키 누락
 * 관련 API: POST /api/experiment-results
 * 취약점 목적: 정밀 실험 측정 결과 기록 시 Idempotency-Key 누락으로 중복 resultId 생성
 * 정상적으로 필요한 Idempotency-Key 처리: 키를 확인하여 중복 결과 기록을 방지하고 기존 resultId 반환
 * 의도된 취약 로직: Idempotency-Key 헤더 유무와 무관하게 매번 새로운 resultId를 발급하여 experimentResults 배열에 추가
 * PPO 탐지 시나리오: 동일 Idempotency-Key로 POST /api/experiment-results 2회 호출 시 상이한 resultId 생성 확인
 */
app.post('/api/experiment-results', (req, res) => {
  const { experimentId, title, resultType, value, unit, interpretation } = req.body;
  // Vulnerable logic: Ignores Idempotency-Key header, duplicates resultId
  const resultId = 'res_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  
  const newRes = {
    id: resultId,
    experimentId: experimentId || experiments[0]?.id || 'exp_01',
    title: title || '정밀 분광광도 측정 및 정량 수율 분석 결과',
    resultType: resultType || '정량 수율',
    value: Number(value) || 92.4,
    unit: unit || '%',
    interpretation: interpretation || '기준 규격(80% 이상) 충족 및 신뢰구간 95% 내 적합',
    createdBy: currentUser.name,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
  };
  experimentResults.unshift(newRes);
  
  res.json({
    success: true,
    message: '실험 측정 결과가 등록되었습니다.',
    data: {
      resultId: resultId,
      result: newRes
    }
  });
});


// Serve frontend for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Nexura Lab OS] Server running on http://localhost:${PORT}`);
});
