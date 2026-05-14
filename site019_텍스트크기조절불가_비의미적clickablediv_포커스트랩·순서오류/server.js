const express = require('express');
const path = require('path');
const app = express();
const PORT = 9238;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let courses = [
  { id: 'c1', title: 'React 완벽 마스터 - 기초부터 실전까지', instructor: '김데브', category: '개발', price: 89000, thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop', rating: 4.8, level: '초급', students: 1240, wisher: false },
  { id: 'c2', title: '실전! UI/UX 디자인 에센셜', instructor: '이디자인', category: '디자인', price: 65000, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop', rating: 4.9, level: '중급', students: 890, wisher: true },
  { id: 'c3', title: '마케팅 퍼널 최적화 전략', instructor: '박마켓', category: '마케팅', price: 55000, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop', rating: 4.6, level: '고급', students: 450, wisher: false },
  { id: 'c4', title: '데이터 분석 입문 - 파이썬 활용', instructor: '최데이터', category: '데이터', price: 77000, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop', rating: 4.7, level: '초급', students: 2100, wisher: false },
  { id: 'c5', title: '나만의 사이드 프로젝트 완성하기 (Next.js)', instructor: '김사이드', category: '개발', price: 99000, thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop', rating: 4.9, level: '중급', students: 1100, wisher: false }
];

let progress = [
  { id: 'p1', courseTitle: '초급자를 위한 타입스크립트 가이드', percentage: 75, lastStudied: '2시간 전' },
  { id: 'p2', courseTitle: '서비스 기획 실무 A to Z', percentage: 30, lastStudied: '어제' }
];

app.get('/api/courses', (req, res) => {
  const category = req.query.category || '전체';
  const search = (req.query.search || '').toLowerCase();
  
  let result = courses;
  if (category !== '전체') {
    result = result.filter(c => c.category === category);
  }
  if (search) {
    result = result.filter(c => c.title.toLowerCase().includes(search) || c.instructor.toLowerCase().includes(search));
  }
  res.json({ data: result });
});

app.get('/api/progress', (req, res) => {
  res.json({ data: progress });
});

app.post('/api/courses/:id/wishlist', (req, res) => {
  const { id } = req.params;
  const course = courses.find(c => c.id === id);
  if (course) {
    course.wisher = !course.wisher;
    res.json({ success: true, wisher: course.wisher });
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

app.post('/api/courses/:id/enroll', (req, res) => {
  const { id } = req.params;
  const course = courses.find(c => c.id === id);
  if (course) {
    // Add to progress array to simulate successful enrollment
    if (!progress.find(p => p.courseTitle === course.title)) {
      progress.unshift({
        id: `p${Date.now()}`,
        courseTitle: course.title,
        percentage: 0,
        lastStudied: '방금 전'
      });
    }
    res.json({ success: true, message: '수강 신청이 완료되었습니다.' });
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
