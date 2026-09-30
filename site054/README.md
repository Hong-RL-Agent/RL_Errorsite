# BookNest

온라인 도서관 및 전자책 대여 플랫폼

## Tech Stack

- Frontend: React 18, Vite, Vanilla CSS
- Backend: Express (Node.js)
- State & Data: In-Memory Mock Database (50+ Books, 15+ Loans, 30+ Reviews, 10+ Wishlists)

## Run

```bash
cd site054
npm install
npm start
```

## URL

- Main Web Portal: http://localhost:9953
- Health Check: http://localhost:9953/api/health

## Key Features

1. **도서관 종합 자료실 (`/books`)**: 소설, 경제/경영, IT, 인문, 과학 등 10대 카테고리 도서 검색 및 필터링
2. **도서 상세 정보 & 서평 (`/books/:id`)**: 도서 스펙, 목차, 별점 리뷰 작성 및 열람
3. **내 대여 서재 (`/loans`)**: 실시간 대여 현황, 반납 예정일 확인, 대여 기간 연장 및 도서 반납
4. **웹 전자책 뷰어 (`/reader/:id`)**: 페이지 넘김, 목차 바로가기, 전면 리더기
5. **찜한 도서 (`/wishlist`)**: 관심 도서 저장 및 대여 가능 여부 확인
6. **내 서재 프로필 (`/profile`)**: 대여 통계, 읽은 도서 목록 및 회원 등급 관리
