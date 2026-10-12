const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'eventwave.db');
const db = new sqlite3.Database(DB_PATH);

// 16명 사용자
const INITIAL_USERS = [
  { id: 1, name: '강민서', email: 'minseo.kang@eventwave.io', phone: '010-1111-2222', company: '하이퍼AI 랩스', avatar: '👩‍💻' },
  { id: 2, name: '이도윤', email: 'doyoon.lee@eventwave.io', phone: '010-2222-3333', company: '넥스트프론트 테크', avatar: '👨‍💻' },
  { id: 3, name: '박지아', email: 'jia.park@eventwave.io', phone: '010-3333-4444', company: '모비디자인 스튜디오', avatar: '👩‍🎨' },
  { id: 4, name: '정시우', email: 'siwoo.jung@eventwave.io', phone: '010-4444-5555', company: '클라우드웨이브 솔루션즈', avatar: '🧑‍💻' },
  { id: 5, name: '최서윤', email: 'seoyun.choi@eventwave.io', phone: '010-5555-6666', company: '에코벤처스 파트너스', avatar: '👩‍💼' },
  { id: 6, name: '조하준', email: 'hajun.cho@eventwave.io', phone: '010-6666-7777', company: '데이터매트릭스 리서치', avatar: '👨‍💼' },
  { id: 7, name: '윤아린', email: 'arin.yoon@eventwave.io', phone: '010-7777-8888', company: '스케일업 인큐베이터', avatar: '👱‍♀️' },
  { id: 8, name: '장은우', email: 'eunwoo.jang@eventwave.io', phone: '010-8888-9999', company: '핀테크코어 테크놀로지', avatar: '🧑‍💼' },
  { id: 9, name: '한소율', email: 'soyul.han@eventwave.io', phone: '010-8821-4192', company: '인터랙션UX 리서치랩', avatar: '👩‍🔬' },
  { id: 10, name: '오준혁', email: 'junhyuk.oh@eventwave.io', phone: '010-1010-2020', company: '메타미디어 그룹', avatar: '👨‍🎤' },
  { id: 11, name: '송채원', email: 'chaewon.song@eventwave.io', phone: '010-1112-2223', company: '글로벌에듀 재단', avatar: '👩‍🏫' },
  { id: 12, name: '배도현', email: 'dohyun.bae@eventwave.io', phone: '010-1213-2324', company: '소프트스퀘어 엔지니어링', avatar: '🧑‍🔧' },
  { id: 13, name: '신유진', email: 'yujin.shin@eventwave.io', phone: '010-1314-2425', company: '크리에이티브넥서스', avatar: '🎨' },
  { id: 14, name: '고서진', email: 'seojin.ko@eventwave.io', phone: '010-4411-5522', company: '알고리즘스페이스', avatar: '💻' },
  { id: 15, name: '문예준', email: 'yejun.moon@eventwave.io', phone: '010-1516-2627', company: '디지털포레스트', avatar: '🌲' },
  { id: 16, name: '권나은', email: 'naeun.kwon@eventwave.io', phone: '010-1617-2728', company: '사이버시큐리티 얼라이언스', avatar: '🛡️' }
];

// 6개 카테고리
const INITIAL_CATEGORIES = [
  { code: 'TECH', name: '테크 & 인공지능', icon: '💻', description: '생성형 AI, 클라우드 아키텍처 및 차세대 소프트웨어 엔지니어링' },
  { code: 'DESIGN', name: '디자인 & UX/UI', icon: '🎨', description: '프로덕트 디자인, 인터랙션 시스템 및 창의적 비주얼 크리에이티브' },
  { code: 'BUSINESS', name: '비즈니스 & 스타트업', icon: '🚀', description: '투자 유치, 글로벌 스케일업 전략 및 혁신 비즈니스 모델' },
  { code: 'ACADEMIC', name: '학술 & 컨퍼런스', icon: '🏛️', description: '최신 연구 논문 발표, 글로벌 산학 협력 및 기술 심포지엄' },
  { code: 'CULTURE', name: '문화 & 미디어 콘텐츠', icon: '🎭', description: '디지털 엔터테인먼트, 크리에이터 이코노미 및 미디어 아트' },
  { code: 'WORKSHOP', name: '핸즈온 워크샵 & 네트워킹', icon: '🛠️', description: '실습 중심 코드랩, 1:1 멘토링 세션 및 전문가 네트워킹' }
];

// 26개 행사 데이터
const INITIAL_EVENTS = [
  {
    id: 1,
    code: 'EVT-2026-001',
    category: 'TECH',
    title: 'AI 프론티어 컨퍼런스 2026',
    description: '초거대 언어모델(LLM)과 멀티모달 AI의 실제 산업 도입 사례 및 아키텍처 심층 분석',
    event_date: '2026-10-18',
    start_time: '09:30',
    end_time: '18:00',
    venue: '서울 코엑스 그랜드볼룸',
    speaker: '김진우 박사 (오픈AI 리서치)',
    capacity: 250,
    standard_price: 120000,
    vip_price: 250000,
    image_tag: 'ai-frontier',
    featured: 1
  },
  {
    id: 2,
    code: 'EVT-2026-002',
    category: 'TECH',
    title: '차세대 웹 프론트엔드 아키텍처 포럼',
    description: 'React 19, 서버 컴포넌트, WebAssembly 기반 렌더링 최적화 기술 동향 공유',
    event_date: '2026-10-19',
    start_time: '13:00',
    end_time: '17:30',
    venue: '세종대학교 광개토관 컨벤션홀',
    speaker: '윤선호 테크리드 (Vercel 파트너)',
    capacity: 180,
    standard_price: 80000,
    vip_price: 150000,
    image_tag: 'frontend-forum',
    featured: 0
  },
  {
    id: 3,
    code: 'EVT-2026-003',
    category: 'TECH',
    title: '글로벌 AI 서밋 2026',
    description: '전 세계 AI 리더들이 모여 미래 인공지능 거버넌스와 엔지니어링 패러다임을 논의하는 연례 서밋',
    event_date: '2026-10-20',
    start_time: '10:00',
    end_time: '18:30',
    venue: '그랜드 인터컨티넨탈 서울 파르나스',
    speaker: '에릭 슈미츠 대표 외 8인',
    capacity: 300,
    standard_price: 150000,
    vip_price: 320000,
    image_tag: 'global-ai-summit',
    featured: 1 // BUG-D10-03 대상 (VIP 선택 시 STANDARD로 왜곡)
  },
  {
    id: 4,
    code: 'EVT-2026-004',
    category: 'DESIGN',
    title: '디지털 프로덕트 UX/UI 디자인 위크',
    description: '사용자 중심 데이터 주도 UX 리서치와 디자인 시스템의 확장성',
    event_date: '2026-10-21',
    start_time: '11:00',
    end_time: '17:00',
    venue: '동대문 디자인플라자 (DDP) 살림터',
    speaker: '정하나 수석 디자이너 (피그마 앰버서더)',
    capacity: 150,
    standard_price: 90000,
    vip_price: 180000,
    image_tag: 'ux-design-week',
    featured: 1
  },
  {
    id: 5,
    code: 'EVT-2026-005',
    category: 'DESIGN',
    title: '엔터프라이즈 디자인 시스템 마스터클래스',
    description: '토큰 구조, 컴포넌트 라이브러리 거버넌스 및 피그마-코드 싱크 자동화',
    event_date: '2026-10-22',
    start_time: '14:00',
    end_time: '18:00',
    venue: '판교 테크원타워 대회의실',
    speaker: '백승훈 디자인 아키텍트',
    capacity: 120,
    standard_price: 70000,
    vip_price: 130000,
    image_tag: 'design-system',
    featured: 0
  },
  {
    id: 6,
    code: 'EVT-2026-006',
    category: 'BUSINESS',
    title: '딥테크 스타트업 글로벌 IR 데모데이',
    description: '국내외 Top 티어 VC와 엔젤투자자 앞 20개 유망 스타트업 피칭 및 네트워킹',
    event_date: '2026-10-23',
    start_time: '13:30',
    end_time: '18:30',
    venue: '서울창업허브 공덕 대강당',
    speaker: '글로벌 VC 심사역 12인',
    capacity: 200,
    standard_price: 50000,
    vip_price: 120000,
    image_tag: 'startup-demoday',
    featured: 0
  },
  {
    id: 7,
    code: 'EVT-2026-007',
    category: 'TECH',
    title: '클라우드 네이티브 아키텍처 데이',
    description: '쿠버네티스 1.30, 서비스 메쉬, 카오스 엔지니어링 기반 고가용성 인프라 구축',
    event_date: '2026-10-24',
    start_time: '10:00',
    end_time: '17:00',
    venue: '삼성동 아셈타워 컨퍼런스룸',
    speaker: '최영환 인프라 팀장 (AWS 히어로)',
    capacity: 160,
    standard_price: 100000,
    vip_price: 200000,
    image_tag: 'cloud-native',
    featured: 0 // BUG-D10-04 대상 (카테고리 TECH + 인원 3명 신청 시 1명으로 누락)
  },
  {
    id: 8,
    code: 'EVT-2026-008',
    category: 'BUSINESS',
    title: '핀테크 & 오픈뱅킹 혁신 서밋',
    description: '임베디드 금융, 실시간 결제망 연동 및 규제 샌드박스 실증 성공 사례',
    event_date: '2026-10-25',
    start_time: '10:00',
    end_time: '16:30',
    venue: '여의도 콘래드 서울 그랜드볼룸',
    speaker: '박상현 금융공학 이사',
    capacity: 220,
    standard_price: 110000,
    vip_price: 230000,
    image_tag: 'fintech-summit',
    featured: 1
  },
  {
    id: 9,
    code: 'EVT-2026-009',
    category: 'ACADEMIC',
    title: 'HCI & 인지공학 글로벌 학술 심포지엄',
    description: '인간-컴퓨터 상호작용의 신경인지적 모델링과 브레인-컴퓨터 인터페이스(BCI)',
    event_date: '2026-10-26',
    start_time: '09:00',
    end_time: '17:30',
    venue: 'KAIST 서울 도곡캠퍼스 강당',
    speaker: '송민호 교수 (KAIST)',
    capacity: 140,
    standard_price: 60000,
    vip_price: 110000,
    image_tag: 'hci-symposium',
    featured: 0
  },
  {
    id: 10,
    code: 'EVT-2026-010',
    category: 'CULTURE',
    title: '생성형 AI 콘텐츠 크리에이터 페스타',
    description: 'AI 생성 영상, 웹툰, 음악 작곡의 실무 워크플로우와 저작권 가이드라인',
    event_date: '2026-10-27',
    start_time: '13:00',
    end_time: '19:00',
    venue: '상암 누리꿈스퀘어 국제회의실',
    speaker: '인기 크리에이터 8인',
    capacity: 250,
    standard_price: 45000,
    vip_price: 90000,
    image_tag: 'creator-festa',
    featured: 0
  },
  {
    id: 11,
    code: 'EVT-2026-011',
    category: 'WORKSHOP',
    title: '핸즈온 마이크로서비스 리팩토링 랩',
    description: '모놀리식 분해, 이벤트 기반 사가(Saga) 패턴 실제 라이브 코딩 실습',
    event_date: '2026-10-28',
    start_time: '10:00',
    end_time: '18:00',
    venue: '강남 스파크플러스 세미나룸',
    speaker: '이건우 시니어 백엔드 아키텍트',
    capacity: 60,
    standard_price: 130000,
    vip_price: 210000,
    image_tag: 'msa-workshop',
    featured: 0 // BUG-D10-01 대상 행사 (Reg 14 취소 누락)
  },
  {
    id: 12,
    code: 'EVT-2026-012',
    category: 'TECH',
    title: '사이버 보안 & 제로 트러스트 서밋',
    description: '클라우드 보안 태세 관리(CSPM), 공급망 공격 방어 및 ISO27001 실무',
    event_date: '2026-10-29',
    start_time: '10:00',
    end_time: '17:00',
    venue: '양재 aT센터 제1전시장 회의실',
    speaker: '문성철 CISO (글로벌 보안연구원)',
    capacity: 180,
    standard_price: 95000,
    vip_price: 190000,
    image_tag: 'security-summit',
    featured: 0
  },
  {
    id: 13,
    code: 'EVT-2026-013',
    category: 'DESIGN',
    title: '디자인 리더십 & 팀 스케일링 컨퍼런스',
    description: '초기 스타트업부터 유니콘까지 디자인 조직 빌딩과 임팩트 측정 지표',
    event_date: '2026-10-30',
    start_time: '14:00',
    end_time: '18:00',
    venue: '성수 헤이그라운드 브릭스홀',
    speaker: '조수아 CPO',
    capacity: 100,
    standard_price: 65000,
    vip_price: 120000,
    image_tag: 'design-leadership',
    featured: 0
  },
  {
    id: 14,
    code: 'EVT-2026-014',
    category: 'BUSINESS',
    title: 'B2B SaaS 성장 공식 & 제품 주도 성장(PLG)',
    description: '무료 평가판 전환율 최적화, Net Revenue Retention(NRR) 130% 달성 비결',
    event_date: '2026-10-31',
    start_time: '11:00',
    end_time: '16:00',
    venue: '역삼 마루180 이벤트홀',
    speaker: '김태윤 SaaS 액셀러레이터',
    capacity: 120,
    standard_price: 75000,
    vip_price: 140000,
    image_tag: 'b2b-saas',
    featured: 0
  },
  {
    id: 15,
    code: 'EVT-2026-015',
    category: 'ACADEMIC',
    title: '분산 시스템 & 양자 컴퓨팅 심포지엄',
    description: '양자 암호 키 분배(QKD)와 분산 합의 알고리즘의 융합 학술 논문 발표',
    event_date: '2026-11-01',
    start_time: '09:30',
    end_time: '17:00',
    venue: '서울대학교 호암교수회관 컨벤션센터',
    speaker: '한상우 교수 (서울대 컴퓨터공학부)',
    capacity: 150,
    standard_price: 55000,
    vip_price: 100000,
    image_tag: 'quantum-symposium',
    featured: 0
  },
  {
    id: 16,
    code: 'EVT-2026-016',
    category: 'CULTURE',
    title: '디지털 인터랙티브 미디어 아트 살롱',
    description: '언리얼 엔진 5 기반 가상 무대 연출 및 생성형 제너러티브 아트 쇼케이스',
    event_date: '2026-11-02',
    start_time: '15:00',
    end_time: '20:30',
    venue: '플랫폼엘 컨템포러리 아트센터',
    speaker: '강미르 미디어 아티스트',
    capacity: 90,
    standard_price: 40000,
    vip_price: 85000,
    image_tag: 'media-art',
    featured: 0
  },
  {
    id: 17,
    code: 'EVT-2026-017',
    category: 'WORKSHOP',
    title: '도커 & 쿠버네티스 실전 운영 1Day 부트캠프',
    description: '컨테이너 빌드 최적화, 헬름 차트 패키징 및 프로메테우스 모니터링 구축',
    event_date: '2026-11-03',
    start_time: '09:30',
    end_time: '18:30',
    venue: '강남 비트캠프 러닝센터',
    speaker: '서정민 데브옵스 스페셜리스트',
    capacity: 50,
    standard_price: 140000,
    vip_price: 220000,
    image_tag: 'k8s-bootcamp',
    featured: 0
  },
  {
    id: 18,
    code: 'EVT-2026-018',
    category: 'TECH',
    title: '데이터 엔지니어링 & MLOps 파이프라인 서밋',
    description: 'Apache Kafka 실시간 스트리밍, 피처 스토어, 모델 배포 자동화 파이프라인',
    event_date: '2026-11-04',
    start_time: '10:00',
    end_time: '17:30',
    venue: '판교 스타트업캠퍼스 다목적홀',
    speaker: '남궁훈 데이터 플랫폼 헤드',
    capacity: 170,
    standard_price: 90000,
    vip_price: 180000,
    image_tag: 'mlops-summit',
    featured: 0
  },
  {
    id: 19,
    code: 'EVT-2026-019',
    category: 'DESIGN',
    title: '모바일 앱 마이크로 인터랙션 & 모션 디자인',
    description: '리브랜딩 애니메이션, 제스처 피드백 및 프로토파이(ProtoPie) 고급 활용',
    event_date: '2026-11-05',
    start_time: '13:00',
    end_time: '17:30',
    venue: '강남 드림플러스 이벤트홀',
    speaker: '임채원 모션 그래픽 리드',
    capacity: 110,
    standard_price: 60000,
    vip_price: 115000,
    image_tag: 'motion-design',
    featured: 0
  },
  {
    id: 20,
    code: 'EVT-2026-020',
    category: 'BUSINESS',
    title: '글로벌 엔터프라이즈 세일즈 & 파트너십 전략',
    description: '해외 시장 진출 파이프라인 구축 및 글로벌 테크 기업과의 제휴 협상 전략',
    event_date: '2026-11-06',
    start_time: '14:00',
    end_time: '18:00',
    venue: '포스코타워 역삼 이벤트홀',
    speaker: '스티븐 장 글로벌 총괄',
    capacity: 130,
    standard_price: 85000,
    vip_price: 160000,
    image_tag: 'global-sales',
    featured: 0
  },
  {
    id: 21,
    code: 'EVT-2026-021',
    category: 'ACADEMIC',
    title: '블록체인 거버넌스 & 디지털 자산 정책 포럼',
    description: '토큰증권(STO), 스마트 컨트랙트 보안 감사 및 금융위원회 규제 프레임워크',
    event_date: '2026-11-07',
    start_time: '10:00',
    end_time: '16:00',
    venue: '연세대학교 백양누리 그랜드볼룸',
    speaker: '정우성 자본시장연구원 연구위원',
    capacity: 160,
    standard_price: 50000,
    vip_price: 95000,
    image_tag: 'blockchain-forum',
    featured: 0
  },
  {
    id: 22,
    code: 'EVT-2026-022',
    category: 'CULTURE',
    title: '인디 게임 개발자 페스티벌 & 피치 나이트',
    description: '인디 게임 플레이테스트, 스팀 출시 마케팅 전략 및 퍼블리셔 미팅',
    event_date: '2026-11-08',
    start_time: '12:00',
    end_time: '19:00',
    venue: '강남 잼투고 복합문화공간',
    speaker: '인디게임 개발사 대표 10인',
    capacity: 180,
    standard_price: 35000,
    vip_price: 70000,
    image_tag: 'indie-game',
    featured: 0
  },
  {
    id: 23,
    code: 'EVT-2026-023',
    category: 'WORKSHOP',
    title: 'LLM 프롬프트 엔지니어링 & RAG 실전 빌드',
    description: 'LangChain, LlamaIndex, 벡터 DB를 결합한 사내 지식검색 챗봇 구축 실습',
    event_date: '2026-11-09',
    start_time: '10:00',
    end_time: '18:00',
    venue: '역삼 아크플레이스 패스트파이브',
    speaker: '유재민 AI 엔지니어',
    capacity: 45,
    standard_price: 160000,
    vip_price: 260000,
    image_tag: 'rag-workshop',
    featured: 1
  },
  {
    id: 24,
    code: 'EVT-2026-024',
    category: 'TECH',
    title: '임베디드 & 로보틱스 OS 개발자 밋업',
    description: 'ROS2, 실시간 RTOS 커널 튜닝 및 자율주행 모빌리티 센서 퓨전 기술',
    event_date: '2026-11-10',
    start_time: '14:00',
    end_time: '18:00',
    venue: '양재 R&CD 혁신허브 컨퍼런스홀',
    speaker: '박진성 로보틱스 수석',
    capacity: 120,
    standard_price: 70000,
    vip_price: 130000,
    image_tag: 'robotics-meetup',
    featured: 0
  },
  {
    id: 25,
    code: 'EVT-2026-025',
    category: 'DESIGN',
    title: '브랜드 아이덴티티 & 타이포그래피 콜로키움',
    description: '디지털 환경에서의 한글 폰트 디자인, 가변 폰트(Variable Font) 기술 적용',
    event_date: '2026-11-11',
    start_time: '13:30',
    end_time: '17:30',
    venue: '홍대 KT&G 상상마당 라이브홀',
    speaker: '안도현 타이포그래퍼',
    capacity: 100,
    standard_price: 45000,
    vip_price: 85000,
    image_tag: 'typography-salon',
    featured: 0
  },
  {
    id: 26,
    code: 'EVT-2026-026',
    category: 'BUSINESS',
    title: '글로벌 테크 마케팅 & 성장 실험 프레임워크',
    description: 'A/B 테스트 파이프라인, 코호트 유지율 분석 및 LTV 예측 머신러닝 모델',
    event_date: '2026-11-12',
    start_time: '14:00',
    end_time: '18:00',
    venue: '선릉 디캠프 다목적홀',
    speaker: '최유림 그로스 디렉터',
    capacity: 140,
    standard_price: 80000,
    vip_price: 150000,
    image_tag: 'growth-marketing',
    featured: 0
  }
];

// 초기 42건 신청 내역
function generateInitialRegistrations() {
  const tiers = ['STANDARD', 'VIP', 'EARLY_BIRD', 'WORKSHOP'];
  const regs = [];

  // 특정 버그 연동 대상 정의
  // Reg ID 1
  regs.push({ id: 1, reg_code: 'EVT-REG-001', event_id: 1, user_id: 1, attendee_name: '강민서', attendee_email: 'minseo.kang@eventwave.io', attendee_phone: '010-1111-2222', attendee_org: '하이퍼AI 랩스', ticket_tier: 'VIP', attendee_count: 1, total_amount: 250000, status: 'CONFIRMED' });
  // Reg ID 2 (BUG-D10-02 피해 변조 대상)
  regs.push({ id: 2, reg_code: 'EVT-REG-002', event_id: 1, user_id: 2, attendee_name: '이도윤', attendee_email: 'doyoon.lee@eventwave.io', attendee_phone: '010-2222-3333', attendee_org: '넥스트프론트 테크', ticket_tier: 'STANDARD', attendee_count: 2, total_amount: 240000, status: 'CONFIRMED' });
  // Reg ID 3
  regs.push({ id: 3, reg_code: 'EVT-REG-003', event_id: 2, user_id: 3, attendee_name: '박지아', attendee_email: 'jia.park@eventwave.io', attendee_phone: '010-3333-4444', attendee_org: '모비디자인 스튜디오', ticket_tier: 'STANDARD', attendee_count: 1, total_amount: 80000, status: 'CHECKED_IN' });
  // Reg ID 4
  regs.push({ id: 4, reg_code: 'EVT-REG-004', event_id: 3, user_id: 4, attendee_name: '정시우', attendee_email: 'siwoo.jung@eventwave.io', attendee_phone: '010-4444-5555', attendee_org: '클라우드웨이브 솔루션즈', ticket_tier: 'VIP', attendee_count: 1, total_amount: 320000, status: 'CONFIRMED' });
  // Reg ID 5 (BUG-D10-02 트리거: 이름 수정 시 2번 이도윤이 변경됨!)
  regs.push({ id: 5, reg_code: 'EVT-REG-005', event_id: 4, user_id: 5, attendee_name: '최서윤', attendee_email: 'seoyun.choi@eventwave.io', attendee_phone: '010-5555-6666', attendee_org: '에코벤처스 파트너스', ticket_tier: 'VIP', attendee_count: 1, total_amount: 180000, status: 'CONFIRMED' });
  // Reg ID 6
  regs.push({ id: 6, reg_code: 'EVT-REG-006', event_id: 5, user_id: 6, attendee_name: '조하준', attendee_email: 'hajun.cho@eventwave.io', attendee_phone: '010-6666-7777', attendee_org: '데이터매트릭스 리서치', ticket_tier: 'STANDARD', attendee_count: 1, total_amount: 70000, status: 'CONFIRMED' });
  // Reg ID 7
  regs.push({ id: 7, reg_code: 'EVT-REG-007', event_id: 6, user_id: 7, attendee_name: '윤아린', attendee_email: 'arin.yoon@eventwave.io', attendee_phone: '010-7777-8888', attendee_org: '스케일업 인큐베이터', ticket_tier: 'STANDARD', attendee_count: 2, total_amount: 100000, status: 'CANCELLED' });
  // Reg ID 8
  regs.push({ id: 8, reg_code: 'EVT-REG-008', event_id: 7, user_id: 8, attendee_name: '장은우', attendee_email: 'eunwoo.jang@eventwave.io', attendee_phone: '010-8888-9999', attendee_org: '핀테크코어 테크놀로지', ticket_tier: 'VIP', attendee_count: 1, total_amount: 200000, status: 'CONFIRMED' });
  // Reg ID 9 (BUG-D10-05 대상: 연락처 수정 시 DB UPDATE 누락 및 재방문 시 원복)
  regs.push({ id: 9, reg_code: 'EVT-REG-009', event_id: 8, user_id: 9, attendee_name: '한소율', attendee_email: 'soyul.han@eventwave.io', attendee_phone: '010-8821-4192', attendee_org: '인터랙션UX 리서치랩', ticket_tier: 'STANDARD', attendee_count: 1, total_amount: 110000, status: 'CONFIRMED' });
  // Reg ID 10
  regs.push({ id: 10, reg_code: 'EVT-REG-010', event_id: 9, user_id: 10, attendee_name: '오준혁', attendee_email: 'junhyuk.oh@eventwave.io', attendee_phone: '010-1010-2020', attendee_org: '메타미디어 그룹', ticket_tier: 'STANDARD', attendee_count: 1, total_amount: 60000, status: 'CONFIRMED' });
  // Reg ID 11
  regs.push({ id: 11, reg_code: 'EVT-REG-011', event_id: 10, user_id: 11, attendee_name: '송채원', attendee_email: 'chaewon.song@eventwave.io', attendee_phone: '010-1112-2223', attendee_org: '글로벌에듀 재단', ticket_tier: 'STANDARD', attendee_count: 2, total_amount: 90000, status: 'CONFIRMED' });
  // Reg ID 12
  regs.push({ id: 12, reg_code: 'EVT-REG-012', event_id: 11, user_id: 12, attendee_name: '배도현', attendee_email: 'dohyun.bae@eventwave.io', attendee_phone: '010-1213-2324', attendee_org: '소프트스퀘어 엔지니어링', ticket_tier: 'WORKSHOP', attendee_count: 1, total_amount: 130000, status: 'CONFIRMED' });
  // Reg ID 13
  regs.push({ id: 13, reg_code: 'EVT-REG-013', event_id: 12, user_id: 13, attendee_name: '신유진', attendee_email: 'yujin.shin@eventwave.io', attendee_phone: '010-1314-2425', attendee_org: '크리에이티브넥서스', ticket_tier: 'STANDARD', attendee_count: 1, total_amount: 95000, status: 'CONFIRMED' });
  // Reg ID 14 (BUG-D10-01 대상: 취소 요청 시 성공 응답 주나 DB 취소 UPDATE 생략)
  regs.push({ id: 14, reg_code: 'EVT-REG-014', event_id: 11, user_id: 14, attendee_name: '고서진', attendee_email: 'seojin.ko@eventwave.io', attendee_phone: '010-4411-5522', attendee_org: '알고리즘스페이스', ticket_tier: 'STANDARD', attendee_count: 1, total_amount: 130000, status: 'CONFIRMED' });
  // Reg ID 15 ~ 42
  for (let i = 15; i <= 42; i++) {
    const userIndex = (i % INITIAL_USERS.length);
    const eventIndex = (i % INITIAL_EVENTS.length);
    const user = INITIAL_USERS[userIndex];
    const event = INITIAL_EVENTS[eventIndex];
    const tier = tiers[i % tiers.length];
    const count = (i % 3) + 1;
    const amount = (tier === 'VIP' ? event.vip_price : event.standard_price) * count;
    const stat = i % 7 === 0 ? 'CANCELLED' : i % 5 === 0 ? 'CHECKED_IN' : 'CONFIRMED';

    regs.push({
      id: i,
      reg_code: `EVT-REG-${String(i).padStart(3, '0')}`,
      event_id: event.id,
      user_id: user.id,
      attendee_name: user.name,
      attendee_email: user.email,
      attendee_phone: user.phone,
      attendee_org: user.company,
      ticket_tier: tier,
      attendee_count: count,
      total_amount: amount,
      status: stat
    });
  }

  return regs;
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. 테이블 생성
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company TEXT,
          avatar TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          code TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          description TEXT
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          event_date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          venue TEXT NOT NULL,
          speaker TEXT,
          capacity INTEGER NOT NULL,
          standard_price INTEGER NOT NULL,
          vip_price INTEGER NOT NULL,
          image_tag TEXT,
          featured INTEGER DEFAULT 0
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS registrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reg_code TEXT UNIQUE NOT NULL,
          event_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          attendee_name TEXT NOT NULL,
          attendee_email TEXT NOT NULL,
          attendee_phone TEXT NOT NULL,
          attendee_org TEXT,
          ticket_tier TEXT NOT NULL,
          attendee_count INTEGER DEFAULT 1,
          total_amount INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          details TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      // 2. 레코드 유무 확인 후 시드
      db.get('SELECT COUNT(*) as count FROM events', (err, row) => {
        if (err) return reject(err);
        if (row && row.count > 0) {
          return resolve();
        }

        resetAllData().then(resolve).catch(reject);
      });
    });
  });
}

function resetAllData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM registrations');
      db.run('DELETE FROM events');
      db.run('DELETE FROM categories');
      db.run('DELETE FROM users');
      db.run('DELETE FROM activity_logs');

      // Users 삽입
      const stmtUser = db.prepare('INSERT INTO users (id, name, email, phone, company, avatar) VALUES (?, ?, ?, ?, ?, ?)');
      INITIAL_USERS.forEach(u => {
        stmtUser.run([u.id, u.name, u.email, u.phone, u.company, u.avatar]);
      });
      stmtUser.finalize();

      // Categories 삽입
      const stmtCat = db.prepare('INSERT INTO categories (code, name, icon, description) VALUES (?, ?, ?, ?)');
      INITIAL_CATEGORIES.forEach(c => {
        stmtCat.run([c.code, c.name, c.icon, c.description]);
      });
      stmtCat.finalize();

      // Events 삽입
      const stmtEvent = db.prepare(`
        INSERT INTO events (id, code, category, title, description, event_date, start_time, end_time, venue, speaker, capacity, standard_price, vip_price, image_tag, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      INITIAL_EVENTS.forEach(e => {
        stmtEvent.run([e.id, e.code, e.category, e.title, e.description, e.event_date, e.start_time, e.end_time, e.venue, e.speaker, e.capacity, e.standard_price, e.vip_price, e.image_tag, e.featured]);
      });
      stmtEvent.finalize();

      // Registrations 삽입
      const regs = generateInitialRegistrations();
      const stmtReg = db.prepare(`
        INSERT INTO registrations (id, reg_code, event_id, user_id, attendee_name, attendee_email, attendee_phone, attendee_org, ticket_tier, attendee_count, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now", "localtime"))
      `);
      regs.forEach(r => {
        stmtReg.run([r.id, r.reg_code, r.event_id, r.user_id, r.attendee_name, r.attendee_email, r.attendee_phone, r.attendee_org, r.ticket_tier, r.attendee_count, r.total_amount, r.status]);
      });
      stmtReg.finalize();

      db.run('INSERT INTO activity_logs (action, details, created_at) VALUES (?, ?, datetime("now", "localtime"))',
        ['SYSTEM_INIT', 'EventWave 시스템 26개 행사, 42건 신청 초기 데이터 적재 완료']
      );

      resolve();
    });
  });
}

module.exports = {
  db,
  initDatabase,
  resetAllData,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_EVENTS
};
