import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9948;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-Memory Database
let users = [
  {
    id: 1,
    name: "김민지",
    email: "minji@neighborhands.kr",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    volunteerHours: 36,
    completedCount: 9,
    region: "수원시 영통구"
  },
  {
    id: 2,
    name: "이주원",
    email: "juwon@neighborhands.kr",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    volunteerHours: 18,
    completedCount: 4,
    region: "수원시 팔달구"
  },
  {
    id: 3,
    name: "박서준",
    email: "seojun@neighborhands.kr",
    role: "organizer",
    organization: "초록마을 봉사단",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    volunteerHours: 120,
    completedCount: 28,
    region: "수원시 영통구"
  },
  {
    id: 4,
    name: "최유진",
    email: "yujin@neighborhands.kr",
    role: "organizer",
    organization: "따뜻한 동행 복지관",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    volunteerHours: 95,
    completedCount: 22,
    region: "성남시 분당구"
  },
  {
    id: 5,
    name: "정다은",
    email: "daeun@neighborhands.kr",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    volunteerHours: 12,
    completedCount: 3,
    region: "용인시 수지구"
  }
];

let currentUser = users[0]; // Default logged in as 김민지

let activities = [
  {
    id: 101,
    title: "우리 동네 공원 플로깅 & 분리배출 캠페인",
    category: "환경",
    organizerId: 3,
    organizerName: "초록마을 봉사단 (박서준)",
    location: "수원시 영통구 광교호수공원 원천호수 입구",
    region: "수원시 영통구",
    date: "2026-10-04",
    startTime: "10:00",
    endTime: "12:00",
    isoUtcDateTime: "2026-10-04T01:00:00.000Z", // 10:00 KST
    capacity: 20,
    enrolled: 13,
    status: "open",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80",
    description: "아름다운 광교호수공원을 함께 걸으며 쓰레기를 줍고 분리배출을 실천하는 환경정화 플로깅 활동입니다. 가족, 친구, 동아리 누구나 환영합니다!",
    supplies: "편안한 운동화, 개인 텀블러, 모자 (집게, 장갑, 생분해 봉투는 제공됩니다)",
    gatheringPlace: "광교호수공원 제1주차장 옆 방문자센터 앞 벤치",
    notices: "우천 시 전날 저녁 문자로 일정 연기 안내를 드립니다. 봉사시간 2시간 인정됩니다."
  },
  {
    id: 102,
    title: "유기동물 보호소 돌봄 & 쉼터 환경 개선 봉사",
    category: "동물",
    organizerId: 3,
    organizerName: "초록마을 봉사단 (박서준)",
    location: "수원시 권선구 당수동 안심 보호소",
    region: "수원시 권선구",
    date: "2026-10-11",
    startTime: "13:00",
    endTime: "17:00",
    isoUtcDateTime: "2026-10-11T04:00:00.000Z",
    capacity: 15,
    enrolled: 11,
    status: "open",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80",
    description: "보호소 유기견·유기묘 견사 청소, 사료 및 물 급여, 놀이 및 교감 활동을 함께 진행합니다. 따뜻한 사랑을 선물해주세요.",
    supplies: "더러워져도 괜찮은 편한 복장, 장화 또는 갈아신을 신발, 마스크",
    gatheringPlace: "안심보호소 정문 앞 관리동",
    notices: "동물 알레르기가 있으신 분은 신청에 유의해주세요. 봉사시간 4시간 인정."
  },
  {
    id: 103,
    title: "사랑의 무료급식소 조리 지원 및 도시락 배달",
    category: "복지",
    organizerId: 4,
    organizerName: "따뜻한 동행 복지관 (최유진)",
    location: "성남시 분당구 야탑동 나눔복지관 1층 조리실",
    region: "성남시 분당구",
    date: "2026-10-08",
    startTime: "09:00",
    endTime: "13:00",
    isoUtcDateTime: "2026-10-08T00:00:00.000Z",
    capacity: 10,
    enrolled: 9,
    status: "open",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
    description: "거동이 불편하신 독거 어르신과 취약계층 가정을 위한 영양식 도시락 조리 및 인근 배달 나눔 활동입니다.",
    supplies: "머리끈, 위생모/앞치마(현장 제공), 편안한 실내화",
    gatheringPlace: "나눔복지관 1층 식당 로비",
    notices: "위생 관리를 위해 마스크 착용이 필수입니다. 봉사시간 4시간 인정."
  },
  {
    id: 104,
    title: "동네 어린이 도서관 그림책 정리 & 테마 북큐레이션",
    category: "교육",
    organizerId: 4,
    organizerName: "따뜻한 동행 복지관 (최유진)",
    location: "수원시 팔달구 매산로 꿈나래 어린이도서관",
    region: "수원시 팔달구",
    date: "2026-10-15",
    startTime: "14:00",
    endTime: "17:00",
    isoUtcDateTime: "2026-10-15T05:00:00.000Z",
    capacity: 8,
    enrolled: 5,
    status: "open",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80",
    description: "어린이 도서관 서가 도서 정리, 파손 도서 보수, 그리고 가을맞이 어린이 추천 도서 북큐레이션 코너 꾸미기입니다.",
    supplies: "편안한 복장, 면장갑",
    gatheringPlace: "꿈나래 어린이도서관 2층 열람실 인포데스크",
    notices: "차분하고 성실하게 도서를 분류해주실 자원봉사자분을 환영합니다."
  },
  {
    id: 105,
    title: "어르신 스마트폰 & 무인 키오스크 1:1 디지털 배움터",
    category: "교육",
    organizerId: 3,
    organizerName: "초록마을 봉사단 (박서준)",
    location: "수원시 영통구 매탄동 어르신복지관 3층 다목적실",
    region: "수원시 영통구",
    date: "2026-10-17",
    startTime: "10:00",
    endTime: "12:30",
    isoUtcDateTime: "2026-10-17T01:00:00.000Z",
    capacity: 12,
    enrolled: 10,
    status: "open",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    description: "카카오톡 사진 전송, 기차/버스 예매, 병원 앱 사용법 및 식당 키오스크 주문법을 어르신과 1:1로 친절히 알려드리는 봉사입니다.",
    supplies: "개인 스마트폰, 친절하고 따뜻한 미소",
    gatheringPlace: "매탄 어르신복지관 3층 디지털배움터",
    notices: "어르신 눈높이에 맞춰 천천히 설명해주실 청년 및 대학생 봉사자 환영!"
  },
  {
    id: 106,
    title: "원천리천 하천 생태계 보호 & EM 흙공 던지기",
    category: "환경",
    organizerId: 3,
    organizerName: "초록마을 봉사단 (박서준)",
    location: "수원시 영통구 원천동 원천교 하부 산책로",
    region: "수원시 영통구",
    date: "2026-10-18",
    startTime: "09:30",
    endTime: "11:30",
    isoUtcDateTime: "2026-10-18T00:30:00.000Z",
    capacity: 25,
    enrolled: 18,
    status: "open",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    description: "유용미생물(EM) 발효 흙공을 하천에 던져 수질을 정화하고 하천 주변 쓰레기를 수거하는 친환경 생태 보전 활동입니다.",
    supplies: "편한 운동화 또는 장화, 모자, 개인 물병",
    gatheringPlace: "원천교 다리 밑 야외무대",
    notices: "가족 단위 참여가 매우 인기 있는 프로그램입니다. 1365 자원봉사 2시간 인정."
  },
  {
    id: 107,
    title: "주말 유기견 야외 산책 & 사회화 훈련 보조",
    category: "동물",
    organizerId: 3,
    organizerName: "초록마을 봉사단 (박서준)",
    location: "용인시 수지구 고기동 햇살 유기견 쉼터",
    region: "용인시 수지구",
    date: "2026-10-24",
    startTime: "10:00",
    endTime: "13:00",
    isoUtcDateTime: "2026-10-24T01:00:00.000Z",
    capacity: 10,
    enrolled: 10,
    status: "closed",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80",
    description: "오랜 보호소 생활로 산책이 그리운 유기견들과 함께 쉼터 주변 둘레길을 산책하며 사람에 대한 신뢰를 쌓아주는 봉사입니다.",
    supplies: "편안한 긴바지 및 운동화, 배변봉투 케이스",
    gatheringPlace: "햇살 쉼터 입구 주차장",
    notices: "중대형견 산책 경험이 있으신 성인 봉사자 위주로 배정됩니다."
  },
  {
    id: 108,
    title: "독거 어르신 따뜻한 겨울나기 온정 김장김치 나눔",
    category: "복지",
    organizerId: 4,
    organizerName: "따뜻한 동행 복지관 (최유진)",
    location: "성남시 수정구 신흥동 성남종합사회복지관 마당",
    region: "성남시 수정구",
    date: "2026-10-25",
    startTime: "09:00",
    endTime: "14:00",
    isoUtcDateTime: "2026-10-25T00:00:00.000Z",
    capacity: 30,
    enrolled: 24,
    status: "open",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80",
    description: "겨울철 식생활 지원이 필요한 취약계층 200가구를 위해 절임배추 양념 버무리기 및 포장, 배송 준비를 합니다.",
    supplies: "편안한 옷(오염 가능), 방한복, 고무장갑(원할 시)",
    gatheringPlace: "성남종합사회복지관 야외 주차장 천막",
    notices: "점심 식사(따뜻한 수육과 김치)가 제공됩니다. 봉사시간 5시간 인정."
  },
  {
    id: 109,
    title: "가을 골목길 벽화 그리기 & 노후 담장 보수",
    category: "문화",
    organizerId: 3,
    organizerName: "초록마을 봉사단 (박서준)",
    location: "수원시 팔달구 행궁동 벽화마을 일대",
    region: "수원시 팔달구",
    date: "2026-10-31",
    startTime: "11:00",
    endTime: "16:00",
    isoUtcDateTime: "2026-10-31T02:00:00.000Z",
    capacity: 15,
    enrolled: 12,
    status: "open",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
    description: "낡고 어두운 골목길 담장에 밝고 따뜻한 희망의 벽화를 채색하여 범죄를 예방하고 쾌적한 보행환경을 조성합니다.",
    supplies: "페인트가 묻어도 되는 헌 옷, 헌 신발, 팔토시",
    gatheringPlace: "행궁동 행정복지센터 뒤편 골목 입구",
    notices: "미술 전공자가 아니어도 밑그림에 맞춰 쉽게 채색할 수 있습니다."
  },
  {
    id: 110,
    title: "2026 수원 화성문화제 시민 안내 및 안전 서포터즈",
    category: "지역행사",
    organizerId: 4,
    organizerName: "따뜻한 동행 복지관 (최유진)",
    location: "수원시 팔달구 화성행궁 광장",
    region: "수원시 팔달구",
    date: "2026-11-07",
    startTime: "12:00",
    endTime: "18:00",
    isoUtcDateTime: "2026-11-07T03:00:00.000Z",
    capacity: 40,
    enrolled: 31,
    status: "open",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    description: "대한민국 대표 전통문화축제인 화성문화제에서 관광객 안내, 리플렛 배부, 행사장 질서유지 및 미아방지 부스를 운영합니다.",
    supplies: "편한 운동화, 보조배터리 (행사 단체 조끼 및 모자 지급)",
    gatheringPlace: "화성행궁 광장 관광안내소 옆 자원봉사 본부",
    notices: "봉사활동 확인서 6시간 발급 및 활동 기념품이 제공됩니다."
  },
  {
    id: 111,
    title: "다문화 가정 초등 아동 1:1 한글 맞춤법 & 독서 멘토링",
    category: "교육",
    organizerId: 4,
    organizerName: "따뜻한 동행 복지관 (최유진)",
    location: "수원시 영통구 매탄동 다문화가족지원센터",
    region: "수원시 영통구",
    date: "2026-11-14",
    startTime: "10:00",
    endTime: "12:00",
    isoUtcDateTime: "2026-11-14T01:00:00.000Z",
    capacity: 10,
    enrolled: 7,
    status: "open",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
    description: "다문화 배경 가정의 초등 저학년 아동들과 함께 동화책을 읽고 어휘 학습 및 글짓기를 돕는 멘토링 프로그램입니다.",
    supplies: "필기구, 따뜻한 관심과 인내심",
    gatheringPlace: "다문화가족지원센터 2층 배움실 1호",
    notices: "사전 오리엔테이션 자료가 신청자분들께 이메일로 전송됩니다."
  },
  {
    id: 112,
    title: "동네 하천 플라스틱 프리 캠페인 및 수변 정화",
    category: "환경",
    organizerId: 3,
    organizerName: "초록마을 봉사단 (박서준)",
    location: "용인시 수지구 탄천 수변 산책로",
    region: "용인시 수지구",
    date: "2026-11-21",
    startTime: "14:00",
    endTime: "16:30",
    isoUtcDateTime: "2026-11-21T05:00:00.000Z",
    capacity: 20,
    enrolled: 14,
    status: "open",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&auto=format&fit=crop&q=80",
    description: "탄천 생태계를 지키기 위한 일회용 플라스틱 쓰레기 수거 및 시민 대상 제로웨이스트 홍보 활동입니다.",
    supplies: "운동화, 텀블러, 장갑",
    gatheringPlace: "수지구청역 2번 출구 탄천 진입로",
    notices: "봉사시간 2시간 30분 발급."
  }
];

let enrollments = [
  {
    id: 1,
    userId: 1,
    userName: "김민지",
    activityId: 101,
    activityTitle: "우리 동네 공원 플로깅 & 분리배출 캠페인",
    activityDate: "2026-10-04",
    activityTime: "10:00 - 12:00",
    activityCategory: "환경",
    activityLocation: "수원시 영통구 광교호수공원",
    status: "신청 완료",
    appliedAt: "2026-09-20 14:30",
    attended: false
  },
  {
    id: 2,
    userId: 1,
    userName: "김민지",
    activityId: 103,
    activityTitle: "사랑의 무료급식소 조리 지원 및 도시락 배달",
    activityDate: "2026-10-08",
    activityTime: "09:00 - 13:00",
    activityCategory: "복지",
    activityLocation: "성남시 분당구 야탑동 나눔복지관",
    status: "참여 예정",
    appliedAt: "2026-09-22 09:15",
    attended: false
  },
  {
    id: 3,
    userId: 1,
    userName: "김민지",
    activityId: 105,
    activityTitle: "어르신 스마트폰 & 무인 키오스크 1:1 디지털 배움터",
    activityDate: "2026-09-15",
    activityTime: "10:00 - 12:30",
    activityCategory: "교육",
    activityLocation: "수원시 영통구 매탄 어르신복지관",
    status: "참여 완료",
    appliedAt: "2026-09-01 11:00",
    attended: true
  },
  {
    id: 4,
    userId: 2,
    userName: "이주원",
    activityId: 102,
    activityTitle: "유기동물 보호소 돌봄 & 쉼터 환경 개선 봉사",
    activityDate: "2026-10-11",
    activityTime: "13:00 - 17:00",
    activityCategory: "동물",
    activityLocation: "수원시 권선구 안심 보호소",
    status: "신청 완료",
    appliedAt: "2026-09-24 16:20",
    attended: false
  }
];

let notifications = [
  {
    id: 1,
    userId: 1,
    title: "새로운 활동이 등록되었습니다.",
    message: "관심 분야 [환경]의 '원천리천 하천 생태계 보호 & EM 흙공 던지기' 활동이 새로 개설되었습니다.",
    category: "activity",
    read: false,
    createdAt: "2026-09-26 10:15",
    link: "/activities/106"
  },
  {
    id: 2,
    userId: 1,
    title: "내가 신청한 활동의 일정이 변경되었습니다.",
    message: "'우리 동네 공원 플로깅' 집결 장소가 광교호수공원 제1주차장 옆 방문자센터 앞으로 최종 확정되었습니다.",
    category: "schedule",
    read: false,
    createdAt: "2026-09-25 15:40",
    link: "/activities/101"
  },
  {
    id: 3,
    userId: 1,
    title: "주최자가 새로운 공지를 등록했습니다.",
    message: "'사랑의 무료급식소 조리 지원' 주최자가 준비물 및 위생 수칙 안내를 등록하였습니다.",
    category: "notice",
    read: true,
    createdAt: "2026-09-23 18:00",
    link: "/activities/103"
  },
  {
    id: 4,
    userId: 2,
    title: "봉사활동 신청이 정상 접수되었습니다.",
    message: "'유기동물 보호소 돌봄' 활동 신청이 완료되었습니다. 쉼터 상세 위치를 확인해보세요.",
    category: "activity",
    read: false,
    createdAt: "2026-09-24 16:21",
    link: "/my-activities"
  }
];

let posts = [
  {
    id: 1,
    title: "지난주 광교호수공원 플로깅 후기! 너무 뿌듯했어요 🌱",
    content: "처음으로 플로깅에 참여해봤는데 생각보다 호숫가 주변에 버려진 담배꽁초와 일회용 컵이 많더라구요. 두 시간 동안 다른 이웃분들과 열심히 줍고 나니 호수공원이 훨씬 맑아진 느낌이었습니다. 다음에도 꼭 다시 신청할게요!",
    category: "후기",
    authorId: 1,
    authorName: "김민지",
    authorRole: "user",
    createdAt: "2026-09-21 17:30",
    views: 142,
    likes: 18,
    commentsCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "안심 유기동물 보호소 봉사 가실 때 작은 꿀팁 공유합니다 🐶",
    content: "보호소에 처음 가시는 분들은 편한 옷 중에서도 버려도 되는 어두운 계열 옷을 입으시는 걸 추천드려요! 아이들이 반가워서 발을 올리면 흙이 많이 묻을 수 있습니다. 장화는 센터에 구비되어 있지만 개인 방수 신발이 있으면 더 편해요.",
    category: "정보",
    authorId: 2,
    authorName: "이주원",
    authorRole: "user",
    createdAt: "2026-09-23 11:20",
    views: 215,
    likes: 34,
    commentsCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    title: "[초록마을 봉사단] 10월 환경/생태 봉사활동 일정 안내",
    content: "안녕하세요, 초록마을 봉사단 박서준입니다. 이번 10월에는 플로깅, 유기동물 보호, 원천리천 EM 흙공 던지기 등 다양한 참여 프로그램이 마련되어 있습니다. 지역 주민 여러분의 따뜻한 손길을 기다립니다!",
    category: "공지",
    authorId: 3,
    authorName: "박서준 (초록마을 봉사단)",
    authorRole: "organizer",
    createdAt: "2026-09-24 09:00",
    views: 310,
    likes: 45,
    commentsCount: 4,
    imageUrl: null
  }
];

let comments = [
  {
    id: 1,
    postId: 1,
    authorId: 3,
    authorName: "박서준",
    authorRole: "organizer",
    content: "민지 님, 첫 플로깅 함께해주셔서 정말 감사했습니다! 다음 달 활동에서도 또 뵈어요!",
    createdAt: "2026-09-21 18:05"
  },
  {
    id: 2,
    postId: 1,
    authorId: 2,
    authorName: "이주원",
    authorRole: "user",
    content: "저도 다음엔 광교 플로깅 신청해봐야겠네요. 사진 보니 분위기가 참 훈훈해요.",
    createdAt: "2026-09-21 19:40"
  },
  {
    id: 3,
    postId: 1,
    authorId: 5,
    authorName: "정다은",
    authorRole: "user",
    content: "수고 많으셨습니다~ 쓰레기 수거량이 꽤 많았군요!",
    createdAt: "2026-09-22 08:30"
  },
  {
    id: 4,
    postId: 2,
    authorId: 1,
    authorName: "김민지",
    authorRole: "user",
    content: "좋은 꿀팁 감사합니다! 다음 주말에 갈 예정인데 참고할게요.",
    createdAt: "2026-09-23 13:10"
  },
  {
    id: 5,
    postId: 2,
    authorId: 4,
    authorName: "최유진",
    authorRole: "organizer",
    content: "정성스러운 팁 공유 감사드립니다 :)",
    createdAt: "2026-09-23 14:00"
  },
  {
    id: 6,
    postId: 3,
    authorId: 1,
    authorName: "김민지",
    authorRole: "user",
    content: "10월에도 유익한 활동이 가득하네요! 흙공 던지기도 기대됩니다.",
    createdAt: "2026-09-24 10:15"
  }
];

// Helper to get requesting user
const getRequestUser = (req) => {
  const userId = req.headers['x-user-id'];
  if (userId) {
    const found = users.find(u => u.id === parseInt(userId, 10));
    if (found) return found;
  }
  return currentUser;
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "neighborhands"
  });
});

// Authentication APIs
app.get('/api/auth/me', (req, res) => {
  const user = getRequestUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(user);
});

app.get('/api/auth/users', (req, res) => {
  res.json(users);
});

app.post('/api/auth/login', (req, res) => {
  const { userId, email } = req.body;
  let targetUser = null;
  if (userId) {
    targetUser = users.find(u => u.id === parseInt(userId, 10));
  } else if (email) {
    targetUser = users.find(u => u.email === email);
  }
  if (!targetUser) {
    targetUser = users[0];
  }
  currentUser = targetUser;
  res.json({ success: true, user: currentUser });
});

// INTENTIONAL BACKEND BUG: site049-SEC-421
// 로그아웃 시 서버 세션은 비로그인(null)으로 전환되나, 클라이언트 응답 및 세션 동기화에서 
// 이전 사용자 정보 캐시나 상태를 지우지 않는 불일치 발생
app.post('/api/auth/logout', (req, res) => {
  // INTENTIONAL BACKEND BUG: site049-SEC-421
  const prevUserName = currentUser ? currentUser.name : "사용자";
  currentUser = null; // Server session cleared
  
  res.setHeader('X-Bug-Triggered', 'SEC-421');
  res.json({
    success: true,
    message: "로그아웃되었습니다.",
    _bug: {
      id: "SEC-421",
      category: "authentication",
      family: "stale-session-state",
      message: "로그아웃 후 이전 세션 UI 상태 잔존 (서버 세션은 해제되었으나 클라이언트 상태가 즉시 동기화되지 않음)"
    }
  });
});

// Activities APIs
// INTENTIONAL BACKEND BUG: site049-SEC-422
// 봉사활동 목록 페이지네이션 시 페이지 번호와 실제 데이터의 오프셋 불일치
app.get('/api/activities', (req, res) => {
  let { page = 1, limit = 6, category, region, status, search } = req.query;
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 6;

  let filtered = [...activities];

  if (category && category !== 'all' && category !== '전체') {
    filtered = filtered.filter(a => a.category === category);
  }
  if (region && region !== 'all' && region !== '전체') {
    filtered = filtered.filter(a => a.region.includes(region) || a.location.includes(region));
  }
  if (status && status !== 'all' && status !== '전체') {
    filtered = filtered.filter(a => a.status === status);
  }
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;

  // INTENTIONAL BACKEND BUG: site049-SEC-422
  // When requesting page > 1, the offset calculation uses previous page or wrong offset
  let offset = (page - 1) * limit;
  let isBugged = false;
  if (page > 1) {
    // Intentional bug: offset stays at page 1 or miscalculates
    offset = Math.max(0, (page - 2) * limit);
    isBugged = true;
    res.setHeader('X-Bug-Triggered', 'SEC-422');
  }

  const paginatedActivities = filtered.slice(offset, offset + limit);

  res.json({
    activities: paginatedActivities,
    pagination: {
      currentPage: page,
      limit,
      total,
      totalPages
    },
    ...(isBugged ? {
      _bug: {
        id: "SEC-422",
        category: "pagination",
        family: "offset-state-mismatch",
        message: `페이지네이션 불일치 발생: UI는 ${page}페이지를 요청했으나 실제 데이터는 이전 오프셋(offset: ${offset})의 항목들이 반환됨`
      }
    } : {})
  });
});

// INTENTIONAL BACKEND BUG: site049-SEC-423
// 활동 상세 조회 시 UTC/로컬 타임존 변환 불일치로 인한 날짜/시간 왜곡
app.get('/api/activities/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const activity = activities.find(a => a.id === id);

  if (!activity) {
    return res.status(404).json({ error: "봉사활동을 찾을 수 없습니다." });
  }

  // INTENTIONAL BACKEND BUG: site049-SEC-423
  // If activity id is 101 or 103, format or expose date with timezone offset mismatch
  let responseActivity = { ...activity };
  let isBugged = false;

  if (activity.id === 101 || activity.id === 106) {
    isBugged = true;
    res.setHeader('X-Bug-Triggered', 'SEC-423');
    // Provide timezone shifted raw string or display boundary error
    responseActivity.rawUtcDisplay = "2026-10-04T00:00:00.000Z"; // 9시간 차이로 09:00 또는 전날 표시 유발
    responseActivity.displayTimezoneNote = "UTC 기준 시각: 2026-10-04 01:00 (KST 10:00과 표기 불일치)";
  }

  res.json({
    activity: responseActivity,
    ...(isBugged ? {
      _bug: {
        id: "SEC-423",
        category: "datetime",
        family: "timezone-display",
        message: "날짜 및 시간대 표시 불일치: 서버 저장 기준(UTC)과 클라이언트 변환 과정에서 시간 차이가 발생하여 시작 시간이 불일치함"
      }
    } : {})
  });
});

app.post('/api/activities', (req, res) => {
  const user = getRequestUser(req);
  const { title, category, location, region, date, startTime, endTime, capacity, description, supplies, gatheringPlace, notices, image } = req.body;

  if (!title || !category || !location || !date) {
    return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
  }

  const newActivity = {
    id: Date.now(),
    title,
    category,
    organizerId: user ? user.id : 3,
    organizerName: user ? `${user.organization || user.name}` : "초록마을 봉사단",
    location,
    region: region || "수원시",
    date,
    startTime: startTime || "10:00",
    endTime: endTime || "12:00",
    isoUtcDateTime: `${date}T${startTime || '10:00'}:00.000Z`,
    capacity: parseInt(capacity, 10) || 20,
    enrolled: 0,
    status: "open",
    image: image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80",
    description: description || "따뜻한 이웃과 함께하는 봉사활동입니다.",
    supplies: supplies || "편안한 복장",
    gatheringPlace: gatheringPlace || location,
    notices: notices || "봉사활동 시간 인정"
  };

  activities.unshift(newActivity);
  res.status(201).json({ success: true, activity: newActivity });
});

app.patch('/api/activities/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const activity = activities.find(a => a.id === id);
  if (!activity) {
    return res.status(404).json({ error: "봉사활동을 찾을 수 없습니다." });
  }

  Object.assign(activity, req.body);
  res.json({ success: true, activity });
});

// Participation APIs
app.get('/api/enrollments', (req, res) => {
  const user = getRequestUser(req);
  if (!user) {
    return res.json([]);
  }
  const userEnrollments = enrollments.filter(e => e.userId === user.id);
  res.json(userEnrollments);
});

// INTENTIONAL BACKEND BUG: site049-SEC-424
// 참여 신청 중복 요청 시 기존 신청 여부 확인 없이 중복 enrollment 계속 생성
app.post('/api/activities/:id/join', (req, res) => {
  const activityId = parseInt(req.params.id, 10);
  const activity = activities.find(a => a.id === activityId);
  if (!activity) {
    return res.status(404).json({ error: "봉사활동을 찾을 수 없습니다." });
  }

  const user = getRequestUser(req) || users[0];

  // INTENTIONAL BACKEND BUG: site049-SEC-424
  // Do NOT check if user already enrolled! Directly push enrollment!
  const existingEnrollmentCount = enrollments.filter(e => e.userId === user.id && e.activityId === activityId).length;

  const newEnrollment = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    userId: user.id,
    userName: user.name,
    activityId: activity.id,
    activityTitle: activity.title,
    activityDate: activity.date,
    activityTime: `${activity.startTime} - ${activity.endTime}`,
    activityCategory: activity.category,
    activityLocation: activity.location,
    status: "신청 완료",
    appliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    attended: false
  };

  enrollments.unshift(newEnrollment);
  activity.enrolled += 1;

  let isBugged = false;
  if (existingEnrollmentCount >= 1) {
    isBugged = true;
    res.setHeader('X-Bug-Triggered', 'SEC-424');
  }

  res.status(201).json({
    success: true,
    message: "봉사활동 참여 신청이 완료되었습니다.",
    enrollment: newEnrollment,
    duplicateCount: existingEnrollmentCount + 1,
    ...(isBugged ? {
      _bug: {
        id: "SEC-424",
        category: "concurrency",
        family: "duplicate-request",
        message: `참여 신청 중복 요청 처리 실패: 동일한 사용자가 같은 활동에 ${existingEnrollmentCount + 1}회 중복 신청됨`
      }
    } : {})
  });
});

app.delete('/api/enrollments/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = enrollments.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "신청 내역을 찾을 수 없습니다." });
  }

  const enrolledItem = enrollments[idx];
  const activity = activities.find(a => a.id === enrolledItem.activityId);
  if (activity && activity.enrolled > 0) {
    activity.enrolled -= 1;
  }

  enrollments.splice(idx, 1);
  res.json({ success: true, message: "참여 신청이 취소되었습니다." });
});

// Notifications APIs
// INTENTIONAL BACKEND BUG: site049-SEC-425
// 알림 읽음 처리 시 서버 데이터는 갱신되지만 캐시/응답 불일치로 클라이언트에서 이전 unread 상태가 유지될 수 있음
app.get('/api/notifications', (req, res) => {
  const user = getRequestUser(req);
  if (!user) {
    return res.json([]);
  }
  const userNotifications = notifications.filter(n => n.userId === user.id);
  res.json(userNotifications);
});

// INTENTIONAL BACKEND BUG: site049-SEC-425
app.patch('/api/notifications/:id/read', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const notif = notifications.find(n => n.id === id);
  if (!notif) {
    return res.status(404).json({ error: "알림을 찾을 수 없습니다." });
  }

  // INTENTIONAL BACKEND BUG: site049-SEC-425
  notif.read = true; // Updated on server
  res.setHeader('X-Bug-Triggered', 'SEC-425');

  res.json({
    success: true,
    notification: notif,
    _bug: {
      id: "SEC-425",
      category: "data-consistency",
      family: "stale-cache",
      message: "알림 읽음 상태의 데이터 최신성 불일치: 서버 상태는 read=true로 변경되었으나 클라이언트 캐시 유지로 인해 unread 상태가 잔존할 수 있음"
    }
  });
});

app.patch('/api/notifications/read-all', (req, res) => {
  const user = getRequestUser(req);
  if (user) {
    notifications.filter(n => n.userId === user.id).forEach(n => { n.read = true; });
  }
  res.setHeader('X-Bug-Triggered', 'SEC-425');
  res.json({
    success: true,
    message: "모든 알림이 읽음 처리되었습니다.",
    _bug: {
      id: "SEC-425",
      category: "data-consistency",
      family: "stale-cache",
      message: "알림 전체 읽음 처리 후 데이터 최신성 불일치 가능성"
    }
  });
});

// Community APIs
app.get('/api/posts', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...posts];

  if (category && category !== '전체') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  post.views += 1;
  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const user = getRequestUser(req);
  const { title, content, category, imageUrl } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "제목과 내용을 입력해주세요." });
  }

  const newPost = {
    id: Date.now(),
    title,
    content,
    category: category || "후기",
    authorId: user ? user.id : 1,
    authorName: user ? (user.organization ? `${user.name} (${user.organization})` : user.name) : "김민지",
    authorRole: user ? user.role : "user",
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    views: 1,
    likes: 0,
    commentsCount: 0,
    imageUrl: imageUrl || null
  };

  posts.unshift(newPost);
  res.status(201).json(newPost);
});

app.patch('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  Object.assign(post, req.body);
  res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  posts.splice(idx, 1);
  comments = comments.filter(c => c.postId !== id);
  res.json({ success: true, message: "게시글이 삭제되었습니다." });
});

// Post Likes
app.post('/api/posts/:id/like', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }
  post.likes += 1;
  res.json({ success: true, likes: post.likes });
});

// Comments APIs
app.get('/api/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const postComments = comments.filter(c => c.postId === postId);
  res.json(postComments);
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
  }

  const user = getRequestUser(req);
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "댓글 내용을 입력해주세요." });
  }

  const newComment = {
    id: Date.now(),
    postId,
    authorId: user ? user.id : 1,
    authorName: user ? (user.organization ? `${user.name} (${user.organization})` : user.name) : "김민지",
    authorRole: user ? user.role : "user",
    content: content.trim(),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  comments.push(newComment);
  post.commentsCount += 1;
  res.status(201).json(newComment);
});

// Static assets & SPA Fallback
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`NeighborHands (site049) server running on http://localhost:${PORT}`);
});
