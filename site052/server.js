import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9951;

app.use(cors());
app.use(express.json());

// Serve static assets from dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ----------------------------------------------------
// Mock In-Memory Database
// ----------------------------------------------------

const branches = [
  { id: 'b-gn', name: '강남 센터', location: '서울 강남구 테헤란로 152', roomsCount: 8, rating: 4.9, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-hd', name: '홍대 센터', location: '서울 마포구 양화로 160', roomsCount: 6, rating: 4.8, image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-ss', name: '성수 센터', location: '서울 성동구 아차산로 68', roomsCount: 7, rating: 4.9, image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-pg', name: '판교 센터', location: '경기 성남시 분당구 판교역로 235', roomsCount: 8, rating: 4.9, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-js', name: '잠실 센터', location: '서울 송파구 올림픽로 300', roomsCount: 5, rating: 4.7, image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-yd', name: '여의도 센터', location: '서울 영등포구 여의대로 108', roomsCount: 7, rating: 4.8, image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-jr', name: '종로 센터', location: '서울 종로구 종로 1', roomsCount: 5, rating: 4.7, image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-sr', name: '서울역 센터', location: '서울 중구 한강대로 405', roomsCount: 6, rating: 4.8, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-hj', name: '합정 센터', location: '서울 마포구 독막로 9', roomsCount: 5, rating: 4.8, image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80' },
  { id: 'b-mg', name: '마곡 센터', location: '서울 강서구 마곡중앙로 161', roomsCount: 6, rating: 4.9, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80' }
];

const roomImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80'
];

let rooms = [
  { id: 'room-001', name: 'Focus Pod A', branch: '강남 센터', type: '1인 집중석', capacity: 1, description: '초집중 몰입을 위한 방음 설계 1인 독립 프라이빗 부스입니다.', facilities: ['Wi-Fi', '콘센트', '조명조절', '인체공학체어'], openTime: '08:00', closeTime: '23:00', rating: 4.9, available: true, image: roomImages[0], rules: '정숙 유지, 음료 취식 가능, 통화 자제' },
  { id: 'room-002', name: 'Study Room 201', branch: '강남 센터', type: '2인 스터디룸', capacity: 2, description: '화이트보드와 보조 모니터가 완비된 2인 최적화 스터디 공간입니다.', facilities: ['Wi-Fi', '화이트보드', '모니터', '콘센트'], openTime: '09:00', closeTime: '22:00', rating: 4.8, available: true, image: roomImages[1], rules: '퇴실 시 화이트보드 클리닝, 외부 음식 반입 제한' },
  { id: 'room-003', name: 'Meeting Studio 4A', branch: '강남 센터', type: '4인 미팅룸', capacity: 4, description: '스타트업 팀 미팅 및 고객 상담에 적합한 유리벽 차음 미팅룸입니다.', facilities: ['Wi-Fi', '모니터', '화이트보드', '화상회의', '콘센트'], openTime: '08:30', closeTime: '22:30', rating: 4.9, available: true, image: roomImages[2], rules: '예약 시간 엄수, 사용 장비 전원 종료' },
  { id: 'room-004', name: 'Boardroom 601', branch: '강남 센터', type: '6인 회의실', capacity: 6, description: '4K 프레젠테이션 디스플레이와 광대역 마이크가 탑재된 중형 회의실입니다.', facilities: ['Wi-Fi', '대형TV', '화상회의', '화이트보드', '콘센트'], openTime: '08:00', closeTime: '23:00', rating: 4.9, available: false, image: roomImages[3], rules: '음식물 섭취 금지, 장비 파손 주의' },
  { id: 'room-005', name: 'Open Lounge Desk 12', branch: '홍대 센터', type: '오픈 데스크', capacity: 1, description: '채광이 좋은 라운지 창가형 핫데스크 좌석입니다.', facilities: ['Wi-Fi', '콘센트', '카페라운지', '무료음료'], openTime: '08:00', closeTime: '24:00', rating: 4.7, available: true, image: roomImages[4], rules: '이어폰 필수 착용, 개인 소지품 분실 유의' },
  { id: 'room-006', name: 'Video Booth Zoom 1', branch: '홍대 센터', type: '화상회의룸', capacity: 1, description: '조명과 고음질 콘덴서 마이크가 세팅된 비대면 면접 및 화상회의 전용룸입니다.', facilities: ['Wi-Fi', '조명시스템', '화상회의', '방음벽', '콘센트'], openTime: '09:00', closeTime: '22:00', rating: 4.9, available: true, image: roomImages[5], rules: '면접 및 웨비나 최적화, 퇴실 전 조명 끄기' },
  { id: 'room-007', name: 'Creator Studio 01', branch: '성수 센터', type: '개인 작업실', capacity: 1, description: '디자이너 및 개발자를 위한 듀얼 모니터 데스크 작업실입니다.', facilities: ['Wi-Fi', '듀얼모니터', '콘센트', '높낮이조절책상'], openTime: '08:00', closeTime: '23:00', rating: 4.9, available: true, image: roomImages[6], rules: '장시간 자리 비움 시 알림' },
  { id: 'room-008', name: 'Team Room 4B', branch: '성수 센터', type: '4인 미팅룸', capacity: 4, description: '인텔리전트 화이트보드와 무선 화면 공유 기능이 있는 미팅룸입니다.', facilities: ['Wi-Fi', '화이트보드', '모니터', '화상회의', '콘센트'], openTime: '09:00', closeTime: '22:00', rating: 4.8, available: true, image: roomImages[7], rules: '기물 파손 시 배상' },
  { id: 'room-009', name: 'Focus Pod B', branch: '판교 센터', type: '1인 집중석', capacity: 1, description: 'IT 엔지니어를 위한 쾌적한 1인 프리미엄 집중석입니다.', facilities: ['Wi-Fi', '콘센트', '에르고체어', '개인사물함'], openTime: '08:00', closeTime: '24:00', rating: 4.9, available: true, image: roomImages[0], rules: '정숙 유지' },
  { id: 'room-010', name: 'Conference Hub 6A', branch: '판교 센터', type: '6인 회의실', capacity: 6, description: '스마트 화상회의 시스템과 초고속 기가비트 네트워크를 갖춘 회의실입니다.', facilities: ['Wi-Fi', '화상회의', '대형TV', '화이트보드', '콘센트'], openTime: '08:00', closeTime: '23:00', rating: 4.9, available: true, image: roomImages[3], rules: '회의 후 환기 필수' },
  { id: 'room-011', name: 'Study Corner 202', branch: '잠실 센터', type: '2인 스터디룸', capacity: 2, description: '아늑한 조명과 방음 부스로 이루어진 2인 과외/스터디 전용룸입니다.', facilities: ['Wi-Fi', '모니터', '화이트보드', '콘센트'], openTime: '09:00', closeTime: '22:00', rating: 4.7, available: true, image: roomImages[1], rules: '퇴실 시 쓰레기 수거' },
  { id: 'room-012', name: 'Open Desk Garden 05', branch: '여의도 센터', type: '오픈 데스크', capacity: 1, description: '통창 너머 도심 뷰를 감상하며 작업할 수 있는 개방형 좌석입니다.', facilities: ['Wi-Fi', '콘센트', '카페라운지', '무료커피'], openTime: '07:30', closeTime: '23:00', rating: 4.8, available: true, image: roomImages[4], rules: '소음 발생 주의' },
  { id: 'room-013', name: 'Exec Meeting 4C', branch: '여의도 센터', type: '4인 미팅룸', capacity: 4, description: '고급스러운 가구와 화상 솔루션을 갖춘 VIP 미팅룸입니다.', facilities: ['Wi-Fi', '모니터', '화상회의', '화이트보드', '콘센트'], openTime: '08:00', closeTime: '22:00', rating: 4.9, available: true, image: roomImages[2], rules: '예약 정시 입실 및 퇴실' },
  { id: 'room-014', name: 'Focus Pod C', branch: '종로 센터', type: '1인 집중석', capacity: 1, description: '독서실 스타일의 프리미엄 칸막이형 1인 집중 부스입니다.', facilities: ['Wi-Fi', '콘센트', '조명조절'], openTime: '08:30', closeTime: '22:30', rating: 4.6, available: true, image: roomImages[0], rules: '타이핑 소음 유의' },
  { id: 'room-015', name: 'Study Lab 203', branch: '종로 센터', type: '2인 스터디룸', capacity: 2, description: '자격증 시험 준비 및 어학 튜터링에 안성맞춤인 룸입니다.', facilities: ['Wi-Fi', '화이트보드', '콘센트', '모니터'], openTime: '09:00', closeTime: '22:00', rating: 4.7, available: false, image: roomImages[1], rules: '음식물 섭취 불가' },
  { id: 'room-016', name: 'Video Booth Zoom 2', branch: '서울역 센터', type: '화상회의룸', capacity: 1, description: '출장 중 긴급한 화상 인터뷰 및 온라인 미팅에 최적화된 룸입니다.', facilities: ['Wi-Fi', '화상회의', '조명시스템', '콘센트'], openTime: '07:00', closeTime: '23:00', rating: 4.8, available: true, image: roomImages[5], rules: '차음벽 보호를 위해 두드림 금지' },
  { id: 'room-017', name: 'Boardroom 602', branch: '서울역 센터', type: '6인 회의실', capacity: 6, description: '지방 출장 고객과 서울 지사 간의 합동 회의에 편리한 회의실입니다.', facilities: ['Wi-Fi', '대형TV', '화상회의', '화이트보드', '콘센트'], openTime: '08:00', closeTime: '22:00', rating: 4.8, available: true, image: roomImages[3], rules: '정리정돈 후 퇴실' },
  { id: 'room-018', name: 'Creator Atelier 02', branch: '합정 센터', type: '개인 작업실', capacity: 1, description: '음악 작곡, 그래픽 작업 등을 위한 감각적인 독립 스튜디오입니다.', facilities: ['Wi-Fi', '듀얼모니터', '방음벽', '콘센트'], openTime: '09:00', closeTime: '24:00', rating: 4.9, available: true, image: roomImages[6], rules: '고출력 스피커 사용 시 문 닫기' },
  { id: 'room-019', name: 'Team Lab 4D', branch: '합정 센터', type: '4인 미팅룸', capacity: 4, description: '창의적인 브레인스토밍을 위한 라운드 테이블 미팅룸입니다.', facilities: ['Wi-Fi', '화이트보드', '모니터', '콘센트'], openTime: '09:00', closeTime: '23:00', rating: 4.7, available: true, image: roomImages[2], rules: '보드마카 캡 닫기' },
  { id: 'room-020', name: 'Open Desk Sky 08', branch: '마곡 센터', type: '오픈 데스크', capacity: 1, description: '넓은 데스크와 쾌적한 공기청정 시스템이 적용된 오픈 좌석입니다.', facilities: ['Wi-Fi', '콘센트', '카페라운지', '무료음료'], openTime: '08:00', closeTime: '23:00', rating: 4.8, available: true, image: roomImages[4], rules: '지정 좌석 외 이동 자제' },
  { id: 'room-021', name: 'Focus Pod D', branch: '마곡 센터', type: '1인 집중석', capacity: 1, description: '연구 개발 문서 작성 및 코딩에 최적화된 1인 큐비클입니다.', facilities: ['Wi-Fi', '콘센트', '인체공학체어'], openTime: '08:00', closeTime: '22:00', rating: 4.9, available: true, image: roomImages[0], rules: '정숙' },
  { id: 'room-022', name: 'Meeting Studio 4E', branch: '마곡 센터', type: '4인 미팅룸', capacity: 4, description: '연구소 및 IT 기업 협업을 위한 스마트 프레젠테이션 룸입니다.', facilities: ['Wi-Fi', '모니터', '화상회의', '화이트보드', '콘센트'], openTime: '08:30', closeTime: '22:30', rating: 4.8, available: true, image: roomImages[2], rules: '케이블 분실 주의' },
  { id: 'room-023', name: 'Conference Hub 6B', branch: '홍대 센터', type: '6인 회의실', capacity: 6, description: '디자인 에이전시 및 기획 회의에 적합한 감각적인 회의 공간입니다.', facilities: ['Wi-Fi', '대형TV', '화이트보드', '화상회의', '콘센트'], openTime: '09:00', closeTime: '23:00', rating: 4.8, available: true, image: roomImages[3], rules: '음료 컵홀더 사용' },
  { id: 'room-024', name: 'Study Room 204', branch: '성수 센터', type: '2인 스터디룸', capacity: 2, description: '소규모 과외 및 프로젝트 페어 프로그래밍 공간입니다.', facilities: ['Wi-Fi', '모니터', '화이트보드', '콘센트'], openTime: '09:00', closeTime: '22:00', rating: 4.7, available: true, image: roomImages[1], rules: '퇴실 시 전등 소등' },
  { id: 'room-025', name: 'Video Booth Zoom 3', branch: '판교 센터', type: '화상회의룸', capacity: 1, description: '글로벌 파트너사 화상 싱크업 미팅 전용 방음 부스입니다.', facilities: ['Wi-Fi', '화상회의', '조명시스템', '방음벽', '콘센트'], openTime: '08:00', closeTime: '24:00', rating: 4.9, available: true, image: roomImages[5], rules: '마이크 볼륨 조절' },
  { id: 'room-026', name: 'Creator Atelier 03', branch: '여의도 센터', type: '개인 작업실', capacity: 1, description: '금융 애널리스트 및 리서처를 위한 다중 모니터 작업 공간입니다.', facilities: ['Wi-Fi', '듀얼모니터', '콘센트', '높낮이조절책상'], openTime: '07:30', closeTime: '23:00', rating: 4.9, available: true, image: roomImages[6], rules: '서류 보안 유의' },
  { id: 'room-027', name: 'Open Desk Central 03', branch: '잠실 센터', type: '오픈 데스크', capacity: 1, description: '넓은 6인 쉐어드 테이블에 분리된 개인 구역 데스크입니다.', facilities: ['Wi-Fi', '콘센트', '무료음료'], openTime: '08:30', closeTime: '22:30', rating: 4.6, available: true, image: roomImages[4], rules: '통화는 폰부스 이용' },
  { id: 'room-028', name: 'Focus Pod E', branch: '합정 센터', type: '1인 집중석', capacity: 1, description: '독립 에어컨 및 조광 스위치가 구비된 프리미엄 1인 부스입니다.', facilities: ['Wi-Fi', '콘센트', '조명조절', '인체공학체어'], openTime: '09:00', closeTime: '23:00', rating: 4.8, available: true, image: roomImages[0], rules: '정숙 유지' },
  { id: 'room-029', name: 'Study Room 205', branch: '마곡 센터', type: '2인 스터디룸', capacity: 2, description: '대학원생 논문 리서치 및 멘토링 세션 전용 스터디룸입니다.', facilities: ['Wi-Fi', '모니터', '화이트보드', '콘센트'], openTime: '09:00', closeTime: '22:00', rating: 4.7, available: true, image: roomImages[1], rules: '장비 손상 주의' },
  { id: 'room-030', name: 'Boardroom 603', branch: '종로 센터', type: '6인 회의실', capacity: 6, description: '클래식한 인테리어와 현대적 스마트 보드가 결합된 6인 회의실입니다.', facilities: ['Wi-Fi', '대형TV', '화이트보드', '화상회의', '콘센트'], openTime: '08:30', closeTime: '22:30', rating: 4.8, available: true, image: roomImages[3], rules: '퇴실 시 에어컨 전원 차단' },
  { id: 'room-031', name: 'Focus Pod F', branch: '성수 센터', type: '1인 집중석', capacity: 1, description: '성수동 카페거리 조망이 가능한 감성적인 1인 집중 포커스룸입니다.', facilities: ['Wi-Fi', '콘센트', '조명조절'], openTime: '08:00', closeTime: '23:00', rating: 4.9, available: true, image: roomImages[0], rules: '조용한 작업 권장' },
  { id: 'room-032', name: 'Meeting Studio 4F', branch: '홍대 센터', type: '4인 미팅룸', capacity: 4, description: '프로젝트 킥오프 및 애자일 스크럼 미팅 전용 공간입니다.', facilities: ['Wi-Fi', '모니터', '화이트보드', '콘센트'], openTime: '09:00', closeTime: '23:00', rating: 4.8, available: true, image: roomImages[2], rules: '시간 엄수' }
];

let favorites = ['room-001', 'room-003', 'room-007'];

let bookings = [
  { id: 'BK-1001', roomId: 'room-001', roomName: 'Focus Pod A', branch: '강남 센터', date: '2026-09-28', startTime: '09:00', endTime: '12:00', attendees: 1, status: '예약 예정', memo: '주간 개발 스프린트 태스크 정리 및 집중 코딩', createdAt: '2026-09-27T08:30:00' },
  { id: 'BK-1002', roomId: 'room-003', roomName: 'Meeting Studio 4A', branch: '강남 센터', date: '2026-09-28', startTime: '14:00', endTime: '16:00', attendees: 4, status: '예약 예정', memo: '신규 프로젝트 디자인 시안 리뷰 미팅', createdAt: '2026-09-26T15:20:00' },
  { id: 'BK-1003', roomId: 'room-005', roomName: 'Open Lounge Desk 12', branch: '홍대 센터', date: '2026-09-27', startTime: '10:00', endTime: '18:00', attendees: 1, status: '이용 중', memo: '개인 블로그 아티클 작성 및 원격 근무', createdAt: '2026-09-27T09:10:00' },
  { id: 'BK-1004', roomId: 'room-007', roomName: 'Creator Studio 01', branch: '성수 센터', date: '2026-09-29', startTime: '13:00', endTime: '17:00', attendees: 1, status: '예약 예정', memo: '모바일 앱 UI 프로토타이핑 작업', createdAt: '2026-09-25T11:00:00' },
  { id: 'BK-1005', roomId: 'room-010', roomName: 'Conference Hub 6A', branch: '판교 센터', date: '2026-09-30', startTime: '10:00', endTime: '12:00', attendees: 5, status: '예약 예정', memo: 'Q4 분기 성과 회고 및 OKR 수립 회의', createdAt: '2026-09-24T17:40:00' },
  { id: 'BK-1006', roomId: 'room-002', roomName: 'Study Room 201', branch: '강남 센터', date: '2026-09-25', startTime: '19:00', endTime: '21:00', attendees: 2, status: '이용 완료', memo: '알고리즘 스터디 8회차', createdAt: '2026-09-23T14:00:00' },
  { id: 'BK-1007', roomId: 'room-006', roomName: 'Video Booth Zoom 1', branch: '홍대 센터', date: '2026-09-24', startTime: '15:00', endTime: '16:00', attendees: 1, status: '이용 완료', memo: '해외 클라이언트 화상 인터뷰', createdAt: '2026-09-22T09:30:00' },
  { id: 'BK-1008', roomId: 'room-012', roomName: 'Open Desk Garden 05', branch: '여의도 센터', date: '2026-09-22', startTime: '09:00', endTime: '18:00', attendees: 1, status: '이용 완료', memo: '금융 데이터 분석 리포트 작성', createdAt: '2026-09-21T08:00:00' },
  { id: 'BK-1009', roomId: 'room-004', roomName: 'Boardroom 601', branch: '강남 센터', date: '2026-09-20', startTime: '14:00', endTime: '17:00', attendees: 6, status: '취소', memo: '내부 일정 변경으로 인한 사전 취소', createdAt: '2026-09-19T10:15:00' },
  { id: 'BK-1010', roomId: 'room-013', roomName: 'Exec Meeting 4C', branch: '여의도 센터', date: '2026-09-18', startTime: '11:00', endTime: '13:00', attendees: 3, status: '이용 완료', memo: '투자 유치 IR 덱 사전 점검', createdAt: '2026-09-17T16:00:00' },
  { id: 'BK-1011', roomId: 'room-016', roomName: 'Video Booth Zoom 2', branch: '서울역 센터', date: '2026-10-01', startTime: '09:00', endTime: '10:30', attendees: 1, status: '예약 예정', memo: '지방 출장 전 원격 미팅 참석', createdAt: '2026-09-26T20:00:00' },
  { id: 'BK-1012', roomId: 'room-018', roomName: 'Creator Atelier 02', branch: '합정 센터', date: '2026-10-02', startTime: '14:00', endTime: '18:00', attendees: 1, status: '예약 예정', memo: '영상 편집 사운드 믹싱 작업', createdAt: '2026-09-26T18:00:00' },
  { id: 'BK-1013', roomId: 'room-008', roomName: 'Team Room 4B', branch: '성수 센터', date: '2026-09-26', startTime: '16:00', endTime: '18:00', attendees: 4, status: '이용 완료', memo: '팝업스토어 공간 기획 회의', createdAt: '2026-09-25T14:20:00' },
  { id: 'BK-1014', roomId: 'room-020', roomName: 'Open Desk Sky 08', branch: '마곡 센터', date: '2026-09-27', startTime: '13:00', endTime: '19:00', attendees: 1, status: '이용 중', memo: '바이오 헬스케어 연구 논문 열람', createdAt: '2026-09-27T12:00:00' },
  { id: 'BK-1015', roomId: 'room-023', roomName: 'Conference Hub 6B', branch: '홍대 센터', date: '2026-10-03', startTime: '15:00', endTime: '18:00', attendees: 6, status: '예약 예정', memo: '크리에이터 네트워크 정기 밋업', createdAt: '2026-09-26T11:30:00' },
  { id: 'BK-1016', roomId: 'room-025', roomName: 'Video Booth Zoom 3', branch: '판교 센터', date: '2026-09-23', startTime: '10:00', endTime: '11:00', attendees: 1, status: '이용 완료', memo: '실리콘밸리 기술 파트너십 콜', createdAt: '2026-09-22T19:00:00' },
  { id: 'BK-1017', roomId: 'room-028', roomName: 'Focus Pod E', branch: '합정 센터', date: '2026-10-04', startTime: '10:00', endTime: '14:00', attendees: 1, status: '예약 예정', memo: '단편 소설 집필 및 교독', createdAt: '2026-09-26T13:10:00' },
  { id: 'BK-1018', roomId: 'room-011', roomName: 'Study Corner 202', branch: '잠실 센터', date: '2026-09-21', startTime: '18:00', endTime: '20:00', attendees: 2, status: '이용 완료', memo: '토익 스피킹 파트너 연습', createdAt: '2026-09-20T10:00:00' },
  { id: 'BK-1019', roomId: 'room-030', roomName: 'Boardroom 603', branch: '종로 센터', date: '2026-10-05', startTime: '14:00', endTime: '17:00', attendees: 6, status: '예약 예정', memo: '법률 자문 및 파트너십 체결 미팅', createdAt: '2026-09-26T16:40:00' },
  { id: 'BK-1020', roomId: 'room-032', roomName: 'Meeting Studio 4F', branch: '홍대 센터', date: '2026-09-19', startTime: '13:00', endTime: '15:00', attendees: 4, status: '취소', memo: '참석자 일정 불일치 취소', createdAt: '2026-09-18T11:00:00' },
  { id: 'BK-1021', roomId: 'room-001', roomName: 'Focus Pod A', branch: '강남 센터', date: '2026-10-06', startTime: '09:00', endTime: '13:00', attendees: 1, status: '예약 예정', memo: '신규 백엔드 아키텍처 다이어그램 작성', createdAt: '2026-09-27T10:00:00' }
];

const notices = [
  { id: 'n-1', title: '강남 센터 4층 포커스 존 방음 설비 강화 안내', date: '2026-09-26', branch: '강남 센터', important: true, content: '더욱 쾌적하고 조용한 몰입 환경을 위해 강남 센터 4층 1인 집중석의 흡음 패널 및 방음 도어 교체 공사가 완료되었습니다. 언제든 편안하게 이용해 주시기 바랍니다.' },
  { id: 'n-2', title: '추석 연휴 기간 지점별 특별 운영 안내', date: '2026-09-24', branch: '전 지점', important: true, content: '다가오는 추석 연휴 기간 동안 전 지점이 정상 24시간 스마트 무인 출입 시스템으로 운영됩니다. 라운지 바 이용 시 비치된 비품 사용 수칙을 준수해 주세요.' },
  { id: 'n-3', title: '홍대/성수 센터 크리에이터 스튜디오 신규 음향 장비 도입', date: '2026-09-20', branch: '홍대 센터', important: false, content: '개인 작업실 및 화상회의룸에 팟캐스트 녹음 및 스트리밍이 가능한 고품질 슈어 마이크와 링라이트가 추가 배치되었습니다.' },
  { id: 'n-4', title: '판교 센터 지하 주차장 전기차 충전 구역 증설 완료', date: '2026-09-15', branch: '판교 센터', important: false, content: '판교 테크원 타워 지하 3층 전기차 완속 충전기 8기가 신규 설치되었습니다. 입주 멤버 대상 주차 등록 혜택도 함께 확인하세요.' },
  { id: 'n-5', title: 'SpaceMate 모바일 예약 알림 및 스마트 키 기능 업그레이드', date: '2026-09-10', branch: '전 지점', important: false, content: '예약 15분 전 카카오 알림톡으로 발송되는 스마트 도어락 임시 핀코드 시스템이 개선되었습니다.' }
];

// Helper to trigger bug info in response headers and response body
function attachBugMetadata(res, bugId, description, severity, endpoint, method, category, family) {
  res.set('X-Bug-Triggered', bugId);
  res.set('Access-Control-Expose-Headers', 'X-Bug-Triggered, X-Bug-Info');
  return {
    id: bugId,
    description,
    severity,
    endpoint,
    method,
    category,
    family
  };
}

// ----------------------------------------------------
// Health check
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SpaceMate',
    site: 'site052'
  });
});

// ----------------------------------------------------
// Branches
// ----------------------------------------------------
app.get('/api/branches', (req, res) => {
  res.json({ success: true, branches });
});

// ----------------------------------------------------
// Rooms List & Search
// ----------------------------------------------------
app.get('/api/rooms', (req, res) => {
  const { branch, type, minCapacity, availableOnly, search, facilities: facilitiesQuery } = req.query;

  let filtered = [...rooms];

  if (branch && branch !== 'all') {
    filtered = filtered.filter(r => r.branch === branch);
  }
  if (type && type !== 'all') {
    filtered = filtered.filter(r => r.type === type);
  }
  if (minCapacity) {
    const cap = parseInt(minCapacity, 10);
    if (!isNaN(cap)) {
      filtered = filtered.filter(r => r.capacity >= cap);
    }
  }
  if (availableOnly === 'true') {
    filtered = filtered.filter(r => r.available);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.branch.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }

  let bugInfo = null;
  // INTENTIONAL BACKEND BUG: site052-SEC-440
  // When facility filter contains specific ghost selection or when client triggers SEC-440
  if (facilitiesQuery) {
    const facList = Array.isArray(facilitiesQuery) ? facilitiesQuery : facilitiesQuery.split(',').map(f => f.trim()).filter(Boolean);
    if (facList.length > 0) {
      filtered = filtered.filter(r => facList.every(f => r.facilities.includes(f)));
    }
    // If request contains ghost facility filter lingering after deselect all
    if (req.headers['x-ghost-filter-active'] === 'true' || facList.includes('화상회의') && req.query.deselectedAll === 'true') {
      bugInfo = attachBugMetadata(
        res,
        'SEC-440',
        '체크박스 그룹에서 전체 선택을 해제한 뒤 개별 항목(화상회의) 상태가 내부 filter state에 잔존하는 오류',
        'medium',
        '/api/rooms',
        'GET',
        'Form Control',
        'checkbox-group-state'
      );
    }
  }

  res.json({
    success: true,
    count: filtered.length,
    rooms: filtered,
    _bug: bugInfo
  });
});

// ----------------------------------------------------
// Room Detail
// ----------------------------------------------------
app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: '공간을 찾을 수 없습니다.' });
  }
  res.json({ success: true, room });
});

// ----------------------------------------------------
// Room Availability (Time Slots)
// ----------------------------------------------------
app.get('/api/rooms/:id/availability', (req, res) => {
  const { id } = req.params;
  const { date, selectedSlots } = req.query;

  const room = rooms.find(r => r.id === id);
  if (!room) {
    return res.status(404).json({ success: false, message: '공간을 찾을 수 없습니다.' });
  }

  // Generate slots from 09:00 to 22:00
  const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  
  // Existing bookings for this room & date
  const dateBookings = bookings.filter(b => b.roomId === id && b.date === date && b.status !== '취소');
  
  const bookedTimes = new Set();
  dateBookings.forEach(b => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    const endHour = parseInt(b.endTime.split(':')[0], 10);
    for (let h = startHour; h < endHour; h++) {
      bookedTimes.add(`${String(h).padStart(2, '0')}:00`);
    }
  });

  const slots = allSlots.map(time => ({
    time,
    available: !bookedTimes.has(time),
    booked: bookedTimes.has(time)
  }));

  let bugInfo = null;
  // INTENTIONAL BACKEND BUG: site052-SEC-436
  // Triggered when client requests availability after changing date while retaining stale time slots
  if (req.headers['x-stale-slot-detected'] === 'true' || (selectedSlots && req.query.dateChanged === 'true')) {
    bugInfo = attachBugMetadata(
      res,
      'SEC-436',
      '날짜 범위 선택 후 시간 슬롯 UI가 이전 날짜의 선택 상태를 그대로 유지하는 오류',
      'medium',
      `/api/rooms/${id}/availability`,
      'GET',
      'UI State',
      'dependent-state'
    );
  }

  res.json({
    success: true,
    roomId: id,
    date,
    slots,
    _bug: bugInfo
  });
});

// ----------------------------------------------------
// Bookings
// ----------------------------------------------------
app.get('/api/bookings', (req, res) => {
  const { status, search } = req.query;
  let list = [...bookings];

  if (status && status !== 'all') {
    list = list.filter(b => b.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b => b.roomName.toLowerCase().includes(q) || b.branch.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
  }

  res.json({ success: true, count: list.length, bookings: list });
});

app.get('/api/bookings/export', (req, res) => {
  // INTENTIONAL BACKEND BUG: site052-SEC-439
  // Header order: 예약번호,공간명,지점,날짜,시작시간,종료시간,인원,상태
  // But actual row values have swapped columns: [startTime, endTime] or [attendees, status] swapped!
  
  const headers = ['예약번호', '공간명', '지점', '날짜', '시작시간', '종료시간', '인원', '상태'];
  
  // Row data deliberately placing status in attendees position and attendees in status position!
  const rows = bookings.map(b => [
    b.id,
    `"${b.roomName}"`,
    `"${b.branch}"`,
    b.date,
    b.endTime,      // Swapped: putting endTime under 시작시간 header
    b.startTime,    // Swapped: putting startTime under 종료시간 header
    `"${b.status}"`,// Swapped: putting status string under 인원 header
    b.attendees     // Swapped: putting attendees number under 상태 header
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const bugInfo = attachBugMetadata(
    res,
    'SEC-439',
    '예약 정보 CSV 내보내기에서 헤더 순서와 실제 데이터 필드(시작시간↔종료시간, 인원↔상태)가 불일치하는 오류',
    'medium',
    '/api/bookings/export',
    'GET',
    'Export',
    'schema-mismatch'
  );

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="spacemate_bookings_export.csv"');
  res.setHeader('X-Bug-Info', encodeURIComponent(JSON.stringify(bugInfo)));
  res.send(csvContent);
});

app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: '예약 내역을 찾을 수 없습니다.' });
  }
  res.json({ success: true, booking });
});

app.post('/api/bookings', (req, res) => {
  const { roomId, date, startTime, endTime, attendees, memo } = req.body;

  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(400).json({ success: false, message: '유효하지 않은 공간입니다.' });
  }

  const newBooking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    roomId: room.id,
    roomName: room.name,
    branch: room.branch,
    date: date || '2026-09-28',
    startTime: startTime || '10:00',
    endTime: endTime || '12:00',
    attendees: parseInt(attendees, 10) || 1,
    status: '예약 예정',
    memo: memo || '',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  res.status(201).json({ success: true, booking: newBooking, message: '성공적으로 예약되었습니다.' });
});

// Edit memo
app.patch('/api/bookings/:id/memo', (req, res) => {
  const { id } = req.params;
  const { memo } = req.body;
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return res.status(404).json({ success: false, message: '예약 내역을 찾을 수 없습니다.' });
  }

  booking.memo = memo;

  let bugInfo = null;
  // INTENTIONAL BACKEND BUG: site052-SEC-437
  // Modal closed with ESC retaining dirty draft value
  if (req.headers['x-draft-residual'] === 'true' || req.query.residualDraft === 'true') {
    bugInfo = attachBugMetadata(
      res,
      'SEC-437',
      '모달에서 ESC 키를 눌러 취소했으나 내부 입력값(draft state)이 폐기되지 않고 남아있는 오류',
      'medium',
      `/api/bookings/${id}/memo`,
      'PATCH',
      'UI Interaction',
      'modal-state'
    );
  }

  res.json({ success: true, booking, _bug: bugInfo, message: '예약 메모가 수정되었습니다.' });
});

// Cancel booking
app.delete('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: '예약을 찾을 수 없습니다.' });
  }
  booking.status = '취소';
  res.json({ success: true, message: '예약이 취소되었습니다.', booking });
});

// ----------------------------------------------------
// Favorites
// ----------------------------------------------------
app.get('/api/favorites', (req, res) => {
  const favRooms = rooms.filter(r => favorites.includes(r.id));
  res.json({ success: true, favorites, rooms: favRooms });
});

app.post('/api/favorites', (req, res) => {
  const { roomId } = req.body;
  
  // INTENTIONAL BACKEND BUG: site052-SEC-438
  // Specific mock failure condition for room-018: return 500 error, client fails to rollback optimistic UI
  if (roomId === 'room-018') {
    const bugInfo = attachBugMetadata(
      res,
      'SEC-438',
      '즐겨찾기 토글의 Optimistic UI 요청 실패 시 원래 상태로 롤백되지 않고 UI 상태 불일치가 유지되는 오류',
      'medium',
      '/api/favorites',
      'POST',
      'Async UI',
      'optimistic-update'
    );
    return res.status(500).json({
      success: false,
      message: '일시적인 서버 동기화 오류로 즐겨찾기 상태를 저장하지 못했습니다.',
      _bug: bugInfo
    });
  }

  if (!favorites.includes(roomId)) {
    favorites.push(roomId);
  }
  res.json({ success: true, favorites });
});

app.delete('/api/favorites/:roomId', (req, res) => {
  const { roomId } = req.params;

  // INTENTIONAL BACKEND BUG: site052-SEC-438
  if (roomId === 'room-018') {
    const bugInfo = attachBugMetadata(
      res,
      'SEC-438',
      '즐겨찾기 토글의 Optimistic UI 요청 실패 시 원래 상태로 롤백되지 않고 UI 상태 불일치가 유지되는 오류',
      'medium',
      `/api/favorites/${roomId}`,
      'DELETE',
      'Async UI',
      'optimistic-update'
    );
    return res.status(500).json({
      success: false,
      message: '즐겨찾기 해제 동기화 실패',
      _bug: bugInfo
    });
  }

  favorites = favorites.filter(id => id !== roomId);
  res.json({ success: true, favorites });
});

// ----------------------------------------------------
// Notices
// ----------------------------------------------------
app.get('/api/notices', (req, res) => {
  res.json({ success: true, notices });
});

app.get('/api/notices/:id', (req, res) => {
  const notice = notices.find(n => n.id === req.params.id);
  if (!notice) {
    return res.status(404).json({ success: false, message: '공지사항을 찾을 수 없습니다.' });
  }
  res.json({ success: true, notice });
});



// SPA Fallback
app.get('*', (req, res) => {
  const indexHtml = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send('SpaceMate Server Running on Port ' + PORT);
  }
});

app.listen(PORT, () => {
  console.log(`[SpaceMate] site052 server listening on port ${PORT}`);
});
