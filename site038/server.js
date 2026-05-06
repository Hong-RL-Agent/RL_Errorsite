const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 9257;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Classes
app.get('/api/classes', (req, res) => {
  const classes = [
    { id: 1, name: '수학 심화 1반', subject: 'Math', day: '월요일', time: '14:00 - 15:30', teacher: '김철수', limit: 20, enrolled: 15, fee: 350000 },
    { id: 2, name: '영어 회화 기초', subject: 'English', day: '화요일', time: '16:00 - 17:30', teacher: '이지혜', limit: 15, enrolled: 8, fee: 280000 },
    { id: 3, name: '물리 기출 분석', subject: 'Science', day: '수요일', time: '18:00 - 19:30', teacher: '박성진', limit: 25, enrolled: 22, fee: 320000 },
    { id: 4, name: '국어 문학 특강', subject: 'Korean', day: '목요일', time: '15:00 - 16:30', teacher: '최유리', limit: 30, enrolled: 10, fee: 250000 },
    { id: 5, name: '화학 실험 교실', subject: 'Science', day: '금요일', time: '17:00 - 18:30', teacher: '정훈', limit: 12, enrolled: 12, fee: 400000 },
    { id: 6, name: '수학 개념 2반', subject: 'Math', day: '월요일', time: '16:00 - 17:30', teacher: '김철수', limit: 20, enrolled: 18, fee: 330000 },
    { id: 7, name: '영어 문법 마스터', subject: 'English', day: '수요일', time: '14:00 - 15:30', teacher: '이지혜', limit: 20, enrolled: 5, fee: 300000 },
    { id: 8, name: '코딩 입문 (Python)', subject: 'Coding', day: '토요일', time: '10:00 - 12:00', teacher: '서민우', limit: 10, enrolled: 9, fee: 450000 },
  ];
  res.json(classes);
});

// API: Teachers
app.get('/api/teachers', (req, res) => {
  const teachers = [
    { 
      id: 1, 
      name: '김철수', 
      subject: 'Math', 
      experience: '15년', 
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150',
      description: '수학의 정석을 깨우치는 최고의 강의. 개념부터 심화까지 책임집니다.'
    },
    { 
      id: 2, 
      name: '이지혜', 
      subject: 'English', 
      experience: '10년', 
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
      description: '즐겁게 배우는 영어. 원어민 수준의 회화와 문법을 동시에 마스터하세요.'
    },
    { 
      id: 3, 
      name: '박성진', 
      subject: 'Science', 
      experience: '12년', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150',
      description: '어려운 과학 현상을 쉽고 재미있게 설명해드립니다.'
    }
  ];
  res.json(teachers);
});

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
