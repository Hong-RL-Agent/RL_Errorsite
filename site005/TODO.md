# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site005`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9334)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 준비 (destinations, itineraries, budgets)
- [x] `/api/destinations` 여행지 조회 로직
- [x] `/api/itinerary` 다건 조회 및 등록 로직
- [x] `/api/budget` 예산 조회 및 저장 로직
- [x] **[BUG]** `site005-bug01` DB 중복 저장 검증 누락 (일정 추가 시)
- [x] **[BUG]** `site005-bug02` 네트워크 응답 지연 (100만원 이상 예산 시 15초 지연)
- [x] **[BUG]** `site005-bug03` 보안 IDOR 취약점 (타 유저 일정 조회 인가 우회)

## Frontend (public/)
- [x] `index.html` 주요 6개 섹션 레이아웃
- [x] `css/style.css` 맑은 스카이 블루/코랄 핑크 여행 테마 디자인
- [x] `js/app.js` 클라이언트 로직 및 UI 연동 작성
- [x] 10개 정상 작동 인터랙션 구현 (검색/필터, 탭 전환, 일정 렌더링 등)
- [x] 테스트를 위한 IDOR 조작 폼, 로딩 인디케이터 구현
- [x] 오류 요소에 `data-bug-id` 부여 완료

## Testing & Verification
- [ ] `npm install` 패키지 설치
- [ ] `npm start` 포트 9334 서버 구동 확인
- [ ] 10개 정상 인터랙션 브라우저 테스트
- [ ] 3개 버그(일정 중복 생성, 응답 시간 지연, 남의 일정 보기) 수동 재현 확인
