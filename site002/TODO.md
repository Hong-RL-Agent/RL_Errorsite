# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site002`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9331)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 준비 (books)
- [x] `/api/books` 및 장르 필터링 구현
- [x] `/api/books/:id` 단일 조회 구현
- [x] `/api/rentals` 대여 로직 구현
- [x] `/api/user` 사용자 대시보드 데이터 구현
- [x] **[BUG]** `site002-bug01` DB 정렬 기준 오류 적용 (rating -> createdAt)
- [x] **[BUG]** `site002-bug02` 잘못된 HTTP 상태 코드 적용 (대여 실패 200 반환)
- [x] **[BUG]** `site002-bug03` 민감정보 응답 노출 적용 (passwordHash, internalToken)

## Frontend (public/)
- [x] `index.html` 주요 섹션 6개 레이아웃 구성
- [x] `css/style.css` 디자인 적용 (차분한 도서관 컨셉)
- [x] `js/app.js` 초기화 로직 작성
- [x] 10개 이상의 정상 작동 인터랙션 구현 (검색, 장르 필터, 정렬, 모달, 대여 폼, 토스트 알림 등)
- [x] 백엔드의 의도된 오류 3가지만 발현되도록 프론트엔드 통신 로직 연동
- [x] 오류가 발생하는 HTML 요소에 `data-bug-id` 추가 완료

## Testing & Verification
- [ ] `npm install` 로 의존성 설치
- [ ] `npm start` 로 서버 구동 확인
- [ ] 브라우저에서 포트 9331 접속 및 정상 구동 확인
- [ ] 10개 인터랙션 수동 테스트
- [ ] 3개 의도된 버그 재현 (브라우저 동작 및 개발자 도구 네트워크 탭) 확인
