# CulturePick

공연·전시·문화생활 티켓 및 정보 플랫폼

## Tech Stack

- Frontend: React 18, Vite, Vanilla CSS
- Backend: Express (Node.js)
- State & Data: In-Memory Mock Database (40+ Events, 15+ Venues, 50+ Schedules, 40+ Reviews)

## Run

```bash
cd site055
npm install
npm start
```

## URL

- Main Web Portal: http://localhost:9954
- Health Check: http://localhost:9954/api/health

## Key Features

1. **문화생활 종합 탐색 (`/events`)**: 뮤지컬, 연극, 콘서트, 클래식, 전시, 페스티벌 등 9대 장르 공연/전시 검색 및 필터링
2. **공연 상세 정보 & 캐스팅 (`/events/:id`)**: 포스터 갤러리, 캐스트/출연진, 러닝타임, 공연장 주소, 상세 정보 펼쳐보기
3. **일정 및 회차 선택 (`/events/:id/schedule`)**: 날짜별 회차 타임테이블 선택
4. **인터랙티브 좌석 선택 (`/events/:id/seats`)**: 무대(STAGE) 기준 좌석 등급 배치도 및 실시간 좌석 선택
5. **공연장 안내 (`/venues`)**: 서울/수도권 및 전국 주요 15개 전문 공연장 스펙 및 대표 공연 안내
6. **관람 후기 커뮤니티 (`/reviews`)**: 실시간 관람 평점 및 리뷰 등록/열람
7. **마이페이지 (`/mypage`)**: 관심 공연 찜 목록, 예매 및 관람 히스토리 관리
