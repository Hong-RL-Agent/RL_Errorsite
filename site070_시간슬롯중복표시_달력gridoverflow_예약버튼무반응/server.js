const express = require('express');
const path = require('path');

const app = express();
const PORT = 9289;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'site070-meeting-room-booking',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// GET /api/rooms
app.get('/api/rooms', (req, res) => {
  const rooms = [
    {
      id: 'room-01',
      name: '이노베이션 룸',
      location: 'A동 3층',
      capacity: 12,
      equipment: ['프로젝터', '화이트보드', '화상회의', 'HDMI'],
      pricePerHour: 15000,
      description: '창의적인 아이디어 발굴과 협업에 최적화된 공간입니다.',
      available: true
    },
    {
      id: 'room-02',
      name: '크리에이티브 스튜디오',
      location: 'B동 2층',
      capacity: 6,
      equipment: ['TV 모니터', '화이트보드', 'HDMI'],
      pricePerHour: 10000,
      description: '소규모 팀 미팅과 브레인스토밍에 최적화된 아늑한 공간.',
      available: true
    },
    {
      id: 'room-03',
      name: '넥스트 라운지',
      location: 'C동 1층',
      capacity: 20,
      equipment: ['프로젝터', '화상회의', '사운드시스템', 'HDMI', '화이트보드'],
      pricePerHour: 25000,
      description: '대형 프레젠테이션과 팀 행사를 위한 넓고 현대적인 공간.',
      available: true
    },
    {
      id: 'room-04',
      name: '포커스 룸',
      location: 'A동 5층',
      capacity: 4,
      equipment: ['TV 모니터', 'HDMI'],
      pricePerHour: 7000,
      description: '집중적인 소규모 회의를 위한 조용하고 아늑한 공간.',
      available: true
    },
    {
      id: 'room-05',
      name: '글로벌 컨퍼런스',
      location: 'B동 10층',
      capacity: 50,
      equipment: ['프로젝터', '화상회의', '사운드시스템', 'HDMI', '마이크'],
      pricePerHour: 50000,
      description: '대규모 컨퍼런스와 세미나를 위한 프리미엄 공간.',
      available: false
    },
    {
      id: 'room-06',
      name: '스카이 미팅룸',
      location: 'D동 15층',
      capacity: 8,
      equipment: ['화상회의', 'TV 모니터', 'HDMI'],
      pricePerHour: 20000,
      description: '도시 전망을 바라보며 진행하는 특별한 회의 공간.',
      available: true
    }
  ];
  res.json({ success: true, count: rooms.length, data: rooms });
});

// GET /api/time-slots
// API는 정상적으로 중복 없는 슬롯을 반환함 (Bug01은 프론트엔드 렌더링 오류)
app.get('/api/time-slots', (req, res) => {
  const { roomId = 'room-01', date = new Date().toISOString().split('T')[0] } = req.query;

  const slots = [
    { id: 'slot-09', time: '09:00', endTime: '10:00', available: true },
    { id: 'slot-10', time: '10:00', endTime: '11:00', available: false },
    { id: 'slot-11', time: '11:00', endTime: '12:00', available: true },
    { id: 'slot-12', time: '12:00', endTime: '13:00', available: false },
    { id: 'slot-13', time: '13:00', endTime: '14:00', available: true },
    { id: 'slot-14', time: '14:00', endTime: '15:00', available: true },
    { id: 'slot-15', time: '15:00', endTime: '16:00', available: false },
    { id: 'slot-16', time: '16:00', endTime: '17:00', available: true },
    { id: 'slot-17', time: '17:00', endTime: '18:00', available: true },
    { id: 'slot-18', time: '18:00', endTime: '19:00', available: true }
  ];

  res.json({ success: true, roomId, date, count: slots.length, data: slots });
});

app.listen(PORT, () => {
  console.log('\n  RoomBook Pro — site070');
  console.log(`  Server: http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health`);
  console.log(`  Rooms:  http://localhost:${PORT}/api/rooms`);
  console.log(`  Slots:  http://localhost:${PORT}/api/time-slots\n`);
});
