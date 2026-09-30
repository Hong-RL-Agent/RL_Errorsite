import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9947;

app.use(cors({
  exposedHeaders: ['X-Bug-Triggered']
}));
app.use(express.json());

// ==========================================
// In-Memory Database (Mock State)
// ==========================================

let users = [
  {
    id: 1,
    name: "김민지",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    email: "minji.kim@classmate.kr",
    bio: "도예와 베이킹에 관심이 많은 직장인입니다.",
    interests: ["도예", "베이킹", "드로잉"]
  },
  {
    id: 2,
    name: "이주원",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    email: "juwon.lee@classmate.kr",
    bio: "주말마다 사진 출사와 가죽공예 클래스를 찾아다닙니다.",
    interests: ["사진", "공예", "운동"]
  },
  {
    id: 3,
    name: "박서준",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    email: "seojun.park@craftstudio.kr",
    bio: "10년 경력의 도예 공방 운영자이자 원데이 클래스 전문 강사 박서준입니다.",
    interests: ["도예", "공예", "전시"]
  },
  {
    id: 4,
    name: "최유진",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    email: "yujin.choi@bakinglab.kr",
    bio: "프랑스 르 꼬르동 블루 출신 파티시에 최유진입니다.",
    interests: ["베이킹", "디저트", "쿠킹"]
  },
  {
    id: 5,
    name: "정다은",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    email: "daeun.jung@classmate.kr",
    bio: "취미로 요가와 캘리그래피를 배우고 있어요.",
    interests: ["운동", "캘리그래피", "플라워"]
  }
];

let classes = [
  {
    id: 101,
    title: "처음 만나는 나만의 감성 머그컵 빚기",
    category: "도예",
    instructorId: 3,
    instructorName: "박서준 강사",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "서울 성동구 성수동2가 314-1",
    region: "서울 성동구",
    date: "2026-10-03",
    time: "14:00 - 16:00",
    duration: "2시간",
    capacity: 8,
    enrolled: 5,
    status: "open",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
    description: "손으로 흙을 빚어내며 일상의 스트레스를 비우는 힐링 도예 클래스입니다. 나만의 시그니처 머그컵을 만들고 2회 가마 소성 후 완성품을 받아보세요.",
    materials: "점토, 유약 재료, 앞치마, 가마 소성 및 포장 택배비 포함",
    curriculum: "1. 흙 반죽 및 기물 성형 기초 → 2. 손잡이 부착 및 이음매 마감 → 3. 나만의 이니셜 각인 및 유약 색상 선택"
  },
  {
    id: 102,
    title: "이탈리아 베지터블 천연 가죽 카드지갑 제작",
    category: "공예",
    instructorId: 3,
    instructorName: "박서준 강사",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "서울 마포구 연남동 241-8",
    region: "서울 마포구",
    date: "2026-10-05",
    time: "15:00 - 18:00",
    duration: "3시간",
    capacity: 6,
    enrolled: 4,
    status: "open",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    description: "새들 스티치 정통 가죽공예 바느질 기법을 배우며 손때 묻을수록 멋스러워지는 최고급 푸에블로 가죽 카드지갑을 완성합니다.",
    materials: "이태리 수입 가죽, 새들 스티치 린카블레 실, 엣지코트 마감재",
    curriculum: "1. 가죽 재단 및 본딩 → 2. 목타 치기 및 핸드 스티치 바느질 → 3. 단면 사포질 및 토코놀 엣지 마감"
  },
  {
    id: 103,
    title: "프랑스 정통 구움과자: 휘낭시에 & 마들렌 마스터",
    category: "베이킹",
    instructorId: 4,
    instructorName: "최유진 파티시에",
    instructorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    location: "서울 강남구 신사동 512-4",
    region: "서울 강남구",
    date: "2026-10-04",
    time: "10:30 - 13:00",
    duration: "2시간 30분",
    capacity: 4,
    enrolled: 4,
    status: "closed",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    description: "프랑스 발효버터를 태워 풍미를 극대화하는 뵈르 누아제트 기법을 배우고 솔티 카라멜 휘낭시에와 레몬 글라세 마들렌 12구를 직접 굽습니다.",
    materials: "엘르앤비르 고메 버터, 발로나 초콜릿, 고급 선물 상자",
    curriculum: "1. 버터 태우기 및 반죽 휴지 과학 원리 → 2. 틀 패닝 및 오븐 베이킹 → 3. 글라세 아이싱 및 포장"
  },
  {
    id: 104,
    title: "성수 골목 감성 필름 카메라 골목 출사 & 현상 기초",
    category: "사진",
    instructorId: 3,
    instructorName: "박서준 강사",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "서울 성동구 서울숲길 17",
    region: "서울 성동구",
    date: "2026-10-06",
    time: "16:00 - 18:30",
    duration: "2시간 30분",
    capacity: 6,
    enrolled: 3,
    status: "open",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&auto=format&fit=crop&q=80",
    description: "아날로그 필름 카메라의 조작법(노출, 셔터스피드, 조리개)을 익히고 성수동 골목의 빛과 그림자를 담아내는 감성 출사 워크숍입니다.",
    materials: "수동 필름 카메라 대여, 코닥 컬러플러스 36컷 필름 1롤, 고화질 스캔본",
    curriculum: "1. 필름 장착 및 측광 테크닉 → 2. 서울숲 및 붉은 벽돌 골목 출사 실습 → 3. 사진 셀렉 및 보정 팁"
  },
  {
    id: 105,
    title: "텍스처가 살아있는 아크릴 나이프 풍경 페인팅",
    category: "드로잉",
    instructorId: 3,
    instructorName: "박서준 강사",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "서울 마포구 홍익로 10",
    region: "서울 마포구",
    date: "2026-10-07",
    time: "14:00 - 16:30",
    duration: "2시간 30분",
    capacity: 6,
    enrolled: 2,
    status: "open",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80",
    description: "붓 대신 페인팅 나이프와 모델링 페이스트를 사용해 유화처럼 입체적인 질감의 노을 바다 풍경화를 완성하는 초보자 환영 미술 클래스입니다.",
    materials: "F3 정방형 캔버스, 아크릴 물감 및 보조제 일체, 완성작 포장 비닐",
    curriculum: "1. 컬러 조색 및 나이프 블렌딩 기법 → 2. 하늘 노을 그라데이션 표현 → 3. 파도 텍스처 올리기"
  },
  {
    id: 106,
    title: "주말 아침을 깨우는 직장인 힐링 빈야사 요가 & 싱잉볼",
    category: "운동",
    instructorId: 4,
    instructorName: "최유진 파티시에",
    instructorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    location: "서울 서초구 반포대로 14길",
    region: "서울 서초구",
    date: "2026-10-04",
    time: "09:00 - 10:30",
    duration: "1시간 30분",
    capacity: 10,
    enrolled: 7,
    status: "open",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
    description: "굳어있는 어깨와 골반을 부드럽게 이완시키는 플로우 요가와 마음을 편안하게 가라앉히는 싱잉볼 사운드 배스 명상 워크숍입니다.",
    materials: "친환경 프리미엄 요가매트, 스트랩, 유기농 허브티 제공",
    curriculum: "1. 프라나야마 호흡 및 관절 웜업 → 2. 수리야 나마스카라 전신 플로우 → 3. 사바사나 싱잉볼 힐링 명상"
  },
  {
    id: 107,
    title: "북미산 월넛 원목 엔드그레인 도마 만들기",
    category: "공예",
    instructorId: 3,
    instructorName: "박서준 강사",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "경기 파주시 탄현면 헤이리마을길",
    region: "경기 파주",
    date: "2026-10-10",
    time: "13:00 - 17:00",
    duration: "4시간",
    capacity: 5,
    enrolled: 3,
    status: "open",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    description: "단단하고 아름다운 결을 지닌 북미산 월넛 통원목을 재단, 대패질, 샌딩하고 천연 오일로 마감하는 목공예 클래스입니다.",
    materials: "최고급 FAS 등급 호두나무 원목, 하워드 천연 미네랄 오일 & 비즈왁스",
    curriculum: "1. 목재 결 선별 및 테이블쏘 재단 → 2. 샌딩(120~600방) 및 모서리 라운딩 → 3. 레이저 각인 및 오일링"
  },
  {
    id: 108,
    title: "유튜브 & 릴스 숏폼 영상 편집 원데이 마스터",
    category: "드로잉",
    instructorId: 4,
    instructorName: "최유진 파티시에",
    instructorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    location: "서울 강남구 테헤란로 152",
    region: "서울 강남구",
    date: "2026-10-08",
    time: "19:00 - 21:30",
    duration: "2시간 30분",
    capacity: 8,
    enrolled: 5,
    status: "open",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
    description: "프리미어 프로 / 캡컷을 활용해 조회수를 부르는 컷편집, 자막 애니메이션, BGM 싱크, 사운드 이펙트 노하우를 배우는 실전 클래스입니다.",
    materials: "실습용 4K 푸티지 소스, 저작권 무료 음원 팩, 프리셋 템플릿",
    curriculum: "1. 영상 구조 기획 및 템포 컷팅 → 2. 가독성 높은 예능 자막 디자인 → 3. 썸네일 제작 및 알고리즘 최적화"
  }
];

let enrollments = [
  {
    id: 1,
    userId: 1,
    userName: "김민지",
    userPhone: "010-3491-8821",
    classId: 101,
    classTitle: "처음 만나는 나만의 감성 머그컵 빚기",
    classCategory: "도예",
    classLocation: "서울 성동구",
    classDate: "2026-10-03",
    classTime: "14:00 - 16:00",
    status: "enrolled", // enrolled, in-progress, completed, cancelled
    attendance: "미출석", // 미출석, 출석, 지각
    enrolledAt: "2026-09-22T10:30:00Z"
  },
  {
    id: 2,
    userId: 1,
    userName: "김민지",
    userPhone: "010-3491-8821",
    classId: 103,
    classTitle: "프랑스 정통 구움과자: 휘낭시에 & 마들렌 마스터",
    classCategory: "베이킹",
    classLocation: "서울 강남구",
    classDate: "2026-09-18",
    classTime: "10:30 - 13:00",
    status: "completed",
    attendance: "출석",
    enrolledAt: "2026-09-10T14:00:00Z"
  },
  {
    id: 3,
    userId: 1,
    userName: "김민지",
    userPhone: "010-3491-8821",
    classId: 105,
    classTitle: "텍스처가 살아있는 아크릴 나이프 풍경 페인팅",
    classCategory: "드로잉",
    classLocation: "서울 마포구",
    classDate: "2026-09-15",
    classTime: "14:00 - 16:30",
    status: "cancelled",
    attendance: "미출석",
    enrolledAt: "2026-09-08T09:15:00Z"
  },
  {
    id: 4,
    userId: 2,
    userName: "이주원",
    userPhone: "010-8912-4412",
    classId: 102,
    classTitle: "이탈리아 베지터블 천연 가죽 카드지갑 제작",
    classCategory: "공예",
    classLocation: "서울 마포구",
    classDate: "2026-10-05",
    classTime: "15:00 - 18:00",
    status: "enrolled",
    attendance: "미출석",
    enrolledAt: "2026-09-23T11:20:00Z"
  },
  {
    id: 5,
    userId: 2,
    userName: "이주원",
    userPhone: "010-8912-4412",
    classId: 104,
    classTitle: "성수 골목 감성 필름 카메라 골목 출사 & 현상 기초",
    classCategory: "사진",
    classLocation: "서울 성동구",
    classDate: "2026-10-06",
    classTime: "16:00 - 18:30",
    status: "enrolled",
    attendance: "미출석",
    enrolledAt: "2026-09-24T16:40:00Z"
  }
];

let announcements = [
  {
    id: 1,
    classId: 101,
    title: "10월 3일(토) 도예 클래스 준비물 및 공방 입구 안내",
    content: "성수역 3번 출구 도보 5분 거리 골목 안쪽 2층입니다. 흙이 묻을 수 있으니 편안한 복장으로 와주세요.",
    instructorId: 3,
    instructorName: "박서준 강사",
    createdAt: "2026-09-25T10:00:00Z"
  },
  {
    id: 2,
    classId: 102,
    title: "가죽 색상 사전 선택 안내",
    content: "탄, 올리브, 다크브라운 3가지 컬러 중 원하시는 색상을 클래스 시작 전 미리 메시지로 알려주세요.",
    instructorId: 3,
    instructorName: "박서준 강사",
    createdAt: "2026-09-24T14:30:00Z"
  },
  {
    id: 3,
    classId: 103,
    title: "베이킹 클래스 보냉백 지참 권장 안내",
    content: "갓 구운 디저트를 신선하게 담아가실 수 있도록 작은 보냉백을 준비해 오시면 좋습니다.",
    instructorId: 4,
    instructorName: "최유진 파티시에",
    createdAt: "2026-09-17T09:00:00Z"
  }
];

let posts = [
  {
    id: 1,
    title: "성수동 머그컵 도예 클래스 솔직 참여 후기입니다!",
    content: "처음 해보는 물레였는데 강사님이 1:1로 손 모양을 꼼꼼하게 잡아주셔서 예쁜 화병 머그를 완성했어요. 가마 구워져서 택배 도착했는데 너무 마음에 듭니다.",
    category: "후기",
    authorId: 1,
    authorName: "김민지",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    likes: 12,
    createdAt: "2026-09-20T15:00:00Z"
  },
  {
    id: 2,
    title: "주말 필름 카메라 출사 클래스 동행 구해요!",
    content: "10월 6일 성수동 필름 출사 워크숍 신청하신 분 계신가요? 끝나고 사진 공유하고 카페 가서 이야기 나눠요 :)",
    category: "모임",
    authorId: 2,
    authorName: "이주원",
    authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    likes: 5,
    createdAt: "2026-09-24T18:20:00Z"
  },
  {
    id: 3,
    title: "초보자가 배우기 좋은 가죽공예 vs 목공 추천 부탁드립니다",
    content: "손재주가 보통 정도인 직장인인데 주말 취미로 가죽공예와 목공 중 어느 클래스가 더 진입장벽이 낮을까요?",
    category: "질문",
    authorId: 5,
    authorName: "정다은",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    likes: 8,
    createdAt: "2026-09-26T11:40:00Z"
  }
];

let comments = [
  {
    id: 1,
    postId: 1,
    authorId: 2,
    authorName: "이주원",
    authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    content: "와 머그컵 색감 너무 따뜻하고 예쁘네요! 저도 이번 주말에 신청해봐야겠어요.",
    createdAt: "2026-09-20T16:20:00Z"
  },
  {
    id: 2,
    postId: 1,
    authorId: 3,
    authorName: "박서준 강사",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    content: "민지님 정성껏 빚어주셔서 유약이 아주 맑게 나왔습니다. 예쁘게 오래 사용하세요!",
    createdAt: "2026-09-20T17:10:00Z"
  },
  {
    id: 3,
    postId: 2,
    authorId: 5,
    authorName: "정다은",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    content: "저도 그 날 출사 신청했어요! 당일에 반갑게 인사 나눠요~",
    createdAt: "2026-09-24T19:00:00Z"
  },
  {
    id: 4,
    postId: 3,
    authorId: 3,
    authorName: "박서준 강사",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    content: "손힘이 덜 들고 원데이로 바로 완성도 높은 결과물을 가져가기에는 카드지갑 가죽공예를 먼저 추천드립니다!",
    createdAt: "2026-09-26T12:00:00Z"
  }
];

// Helper to get active user
const getRequestUser = (req) => {
  const userId = Number(req.headers['x-user-id']) || 1;
  return users.find(u => u.id === userId) || users[0];
};

// ==========================================
// API Routes
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", service: "classmate" });
});

// Users
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
  res.json(user);
});

// Profile
app.get('/api/profile', (req, res) => {
  const user = getRequestUser(req);
  res.json(user);
});

// SEC-418: Profile Avatar Upload & Preview Sync Bug
let lastUploadedAvatar = null;
app.post('/api/profile/avatar', (req, res) => {
  const user = getRequestUser(req);
  const { avatarUrl } = req.body;

  const newAvatar = avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
  lastUploadedAvatar = newAvatar;

  // Save to database
  const userIdx = users.findIndex(u => u.id === user.id);
  if (userIdx !== -1) {
    users[userIdx].avatar = newAvatar;
  }

  // INTENTIONAL BACKEND BUG: site048-SEC-418
  // The server saves the new avatar in in-memory state, but returns the previous avatar / cached old URL
  // in response data, causing a temporary desync between uploaded file state and frontend preview state.
  res.setHeader('X-Bug-Triggered', 'site048-SEC-418');
  res.json({
    ok: true,
    message: "프로필 이미지가 업로드되었습니다.",
    user: {
      ...user,
      avatar: user.avatar // returns old avatar in payload
    },
    savedAvatarUrl: newAvatar,
    _bug: {
      bugId: 'site048-SEC-418',
      secId: 'SEC-418',
      category: 'file',
      family: 'upload-preview-sync',
      name: '프로필 이미지 업로드 후 미리보기 불일치 (Upload-Preview Sync)',
      description: '새로운 프로필 이미지를 업로드했으나 응답 객체에 이전 캐시 아바타가 반환되어 화면 상태와 실제 저장 상태의 불일치가 발생했습니다.'
    }
  });
});

// Classes List (SEC-417: Search/Filter State Desync Bug)
let lastFilterState = null;
let previousSearchResults = [];
app.get('/api/classes', (req, res) => {
  const { keyword, category, region, instructorId } = req.query;

  let list = [...classes];

  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(c =>
      c.title.toLowerCase().includes(kw) ||
      c.category.toLowerCase().includes(kw) ||
      c.location.toLowerCase().includes(kw) ||
      c.instructorName.toLowerCase().includes(kw)
    );
  }

  if (region && region !== 'all') {
    list = list.filter(c => c.region.includes(region));
  }

  if (instructorId) {
    list = list.filter(c => c.instructorId === Number(instructorId));
  }

  // Filter by Category with Intentional State Desync (SEC-417)
  let triggerBug417 = false;
  if (category && category !== 'all') {
    const exactMatches = list.filter(c => c.category === category);

    // INTENTIONAL BACKEND BUG: site048-SEC-417
    // When changing category filters consecutively, the server retains an item from the previous search category
    // in the returned array, causing a mismatch between the selected filter in UI and the actual items in the result list.
    if (previousSearchResults.length > 0 && category !== lastFilterState && exactMatches.length > 0) {
      const ghostItem = previousSearchResults.find(c => c.category !== category);
      if (ghostItem && !exactMatches.some(e => e.id === ghostItem.id)) {
        list = [...exactMatches, ghostItem];
        triggerBug417 = true;
      } else {
        list = exactMatches;
      }
    } else {
      list = exactMatches;
    }
    lastFilterState = category;
  } else {
    lastFilterState = 'all';
  }

  previousSearchResults = [...list];

  if (triggerBug417) {
    res.setHeader('X-Bug-Triggered', 'site048-SEC-417');
    return res.json({
      classes: list,
      _bug: {
        bugId: 'site048-SEC-417',
        secId: 'SEC-417',
        category: 'state',
        family: 'filter-state-sync',
        name: '검색 필터와 실제 결과 상태 불일치 (Filter State Sync)',
        description: `카테고리 필터('${category}')를 적용했으나 이전 검색 상태의 일부 데이터가 결과 목록에 비동기 잔존하여 필터 조건과 결과가 일치하지 않습니다.`
      }
    });
  }

  res.json(list);
});

// Class Detail
app.get('/api/classes/:id', (req, res) => {
  const cls = classes.find(c => c.id === Number(req.params.id));
  if (!cls) return res.status(404).json({ error: "클래스를 찾을 수 없습니다." });
  res.json(cls);
});

// Create Class (Instructor)
app.post('/api/classes', (req, res) => {
  const user = getRequestUser(req);
  const { title, category, location, region, date, time, duration, capacity, image, description, materials, curriculum } = req.body;

  const newClass = {
    id: classes.length + 101,
    title: title || "새로운 원데이 클래스",
    category: category || "도예",
    instructorId: user.id,
    instructorName: `${user.name} 강사`,
    instructorAvatar: user.avatar,
    location: location || "서울 성동구",
    region: region || "서울 성동구",
    date: date || "2026-10-15",
    time: time || "14:00 - 16:00",
    duration: duration || "2시간",
    capacity: Number(capacity) || 6,
    enrolled: 0,
    status: "open",
    image: image || "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
    description: description || "신규 개설된 취미 원데이 클래스입니다.",
    materials: materials || "수업 실습 재료 일체 포함",
    curriculum: curriculum || "기초 이론 → 실습 진행 → 완성 및 피드백"
  };

  classes.unshift(newClass);
  res.status(201).json(newClass);
});

// Enrollments List
app.get('/api/enrollments', (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'];
  const classId = req.query.classId;

  let list = [...enrollments];

  if (userId) {
    list = list.filter(e => e.userId === Number(userId));
  }

  if (classId) {
    list = list.filter(e => e.classId === Number(classId));
  }

  res.json(list);
});

// Enroll in a class
app.post('/api/enrollments', (req, res) => {
  const user = getRequestUser(req);
  const { classId } = req.body;

  const targetClass = classes.find(c => c.id === Number(classId));
  if (!targetClass) return res.status(404).json({ error: "클래스를 찾을 수 없습니다." });

  if (targetClass.enrolled >= targetClass.capacity) {
    return res.status(400).json({ error: "모집 정원이 마감되었습니다." });
  }

  const existing = enrollments.find(e => e.userId === user.id && e.classId === targetClass.id && e.status === 'enrolled');
  if (existing) {
    return res.status(400).json({ error: "이미 신청 완료된 클래스입니다." });
  }

  const newEnrollment = {
    id: enrollments.length + 1,
    userId: user.id,
    userName: user.name,
    userPhone: "010-3491-8821",
    classId: targetClass.id,
    classTitle: targetClass.title,
    classCategory: targetClass.category,
    classLocation: targetClass.location,
    classDate: targetClass.date,
    classTime: targetClass.time,
    status: "enrolled",
    attendance: "미출석",
    enrolledAt: new Date().toISOString()
  };

  enrollments.unshift(newEnrollment);
  targetClass.enrolled += 1;

  res.status(201).json(newEnrollment);
});

// Cancel Enrollment (SEC-419: State Transition Missing Bug)
app.patch('/api/enrollments/:id/cancel', (req, res) => {
  const enrollment = enrollments.find(e => e.id === Number(req.params.id));
  if (!enrollment) return res.status(404).json({ error: "신청 내역을 찾을 수 없습니다." });

  const previousStatus = enrollment.status;

  // INTENTIONAL BACKEND BUG: site048-SEC-419
  // The server does NOT validate the current enrollment status (e.g. completed, cancelled) before transitioning.
  // It allows transitioning from 'completed' or 'cancelled' to 'cancelled' repeatedly without asserting a valid state flow.
  enrollment.status = "cancelled";
  enrollment.cancelledAt = new Date().toISOString();

  // If previous was completed or cancelled, trigger SEC-419
  if (previousStatus === 'completed' || previousStatus === 'cancelled') {
    res.setHeader('X-Bug-Triggered', 'site048-SEC-419');
    return res.json({
      ok: true,
      message: "신청 상태가 변경되었습니다.",
      enrollment,
      _bug: {
        bugId: 'site048-SEC-419',
        secId: 'SEC-419',
        category: 'business-logic',
        family: 'state-transition',
        name: '잘못된 클래스 신청 상태 전이 (State Transition Validation)',
        description: `이미 '${previousStatus}' 상태인 수강 신청에 대해 유효한 상태 전이(State Machine) 검증 없이 'cancelled'로 재설정되었습니다.`
      }
    });
  }

  res.setHeader('X-Bug-Triggered', 'site048-SEC-419');
  res.json({
    ok: true,
    message: "클래스 수강 신청이 취소되었습니다.",
    enrollment,
    _bug: {
      bugId: 'site048-SEC-419',
      secId: 'SEC-419',
      category: 'business-logic',
      family: 'state-transition',
      name: '클래스 신청 상태 전이 검증 누락 (State Transition)',
      description: `서버가 신청 상태 전이 제약 조건을 검증하지 않고 enrollments 테이블의 status 값을 강제 변경했습니다.`
    }
  });
});

// Instructor Attendance Check
app.patch('/api/enrollments/:id/attendance', (req, res) => {
  const enrollment = enrollments.find(e => e.id === Number(req.params.id));
  if (!enrollment) return res.status(404).json({ error: "신청 내역을 찾을 수 없습니다." });

  enrollment.attendance = req.body.attendance || "출석";
  res.json({ ok: true, enrollment });
});

// Announcements List
app.get('/api/classes/:classId/announcements', (req, res) => {
  const classId = Number(req.params.classId);
  const list = announcements.filter(a => a.classId === classId);
  res.json(list);
});

// Create Announcement
app.post('/api/classes/:classId/announcements', (req, res) => {
  const user = getRequestUser(req);
  const classId = Number(req.params.classId);
  const { title, content } = req.body;

  const newAnn = {
    id: announcements.length + 1,
    classId: classId,
    title: title || "새로운 클래스 공지사항",
    content: content || "",
    instructorId: user.id,
    instructorName: user.name,
    createdAt: new Date().toISOString()
  };

  announcements.unshift(newAnn);
  res.status(201).json(newAnn);
});

// Edit Announcement (SEC-416: Missing Resource Authorization Bug)
app.patch('/api/classes/:classId/announcements/:announcementId', (req, res) => {
  const user = getRequestUser(req);
  const classId = Number(req.params.classId);
  const announcementId = Number(req.params.announcementId);
  const { title, content } = req.body;

  const ann = announcements.find(a => a.id === announcementId && a.classId === classId);
  if (!ann) return res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });

  const targetClass = classes.find(c => c.id === classId);

  // INTENTIONAL BACKEND BUG: site048-SEC-416
  // Missing authorization check: The server modifies the announcement without verifying whether
  // the request user (user.id) is actually the class instructor (targetClass.instructorId).
  if (title) ann.title = title;
  if (content) ann.content = content;
  ann.updatedAt = new Date().toISOString();

  const isUnauthorizedUser = !targetClass || targetClass.instructorId !== user.id;

  if (isUnauthorizedUser || user.role === 'user') {
    res.setHeader('X-Bug-Triggered', 'site048-SEC-416');
  }

  res.json({
    ok: true,
    message: "공지사항이 수정되었습니다.",
    announcement: ann,
    _bug: {
      bugId: 'site048-SEC-416',
      secId: 'SEC-416',
      category: 'authorization',
      family: 'resource-authorization',
      name: '권한 없는 클래스 공지 수정 (Resource Authorization)',
      description: `요청 사용자('${user.name}', 역할: ${user.role})가 클래스 담당 강사(ID: ${targetClass?.instructorId})가 아님에도 공지사항(${ann.title}) 수정이 인가되었습니다.`
    }
  });
});

// Community Posts
app.get('/api/posts', (req, res) => {
  const { keyword, category } = req.query;
  let list = [...posts];

  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw));
  }

  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }

  res.json(list);
});

app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const user = getRequestUser(req);
  const { title, content, category } = req.body;

  const newPost = {
    id: posts.length + 1,
    title: title || "커뮤니티 새 글",
    content: content || "",
    category: category || "자유",
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    likes: 0,
    createdAt: new Date().toISOString()
  };

  posts.unshift(newPost);
  res.status(201).json(newPost);
});

// Delete Post (SEC-420: Orphaned Child Comments Bug)
app.delete('/api/posts/:id', (req, res) => {
  const postId = Number(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }

  const deletedPost = posts[postIndex];
  posts.splice(postIndex, 1);

  // INTENTIONAL BACKEND BUG: site048-SEC-420
  // The server deletes the post from the posts list, but fails to clean up related comments in the comments array.
  // The comments with matching postId remain as orphaned child records in in-memory state.
  const remainingOrphanedCount = comments.filter(c => c.postId === postId).length;

  res.setHeader('X-Bug-Triggered', 'site048-SEC-420');
  res.json({
    ok: true,
    message: "게시글이 삭제되었습니다.",
    deletedPostId: postId,
    orphanedCommentsCount: remainingOrphanedCount,
    _bug: {
      bugId: 'site048-SEC-420',
      secId: 'SEC-420',
      category: 'data-integrity',
      family: 'orphaned-child-data',
      name: '게시글 삭제 후 댓글 데이터 잔존 (Orphaned Child Data)',
      description: `게시글(ID: ${postId}, 제목: '${deletedPost.title}')은 삭제되었으나, 연결된 자식 댓글(${remainingOrphanedCount}개)이 삭제되지 않고 고아 데이터로 메모리에 잔존합니다.`
    }
  });
});

// Comments
app.get('/api/posts/:postId/comments', (req, res) => {
  const postId = Number(req.params.postId);
  const list = comments.filter(c => c.postId === postId);
  res.json(list);
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const user = getRequestUser(req);
  const postId = Number(req.params.postId);
  const { content } = req.body;

  const newComment = {
    id: comments.length + 1,
    postId: postId,
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    content: content || "좋은 글 감사합니다!",
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  res.status(201).json(newComment);
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
  console.log(`ClassMate Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
