const express = require('express');
const path = require('path');
const app = express();
const PORT = 9236;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock Data: Doctors
const doctors = [
  { id: 1, name: "김현우", specialty: "심장내과", clinic: "서울중앙병원", rating: 4.9, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" },
  { id: 2, name: "이서연", specialty: "피부과", clinic: "강남맑은피부", rating: 4.8, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop" },
  { id: 3, name: "박준영", specialty: "정형외과", clinic: "바른본정형외과", rating: 4.7, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop" },
  { id: 4, name: "최미나", specialty: "소아과", clinic: "아이사랑의원", rating: 4.9, image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?w=100&h=100&fit=crop" },
  { id: 5, name: "정태양", specialty: "안과", clinic: "밝은세상안과", rating: 4.6, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop" },
  { id: 6, name: "조은지", specialty: "치과", clinic: "화이트플란트", rating: 4.8, image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=100&h=100&fit=crop" },
  { id: 7, name: "한지민", specialty: "내과", clinic: "한내과의원", rating: 4.5, image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&h=100&fit=crop" },
  { id: 8, name: "오승호", specialty: "이비인후과", clinic: "참좋은이비인후과", rating: 4.7, image: "https://images.unsplash.com/photo-1622902046580-2b47f47f0871?w=100&h=100&fit=crop" },
  { id: 9, name: "윤하늘", specialty: "가정의학과", clinic: "우리동네의원", rating: 4.9, image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" },
];

let appointments = [
  { id: 'app-001', doctor: "김현우", date: "2026-05-10", time: "10:30", status: "확정", note: "" },
  { id: 'app-002', doctor: "이서연", date: "2026-05-15", time: "14:00", status: "대기", note: "" }
];

app.get('/api/doctors', (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 4;
  const search = req.query.search || '';
  
  let filteredDoctors = doctors;
  if (search) {
    const s = search.toLowerCase();
    filteredDoctors = doctors.filter(doc => 
      doc.name.toLowerCase().includes(s) || 
      doc.specialty.toLowerCase().includes(s) || 
      doc.clinic.toLowerCase().includes(s)
    );
  }

  const start = page * limit;
  const end = start + limit;
  
  res.json({
    data: filteredDoctors.slice(0, end),
    total: filteredDoctors.length,
    hasMore: end < filteredDoctors.length
  });
});

app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

app.post('/api/appointments', (req, res) => {
  const { doctorId, doctorName, date, time, note } = req.body;
  const newAppt = {
    id: 'app-' + Date.now(),
    doctor: doctorName,
    date: date || new Date().toISOString().split('T')[0],
    time: time || '10:00',
    status: '대기',
    note: note || ''
  };
  // 새로 생성된 예약을 맨 앞에 추가
  appointments = [newAppt, ...appointments];
  res.status(201).json({ success: true, appointment: newAppt });
});

// For React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
