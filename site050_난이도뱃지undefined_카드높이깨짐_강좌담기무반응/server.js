const express = require('express');
const path = require('path');
const app = express();
const PORT = 9269;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Data
const courses = [
    {
        id: 1,
        title: '실전! 바닐라 자바스크립트로 시작하는 프론트엔드 개발',
        field: 'Programming',
        difficulty: 'Beginner',
        difficultyLabel: '입문',
        instructor: '김코드',
        time: '15시간',
        price: 88000,
        rating: 4.8,
        thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=800'
    },
    {
        id: 2,
        title: '현대적인 UI 디자인: 피그마에서 리액트까지 마스터하기',
        field: 'Design',
        difficulty: 'Intermediate',
        difficultyLabel: '중급',
        instructor: '이디자인',
        time: '20시간',
        price: 120000,
        rating: 4.9,
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800'
    },
    {
        id: 3,
        // site050-bug02: Long title to trigger layout break
        title: '데이터 사이언스 입문을 위한 파이썬 통계 분석 마스터 클래스: 기초부터 실전 머신러닝 프로젝트까지 단 한 번에 끝내는 올인원 패키지',
        field: 'Programming',
        difficulty: 'Advanced',
        difficultyLabel: '고급',
        instructor: '박데이터',
        time: '30시간',
        price: 150000,
        rating: 4.7,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800'
    },
    {
        id: 4,
        title: '성공하는 창업을 위한 비즈니스 모델링과 IR 피칭 전략',
        field: 'Business',
        difficulty: 'Beginner',
        // site050-bug01: Missing difficultyLabel
        instructor: '최대표',
        time: '12시간',
        price: 95000,
        rating: 4.5,
        thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800'
    },
    {
        id: 5,
        title: 'Node.js 백엔드 개발자 로드맵: Express부터 MSA까지',
        field: 'Programming',
        difficulty: 'Intermediate',
        difficultyLabel: '중급',
        instructor: '김코드',
        time: '25시간',
        price: 110000,
        rating: 4.9,
        thumbnail: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?q=80&w=800'
    },
    {
        id: 6,
        title: '브랜딩의 기초: 소비자 심리를 꿰뚫는 마케팅의 힘',
        field: 'Business',
        difficulty: 'Beginner',
        difficultyLabel: '입문',
        instructor: '정마케팅',
        time: '10시간',
        price: 77000,
        rating: 4.6,
        thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=800'
    }
];

const instructors = [
    {
        name: '김코드',
        specialty: '프론트엔드/백엔드 개발',
        bio: '10년차 풀스택 개발자로, 복잡한 개념을 쉽게 설명하는 것을 좋아합니다.',
        mainCourse: '바닐라 JS 마스터 클래스'
    },
    {
        name: '이디자인',
        specialty: 'UI/UX 디자인',
        bio: '글로벌 테크 기업 출신 디자이너가 알려주는 실무 디자인 스킬.',
        mainCourse: '피그마 마스터'
    }
];

// API: Courses
app.get('/api/courses', (req, res) => {
    res.json(courses);
});

// API: Instructors
app.get('/api/instructors', (req, res) => {
    res.json(instructors);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
