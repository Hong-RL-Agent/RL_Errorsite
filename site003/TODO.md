# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site003`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9332)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 준비 (workouts, goals)
- [x] `/api/workouts` 다건 조회 (userId 필터 지원)
- [x] `/api/workouts/:id/complete` 완료 처리 구현
- [x] `/api/workouts` 운동 추가 로직 구현
- [x] `/api/stats`, `/api/goals`, `/api/profile` 데이터 제공
- [x] **[BUG]** `site003-bug01` DB 업데이트 오류 (무조건 0번 인덱스 완료 처리)
- [x] **[BUG]** `site003-bug02` 네트워크 오류 (stats 조회 시 50% 확률 503)
- [x] **[BUG]** `site003-bug03` 보안 인가 누락 (파라미터로 타 유저 기록 조회)

## Frontend (public/)
- [x] `index.html` 주요 섹션 6개 레이아웃 구성
- [x] `css/style.css` 디자인 적용 (스포티/네온 컨셉)
- [x] `js/app.js` 클라이언트 통신 및 UI 렌더링 작성
- [x] 10개 이상의 정상 작동 인터랙션 구현 (검색, 필터, 완료, 목표저장, 탭 전환 등)
- [x] 타 유저 ID 조회, 503 에러 모의 등을 위한 취약점 테스트 UI 마련
- [x] 오류가 발생하는 HTML 요소에 `data-bug-id` 추가 완료

## Testing & Verification
- [ ] `npm install` 로 의존성 설치
- [ ] `npm start` 로 서버 구동 확인
- [ ] 브라우저에서 포트 9332 접속 및 정상 구동 확인
- [ ] 10개 인터랙션 수동 테스트
- [ ] 3개 의도된 버그 재현 및 디버깅 확인
