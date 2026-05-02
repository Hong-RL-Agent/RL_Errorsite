const express = require('express');
const path = require('path');
const app = express();
const PORT = 9394;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data
let walks = [
  { id: 'w1', title: '한강공원 주말 산책', location: '서울', time: '2024-05-04 10:00', maxDogs: 3, currentDogs: 3, organizerName: '김민준' },
  { id: 'w2', title: '남산 숲길 아침 산책', location: '서울', time: '2024-05-05 08:00', maxDogs: 5, currentDogs: 2, organizerName: '이서윤' },
  { id: 'w3', title: '동네 공원 벙개', location: '경기', time: '2024-05-04 19:00', maxDogs: 4, currentDogs: 1, organizerName: '박지훈' }
];

let dogs = [
  { id: 'dog-1', userId: 'user_A', name: '초코', breed: '푸들', age: 3, notes: '사람을 아주 좋아해요' },
  { id: 'dog-99', userId: 'user_B', name: '맥스', breed: '리트리버', age: 5, notes: '겁이 많으니 천천히 다가와주세요' } // 타인의 강아지
];

let participants = [
  { walkId: 'w1', dogId: 'dog-1' }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DogWalk API is running' });
});

// API: Get Walks (with missing field bug)
app.get('/api/walks', (req, res) => {
  const { location } = req.query;
  let filtered = [...walks];

  if (location && location !== 'All') {
    filtered = filtered.filter(w => w.location === location);
  }

  const result = filtered.map((w, index) => {
    // INTENTIONAL BUG: site065-bug02
    // CSV Error: 네트워크 부분 응답 누락
    // Type: network-missing-field
    // 버그: 특정 모임(id: w2)의 경우 organizerName 필드를 누락시키고 반환함
    if (w.id === 'w2') {
      const { organizerName, ...rest } = w;
      return rest;
    }
    return w;
  });

  res.json(result);
});

// API: Get Dog Profile (with IDOR bug)
app.get('/api/dogs/:id', (req, res) => {
  const dog = dogs.find(d => d.id === req.params.id);
  if (dog) {
    // INTENTIONAL BUG: site065-bug03
    // CSV Error: 반려견 소유자 검증 누락
    // Type: security-idor
    // 보안 취약점: 요청자가 해당 강아지의 소유자인지 확인하지 않고 무조건 상세 정보를 반환함
    res.json(dog);
  } else {
    res.status(404).json({ error: 'Dog not found' });
  }
});

// API: Join Walk (with validation bug)
app.post('/api/participants', (req, res) => {
  const { walkId, dogId } = req.body;
  const walk = walks.find(w => w.id === walkId);

  if (!walk) return res.status(404).json({ error: 'Walk not found' });

  // INTENTIONAL BUG: site065-bug01
  // CSV Error: DB 참가 제한 오류
  // Type: database-validation
  // 버그: maxDogs를 초과했는지 체크하지 않고 무조건 참가를 허용함
  // 원래 로직: if (walk.currentDogs >= walk.maxDogs) return res.status(400).json({ error: '모임 정원이 찼습니다.' });

  walk.currentDogs += 1;
  participants.push({ walkId, dogId });

  res.status(201).json({ success: true, message: '참가 신청이 완료되었습니다.', currentDogs: walk.currentDogs });
});

app.get('/api/my-dogs/:userId', (req, res) => {
  res.json(dogs.filter(d => d.userId === req.params.userId));
});

app.get('/api/reviews', (req, res) => {
  res.json([
    { id: 'r1', walkId: 'w1', user: '유진', text: '강아지들이 너무 즐거워했어요!', rating: 5 },
    { id: 'r2', walkId: 'w2', user: '현우', text: '장소가 아주 쾌적하네요.', rating: 4 }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
