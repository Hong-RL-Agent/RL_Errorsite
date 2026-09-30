import React, { useState, useEffect } from 'react';

export default function App() {
  // Navigation State (15 Sidebar Menus)
  const [activeNav, setActiveNav] = useState('overview');

  // Lab & User States
  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState('lab_01');
  const [user, setUser] = useState({
    id: 'usr_res_01',
    name: '정서윤',
    email: 'seoyoon.jung@nexuralab.org',
    role: '책임연구원 (Principal Investigator)',
    department: '분자생물학 & 유전체 연구실',
    phone: '010-8291-7734',
    status: '연구실 재실'
  });

  // Data States
  const [researchers, setResearchers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reagents, setReagents] = useState([]);
  const [samples, setSamples] = useState([]);
  const [labNotes, setLabNotes] = useState([]);
  const [experimentResults, setExperimentResults] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [labReport, setLabReport] = useState(null);

  // Modals & Drawers
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isExperimentModalOpen, setIsExperimentModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReagentReceiptModalOpen, setIsReagentReceiptModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: 'seoyoon.jung@nexuralab.org', password: '••••••••' });
  const [registerForm, setRegisterForm] = useState({ name: '임수진', email: 'sujin.lim@nexuralab.org', department: '세포유전체학', role: '전임연구원', phone: '010-5591-2390' });
  const [addressForm, setAddressForm] = useState({ street: '서울특별시 서초구 양재동 R&D 이노베이션 파크', detail: '바이오 첨단 분석 연구동 3층 302호', postalCode: '06774' });
  const [projectForm, setProjectForm] = useState({ name: '단백질-리간드 결합 동역학 시뮬레이션', description: '생체 분자 복합체의 펨토초 단위 구조 변화 및 결합 친화도 규명', principalInvestigator: '정서윤 박사', expectedEndDate: '2027-04-30' });
  const [experimentForm, setExperimentForm] = useState({ projectId: 'proj_01', name: 'Real-Time PCR 타겟 유전자 상대정량 4차 반복', equipmentId: 'eq_01', scheduledAt: '2026-09-30 14:00', protocol: 'TaqMan Fast Master Mix 20uL 반응계 구축' });
  const [reservationForm, setReservationForm] = useState({ equipmentId: 'eq_01', date: '2026-09-29', startTime: '13:00', endTime: '16:00', purpose: '형광 PCR 유전자 발현 정밀 측정' });
  const [reagentForm, setReagentForm] = useState({ reagentId: 'reag_01', quantity: 5 });
  const [sampleForm, setSampleForm] = useState({ projectId: 'proj_01', name: 'HEK293T-CRISPR-Clone-B7', sampleType: '유전자 편집 세포주', storageLocation: 'Deep Freezer 2 Box C-8', notes: 'Exon 3 돌연변이 단일클론 세포주' });
  const [noteForm, setNoteForm] = useState({ projectId: 'proj_01', experimentId: 'exp_01', title: 'Cas9 RNP 농도 구배에 따른 인델(Indel) 유도율 관찰', content: '농도 구배 실험 결과 500ng/well 조건에서 세포 생존율 94% 유지 및 편집 효율 84.6% 달성.' });
  const [resultForm, setResultForm] = useState({ experimentId: 'exp_01', title: '유전자 편집 온타겟 효율 측정 결과', resultType: '정량 수율', value: 88.4, unit: '%', interpretation: '기존 대조군 대비 유의미한 효율 증대 확인' });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (title, desc = '') => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 5000);
  };

  // Initial Load
  useEffect(() => {
    fetchLabs();
    fetchResearchers();
    fetchAddresses();
    fetchProjects();
    fetchExperiments();
    fetchEquipment();
    fetchReservations();
    fetchReagents();
    fetchSamples();
    fetchLabNotes();
    fetchResults();
    fetchMaintenance();
    fetchAnnouncements();
    fetchMessages();
    fetchNotifications();
    fetchReports();
  }, []);

  // API Call Helpers
  const fetchLabs = async () => {
    try {
      const res = await fetch('/api/labs');
      const data = await res.json();
      if (data.success) {
        setLabs(data.labs || []);
        if (data.selectedLabId) setSelectedLabId(data.selectedLabId);
      }
    } catch (e) { console.error(e); }
  };

  const fetchResearchers = async () => {
    try {
      const res = await fetch('/api/researchers');
      const data = await res.json();
      if (data.success) setResearchers(data.researchers || []);
    } catch (e) { console.error(e); }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/researcher/address');
      const data = await res.json();
      if (data.success) setAddresses(data.addresses || []);
    } catch (e) { console.error(e); }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setProjects(data.projects || []);
    } catch (e) { console.error(e); }
  };

  const fetchExperiments = async () => {
    try {
      const res = await fetch('/api/experiments');
      const data = await res.json();
      if (data.success) setExperiments(data.experiments || []);
    } catch (e) { console.error(e); }
  };

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      if (data.success) setEquipmentList(data.equipment || []);
    } catch (e) { console.error(e); }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/equipment/reservations');
      const data = await res.json();
      if (data.success) setReservations(data.reservations || []);
    } catch (e) { console.error(e); }
  };

  const fetchReagents = async () => {
    try {
      const res = await fetch('/api/reagents');
      const data = await res.json();
      if (data.success) setReagents(data.reagents || []);
    } catch (e) { console.error(e); }
  };

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      const data = await res.json();
      if (data.success) setSamples(data.samples || []);
    } catch (e) { console.error(e); }
  };

  const fetchLabNotes = async () => {
    try {
      const res = await fetch('/api/lab-notes');
      const data = await res.json();
      if (data.success) setLabNotes(data.notes || []);
    } catch (e) { console.error(e); }
  };

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/experiment-results');
      const data = await res.json();
      if (data.success) setExperimentResults(data.results || []);
    } catch (e) { console.error(e); }
  };

  const fetchMaintenance = async () => {
    try {
      const res = await fetch('/api/equipment/maintenance');
      const data = await res.json();
      if (data.success) setMaintenanceLogs(data.maintenance || []);
    } catch (e) { console.error(e); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) setAnnouncements(data.announcements || []);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.success) setMessages(data.messages || []);
    } catch (e) { console.error(e); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) setNotifications(data.notifications || []);
    } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success) setLabReport(data.report);
    } catch (e) { console.error(e); }
  };

  // =========================================================================
  // 10 IDEMPOTENCY KEY MISSING VULNERABILITY ATTACK SIMULATOR (with Bug IDs)
  // =========================================================================
  const simulateIdempotencyAttack = async (bugIndex) => {
    const idempotencyKey = `lab-idem-key-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      switch (bugIndex) {
        case 1: { // SEC-341: 로그인 폼 멱등성 키 누락
          const payload = { email: loginForm.email, password: loginForm.password };
          const res1 = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          setIsLoginModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-001 / SEC-341] 로그인 멱등성 키 누락 확인', `동일 Idempotency-Key 전송 결과 중복 트랜잭션 발급! (TX 1: ${d1.data.transactionId} / TX 2: ${d2.data.transactionId})`);
          break;
        }
        case 2: { // SEC-342: 회원가입 폼 멱등성 키 누락
          const payload = { name: registerForm.name, email: registerForm.email, department: registerForm.department, role: registerForm.role, phone: registerForm.phone };
          const res1 = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchResearchers();
          setIsRegisterModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-002 / SEC-342] 회원가입 멱등성 키 누락 확인', `동일 Idempotency-Key 전송 시 중복 가입 레코드 생성! (REG 1: ${d1.data.registrationId} / REG 2: ${d2.data.registrationId})`);
          break;
        }
        case 3: { // SEC-343: 연구원 주소 정보 저장 멱등성 키 누락
          const payload = { street: addressForm.street, detail: addressForm.detail, postalCode: addressForm.postalCode };
          const res1 = await fetch('/api/researcher/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/researcher/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchAddresses();
          setIsAddressModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-003 / SEC-343] 주소 저장 멱등성 키 누락 확인', `동일 Idempotency-Key 전송 시 중복 주소지 발급! (ADDR 1: ${d1.data.addressId} / ADDR 2: ${d2.data.addressId})`);
          break;
        }
        case 4: { // SEC-344: 실험 프로젝트 생성 멱등성 키 누락
          const payload = { name: projectForm.name, description: projectForm.description, principalInvestigator: projectForm.principalInvestigator, expectedEndDate: projectForm.expectedEndDate };
          const res1 = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchProjects();
          setIsProjectModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-004 / SEC-344] 프로젝트 생성 멱등성 키 누락 확인', `동일 Idempotency-Key 재전송 시 중복 프로젝트 개설! (Proj 1: ${d1.data.projectId} / Proj 2: ${d2.data.projectId})`);
          break;
        }
        case 5: { // SEC-345: 실험 등록 멱등성 키 누락
          const payload = { projectId: experimentForm.projectId, name: experimentForm.name, protocol: experimentForm.protocol, scheduledAt: experimentForm.scheduledAt, equipmentId: experimentForm.equipmentId };
          const res1 = await fetch('/api/experiments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/experiments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchExperiments();
          setIsExperimentModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-005 / SEC-345] 실험 등록 멱등성 키 누락 확인', `동일 Idempotency-Key 재전송 시 중복 실험 일정 등록! (Exp 1: ${d1.data.experimentId} / Exp 2: ${d2.data.experimentId})`);
          break;
        }
        case 6: { // SEC-346: 실험 장비 예약 멱등성 키 누락
          const payload = { equipmentId: reservationForm.equipmentId, date: reservationForm.date, startTime: reservationForm.startTime, endTime: reservationForm.endTime, purpose: reservationForm.purpose };
          const res1 = await fetch('/api/equipment/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/equipment/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchReservations();
          setIsReservationModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-006 / SEC-346] 장비 예약 멱등성 키 누락 확인', `동일 Idempotency-Key 재전송 시 중복 예약 슬롯 발급! (Res 1: ${d1.data.reservationId} / Res 2: ${d2.data.reservationId})`);
          break;
        }
        case 7: { // SEC-347: 시약 재고 입고 기록 멱등성 키 누락
          const payload = { reagentId: reagentForm.reagentId, quantity: reagentForm.quantity };
          const res1 = await fetch('/api/reagents/receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/reagents/receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchReagents();
          setIsReagentReceiptModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-007 / SEC-347] 시약 입고 멱등성 키 누락 확인', `동일 Idempotency-Key 입고 시 재고 수량 중복 누적! (Rec 1: ${d1.data.receiptId} / Rec 2: ${d2.data.receiptId})`);
          break;
        }
        case 8: { // SEC-348: 연구 샘플 등록 멱등성 키 누락
          const payload = { projectId: sampleForm.projectId, name: sampleForm.name, sampleType: sampleForm.sampleType, storageLocation: sampleForm.storageLocation, notes: sampleForm.notes };
          const res1 = await fetch('/api/samples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/samples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchSamples();
          setIsSampleModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-008 / SEC-348] 샘플 등록 멱등성 키 누락 확인', `동일 Idempotency-Key 재전송 시 중복 샘플 ID 발급! (Smp 1: ${d1.data.sampleId} / Smp 2: ${d2.data.sampleId})`);
          break;
        }
        case 9: { // SEC-349: 연구 노트 작성 멱등성 키 누락
          const payload = { projectId: noteForm.projectId, experimentId: noteForm.experimentId, title: noteForm.title, content: noteForm.content };
          const res1 = await fetch('/api/lab-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/lab-notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchLabNotes();
          setIsNoteModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-009 / SEC-349] 연구노트 멱등성 키 누락 확인', `동일 Idempotency-Key 재전송 시 중복 연구노트 저장! (Note 1: ${d1.data.noteId} / Note 2: ${d2.data.noteId})`);
          break;
        }
        case 10: { // SEC-350: 실험 결과 기록 멱등성 키 누락
          const payload = { experimentId: resultForm.experimentId, title: resultForm.title, resultType: resultForm.resultType, value: resultForm.value, unit: resultForm.unit, interpretation: resultForm.interpretation };
          const res1 = await fetch('/api/experiment-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d1 = await res1.json();

          const res2 = await fetch('/api/experiment-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
            body: JSON.stringify(payload)
          });
          const d2 = await res2.json();

          fetchResults();
          setIsResultModalOpen(false);
          showToast('🚨 [Bug ID: SITE032-BUG-010 / SEC-350] 실험결과 멱등성 키 누락 확인', `동일 Idempotency-Key 재전송 시 중복 결과 레코드 생성! (Res 1: ${d1.data.resultId} / Res 2: ${d2.data.resultId})`);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      showToast('오류', '멱등성 요청 처리 중 문제가 발생했습니다.');
    }
  };

  const currentLab = labs.find(l => l.id === selectedLabId) || labs[0] || { name: 'Molecular Biology Lab' };

  return (
    <div className="nl-layout">
      {/* =========================================================
          LEFT SIDEBAR (15 MENUS)
          ========================================================= */}
      <aside className="nl-sidebar">
        <div className="nl-brand" onClick={() => setActiveNav('overview')}>
          <div className="nl-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
          </div>
          <div>
            <div className="nl-brand-title">Nexura Lab</div>
            <div className="nl-brand-sub">Laboratory OS</div>
          </div>
        </div>

        {/* Current Lab Box */}
        <div className="nl-sidebar-lab-box">
          <div className="nl-lab-tag-row">
            <span>ACTIVE LAB</span>
            <span>BSL-2 시설</span>
          </div>
          <div className="nl-lab-name-current">{currentLab.name}</div>
          <div className="nl-lab-meta-row">
            <span>연구원 {currentLab.memberCount}명</span>
            <span>·</span>
            <span>장비 5종</span>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="nl-sidebar-nav">
          <div className="nl-nav-section-title">연구실 관제 & 프로젝트</div>
          
          <div className={`nl-nav-item ${activeNav === 'overview' ? 'active' : ''}`} onClick={() => setActiveNav('overview')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>연구실 현황 (Overview)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'projects' ? 'active' : ''}`} onClick={() => setActiveNav('projects')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>연구 프로젝트 (Projects)</span>
            <span className="nl-nav-badge">{projects.length}</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'researchers' ? 'active' : ''}`} onClick={() => setActiveNav('researchers')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>연구원 관리 (Researchers)</span>
          </div>

          <div className="nl-nav-section-title">실험 장비 & 자원</div>

          <div className={`nl-nav-item ${activeNav === 'equipment' ? 'active' : ''}`} onClick={() => setActiveNav('equipment')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>실험 장비 (Equipment)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'reservations' ? 'active' : ''}`} onClick={() => setActiveNav('reservations')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>장비 예약 (Reservations)</span>
            <span className="nl-nav-badge">{reservations.length}</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'reagents' ? 'active' : ''}`} onClick={() => setActiveNav('reagents')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v7.31L4.62 20.3A2 2 0 0 0 6.38 23h11.24a2 2 0 0 0 1.76-2.7L14 9.31V2"/></svg>
            <span>시약 및 소모품 (Reagents)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'samples' ? 'active' : ''}`} onClick={() => setActiveNav('samples')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>바이오 샘플 (Samples)</span>
          </div>

          <div className="nl-nav-section-title">실험 실행 & 데이터</div>

          <div className={`nl-nav-item ${activeNav === 'experiments' ? 'active' : ''}`} onClick={() => setActiveNav('experiments')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>실험 일정 (Experiments)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'notes' ? 'active' : ''}`} onClick={() => setActiveNav('notes')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>연구 노트 (Lab Notes)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'results' ? 'active' : ''}`} onClick={() => setActiveNav('results')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>실험 결과 (Results)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveNav('maintenance')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <span>장비 점검 (Maintenance)</span>
          </div>

          <div className="nl-nav-section-title">소통 & 리포트</div>

          <div className={`nl-nav-item ${activeNav === 'reports' ? 'active' : ''}`} onClick={() => setActiveNav('reports')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>연구 리포트 (Reports)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'announcements' ? 'active' : ''}`} onClick={() => setActiveNav('announcements')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>연구실 공지 (Announcements)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'messages' ? 'active' : ''}`} onClick={() => setActiveNav('messages')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>연구원 메시지 (Messages)</span>
          </div>

          <div className={`nl-nav-item ${activeNav === 'settings' ? 'active' : ''}`} onClick={() => setActiveNav('settings')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>환경 설정 (Settings)</span>
          </div>
        </nav>

        {/* User Info Footer */}
        <div className="nl-sidebar-footer">
          <div className="nl-user-avatar">{user.name.slice(0, 1)}</div>
          <div className="nl-user-details">
            <div className="nl-user-name">{user.name}</div>
            <div className="nl-user-role">{user.role.split(' ')[0]}</div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN WRAPPER & TOP BAR
          ========================================================= */}
      <div className="nl-main-wrapper">
        <header className="nl-header">
          <div className="nl-header-left">
            <div className="nl-lab-select-wrap">
              <span className="nl-lab-select-label">LAB</span>
              <select
                className="nl-lab-select"
                value={selectedLabId}
                onChange={(e) => { setSelectedLabId(e.target.value); showToast('연구실 전환', '선택한 연구실 정보로 전환되었습니다.'); }}
              >
                {labs.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="nl-lab-status-pill">
              <span className="nl-status-dot"></span>
              <span>{currentLab.status}</span>
            </div>
          </div>

          <div className="nl-header-right">
            <button className="nl-header-btn" onClick={() => setIsLoginModalOpen(true)}>
              🔐 연구원 인증
            </button>

            <button className="nl-header-icon-btn" onClick={() => setIsNotifDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="nl-icon-badge">{notifications.length}</span>
            </button>

            <button className="nl-header-icon-btn" onClick={() => setIsMessageDrawerOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="nl-icon-badge">{messages.length}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
              <div className="nl-user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{user.name.slice(0, 1)}</div>
              <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--teal-800)' }}>{user.name}</span>
            </div>
          </div>
        </header>

        {/* =========================================================
            MAIN CONTENT
            ========================================================= */}
        <main className="nl-content">
          {/* VIEW 1: OVERVIEW */}
          {activeNav === 'overview' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">{currentLab.name} 연구 관제 현황</h1>
                  <p className="nl-page-desc">진행 중인 프로젝트, 오늘 예정된 실험 일정, 장비 가동률 및 시약 재고를 종합 모니터링합니다.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="nl-btn nl-btn-lavender" onClick={() => setIsReservationModalOpen(true)}>
                    🔬 장비 즉시 예약
                  </button>
                  <button className="nl-btn nl-btn-primary" onClick={() => setIsExperimentModalOpen(true)}>
                    + 실험 일정 등록
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="nl-grid-4">
                <div className="nl-stat-card">
                  <div className="nl-stat-icon nl-stat-teal">📁</div>
                  <div className="nl-stat-info">
                    <div className="nl-stat-label">활성 연구 프로젝트</div>
                    <div className="nl-stat-val">{projects.length}개 과제</div>
                    <div className="nl-stat-sub">CRISPR 외 2건 정상 진행</div>
                  </div>
                </div>

                <div className="nl-stat-card">
                  <div className="nl-stat-icon nl-stat-cyan">🔬</div>
                  <div className="nl-stat-info">
                    <div className="nl-stat-label">장비 실시간 가동률</div>
                    <div className="nl-stat-val">87.4%</div>
                    <div className="nl-stat-sub">NanoDrop 측정 진행중</div>
                  </div>
                </div>

                <div className="nl-stat-card">
                  <div className="nl-stat-icon nl-stat-amber">🧪</div>
                  <div className="nl-stat-info">
                    <div className="nl-stat-label">시약 긴급 발주 필요</div>
                    <div className="nl-stat-val">{reagents.filter(r => r.status === '재고부족').length}종</div>
                    <div className="nl-stat-sub" style={{ color: 'var(--status-alert)' }}>Lipofectamine 재고 부족</div>
                  </div>
                </div>

                <div className="nl-stat-card">
                  <div className="nl-stat-icon nl-stat-lavender">🧬</div>
                  <div className="nl-stat-info">
                    <div className="nl-stat-label">초저온 동결 샘플</div>
                    <div className="nl-stat-val">{samples.length}개 보관</div>
                    <div className="nl-stat-sub">-80℃ 및 LN2 정상 보존</div>
                  </div>
                </div>
              </div>

              {/* Experiments Schedule & Equipment Status */}
              <div className="nl-grid-2">
                <div className="nl-card">
                  <div className="nl-card-header">
                    <div className="nl-card-title">📋 오늘의 주요 실험 일정 ({experiments.length}건)</div>
                    <button className="nl-btn nl-btn-secondary nl-btn-sm" onClick={() => setIsExperimentModalOpen(true)}>
                      + 새 실험
                    </button>
                  </div>
                  {experiments.map(exp => (
                    <div key={exp.id} style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.96rem', color: 'var(--teal-800)' }}>{exp.name}</strong>
                        <span className="nl-lab-status-pill" style={{ fontSize: '0.72rem' }}>{exp.status}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: '8px' }}>{exp.protocol}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>담당: {exp.researcherName}</span>
                        <span>일시: {exp.scheduledAt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="nl-card">
                  <div className="nl-card-header">
                    <div className="nl-card-title">🔬 첨단 연구 장비 가동 현황</div>
                    <button className="nl-btn nl-btn-secondary nl-btn-sm" onClick={() => setActiveNav('equipment')}>
                      전체 장비 →
                    </button>
                  </div>
                  {equipmentList.slice(0, 4).map(eq => (
                    <div key={eq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: 'var(--teal-800)', fontSize: '0.92rem' }}>{eq.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>{eq.location} · {eq.model}</div>
                      </div>
                      <span className="nl-lab-status-pill">{eq.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PROJECTS (Bug 4 - SEC-344) */}
          {activeNav === 'projects' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">연구 프로젝트 관리 ({projects.length}개 과제)</h1>
                  <p className="nl-page-desc">유전체 편집, 단백질 구조학, 바이오인포매틱스 핵심 연구 과제를 관리합니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsProjectModalOpen(true)}>
                  + 새 연구 프로젝트 개설
                </button>
              </div>

              <div className="nl-grid-3">
                {projects.map(proj => (
                  <div key={proj.id} className="nl-card">
                    <span className="nl-lab-status-pill" style={{ marginBottom: '8px' }}>{proj.status}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--teal-800)', margin: '8px 0 6px' }}>{proj.name}</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginBottom: '14px', lineHeight: '1.5' }}>{proj.description}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      책임연구원: <strong>{proj.principalInvestigator}</strong>
                      <br />
                      연구 기간: {proj.startDate} ~ {proj.expectedEndDate}
                    </div>
                    <button className="nl-btn nl-btn-secondary nl-btn-sm" style={{ width: '100%' }} onClick={() => { setSelectedProject(proj); showToast('프로젝트 선택', `[${proj.name}] 과제 상세 정보를 불러왔습니다.`); }}>
                      과제 상세 리포트
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: RESEARCHERS (Bug 2 - SEC-342) */}
          {activeNav === 'researchers' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">연구원 및 전담 인력 풀 ({researchers.length}명)</h1>
                  <p className="nl-page-desc">분자생물학, 단백질 정제, 유전체 분석 전문 연구원 명단 및 소속 관리입니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsRegisterModalOpen(true)}>
                  + 신규 연구원 등록
                </button>
              </div>

              <div className="nl-grid-2">
                {researchers.map(r => (
                  <div key={r.id} className="nl-card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="nl-user-avatar" style={{ width: '56px', height: '56px', fontSize: '1.3rem' }}>{r.name.slice(0, 1)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--teal-800)' }}>{r.name}</h4>
                        <span className="nl-lab-status-pill">{r.status}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--lavender-deep)', fontWeight: '700' }}>{r.department} · {r.role}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '4px' }}>📧 {r.email} · 📞 {r.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: EQUIPMENT & RESERVATIONS (Bug 6 - SEC-346) */}
          {activeNav === 'equipment' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">실험 장비 도감 및 예약 현황</h1>
                  <p className="nl-page-desc">Real-Time PCR, 초고속 원심분리기, 공초점 현미경 등 첨단 분석 장비를 예약합니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsReservationModalOpen(true)}>
                  🔬 장비 예약 신청
                </button>
              </div>

              <div className="nl-grid-3">
                {equipmentList.map(eq => (
                  <div key={eq.id} className="nl-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <img src={eq.image} alt={eq.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '18px' }}>
                      <span className="nl-lab-status-pill">{eq.status}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--teal-800)', margin: '8px 0 4px' }}>{eq.name}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '12px' }}>{eq.description}</p>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        위치: {eq.location} · 시리얼: {eq.serialNumber}
                      </div>
                      <button className="nl-btn nl-btn-primary nl-btn-sm" style={{ width: '100%' }} onClick={() => { setReservationForm({ ...reservationForm, equipmentId: eq.id }); setIsReservationModalOpen(true); }}>
                        장비 예약하기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: RESERVATIONS */}
          {activeNav === 'reservations' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">장비 예약 타임테이블 ({reservations.length}건)</h1>
                  <p className="nl-page-desc">연구원별 장비 사용 시간 및 실험 목적 예약 내역입니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsReservationModalOpen(true)}>
                  + 장비 예약 추가
                </button>
              </div>

              <div className="nl-table-wrap">
                <table className="nl-table">
                  <thead>
                    <tr>
                      <th>장비명</th>
                      <th>예약 연구원</th>
                      <th>예약 일자</th>
                      <th>사용 시간</th>
                      <th>실험 목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(res => (
                      <tr key={res.id}>
                        <td><strong>{res.equipmentName}</strong></td>
                        <td>{res.researcherName}</td>
                        <td>{res.date}</td>
                        <td><span className="nl-lab-status-pill">{res.startTime} ~ {res.endTime}</span></td>
                        <td>{res.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 6: REAGENTS (Bug 7 - SEC-347) */}
          {activeNav === 'reagents' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">시약 및 소모품 재고 관리 ({reagents.length}종)</h1>
                  <p className="nl-page-desc">PCR 시약, 완충액, 형광 염색제 및 멸균 팁 재고를 관리하고 입고 처리합니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsReagentReceiptModalOpen(true)}>
                  📦 시약 입고 처리
                </button>
              </div>

              <div className="nl-grid-3">
                {reagents.map(reag => (
                  <div key={reag.id} className="nl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="nl-lab-status-pill">{reag.category}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: reag.status === '재고부족' ? 'var(--status-alert)' : 'var(--teal-700)' }}>{reag.status}</span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--teal-800)', margin: '4px 0 8px' }}>{reag.name}</h4>
                    <div className="nl-stat-val" style={{ fontSize: '1.3rem', margin: '4px 0' }}>{reag.quantity} {reag.unit}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginBottom: '14px' }}>
                      최소 기준: {reag.minimumStock}{reag.unit} · 보관: {reag.storageCondition}
                      <br />
                      유효기간: {reag.expirationDate}
                    </div>
                    <button className="nl-btn nl-btn-secondary nl-btn-sm" style={{ width: '100%' }} onClick={() => { setReagentForm({ reagentId: reag.id, quantity: 5 }); setIsReagentReceiptModalOpen(true); }}>
                      📦 입고 등록
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 7: SAMPLES (Bug 8 - SEC-348) */}
          {activeNav === 'samples' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">생체 바이오 샘플 보관함 ({samples.length}개)</h1>
                  <p className="nl-page-desc">초저온 동결 세포주, 정제 단백질 용액, gDNA 라이브러리 보관 위치를 관리합니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsSampleModalOpen(true)}>
                  + 새 샘플 등록
                </button>
              </div>

              <div className="nl-grid-3">
                {samples.map(smp => (
                  <div key={smp.id} className="nl-card">
                    <span className="nl-lab-status-pill">{smp.sampleType}</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--teal-800)', margin: '8px 0 4px' }}>{smp.name}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: '10px' }}>{smp.notes}</p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      보관: <strong>{smp.storageLocation}</strong>
                      <br />
                      상태: {smp.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 8: EXPERIMENTS (Bug 5 - SEC-345) */}
          {activeNav === 'experiments' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">실험 일정 및 프로토콜 관리</h1>
                  <p className="nl-page-desc">배정된 실험 프로토콜, 타임라인 및 담당 연구원을 추적합니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsExperimentModalOpen(true)}>
                  + 실험 일정 등록
                </button>
              </div>

              <div className="nl-table-wrap">
                <table className="nl-table">
                  <thead>
                    <tr>
                      <th>실험명</th>
                      <th>담당 연구원</th>
                      <th>예정 일시</th>
                      <th>상태</th>
                      <th>실험 프로토콜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiments.map(exp => (
                      <tr key={exp.id}>
                        <td><strong>{exp.name}</strong></td>
                        <td>{exp.researcherName}</td>
                        <td>{exp.scheduledAt}</td>
                        <td><span className="nl-lab-status-pill">{exp.status}</span></td>
                        <td>{exp.protocol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 9: LAB NOTES (Bug 9 - SEC-349) */}
          {activeNav === 'notes' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">전자 연구 노트 (Lab Notes)</h1>
                  <p className="nl-page-desc">실험 관찰 기록, 중간 데이터 분석 및 연구원 코멘트를 저장합니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsNoteModalOpen(true)}>
                  ✍️ 새 연구 노트 작성
                </button>
              </div>

              <div className="nl-grid-2">
                {labNotes.map(note => (
                  <div key={note.id} className="nl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="nl-lab-status-pill">{note.author}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{note.date}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--teal-800)', marginBottom: '8px' }}>{note.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--graphite-800)', lineHeight: '1.6', background: 'var(--bg-sand)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 10: RESULTS (Bug 10 - SEC-350) */}
          {activeNav === 'results' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">정밀 실험 결과 및 통계 데이터</h1>
                  <p className="nl-page-desc">정량 분석 수율, 효소 활성도 및 유의확률 검증 결과입니다.</p>
                </div>
                <button className="nl-btn nl-btn-primary" onClick={() => setIsResultModalOpen(true)}>
                  📊 실험 결과 기록
                </button>
              </div>

              <div className="nl-grid-2">
                {experimentResults.map(res => (
                  <div key={res.id} className="nl-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="nl-lab-status-pill">{res.resultType}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.createdAt}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--teal-800)', marginBottom: '6px' }}>{res.title}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--teal-700)', margin: '8px 0' }}>
                      {res.value} {res.unit}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{res.interpretation}</p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>기록자: {res.createdBy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 11: MAINTENANCE */}
          {activeNav === 'maintenance' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">실험 장비 정기 점검 및 캘리브레이션 이력</h1>
                  <p className="nl-page-desc">전문 엔지니어의 정기 점검 및 광학 영점 보정 기록입니다.</p>
                </div>
              </div>
              <div className="nl-table-wrap">
                <table className="nl-table">
                  <thead>
                    <tr>
                      <th>장비명</th>
                      <th>점검 유형</th>
                      <th>점검 일자</th>
                      <th>담당 엔지니어</th>
                      <th>점검 결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceLogs.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.equipmentName}</strong></td>
                        <td><span className="nl-lab-status-pill">{m.type}</span></td>
                        <td>{m.date}</td>
                        <td>{m.engineer}</td>
                        <td>{m.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 12: REPORTS */}
          {activeNav === 'reports' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">연구실 종합 운영 및 생산성 리포트</h1>
                  <p className="nl-page-desc">월별 실험 성공률, 장비 가동률, 프로젝트 진행률 종합 분석입니다.</p>
                </div>
              </div>
              {labReport && (
                <div className="nl-grid-3">
                  <div className="nl-card">
                    <div className="nl-stat-label">활성 프로젝트</div>
                    <div className="nl-stat-val">{labReport.activeProjectsCount}건</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>모든 과제 정상 수행중</p>
                  </div>
                  <div className="nl-card">
                    <div className="nl-stat-label">9월 누적 실험 수</div>
                    <div className="nl-stat-val">{labReport.monthlyExperimentsTotal}회</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>성공률 97.1%</p>
                  </div>
                  <div className="nl-card">
                    <div className="nl-stat-label">장비 평균 가동률</div>
                    <div className="nl-stat-val" style={{ color: 'var(--teal-700)' }}>{labReport.equipmentUtilizationRate}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>최적 가동 구간 유지</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 13: ANNOUNCEMENTS */}
          {activeNav === 'announcements' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">연구실 공지사항 ({announcements.length}건)</h1>
                  <p className="nl-page-desc">안전 교육, 장비 모듈 교체 및 연구소 정기 일정 공지입니다.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {announcements.map(ann => (
                  <div key={ann.id} className="nl-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="nl-lab-status-pill">{ann.author}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--teal-800)', marginBottom: '8px' }}>{ann.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--graphite-800)', lineHeight: '1.6' }}>{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 14: MESSAGES */}
          {activeNav === 'messages' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">연구원 간 인트라넷 메시지</h1>
                  <p className="nl-page-desc">실험 결과 공유 및 장비 사용 인수인계 메시지입니다.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map(msg => (
                  <div key={msg.id} className="nl-card" style={{ marginBottom: 0, borderLeft: msg.read ? '1px solid var(--border-subtle)' : '5px solid var(--cyan-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--teal-800)' }}>발신: {msg.sender}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--graphite-800)' }}>{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 15: SETTINGS (Bug 3 - SEC-343) */}
          {activeNav === 'settings' && (
            <div>
              <div className="nl-page-header">
                <div>
                  <h1 className="nl-page-title">연구원 프로필 & 연구실 배송지 관리</h1>
                  <p className="nl-page-desc">책임연구원 정보 및 시약 배송을 위한 연구실 주소지를 관리합니다.</p>
                </div>
              </div>
              <div className="nl-card" style={{ maxWidth: '640px' }}>
                <div className="nl-form-group">
                  <label className="nl-label">연구원 성명</label>
                  <input type="text" className="nl-input" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                </div>
                <div className="nl-form-group">
                  <label className="nl-label">이메일 계정</label>
                  <input type="email" className="nl-input" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                </div>
                <div className="nl-form-group">
                  <label className="nl-label">연구실 / 부서</label>
                  <input type="text" className="nl-input" value={user.department} onChange={(e) => setUser({ ...user, department: e.target.value })} />
                </div>
                <div className="nl-form-group">
                  <label className="nl-label">직급 및 역할</label>
                  <input type="text" className="nl-input" value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })} />
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--teal-800)', marginBottom: '12px' }}>
                    📍 등록된 연구실 배송지 주소 ({addresses.length}건)
                  </h4>
                  {addresses.map((a, i) => (
                    <div key={i} style={{ background: 'var(--bg-sand)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '10px', fontSize: '0.85rem' }}>
                      <div><strong>{a.street}</strong></div>
                      <div style={{ color: 'var(--text-sub)' }}>{a.detail} ({a.postalCode})</div>
                    </div>
                  ))}
                  <button className="nl-btn nl-btn-secondary" style={{ width: '100%', marginTop: '6px' }} onClick={() => setIsAddressModalOpen(true)}>
                    + 새 연구소 배송지 주소 추가
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================
          MODALS WITH 10 NATURAL FLOW BUTTONS & TOASTS
          ========================================================= */}

      {/* MODAL 1: LOGIN (Bug 1 - SEC-341) */}
      {isLoginModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsLoginModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">🔐 연구원 인증 로그인</h3>
              <button className="nl-modal-close" onClick={() => setIsLoginModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">연구원 이메일</label>
                <input type="email" className="nl-input" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">비밀번호</label>
                <input type="password" className="nl-input" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsLoginModalOpen(false)}>닫기</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(1)}>
                연구원 고속 인증 로그인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER (Bug 2 - SEC-342) */}
      {isRegisterModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsRegisterModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">👥 신규 연구원 계정 등록</h3>
              <button className="nl-modal-close" onClick={() => setIsRegisterModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">성명</label>
                <input type="text" className="nl-input" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">이메일</label>
                <input type="email" className="nl-input" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">소속 부서</label>
                <input type="text" className="nl-input" value={registerForm.department} onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">직급</label>
                <input type="text" className="nl-input" value={registerForm.role} onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsRegisterModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(2)}>
                신규 연구원 즉시 계정 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADDRESS (Bug 3 - SEC-343) */}
      {isAddressModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsAddressModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">📍 연구소 배송지 주소 등록</h3>
              <button className="nl-modal-close" onClick={() => setIsAddressModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">기본 주소</label>
                <input type="text" className="nl-input" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">상세 주소 (연구동/호수)</label>
                <input type="text" className="nl-input" value={addressForm.detail} onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">우편번호</label>
                <input type="text" className="nl-input" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsAddressModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(3)}>
                연구소 배송지 주소 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PROJECT (Bug 4 - SEC-344) */}
      {isProjectModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsProjectModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">📁 신규 연구 프로젝트 개설</h3>
              <button className="nl-modal-close" onClick={() => setIsProjectModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">연구 프로젝트명</label>
                <input type="text" className="nl-input" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">과제 개요 및 목표</label>
                <textarea className="nl-textarea" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">책임연구원</label>
                <input type="text" className="nl-input" value={projectForm.principalInvestigator} onChange={(e) => setProjectForm({ ...projectForm, principalInvestigator: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsProjectModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(4)}>
                핵심 연구 프로젝트 즉시 개설
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EXPERIMENT (Bug 5 - SEC-345) */}
      {isExperimentModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsExperimentModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">📋 표준 실험 일정 등록</h3>
              <button className="nl-modal-close" onClick={() => setIsExperimentModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">실험명</label>
                <input type="text" className="nl-input" value={experimentForm.name} onChange={(e) => setExperimentForm({ ...experimentForm, name: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">예정 일시</label>
                <input type="text" className="nl-input" value={experimentForm.scheduledAt} onChange={(e) => setExperimentForm({ ...experimentForm, scheduledAt: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">실험 프로토콜 요약</label>
                <textarea className="nl-textarea" value={experimentForm.protocol} onChange={(e) => setExperimentForm({ ...experimentForm, protocol: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsExperimentModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(5)}>
                표준 실험 일정 쾌속 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: RESERVATION (Bug 6 - SEC-346) */}
      {isReservationModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsReservationModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">🔬 첨단 분석 장비 예약</h3>
              <button className="nl-modal-close" onClick={() => setIsReservationModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">대상 장비</label>
                <select className="nl-select" value={reservationForm.equipmentId} onChange={(e) => setReservationForm({ ...reservationForm, equipmentId: e.target.value })}>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.location})</option>
                  ))}
                </select>
              </div>
              <div className="nl-form-group">
                <label className="nl-label">예약 일자</label>
                <input type="date" className="nl-input" value={reservationForm.date} onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">실험 목적</label>
                <input type="text" className="nl-input" value={reservationForm.purpose} onChange={(e) => setReservationForm({ ...reservationForm, purpose: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsReservationModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(6)}>
                첨단 분석 장비 즉시 예약
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: REAGENT RECEIPT (Bug 7 - SEC-347) */}
      {isReagentReceiptModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsReagentReceiptModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">📦 시약 및 소모품 입고 처리</h3>
              <button className="nl-modal-close" onClick={() => setIsReagentReceiptModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">시약 품목</label>
                <select className="nl-select" value={reagentForm.reagentId} onChange={(e) => setReagentForm({ ...reagentForm, reagentId: e.target.value })}>
                  {reagents.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (현재 재고: {r.quantity}{r.unit})</option>
                  ))}
                </select>
              </div>
              <div className="nl-form-group">
                <label className="nl-label">입고 수량</label>
                <input type="number" min="1" max="100" className="nl-input" value={reagentForm.quantity} onChange={(e) => setReagentForm({ ...reagentForm, quantity: Number(e.target.value) })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsReagentReceiptModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(7)}>
                필수 시약 앰플 긴급 입고
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: SAMPLE (Bug 8 - SEC-348) */}
      {isSampleModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsSampleModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">🧬 중요 바이오 샘플 등록</h3>
              <button className="nl-modal-close" onClick={() => setIsSampleModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">샘플 식별명</label>
                <input type="text" className="nl-input" value={sampleForm.name} onChange={(e) => setSampleForm({ ...sampleForm, name: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">보관 위치</label>
                <input type="text" className="nl-input" value={sampleForm.storageLocation} onChange={(e) => setSampleForm({ ...sampleForm, storageLocation: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">생체 특성 메모</label>
                <input type="text" className="nl-input" value={sampleForm.notes} onChange={(e) => setSampleForm({ ...sampleForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsSampleModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(8)}>
                중요 바이오 샘플 즉시 등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: LAB NOTE (Bug 9 - SEC-349) */}
      {isNoteModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsNoteModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">✍️ 실험 관찰 연구노트 기록</h3>
              <button className="nl-modal-close" onClick={() => setIsNoteModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">노트 제목</label>
                <input type="text" className="nl-input" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
              </div>
              <div className="nl-form-group">
                <label className="nl-label">관찰 내용 및 분석 데이터</label>
                <textarea className="nl-textarea" value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsNoteModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(9)}>
                실험 관찰 연구노트 즉시 기록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: RESULT (Bug 10 - SEC-350) */}
      {isResultModalOpen && (
        <div className="nl-modal-backdrop" onClick={() => setIsResultModalOpen(false)}>
          <div className="nl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="nl-modal-header">
              <h3 className="nl-modal-title">📊 실험 측정 결과 확정</h3>
              <button className="nl-modal-close" onClick={() => setIsResultModalOpen(false)}>✕</button>
            </div>
            <div className="nl-modal-body">
              <div className="nl-form-group">
                <label className="nl-label">측정 지표명</label>
                <input type="text" className="nl-input" value={resultForm.title} onChange={(e) => setResultForm({ ...resultForm, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div className="nl-form-group">
                  <label className="nl-label">측정 수치값</label>
                  <input type="number" step="0.1" className="nl-input" value={resultForm.value} onChange={(e) => setResultForm({ ...resultForm, value: Number(e.target.value) })} />
                </div>
                <div className="nl-form-group">
                  <label className="nl-label">단위</label>
                  <input type="text" className="nl-input" value={resultForm.unit} onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })} />
                </div>
              </div>
              <div className="nl-form-group">
                <label className="nl-label">통계적 해석</label>
                <input type="text" className="nl-input" value={resultForm.interpretation} onChange={(e) => setResultForm({ ...resultForm, interpretation: e.target.value })} />
              </div>
            </div>
            <div className="nl-modal-footer">
              <button className="nl-btn nl-btn-secondary" onClick={() => setIsResultModalOpen(false)}>취소</button>
              <button className="nl-btn nl-btn-primary" onClick={() => simulateIdempotencyAttack(10)}>
                실험 측정 결과 즉시 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWERS: NOTIFICATIONS & MESSAGES */}
      {isNotifDrawerOpen && (
        <div className="nl-drawer-backdrop" onClick={() => setIsNotifDrawerOpen(false)}>
          <div className="nl-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="nl-drawer-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--teal-800)' }}>🔔 연구실 알림</h3>
              <button className="nl-modal-close" onClick={() => setIsNotifDrawerOpen(false)}>✕</button>
            </div>
            <div className="nl-drawer-body">
              {notifications.map(n => (
                <div key={n.id} style={{ background: 'var(--bg-sand)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '800', color: 'var(--teal-800)', fontSize: '0.92rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)', marginTop: '2px' }}>{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isMessageDrawerOpen && (
        <div className="nl-drawer-backdrop" onClick={() => setIsMessageDrawerOpen(false)}>
          <div className="nl-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="nl-drawer-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--teal-800)' }}>💬 연구원 메시지</h3>
              <button className="nl-modal-close" onClick={() => setIsMessageDrawerOpen(false)}>✕</button>
            </div>
            <div className="nl-drawer-body">
              {messages.map(m => (
                <div key={m.id} style={{ background: 'var(--bg-sand)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: 'var(--teal-800)', fontSize: '0.9rem' }}>
                    <span>{m.sender}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--graphite-800)', marginTop: '4px' }}>{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST POPUP */}
      {toast && (
        <div className="nl-toast">
          <div className="nl-toast-title">{toast.title}</div>
          {toast.desc && <div className="nl-toast-desc">{toast.desc}</div>}
        </div>
      )}
    </div>
  );
}
