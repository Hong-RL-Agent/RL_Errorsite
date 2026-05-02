# TODO

## Project Setup
- [x] 프로젝트 폴더 생성 (`site004`)
- [x] `package.json` 생성 및 Express 의존성 추가
- [x] `README.md` 작성
- [x] `BUGS.md` 작성

## Backend (server.js)
- [x] Express 서버 기본 설정 (포트 9333)
- [x] `/api/health` 엔드포인트 구현
- [x] 목업 데이터 준비 (pets, vaccines, appointments, records)
- [x] `/api/pets` 조회 로직
- [x] `/api/vaccines` 필터 로직
- [x] `/api/appointments` 예약 조회/생성 로직
- [x] `/api/records` 건강기록 로직
- [x] **[BUG]** `site004-bug01` DB 쿼리 오류 (미래 일정 대신 과거 일정 반환)
- [x] **[BUG]** `site004-bug02` 네트워크 요청 검증 누락 (빈 필드에도 201 응답)
- [x] **[BUG]** `site004-bug03` 보안 세션 검증 누락 (만료된 토큰 통과)

## Frontend (public/)
- [x] `index.html` 주요 6개 섹션 레이아웃
- [x] `css/style.css` 펫케어 테마(파스텔톤) 디자인
- [x] `js/app.js` 클라이언트 로직 및 UI 연동 작성
- [x] 10개 정상 작동 인터랙션 구현 (펫 선택, 네비게이션, 알림 읽음, 폼 제출 등)
- [x] 테스트를 위한 인증 헤더 조작 UI 및 빈 폼 제출 버튼 구현
- [x] 오류 요소에 `data-bug-id` 부여 완료

## Testing & Verification
- [ ] `npm install` 패키지 설치
- [ ] `npm start` 포트 9333 서버 구동 확인
- [ ] 10개 정상 인터랙션 브라우저 테스트
- [ ] 3개 버그(다가오는 일정 오류, 빈 폼 전송, 토큰 조작) 수동 재현 확인
