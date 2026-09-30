import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9946;

app.use(cors({
  exposedHeaders: ['X-Bug-Triggered']
}));
app.use(express.json());

// ==========================================
// In-Memory Database (Mock State)
// ==========================================

const users = [
  { id: "user-001", name: "이지우", email: "jiwoo.lee@example.com", role: "user", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", phone: "010-3491-8821" },
  { id: "user-002", name: "김민지", email: "minji.kim@example.com", role: "user", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", phone: "010-8912-4412" },
  { id: "user-003", name: "박동훈", email: "donghoon.park@example.com", role: "user", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80", phone: "010-4491-7719" },
  { id: "host-001", name: "최민수 (마스터 호스트)", email: "minsu.host@tripnest.internal", role: "host", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", phone: "010-5512-9901" },
  { id: "host-002", name: "정지원 (로컬 큐레이터)", email: "jiwon.host@tripnest.internal", role: "host", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", phone: "010-7712-3345" },
  { id: "admin-001", name: "시스템 관리자", email: "admin@tripnest.com", role: "admin", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", phone: "02-555-0199" }
];

let experiences = [
  {
    id: "exp-001",
    title: "서울 야경 감성 스냅 사진 투어 & 히든 루프탑",
    description: "서울의 숨겨진 야경 명소와 감성 루프탑을 거닐며 인생 스냅 사진을 남겨보세요. 전문 포토그래퍼가 1:1 보정본 10장을 함께 제공합니다.",
    category: "tour",
    region: "서울",
    price: 45000,
    rating: 4.92,
    reviewCount: 48,
    hostId: "host-001",
    hostName: "최민수 포토그래퍼",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop&q=80",
    duration: "2시간 30분",
    maxParticipants: 6,
    availableDates: ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05", "2026-10-08"],
    timeSlots: ["19:00", "20:30"],
    location: "서울 종로구 낙산공원 입구",
    includes: ["전문 사진 촬영", "고화질 보정본 10장", "루프탑 웰컴 드링크 1잔"],
    refundPolicy: "체험 3일 전까지 100% 환불 가능, 당일 취소 불가",
    status: "published",
    visibility: "public",
    internalNote: "협력 카페 대관료 1인당 5,000원 정산 필요. VIP 촬영 패키지 업셀링 권장.",
    hostEmail: "minsu.snap.internal@tripnest.internal",
    privateMemo: "포토그래퍼 개인 계좌: 카카오뱅크 3333-01-998811 최민수"
  },
  {
    id: "exp-002",
    title: "성수동 감성 물레 도자기 원데이 클래스",
    description: "흙의 온기를 느끼며 나만의 머그컵이나 화병을 빚어보는 힐링 물레 도자기 체험입니다. 초보자도 꼼꼼한 지도로 완성도 높은 작품을 만듭니다.",
    category: "class",
    region: "서울",
    price: 65000,
    rating: 4.88,
    reviewCount: 36,
    hostId: "host-002",
    hostName: "정지원 도예가",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
    duration: "2시간",
    maxParticipants: 4,
    availableDates: ["2026-10-02", "2026-10-04", "2026-10-06", "2026-10-09"],
    timeSlots: ["11:00", "14:00", "16:30"],
    location: "서울 성동구 성수이로 18길",
    includes: ["소지 및 유약 재료", "작품 2점 가마 소성", "선물용 패키징 및 택배 발송"],
    refundPolicy: "체험 2일 전까지 전액 환불, 1일 전 50% 환불",
    status: "published",
    visibility: "public",
    internalNote: "가마 소성비 원가 12,000원. 깨짐 파손 보상 보험 연동 필수.",
    hostEmail: "jiwon.pottery@artnest.co.kr",
    privateMemo: "공방 도어락 비밀번호: 4892*, 원자재 공급처 성수점 연락망 보관"
  },
  {
    id: "exp-003",
    title: "부산 해운대 선셋 서핑 & 비치 플로우",
    description: "초보자 맞춤형 기초 강습과 함께 노을 지는 해운대 바다 위에서 서핑을 즐기는 짜릿한 액티비티입니다. 슈트와 보드가 모두 제공됩니다.",
    category: "activity",
    region: "부산",
    price: 55000,
    rating: 4.95,
    reviewCount: 62,
    hostId: "host-001",
    hostName: "최민수 서프코치",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=80",
    duration: "3시간",
    maxParticipants: 8,
    availableDates: ["2026-10-01", "2026-10-03", "2026-10-05", "2026-10-07"],
    timeSlots: ["10:00", "14:00", "16:30"],
    location: "부산 해운대구 송정해변로 34",
    includes: ["서프보드 렌탈", "웨트슈트 대여", "샤워 시설 및 온수 이용권", "기념 액션캠 사진"],
    refundPolicy: "기상 악화(풍랑주의보) 시 100% 환불 또는 일정 변경",
    status: "published",
    visibility: "public",
    internalNote: "해양레저 사업자 등록 갱신 완료. 송정 서프클럽 제휴 할인 코드: SURF2026",
    hostEmail: "busan.surf@oceanvibes.kr",
    privateMemo: "안전 요원 자격증 사본 드라이브 공유 경로 /ocean/licenses/minsu.pdf"
  },
  {
    id: "exp-004",
    title: "제주 비밀의 숲 & 따라비오름 프라이빗 트레킹",
    description: "관광객이 붐비지 않는 제주의 숨은 오름과 억새 숲길을 로컬 에코 가이드와 함께 걷는 힐링 트레킹 투어입니다.",
    category: "tour",
    region: "제주",
    price: 49000,
    rating: 4.91,
    reviewCount: 29,
    hostId: "host-002",
    hostName: "정지원 제주로컬",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&auto=format&fit=crop&q=80",
    duration: "3시간 30분",
    maxParticipants: 6,
    availableDates: ["2026-10-02", "2026-10-03", "2026-10-06", "2026-10-08"],
    timeSlots: ["09:00", "14:30"],
    location: "제주 서귀포시 표선면 가시리",
    includes: ["전문 트레킹 가이드", "피크닉 매트 및 핸드드립 커피", "제주 감성 필름 사진 5장"],
    refundPolicy: "체험 3일 전 100% 환불, 당일 우천 시 전액 환불",
    status: "published",
    visibility: "public",
    internalNote: "숲길 사유지 출입 허가서 매달 1일 갱신. 가시리 마을회 발전기금 납부 대상.",
    hostEmail: "jeju.oreum@naturenest.kr",
    privateMemo: "가이드 차량: 산타페 44가 1928, 트레킹 비상 응급약 키트 차량 트렁크 비치"
  },
  {
    id: "exp-005",
    title: "전통 명주 빚기 & 5종 전통주 테이스팅 클래스",
    description: "국내산 찹쌀과 누룩으로 직접 가양주를 빚고, 소믈리에가 엄선한 프리미엄 전통주 5종과 어울리는 페어링 안주를 즐깁니다.",
    category: "class",
    region: "서울",
    price: 70000,
    rating: 4.89,
    reviewCount: 41,
    hostId: "host-001",
    hostName: "최민수 주조사",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
    duration: "2시간",
    maxParticipants: 8,
    availableDates: ["2026-10-01", "2026-10-04", "2026-10-07"],
    timeSlots: ["15:00", "18:00"],
    location: "서울 마포구 연남동 229-1",
    includes: ["직접 빚은 전통주 1L 포장", "전통주 5종 시음", "제철 한식 핑거푸드 페어링"],
    refundPolicy: "체험 2일 전까지 취소 시 100% 환불",
    status: "published",
    visibility: "public",
    internalNote: "주류 제조 면허 및 교육기관 등록 완료. 미성년자 예약 엄격 금지.",
    hostEmail: "sool.master@traditionalbrew.kr",
    privateMemo: "누룩 납품처: 안동 진맥소주 협동조합 (단가 1kg당 8,500원)"
  },
  {
    id: "exp-006",
    title: "한강 선셋 카약 투어 & 야간 패들링",
    description: "도심 속 한강에서 붉게 물드는 노을과 서울의 랜드마크 뷰를 물 위에서 감상하는 이색 카약 체험입니다.",
    category: "activity",
    region: "서울",
    price: 38000,
    rating: 4.85,
    reviewCount: 55,
    hostId: "host-002",
    hostName: "정지원 수상안전요원",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
    duration: "1시간 40분",
    maxParticipants: 10,
    availableDates: ["2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06"],
    timeSlots: ["17:30", "19:00"],
    location: "서울 광진구 뚝섬 한강공원 수상레저센터",
    includes: ["2인승/1인승 카약", "구명조끼 및 방수팩", "패들링 기초 안전 교육"],
    refundPolicy: "체험 당일 강풍 또는 폭우 시 100% 전액 환불",
    status: "published",
    visibility: "public",
    internalNote: "뚝섬 수상레저장 계류비 월 45만원 지출. 라이프가드 2인 상시 배치.",
    hostEmail: "kayak.hangang@leisureclub.com",
    privateMemo: "구명조끼 보관함 자물쇠 번호: 9912. 응급 보트 선착장 3번 부표"
  },
  {
    id: "exp-007",
    title: "성수 프랑스 버터 스콘 & 마들렌 베이킹 클래스",
    description: "프랑스 AOP 고메 버터를 듬뿍 사용해 겉바속촉 스콘 4종과 촉촉한 글라세 마들렌을 완성하는 프리미엄 제과 클래스입니다.",
    category: "class",
    region: "서울",
    price: 68000,
    rating: 4.96,
    reviewCount: 39,
    hostId: "host-001",
    hostName: "최민수 파티시에",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    duration: "2시간 30분",
    maxParticipants: 4,
    availableDates: ["2026-10-03", "2026-10-05", "2026-10-08"],
    timeSlots: ["10:30", "14:30"],
    location: "서울 성동구 연무장길 45 2층",
    includes: ["스콘 6구 + 마들렌 6구 완성품", "고급 디저트 선물 박스", "시식용 홍차 1잔"],
    refundPolicy: "원재료 준비로 인해 2일 전까지만 100% 환불 가능",
    status: "published",
    visibility: "public",
    internalNote: "엘르앤비르 고메버터 박스 단위 도매 구매 (성수 베이킹몰).",
    hostEmail: "chef.minsu.baking@sweetnest.com",
    privateMemo: "재료 발주 담당: 박실장 010-9988-1234, 레시피 저작권 등록 제2024-C-9912호"
  },
  {
    id: "exp-008",
    title: "북촌 한옥마을 다도 & 전통 화과자 만들기 체험",
    description: "100년 역사의 고즈넉한 한옥 대청마루에서 한국의 말차 다도를 배우고 알록달록한 제철 화과자를 빚어봅니다.",
    category: "class",
    region: "서울",
    price: 52000,
    rating: 4.94,
    reviewCount: 45,
    hostId: "host-002",
    hostName: "정지원 다도사범",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    duration: "1시간 40분",
    maxParticipants: 6,
    availableDates: ["2026-10-02", "2026-10-04", "2026-10-07"],
    timeSlots: ["11:00", "14:00", "16:00"],
    location: "서울 종로구 북촌로 11길 19",
    includes: ["화과자 4구 포장 박스", "하동 유기농 녹차 & 말차 시음", "한옥 포토존 스냅 촬영"],
    refundPolicy: "체험 2일 전까지 취소 시 100% 환불",
    status: "published",
    visibility: "public",
    internalNote: "북촌 한옥마을 주민 소음 민원 주의 (오후 6시 이후 조용히 퇴실 안내).",
    hostEmail: "tea.hanok@koreantradition.org",
    privateMemo: "한옥 마당 관리인 연락처: 010-2211-9876 이 어르신"
  },
  {
    id: "exp-009",
    title: "가평 잣나무 숲속 감성 글램핑 & 바비큐 디너",
    description: "피톤치드 가득한 잣나무 숲속 럭셔리 글램핑 텐트에서 즐기는 감성 캠프파이어와 프리미엄 토마호크 바비큐 체험입니다.",
    category: "activity",
    region: "경기",
    price: 120000,
    rating: 4.87,
    reviewCount: 31,
    hostId: "host-001",
    hostName: "최민수 캠프마스터",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80",
    duration: "당일 5시간 (16:00~21:00)",
    maxParticipants: 4,
    availableDates: ["2026-10-01", "2026-10-03", "2026-10-05", "2026-10-06"],
    timeSlots: ["16:00"],
    location: "경기 가평군 상면 축령로 180",
    includes: ["글램핑 텐트 이용", "토마호크 스테이크 바비큐 세트", "장작 불멍 & 마시멜로 키트"],
    refundPolicy: "체험 5일 전까지 100% 환불, 3일 전 50% 환불",
    status: "published",
    visibility: "public",
    internalNote: "고기 원가 세트당 35,000원 납품 계약 (마장동 직송). 장작 1망 8,000원 정산.",
    hostEmail: "glamping.minsu@forestnest.kr",
    privateMemo: "텐트 3호실 히터 온도 조절기 고장 주의 요망"
  },
  {
    id: "exp-010",
    title: "강릉 안목해변 오션뷰 스페셜티 커피 드립 클래스",
    description: "동해 바다가 시원하게 내려다보이는 로스팅 랩에서 세계 각국의 스페셜티 싱글 오리진 원두를 직접 로스팅하고 브루잉합니다.",
    category: "class",
    region: "강원",
    price: 42000,
    rating: 4.90,
    reviewCount: 28,
    hostId: "host-002",
    hostName: "정지원 바리스타",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
    duration: "1시간 30분",
    maxParticipants: 6,
    availableDates: ["2026-10-02", "2026-10-04", "2026-10-08"],
    timeSlots: ["13:00", "15:30"],
    location: "강원 강릉시 창해로 14번길 20",
    includes: ["직접 로스팅한 원두 200g", "스페셜티 커피 테이스팅 3종", "브루잉 가이드북"],
    refundPolicy: "체험 1일 전까지 100% 전액 환불 가능",
    status: "published",
    visibility: "public",
    internalNote: "생두 에티오피아 예가체프 G1 재고 확인 필요.",
    hostEmail: "gangneung.coffee@roasters.kr",
    privateMemo: "로스터기 머신 캘리브레이션 주기: 매주 월요일 오전 9시"
  },
  {
    id: "exp-011",
    title: "제주 애월 해녀와 함께하는 스노클링 & 해초 채취 체험",
    description: "실제 제주 해녀 삼춘과 함께 맑은 애월 바다에 들어가 스노클링을 즐기고 싱싱한 뿔소라와 미역을 직접 채취해 맛봅니다.",
    category: "activity",
    region: "제주",
    price: 60000,
    rating: 4.97,
    reviewCount: 52,
    hostId: "host-001",
    hostName: "최민수 해양코디",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&auto=format&fit=crop&q=80",
    duration: "2시간 30분",
    maxParticipants: 6,
    availableDates: ["2026-10-01", "2026-10-03", "2026-10-07"],
    timeSlots: ["10:30", "14:00"],
    location: "제주 제주시 애월읍 애월해안로 230",
    includes: ["스노클링 마스크 및 슈트", "해녀 삼춘의 직화 뿔소라 구이 2개", "수중 고프로 촬영본"],
    refundPolicy: "기상 파도 악화 시 100% 환불 또는 날짜 변경",
    status: "published",
    visibility: "public",
    internalNote: "애월 어촌계 협약금 1인당 10,000원 지급. 해녀 삼춘 일당 정산 월말.",
    hostEmail: "jeju.haenyeo@oceanvillage.kr",
    privateMemo: "어촌계장님 연락처: 고봉순 어르신 010-8833-2190"
  },
  {
    id: "exp-012",
    title: "경주 역사 유적 달빛 야경 투어 & 청사초롱 산책",
    description: "동궁과 월지, 첨성대, 월정교의 눈부신 야경을 청사초롱을 들고 전문 역사 해설사와 함께 거니는 낭만적인 밤 산책입니다.",
    category: "tour",
    region: "경북",
    price: 32000,
    rating: 4.93,
    reviewCount: 44,
    hostId: "host-002",
    hostName: "정지원 문화해설사",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    duration: "2시간",
    maxParticipants: 12,
    availableDates: ["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05"],
    timeSlots: ["19:30"],
    location: "경북 경주시 인왕동 첨성대 광장 앞",
    includes: ["전통 청사초롱 대여", "무선 수신기 및 이어폰", "역사 퀴즈 기념품 (경주빵)"],
    refundPolicy: "체험 1일 전까지 100% 환불 가능",
    status: "published",
    visibility: "public",
    internalNote: "문화재청 단체 해설 승인 번호 #GY-2026-092. 무선 송수신기 배터리 충전 체크.",
    hostEmail: "gyeongju.night@historywalk.kr",
    privateMemo: "경주빵 제휴점 구매처: 황남제과 20% 할인 계약"
  },
  {
    id: "exp-013",
    title: "홍대 감성 아크릴 나이프 페인팅 원데이 클래스",
    description: "그림을 전혀 못 그려도 걱정 없어요! 텍스처가 살아있는 모델링 페이스트와 아크릴 물감으로 감성 캔버스 유화풍 작품을 완성합니다.",
    category: "class",
    region: "서울",
    price: 48000,
    rating: 4.89,
    reviewCount: 33,
    hostId: "host-001",
    hostName: "최민수 서양화가",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80",
    duration: "2시간",
    maxParticipants: 6,
    availableDates: ["2026-10-02", "2026-10-06", "2026-10-08"],
    timeSlots: ["13:00", "16:00", "19:00"],
    location: "서울 마포구 와우산로 29길 12 3층",
    includes: ["F3 정방형 캔버스", "아크릴 및 페이스트 재료 무제한", "작품 포장 및 비닐 쇼핑백"],
    refundPolicy: "체험 2일 전 100% 환불, 당일 취소 불가",
    status: "published",
    visibility: "public",
    internalNote: "화방넷 재료 공동구매 할인 적용. 물감 소모량 점검.",
    hostEmail: "hongdae.art@ateliernest.com",
    privateMemo: "화실 보증금 3000/월세 180 임대차 계약서 갱신일 2026-12"
  },
  {
    id: "exp-014",
    title: "종로 플라워 센터피스 & 프렌치 부케 플라워 클래스",
    description: "생화 시장에서 당일 새벽 공수한 싱싱한 계절 꽃들로 나만의 화사한 식탁 센터피스나 프렌치 무드 꽃다발을 제작합니다.",
    category: "class",
    region: "서울",
    price: 58000,
    rating: 4.92,
    reviewCount: 27,
    hostId: "host-002",
    hostName: "정지원 플로리스트",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80",
    duration: "1시간 50분",
    maxParticipants: 5,
    availableDates: ["2026-10-03", "2026-10-05", "2026-10-09"],
    timeSlots: ["11:30", "15:00"],
    location: "서울 종로구 율곡로 84 1층 플로랄스튜디오",
    includes: ["제철 생화 소재 일체", "유리 화병 또는 플로랄 폼 화기", "플라워 쇼핑백 & 엽서"],
    refundPolicy: "생화 주문 특성상 3일 전까지만 100% 환불 가능",
    status: "published",
    visibility: "public",
    internalNote: "양재 꽃시장 매주 화/금 새벽 사입 (꽃값 시세 변동 주의).",
    hostEmail: "flower.jiwon@botanicnest.com",
    privateMemo: "도매 거래처 번호: 양재화훼 142호 민들레꽃방 010-4455-8899"
  },
  {
    id: "exp-015",
    title: "부산 수영만 VIP 요트 선셋 프라이빗 투어 (비공개 VIP 전용)",
    description: "수영만 요트경기장에서 출발하여 광안대교와 마린시티의 황홀한 오션뷰를 프라이빗 요트로 단독 항해하는 럭셔리 이벤트입니다.",
    category: "tour",
    region: "부산",
    price: 250000,
    rating: 4.99,
    reviewCount: 18,
    hostId: "host-001",
    hostName: "최민수 캡틴",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=80",
    duration: "1시간 30분",
    maxParticipants: 10,
    availableDates: ["2026-10-01", "2026-10-04", "2026-10-07"],
    timeSlots: ["17:00", "19:00"],
    location: "부산 해운대구 해운대해변로 84 수영만 요트경기장 본관 204호",
    includes: ["프라이빗 럭셔리 요트 단독 대관", "모에샹동 샴페인 1병 & 프리미엄 카나페", "선상 폭죽놀이 이벤트"],
    refundPolicy: "출항 7일 전 100% 환불, 기상 악화(풍랑주의보) 시 전액 환불",
    status: "private",
    visibility: "private",
    internalNote: "VIP 기업회원 및 프라이빗 바우처 소지자 대상 비공개 상품. 요트 정박세 및 선장 인건비 1회당 12만원.",
    hostEmail: "captain.vip.yacht@privatenest.com",
    privateMemo: "선박 등록번호: BUSAN-YACHT-7709, 선장 비상 위성전화 0130-998-1122"
  }
];

let reservations = [
  {
    id: "res-101",
    bookingCode: "TN-202610-101",
    userId: "user-001",
    userName: "이지우",
    userPhone: "010-3491-8821",
    experienceId: "exp-001",
    experienceTitle: "서울 야경 감성 스냅 사진 투어 & 히든 루프탑",
    category: "tour",
    region: "서울",
    date: "2026-10-01",
    time: "19:00",
    participants: 2,
    basePrice: 45000,
    totalPrice: 90000,
    couponCode: null,
    discountAmount: 0,
    status: "confirmed",
    createdAt: "2026-09-20T14:30:00Z"
  },
  {
    id: "res-102",
    bookingCode: "TN-202610-102",
    userId: "user-001",
    userName: "이지우",
    userPhone: "010-3491-8821",
    experienceId: "exp-002",
    experienceTitle: "성수동 감성 물레 도자기 원데이 클래스",
    category: "class",
    region: "서울",
    date: "2026-09-15",
    time: "14:00",
    participants: 1,
    basePrice: 65000,
    totalPrice: 65000,
    couponCode: null,
    discountAmount: 0,
    status: "completed",
    createdAt: "2026-09-10T11:20:00Z"
  },
  {
    id: "res-103",
    bookingCode: "TN-202610-103",
    userId: "user-001",
    userName: "이지우",
    userPhone: "010-3491-8821",
    experienceId: "exp-003",
    experienceTitle: "부산 해운대 선셋 서핑 & 비치 플로우",
    category: "activity",
    region: "부산",
    date: "2026-09-18",
    time: "16:30",
    participants: 2,
    basePrice: 55000,
    totalPrice: 110000,
    couponCode: null,
    discountAmount: 0,
    status: "cancelled",
    cancelReason: "개인 일정 변경으로 인한 사전 취소",
    cancelledAt: "2026-09-16T18:00:00Z",
    createdAt: "2026-09-12T09:15:00Z"
  },
  {
    id: "res-104",
    bookingCode: "TN-202610-104",
    userId: "user-001",
    userName: "이지우",
    userPhone: "010-3491-8821",
    experienceId: "exp-005",
    experienceTitle: "전통 명주 빚기 & 5종 전통주 테이스팅 클래스",
    category: "class",
    region: "서울",
    date: "2026-10-04",
    time: "18:00",
    participants: 2,
    basePrice: 70000,
    totalPrice: 140000,
    couponCode: null,
    discountAmount: 0,
    status: "pending",
    createdAt: "2026-09-25T16:45:00Z"
  },
  {
    id: "res-105",
    bookingCode: "TN-202610-105",
    userId: "user-002",
    userName: "김민지",
    userPhone: "010-8912-4412",
    experienceId: "exp-004",
    experienceTitle: "제주 비밀의 숲 & 따라비오름 프라이빗 트레킹",
    category: "tour",
    region: "제주",
    date: "2026-10-02",
    time: "09:00",
    participants: 2,
    basePrice: 49000,
    totalPrice: 88200,
    couponCode: "WELCOME10",
    discountAmount: 9800,
    status: "confirmed",
    createdAt: "2026-09-22T10:00:00Z"
  },
  {
    id: "res-106",
    bookingCode: "TN-202610-106",
    userId: "user-002",
    userName: "김민지",
    userPhone: "010-8912-4412",
    experienceId: "exp-006",
    experienceTitle: "한강 선셋 카약 투어 & 야간 패들링",
    category: "activity",
    region: "서울",
    date: "2026-09-14",
    time: "17:30",
    participants: 1,
    basePrice: 38000,
    totalPrice: 38000,
    couponCode: null,
    discountAmount: 0,
    status: "completed",
    createdAt: "2026-09-08T15:20:00Z"
  },
  {
    id: "res-107",
    bookingCode: "TN-202610-107",
    userId: "user-002",
    userName: "김민지",
    userPhone: "010-8912-4412",
    experienceId: "exp-007",
    experienceTitle: "성수 프랑스 버터 스콘 & 마들렌 베이킹 클래스",
    category: "class",
    region: "서울",
    date: "2026-09-20",
    time: "14:30",
    participants: 2,
    basePrice: 68000,
    totalPrice: 136000,
    couponCode: null,
    discountAmount: 0,
    status: "cancelled",
    cancelReason: "태풍 및 우천 예보로 인한 취소",
    cancelledAt: "2026-09-19T11:00:00Z",
    createdAt: "2026-09-15T12:10:00Z"
  },
  {
    id: "res-108",
    bookingCode: "TN-202610-108",
    userId: "user-003",
    userName: "박동훈",
    userPhone: "010-4491-7719",
    experienceId: "exp-008",
    experienceTitle: "북촌 한옥마을 다도 & 전통 화과자 만들기 체험",
    category: "class",
    region: "서울",
    date: "2026-09-10",
    time: "14:00",
    participants: 2,
    basePrice: 52000,
    totalPrice: 104000,
    couponCode: null,
    discountAmount: 0,
    status: "completed",
    createdAt: "2026-09-01T13:00:00Z"
  },
  {
    id: "res-109",
    bookingCode: "TN-202610-109",
    userId: "user-003",
    userName: "박동훈",
    userPhone: "010-4491-7719",
    experienceId: "exp-009",
    experienceTitle: "가평 잣나무 숲속 감성 글램핑 & 바비큐 디너",
    category: "activity",
    region: "경기",
    date: "2026-10-05",
    time: "16:00",
    participants: 3,
    basePrice: 120000,
    totalPrice: 360000,
    couponCode: null,
    discountAmount: 0,
    status: "confirmed",
    createdAt: "2026-09-24T08:30:00Z"
  },
  {
    id: "res-110",
    bookingCode: "TN-202610-110",
    userId: "user-003",
    userName: "박동훈",
    userPhone: "010-4491-7719",
    experienceId: "exp-010",
    experienceTitle: "강릉 안목해변 오션뷰 스페셜티 커피 드립 클래스",
    category: "class",
    region: "강원",
    date: "2026-09-17",
    time: "15:30",
    participants: 1,
    basePrice: 42000,
    totalPrice: 42000,
    couponCode: null,
    discountAmount: 0,
    status: "cancelled",
    cancelReason: "출장 일정 중복 취소",
    cancelledAt: "2026-09-15T10:00:00Z",
    createdAt: "2026-09-11T17:20:00Z"
  },
  {
    id: "res-111",
    bookingCode: "TN-202610-111",
    userId: "user-001",
    userName: "이지우",
    userPhone: "010-3491-8821",
    experienceId: "exp-011",
    experienceTitle: "제주 애월 해녀와 함께하는 스노클링 & 해초 채취 체험",
    category: "activity",
    region: "제주",
    date: "2026-10-07",
    time: "10:30",
    participants: 2,
    basePrice: 60000,
    totalPrice: 120000,
    couponCode: null,
    discountAmount: 0,
    status: "pending",
    createdAt: "2026-09-26T14:10:00Z"
  },
  {
    id: "res-112",
    bookingCode: "TN-202610-112",
    userId: "user-002",
    userName: "김민지",
    userPhone: "010-8912-4412",
    experienceId: "exp-012",
    experienceTitle: "경주 역사 유적 달빛 야경 투어 & 청사초롱 산책",
    category: "tour",
    region: "경북",
    date: "2026-09-19",
    time: "19:30",
    participants: 2,
    basePrice: 32000,
    totalPrice: 64000,
    couponCode: null,
    discountAmount: 0,
    status: "completed",
    createdAt: "2026-09-13T19:00:00Z"
  }
];

const coupons = [
  {
    id: "coupon-001",
    code: "WELCOME10",
    name: "신규 가입 웰컴 10% 할인 쿠폰",
    discountType: "percent",
    discountValue: 10,
    minimumAmount: 50000,
    maxDiscount: 20000,
    category: "all",
    validUntil: "2026-12-31",
    description: "5만원 이상 결제 시 10% 할인 (최대 2만원)"
  },
  {
    id: "coupon-002",
    code: "FIRST20",
    name: "첫 예약 VIP 20% 할인 쿠폰",
    discountType: "percent",
    discountValue: 20,
    minimumAmount: 100000,
    maxDiscount: 30000,
    category: "all",
    validUntil: "2026-11-30",
    description: "10만원 이상 결제 시 20% 특별 할인 (최대 3만원)"
  },
  {
    id: "coupon-003",
    code: "WEEKEND15",
    name: "주말 액티비티/투어 전용 15% 쿠폰",
    discountType: "percent",
    discountValue: 15,
    minimumAmount: 60000,
    maxDiscount: 15000,
    category: "tour",
    validUntil: "2026-10-31",
    description: "투어 카테고리 6만원 이상 결제 시 15% 할인"
  },
  {
    id: "coupon-004",
    code: "CLASS10",
    name: "원데이 클래스 10,000원 즉시 할인 쿠폰",
    discountType: "fixed",
    discountValue: 10000,
    minimumAmount: 40000,
    maxDiscount: 10000,
    category: "class",
    validUntil: "2026-12-15",
    description: "클래스 카테고리 4만원 이상 결제 시 10,000원 즉시 할인"
  }
];

let reviews = [
  {
    id: "rev-001",
    reservationId: "res-102",
    experienceId: "exp-002",
    experienceTitle: "성수동 감성 물레 도자기 원데이 클래스",
    userId: "user-001",
    userName: "이지우",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "선생님이 물레 기초부터 정말 친절하게 알려주셔서 똥손인데도 예쁜 화병을 완성했어요! 성수동 데이트 코스로 강력 추천합니다.",
    createdAt: "2026-09-16T10:00:00Z"
  },
  {
    id: "rev-002",
    reservationId: "res-106",
    experienceId: "exp-006",
    experienceTitle: "한강 선셋 카약 투어 & 야간 패들링",
    userId: "user-002",
    userName: "김민지",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "노을 지는 한강 한가운데서 카약 타는 기분은 정말 잊지 못할 추억이에요. 안전요원분들이 사진도 멋지게 남겨주셨어요!",
    createdAt: "2026-09-15T09:30:00Z"
  },
  {
    id: "rev-003",
    reservationId: "res-108",
    experienceId: "exp-008",
    experienceTitle: "북촌 한옥마을 다도 & 전통 화과자 만들기 체험",
    userId: "user-003",
    userName: "박동훈",
    userAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "부모님 모시고 다녀왔는데 한옥 풍경도 너무 아늑하고 화과자도 맛있어서 온 가족이 대만족했습니다.",
    createdAt: "2026-09-11T16:20:00Z"
  },
  {
    id: "rev-004",
    reservationId: "res-112",
    experienceId: "exp-012",
    experienceTitle: "경주 역사 유적 달빛 야경 투어 & 청사초롱 산책",
    userId: "user-002",
    userName: "김민지",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "해설사님 입담이 너무 좋으셔서 2시간이 순식간에 지나갔어요. 청사초롱 들고 걷는 동궁과 월지는 환상적이었습니다.",
    createdAt: "2026-09-20T11:00:00Z"
  }
];

let wishlists = [
  { userId: "user-001", experienceId: "exp-003" },
  { userId: "user-001", experienceId: "exp-004" },
  { userId: "user-001", experienceId: "exp-009" },
  { userId: "user-002", experienceId: "exp-001" },
  { userId: "user-003", experienceId: "exp-005" }
];

let messages = [
  {
    id: "msg-001",
    conversationId: "conv-001",
    senderId: "host-001",
    senderName: "최민수 포토그래퍼",
    receiverId: "user-001",
    receiverName: "이지우",
    experienceId: "exp-001",
    experienceTitle: "서울 야경 감성 스냅 사진 투어",
    content: "안녕하세요 지우님! 10월 1일 예약 확인되었습니다. 낙산공원 입구 편의점 앞에서 18:55까지 와주시면 됩니다.",
    createdAt: "2026-09-20T15:00:00Z",
    read: true
  },
  {
    id: "msg-002",
    conversationId: "conv-001",
    senderId: "user-001",
    senderName: "이지우",
    receiverId: "host-001",
    receiverName: "최민수 포토그래퍼",
    experienceId: "exp-001",
    content: "네 작가님! 혹시 의상은 밝은 톤이 사진에 더 잘 나올까요?",
    createdAt: "2026-09-20T15:15:00Z",
    read: true
  },
  {
    id: "msg-003",
    conversationId: "conv-001",
    senderId: "host-001",
    senderName: "최민수 포토그래퍼",
    receiverId: "user-001",
    receiverName: "이지우",
    experienceId: "exp-001",
    content: "아이보리나 베이지 계열 원피스나 셔츠가 야경 조명과 가장 예쁘게 어우러집니다 :)",
    createdAt: "2026-09-20T15:20:00Z",
    read: false
  },
  {
    id: "msg-004",
    conversationId: "conv-002",
    senderId: "host-002",
    senderName: "정지원 도예가",
    receiverId: "user-001",
    receiverName: "이지우",
    experienceId: "exp-002",
    experienceTitle: "성수동 물레 도자기 클래스",
    content: "지우님, 빚으신 화병 가마 소성이 완료되어 오늘 우체국 택배로 발송해 드렸습니다!",
    createdAt: "2026-09-22T14:00:00Z",
    read: true
  }
];

let notifications = [
  {
    id: "notif-001",
    userId: "user-001",
    title: "예약 확정 안내",
    message: "'서울 야경 감성 스냅 사진 투어' 예약이 확정되었습니다.",
    type: "reservation",
    link: "/reservations/res-101",
    read: false,
    createdAt: "2026-09-20T14:31:00Z"
  },
  {
    id: "notif-002",
    userId: "user-001",
    title: "새로운 호스트 메시지",
    message: "최민수 포토그래퍼님으로부터 새로운 메시지가 도착했습니다.",
    type: "message",
    link: "/messages",
    read: false,
    createdAt: "2026-09-20T15:20:00Z"
  },
  {
    id: "notif-003",
    userId: "user-001",
    title: "가을 시즌 한정 10% 쿠폰 지급",
    message: "가을 나들이를 위한 'WELCOME10' 쿠폰이 발급되었습니다.",
    type: "coupon",
    link: "/profile",
    read: true,
    createdAt: "2026-09-18T09:00:00Z"
  },
  {
    id: "notif-004",
    userId: "user-001",
    title: "작품 발송 완료",
    message: "'성수동 도자기 원데이 클래스'에서 제작한 작품이 발송되었습니다.",
    type: "reservation",
    link: "/reservations/res-102",
    read: true,
    createdAt: "2026-09-22T14:05:00Z"
  }
];

// ==========================================
// API Routes
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: "TripNest" });
});

// Users
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/current', (req, res) => {
  const userId = req.headers['x-user-id'] || 'user-001';
  const user = users.find(u => u.id === userId) || users[0];
  res.json(user);
});

// Experiences List
app.get('/api/experiences', (req, res) => {
  const { keyword, region, category, minPrice, maxPrice, rating, sort, includePrivate } = req.query;

  let result = [...experiences];

  if (includePrivate !== 'true') {
    result = result.filter(e => e.visibility !== 'private' && e.status === 'published');
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(e =>
      e.title.toLowerCase().includes(kw) ||
      e.description.toLowerCase().includes(kw) ||
      e.region.toLowerCase().includes(kw) ||
      e.location.toLowerCase().includes(kw)
    );
  }

  if (region && region !== 'all') {
    result = result.filter(e => e.region === region);
  }

  if (category && category !== 'all') {
    result = result.filter(e => e.category === category);
  }

  if (minPrice) {
    result = result.filter(e => e.price >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter(e => e.price <= Number(maxPrice));
  }

  if (rating) {
    result = result.filter(e => e.rating >= Number(rating));
  }

  if (sort === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'reviews') {
    result.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  res.json(result);
});

// Experience Detail (SEC-395: Excessive Data Exposure)
app.get('/api/experiences/:id', (req, res) => {
  const exp = experiences.find(e => e.id === req.params.id);
  if (!exp) {
    return res.status(404).json({ error: "체험을 찾을 수 없습니다." });
  }

  // INTENTIONAL BACKEND BUG: site047-SEC-395
  // The server returns the raw internal experience object containing internal notes, private memos,
  // and internal host email addresses directly in the public detail API response.
  res.setHeader('X-Bug-Triggered', 'site047-SEC-395');
  res.json({
    ...exp,
    _bug: {
      bugId: 'site047-SEC-395',
      secId: 'SEC-395',
      category: 'information-disclosure',
      family: 'excessive-data-exposure',
      name: '비공개 이벤트 정보 노출 (Excessive Data Exposure)',
      description: '체험 상세 API 응답 객체에 내부 정산 메모(internalNote, privateMemo) 및 비공개 연락망이 필터링 없이 그대로 포함되어 반환되었습니다.'
    }
  });
});

// Host Create Experience
app.post('/api/experiences', (req, res) => {
  const { title, description, category, region, price, location, duration, maxParticipants, image, timeSlots, availableDates, includes, refundPolicy, visibility } = req.body;
  const userId = req.headers['x-user-id'] || 'host-001';
  const user = users.find(u => u.id === userId) || users[3];

  const newExp = {
    id: `exp-${String(experiences.length + 1).padStart(3, '0')}`,
    title: title || "새로운 체험",
    description: description || "",
    category: category || "class",
    region: region || "서울",
    price: Number(price) || 50000,
    rating: 5.0,
    reviewCount: 0,
    hostId: user.id,
    hostName: user.name,
    hostAvatar: user.avatar,
    image: image || "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop&q=80",
    duration: duration || "2시간",
    maxParticipants: Number(maxParticipants) || 6,
    availableDates: availableDates || ["2026-10-10", "2026-10-12"],
    timeSlots: timeSlots || ["14:00", "17:00"],
    location: location || "서울 성동구",
    includes: includes || ["기본 재료", "음료 제공"],
    refundPolicy: refundPolicy || "체험 2일 전 100% 환불",
    status: "published",
    visibility: visibility || "public",
    internalNote: "신규 호스트 등록 체험 (검수 대기 완료)",
    hostEmail: user.email,
    privateMemo: "호스트 정산용 기본 계좌 등록 필요"
  };

  experiences.unshift(newExp);
  res.status(201).json(newExp);
});

// Host Update Experience
app.put('/api/experiences/:id', (req, res) => {
  const expIndex = experiences.findIndex(e => e.id === req.params.id);
  if (expIndex === -1) {
    return res.status(404).json({ error: "체험을 찾을 수 없습니다." });
  }

  experiences[expIndex] = {
    ...experiences[expIndex],
    ...req.body
  };

  res.json(experiences[expIndex]);
});

// Reservations List
app.get('/api/reservations', (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'];
  const hostId = req.query.hostId;
  const status = req.query.status;

  let list = [...reservations];

  if (userId) {
    list = list.filter(r => r.userId === userId);
  }

  if (hostId) {
    const hostExpIds = experiences.filter(e => e.hostId === hostId).map(e => e.id);
    list = list.filter(r => hostExpIds.includes(r.experienceId));
  }

  if (status && status !== 'all') {
    list = list.filter(r => r.status === status);
  }

  res.json(list);
});

// Reservation Detail
app.get('/api/reservations/:id', (req, res) => {
  const reservation = reservations.find(r => r.id === req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: "예약 정보를 찾을 수 없습니다." });
  }
  res.json(reservation);
});

// Create Reservation (SEC-391: Price Validation Issue)
app.post('/api/reservations', (req, res) => {
  const { experienceId, date, time, participants, totalPrice, couponCode, discountAmount, customPrice } = req.body;
  const userId = req.headers['x-user-id'] || req.body.userId || 'user-001';
  const user = users.find(u => u.id === userId) || users[0];

  const experience = experiences.find(e => e.id === experienceId);
  if (!experience) {
    return res.status(404).json({ error: "체험 상품을 찾을 수 없습니다." });
  }

  const participantCount = Number(participants) || 1;

  // INTENTIONAL BACKEND BUG: site047-SEC-391
  // The server directly trusts and assigns client-supplied totalPrice/customPrice without recalculating
  // (experience.price * participantCount - discountAmount) to verify price integrity.
  const finalPrice = totalPrice !== undefined ? Number(totalPrice) : (customPrice !== undefined ? Number(customPrice) : experience.price * participantCount);

  const newReservation = {
    id: `res-${String(reservations.length + 101)}`,
    bookingCode: `TN-202610-${String(reservations.length + 101)}`,
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    experienceId: experience.id,
    experienceTitle: experience.title,
    category: experience.category,
    region: experience.region,
    date: date || experience.availableDates[0],
    time: time || experience.timeSlots[0],
    participants: participantCount,
    basePrice: experience.price,
    totalPrice: finalPrice,
    couponCode: couponCode || null,
    discountAmount: Number(discountAmount) || 0,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  reservations.unshift(newReservation);

  // Add system notification for user
  notifications.unshift({
    id: `notif-${String(notifications.length + 1).padStart(3, '0')}`,
    userId: user.id,
    title: "새로운 예약 완료",
    message: `'${experience.title}' 예약이 정상 접수되었습니다.`,
    type: "reservation",
    link: `/reservations/${newReservation.id}`,
    read: false,
    createdAt: new Date().toISOString()
  });

  res.setHeader('X-Bug-Triggered', 'site047-SEC-391');
  res.status(201).json({
    ...newReservation,
    _bug: {
      bugId: 'site047-SEC-391',
      secId: 'SEC-391',
      category: 'integrity',
      family: 'price-validation',
      name: '예약 인원 변경 후 서버 가격 재검증 누락 (Price Validation)',
      description: `서버가 참가 인원(${participantCount}명)에 따른 가격 재계산 없이 클라이언트 전달 결제금액(${finalPrice.toLocaleString()}원)을 그대로 승인하여 예약을 등록했습니다.`
    }
  });
});

// Update / Change Reservation (SEC-392: Privilege Boundary / Ownership Validation Missing)
app.patch('/api/reservations/:id', (req, res) => {
  const reservation = reservations.find(r => r.id === req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: "예약 내역을 찾을 수 없습니다." });
  }

  // INTENTIONAL BACKEND BUG: site047-SEC-392
  // Missing authorization check: The server does NOT check if the requesting user (req.headers['x-user-id'])
  // actually owns this reservation (reservation.userId). Any user can modify another user's reservation.
  const { date, time, participants } = req.body;

  if (date) reservation.date = date;
  if (time) reservation.time = time;
  if (participants) reservation.participants = Number(participants);
  reservation.updatedAt = new Date().toISOString();

  res.setHeader('X-Bug-Triggered', 'site047-SEC-392');
  res.json({
    ...reservation,
    _bug: {
      bugId: 'site047-SEC-392',
      secId: 'SEC-392',
      category: 'authorization',
      family: 'privilege-boundary',
      name: '예약 변경 시 소유권 권한 검증 누락 (Privilege Boundary)',
      description: `서버가 요청자(${req.headers['x-user-id'] || 'user'})와 예약 소유자(${reservation.userId})의 일치 여부를 검증하지 않고 예약 일정(${reservation.date} ${reservation.time}) 수정을 완료했습니다.`
    }
  });
});

// Cancel Reservation
app.post('/api/reservations/:id/cancel', (req, res) => {
  const reservation = reservations.find(r => r.id === req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: "예약 정보를 찾을 수 없습니다." });
  }

  reservation.status = "cancelled";
  reservation.cancelReason = req.body.reason || "사용자 요청으로 인한 예약 취소";
  reservation.cancelledAt = new Date().toISOString();

  res.json({ message: "예약이 성공적으로 취소되었습니다.", reservation });
});

// Coupons List
app.get('/api/coupons', (req, res) => {
  res.json(coupons);
});

// Apply Coupon (SEC-393: Coupon Condition Validation Missing)
app.post('/api/coupons/apply', (req, res) => {
  const { couponCode, experienceId, subtotal, category } = req.body;

  const coupon = coupons.find(c => c.code.toUpperCase() === (couponCode || '').toUpperCase().trim());
  if (!coupon) {
    return res.status(404).json({ error: "유효하지 않은 쿠폰 코드입니다." });
  }

  const currentSubtotal = Number(subtotal) || 0;

  // INTENTIONAL BACKEND BUG: site047-SEC-393
  // The server accepts the coupon application and calculates/returns discount without strictly enforcing
  // minimumAmount checks, category matching, or expiration date validation on the backend.
  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = Math.round((currentSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue;
  }

  if (discount > currentSubtotal) {
    discount = currentSubtotal;
  }

  const finalPrice = Math.max(0, currentSubtotal - discount);

  res.setHeader('X-Bug-Triggered', 'site047-SEC-393');
  res.json({
    ok: true,
    coupon: coupon,
    discountAmount: discount,
    subtotal: currentSubtotal,
    finalPrice: finalPrice,
    message: `${coupon.name}이 성공적으로 적용되었습니다.`,
    _bug: {
      bugId: 'site047-SEC-393',
      secId: 'SEC-393',
      category: 'business-logic',
      family: 'coupon-validation',
      name: '쿠폰 적용 조건 검증 누락 (Coupon Validation)',
      description: `서버가 최소 주문금액(${coupon.minimumAmount?.toLocaleString()}원) 또는 적용 카테고리(${coupon.category}) 제약 조건을 엄격히 검증하지 않고 쿠폰 할인(${discount.toLocaleString()}원)을 적용했습니다.`
    }
  });
});

// Reviews List
app.get('/api/reviews', (req, res) => {
  const { experienceId, userId } = req.query;
  let list = [...reviews];

  if (experienceId) {
    list = list.filter(r => r.experienceId === experienceId);
  }

  if (userId) {
    list = list.filter(r => r.userId === userId);
  }

  res.json(list);
});

// Create Review (SEC-394: State Validation Missing - Reviews on Cancelled Bookings)
app.post('/api/reviews', (req, res) => {
  const { reservationId, rating, comment } = req.body;
  const userId = req.headers['x-user-id'] || req.body.userId || 'user-001';
  const user = users.find(u => u.id === userId) || users[0];

  const reservation = reservations.find(r => r.id === reservationId);
  if (!reservation) {
    return res.status(404).json({ error: "예약 내역을 찾을 수 없습니다." });
  }

  // INTENTIONAL BACKEND BUG: site047-SEC-394
  // The server does NOT check whether reservation.status === 'completed'.
  // It allows creating reviews even if the reservation status is 'cancelled' or 'pending'.
  const newReview = {
    id: `rev-${String(reviews.length + 1).padStart(3, '0')}`,
    reservationId: reservation.id,
    experienceId: reservation.experienceId,
    experienceTitle: reservation.experienceTitle,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    rating: Number(rating) || 5,
    comment: comment || "만족스러운 체험이었습니다.",
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);

  // Update experience review count & rating
  const exp = experiences.find(e => e.id === reservation.experienceId);
  if (exp) {
    exp.reviewCount += 1;
    const allExpReviews = reviews.filter(r => r.experienceId === exp.id);
    const avg = allExpReviews.reduce((sum, r) => sum + r.rating, 0) / allExpReviews.length;
    exp.rating = Number(avg.toFixed(2));
  }

  if (reservation.status === 'cancelled' || reservation.status !== 'completed') {
    res.setHeader('X-Bug-Triggered', 'site047-SEC-394');
  }

  res.status(201).json({
    ...newReview,
    _bug: {
      bugId: 'site047-SEC-394',
      secId: 'SEC-394',
      category: 'business-logic',
      family: 'state-validation',
      name: '취소/미완료 예약의 리뷰 작성 가능 (State Validation)',
      description: `예약 상태가 '${reservation.status}'인 건에 대해 실제 이용 완료('completed') 검증 없이 리뷰 작성을 수락하고 평점에 반영했습니다.`
    }
  });
});

// Wishlist
app.get('/api/wishlist', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'user-001';
  const userWishes = wishlists.filter(w => w.userId === userId);
  const wishExpIds = userWishes.map(w => w.experienceId);
  const result = experiences.filter(e => wishExpIds.includes(e.id));
  res.json(result);
});

app.post('/api/wishlist', (req, res) => {
  const { experienceId } = req.body;
  const userId = req.headers['x-user-id'] || req.body.userId || 'user-001';

  const exists = wishlists.some(w => w.userId === userId && w.experienceId === experienceId);
  if (!exists) {
    wishlists.push({ userId, experienceId });
  }

  res.json({ ok: true, message: "찜 목록에 추가되었습니다." });
});

app.delete('/api/wishlist/:experienceId', (req, res) => {
  const { experienceId } = req.params;
  const userId = req.headers['x-user-id'] || req.query.userId || 'user-001';

  wishlists = wishlists.filter(w => !(w.userId === userId && w.experienceId === experienceId));
  res.json({ ok: true, message: "찜 목록에서 삭제되었습니다." });
});

// Messages
app.get('/api/messages', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'user-001';
  const list = messages.filter(m => m.senderId === userId || m.receiverId === userId);
  res.json(list);
});

app.post('/api/messages', (req, res) => {
  const { receiverId, experienceId, content } = req.body;
  const userId = req.headers['x-user-id'] || req.body.senderId || 'user-001';
  const sender = users.find(u => u.id === userId) || users[0];
  const receiver = users.find(u => u.id === receiverId) || users[3];
  const exp = experiences.find(e => e.id === experienceId);

  const newMsg = {
    id: `msg-${String(messages.length + 1).padStart(3, '0')}`,
    conversationId: `conv-${sender.id}-${receiver.id}`,
    senderId: sender.id,
    senderName: sender.name,
    receiverId: receiver.id,
    receiverName: receiver.name,
    experienceId: exp ? exp.id : null,
    experienceTitle: exp ? exp.title : "",
    content: content || "",
    createdAt: new Date().toISOString(),
    read: false
  };

  messages.push(newMsg);
  res.status(201).json(newMsg);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'user-001';
  const list = notifications.filter(n => n.userId === userId);
  res.json(list);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ ok: true });
});

// ==========================================
// Static File Serving & Fallback Routing
// ==========================================

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TripNest Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
