const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'adminscope.db');
const db = new sqlite3.Database(DB_PATH);

// 초기 부서 데이터 (7개 부서)
const INITIAL_DEPARTMENTS = [
  { id: 1, name: '플랫폼개발팀', code: 'DEV-PLAT', manager: '김도현', location: '본관 4F' },
  { id: 2, name: '서비스개발팀', code: 'DEV-SRV', manager: '이서진', location: '본관 4F' },
  { id: 3, name: '기획운영팀', code: 'BIZ-OPS', manager: '박준호', location: '본관 3F' },
  { id: 4, name: '디자인팀', code: 'DSN-UX', manager: '정유진', location: '본관 3F' },
  { id: 5, name: '마케팅팀', code: 'MKT-GRW', manager: '최영진', location: '별관 2F' },
  { id: 6, name: '인사총무팀', code: 'HR-GA', manager: '강수현', location: '별관 1F' },
  { id: 7, name: '재무회계팀', code: 'FIN-ACC', manager: '조민석', location: '별관 2F' },
];

// 초기 사용자 데이터 (65명: 사번 EMP-1001 ~ EMP-1065)
const INITIAL_USERS = [
  { emp_no: 'EMP-1001', name: '김도현', email: 'dohyun.kim@adminscope.internal', department: '플랫폼개발팀', position: '팀장/수석', role: 'ADMIN', status: 'ACTIVE', phone: '010-1111-2001', created_at: '2024-01-10' },
  { emp_no: 'EMP-1002', name: '이서진', email: 'seojin.lee@adminscope.internal', department: '서비스개발팀', position: '팀장/수석', role: 'MANAGER', status: 'ACTIVE', phone: '010-1111-2002', created_at: '2024-01-15' },
  { emp_no: 'EMP-1003', name: '박준호', email: 'junho.park@adminscope.internal', department: '기획운영팀', position: '팀장/수석', role: 'MANAGER', status: 'ACTIVE', phone: '010-1111-2003', created_at: '2024-02-01' },
  { emp_no: 'EMP-1004', name: '정유진', email: 'yujin.jung@adminscope.internal', department: '디자인팀', position: '팀장/선임', role: 'MANAGER', status: 'ACTIVE', phone: '010-1111-2004', created_at: '2024-02-10' },
  { emp_no: 'EMP-1005', name: '최영진', email: 'youngjin.choi@adminscope.internal', department: '마케팅팀', position: '팀장/수석', role: 'MANAGER', status: 'ACTIVE', phone: '010-1111-2005', created_at: '2024-02-15' },
  { emp_no: 'EMP-1006', name: '강수현', email: 'suhyun.kang@adminscope.internal', department: '인사총무팀', position: '팀장/선임', role: 'MANAGER', status: 'ACTIVE', phone: '010-1111-2006', created_at: '2024-03-01' },
  { emp_no: 'EMP-1007', name: '조민석', email: 'minseok.cho@adminscope.internal', department: '재무회계팀', position: '팀장/수석', role: 'MANAGER', status: 'ACTIVE', phone: '010-1111-2007', created_at: '2024-03-05' },
  { emp_no: 'EMP-1008', name: '윤지아', email: 'jia.yoon@adminscope.internal', department: '플랫폼개발팀', position: '책임엔지니어', role: 'ADMIN', status: 'ACTIVE', phone: '010-2222-3001', created_at: '2024-03-12' },
  { emp_no: 'EMP-1009', name: '장우혁', email: 'woohyuk.jang@adminscope.internal', department: '서비스개발팀', position: '선임엔지니어', role: 'OPERATOR', status: 'ACTIVE', phone: '010-2222-3002', created_at: '2024-03-20' },
  { emp_no: 'EMP-1010', name: '임나영', email: 'nayoung.lim@adminscope.internal', department: '기획운영팀', position: '선임기획자', role: 'OPERATOR', status: 'ACTIVE', phone: '010-2222-3003', created_at: '2024-04-02' },
  { emp_no: 'EMP-1011', name: '한태양', email: 'taeyang.han@adminscope.internal', department: '디자인팀', position: 'UI디자이너', role: 'VIEWER', status: 'ACTIVE', phone: '010-2222-3004', created_at: '2024-04-10' },
  { emp_no: 'EMP-1012', name: '오세훈', email: 'sehun.oh@adminscope.internal', department: '마케팅팀', position: '그로스마케터', role: 'VIEWER', status: 'ACTIVE', phone: '010-2222-3005', created_at: '2024-04-18' },
  { emp_no: 'EMP-1013', name: '서예린', email: 'yerin.seo@adminscope.internal', department: '인사총무팀', position: '인사담당자', role: 'OPERATOR', status: 'ACTIVE', phone: '010-2222-3006', created_at: '2024-05-01' },
  { emp_no: 'EMP-1014', name: '신동엽', email: 'dongyeop.shin@adminscope.internal', department: '재무회계팀', position: '회계선임', role: 'OPERATOR', status: 'ACTIVE', phone: '010-2222-3007', created_at: '2024-05-10' },
  { emp_no: 'EMP-1015', name: '최영진_사원', email: 'yj.choi@adminscope.internal', department: '서비스개발팀', position: '주니어개발자', role: 'VIEWER', status: 'ACTIVE', phone: '010-3333-4001', created_at: '2024-05-15' },
  { emp_no: 'EMP-1016', name: '권보라', email: 'bora.kwon@adminscope.internal', department: '플랫폼개발팀', position: '클라우드인프라', role: 'OPERATOR', status: 'ACTIVE', phone: '010-3333-4002', created_at: '2024-05-20' },
  { emp_no: 'EMP-1017', name: '황준서', email: 'junseo.hwang@adminscope.internal', department: '기획운영팀', position: '서비스운영', role: 'VIEWER', status: 'ACTIVE', phone: '010-3333-4003', created_at: '2024-06-01' },
  { emp_no: 'EMP-1018', name: '강수현_엔지니어', email: 'sh.kang@adminscope.internal', department: '플랫폼개발팀', position: '데이터엔지니어', role: 'OPERATOR', status: 'ACTIVE', phone: '010-3333-4004', created_at: '2024-06-05' },
  { emp_no: 'EMP-1019', name: '안재민', email: 'jaemin.ahn@adminscope.internal', department: '디자인팀', position: 'BX디자이너', role: 'VIEWER', status: 'INACTIVE', phone: '010-3333-4005', created_at: '2024-06-12' },
  { emp_no: 'EMP-1020', name: '송하늘', email: 'haneul.song@adminscope.internal', department: '마케팅팀', position: '콘텐츠마케터', role: 'VIEWER', status: 'ACTIVE', phone: '010-3333-4006', created_at: '2024-06-18' },
  { emp_no: 'EMP-1021', name: '류호준', email: 'hojun.ryu@adminscope.internal', department: '재무회계팀', position: '자금담당', role: 'VIEWER', status: 'ACTIVE', phone: '010-4444-5001', created_at: '2024-07-01' },
  { emp_no: 'EMP-1022', name: '백선영', email: 'sunyoung.baek@adminscope.internal', department: '서비스개발팀', position: '프론트엔드개발', role: 'OPERATOR', status: 'ACTIVE', phone: '010-4444-5002', created_at: '2024-07-08' },
  { emp_no: 'EMP-1023', name: '고은지', email: 'eunji.ko@adminscope.internal', department: '인사총무팀', position: '총무담당', role: 'VIEWER', status: 'ACTIVE', phone: '010-4444-5003', created_at: '2024-07-15' },
  { emp_no: 'EMP-1024', name: '문태경', email: 'taekyung.moon@adminscope.internal', department: '플랫폼개발팀', position: '데브옵스', role: 'OPERATOR', status: 'ACTIVE', phone: '010-4444-5004', created_at: '2024-07-22' },
  { emp_no: 'EMP-1025', name: '남궁훈', email: 'hoon.namgung@adminscope.internal', department: '기획운영팀', position: '데이터분석가', role: 'OPERATOR', status: 'ACTIVE', phone: '010-4444-5005', created_at: '2024-08-01' },
  { emp_no: 'EMP-1026', name: '노진우', email: 'jinwoo.noh@adminscope.internal', department: '서비스개발팀', position: '백엔드개발', role: 'VIEWER', status: 'ACTIVE', phone: '010-5555-6001', created_at: '2024-08-05' },
  { emp_no: 'EMP-1027', name: '변상미', email: 'sangmi.byun@adminscope.internal', department: '디자인팀', position: '프로덕트디자인', role: 'VIEWER', status: 'ACTIVE', phone: '010-5555-6002', created_at: '2024-08-10' },
  { emp_no: 'EMP-1028', name: '도현수', email: 'hyunsoo.do@adminscope.internal', department: '마케팅팀', position: '퍼포먼스마케팅', role: 'OPERATOR', status: 'ACTIVE', phone: '010-5555-6003', created_at: '2024-08-15' },
  { emp_no: 'EMP-1029', name: '석지훈', email: 'jihoon.seok@adminscope.internal', department: '재무회계팀', position: '세무관리', role: 'VIEWER', status: 'INACTIVE', phone: '010-5555-6004', created_at: '2024-08-20' },
  { emp_no: 'EMP-1030', name: '표유라', email: 'yura.pyo@adminscope.internal', department: '인사총무팀', position: '채용전문가', role: 'OPERATOR', status: 'ACTIVE', phone: '010-5555-6005', created_at: '2024-08-25' },
  { emp_no: 'EMP-1031', name: '김시윤', email: 'siyoon.kim@adminscope.internal', department: '플랫폼개발팀', position: '보안엔지니어', role: 'ADMIN', status: 'ACTIVE', phone: '010-6666-7001', created_at: '2024-09-01' },
  { emp_no: 'EMP-1032', name: '김태희', email: 'taehee.kim@adminscope.internal', department: '서비스개발팀', position: '모바일앱개발', role: 'OPERATOR', status: 'ACTIVE', phone: '010-6666-7002', created_at: '2024-09-05' },
  { emp_no: 'EMP-1033', name: '이하랑', email: 'harang.lee@adminscope.internal', department: '기획운영팀', position: '운영기획', role: 'VIEWER', status: 'ACTIVE', phone: '010-6666-7003', created_at: '2024-09-08' },
  { emp_no: 'EMP-1034', name: '박소율', email: 'soyul.park@adminscope.internal', department: '디자인팀', position: '인터랙션디자인', role: 'VIEWER', status: 'ACTIVE', phone: '010-6666-7004', created_at: '2024-09-12' },
  { emp_no: 'EMP-1035', name: '최건우', email: 'gunwoo.choi@adminscope.internal', department: '마케팅팀', position: '브랜드마케터', role: 'VIEWER', status: 'ACTIVE', phone: '010-6666-7005', created_at: '2024-09-15' },
  { emp_no: 'EMP-1036', name: '정다은', email: 'daeun.jung@adminscope.internal', department: '인사총무팀', position: '조직문화', role: 'VIEWER', status: 'ACTIVE', phone: '010-7777-8001', created_at: '2024-09-18' },
  { emp_no: 'EMP-1037', name: '강민혁', email: 'minhyuk.kang@adminscope.internal', department: '재무회계팀', position: '재무분석가', role: 'OPERATOR', status: 'ACTIVE', phone: '010-7777-8002', created_at: '2024-09-20' },
  { emp_no: 'EMP-1038', name: '조은채', email: 'eunchae.cho@adminscope.internal', department: '플랫폼개발팀', position: 'DB관리자', role: 'OPERATOR', status: 'ACTIVE', phone: '010-7777-8003', created_at: '2024-09-22' },
  { emp_no: 'EMP-1039', name: '윤재호', email: 'jaeho.yoon@adminscope.internal', department: '서비스개발팀', position: '풀스택개발', role: 'OPERATOR', status: 'INACTIVE', phone: '010-7777-8004', created_at: '2024-09-25' },
  { emp_no: 'EMP-1040', name: '장서우', email: 'seowoo.jang@adminscope.internal', department: '기획운영팀', position: '프로덕트매니저', role: 'MANAGER', status: 'ACTIVE', phone: '010-7777-8005', created_at: '2024-09-28' },
  { emp_no: 'EMP-1041', name: '임주원', email: 'juwon.lim@adminscope.internal', department: '디자인팀', position: '그래픽디자이너', role: 'VIEWER', status: 'ACTIVE', phone: '010-8888-9001', created_at: '2024-10-01' },
  { emp_no: 'EMP-1042', name: '한지민', email: 'jimin.han@adminscope.internal', department: '마케팅팀', position: '이벤트프로모터', role: 'VIEWER', status: 'ACTIVE', phone: '010-8888-9002', created_at: '2024-10-03' },
  { emp_no: 'EMP-1043', name: '오승우', email: 'seungwoo.oh@adminscope.internal', department: '인사총무팀', position: '총무시설', role: 'VIEWER', status: 'ACTIVE', phone: '010-8888-9003', created_at: '2024-10-05' },
  { emp_no: 'EMP-1044', name: '서아린', email: 'arin.seo@adminscope.internal', department: '재무회계팀', position: '구매계약', role: 'VIEWER', status: 'ACTIVE', phone: '010-8888-9004', created_at: '2024-10-08' },
  { emp_no: 'EMP-1045', name: '신도현', email: 'dohyun.shin@adminscope.internal', department: '플랫폼개발팀', position: 'QA엔지니어', role: 'OPERATOR', status: 'ACTIVE', phone: '010-8888-9005', created_at: '2024-10-10' },
  { emp_no: 'EMP-1046', name: '권채원', email: 'chaewon.kwon@adminscope.internal', department: '서비스개발팀', position: '웹서비스개발', role: 'VIEWER', status: 'ACTIVE', phone: '010-9999-0001', created_at: '2024-10-12' },
  { emp_no: 'EMP-1047', name: '황보람', email: 'boram.hwang@adminscope.internal', department: '기획운영팀', position: '서비스운영', role: 'VIEWER', status: 'ACTIVE', phone: '010-9999-0002', created_at: '2024-10-14' },
  { emp_no: 'EMP-1048', name: '안유진', email: 'yujin.ahn@adminscope.internal', department: '디자인팀', position: 'UI/UX리서처', role: 'VIEWER', status: 'ACTIVE', phone: '010-9999-0003', created_at: '2024-10-15' },
  { emp_no: 'EMP-1049', name: '송민호', email: 'minho.song@adminscope.internal', department: '마케팅팀', position: '글로벌마케터', role: 'VIEWER', status: 'ACTIVE', phone: '010-9999-0004', created_at: '2024-10-18' },
  { emp_no: 'EMP-1050', name: '류채연', email: 'chaeyeon.ryu@adminscope.internal', department: '인사총무팀', position: '인사평가', role: 'OPERATOR', status: 'ACTIVE', phone: '010-9999-0005', created_at: '2024-10-20' },
  { emp_no: 'EMP-1051', name: '김하율', email: 'hayul.kim@adminscope.internal', department: '플랫폼개발팀', position: '분산시스템', role: 'OPERATOR', status: 'ACTIVE', phone: '010-1234-5671', created_at: '2024-10-22' },
  { emp_no: 'EMP-1052', name: '김동하', email: 'dongha.kim@adminscope.internal', department: '서비스개발팀', position: 'API플랫폼개발', role: 'OPERATOR', status: 'ACTIVE', phone: '010-1234-5672', created_at: '2024-10-24' },
  { emp_no: 'EMP-1053', name: '김예은', email: 'yeeun.kim@adminscope.internal', department: '기획운영팀', position: '전략기획', role: 'OPERATOR', status: 'ACTIVE', phone: '010-1234-5673', created_at: '2024-10-25' },
  { emp_no: 'EMP-1054', name: '김찬우', email: 'chanwoo.kim@adminscope.internal', department: '디자인팀', position: '3D모션디자이너', role: 'VIEWER', status: 'ACTIVE', phone: '010-1234-5674', created_at: '2024-10-26' },
  { emp_no: 'EMP-1055', name: '김수아', email: 'sua.kim@adminscope.internal', department: '마케팅팀', position: 'PR홍보전문가', role: 'VIEWER', status: 'ACTIVE', phone: '010-1234-5675', created_at: '2024-10-27' },
  { emp_no: 'EMP-1056', name: '이동현', email: 'donghyun.lee@adminscope.internal', department: '인사총무팀', position: '복리후생', role: 'VIEWER', status: 'ACTIVE', phone: '010-2345-6781', created_at: '2024-10-28' },
  { emp_no: 'EMP-1057', name: '이서윤', email: 'seoyoon.lee@adminscope.internal', department: '재무회계팀', position: '재무회계선임', role: 'OPERATOR', status: 'ACTIVE', phone: '010-2345-6782', created_at: '2024-10-29' },
  { emp_no: 'EMP-1058', name: '이준서', email: 'junseo.lee@adminscope.internal', department: '플랫폼개발팀', position: '시스템운영', role: 'VIEWER', status: 'ACTIVE', phone: '010-2345-6783', created_at: '2024-10-30' },
  { emp_no: 'EMP-1059', name: '이지우', email: 'jiwoo.lee@adminscope.internal', department: '서비스개발팀', position: '웹프론트개발', role: 'VIEWER', status: 'ACTIVE', phone: '010-2345-6784', created_at: '2024-10-31' },
  { emp_no: 'EMP-1060', name: '박도윤', email: 'doyoon.park@adminscope.internal', department: '기획운영팀', position: '데이터엔지니어', role: 'OPERATOR', status: 'ACTIVE', phone: '010-3456-7891', created_at: '2024-11-01' },
  { emp_no: 'EMP-1061', name: '박시은', email: 'sieun.park@adminscope.internal', department: '디자인팀', position: '디자인시스템', role: 'VIEWER', status: 'ACTIVE', phone: '010-3456-7892', created_at: '2024-11-02' },
  { emp_no: 'EMP-1062', name: '박현우', email: 'hyunwoo.park@adminscope.internal', department: '마케팅팀', position: '검색엔진마케터', role: 'VIEWER', status: 'INACTIVE', phone: '010-3456-7893', created_at: '2024-11-03' },
  { emp_no: 'EMP-1063', name: '최윤서', email: 'yoonseo.choi@adminscope.internal', department: '재무회계팀', position: '예산관리자', role: 'OPERATOR', status: 'ACTIVE', phone: '010-4567-8901', created_at: '2024-11-04' },
  { emp_no: 'EMP-1064', name: '최지환', email: 'jihwan.choi@adminscope.internal', department: '플랫폼개발팀', position: '보안아키텍트', role: 'ADMIN', status: 'ACTIVE', phone: '010-4567-8902', created_at: '2024-11-05' },
  { emp_no: 'EMP-1065', name: '정하은', email: 'haeun.jung@adminscope.internal', department: '서비스개발팀', position: '인공지능서비스', role: 'OPERATOR', status: 'ACTIVE', phone: '010-5678-9011', created_at: '2024-11-06' }
];

// 초기 서비스 요청 데이터 (35건: REQ-2001 ~ REQ-2035)
const INITIAL_REQUESTS = [
  { req_id: 'REQ-2001', type: '권한 상향 신청', requester: '장우혁', department: '서비스개발팀', title: '운영환경 배포 권한(ADMIN) 신청', status: 'APPROVED', reason: '신규 마이크로서비스 무중단 배포를 위한 CI/CD 권한 필요', created_at: '2026-09-02' },
  { req_id: 'REQ-2002', type: '개발 장비 불출', requester: '황준서', department: '기획운영팀', title: '데이터 모니터링용 32인치 4K 모니터 신청', status: 'APPROVED', reason: '실시간 지표 관제 다중 화면 구성', created_at: '2026-09-04' },
  { req_id: 'REQ-2003', type: '클라우드 예산 승인', requester: '권보라', department: '플랫폼개발팀', title: 'Kubernetes 클러스터 노드 증설 예산 요청', status: 'APPROVED', reason: '트래픽 급증 대비 스케일아웃 노드 확보', created_at: '2026-09-08' },
  { req_id: 'REQ-2004', type: 'VPN 외부접속 신청', requester: '변상미', department: '디자인팀', title: '원격근무 시 피그마/내부서버 접속용 VPN 신청', status: 'APPROVED', reason: '주 2회 재택근무 수행', created_at: '2026-09-10' },
  { req_id: 'REQ-2005', type: '소프트웨어 라이선스', requester: '도현수', department: '마케팅팀', title: 'Tableau Desktop 라이선스 1카피 구매', status: 'REJECTED', reason: '기존 Metabase 대시보드 대체 활용 가능으로 반려', created_at: '2026-09-12' },
  { req_id: 'REQ-2006', type: '권한 상향 신청', requester: '백선영', department: '서비스개발팀', title: '결제 모듈 테스트 계정 MANAGER 권한 신청', status: 'APPROVED', reason: 'PG사 연동 QA 테스트 진행', created_at: '2026-09-15' },
  { req_id: 'REQ-2007', type: '개발 장비 불출', requester: '문태경', department: '플랫폼개발팀', title: 'MacBook Pro M3 Max 교체 신청', status: 'PENDING', reason: '기존 개발 랩탑 노후화 및 빌드 속도 개선', created_at: '2026-09-18' },
  { req_id: 'REQ-2008', type: '클라우드 예산 승인', requester: '남궁훈', department: '기획운영팀', title: 'BigQuery 데이터 웨어하우스 분기 쿼리 예산 증액', status: 'PENDING', reason: '고객 행동 로그 머신러닝 모델 학습', created_at: '2026-09-20' },
  { req_id: 'REQ-2009', type: '개발 장비 불출', requester: '한지민', department: '마케팅팀', title: '오프라인 컨퍼런스 전시용 태블릿 2대 대여', status: 'PENDING', reason: '2026 SaaS EXPO 부스 운영 및 설문 집계', created_at: '2026-09-22' },
  { req_id: 'REQ-2010', type: 'VPN 외부접속 신청', requester: '노진우', department: '서비스개발팀', title: '해외 출장 기간 사내 인트라넷 VPN 접속 허가', status: 'APPROVED', reason: '싱가포르 테크 콘퍼런스 출장', created_at: '2026-09-25' },
  { req_id: 'REQ-2011', type: '소프트웨어 라이선스', requester: '안재민', department: '디자인팀', title: 'Adobe Creative Cloud 연간 구독 갱신', status: 'APPROVED', reason: '브랜드 리뉴얼 에셋 제작', created_at: '2026-09-27' },
  { req_id: 'REQ-2012', type: '권한 상향 신청', requester: '송하늘', department: '마케팅팀', title: '사내 공지사항 CMS 에디터 발행 권한 신청', status: 'PENDING', reason: '10월 프로모션 뉴스레터 사내 발송', created_at: '2026-09-28' },
  { req_id: 'REQ-2013', type: '클라우드 예산 승인', requester: '류호준', department: '재무회계팀', title: 'AWS 감사 로그 S3 Glacier 보관비용 승인', status: 'APPROVED', reason: '전자금융거래 감사 대비 장기 보관', created_at: '2026-09-30' },
  { req_id: 'REQ-2014', type: '개발 장비 불출', requester: '고은지', department: '인사총무팀', title: '임직원 사원증 발급용 스마트카드 리더기', status: 'APPROVED', reason: '신규 입사자 카드키 제작', created_at: '2026-10-01' },
  { req_id: 'REQ-2015', type: 'VPN 외부접속 신청', requester: '김태희', department: '서비스개발팀', title: '모바일 앱 야간 긴급 패치용 원격접속', status: 'PENDING', reason: 'iOS 앱스토어 심사 대응 온콜 대기', created_at: '2026-10-02' },
  { req_id: 'REQ-2016', type: '권한 상향 신청', requester: '김시윤', department: '플랫폼개발팀', title: '보안 취약점 스캐너 API 접근 키 발급', status: 'APPROVED', reason: '정기 보안 감사 및 모의해킹', created_at: '2026-10-03' },
  { req_id: 'REQ-2017', type: '소프트웨어 라이선스', requester: '이하랑', department: '기획운영팀', title: 'Jira Software Premium 플랜 라이선스', status: 'PENDING', reason: '애자일 로드맵 고도화 모듈 사용', created_at: '2026-10-04' },
  { req_id: 'REQ-2018', type: '개발 장비 불출', requester: '박소율', department: '디자인팀', title: 'Wacom Cintiq Pro 16 액정 타블렛', status: 'PENDING', reason: '신규 일러스트레이션 원화 드로잉', created_at: '2026-10-05' },
  { req_id: 'REQ-2019', type: '클라우드 예산 승인', requester: '강민혁', department: '재무회계팀', title: 'ERP 클라우드 연동 전용선 회선료 승인', status: 'APPROVED', reason: '더존 ERP 결제 데이터 동기화', created_at: '2026-10-05' },
  { req_id: 'REQ-2020', type: 'VPN 외부접속 신청', requester: '조은채', department: '플랫폼개발팀', title: '주말 데이터베이스 마이그레이션 원격 작업 허가', status: 'PENDING', reason: '무중단 DB 샤딩 점검', created_at: '2026-10-06' },
  { req_id: 'REQ-2021', type: '권한 상향 신청', requester: '정다은', department: '인사총무팀', title: '전사 인사정보 조회 권한 신청', status: 'REJECTED', reason: '개인정보 보호 정책상 부서장 사전승인 미첨부', created_at: '2026-10-06' },
  { req_id: 'REQ-2022', type: '개발 장비 불출', requester: '최건우', department: '마케팅팀', title: '유튜브 촬영용 Sony A7M4 카메라 및 삼각대', status: 'PENDING', reason: '사내 기술블로그 인터뷰 및 영상 제작', created_at: '2026-10-07' },
  { req_id: 'REQ-2023', type: '소프트웨어 라이선스', requester: '임주원', department: '디자인팀', title: 'FontWorks 연간 서체 패키지 라이선스', status: 'PENDING', reason: 'CI 가이드라인 신규 폰트 도입', created_at: '2026-10-07' },
  { req_id: 'REQ-2024', type: '클라우드 예산 승인', requester: '오승우', department: '인사총무팀', title: '사내 슬랙 Enterprise Grid 플랜 업그레이드', status: 'APPROVED', reason: '채널 보존 및 보안 규제 준수', created_at: '2026-10-08' },
  { req_id: 'REQ-2025', type: 'VPN 외부접속 신청', requester: '서아린', department: '재무회계팀', title: '재택 세무결산 회계서버 VPN 신청', status: 'PENDING', reason: '분기 부가세 신고 야간 집계', created_at: '2026-10-08' },
  { req_id: 'REQ-2026', type: '권한 상향 신청', requester: '신도현', department: '플랫폼개발팀', title: 'SonarQube 관리자 권한 신청', status: 'PENDING', reason: '정적 코드 분석 룰셋 커스텀 등록', created_at: '2026-10-09' },
  { req_id: 'REQ-2027', type: '개발 장비 불출', requester: '권채원', department: '서비스개발팀', title: '테스트용 스마트폰 단말기(Galaxy S24, iPhone 16)', status: 'APPROVED', reason: '반응형 웹 및 PWA 크로스 브라우징', created_at: '2026-10-09' },
  { req_id: 'REQ-2028', type: '소프트웨어 라이선스', requester: '송민호', department: '마케팅팀', title: 'SEMrush 비즈니스 플랜 해외 SEO 툴', status: 'PENDING', reason: '북미 마켓 키워드 유입 분석', created_at: '2026-10-10' },
  { req_id: 'REQ-2029', type: '클라우드 예산 승인', requester: '김하율', department: '플랫폼개발팀', title: 'Redis Cache 클러스터 메모리 증설', status: 'PENDING', reason: '세션 스토리지 피크타임 안정화', created_at: '2026-10-10' },
  { req_id: 'REQ-2030', type: 'VPN 외부접속 신청', requester: '김동하', department: '서비스개발팀', title: '외주 개발사 연동 API 게이트웨이 접속망 오픈', status: 'APPROVED', reason: '모빌리티 파트너십 오픈API 연동', created_at: '2026-10-11' },
  { req_id: 'REQ-2031', type: '권한 상향 신청', requester: '김예은', department: '기획운영팀', title: 'BI 대시보드 최고관리자 권한 요청', status: 'PENDING', reason: '경영진 주간 회의 보고서 템플릿 제작', created_at: '2026-10-11' },
  { req_id: 'REQ-2032', type: '개발 장비 불출', requester: '김찬우', department: '디자인팀', title: 'VR 헤드셋 Meta Quest 3 불출 요청', status: 'PENDING', reason: '공간 컴퓨팅 UI 프로토타이핑', created_at: '2026-10-11' },
  { req_id: 'REQ-2033', type: '소프트웨어 라이선스', requester: '이동현', department: '인사총무팀', title: 'DocuSign 전자서명 비즈니스 프로 100건', status: 'APPROVED', reason: '2026 하반기 연봉계약서 전자 체결', created_at: '2026-10-11' },
  { req_id: 'REQ-2034', type: '클라우드 예산 승인', requester: '최윤서', department: '재무회계팀', title: '외환 송금 API 트랜잭션 수수료 충전', status: 'APPROVED', reason: '해외 소프트웨어 구독 결제', created_at: '2026-10-11' },
  { req_id: 'REQ-2035', type: 'VPN 외부접속 신청', requester: '정하은', department: '서비스개발팀', title: 'ML 모델 학습 클러스터 주말 원격 모니터링', status: 'PENDING', reason: '거대 언어 모델 파인튜닝 체크포인트 확인', created_at: '2026-10-12' }
];

// 초기 관리 로그 데이터 (55건: LOG-5001 ~ LOG-5055)
const INITIAL_LOGS = [
  { log_id: 'LOG-5001', admin: '김도현', action: 'USER_ROLE_UPDATE', target_id: 'EMP-1008', target_name: '윤지아', ip_address: '192.168.1.10', result: 'SUCCESS', details: '권한을 MANAGER에서 ADMIN으로 상향', created_at: '2026-09-01 09:12:45' },
  { log_id: 'LOG-5002', admin: '김도현', action: 'REQUEST_APPROVE', target_id: 'REQ-2001', target_name: '장우혁', ip_address: '192.168.1.10', result: 'SUCCESS', details: '운영환경 배포 권한 승인 완료', created_at: '2026-09-02 11:30:10' },
  { log_id: 'LOG-5003', admin: '이서진', action: 'USER_STATUS_TOGGLE', target_id: 'EMP-1019', target_name: '안재민', ip_address: '192.168.1.15', result: 'SUCCESS', details: '휴직 처리로 계정 비활성화(INACTIVE)', created_at: '2026-09-03 14:22:05' },
  { log_id: 'LOG-5004', admin: '박준호', action: 'REQUEST_APPROVE', target_id: 'REQ-2002', target_name: '황준서', ip_address: '192.168.1.22', result: 'SUCCESS', details: '4K 모니터 불출 신청 승인', created_at: '2026-09-04 16:40:19' },
  { log_id: 'LOG-5005', admin: '김도현', action: 'REQUEST_APPROVE', target_id: 'REQ-2003', target_name: '권보라', ip_address: '192.168.1.10', result: 'SUCCESS', details: '쿠버네티스 노드 증설 예산 승인', created_at: '2026-09-08 10:05:40' },
  { log_id: 'LOG-5006', admin: '정유진', action: 'REQUEST_APPROVE', target_id: 'REQ-2004', target_name: '변상미', ip_address: '192.168.1.33', result: 'SUCCESS', details: '재택용 VPN 신청 승인', created_at: '2026-09-10 13:15:22' },
  { log_id: 'LOG-5007', admin: '최영진', action: 'REQUEST_REJECT', target_id: 'REQ-2005', target_name: '도현수', ip_address: '192.168.1.45', result: 'REJECTED', details: '사내 표준 대시보드 활용 권고로 라이선스 반려', created_at: '2026-09-12 15:50:33' },
  { log_id: 'LOG-5008', admin: '이서진', action: 'REQUEST_APPROVE', target_id: 'REQ-2006', target_name: '백선영', ip_address: '192.168.1.15', result: 'SUCCESS', details: '결제 테스트 계정 권한 승인', created_at: '2026-09-15 09:44:11' },
  { log_id: 'LOG-5009', admin: '조민석', action: 'USER_STATUS_TOGGLE', target_id: 'EMP-1029', target_name: '석지훈', ip_address: '192.168.1.50', result: 'SUCCESS', details: '퇴사 처리로 계정 비활성화(INACTIVE)', created_at: '2026-09-16 11:20:00' },
  { log_id: 'LOG-5010', admin: '이서진', action: 'REQUEST_APPROVE', target_id: 'REQ-2010', target_name: '노진우', ip_address: '192.168.1.15', result: 'SUCCESS', details: '해외 출장 VPN 접속 승인', created_at: '2026-09-25 17:05:30' },
  { log_id: 'LOG-5011', admin: '정유진', action: 'REQUEST_APPROVE', target_id: 'REQ-2011', target_name: '안재민', ip_address: '192.168.1.33', result: 'SUCCESS', details: '어도비 라이선스 갱신 승인', created_at: '2026-09-27 10:18:45' },
  { log_id: 'LOG-5012', admin: '조민석', action: 'REQUEST_APPROVE', target_id: 'REQ-2013', target_name: '류호준', ip_address: '192.168.1.50', result: 'SUCCESS', details: 'S3 Glacier 감사로그 보관 승인', created_at: '2026-09-30 16:30:12' },
  { log_id: 'LOG-5013', admin: '강수현', action: 'REQUEST_APPROVE', target_id: 'REQ-2014', target_name: '고은지', ip_address: '192.168.1.60', result: 'SUCCESS', details: '스마트카드 리더기 구입 승인', created_at: '2026-10-01 14:02:19' },
  { log_id: 'LOG-5014', admin: '김도현', action: 'REQUEST_APPROVE', target_id: 'REQ-2016', target_name: '김시윤', ip_address: '192.168.1.10', result: 'SUCCESS', details: '보안 취약점 스캐너 키 발급 승인', created_at: '2026-10-03 11:55:00' },
  { log_id: 'LOG-5015', admin: '조민석', action: 'REQUEST_APPROVE', target_id: 'REQ-2019', target_name: '강민혁', ip_address: '192.168.1.50', result: 'SUCCESS', details: 'ERP 전용회선료 지출 결재', created_at: '2026-10-05 09:20:44' },
  { log_id: 'LOG-5016', admin: '강수현', action: 'REQUEST_REJECT', target_id: 'REQ-2021', target_name: '정다은', ip_address: '192.168.1.60', result: 'REJECTED', details: '부서장 사전결재 누락으로 반려', created_at: '2026-10-06 15:45:10' },
  { log_id: 'LOG-5017', admin: '강수현', action: 'REQUEST_APPROVE', target_id: 'REQ-2024', target_name: '오승우', ip_address: '192.168.1.60', result: 'SUCCESS', details: 'Slack Enterprise Grid 결재', created_at: '2026-10-08 10:12:00' },
  { log_id: 'LOG-5018', admin: '이서진', action: 'REQUEST_APPROVE', target_id: 'REQ-2027', target_name: '권채원', ip_address: '192.168.1.15', result: 'SUCCESS', details: '테스트용 스마트폰 불출 승인', created_at: '2026-10-09 13:40:55' },
  { log_id: 'LOG-5019', admin: '이서진', action: 'REQUEST_APPROVE', target_id: 'REQ-2030', target_name: '김동하', ip_address: '192.168.1.15', result: 'SUCCESS', details: '파트너사 연동망 오픈 승인', created_at: '2026-10-11 11:10:02' },
  { log_id: 'LOG-5020', admin: '강수현', action: 'REQUEST_APPROVE', target_id: 'REQ-2033', target_name: '이동현', ip_address: '192.168.1.60', result: 'SUCCESS', details: 'DocuSign 전자서명 패키지 결재', created_at: '2026-10-11 14:50:23' },
  { log_id: 'LOG-5021', admin: '조민석', action: 'REQUEST_APPROVE', target_id: 'REQ-2034', target_name: '최윤서', ip_address: '192.168.1.50', result: 'SUCCESS', details: '외환 송금 수수료 승인', created_at: '2026-10-11 16:30:41' },
  { log_id: 'LOG-5022', admin: '김도현', action: 'SYSTEM_SETTINGS_CHANGE', target_id: 'SYS-SEC', target_name: '비밀번호 정책', ip_address: '192.168.1.10', result: 'SUCCESS', details: '비밀번호 변경 주기 90일 강제화', created_at: '2026-10-11 18:00:15' },
  { log_id: 'LOG-5023', admin: '김도현', action: 'USER_ROLE_UPDATE', target_id: 'EMP-1031', target_name: '김시윤', ip_address: '192.168.1.10', result: 'SUCCESS', details: '보안팀장 직무대행 ADMIN 권한 부여', created_at: '2026-10-11 18:45:00' },
  { log_id: 'LOG-5024', admin: '이서진', action: 'USER_INFO_UPDATE', target_id: 'EMP-1032', target_name: '김태희', ip_address: '192.168.1.15', result: 'SUCCESS', details: '부서 배치 및 담당 프로젝트 명시', created_at: '2026-10-11 19:15:20' },
  { log_id: 'LOG-5025', admin: '김도현', action: 'BACKUP_EXECUTE', target_id: 'DB-MAIN', target_name: '메인 데이터베이스', ip_address: '192.168.1.10', result: 'SUCCESS', details: '일일 정기 데이터베이스 콜드백업 완료', created_at: '2026-10-12 00:00:10' },
  { log_id: 'LOG-5026', admin: '이서진', action: 'SESSION_TERMINATE', target_id: 'EMP-1039', target_name: '윤재호', ip_address: '192.168.1.15', result: 'SUCCESS', details: '비활성 계정 잔여 세션 일괄 종료', created_at: '2026-10-12 00:15:30' },
  { log_id: 'LOG-5027', admin: '김도현', action: 'ACCESS_AUDIT', target_id: 'GATEWAY-01', target_name: '사내 VPN 게이트웨이', ip_address: '192.168.1.10', result: 'SUCCESS', details: '야간 외부 접속자 IP 이상 징후 없음 확인', created_at: '2026-10-12 00:30:00' },
  { log_id: 'LOG-5028', admin: '시스템', action: 'SCHEDULED_JOB', target_id: 'SYNC-HR', target_name: '인사 연동 배치', ip_address: '127.0.0.1', result: 'SUCCESS', details: '조직도 변경사항 0건 동기화', created_at: '2026-10-12 01:00:00' },
  { log_id: 'LOG-5029', admin: '김도현', action: 'USER_STATUS_TOGGLE', target_id: 'EMP-1062', target_name: '박현우', ip_address: '192.168.1.10', result: 'SUCCESS', details: '장기 해외파견으로 계정 비활성화', created_at: '2026-10-12 01:10:15' },
  { log_id: 'LOG-5030', admin: '김도현', action: 'DASHBOARD_VIEW', target_id: 'DASH-01', target_name: 'KPI 대시보드', ip_address: '192.168.1.10', result: 'SUCCESS', details: '전체 관리자 통계 조회', created_at: '2026-10-12 01:20:00' }
];

// 추가 25건 로그를 채워 55건 달성
for (let i = 31; i <= 55; i++) {
  INITIAL_LOGS.push({
    log_id: `LOG-50${i}`,
    admin: i % 2 === 0 ? '김도현' : '이서진',
    action: ['USER_LOOKUP', 'DATA_EXPORT', 'PERMISSION_AUDIT', 'CONFIG_CHECK'][i % 4],
    target_id: `EMP-10${10 + (i % 50)}`,
    target_name: `사원_${1000 + i}`,
    ip_address: `192.168.1.${10 + (i % 40)}`,
    result: 'SUCCESS',
    details: `정기 보안 및 감사 로그 ${i}번 항목 자동 수집`,
    created_at: `2026-10-11 12:${(i % 60).toString().padStart(2, '0')}:00`
  });
}

// DB 스키마 생성 및 초기화
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. departments 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          code TEXT NOT NULL,
          manager TEXT NOT NULL,
          location TEXT NOT NULL
        )
      `);

      // 2. users 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          emp_no TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          department TEXT NOT NULL,
          position TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT NOT NULL,
          phone TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      // 3. service_requests 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS service_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          req_id TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL,
          requester TEXT NOT NULL,
          department TEXT NOT NULL,
          title TEXT NOT NULL,
          status TEXT NOT NULL,
          reason TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      // 4. audit_logs 테이블
      db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          log_id TEXT UNIQUE NOT NULL,
          admin TEXT NOT NULL,
          action TEXT NOT NULL,
          target_id TEXT NOT NULL,
          target_name TEXT NOT NULL,
          ip_address TEXT NOT NULL,
          result TEXT NOT NULL,
          details TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      // 시드 데이터 주입 검사
      db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
        if (err) return reject(err);
        if (row && row.count === 0) {
          resetAllData().then(resolve).catch(reject);
        } else {
          resolve();
        }
      });
    });
  });
}

// 멱등성 데이터 전체 리셋 함수
function resetAllData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM departments');
      db.run('DELETE FROM users');
      db.run('DELETE FROM service_requests');
      db.run('DELETE FROM audit_logs');

      // 1. Departments 삽입
      const stmtDept = db.prepare('INSERT INTO departments (id, name, code, manager, location) VALUES (?, ?, ?, ?, ?)');
      INITIAL_DEPARTMENTS.forEach(d => {
        stmtDept.run(d.id, d.name, d.code, d.manager, d.location);
      });
      stmtDept.finalize();

      // 2. Users 삽입
      const stmtUser = db.prepare(`
        INSERT INTO users (emp_no, name, email, department, position, role, status, phone, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      INITIAL_USERS.forEach(u => {
        stmtUser.run(u.emp_no, u.name, u.email, u.department, u.position, u.role, u.status, u.phone, u.created_at);
      });
      stmtUser.finalize();

      // 3. Requests 삽입
      const stmtReq = db.prepare(`
        INSERT INTO service_requests (req_id, type, requester, department, title, status, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      INITIAL_REQUESTS.forEach(r => {
        stmtReq.run(r.req_id, r.type, r.requester, r.department, r.title, r.status, r.reason, r.created_at);
      });
      stmtReq.finalize();

      // 4. Logs 삽입
      const stmtLog = db.prepare(`
        INSERT INTO audit_logs (log_id, admin, action, target_id, target_name, ip_address, result, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      INITIAL_LOGS.forEach(l => {
        stmtLog.run(l.log_id, l.admin, l.action, l.target_id, l.target_name, l.ip_address, l.result, l.details, l.created_at);
      });
      stmtLog.finalize((err) => {
        if (err) reject(err);
        else resolve({ users: INITIAL_USERS.length, departments: INITIAL_DEPARTMENTS.length, requests: INITIAL_REQUESTS.length, logs: INITIAL_LOGS.length });
      });
    });
  });
}

module.exports = {
  db,
  initDatabase,
  resetAllData,
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_REQUESTS,
  INITIAL_LOGS
};
