# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site001`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 및 정적 라우팅
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 준비 (products, reviews)
- [x] `/api/products` 및 필터링/정렬 기능 구현
- [x] `/api/products/:id` 단일 조회 구현
- [x] `/api/favorites` 찜하기 구현
- [x] `/api/login` 구현
- [x] `/api/mypage` 구현
- [x] **[BUG]** `site001-bug01` DB 쿼리 오류 적용 (category 대신 title 필터링)
- [x] **[BUG]** `site001-bug02` 네트워크 타임아웃 오류 적용 (p3 아이디 지연)
- [x] **[BUG]** `site001-bug03` 인증 우회 오류 적용 (x-user-id 헤더만 확인)

## Frontend (public/)
- [x] `index.html` 주요 섹션 6개 레이아웃 구성
- [x] `css/style.css` 디자인 적용 (밝은 색상, 트렌디한 디자인)
- [x] `js/app.js` 초기화 로직 작성
- [x] 10개 이상의 정상 작동 인터랙션 구현 (검색, 정렬, 모달, 새로고침 등)
- [x] 프론트엔드 오류 유발 없이 백엔드 의도된 오류 3가지만 경험되도록 로직 연동
- [x] HTML 요소에 `data-bug-id` 추가 완료

## Testing & Verification
- [ ] `npm install` 로 의존성 설치
- [ ] `npm start` 로 서버 구동 확인
- [ ] 포트 9330 접속 및 정상 구동 확인
- [ ] 10개 인터랙션 수동 테스트
- [ ] 3개 의도된 버그 재현 및 확인
