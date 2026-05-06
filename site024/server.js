const express = require('express');
const path = require('path');
const app = express();
const PORT = 9243;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const trackingData = {
  "1234567890": {
    invoice: "1234567890",
    status: "배송 중",
    step: 2,
    courier: {
      name: "김택배",
      phone: "010-1234-5678",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
    },
    deliveryAddress: "서울특별시 강남구 테헤란로 123",
    timeline: [
      { step: "접수", time: "2026-05-01 09:00", location: "서울 허브", description: "물품이 접수되었습니다." },
      { step: "이동 중", time: "2026-05-01 13:00", location: "인천 터미널", description: "간선 하차 처리되었습니다." },
      { step: "배송지 도착", time: "2026-05-01 15:30", location: "강남 지점", description: "배송 지점에 물품이 도착했습니다." }
    ]
  }
};

const recentTrackings = [
  { invoice: "1234567890", status: "배송 중", time: "10분 전" },
  { invoice: "9876543210", status: "배송 완료", time: "1일 전" }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tracking', (req, res) => {
  const { invoice } = req.query;
  const data = trackingData[invoice];
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: "송장번호를 찾을 수 없습니다." });
  }
});

app.get('/api/recent-trackings', (req, res) => {
  res.json(recentTrackings);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
