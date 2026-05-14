const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9295;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const classes = [
  {
    id: 'terrarium-atelier',
    title: '유리병 테라리움 정원',
    difficulty: '입문',
    plantType: '다육식물',
    duration: 90,
    price: 52000,
    kitIncluded: true,
    recommended: true,
    instructorId: 'ins-01',
    image: '/assets/class-terrarium.svg',
    description:
      '투명한 유리병 안에 배수층, 배양토, 작은 다육식물을 쌓아 계절감 있는 미니 정원을 완성합니다.',
    schedule: [
      { date: '2026-05-09', time: '10:00', seats: 6, room: '그린룸 A' },
      { date: '2026-05-12', time: '19:30', seats: 4, room: '온라인 라이브' },
      { date: '2026-05-17', time: '13:00', seats: 8, room: '그린룸 A' }
    ]
  },
  {
    id: 'herb-kitchen',
    title: '주방 허브 가든 시작하기',
    difficulty: '입문',
    plantType: '허브',
    duration: 75,
    price: 43000,
    kitIncluded: true,
    recommended: false,
    instructorId: 'ins-02',
    image: '/assets/class-herb.svg',
    description:
      '바질, 로즈마리, 타임을 작은 화분에 옮겨 심고 실내 채광과 물주기 루틴을 함께 설계합니다.',
    schedule: [
      { date: '2026-05-10', time: '11:00', seats: 7, room: '그린룸 B' },
      { date: '2026-05-14', time: '20:00', seats: 5, room: '온라인 라이브' },
      { date: '2026-05-21', time: '15:30', seats: 9, room: '그린룸 B' }
    ]
  },
  {
    id: 'orchid-care',
    title: '난초 분갈이와 꽃대 관리',
    difficulty: '중급',
    plantType: '꽃식물',
    duration: 120,
    price: 68000,
    kitIncluded: false,
    recommended: true,
    instructorId: 'ins-03',
    image: '/assets/class-orchid.svg',
    description:
      '뿌리 상태를 살피고 통기성 좋은 배합토로 분갈이하며 꽃대가 오래 유지되는 관리법을 익힙니다.',
    schedule: [
      { date: '2026-05-11', time: '14:00', seats: 3, room: '그린룸 C' },
      { date: '2026-05-19', time: '18:30', seats: 6, room: '그린룸 C' }
    ]
  },
  {
    id: 'balcony-veggie',
    title: '베란다 채소 플랜터 집중 워크숍',
    difficulty: '고급',
    plantType: '채소',
    duration: 150,
    price: 89000,
    kitIncluded: true,
    recommended: true,
    instructorId: 'ins-04',
    image: '/assets/class-veggie.svg',
    description:
      '상추, 방울토마토, 고추를 베란다 환경에 맞게 배치하고 병충해 예방과 수확 주기를 계획합니다.',
    schedule: [
      { date: '2026-05-13', time: '09:30', seats: 5, room: '루프가든' },
      { date: '2026-05-22', time: '16:00', seats: 4, room: '루프가든' }
    ]
  },
  {
    id: 'fern-shade',
    title: '그늘에서도 싱그러운 양치식물 숲 만들기',
    difficulty: '중급',
    plantType: '관엽식물',
    duration: 110,
    price: 61000,
    kitIncluded: true,
    recommended: true,
    instructorId: 'ins-01',
    image: '/assets/class-fern.svg',
    description:
      '습도와 반그늘을 좋아하는 양치식물을 조합해 책상 옆에 놓을 수 있는 작은 숲을 디자인합니다.',
    schedule: [
      { date: '2026-05-15', time: '10:30', seats: 6, room: '그린룸 A' },
      { date: '2026-05-24', time: '13:30', seats: 6, room: '온라인 라이브' }
    ]
  },
  {
    id: 'seasonal-planter',
    title: '봄빛 테라코타 계절 화분 디자인 클래스',
    difficulty: '입문',
    plantType: '꽃식물',
    duration: 95,
    price: 57000,
    kitIncluded: false,
    recommended: false,
    instructorId: 'ins-03',
    image: '/assets/class-planter.svg',
    description:
      '테라코타 화분에 팬지와 아이비를 조화롭게 배치하고 오래 볼 수 있는 관리 노트를 작성합니다.',
    schedule: [
      { date: '2026-05-16', time: '12:00', seats: 8, room: '그린룸 C' },
      { date: '2026-05-23', time: '17:30', seats: 5, room: '그린룸 C' }
    ]
  }
];

const instructors = [
  {
    id: 'ins-01',
    name: '한서연',
    specialty: '테라리움, 실내 관엽식물',
    experience: '도심 원예 스튜디오 9년 운영',
    image: '/assets/instructor-seoyeon.svg'
  },
  {
    id: 'ins-02',
    name: '문지오',
    specialty: '허브, 식용 식물',
    experience: '팜투테이블 클래스 7년',
    image: '/assets/instructor-jio.svg'
  },
  {
    id: 'ins-03',
    name: '박다은',
    specialty: '꽃식물, 분갈이',
    experience: '플로럴 가드닝 강의 11년',
    image: '/assets/instructor-daeun.svg'
  },
  {
    id: 'ins-04',
    name: '이로한',
    specialty: '베란다 텃밭, 도시 농업',
    experience: '도시농부 워크숍 8년',
    image: '/assets/instructor-rohan.svg'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    siteId: 'site076',
    service: 'garden-class-booking',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/classes', (req, res) => {
  res.json({ classes });
});

app.get('/api/instructors', (req, res) => {
  res.json({ instructors });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`site076 gardening class booking server running at http://localhost:${PORT}`);
});
